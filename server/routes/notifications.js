const express = require('express');
const router = express.Router();

// Using req.db from middleware


// 1. Get notifications
router.get('/', async (req, res) => {
    try {
        const { receiverId } = req.query;
        let query = 'SELECT * FROM notifications';
        const params = [];

        if (receiverId) {
            query += ' WHERE receiverId = ?';
            params.push(receiverId);
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
        await req.db.run(
            `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, body.senderId, body.receiverId, body.senderName, body.title, body.message, body.type || 'info', body.time || new Date().toISOString(), body.read ? 1 : 0]
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
        await req.db.run('DELETE FROM notifications WHERE id = ?', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete all notifications (optional filter by receiver)
router.delete('/', async (req, res) => {
    const { receiverId } = req.query;
    try {
        if (receiverId) {
            await req.db.run('DELETE FROM notifications WHERE receiverId = ?', [receiverId]);
        } else {
            await req.db.run('DELETE FROM notifications');
        }
        res.json({ message: 'Deleted all' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { notificationRouter: router };

