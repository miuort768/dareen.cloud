const { createWorker } = require('./index');
const { getQueues, QUEUE_NAMES } = require('./queues');
const logger = require('../../utils/logger');

const webpush = require('web-push');
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@dareen.cloud',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

let workers = [];

function initializeWorkers() {
    const queues = getQueues();

    const notificationWorker = createWorker(QUEUE_NAMES.NOTIFICATIONS, async (job) => {
        const { type, userId, title, body, data } = job.data;

        if (!userId || !title) {
            throw new Error('Invalid notification job: userId and title are required');
        }

        logger.info('Processing notification job ' + job.id + ' for user ' + userId + ': ' + title);

        const { prisma } = require('../../utils/prisma');

        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            logger.info('No push subscriptions for user ' + userId + ', skipping push');
            return { userId, title, pushSent: false, reason: 'no_subscriptions' };
        }

        const payload = JSON.stringify({ title, body, url: data?.url || '/' });
        let sent = 0;
        let failed = 0;

        const results = await Promise.allSettled(
            subscriptions.map((sub) => {
                const subscription = JSON.parse(sub.subscription);
                return webpush.sendNotification(subscription, payload);
            })
        );

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const sub = subscriptions[i];
            if (result.status === 'fulfilled') {
                sent++;
            } else {
                failed++;
                const err = result.reason;
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
                    logger.info('Removed expired subscription ' + sub.id + ' for user ' + userId);
                }
            }
        }

        logger.info('Push sent for user ' + userId + ': ' + sent + ' sent, ' + failed + ' failed');
        return { userId, title, pushSent: true, sent, failed };
    }, {
        concurrency: 10,
    });

    notificationWorker.on('completed', (job) => {
        logger.info('Notification job ' + job.id + ' completed for user ' + (job.data?.userId || '?'));
    });

    notificationWorker.on('failed', async (job, err) => {
        logger.error('Notification job ' + (job?.id || '?') + ' failed: ' + err.message);
        if (job && job.attemptsMade >= (job.opts?.attempts || 3)) {
            try {
                const queues = getQueues();
                await queues.failedNotifications.add(job.name + '_failed', {
                    originalJobId: job.id,
                    originalData: job.data,
                    error: err.message,
                    failedAt: new Date().toISOString(),
                });
                logger.info('Moved failed notification job ' + job.id + ' to DLQ');
            } catch (dlqErr) {
                logger.error('Failed to move job to DLQ: ' + (dlqErr.message || dlqErr));
            }
        }
    });

    workers.push(notificationWorker);

    const cleanupWorkerInit = require('./cleanupWorker');
    const cleanupWorker = cleanupWorkerInit.initialize();
    workers.push(cleanupWorker);

    const imageWorkerInit = require('./imageWorker');
    const imageWorker = imageWorkerInit.initialize();
    workers.push(imageWorker);

    logger.info('Workers initialized: ' + QUEUE_NAMES.NOTIFICATIONS + ', ' + QUEUE_NAMES.CLEANUP + ', ' + QUEUE_NAMES.IMAGES);

    return workers;
}

function getWorkers() {
    return workers;
}

async function shutdownWorkers() {
    for (const w of workers) {
        await w.close();
    }
    workers = [];
}

module.exports = { initializeWorkers, getWorkers, shutdownWorkers };
