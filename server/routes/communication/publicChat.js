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

// init creates a DB row per call — stricter cap stops cheap conversation-row
// flooding (storage growth + admin chat list spam).
const initLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'طلبات بدء محادثة كثيرة جداً، حاول بعد 15 دقيقة'
});

const MAX_GUEST_TEXT = 1000;
const MAX_GUEST_NAME = 60;

router.post('/init', initLimiter, async (req, res) => {
    try {
        const { name, phone } = req.body || {};
        // Input caps — every value lands in the DB and in admin notifications
        const safeName = typeof name === 'string' ? name.slice(0, MAX_GUEST_NAME) : '';
        const safePhone = typeof phone === 'string' ? phone.slice(0, 24) : '';
        const guestId = `guest_${uuidv4().split('-')[0]}`;
        const guestName = safeName ? `${safeName} - ${safePhone || 'بدون رقم'}` : `زائر (${guestId})`;

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
    // Caps — uncapped text lands 1:1 in Postgres per request (DB-flood vector)
    if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'نص الرسالة مطلوب' });
    }
    const safeText = text.slice(0, MAX_GUEST_TEXT);
    const safeGuestName = typeof guestName === 'string' ? guestName.slice(0, MAX_GUEST_NAME) : '';
    try {
        const messageId = uuidv4();
        const timestamp = new Date().toISOString();

        await prisma.message.create({
            data: {
                id: messageId, conversationId, senderId: guestId,
                senderName: safeGuestName, content: safeText, timestamp: new Date(timestamp)
            }
        });

        const io = req.app.get('socketio');
        if (io) {
            const newMessage = { id: messageId, conversationId, senderId: guestId, senderName: safeGuestName, content: safeText, timestamp };
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
                    message: safeText, time: timestamp, conversationId
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
        // Bounded read — an unbounded findMany turns any conversation into a
        // multi-MB response (bandwidth + memory amplification)
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { timestamp: 'desc' },
            take: 200,
        });
        res.json(messages.reverse());
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch public chat messages');
    }
});

module.exports = router;
