const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/prisma');
const { sendNotification } = require('../../services/notificationsService');

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

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { time: 'desc' }
        });
        const mapped = notifications.map(n => ({ ...n, read: n.read === 1 }));
        res.json(mapped);
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
        res.json({ message: 'Deleted notifications for user' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete all notifications');
    }
});

module.exports = { notificationRouter: router };
