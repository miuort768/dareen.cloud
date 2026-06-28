const logger = require('../utils/logger');

async function initQueueSystem() {
    logger.info('Initializing queue system...');

    let redisConnected = false;
    try {
        const redis = require('../utils/redis');
        redisConnected = await redis.connect();
    } catch {
        logger.warn('Redis not available — queue system disabled');
    }

    if (!redisConnected) {
        logger.warn('Queue system disabled — notifications will be sent synchronously');
        const { setQueueEnabled: setNotifEnabled } = require('./notificationsService');
        setNotifEnabled(false);
        const { setQueueEnabled: setImageEnabled } = require('./imageService');
        setImageEnabled(false);
        return false;
    }

    try {
        const { initializeQueues } = require('./queue/queues');
        const { attachEvents } = require('./queue/events');
        const { initializeWorkers } = require('./queue/workers');
        const { initializeSchedulers } = require('./queue/scheduler');

        initializeQueues();
        attachEvents();
        initializeWorkers();
        initializeSchedulers();

        const { setQueueEnabled: setNotifEnabled } = require('./notificationsService');
        setNotifEnabled(true);

        const { setQueueEnabled: setImageEnabled } = require('./imageService');
        setImageEnabled(true);

        logger.info('Queue system initialized successfully');
        return true;
    } catch (err) {
        logger.error('Failed to initialize queue system: ' + (err.message || err));
        logger.warn('Queue system unavailable — notifications will be sent synchronously');
        const { setQueueEnabled: setNotifEnabled } = require('./notificationsService');
        setNotifEnabled(false);
        const { setQueueEnabled: setImageEnabled } = require('./imageService');
        setImageEnabled(false);
        return false;
    }
}

module.exports = { initQueueSystem };
