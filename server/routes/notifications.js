const express = require('express');
const router = express.Router();

// Using req.db from middleware


// 1. Get notifications
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Users can only see their own notifications, Admins can see all if they specify receiverId
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
        const mapped = notifications.map(n => ({
            ...n,
            read: n.read === 1
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add notification
router.post('/', async (req, res) => {
    const body = req.body;
    const { v4: uuidv4 } = require('uuid');
    const id = body.id || uuidv4();
    try {
        // Validation: senderId should ideally be current user or 'system'
        const senderId = body.senderId || 'system';

        await req.db.run(
            `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, conversationId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, senderId, body.receiverId, body.senderName, body.title, body.message, body.type || 'info', body.time || new Date().toISOString(), body.read ? 1 : 0, body.conversationId || null]
        );
        const newItem = await req.db.get('SELECT * FROM notifications WHERE id = ?', [id]);
        if (newItem) {
            newItem.read = newItem.read === 1;
        }
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Mark notification as read
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        // Security: Ensure notification belongs to user
        const notif = await req.db.get('SELECT receiverId FROM notifications WHERE id = ?', [id]);
        if (notif && notif.receiverId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to update this notification' });
        }

        await req.db.run(
            `UPDATE notifications SET read = ? WHERE id = ?`,
            [body.read ? 1 : 0, id]
        );
        const updated = await req.db.get('SELECT * FROM notifications WHERE id = ?', [id]);
        if (updated) {
            updated.read = updated.read === 1;
        }
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Delete one notification
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Security check
        const notif = await req.db.get('SELECT receiverId FROM notifications WHERE id = ?', [id]);
        if (notif && notif.receiverId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to delete this notification' });
        }

        await req.db.run('DELETE FROM notifications WHERE id = ?', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete all notifications (optional filter by receiver)
router.delete('/', async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const targetReceiver = isAdmin ? (req.query.receiverId || userId) : userId;

    try {
        await req.db.run('DELETE FROM notifications WHERE receiverId = ?', [targetReceiver]);
        res.json({ message: 'Deleted notifications for user' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { notificationRouter: router };

