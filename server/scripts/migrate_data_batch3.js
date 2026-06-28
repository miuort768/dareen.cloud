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
                transform(row).catch(e => console.warn(`  Skipping ${name} row ${row.id}: ${e.message}`))
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
    console.log('Starting Batch 3 data migration...\n');

    await migrateTable('evaluations', 'SELECT * FROM evaluations', (row) =>
        prisma.evaluation.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentId: row.studentId,
                teacherId: row.teacherId,
                teacherName: row.teacherName || '',
                sessionId: row.sessionId || '',
                date: row.date,
                rating: row.rating,
                notes: row.notes || '',
                points: row.points ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    await migrateTable('trial_sessions', 'SELECT * FROM trial_sessions', (row) =>
        prisma.trialSession.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentName: row.studentName,
                parentPhone: row.parentPhone,
                subject: row.subject || '',
                teacherId: row.teacherId || '',
                teacherName: row.teacherName || '',
                date: row.date,
                time: row.time || '',
                status: row.status || 'pending',
                notes: row.notes || '',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    await migrateTable('forum_posts', 'SELECT * FROM forum_posts', (row) =>
        prisma.forumPost.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                authorId: row.authorId,
                authorName: row.authorName,
                authorRole: row.authorRole,
                content: row.content,
                status: row.status || 'pending',
                upvotes: row.upvotes || '[]',
                downvotes: row.downvotes || '[]',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    await migrateTable('forum_comments', 'SELECT * FROM forum_comments', (row) =>
        prisma.forumComment.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                postId: row.postId,
                authorId: row.authorId,
                authorName: row.authorName,
                authorRole: row.authorRole,
                content: row.content,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    console.log('\nBatch 3 migration completed.');
    await prisma.$disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
