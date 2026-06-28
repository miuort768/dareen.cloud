const logger = require('../../utils/logger');

let schedulers = [];
let cleanupInterval = null;

function initializeSchedulers() {
    logger.info('Initializing scheduled jobs...');

    const { getQueues, QUEUE_NAMES } = require('./queues');
    const queues = getQueues();

    const RUN_INTERVAL_MS = parseInt(process.env.CLEANUP_INTERVAL_MS, 10) || 3600000;

    const addCleanupJob = async () => {
        try {
            await queues.cleanup.add('cleanup:periodic', {
                tasks: ['active_sessions', 'temp_uploads', 'push_subscriptions', 'old_notifications'],
                dryRun: process.env.CLEANUP_DRY_RUN === 'true',
                config: {
                    sessionMaxAgeHours: parseInt(process.env.CLEANUP_SESSION_MAX_AGE_HOURS, 10) || 24,
                    tempFileMaxAgeHours: parseInt(process.env.CLEANUP_TEMP_MAX_AGE_HOURS, 10) || 24,
                    notificationRetentionDays: parseInt(process.env.CLEANUP_NOTIFICATION_RETENTION_DAYS, 10) || 30,
                },
            }, {
                priority: 3,
            });
        } catch (err) {
            logger.error('Failed to schedule cleanup job: ' + (err.message || err));
        }
    };

    cleanupInterval = setInterval(addCleanupJob, RUN_INTERVAL_MS);

    addCleanupJob();

    schedulers.push({ name: 'cleanup', interval: RUN_INTERVAL_MS });
    logger.info('Scheduled cleanup job every ' + (RUN_INTERVAL_MS / 60000) + ' minutes');

    return schedulers;
}

async function shutdownSchedulers() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
    schedulers = [];
}

module.exports = { initializeSchedulers, shutdownSchedulers };
