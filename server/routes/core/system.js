const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const cacheService = require('../../services/cacheService');
const { prisma } = require('../../utils/prisma');
const { audit } = require('../../services/auditService');
const { createBackup, getBackupHistory } = require('../../services/backupService');
const { getMetrics } = require('../../middleware/monitoring');
const { normalizeUsername, findIdentityByUsername, syncAccount, deactivateAccount } = require('../../services/authAccounts');

// `dismissedNotifications` uses notifications.is_dismissed; reset helper.
async function clearDismissedNotifications(tx) {
    await tx.notification.updateMany({ data: { isDismissed: 0 } });
}

router.use(authMiddleware);
router.use(checkRole(['admin']));

// GET /api/system/settings-batch — returns all settings grouped
router.get('/settings-batch', async (req, res) => {
    try {
        const result = await cacheService.wrap('system:settings-batch', 60000, async () => {
            const settings = await prisma.systemSetting.findMany();
            const map = {};
            settings.forEach(s => { map[s.key] = s.value; });
            const financialSettings = await prisma.financialSetting.findMany();
            const finMap = {};
            financialSettings.forEach(s => { finMap[s.key] = s.value; });
            return { system: map, financial: finMap };
        });
        res.json(result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

// POST /api/system/settings-batch — save multiple settings at once
router.post('/settings-batch', async (req, res) => {
    const { settings } = req.body;
    if (!settings || !Array.isArray(settings)) return res.status(400).json({ error: 'settings array required' });
    try {
        for (const { key, value } of settings) {
            await prisma.systemSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
        }
        cache.del('system:settings');
        await cacheService.del('system:settings-batch');
        await audit(req.user.id, req.user.username, 'SETTINGS_BATCH_UPDATE', { count: settings.length }, 'system', null);
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

// GET /api/system/financial-settings
router.get('/financial-settings', async (req, res) => {
    try {
        const result = await cacheService.wrap('system:financial-settings', 60000, async () => {
            const settings = await prisma.financialSetting.findMany();
            const map = {};
            settings.forEach(s => { map[s.key] = s.value; });
            return map;
        });
        res.json(result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

// POST /api/system/financial-settings
router.post('/financial-settings', async (req, res) => {
    const { key, value } = req.body;
    try {
        await prisma.financialSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
        const cache = require('../../utils/cache');
        cache.delPattern('currency:');
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.get('/backup', async (req, res) => {
    try {
        const [
            students, teachers, parents, sessions, teacherInvoices,
            studentInvoices, manualTransactions, fixedExpenses,
            tasks, completedSessions, systemSettings, users,
            announcements, conversations, messages, notifications, chatProfiles, conversationMembers,
            auditLogs, whatsappTemplates, accounts
        ] = await Promise.all([
            prisma.student.findMany({ include: { enrollments: true } }),
            prisma.teacher.findMany(),
            prisma.parent.findMany(),
            prisma.session.findMany(),
            prisma.teacherInvoice.findMany(),
            prisma.studentInvoice.findMany(),
            prisma.manualTransaction.findMany(),
            prisma.fixedExpense.findMany(),
            prisma.task.findMany(),
            prisma.completedSession.findMany(),
            prisma.systemSetting.findMany(),
            prisma.user.findMany({ select: { id: true, name: true, username: true, role: true, permissions: true, password: true } }),
            prisma.announcement.findMany(),
            prisma.conversation.findMany(),
            prisma.message.findMany(),
            prisma.notification.findMany(),
            prisma.chatProfile.findMany(),
            prisma.conversationMember.findMany(),
            prisma.auditLog.findMany(),
            prisma.whatsAppTemplate.findMany(),
            prisma.account.findMany().catch(() => []),
        ]);

        const dismissedNotifications = (await prisma.notification.findMany({
            where: { isDismissed: 1 },
            select: { id: true }
        })).map(n => n.id);

        const studentsWithEnrollments = students.map(s => ({
            ...s,
            enrollments: s.enrollments.map(e => ({
                ...e,
                schedule: typeof e.schedule === 'string' ? JSON.parse(e.schedule) : (e.schedule || [])
            }))
        }));

        const backup = {
            version: '1.2',
            timestamp: new Date().toISOString(),
            data: {
                students: studentsWithEnrollments,
                teachers,
                parents,
                sessions,
                invoices: teacherInvoices,
                studentInvoices: studentInvoices.map(inv => ({
                    ...inv, items: inv.items ? JSON.parse(inv.items) : []
                })),
                manualTransactions,
                fixedExpenses,
                tasks,
                completedSessions,
                dismissedNotifications,
                notifications,
                systemSettings,
                users,
                announcements,
                conversations,
                messages,
                chatProfiles,
                conversationMembers,
                auditLogs,
                whatsappTemplates,
                accounts
            }
        };

        res.json(backup);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.post('/restore', async (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    try {
        // Restore can insert tens of thousands of rows (sessions, messages, audit
        // logs). The default interactive transaction timeout (5s) is far too short.
        await prisma.$transaction(async (tx) => {
            await tx.message.deleteMany();
            await tx.conversationMember.deleteMany();
            await tx.conversation.deleteMany();
            await tx.chatProfile.deleteMany();
            await tx.announcement.deleteMany();
            await tx.enrollment.deleteMany();
            await tx.studentInvoice.deleteMany();
            await tx.session.deleteMany();
            await tx.student.deleteMany();
            await tx.teacher.deleteMany();
            await tx.parent.deleteMany();
            await tx.teacherInvoice.deleteMany();
            await tx.notification.deleteMany();
            await tx.task.deleteMany();
            await tx.manualTransaction.deleteMany();
            await tx.fixedExpense.deleteMany();
            await tx.completedSession.deleteMany();
            await tx.auditLog.deleteMany();
            await tx.whatsAppTemplate.deleteMany();
            await tx.systemSetting.deleteMany();
            await clearDismissedNotifications(tx);
            if (data.users && data.users.length > 0) {
                await tx.user.deleteMany({ where: { NOT: { username: 'admin' } } });
            }

            if (data.users) {
                for (const u of data.users) {
                    if (u.username === 'admin') continue;
                    await tx.user.create({
                        data: {
                            id: u.id, name: u.name, username: u.username,
                            password: u.password, role: u.role,
                            permissions: typeof u.permissions === 'string' ? u.permissions : JSON.stringify(u.permissions || [])
                        }
                    });
                }
            }

            if (data.teachers) {
                for (const t of data.teachers) {
                    await tx.teacher.create({
                        data: {
                            id: t.id, name: t.name, phone1: t.phone1 || '', phone2: t.phone2 || '',
                            subject: t.subject || '', price: t.price || 0, email: t.email || '',
                            username: t.username || null, password: t.password || null,
                            createdAt: t.created_at ? new Date(t.created_at) : undefined,
                        }
                    });
                }
            }

            if (data.parents) {
                for (const p of data.parents) {
                    await tx.parent.create({
                        data: { id: p.id, name: p.name, phone: p.phone || '', email: p.email || '', username: p.username || null, password: p.password || null }
                    });
                }
            }

            if (data.students) {
                for (const s of data.students) {
                    await tx.student.create({
                        data: {
                            id: s.id, name: s.name, grade: s.grade || '',
                            parentPhone: s.parentPhone || '', studentPhone: s.studentPhone || '',
                            curriculum: s.curriculum || '', notes: s.notes || '',
                            sessionPrice: s.sessionPrice !== undefined ? s.sessionPrice : 0,
                            badges: s.badges || '', totalPoints: s.totalPoints || 0,
                            username: s.username || null, password: s.password || null,
                        }
                    });
                    if (s.enrollments) {
                        for (const e of s.enrollments) {
                            await tx.enrollment.create({
                                data: {
                                    studentId: s.id, teacherFallback: e.teacher || '',
                                    teacherId: e.teacherId || null, subject: e.subject || '',
                                    curr: e.curr || '', sessionsTotal: e.sessionsTotal || 0,
                                    sessionsUsed: e.sessionsUsed || 0,
                                    schedule: typeof e.schedule === 'string' ? e.schedule : JSON.stringify(e.schedule || []),
                                }
                            });
                        }
                    }
                }
            }

            if (data.sessions) {
                for (const s of data.sessions) {
                    await tx.session.create({
                        data: {
                            id: s.id, studentId: s.studentId, studentName: s.studentName || '',
                            teacherId: s.teacherId || '', teacherName: s.teacherName || '',
                            subject: s.subject || '', date: s.date, day: s.day || '',
                            time: s.time || '', price: s.price || 0, teacherPrice: s.teacherPrice || 0,
                            status: s.status || 'scheduled',
                            createdAt: s.created_at ? new Date(s.created_at) : undefined,
                        }
                    });
                }
            }

            if (data.invoices) {
                for (const i of data.invoices) {
                    await tx.teacherInvoice.create({
                        data: {
                            id: i.id, teacherId: i.teacherId || '', teacherName: i.teacher || '',
                            specialization: i.specialization || '', amount: i.amount,
                            paymentMethod: i.paymentMethod || '', status: i.status || 'unpaid',
                            personalExpenses: i.personalExpenses || 0, date: i.date,
                        }
                    });
                }
            }

            if (data.studentInvoices) {
                for (const i of data.studentInvoices) {
                    const items = i.items ? (typeof i.items === 'string' ? i.items : JSON.stringify(i.items)) : null;
                    await tx.studentInvoice.create({
                        data: {
                            id: i.id, studentId: i.studentId, studentName: i.studentName || '',
                            amount: i.amount, description: i.description || '', date: i.date,
                            dueDate: i.dueDate || '', status: i.status || 'unpaid',
                            paymentMethod: i.paymentMethod || '', notes: i.notes || '', items,
                        }
                    });
                }
            }

            if (data.manualTransactions) {
                for (const t of data.manualTransactions) {
                    await tx.manualTransaction.create({
                        data: {
                            id: t.id, type: t.type, category: t.category || '',
                            amount: t.amount, date: t.date, description: t.description || '',
                            status: t.status || 'completed',
                            createdAt: t.created_at ? new Date(t.created_at) : undefined,
                        }
                    });
                }
            }

            if (data.fixedExpenses) {
                for (const e of data.fixedExpenses) {
                    await tx.fixedExpense.create({
                        data: { name: e.name, amount: e.amount || 0, isActive: e.is_active ?? 1 }
                    });
                }
            }

            if (data.tasks) {
                for (const t of data.tasks) {
                    await tx.task.create({
                        data: {
                            id: t.id, title: t.title, description: t.description || '',
                            status: t.status || 'pending', priority: t.priority || 'medium',
                            dueDate: t.dueDate || '',
                            createdAt: t.created_at ? new Date(t.created_at) : undefined,
                        }
                    });
                }
            }

            if (data.completedSessions) {
                for (const s of data.completedSessions) {
                    await tx.completedSession.upsert({ where: { id: s.id }, update: {}, create: { id: s.id } });
                }
            }

            const dismissedSet = new Set((data.dismissedNotifications || []).map(n => (typeof n === 'string' ? n : n.id)));

            if (data.notifications) {
                for (const n of data.notifications) {
                    await tx.notification.create({
                        data: {
                            id: n.id, senderId: n.senderId || 'system', receiverId: n.receiverId || '',
                            senderName: n.senderName || 'System', title: n.title, message: n.message || '',
                            type: n.type || 'info', time: n.time, read: n.read ?? 0,
                            conversationId: n.conversationId || '',
                            isDismissed: dismissedSet.has(n.id) ? 1 : 0,
                        }
                    });
                }
            }

            if (data.chatProfiles) {
                for (const cp of data.chatProfiles) {
                    await tx.chatProfile.create({
                        data: {
                            id: cp.id, name: cp.name, username: cp.username, password: cp.password,
                            avatar: cp.avatar || '', status: cp.status || 'offline',
                            lastSeen: cp.lastSeen ? new Date(cp.lastSeen) : undefined,
                        }
                    });
                }
            }

            if (data.systemSettings) {
                for (const s of data.systemSettings) {
                    await tx.systemSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: { key: s.key, value: s.value } });
                }
            }

            if (data.announcements) {
                for (const a of data.announcements) {
                    await tx.announcement.create({
                        data: {
                            id: a.id, title: a.title, content: a.content || '',
                            type: a.type || 'general', date: a.date,
                            isActive: a.isActive ?? (a.active ?? 1),
                            createdAt: a.created_at || a.date ? new Date(a.created_at || a.date) : undefined,
                        }
                    });
                }
            }

            if (data.conversations) {
                for (const c of data.conversations) {
                    await tx.conversation.create({
                        data: {
                            id: c.id, name: c.name || null, isGroup: c.isGroup ?? (c.type === 'group' ? 1 : 0),
                            createdBy: c.createdBy || 'system',
                        }
                    });
                }
            }

            if (data.conversationMembers) {
                for (const cm of data.conversationMembers) {
                    await tx.conversationMember.create({ data: { conversationId: cm.conversationId, userId: cm.userId } });
                }
            }

            if (data.messages) {
                for (const m of data.messages) {
                    await tx.message.create({
                        data: {
                            id: m.id, conversationId: m.conversationId, senderId: m.senderId,
                            senderName: m.senderName, content: m.content,
                            timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
                        }
                    });
                }
            }

            if (data.auditLogs) {
                for (const al of data.auditLogs) {
                    await tx.auditLog.create({
                        data: {
                            userId: al.userId || '', username: al.username || '',
                            action: al.action, details: al.details || '',
                            timestamp: al.timestamp ? new Date(al.timestamp) : undefined,
                        }
                    });
                }
            }

            if (data.whatsappTemplates) {
                for (const wt of data.whatsappTemplates) {
                    await tx.whatsAppTemplate.create({
                        data: {
                            id: wt.id, name: wt.name, content: wt.content,
                            isActive: wt.isActive ?? 1,
                            createdAt: wt.created_at ? new Date(wt.created_at) : undefined,
                        }
                    });
                }
            }

            // Rebuild the unified accounts table from the restored legacy rows so
            // accounts/dual modes stay consistent after a restore. Users are
            // excluded: restore keeps the current admin (synced after the
            // transaction). Collisions resolve in login-search order.
            await tx.account.deleteMany().catch(() => {});
            const rebuiltLogins = new Set();
            const rebuildAccount = async ({ accountType, entityId, username, passwordHash }) => {
                if (!username || !passwordHash) return;
                const normalizedLogin = username.trim().toLowerCase();
                if (!normalizedLogin || rebuiltLogins.has(normalizedLogin)) return;
                rebuiltLogins.add(normalizedLogin);
                await tx.account.create({
                    data: {
                        username: normalizedLogin,
                        normalizedLogin,
                        passwordHash,
                        accountType,
                        entityId,
                        tokenVersion: 0,
                        isActive: true,
                        isLocked: false,
                    },
                });
            };

            if (data.teachers) {
                for (const t of data.teachers) {
                    await rebuildAccount({ accountType: 'TEACHER', entityId: t.id, username: t.username, passwordHash: t.password });
                }
            }
            if (data.chatProfiles) {
                for (const cp of data.chatProfiles) {
                    await rebuildAccount({ accountType: 'CHAT_USER', entityId: cp.id, username: cp.username, passwordHash: cp.password });
                }
            }
            if (data.parents) {
                for (const p of data.parents) {
                    await rebuildAccount({ accountType: 'PARENT', entityId: p.id, username: p.username, passwordHash: p.password });
                }
            }
            if (data.students) {
                for (const s of data.students) {
                    await rebuildAccount({ accountType: 'STUDENT', entityId: s.id, username: s.username, passwordHash: s.password });
                }
            }
        }, { timeout: 300000, maxWait: 15000 });

        // Keep the current admin's account row in sync (admin user is never restored).
        try {
            const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
            if (adminUser && adminUser.username && adminUser.password) {
                await syncAccount({ entityType: 'admin', entityId: adminUser.id, username: adminUser.username, passwordHash: adminUser.password });
            }
        } catch (err) {
            logger.warn('Admin account re-sync after restore skipped', err);
        }

        res.json({ message: 'Restore successful, system completely updated.' });
    } catch (err) {
        logger.error('CRITICAL RESTORE ERROR:', err);
        res.status(500).json({ error: 'Restore failed: ' + err.message });
    }
});

router.post('/system-reset', async (req, res) => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.enrollment.deleteMany();
            await tx.student.deleteMany();
            await tx.teacher.deleteMany();
            await tx.parent.deleteMany();
            await tx.session.deleteMany();
            await tx.teacherInvoice.deleteMany();
            await tx.studentInvoice.deleteMany();
            await tx.notification.deleteMany();
            await tx.task.deleteMany();
            await tx.manualTransaction.deleteMany();
            await tx.fixedExpense.deleteMany();
            await tx.completedSession.deleteMany();
            await tx.auditLog.deleteMany();
            await tx.whatsAppTemplate.deleteMany();
            await clearDismissedNotifications(tx);
            await tx.user.deleteMany({ where: { NOT: { role: { in: ['admin', 'supervisor'] } } } });
            await tx.account.deleteMany();
            await tx.chatProfile.deleteMany();
            await tx.message.deleteMany();
            await tx.conversationMember.deleteMany();
            await tx.conversation.deleteMany();
            await tx.teacherPaymentSetting.deleteMany();
            await tx.pushSubscription.deleteMany();
            await tx.passwordResetToken.deleteMany();
            await tx.liveSession.deleteMany();
            await tx.activeSession.deleteMany();
            await tx.evaluation.deleteMany();
            await tx.trialSession.deleteMany();
            await tx.teacherAvailability.deleteMany();
            await tx.systemSetting.deleteMany();

            const defaultSettings = [
                { key: 'academy_name', value: 'دارين لتعليم و التدريب' },
                { key: 'admin_phone', value: '201152001250' },
                { key: 'theme_color', value: 'indigo' },
                { key: 'notifications_enabled', value: 'true' },
                { key: 'maintenance_mode', value: 'false' },
                { key: 'whatsapp_auto_notify', value: 'false' },
                { key: 'default_session_price', value: '0' },
                { key: 'semester_name', value: 'الفصل الدراسي' },
                { key: 'balance_warning_threshold', value: '2' }
            ];
            for (const s of defaultSettings) {
                await tx.systemSetting.create({ data: { key: s.key, value: s.value } });
            }

            const defaultExpenses = [
                { name: 'إيجار المركز', amount: 0 },
                { name: 'كهرباء وإنترنت', amount: 0 },
                { name: 'نثريات وتسويق', amount: 0 },
                { name: 'حصص ملغية', amount: 0 },
                { name: 'أخرى', amount: 0 }
            ];
            for (const exp of defaultExpenses) {
                await tx.fixedExpense.create({ data: { name: exp.name, amount: exp.amount } });
            }
        });
        await audit(req.user.id, req.user.username, 'SYSTEM_RESET', null, 'system', null);
        res.json({ message: 'System reset successful' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.post('/archive-month', async (req, res) => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.session.updateMany({ where: { OR: [{ isArchived: 0 }, { isArchived: null }] }, data: { isArchived: 1 } });
            await tx.studentInvoice.updateMany({ where: { OR: [{ isArchived: 0 }, { isArchived: null }] }, data: { isArchived: 1 } });
            await tx.teacherInvoice.updateMany({ where: { OR: [{ isArchived: 0 }, { isArchived: null }] }, data: { isArchived: 1 } });
            await tx.manualTransaction.updateMany({ where: { OR: [{ isArchived: 0 }, { isArchived: null }] }, data: { isArchived: 1 } });
            await tx.auditLog.create({ data: { userId: 'system', username: 'System', action: 'MONTH_ARCHIVE', details: 'تم إقفال الشهر المالي وأرشفة جميع السجلات.' } });
        });
        res.json({ message: 'Month archived successfully' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.get('/settings', async (req, res) => {
    try {
        const cached = cache.get('system:settings');
        if (cached) return res.json(cached);
        const settings = await prisma.systemSetting.findMany();
        const settingsMap = {};
        settings.forEach(s => { settingsMap[s.key] = s.value; });
        cache.set('system:settings', settingsMap, 60000);
        res.json(settingsMap);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.post('/settings', async (req, res) => {
    const { key, value } = req.body;
    try {
        const before = await prisma.systemSetting.findUnique({ where: { key } });
        await prisma.systemSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
        cache.del('system:settings');
        await audit(req.user.id, req.user.username, 'SETTING_UPDATE', { key, before: before?.value, after: value }, 'system_setting', key);
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.get('/users', async (req, res) => {
    try {
        const cached = cache.get('system:users');
        if (cached) return res.json(cached);
        const users = await prisma.user.findMany({ select: { id: true, name: true, username: true, role: true, permissions: true } });
        const parsedUsers = users.map(u => ({
            ...u, permissions: u.permissions ? JSON.parse(u.permissions) : []
        }));
        cache.set('system:users', parsedUsers, 60000);
        res.json(parsedUsers);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.post('/users', async (req, res) => {
    const { id, name, username, password, role, permissions } = req.body;
    try {
        const bcrypt = require('bcrypt');
        const dbUsername = await normalizeUsername(username);
        if (dbUsername) {
            const existing = await findIdentityByUsername(dbUsername);
            if (existing) {
                return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = id || require('uuid').v4();
        await prisma.user.create({
            data: {
                id: userId, name, username: dbUsername, password: hashedPassword,
                role: role || 'admin', permissions: JSON.stringify(permissions || [])
            }
        });
        await syncAccount({ entityType: 'admin', entityId: userId, username: dbUsername, passwordHash: hashedPassword });
        cache.del('system:users');
        res.status(201).json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, username, password, role, permissions } = req.body;
    try {
        const bcrypt = require('bcrypt');
        const dbUsername = await normalizeUsername(username);
        if (dbUsername) {
            const duplicate = await findIdentityByUsername(dbUsername);
            if (duplicate && duplicate.id !== id) {
                return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
            }
        }
        const data = { name, username: dbUsername, role: role || 'admin', permissions: JSON.stringify(permissions || []) };
        if (password && password.trim() !== '') {
            data.password = await bcrypt.hash(password, 10);
        }
        await prisma.user.update({ where: { id }, data });
        await syncAccount({ entityType: 'admin', entityId: id, username: dbUsername, passwordHash: data.password });
        cache.del('system:users');
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        await deactivateAccount('admin', id);
        cache.del('system:users');
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.get('/dismissed-notifications', async (req, res) => {
    try {
        const rows = await prisma.notification.findMany({
            where: { isDismissed: 1 },
            select: { id: true }
        });
        res.json((rows || []).map(r => r.id));
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.post('/dismissed-notifications', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    try {
        await prisma.notification.update({ where: { id }, data: { isDismissed: 1 } });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.delete('/dismissed-notifications/reset', async (req, res) => {
    try {
        await prisma.notification.updateMany({ data: { isDismissed: 0 } });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.get('/audit-logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);
        const action = req.query.action || '';
        const username = req.query.username || '';
        const where = {};
        if (action) where.action = { contains: action };
        if (username) where.username = { contains: username };
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({ where, orderBy: { timestamp: 'desc' }, skip: (page - 1) * limit, take: limit }),
            prisma.auditLog.count({ where })
        ]);
        res.json({ data: logs, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.post('/audit-logs', async (req, res) => {
    const { action, details, userId, username } = req.body;
    try {
        await prisma.auditLog.create({ data: { userId: userId || 'system', username: username || 'System', action, details: details || '' } });
        res.status(201).json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.get('/whatsapp-templates', async (req, res) => {
    try {
        const templates = await prisma.whatsAppTemplate.findMany();
        res.json(templates);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.post('/whatsapp-templates', async (req, res) => {
    const { id, name, content, isActive } = req.body;
    try {
        await prisma.whatsAppTemplate.create({
            data: { id: id || require('uuid').v4(), name, content, isActive: isActive !== undefined ? isActive : 1 }
        });
        res.status(201).json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.put('/whatsapp-templates/:id', async (req, res) => {
    const { id } = req.params;
    const { name, content, isActive } = req.body;
    try {
        await prisma.whatsAppTemplate.update({ where: { id }, data: { name, content, isActive } });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

router.delete('/whatsapp-templates/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.whatsAppTemplate.delete({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'System route error');
    }
});

// Monitoring
router.get('/monitoring', async (req, res) => {
    try {
        const metrics = getMetrics();
        const dbHealth = await prisma.$queryRaw`SELECT 1 as ok`.catch(() => null);
        const [userCount, sessionCount, backupCount] = await Promise.all([
            prisma.user.count(),
            prisma.session.count(),
            prisma.backup.count(),
        ]);
        res.json({
            ...metrics,
            database: dbHealth ? 'connected' : 'disconnected',
            counts: { users: userCount, sessions: sessionCount, backups: backupCount },
            timestamp: new Date().toISOString(),
            node: process.version,
            platform: process.platform,
        });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Monitoring error');
    }
});

// Backup history
router.get('/backup-history', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await getBackupHistory(page, limit);
        res.json(result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Backup history error');
    }
});

// Create backup
router.post('/backup', async (req, res) => {
    try {
        const { backup } = await createBackup(req.user.id, req.user.username, 'manual');
        res.json(backup);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Backup error');
    }
});

module.exports = { systemRouter: router };
