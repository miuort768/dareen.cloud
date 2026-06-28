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
    console.log('Starting Batch 4-7 data migration...\n');

    // Batch 4: Sessions & Invoices (all 0 rows — no data to migrate, skip)
    console.log('Batch 4: No data rows in sessions/invoices. Skipping.\n');

    // Batch 5: FixedExpenses + ManualTransactions
    await migrateTable('fixed_expenses', 'SELECT * FROM fixed_expenses', (row) =>
        prisma.fixedExpense.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name,
                amount: row.amount ?? 0,
                isActive: row.is_active ?? 1,
            }
        })
    );
    await migrateTable('manual_transactions', 'SELECT * FROM manual_transactions', (row) =>
        prisma.manualTransaction.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                type: row.type,
                category: row.category || '',
                amount: row.amount ?? 0,
                date: row.date,
                description: row.description || '',
                status: row.status || 'completed',
                isArchived: row.isArchived ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // Batch 6: Chat (conversations, conversation_members, messages, chat_profiles)
    await migrateTable('conversations', 'SELECT * FROM conversations', (row) =>
        prisma.conversation.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name || '',
                isGroup: row.isGroup ?? 0,
                createdBy: row.createdBy || '',
                isLive: row.isLive ?? 0,
                meetingUrl: row.meetingUrl || null,
                createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
            }
        })
    );
    await migrateTable('conversation_members', 'SELECT * FROM conversation_members', (row) =>
        prisma.conversationMember.upsert({
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
        prisma.message.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                conversationId: row.conversationId,
                senderId: row.senderId,
                senderName: row.senderName,
                content: row.content,
                timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
            }
        })
    );
    await migrateTable('chat_profiles', 'SELECT * FROM chat_profiles', (row) =>
        prisma.chatProfile.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name,
                username: row.username,
                password: row.password,
                avatar: row.avatar || null,
                status: row.status || 'offline',
                lastSeen: row.lastSeen ? new Date(row.lastSeen) : null,
                createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
            }
        })
    );

    // Batch 7: System, Auth, Parents, Students, Teachers (users already exists, others are 0 rows)
    await migrateTable('users', 'SELECT * FROM users', (row) =>
        prisma.user.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name,
                username: row.username,
                password: row.password,
                role: row.role || 'admin',
                permissions: row.permissions || null,
                tokenVersion: row.token_version ?? 1,
            }
        })
    );
    await migrateTable('teachers', 'SELECT * FROM teachers', (row) =>
        prisma.teacher.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name,
                phone1: row.phone1 || null,
                phone2: row.phone2 || null,
                subject: row.subject || null,
                price: row.price ?? 0,
                email: row.email || null,
                username: row.username || null,
                password: row.password || null,
                points: row.points ?? 0,
                deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('students', 'SELECT * FROM students', (row) =>
        prisma.student.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name,
                grade: row.grade || null,
                parentPhone: row.parent_phone || null,
                studentPhone: row.student_phone || null,
                curriculum: row.curriculum || null,
                notes: row.notes || null,
                sessionPrice: row.session_price ?? 0,
                parentId: row.parentId || null,
                totalPoints: row.total_points ?? 0,
                badges: row.badges || null,
                username: row.username || null,
                password: row.password || null,
                deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('parents', 'SELECT * FROM parents', (row) =>
        prisma.parent.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                name: row.name,
                phone: row.phone,
                email: row.email || null,
                username: row.username || null,
                password: row.password || null,
                deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );

    // Also migrate remaining zero-row tables from Batch 4
    await migrateTable('sessions', 'SELECT * FROM sessions', (row) =>
        prisma.session.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentId: row.studentId,
                teacherId: row.teacherId || null,
                studentName: row.studentName || null,
                teacherName: row.teacherName || null,
                subject: row.subject || null,
                date: row.date,
                day: row.day || null,
                time: row.time || null,
                price: row.price ?? 0,
                teacherPrice: row.teacherPrice ?? 0,
                status: row.status || 'scheduled',
                topics: row.topics || null,
                homework: row.homework || null,
                needsCompensation: row.needsCompensation ?? 0,
                isArchived: row.is_archived ?? 0,
                createdAt: row.created_at ? new Date(row.created_at) : undefined,
            }
        })
    );
    await migrateTable('student_invoices', 'SELECT * FROM student_invoices', (row) =>
        prisma.studentInvoice.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                studentId: row.studentId,
                studentName: row.studentName || null,
                amount: row.amount,
                description: row.description || null,
                date: row.date,
                dueDate: row.dueDate || null,
                status: row.status || 'unpaid',
                paymentMethod: row.paymentMethod || null,
                notes: row.notes || null,
                items: row.items || null,
                isArchived: row.is_archived ?? 0,
            }
        })
    );
    await migrateTable('teacher_invoices', 'SELECT * FROM teacher_invoices', (row) =>
        prisma.teacherInvoice.upsert({
            where: { id: row.id },
            update: {},
            create: {
                id: row.id,
                teacherId: row.teacherId || null,
                teacherName: row.teacher || null,
                specialization: row.specialization || null,
                amount: row.amount,
                paymentMethod: row.paymentMethod || null,
                status: row.status || 'unpaid',
                personalExpenses: row.personalExpenses ?? 0,
                date: row.date,
                isArchived: row.is_archived ?? 0,
            }
        })
    );

    console.log('\nBatch 4-7 migration completed.');
    await prisma.$disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
