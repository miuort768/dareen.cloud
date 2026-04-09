const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// Configuration - Should be in .env in production
// If not provided, the system will still work locally but won't send real push
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BFM-tXp9_QW4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'example-private-key';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@dareen.cloud',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// 1. Save subscription
router.post('/subscribe', async (req, res) => {
    try {
        const { subscription, deviceType } = req.body;
        const userId = req.user.id;

        if (!subscription) {
            return res.status(400).json({ error: 'Subscription is required' });
        }

        // Check if subscription already exists for this user to avoid duplicates
        const subJson = JSON.stringify(subscription);
        const existing = await req.db.get(
            'SELECT id FROM push_subscriptions WHERE userId = ? AND subscription = ?',
            [userId, subJson]
        );

        if (!existing) {
            await req.db.run(
                'INSERT INTO push_subscriptions (userId, subscription, deviceType) VALUES (?, ?, ?)',
                [userId, subJson, deviceType || 'unknown']
            );
        }

        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Push subscribe error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Helper to send push to a user
async function sendPushToUser(db, userId, title, message, url = '/') {
    try {
        const subscriptions = await db.all(
            'SELECT subscription FROM push_subscriptions WHERE userId = ?',
            [userId]
        );

        const payload = JSON.stringify({
            title,
            body: message,
            url
        });

        const sendPromises = subscriptions.map(sub => {
            const pushConfig = JSON.parse(sub.subscription);
            return webpush.sendNotification(pushConfig, payload).catch(err => {
                console.error('Push error for sub:', err.endpoint, err.message);
                // If 404 or 410, subscription is no longer valid, delete it
                if (err.statusCode === 404 || err.statusCode === 410) {
                    db.run('DELETE FROM push_subscriptions WHERE subscription = ?', [sub.subscription]);
                }
            });
        });

        await Promise.all(sendPromises);
    } catch (err) {
        console.error('sendPushToUser error:', err);
    }
}

module.exports = { pushRouter: router, sendPushToUser };
