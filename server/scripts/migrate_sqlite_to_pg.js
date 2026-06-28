const { PrismaClient } = require('@prisma/client');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const LEGACY_DB = path.join(__dirname, '..', 'database.sqlite');
const PRISMA_DB = path.join(__dirname, '..', 'dev.db');

// Connect to PostgreSQL via Prisma
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const pgPrisma = new PrismaClient({ adapter });

async function migrateTable(name, query, transform, batchSize = 50) {
    console.log(`Migrating ${name}...`);
    const src = await open({
        filename: process.env.SOURCE_DB || PRISMA_DB,
        driver: sqlite3.Database
    });
    let count = 0;
    try {
        const rows = await src.all(query);
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            await Promise.all(batch.map(row =>
                transform(row).catch(e => console.warn(`  Skipping ${name} row: ${e.message}`))
            ));
            count += batch.length;
        }
        console.log(`  Done: ${count} records migrated.`);
    } catch (err) {
        console.error(`Error migrating ${name}:`, err.message);
    } finally {
        await src.close();
    }
    return count;
}

async function main() {
    console.log('=== SQLite → PostgreSQL Migration ===\n');

    const srcDb = process.env.SOURCE_DB || PRISMA_DB;
    console.log(`Source DB: ${srcDb}`);
    console.log(`Target: ${process.env.DATABASE_URL}\n`);

    // Core Domain
    await migrateTable('users', 'SELECT * FROM users', (row) =>
        pgPrisma.user.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, username: row.username,
                password: row.password, role: row.role || 'admin',
                permissions: row.permissions || null,
                tokenVersion: row.token_version ?? 1,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('teachers', 'SELECT * FROM teachers', (row) =>
        pgPrisma.teacher.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name,
                phone1: row.phone1, phone2: row.phone2,
                subject: row.subject, price: row.price ?? 0,
                email: row.email, username: row.username,
                password: row.password, points: row.points ?? 0,
                deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('students', 'SELECT * FROM students', (row) =>
        pgPrisma.student.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, grade: row.grade,
                parentPhone: row.parent_phone, studentPhone: row.student_phone,
                curriculum: row.curriculum, notes: row.notes,
                sessionPrice: row.session_price ?? 0,
                parentId: row.parentId,
                totalPoints: row.total_points ?? 0,
                badges: row.badges, username: row.username,
                password: row.password,
                deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('parents', 'SELECT * FROM parents', (row) =>
        pgPrisma.parent.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, phone: row.phone,
                email: row.email, username: row.username,
                password: row.password,
                deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('enrollments', 'SELECT * FROM enrollments', (row) =>
        pgPrisma.enrollment.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentId: row.studentId,
                teacherId: row.teacherId, teacher: row.teacher,
                subject: row.subject, curr: row.curr,
                sessionsTotal: row.sessionsTotal ?? 0,
                sessionsUsed: row.sessionsUsed ?? 0,
                schedule: row.schedule, nextSessionNotes: row.nextSessionNotes,
                isFrozen: row.isFrozen ?? 0, frozenReason: row.frozenReason,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('points_log', 'SELECT * FROM points_log', (row) =>
        pgPrisma.pointsLog.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentId: row.studentId,
                amount: row.amount, action: row.action,
                timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
            }
        })
    );

    // Education Domain
    await migrateTable('sessions', 'SELECT * FROM sessions', (row) =>
        pgPrisma.session.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentId: row.studentId,
                teacherId: row.teacherId, studentName: row.studentName,
                teacherName: row.teacherName, subject: row.subject,
                date: row.date, day: row.day, time: row.time,
                price: row.price ?? 0, teacherPrice: row.teacherPrice ?? 0,
                status: row.status || 'scheduled', topics: row.topics,
                homework: row.homework,
                needsCompensation: row.needsCompensation ?? 0,
                isArchived: row.is_archived ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('live_sessions', 'SELECT * FROM live_sessions', (row) =>
        pgPrisma.liveSession.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, teacherId: row.teacherId,
                teacherName: row.teacherName, title: row.title,
                subject: row.subject, status: row.status || 'active',
                targetStudentId: row.targetStudentId,
                startedAt: row.started_at ? new Date(row.started_at) : undefined,
            }
        })
    );
    await migrateTable('active_sessions', 'SELECT * FROM active_sessions', (row) =>
        pgPrisma.activeSession.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentId: row.studentId,
                teacherId: row.teacherId, teacherName: row.teacherName,
                subject: row.subject, timerSeconds: row.timerSeconds ?? 0,
                startedAt: row.startedAt ? new Date(row.startedAt) : undefined,
            }
        })
    );
    await migrateTable('evaluations', 'SELECT * FROM evaluations', (row) =>
        pgPrisma.evaluation.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentId: row.studentId,
                teacherId: row.teacherId, teacherName: row.teacherName,
                sessionId: row.sessionId, date: row.date,
                rating: row.rating, notes: row.notes,
                points: row.points ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('trial_sessions', 'SELECT * FROM trial_sessions', (row) =>
        pgPrisma.trialSession.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentName: row.studentName,
                parentPhone: row.parentPhone, subject: row.subject,
                teacherId: row.teacherId, teacherName: row.teacherName,
                date: row.date, time: row.time, status: row.status || 'pending',
                notes: row.notes,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('teacher_availability', 'SELECT * FROM teacher_availability', (row) =>
        pgPrisma.teacherAvailability.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, teacherId: row.teacherId,
                teacherName: row.teacherName,
                dayOfWeek: row.dayOfWeek, startTime: row.startTime,
                endTime: row.endTime, isAvailable: row.isAvailable ?? 1,
            }
        })
    );

    // Finance Domain
    await migrateTable('student_invoices', 'SELECT * FROM student_invoices', (row) =>
        pgPrisma.studentInvoice.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentId: row.studentId,
                studentName: row.studentName, amount: row.amount,
                description: row.description, date: row.date,
                dueDate: row.dueDate, status: row.status || 'unpaid',
                paymentMethod: row.paymentMethod, notes: row.notes,
                items: row.items, isArchived: row.is_archived ?? 0,
            }
        })
    );
    await migrateTable('teacher_invoices', 'SELECT * FROM teacher_invoices', (row) =>
        pgPrisma.teacherInvoice.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, teacherId: row.teacherId,
                teacherName: row.teacher, specialization: row.specialization,
                amount: row.amount, paymentMethod: row.paymentMethod,
                status: row.status || 'unpaid',
                personalExpenses: row.personalExpenses ?? 0,
                date: row.date, isArchived: row.is_archived ?? 0,
            }
        })
    );
    await migrateTable('manual_transactions', 'SELECT * FROM manual_transactions', (row) =>
        pgPrisma.manualTransaction.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, type: row.type, category: row.category,
                amount: row.amount ?? 0, date: row.date,
                description: row.description, status: row.status || 'completed',
                isArchived: row.isArchived ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('fixed_expenses', 'SELECT * FROM fixed_expenses', (row) =>
        pgPrisma.fixedExpense.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name,
                amount: row.amount ?? 0, isActive: row.is_active ?? 1,
            }
        })
    );

    // Content & Communication
    await migrateTable('blog_posts', 'SELECT * FROM blog_posts', (row) =>
        pgPrisma.blogPost.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, slug: row.slug, title: row.title,
                excerpt: row.excerpt, content: row.content,
                coverImage: row.coverImage, category: row.category,
                keywords: row.keywords, author: row.author,
                date: row.date, contentType: row.contentType,
                curriculum: row.curriculum, level: row.level,
                grade: row.grade, term: row.term, subject: row.subject,
                downloadLink: row.downloadLink, watchLink: row.watchLink,
                views: row.views ?? 0, showButtons: row.show_buttons ?? 1,
                downloadButtonText: row.download_button_text,
                watchButtonText: row.watch_button_text,
                source: row.source, fileSize: row.file_size,
                seoTitle: row.seo_title, seoDescription: row.seo_description,
                ogImage: row.og_image, focusKeyword: row.focus_keyword,
                readingTime: row.reading_time ?? 0,
                canonicalUrl: row.canonical_url,
                robotsIndex: row.robots_index ?? 1,
                isFeatured: row.is_featured ?? 0, tags: row.tags,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('leads', 'SELECT * FROM leads', (row) =>
        pgPrisma.lead.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, studentName: row.studentName,
                phone: row.phone, subject: row.subject,
                curriculum: row.curriculum, status: row.status || 'new',
                priority: row.priority || 'medium', notes: row.notes,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('job_applications', 'SELECT * FROM job_applications', (row) =>
        pgPrisma.jobApplication.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, phone: row.phone,
                whatsapp: row.whatsapp, position: row.position,
                qualification: row.qualification, grade: row.grade,
                graduationYear: row.graduationYear,
                onlineYears: row.onlineYears, curriculums: row.curriculums,
                contacted: row.contacted ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('contact_messages', 'SELECT * FROM contact_messages', (row) =>
        pgPrisma.contactMessage.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, phone: row.phone,
                subject: row.subject, message: row.message,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('conversations', 'SELECT * FROM conversations', (row) =>
        pgPrisma.conversation.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, isGroup: row.isGroup ?? 0,
                createdBy: row.createdBy, isLive: row.isLive ?? 0,
                meetingUrl: row.meetingUrl,
                createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
            }
        })
    );
    await migrateTable('conversation_members', 'SELECT * FROM conversation_members', (row) =>
        pgPrisma.conversationMember.upsert({
            where: {
                conversationId_userId: {
                    conversationId: row.conversationId,
                    userId: row.userId,
                }
            },
            update: {},
            create: {
                conversationId: row.conversationId,
                userId: row.userId,
            }
        })
    );
    await migrateTable('messages', 'SELECT * FROM messages', (row) =>
        pgPrisma.message.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, conversationId: row.conversationId,
                senderId: row.senderId, senderName: row.senderName,
                content: row.content,
                timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
            }
        })
    );
    await migrateTable('chat_profiles', 'SELECT * FROM chat_profiles', (row) =>
        pgPrisma.chatProfile.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, username: row.username,
                password: row.password, avatar: row.avatar,
                status: row.status || 'offline',
                lastSeen: row.lastSeen ? new Date(row.lastSeen) : null,
                createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
            }
        })
    );
    await migrateTable('forum_posts', 'SELECT * FROM forum_posts', (row) =>
        pgPrisma.forumPost.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, authorId: row.authorId,
                authorName: row.authorName, authorRole: row.authorRole,
                content: row.content, status: row.status || 'pending',
                upvotes: row.upvotes || '[]', downvotes: row.downvotes || '[]',
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('forum_comments', 'SELECT * FROM forum_comments', (row) =>
        pgPrisma.forumComment.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, postId: row.postId,
                authorId: row.authorId, authorName: row.authorName,
                authorRole: row.authorRole, content: row.content,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('announcements', 'SELECT * FROM announcements', (row) =>
        pgPrisma.announcement.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, title: row.title, content: row.content,
                type: row.type || 'general', date: row.date,
                isActive: row.isActive ?? 1,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('notifications', 'SELECT * FROM notifications', (row) =>
        pgPrisma.notification.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, senderId: row.senderId,
                receiverId: row.receiverId, senderName: row.senderName,
                title: row.title, message: row.message,
                type: row.type || 'info', time: row.time,
                read: row.read ?? 0, conversationId: row.conversationId,
                link: row.link, isDismissed: row.is_dismissed ?? 0,
            }
        })
    );

    // System Domain
    await migrateTable('system_settings', 'SELECT * FROM system_settings', (row) =>
        pgPrisma.systemSetting.upsert({
            where: { key: row.key },
            update: {},
            create: { key: row.key, value: row.value }
        })
    );
    await migrateTable('tasks', 'SELECT * FROM tasks', (row) =>
        pgPrisma.task.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, title: row.title, description: row.description,
                status: row.status || 'pending', priority: row.priority || 'medium',
                dueDate: row.dueDate, userId: row.userId,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('completed_sessions', 'SELECT * FROM completed_sessions', (row) =>
        pgPrisma.completedSession.upsert({
            where: { id: row.id },
            update: {},
            create: { id: row.id }
        })
    );
    await migrateTable('audit_logs', 'SELECT * FROM audit_logs', (row) =>
        pgPrisma.auditLog.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, userId: row.userId, username: row.username,
                action: row.action, details: row.details,
                timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
            }
        })
    );
    await migrateTable('whatsapp_templates', 'SELECT * FROM whatsapp_templates', (row) =>
        pgPrisma.whatsappTemplate.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, name: row.name, content: row.content,
                isActive: row.isActive ?? 1,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('push_subscriptions', 'SELECT * FROM push_subscriptions', (row) =>
        pgPrisma.pushSubscription.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id, userId: row.userId,
                subscription: row.subscription,
                deviceType: row.deviceType,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    console.log('\n=== Migration Complete ===');
    await pgPrisma.$disconnect();
    await pool.end();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
