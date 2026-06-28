const { createQueue } = require('./index');
const logger = require('../../utils/logger');

const QUEUE_NAMES = {
    NOTIFICATIONS: 'notifications',
    FAILED_NOTIFICATIONS: 'failed-notifications',
    CLEANUP: 'cleanup',
    IMAGES: 'images',
    FAILED_IMAGES: 'failed-images',
};

const PRIORITY = {
    HIGH: 1,
    NORMAL: 2,
    LOW: 3,
};

let queues = {};

function initializeQueues() {
    queues.notifications = createQueue(QUEUE_NAMES.NOTIFICATIONS, {
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 100, age: 86400 },
            removeOnFail: false,
        },
    });

    queues.images = createQueue(QUEUE_NAMES.IMAGES, {
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 200, age: 86400 },
            removeOnFail: false,
        },
    });

    queues.failedImages = createQueue(QUEUE_NAMES.FAILED_IMAGES, {
        defaultJobOptions: {
            attempts: 1,
            removeOnComplete: { count: 1000, age: 604800 },
            removeOnFail: { count: 1000, age: 2592000 },
        },
    });

    queues.failedNotifications = createQueue(QUEUE_NAMES.FAILED_NOTIFICATIONS, {
        defaultJobOptions: {
            attempts: 1,
            removeOnComplete: { count: 1000, age: 604800 },
            removeOnFail: { count: 1000, age: 2592000 },
        },
    });

    logger.info('Queues initialized: ' + Object.keys(queues).join(', '));
    return queues;
}

function getQueues() {
    if (Object.keys(queues).length === 0) {
        initializeQueues();
    }
    return queues;
}

module.exports = { initializeQueues, getQueues, QUEUE_NAMES, PRIORITY };
