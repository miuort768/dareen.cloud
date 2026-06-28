const logger = require('../utils/logger');

let notificationQueue = null;
let queueEnabled = false;

function getQueue() {
    if (queueEnabled && notificationQueue) return notificationQueue;
    if (queueEnabled) {
        try {
            const { getQueues } = require('./queue/queues');
            notificationQueue = getQueues().notifications;
        } catch (err) {
            logger.warn('Notification queue not available: ' + (err.message || err));
            queueEnabled = false;
        }
    }
    return queueEnabled ? notificationQueue : null;
}

function setQueueEnabled(enabled) {
    queueEnabled = enabled;
    if (!enabled) notificationQueue = null;
}

async function sendDirectPush(userId, title, body, data) {
    try {
        const webpush = require('web-push');
        const { prisma } = require('../utils/prisma');

        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
                'mailto:admin@dareen.cloud',
                process.env.VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            );
        }

        const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
        if (subscriptions.length === 0) return;

        const payload = JSON.stringify({
            title, body: body || '', url: data?.url || '/'
        });

        await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    const subscription = JSON.parse(sub.subscription);
                    await webpush.sendNotification(subscription, payload);
                } catch (err) {
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
                    }
                }
            })
        );
    } catch (err) {
        logger.warn('Direct push fallback failed for user ' + userId + ': ' + (err.message || err));
    }
}

async function sendNotification({ userId, title, body, data, priority }) {
    const queue = getQueue();
    if (queue) {
        try {
            const job = await queue.add(
                'notification:' + (data?.type || 'push'),
                { type: data?.type || 'push', userId, title, body: body || '', data: data || {} },
                { priority: priority || 2 }
            );
            return job;
        } catch (err) {
            logger.warn('Queue add failed, falling back to direct push: ' + (err.message || err));
        }
    }
    await sendDirectPush(userId, title, body, data);
    return null;
}

async function sendBulkNotification({ userIds, title, body, data, priority }) {
    const queue = getQueue();
    if (queue) {
        try {
            const jobs = await Promise.all(
                userIds.map((userId) =>
                    queue.add(
                        'notification:' + (data?.type || 'push'),
                        { type: data?.type || 'push', userId, title, body: body || '', data: data || {} },
                        { priority: priority || 2 }
                    )
                )
            );
            return jobs;
        } catch (err) {
            logger.warn('Bulk queue add failed, falling back to direct push: ' + (err.message || err));
        }
    }
    await Promise.all(userIds.map((userId) => sendDirectPush(userId, title, body, data)));
    return [];
}

module.exports = { sendNotification, sendBulkNotification, setQueueEnabled };
