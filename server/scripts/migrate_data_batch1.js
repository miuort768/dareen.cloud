const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { prisma } = require('../utils/prisma');

const LEGACY_DB_PATH = process.env.LEGACY_DB_PATH || path.join(__dirname, '..', 'database.sqlite');

async function migrateTable(name, query, transform, batchSize = 100) {
    console.log(`Migrating ${name}...`);
    const legacy = await open({ filename: LEGACY_DB_PATH, driver: sqlite3.Database });
    let count = 0;
    try {
        const rows = await legacy.all(query);
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            await Promise.all(batch.map(row =>
                transform(row).catch(e => console.warn(`  Skipping ${name} row: ${e.message}`))
            ));
            count += batch.length;
            console.log(`  ${count}/${rows.length}`);
        }
        console.log(`  Done: ${count} ${name} records migrated.`);
    } catch (err) {
        console.error(`Error migrating ${name}:`, err.message);
    } finally {
        await legacy.close();
    }
    return count;
}

async function main() {
    console.log('Starting Batch 1 data migration...\n');

    // 1. Announcements
    await migrateTable('announcements', 'SELECT * FROM announcements', (row) =>
        prisma.announcement.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                title: row.title,
                content: row.content || '',
                type: row.type || 'general',
                date: row.date,
                isActive: row.isActive ?? 1,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // 2. Contact messages
    await migrateTable('contact_messages', 'SELECT * FROM contact_messages', (row) =>
        prisma.contactMessage.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name || '',
                phone: row.phone,
                subject: row.subject || '',
                message: row.message || '',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // 3. Tasks
    await migrateTable('tasks', 'SELECT * FROM tasks', (row) =>
        prisma.task.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                title: row.title,
                description: row.description || '',
                status: row.status || 'pending',
                priority: row.priority || 'medium',
                dueDate: row.dueDate || '',
                userId: row.userId || '',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // 4. Job applications
    await migrateTable('job_applications', 'SELECT * FROM job_applications', (row) =>
        prisma.jobApplication.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name,
                phone: row.phone,
                whatsapp: row.whatsapp || '',
                position: row.position,
                qualification: row.qualification,
                grade: row.grade || '',
                graduationYear: row.graduationYear || '',
                onlineYears: row.onlineYears || '',
                curriculums: row.curriculums || '',
                contacted: row.contacted ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // 5. Completed sessions
    await migrateTable('completed_sessions', 'SELECT * FROM completed_sessions', (row) =>
        prisma.completedSession.upsert({
            where: { id: row.id },
            update: {},
            create: { id: row.id }
        })
    );

    // 6. Active sessions
    await migrateTable('active_sessions', 'SELECT * FROM active_sessions', (row) =>
        prisma.activeSession.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentId: row.studentId,
                teacherId: row.teacherId,
                teacherName: row.teacherName,
                subject: row.subject,
                timerSeconds: row.timerSeconds ?? 0,
                startedAt: row.startedAt ? new Date(row.startedAt) : undefined,
            }
        })
    );

    // 7. Leads
    await migrateTable('leads', 'SELECT * FROM leads', (row) =>
        prisma.lead.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentName: row.studentName,
                phone: row.phone,
                subject: row.subject || '',
                curriculum: row.curriculum || '',
                status: row.status || 'new',
                priority: row.priority || 'medium',
                notes: row.notes || '',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    console.log('\nBatch 1 migration completed.');
    await prisma.$disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
