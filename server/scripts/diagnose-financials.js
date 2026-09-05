/**
 * diagnose-financials.js — read-only snapshot of the money data in PostgreSQL.
 * Shows exactly where revenue/expenses come from and what is missing.
 *
 * Usage (inside server/ or the app container):
 *   node scripts/diagnose-financials.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.production'), override: false });
const { Pool } = require('pg');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL || !DB_URL.startsWith('postgres')) {
  console.error('ERROR: DATABASE_URL not set. Run inside the container: docker exec -it darin-app node server/scripts/diagnose-financials.js');
  process.exit(1);
}
console.log(`Target DB: ${DB_URL.replace(/:\/\/([^:]+):[^@]+@/, '://$1:****@')}\n`);

const pool = new Pool({ connectionString: DB_URL });
const q = (sql) => pool.query(sql);

async function main() {
  /* 1. Students pricing — students columns are snake_case (@map) */
  const students = await q(`
    SELECT COUNT(*)::int                          AS total,
           COUNT(*) FILTER (WHERE session_price > 0)::int AS with_price,
           COALESCE(AVG(NULLIF(session_price, 0)), 0)::float AS avg_price
      FROM students WHERE deleted_at IS NULL
  `);
  const s = students.rows[0];
  console.log('── الطلاب ──');
  console.log(`  إجمالي: ${s.total} | بسعر حصة: ${s.with_price} | بدون سعر: ${s.total - s.with_price} | متوسط السعر: ${Number(s.avg_price).toFixed(0)}`);

  const zeroStudents = await q(`
    SELECT id, name, session_price, created_at
      FROM students WHERE deleted_at IS NULL AND session_price = 0
     ORDER BY created_at DESC LIMIT 8
  `);
  if (zeroStudents.rows.length) {
    console.log('  أمثلة طلاب بدون سعر:');
    zeroStudents.rows.forEach((r) => console.log(`    ${r.id}  ${r.name}  (أُنشئ ${new Date(r.created_at).toISOString().slice(0, 10)})`));
  }

  /* 2. Sessions pricing */
  const sessions = await q(`
    SELECT status,
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE price > 0)::int AS with_price,
           COALESCE(SUM(price), 0)::int AS revenue,
           COALESCE(SUM("teacherPrice"), 0)::int AS teacher_cost
      FROM sessions
     GROUP BY status ORDER BY status
  `);
  console.log('\n── الحصص ──');
  console.log('  الحالة        العدد  بسعر  إيراد  تكلفة_معلمة');
  sessions.rows.forEach((r) =>
    console.log(`  ${String(r.status).padEnd(12)} ${String(r.total).padStart(5)} ${String(r.with_price).padStart(6)} ${String(r.revenue).padStart(6)} ${String(r.teacher_cost).padStart(8)}`),
  );

  /* 3. Invoices */
  const inv = await q(`
    SELECT 'student' AS kind, status, COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS total FROM "student_invoices" GROUP BY status
    UNION ALL
    SELECT 'teacher' AS kind, status, COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS total FROM "teacher_invoices" GROUP BY status
    ORDER BY kind, status
  `);
  console.log('\n── الفواتير ──');
  inv.rows.forEach((r) => console.log(`  ${r.kind.padEnd(8)} ${String(r.status).padEnd(12)} ${String(r.n).padStart(4)} فاتورة  مجموع ${r.total}`));

  /* 4. Manual transactions + fixed expenses */
  const tx = await q(`
    SELECT type, status, COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS total
      FROM "manual_transactions" GROUP BY type, status ORDER BY type, status
  `);
  console.log('\n── المعاملات اليدوية ──');
  tx.rows.forEach((r) => console.log(`  ${r.type.padEnd(8)} ${String(r.status).padEnd(10)} ${String(r.n).padStart(4)}  مجموع ${r.total}`));

  const fixed = await q(`SELECT COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS total FROM "fixed_expenses" WHERE is_active = 1`);
  console.log(`\n── المصاريف الثابتة ──\n  ${fixed.rows[0].n} بند  مجموع ${fixed.rows[0].total}`);

  /* 5. Currencies actually in use */
  const cur = await q(`
    SELECT COALESCE("studentCurrency",'(null)') AS cur, COUNT(*)::int AS n, COALESCE(SUM(price),0)::int AS rev
      FROM sessions WHERE status = 'completed' GROUP BY 1 ORDER BY n DESC
  `);
  console.log('\n── عملات الحصص المكتملة ──');
  cur.rows.forEach((r) => console.log(`  ${r.cur.padEnd(10)} ${String(r.n).padStart(5)} حصة  إيراد ${r.rev}`));

  /* 6. Unpriced sessions — why they still rent 0 revenue */
  const unpriced = await q(`
    SELECT s.id, s.date, s.subject, s.status,
           s."studentId" AS student_id,
           COALESCE(st.name, '(طالب محذوف/غير موجود)') AS student_name,
           COALESCE(st.session_price, 0) AS student_price,
           s.price AS session_price,
           s."teacherPrice" AS teacher_price
      FROM sessions s
      LEFT JOIN students st ON st.id = s."studentId"
     WHERE s.status = 'completed' AND (s.price IS NULL OR s.price <= 0)
     ORDER BY s.date, s.id
  `);
  if (unpriced.rows.length) {
    console.log('\n── الحصص المكتملة بلا سعر (لا تدخل الإيراد) ──');
    unpriced.rows.forEach((r) =>
      console.log(`  ${r.id}  ${r.date}  ${String(r.subject || '—').slice(0, 20)}  الطالب: ${String(r.student_name).slice(0, 24)}  (سعر الطالب: ${r.student_price})  تكلفة المعلمة: ${r.teacher_price ?? 0}`),
    );
    console.log('  => سببها: الطالب بلا سعر حصة (session_price=0) أو محذوف. أدخل السعر ثم أعد backfill،');
    console.log('     أو صححها يدويًا/حذفها إن كانت حصص اختبار.');
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
