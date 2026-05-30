const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../utils/db');
const rateLimit = require('express-rate-limit');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

const publicChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'طلبات كثيرة جداً، حاول بعد 15 دقيقة' }
});

router.post('/init', publicChatLimiter, async (req, res) => {
    try {
        const { name, phone } = req.body || {};
        const db = await getDb();
        const guestId = `guest_${uuidv4().split('-')[0]}`;
        const guestName = name ? `${name} - ${phone || 'بدون رقم'}` : `زائر (${guestId})`;

        const admin = await db.get("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
        if (!admin) return res.status(404).json({ error: 'No admin found' });

        const conversationId = uuidv4();
        await db.run(
            "INSERT INTO conversations (id, isGroup, name) VALUES (?, 0, ?)",
            [conversationId, guestName]
        );

        await db.run(
            "INSERT INTO conversation_members (conversationId, userId) VALUES (?, ?), (?, ?)",
            [conversationId, guestId, conversationId, admin.id]
        );

        res.json({ guestId, conversationId, guestName });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Init public chat');
    }
});

router.post('/message', publicChatLimiter, async (req, res) => {
    const { guestId, conversationId, text, guestName } = req.body;
    try {
        const db = await getDb();
        const messageId = uuidv4();
        const timestamp = new Date().toISOString();

        await db.run(
            "INSERT INTO messages (id, conversationId, senderId, senderName, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            [messageId, conversationId, guestId, guestName, text, timestamp]
        );

        const io = req.app.get('socketio');
        if (io) {
            const newMessage = { id: messageId, conversationId, senderId: guestId, senderName: guestName, content: text, timestamp };
            io.to(conversationId).emit('new_message', newMessage);

            const admin = await db.get("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
            if (admin) {
                io.to(`user_${admin.id}`).emit('new_message', newMessage);
                io.to(`user_${admin.id}`).emit('notification', {
                    id: uuidv4(), type: 'info', title: 'رسالة من زائر',
                    message: text, time: timestamp, conversationId
                });
            }
        }

        res.json({ success: true, messageId });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Public chat message');
    }
});

router.get('/messages/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    try {
        const db = await getDb();
        const messages = await db.all(
            'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
            [conversationId]
        );
        res.json(messages);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch public chat messages');
    }
});

module.exports = router;
