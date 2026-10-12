const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/prisma');
const { sendNotification } = require('../../services/notificationsService');
const { NOTIFICATIONS_TTL } = require('../../services/dashboardCache');
const cache = require('../../services/cacheService');
const { CACHE_KEYS } = require('../../constants/cacheKeys');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        const where = {};

        if (!isAdmin) {
            where.receiverId = userId;
        } else if (req.query.receiverId) {
            where.receiverId = req.query.receiverId;
        }

        // The bell polls this endpoint every 3s (incl. background tabs). Serve it
        // from cache per user so concurrent tabs dedupe; every write below
        // invalidates the affected users' keys, keeping the list near-real-time.
        const cacheKey = CACHE_KEYS.notifications.byUser(
            isAdmin && req.query.receiverId ? req.query.receiverId : userId
        );

        const notifications = await cache.wrap(cacheKey, NOTIFICATIONS_TTL, async () => {
            const rows = await prisma.notification.findMany({
                where,
                orderBy: { time: 'desc' }
            });
            return rows.map(n => ({ ...n, read: n.read === 1 }));
        });

        res.json(notifications);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch notifications');
    }
});

router.post('/broadcast', checkRole(['admin']), async (req, res) => {
    const body = req.body || {};
    try {
        const students = await prisma.student.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true },
        });

        if (students.length === 0) {
            return res.status(200).json({ count: 0 });
        }

        const time = body.time || new Date().toISOString();
        const title = body.title || 'تنبيه من الإدارة';
        const message = body.message || null;
        const type = body.type || 'info';

        await prisma.$transaction(students.map(s => prisma.notification.create({
            data: {
                id: uuidv4(),
                senderId: body.senderId || 'system',
                receiverId: s.id,
                senderName: body.senderName || null,
                title,
                message,
                type,
                time,
                read: 0,
                link: body.link || null,
            }
        })));

        students.forEach(s => {
            sendNotification({
                userId: s.id,
                title,
                body: message,
                data: { url: body.url || '/', type },
                priority: type === 'warning' ? 1 : 2,
            }).catch((err) => logger.warn('Enqueue broadcast notification failed: ' + (err.message || err)));
        });

        // Broadcast intentionally does not invalidate the per-user cache: a
        // targeted per-recipient del() would be O(N) KEYS. The NOTIFICATIONS_TTL
        // bounds the propagation delay at one TTL (defaults 6s), well within the
        // 3s bell poll cadence plus one cycle.

        res.status(201).json({ count: students.length, title, message, type });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Broadcast notification');
    }
});

router.post('/', checkRole(['admin']), async (req, res) => {
    const body = req.body;
    const id = body.id || uuidv4();
    try {
        const senderId = body.senderId || 'system';

        await prisma.notification.create({
            data: {
                id,
                senderId,
                receiverId: body.receiverId || null,
                senderName: body.senderName || null,
                title: body.title,
                message: body.message || null,
                type: body.type || 'info',
                time: body.time || new Date().toISOString(),
                read: body.read ? 1 : 0,
                conversationId: body.conversationId || null,
                link: body.link || null,
            }
        });

        if (body.receiverId) {
            sendNotification({
                userId: body.receiverId,
                title: body.title,
                body: body.message,
                data: { url: body.url || '/', type: body.type || 'info' },
                priority: body.type === 'warning' ? 1 : 2,
            }).catch((err) => logger.warn('Enqueue notification failed: ' + (err.message || err)));
        }

        // Invalidate the recipient's bell cache (and the admin's own list when it
        // differs) so the next poll is fresh immediately.
        if (body.receiverId) await cache.del(CACHE_KEYS.notifications.byUser(body.receiverId));
        if (body.receiverId !== req.user.id) await cache.del(CACHE_KEYS.notifications.byUser(req.user.id));

        const newItem = await prisma.notification.findUnique({ where: { id } });
        if (newItem) newItem.read = newItem.read === 1;
        res.status(201).json(newItem);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create notification');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const notif = await prisma.notification.findUnique({
            where: { id },
            select: { receiverId: true }
        });
        if (notif && notif.receiverId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to update this notification' });
        }

        await prisma.notification.update({
            where: { id },
            data: { read: body.read ? 1 : 0 }
        });

        // Read-toggles change badge counts; refresh the affected bell caches.
        if (notif) {
            await cache.del(CACHE_KEYS.notifications.byUser(notif.receiverId));
            if (req.user.role === 'admin' && notif.receiverId !== req.user.id) {
                await cache.del(CACHE_KEYS.notifications.byUser(req.user.id));
            }
        }

        const updated = await prisma.notification.findUnique({ where: { id } });
        if (updated) updated.read = updated.read === 1;
        res.json(updated);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update notification');
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const notif = await prisma.notification.findUnique({
            where: { id },
            select: { receiverId: true }
        });
        if (notif && notif.receiverId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to delete this notification' });
        }

        await prisma.notification.delete({ where: { id } });
        if (notif) {
            await cache.del(CACHE_KEYS.notifications.byUser(notif.receiverId));
            if (req.user.role === 'admin' && notif.receiverId !== req.user.id) {
                await cache.del(CACHE_KEYS.notifications.byUser(req.user.id));
            }
        }
        res.json({ message: 'Deleted' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete notification');
    }
});

router.delete('/', async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const targetReceiver = isAdmin ? (req.query.receiverId || userId) : userId;

    try {
        await prisma.notification.deleteMany({ where: { receiverId: targetReceiver } });
        await cache.del(CACHE_KEYS.notifications.byUser(targetReceiver));
        if (isAdmin && targetReceiver !== userId) {
            await cache.del(CACHE_KEYS.notifications.byUser(userId));
        }
        res.json({ message: 'Deleted notifications for user' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete all notifications');
    }
});

module.exports = { notificationRouter: router };
