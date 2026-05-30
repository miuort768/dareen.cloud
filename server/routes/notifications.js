const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        let query = 'SELECT * FROM notifications';
        const params = [];

        if (!isAdmin) {
            query += ' WHERE receiverId = ?';
            params.push(userId);
        } else if (req.query.receiverId) {
            query += ' WHERE receiverId = ?';
            params.push(req.query.receiverId);
        }

        query += ' ORDER BY time DESC';

        const notifications = await req.db.all(query, params);
        const mapped = notifications.map(n => ({ ...n, read: n.read === 1 }));
        res.json(mapped);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch notifications');
    }
});

router.post('/', checkRole(['admin']), async (req, res) => {
    const body = req.body;
    const id = body.id || uuidv4();
    try {
        const senderId = body.senderId || 'system';

        await req.db.run(
            `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, conversationId, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, senderId, body.receiverId, body.senderName, body.title, body.message, body.type || 'info', body.time || new Date().toISOString(), body.read ? 1 : 0, body.conversationId || null, body.link || null]
        );

        if (req.sendPushToUser && body.receiverId) {
            req.sendPushToUser(req.db, body.receiverId, body.title, body.message, body.url || '/');
        }

        const newItem = await req.db.get('SELECT * FROM notifications WHERE id = ?', [id]);
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
        const notif = await req.db.get('SELECT receiverId FROM notifications WHERE id = ?', [id]);
        if (notif && notif.receiverId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to update this notification' });
        }

        await req.db.run('UPDATE notifications SET read = ? WHERE id = ?', [body.read ? 1 : 0, id]);
        const updated = await req.db.get('SELECT * FROM notifications WHERE id = ?', [id]);
        if (updated) updated.read = updated.read === 1;
        res.json(updated);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update notification');
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const notif = await req.db.get('SELECT receiverId FROM notifications WHERE id = ?', [id]);
        if (notif && notif.receiverId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to delete this notification' });
        }

        await req.db.run('DELETE FROM notifications WHERE id = ?', [id]);
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
        await req.db.run('DELETE FROM notifications WHERE receiverId = ?', [targetReceiver]);
        res.json({ message: 'Deleted notifications for user' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete all notifications');
    }
});

module.exports = { notificationRouter: router };
