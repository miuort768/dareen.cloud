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
                transform(row).catch(e => console.warn(`  Skipping ${name} row ${row.id || row.key}: ${e.message}`))
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
    console.log('Starting Batch 2 data migration...\n');

    // 1. Points logs
    await migrateTable('points_log', 'SELECT * FROM points_log', (row) =>
        prisma.pointsLog.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentId: row.studentId,
                amount: row.amount,
                action: row.action,
                timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
            }
        })
    );

    // 2. Teacher availability
    await migrateTable('teacher_availability', 'SELECT * FROM teacher_availability', (row) =>
        prisma.teacherAvailability.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                teacherId: row.teacherId,
                teacherName: row.teacherName,
                dayOfWeek: row.dayOfWeek,
                startTime: row.startTime,
                endTime: row.endTime,
                isAvailable: row.isAvailable ?? 1,
            }
        })
    );

    // 3. Notifications
    await migrateTable('notifications', 'SELECT * FROM notifications', (row) =>
        prisma.notification.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                senderId: row.senderId || '',
                receiverId: row.receiverId || '',
                senderName: row.senderName || '',
                title: row.title,
                message: row.message || '',
                type: row.type || 'info',
                time: row.time,
                read: row.read ?? 0,
                conversationId: row.conversationId || '',
                link: row.link || '',
                isDismissed: row.is_dismissed ?? 0,
            }
        })
    );

    // 4. Push subscriptions
    await migrateTable('push_subscriptions', 'SELECT * FROM push_subscriptions', (row) =>
        prisma.pushSubscription.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                userId: row.userId,
                subscription: row.subscription,
                deviceType: row.deviceType || '',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // 5. System settings
    await migrateTable('system_settings', 'SELECT * FROM system_settings', (row) =>
        prisma.systemSetting.upsert({
            where: { key: row.key },
            update: {},
            create: {
                key: row.key,
                value: row.value || '',
            }
        })
    );

    // 6. Blog posts
    await migrateTable('blog_posts', 'SELECT * FROM blog_posts', (row) =>
        prisma.blogPost.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                slug: row.slug,
                title: row.title,
                excerpt: row.excerpt || '',
                content: row.content || '',
                coverImage: row.coverImage || '',
                category: row.category || '',
                keywords: row.keywords || '',
                author: row.author || '',
                date: row.date || '',
                contentType: row.contentType || '',
                curriculum: row.curriculum || '',
                level: row.level || '',
                grade: row.grade || '',
                term: row.term || '',
                subject: row.subject || '',
                downloadLink: row.downloadLink || '',
                watchLink: row.watchLink || '',
                views: row.views ?? 0,
                showButtons: row.show_buttons ?? 1,
                downloadButtonText: row.download_button_text || '',
                watchButtonText: row.watch_button_text || '',
                source: row.source || '',
                fileSize: row.file_size || '',
                seoTitle: row.seo_title || '',
                seoDescription: row.seo_description || '',
                ogImage: row.og_image || '',
                focusKeyword: row.focus_keyword || '',
                readingTime: row.reading_time ?? 0,
                canonicalUrl: row.canonical_url || '',
                robotsIndex: row.robots_index ?? 1,
                isFeatured: row.is_featured ?? 0,
                tags: row.tags || '',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // 7. Sessions (needed by studentPortal and teacher_availability)
    await migrateTable('sessions', 'SELECT * FROM sessions', (row) =>
        prisma.session.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentId: row.studentId,
                teacherId: row.teacherId || '',
                studentName: row.studentName || '',
                teacherName: row.teacherName || '',
                subject: row.subject || '',
                date: row.date,
                day: row.day || '',
                time: row.time || '',
                price: row.price ?? 0,
                teacherPrice: row.teacherPrice ?? 0,
                status: row.status || 'scheduled',
                topics: row.topics || '',
                homework: row.homework || '',
                needsCompensation: row.needsCompensation ?? 0,
                isArchived: row.is_archived ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    console.log('\nBatch 2 migration completed.');
    await prisma.$disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
