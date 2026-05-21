const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../utils/db');
const rateLimit = require('express-rate-limit');

const publicChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'طلبات كثيرة جداً، حاول بعد 15 دقيقة' }
});

// POST /api/public-chat/init
// Initializes a guest conversation with the main admin
router.post('/init', publicChatLimiter, async (req, res) => {
    try {
        const { name, phone } = req.body || {};
        const db = await getDb();
        const guestId = `guest_${uuidv4().split('-')[0]}`;
        const guestName = name ? `${name} - ${phone || 'بدون رقم'}` : `زائر (${guestId})`;
        
        // Find main admin
        const admin = await db.get("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
        if (!admin) return res.status(404).json({ error: 'No admin found' });

        const conversationId = uuidv4();
        await db.run(
            "INSERT INTO conversations (id, isGroup, name) VALUES (?, 0, ?)",
            [conversationId, guestName]
        );
        
        // Add guest and admin using camelCase columns from db_setup.js
        await db.run(
            "INSERT INTO conversation_members (conversationId, userId) VALUES (?, ?), (?, ?)",
            [conversationId, guestId, conversationId, admin.id]
        );
        
        res.json({ guestId, conversationId, guestName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/public-chat/message
router.post('/message', publicChatLimiter, async (req, res) => {
    const { guestId, conversationId, text, guestName } = req.body;
    try {
        const db = await getDb();
        const messageId = uuidv4();
        const timestamp = new Date().toISOString();

        // Save message using camelCase columns: content instead of text
        await db.run(
            "INSERT INTO messages (id, conversationId, senderId, senderName, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            [messageId, conversationId, guestId, guestName, text, timestamp]
        );

        // Broadcast via socket.io
        const io = req.app.get('socketio');
        if (io) {
            const newMessage = {
                id: messageId,
                conversationId,
                senderId: guestId,
                senderName: guestName,
                content: text,
                timestamp
            };
            
            // Emit to conversation room
            io.to(conversationId).emit('new_message', newMessage);
            
            // Also notify admin room specifically
            const admin = await db.get("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
            if (admin) {
                // Sidebar update for admin
                io.to(`user_${admin.id}`).emit('new_message', newMessage);
                
                // Generic notification
                io.to(`user_${admin.id}`).emit('notification', {
                    id: uuidv4(),
                    type: 'info',
                    title: `رسالة من زائر`,
                    message: text,
                    time: timestamp,
                    conversationId
                });
            }
        }

        res.json({ success: true, messageId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/public-chat/messages/:conversationId
router.get('/messages/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    try {
        const db = await getDb();
        // Use content instead of text
        const messages = await db.all(
            `SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC`,
            [conversationId]
        );
        
        // Map content to text for frontend if needed, but I'll update ChatbotWidget to use content
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
