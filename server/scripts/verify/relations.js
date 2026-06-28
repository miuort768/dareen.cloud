const RELATIONS = [
    { name: 'Session → Student',   sqlite: 'SELECT COUNT(*) as cnt FROM sessions s LEFT JOIN students st ON s.studentId = st.id WHERE st.id IS NULL',      pg: 'SELECT COUNT(*)::int as cnt FROM sessions s LEFT JOIN students st ON s."studentId" = st.id WHERE st.id IS NULL' },
    { name: 'Session → Teacher',   sqlite: 'SELECT COUNT(*) as cnt FROM sessions s LEFT JOIN teachers t ON s.teacherId = t.id WHERE s.teacherId IS NOT NULL AND t.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM sessions s LEFT JOIN teachers t ON s."teacherId" = t.id WHERE s."teacherId" IS NOT NULL AND t.id IS NULL' },
    { name: 'Enrollment → Student', sqlite: 'SELECT COUNT(*) as cnt FROM enrollments e LEFT JOIN students st ON e.studentId = st.id WHERE st.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM enrollments e LEFT JOIN students st ON e."studentId" = st.id WHERE st.id IS NULL' },
    { name: 'Enrollment → Teacher', sqlite: 'SELECT COUNT(*) as cnt FROM enrollments e LEFT JOIN teachers t ON e.teacherId = t.id WHERE e.teacherId IS NOT NULL AND t.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM enrollments e LEFT JOIN teachers t ON e."teacherId" = t.id WHERE e."teacherId" IS NOT NULL AND t.id IS NULL' },
    { name: 'Student → Parent',    sqlite: 'SELECT COUNT(*) as cnt FROM students s LEFT JOIN parents p ON s.parentId = p.id WHERE s.parentId IS NOT NULL AND p.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM students s LEFT JOIN parents p ON s."parentId" = p.id WHERE s."parentId" IS NOT NULL AND p.id IS NULL' },
    { name: 'Evaluation → Student', sqlite: 'SELECT COUNT(*) as cnt FROM evaluations e LEFT JOIN students st ON e.studentId = st.id WHERE st.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM evaluations e LEFT JOIN students st ON e."studentId" = st.id WHERE st.id IS NULL' },
    { name: 'Evaluation → Teacher', sqlite: 'SELECT COUNT(*) as cnt FROM evaluations e LEFT JOIN teachers t ON e.teacherId = t.id WHERE t.id IS NULL',      pg: 'SELECT COUNT(*)::int as cnt FROM evaluations e LEFT JOIN teachers t ON e."teacherId" = t.id WHERE t.id IS NULL' },
    { name: 'Invoice → Student',   sqlite: 'SELECT COUNT(*) as cnt FROM student_invoices i LEFT JOIN students st ON i.studentId = st.id WHERE st.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM student_invoices i LEFT JOIN students st ON i."studentId" = st.id WHERE st.id IS NULL' },
    { name: 'Invoice → Teacher',   sqlite: 'SELECT COUNT(*) as cnt FROM teacher_invoices i LEFT JOIN teachers t ON i.teacherId = t.id WHERE i.teacherId IS NOT NULL AND t.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM teacher_invoices i LEFT JOIN teachers t ON i."teacherId" = t.id WHERE i."teacherId" IS NOT NULL AND t.id IS NULL' },
    { name: 'Message → Conversation', sqlite: 'SELECT COUNT(*) as cnt FROM messages m LEFT JOIN conversations c ON m.conversationId = c.id WHERE c.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM messages m LEFT JOIN conversations c ON m."conversationId" = c.id WHERE c.id IS NULL' },
    { name: 'Comment → Post',      sqlite: 'SELECT COUNT(*) as cnt FROM forum_comments fc LEFT JOIN forum_posts fp ON fc.postId = fp.id WHERE fp.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM forum_comments fc LEFT JOIN forum_posts fp ON fc."postId" = fp.id WHERE fp.id IS NULL' },
    { name: 'ActiveSession → Student', sqlite: 'SELECT COUNT(*) as cnt FROM active_sessions a_s LEFT JOIN students st ON a_s.studentId = st.id WHERE st.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM active_sessions a_s LEFT JOIN students st ON a_s."studentId" = st.id WHERE st.id IS NULL' },
    { name: 'ActiveSession → Teacher', sqlite: 'SELECT COUNT(*) as cnt FROM active_sessions a_s LEFT JOIN teachers t ON a_s.teacherId = t.id WHERE t.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM active_sessions a_s LEFT JOIN teachers t ON a_s."teacherId" = t.id WHERE t.id IS NULL' },
    { name: 'LiveSession → Teacher', sqlite: 'SELECT COUNT(*) as cnt FROM live_sessions l_s LEFT JOIN teachers t ON l_s.teacherId = t.id WHERE t.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM live_sessions l_s LEFT JOIN teachers t ON l_s."teacherId" = t.id WHERE t.id IS NULL' },
    { name: 'PointsLog → Student',  sqlite: 'SELECT COUNT(*) as cnt FROM points_log pl LEFT JOIN students st ON pl.studentId = st.id WHERE st.id IS NULL',  pg: 'SELECT COUNT(*)::int as cnt FROM points_log pl LEFT JOIN students st ON pl."studentId" = st.id WHERE st.id IS NULL' },
    { name: 'Availability → Teacher', sqlite: 'SELECT COUNT(*) as cnt FROM teacher_availability ta LEFT JOIN teachers t ON ta.teacherId = t.id WHERE t.id IS NULL', pg: 'SELECT COUNT(*)::int as cnt FROM teacher_availability ta LEFT JOIN teachers t ON ta."teacherId" = t.id WHERE t.id IS NULL' },
];

async function check({ pgPrisma, sqliteDb }) {
    const checks = [];
    let errors = 0, warnings = 0;

    for (const rel of RELATIONS) {
        let sqliteOrphans = 0, pgOrphans = 0;

        try {
            const row = await sqliteDb.get(rel.sqlite);
            sqliteOrphans = Number(row?.cnt) || 0;
        } catch (e) {
            checks.push({ name: rel.name, status: 'error', detail: `SQLite error: ${e.message}` });
            errors++;
            continue;
        }

        try {
            const rows = await pgPrisma.$queryRawUnsafe(rel.pg);
            pgOrphans = Number(rows[0]?.cnt) || 0;
        } catch (e) {
            checks.push({ name: rel.name, status: 'error', detail: `PostgreSQL error: ${e.message}` });
            errors++;
            continue;
        }

        const match = sqliteOrphans === pgOrphans;
        const status = match ? (pgOrphans === 0 ? 'pass' : 'warn') : 'fail';
        if (!match) errors++;
        if (pgOrphans > 0) warnings++;

        checks.push({
            name: rel.name,
            status,
            detail: `${sqliteOrphans} orphans (SQLite) / ${pgOrphans} orphans (PG) ${match ? '✅' : '❌'}`
        });
    }

    const passed = checks.filter(c => c.status === 'pass').length;
    const total = checks.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 100;

    return { name: 'Referential Integrity', score, checks, warnings, errors };
}

module.exports = { check };
