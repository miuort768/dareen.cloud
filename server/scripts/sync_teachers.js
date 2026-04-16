const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function syncTeachers() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    try {
        console.log('--- Syncing Teachers ---');

        // Find all unique teacher names from invoices, sessions, and enrollments
        const allNames = await db.all(`
            SELECT DISTINCT teacher as name FROM teacher_invoices
            UNION
            SELECT DISTINCT teacherName as name FROM sessions
            UNION
            SELECT DISTINCT teacher as name FROM enrollments
        `);

        let addedCount = 0;
        for (const row of allNames) {
            if (!row.name || row.name.trim() === '') continue;

            const exists = await db.get('SELECT id FROM teachers WHERE name = ?', [row.name]);
            if (!exists) {
                const newId = `t_sync_${Math.random().toString(36).substr(2, 7)}`;
                console.log(`Adding missing teacher: ${row.name} (ID: ${newId})`);

                // Get specialization if available from invoices
                const invoice = await db.get('SELECT specialization FROM teacher_invoices WHERE teacher = ? LIMIT 1', [row.name]);
                const subject = invoice ? invoice.specialization : 'غير محدد';

                await db.run(
                    'INSERT INTO teachers (id, name, subject, price) VALUES (?, ?, ?, ?)',
                    [newId, row.name, subject, 0]
                );
                addedCount++;
            }
        }

        console.log(`\nDone! Added ${addedCount} missing teachers.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.close();
    }
}
syncTeachers();
