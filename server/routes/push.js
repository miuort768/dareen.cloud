const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const { authMiddleware, checkRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const ResponseHandler = require('../utils/responseHandler');
const { prisma } = require('../utils/prisma');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@dareen.cloud',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

router.post('/subscribe', authMiddleware, async (req, res) => {
    try {
        const { subscription, deviceType } = req.body;
        const userId = req.user.id;

        if (!subscription) {
            return res.status(400).json({ error: 'Subscription is required' });
        }

        const subJson = JSON.stringify(subscription);
        const existing = await prisma.pushSubscription.findFirst({
            where: { userId, subscription: subJson }
        });

        if (!existing) {
            await prisma.pushSubscription.create({
                data: { userId, subscription: subJson, deviceType: deviceType || 'unknown' }
            });
        }

        res.status(201).json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Push subscribe');
    }
});

async function sendPushToUser(db, userId, title, message, url = '/') {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        const payload = JSON.stringify({ title, body: message, url });

        const sendPromises = subscriptions.map(sub => {
            const pushConfig = JSON.parse(sub.subscription);
            return webpush.sendNotification(pushConfig, payload).catch(err => {
                logger.error(`Push error for ${err.endpoint}: ${err.message}`);
                if (err.statusCode === 404 || err.statusCode === 410) {
                    prisma.pushSubscription.deleteMany({ where: { subscription: sub.subscription } });
                }
            });
        });

        await Promise.all(sendPromises);
    } catch (err) {
        logger.error('sendPushToUser error:', err.message);
    }
}

router.post('/notify-student-parent', authMiddleware, async (req, res) => {
    try {
        const { studentId, title, body } = req.body;
        if (!studentId) return res.status(400).json({ error: 'studentId required' });

        const parents = await prisma.parent.findMany();
        let notified = 0;
        for (const parent of parents) {
            let children = [];
            try { children = JSON.parse(parent.children || '[]'); } catch { children = []; }
            if (children.includes(studentId)) {
                await sendPushToUser(null, parent.id, title || 'بدأت الحصة', body || 'بدأت حصة جديدة لطفلك', '/');
                notified++;
            }
        }
        res.json({ success: true, notified });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Notify student parent');
    }
});

module.exports = { pushRouter: router, sendPushToUser };
