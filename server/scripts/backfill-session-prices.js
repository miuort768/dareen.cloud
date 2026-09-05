/**
 * backfill-session-prices.js — repairs sessions stored with price = 0.
 *
 * Why: sessions snapshot the student's sessionPrice at creation time. Sessions
 * created before prices were configured stay at 0 forever, so every financial
 * report undercounts revenue (e.g. 5 completed sessions → "1 EGP total").
 *
 * What it does:
 *   1. Finds sessions with price = 0 whose student's CURRENT sessionPrice > 0
 *   2. Backs up affected rows to ./backups/session-price-backfill-<ts>.jsonl
 *   3. Sets session.price = student.sessionPrice
 *
 * Usage (run inside server/):
 *   node scripts/backfill-session-prices.js            # dry run
 *   node scripts/backfill-session-prices.js --apply    # write fixes
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
// Production keeps the PG URL in .env.production — load as fallback (no override)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.production'), override: false });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const DB_URL = process.env.DATABASE_URL;

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
  const { rows } = await pool.query(`
    SELECT s.id, s.date, s.subject, s.student_id,
           s.price        AS session_price,
           st.session_price AS student_price,
           s.status
      FROM sessions s
      JOIN students st ON st.id = s.student_id
     WHERE s.price = 0
       AND st.session_price > 0
     ORDER BY s.date DESC
  `);

  console.log(`Sessions with price=0 fixable from student price: ${rows.length}`);
  rows.slice(0, 20).forEach((r) => {
    console.log(
      `  ${r.id}  ${r.date}  ${r.status}  "${(r.subject || '—').slice(0, 24)}"  0 → ${r.student_price}`,
    );
  });
  if (rows.length > 20) console.log(`  ... and ${rows.length - 20} more`);

  if (rows.length === 0) {
    console.log('Nothing to backfill. Done.');
    await pool.end();
    return;
  }

  if (!APPLY) {
    console.log('DRY RUN — re-run with --apply to write fixes.');
    await pool.end();
    return;
  }

  const backupPath = path.join(__dirname, '..', 'backups', `session-price-backfill-${Date.now()}.jsonl`);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`Backup: ${backupPath}`);

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
