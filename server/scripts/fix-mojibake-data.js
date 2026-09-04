/**
 * fix-mojibake-data.js — repairs double-encoded Arabic text stored in PostgreSQL.
 *
 * Cause: data was inserted while the app source contained CP1256/Latin-1 mojibake,
 * so stored strings look like "ط§ظ„ط·ظ„ط§ط¨" (CP1256) or "Ø§Ù„Ø·Ù„Ø§Ø¨" (CP1252).
 * Also common: data migrated from SQLite/PG without UTF-8 client_encoding.
 *
 * What it does:
 *  1. Auto-discovers every text column in every table (information_schema)
 *  2. Backs up candidate rows to ./backups/mojibake-fix-<ts>.jsonl
 *  3. Attempts mojibake decode (CP1256 → CP1252), accepts only clean Arabic results
 *  4. UPDATEs row by primary key
 *
 * Usage (run inside server/):
 *   node scripts/fix-mojibake-data.js            # dry run
 *   node scripts/fix-mojibake-data.js --apply    # write fixes
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/* ── mojibake decode ─────────────────────────────────────────────── */

const cp1256 = new TextDecoder('windows-1256');
const cp1252 = new TextDecoder('windows-1252');

function buildByteMap(decoder) {
  const map = {};
  for (let b = 0x80; b <= 0xff; b++) {
    const ch = decoder.decode(new Uint8Array([b]));
    if (!(ch in map)) map[ch] = b;
  }
  return map;
}
const M1256 = buildByteMap(cp1256);
const M1252 = buildByteMap(cp1252);

function decodeWith(s, byteMap) {
  const bytes = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c < 0x80) {
      bytes.push(c);
      continue;
    }
    const b = byteMap[ch];
    if (b === undefined) return null;
    bytes.push(b);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

const AR = /[\u0600-\u06FF]/g;
const SUSPECT =
  /[\u00A0-\u00FF\u2020\u2021\u2022\u2026\u201A\u201E\u02C6\u2030\u2039\u203A\u02DC\u2122\u0152\u0153]/;
const SUSPECTS = /[\u00A0-\u00FF\u2020\u2021\u2022\u2026\u201A\u201E\u02C6\u2030\u2039\u203A\u02DC\u2122\u0152\u0153]/g;

/** Returns repaired string or null. */
function fixString(s) {
  if (typeof s !== 'string' || s.length === 0 || !SUSPECT.test(s)) return null;
  const suspects = (s.match(SUSPECTS) || []).length;
  const arabic = (s.match(AR) || []).length;
  // CP1256 mojibake renders most chars as Arabic look-alikes; require suspect ratio ≥ 20%
  if (arabic + suspects > 0 && suspects / (arabic + suspects) < 0.2) return null;
  for (const map of [M1256, M1252]) {
    const dec = decodeWith(s, map);
    if (dec === null) continue;
    if (!/[\u0600-\u06FF]/.test(dec)) continue; // must decode to Arabic
    if (SUSPECT.test(dec)) continue; // result must be clean
    return dec;
  }
  return null;
}

/* ── discovery ───────────────────────────────────────────────────── */

async function discover() {
  const { rows } = await pool.query(`
    SELECT c.table_schema, c.table_name, c.column_name, c.data_type,
           a.attname IS NOT NULL AS has_pk,
           (SELECT kcu.column_name
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
               AND tc.table_schema = kcu.table_schema
             WHERE tc.table_name = c.table_name
               AND tc.table_schema = c.table_schema
               AND tc.constraint_type = 'PRIMARY KEY'
             LIMIT 1) AS pk
      FROM information_schema.columns c
      LEFT JOIN pg_attribute a
        ON a.attrelid = (quote_ident(c.table_schema)||'.'||quote_ident(c.table_name))::regclass
       AND a.attname = c.column_name AND a.attnum > 0 AND NOT a.attisdropped
     WHERE c.table_schema = 'public'
       AND c.data_type IN ('text', 'character varying', 'character')
       AND c.table_name NOT IN ('_prisma_migrations')
  `);
  // group by table
  const tables = new Map();
  for (const r of rows) {
    if (!r.pk) continue; // need a pk to update rows safely
    if (!tables.has(r.table_name)) tables.set(r.table_name, { pk: r.pk, columns: [] });
    tables.get(r.table_name).columns.push(r.column_name);
  }
  return [...tables.entries()].map(([table, { pk, columns }]) => ({ table, pk, columns }));
}

async function main() {
  console.log(`Scanning PostgreSQL... ${APPLY ? '(APPLY MODE)' : '(DRY RUN)'}`);
  const tables = await discover();
  console.log(`Text-bearing tables with PK: ${tables.length}`);

  const backupPath = path.join(__dirname, '..', 'backups', `mojibake-${Date.now()}.jsonl`);
  if (APPLY) fs.mkdirSync(path.dirname(backupPath), { recursive: true });

  let totalFields = 0;
  let totalRows = 0;

  for (const { table, pk, columns } of tables) {
    const colList = columns.map((c) => `"${c}"`).join(', ');
    let res;
    try {
      res = await pool.query(`SELECT "${pk}", ${colList} FROM "${table}"`);
    } catch (e) {
      console.warn(`  SKIP ${table}: ${e.message.split('\n')[0]}`);
      continue;
    }

    let fixedRows = 0;
    const samples = [];

    for (const row of res.rows) {
      const updates = {};
      const backupRow = { table, pk: row[pk] };
      let touched = false;

      for (const col of columns) {
        const val = row[col];
        if (typeof val !== 'string') continue;
        const fixed = fixString(val);
        if (fixed !== null) {
          updates[col] = fixed;
          backupRow[col] = val; // original value
          touched = true;
          if (samples.length < 2) {
            samples.push({ col, before: val.slice(0, 50), after: fixed.slice(0, 50) });
          }
        }
      }
      if (!touched) continue;

      fixedRows++;
      totalFields += Object.keys(updates).length;

      if (APPLY) {
        fs.appendFileSync(backupPath, JSON.stringify(backupRow) + '\n');
        const setClause = Object.keys(updates)
          .map((c, i) => `"${c}" = $${i + 2}`)
          .join(', ');
        const params = [row[pk], ...Object.values(updates)];
        try {
          await pool.query(`UPDATE "${table}" SET ${setClause} WHERE "${pk}" = $1`, params);
        } catch (e) {
          console.error(`  FAILED ${table}.${pk}=${row[pk]}: ${e.message.split('\n')[0]}`);
        }
      }
    }

    if (fixedRows > 0) {
      totalRows += fixedRows;
      console.log(`  ${table}: ${fixedRows}/${res.rows.length} rows ${APPLY ? 'fixed' : 'need fixing'}`);
      samples.forEach((s) => console.log(`    [${s.col}] ${s.before} → ${s.after}`));
    }
  }

  console.log('─'.repeat(50));
  console.log(`Total ${APPLY ? 'fixed' : 'to fix'}: ${totalFields} fields in ${totalRows} rows`);
  if (APPLY) console.log('Backup:', backupPath);
  else console.log('DRY RUN — re-run with --apply to write fixes.');

  await pool.end();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
