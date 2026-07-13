const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { sanitizeInput } = require('../../middleware/advanced');
const { prisma } = require('../../utils/prisma');
const { createRateLimiter } = require('../../middleware/rateLimiter');

router.use(sanitizeInput);

const publicChatLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'طلبات كثيرة جداً، حاول بعد 15 دقيقة'
});

router.post('/init', publicChatLimiter, async (req, res) => {
    try {
        const { name, phone } = req.body || {};
        const guestId = `guest_${uuidv4().split('-')[0]}`;
        const guestName = name ? `${name} - ${phone || 'بدون رقم'}` : `زائر (${guestId})`;

        const admin = await prisma.user.findFirst({
            where: { role: 'admin' },
            orderBy: { id: 'asc' },
            select: { id: true }
        });
        if (!admin) return res.status(404).json({ error: 'No admin found' });

        const conversationId = uuidv4();
        await prisma.conversation.create({
            data: {
                id: conversationId,
                isGroup: 0,
                name: guestName,
                members: {
                    create: [
                        { userId: guestId },
                        { userId: admin.id }
                    ]
                }
            }
        });

        res.json({ guestId, conversationId, guestName });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Init public chat');
    }
});

router.post('/message', publicChatLimiter, async (req, res) => {
    const { guestId, conversationId, text, guestName } = req.body;
    try {
        const messageId = uuidv4();
        const timestamp = new Date().toISOString();

        await prisma.message.create({
            data: {
                id: messageId, conversationId, senderId: guestId,
                senderName: guestName, content: text, timestamp: new Date(timestamp)
            }
        });

        const io = req.app.get('socketio');
        if (io) {
            const newMessage = { id: messageId, conversationId, senderId: guestId, senderName: guestName, content: text, timestamp };
            io.to(conversationId).emit('new_message', newMessage);

            const admin = await prisma.user.findFirst({
                where: { role: 'admin' },
                orderBy: { id: 'asc' },
                select: { id: true }
            });
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
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { timestamp: 'asc' }
        });
        res.json(messages);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch public chat messages');
    }
});

module.exports = router;
