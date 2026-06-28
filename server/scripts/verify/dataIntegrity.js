const TABLES = [
    { name: 'users',        idCol: 'id',        sums: [] },
    { name: 'teachers',     idCol: 'id',        sums: ['price', 'points'] },
    { name: 'students',     idCol: 'id',        sums: ['session_price', 'total_points'] },
    { name: 'parents',      idCol: 'id',        sums: [] },
    { name: 'enrollments',  idCol: 'id',        sums: ['sessions_total', 'sessions_used'] },
    { name: 'points_log',   idCol: 'id',        sums: ['amount'] },
    { name: 'sessions',     idCol: 'id',        sums: ['price', 'teacherPrice'] },
    { name: 'student_invoices', idCol: 'id',    sums: ['amount'] },
    { name: 'teacher_invoices', idCol: 'id',    sums: ['amount', 'personalExpenses'] },
    { name: 'manual_transactions', idCol: 'id', sums: ['amount'] },
    { name: 'fixed_expenses', idCol: 'id',      sums: ['amount'] },
    { name: 'messages',     idCol: 'id',        sums: [] },
    { name: 'evaluations',  idCol: 'id',        sums: ['points'] },
    { name: 'notifications', idCol: 'id',       sums: [] },
    { name: 'leads',        idCol: 'id',        sums: [] },
    { name: 'blog_posts',   idCol: 'id',        sums: ['views'] },
    { name: 'audit_logs',   idCol: 'id',        sums: [] },
    { name: 'push_subscriptions', idCol: 'id',  sums: [] },
    { name: 'conversations', idCol: 'id',       sums: [] },
    { name: 'conversation_members', idCol: null, sums: [] },
    { name: 'chat_profiles', idCol: 'id',       sums: [] },
    { name: 'forum_posts',  idCol: 'id',        sums: [] },
    { name: 'forum_comments', idCol: 'id',      sums: [] },
    { name: 'announcements', idCol: 'id',       sums: [] },
    { name: 'system_settings', idCol: 'key',    sums: [] },
    { name: 'tasks',        idCol: 'id',        sums: [] },
    { name: 'trial_sessions', idCol: 'id',      sums: [] },
    { name: 'teacher_availability', idCol: 'id', sums: [] },
    { name: 'whatsapp_templates', idCol: 'id',  sums: [] },
];

async function check({ pgPrisma, sqliteDb }) {
    const checks = [];
    let errors = 0, warnings = 0;

    for (const table of TABLES) {
        const sqliteTable = table.name;
        const pgTable = table.name;

        // SQLite query
        const idCol = table.idCol;
        const sumsCols = table.sums;

        let sqliteRow;
        try {
            const sumExprs = sumsCols.map(c => `COALESCE(SUM("${c}"), 0)`).join(', ');
            const query = idCol
                ? `SELECT COUNT(*) as cnt, MIN("${idCol}") as minId, MAX("${idCol}") as maxId${sumExprs ? ', ' + sumExprs : ''} FROM "${sqliteTable}"`
                : `SELECT COUNT(*) as cnt FROM "${sqliteTable}"`;
            sqliteRow = await sqliteDb.get(query);
        } catch (e) {
            checks.push({ name: table.name, status: 'error', detail: `SQLite error: ${e.message}` });
            errors++;
            continue;
        }

        // PostgreSQL query via Prisma raw
        let pgRow;
        try {
            const sumExprs = sumsCols.map(c => `COALESCE(SUM("${c}"), 0)`).join(', ');
            const query = idCol
                ? `SELECT COUNT(*)::int as cnt, MIN("${idCol}") as "minId", MAX("${idCol}") as "maxId"${sumExprs ? ', ' + sumExprs : ''} FROM "${pgTable}"`
                : `SELECT COUNT(*)::int as cnt FROM "${pgTable}"`;
            const rows = await pgPrisma.$queryRawUnsafe(query);
            pgRow = rows[0];
        } catch (e) {
            checks.push({ name: table.name, status: 'error', detail: `PostgreSQL error: ${e.message}` });
            errors++;
            continue;
        }

        const cntMatch = Number(sqliteRow.cnt) === Number(pgRow.cnt);
        let detail = `SQLite=${sqliteRow.cnt} | PG=${pgRow.cnt}`;

        if (idCol) {
            const minMatch = String(sqliteRow.minId) === String(pgRow.minId);
            const maxMatch = String(sqliteRow.maxId) === String(pgRow.maxId);
            detail += ` | MIN: ${minMatch ? '✅' : '❌'} MAX: ${maxMatch ? '✅' : '❌'}`;

            for (const col of sumsCols) {
                const sVal = Number(sqliteRow[col]) || 0;
                const pVal = Number(pgRow[col]) || 0;
                const diff = Math.abs(sVal - pVal);
                const match = diff < 0.01;
                detail += ` | ${col}: ${match ? '✅' : '❌'} (SQLite=${sVal.toFixed(2)} PG=${pVal.toFixed(2)} Δ=${diff.toFixed(2)})`;
                if (!match) {
                    detail += ` SUM-MISMATCH`;
                    warnings++;
                }
            }
        }

        if (!cntMatch) {
            detail += ` COUNT-MISMATCH`;
            errors++;
        }

        const status = checks.find(c => c.name === table.name)?.status === 'error' ? 'error' : (cntMatch ? 'pass' : 'fail');

        // Remove previous error check if we also have a success entry
        const existing = checks.findIndex(c => c.name === table.name);
        if (existing >= 0) {
            checks[existing] = { name: table.name, status, detail };
        } else {
            checks.push({ name: table.name, status, detail });
        }
    }

    const passed = checks.filter(c => c.status === 'pass').length;
    const total = checks.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 100;

    return { name: 'Data Integrity', score, checks, warnings, errors };
}

module.exports = { check };
