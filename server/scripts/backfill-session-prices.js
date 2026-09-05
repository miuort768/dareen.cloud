/**
 * backfill-session-prices.js — syncs session prices with the student's CURRENT
 * sessionPrice for every session whose stored price differs.
 *
 * Why: sessions snapshot the student's sessionPrice at creation time. Sessions
 * created before prices were configured stay at 0 forever, and sessions created
 * before a price CORRECTION keep the old (wrong) value — so financial reports
 * undercount revenue (e.g. 5 completed sessions → "1 EGP total").
 *
 * What it does:
 *   1. Finds every session whose stored price differs from its student's
 *      current sessionPrice (covers 0 → 160 AND stale 1 → 160)
 *   2. Backs up affected rows to ./backups/session-price-backfill-<ts>.jsonl
 *   3. Sets session.price = student.sessionPrice
 *
 * NOTE: students with sessionPrice = 0 are skipped — enter their price from
 * the Students page first, then re-run.
 *
 * Usage (run inside server/):
 *   node scripts/backfill-session-prices.js            # dry run
 *   node scripts/backfill-session-prices.js --apply    # write fixes
 *
 * Targeted mode — for students whose sessions can't auto-inherit (student
 * removed, or session_price still 0). Sets every session of a student to an
 * explicit price:
 *   node scripts/backfill-session-prices.js --apply --student "سند" --price 160
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
// Production keeps the PG URL in .env.production — load as fallback (no override)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.production'), override: false });
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Pool } = require('pg');

/** Backups dir must be writable inside the container (runs as `node` user).
 *  Tries ./backups first, falls back to the OS temp dir. */
function makeBackupFile(prefix) {
  const candidates = [
    path.join(__dirname, '..', 'backups'),
    path.join(os.tmpdir(), 'darin-backups'),
  ];
  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      return path.join(dir, `${prefix}-${Date.now()}.jsonl`);
    } catch {
      // permission denied — try next candidate
    }
  }
  return null;
}

const APPLY = process.argv.includes('--apply');
const DB_URL = process.env.DATABASE_URL;

const studentArgIdx = process.argv.indexOf('--student');
const priceArgIdx = process.argv.indexOf('--price');
const TARGET_STUDENT = studentArgIdx >= 0 ? process.argv[studentArgIdx + 1] : null;
const TARGET_PRICE = priceArgIdx >= 0 ? Number(process.argv[priceArgIdx + 1]) : NaN;

if (!DB_URL || !DB_URL.startsWith('postgres')) {
  console.error(
    [
      '',
      'ERROR: DATABASE_URL is not set or is not a PostgreSQL URL.',
      '',
      'Options:',
      '  1) Run inside the app container:',
      '       docker exec -it darin-app node server/scripts/backfill-session-prices.js',
      '       docker exec -it darin-app node server/scripts/backfill-session-prices.js --apply',
      '',
      '  2) Or export it first:',
      '       export $(grep -E "^DATABASE_URL=" .env.production | xargs)',
      '       node scripts/backfill-session-prices.js',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

const masked = DB_URL.replace(/:\/\/([^:]+):[^@]+@/, '://$1:****@');
console.log(`Target DB: ${masked}`);
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);

const pool = new Pool({ connectionString: DB_URL });

async function main() {
  // Column names follow the Prisma schema exactly: sessions."studentId" is
  // camelCase (no @map), students."session_price" is snake_case (@map).
  if (TARGET_STUDENT && Number.isInteger(TARGET_PRICE)) {
    const { rows } = await pool.query(`
      SELECT s.id, s.date, s.subject, s.status,
             s."studentId"    AS student_id,
             COALESCE(s."studentName", st.name) AS student_name,
             s.price          AS session_price,
             $1::int          AS new_price
        FROM sessions s
        LEFT JOIN students st ON st.id = s."studentId"
       WHERE LOWER(COALESCE(s."studentName", st.name, '')) = LOWER($2)
       ORDER BY s.date DESC
    `, [TARGET_PRICE, TARGET_STUDENT]);

    console.log(`Targeted mode: "${TARGET_STUDENT}" → price ${TARGET_PRICE}`);
    console.log(`Affected sessions: ${rows.length}`);

    rows.slice(0, 20).forEach((r) => {
      console.log(`  ${r.id}  ${r.date}  ${r.status}  "${(r.subject || '—').slice(0, 20)}"  ${r.session_price ?? 'NULL'} → ${r.new_price}`);
    });
    if (rows.length > 20) console.log(`  ... and ${rows.length - 20} more`);

    if (!APPLY) {
      console.log('DRY RUN — re-run with --apply to write fixes.');
      await pool.end();
      return;
    }

    const backupPath = makeBackupFile('session-price-targeted');
    if (backupPath) {
      fs.writeFileSync(backupPath, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
      console.log(`Backup: ${backupPath}`);
    }

    let updated = 0;
    for (const r of rows) {
      try {
        await pool.query(`UPDATE sessions SET price = $1 WHERE id = $2`, [r.new_price, r.id]);
        updated++;
      } catch (e) {
        console.error(`  FAILED ${r.id}: ${e.message.split('\n')[0]}`);
      }
    }
    console.log(`Updated ${updated}/${rows.length} sessions. Done.`);
    await pool.end();
    return;
  }

  const { rows } = await pool.query(`
    SELECT s.id, s.date, s.subject, s.status,
           s."studentId"    AS student_id,
           st.name          AS student_name,
           s.price          AS session_price,
           st.session_price AS student_price
      FROM sessions s
      JOIN students st ON st.id = s."studentId"
     WHERE (s.price IS NULL OR s.price <> st.session_price)
     ORDER BY st.name, s.date DESC
  `);

  console.log(`Sessions whose price differs from the student's current price: ${rows.length}`);

  if (rows.length === 0) {
    console.log('All session prices are in sync. Done.');
    await pool.end();
    return;
  }

  // Per-student summary
  const byStudent = new Map();
  rows.forEach((r) => {
    const key = r.student_id;
    if (!byStudent.has(key)) byStudent.set(key, { name: r.student_name, price: r.student_price, count: 0 });
    byStudent.get(key).count++;
  });
  console.log('  الطلاب المتأثرون:');
  byStudent.forEach((v, id) =>
    console.log(`    ${id}  ${v.name}  السعر الحالي: ${v.price}  حصص ستُحدَّث: ${v.count}`),
  );

  rows.slice(0, 20).forEach((r) => {
    console.log(`  ${r.id}  ${r.date}  ${r.status}  "${(r.subject || '—').slice(0, 24)}"  ${r.session_price} → ${r.student_price}`);
  });
  if (rows.length > 20) console.log(`  ... and ${rows.length - 20} more`);

  if (!APPLY) {
    console.log('DRY RUN — re-run with --apply to write fixes.');
    await pool.end();
    return;
  }

  const backupPath = makeBackupFile('session-price-backfill');
  if (backupPath) {
    fs.writeFileSync(backupPath, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
    console.log(`Backup: ${backupPath}`);
  } else {
    console.warn('WARNING: could not write backup file — continuing without backup.');
  }

  let updated = 0;
  for (const r of rows) {
    try {
      await pool.query(`UPDATE sessions SET price = $1 WHERE id = $2`, [r.student_price, r.id]);
      updated++;
    } catch (e) {
      console.error(`  FAILED ${r.id}: ${e.message.split('\n')[0]}`);
    }
  }
  console.log(`Updated ${updated}/${rows.length} sessions. Done.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

