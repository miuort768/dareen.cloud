const { getQueues } = require('./queues');
const logger = require('../../utils/logger');

function attachEvents() {
    const queues = getQueues();

    for (const [name, queue] of Object.entries(queues)) {
        queue.on('waiting', (jobId) => {
            logger.debug('Queue ' + name + ': job ' + jobId + ' is waiting');
        });

        queue.on('active', (job) => {
            logger.debug('Queue ' + name + ': job ' + (job?.id || '?') + ' started');
        });

        queue.on('completed', (job) => {
            logger.info('Queue ' + name + ': job ' + (job?.id || '?') + ' completed');
        });

        queue.on('failed', (job, err) => {
            logger.error('Queue ' + name + ': job ' + (job?.id || '?') + ' failed: ' + (err?.message || err));
        });

        queue.on('stalled', (jobId) => {
            logger.warn('Queue ' + name + ': job ' + jobId + ' stalled (will be retried)');
        });

        queue.on('error', (err) => {
            logger.error('Queue ' + name + ' error: ' + (err?.message || err));
        });

        logger.debug('Events attached to queue: ' + name);
    }

    logger.info('Queue event listeners registered');
}

module.exports = { attachEvents };
