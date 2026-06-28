const path = require('path');
const logger = require('../utils/logger');

const UPLOAD_BASE = path.join(__dirname, '..', '..', 'public', 'uploads');

let imageQueue = null;
let queueEnabled = false;

function getQueue() {
    if (queueEnabled && imageQueue) return imageQueue;
    if (queueEnabled) {
        try {
            const { getQueues } = require('./queue/queues');
            imageQueue = getQueues().images;
        } catch (err) {
            logger.warn('Image queue not available: ' + (err.message || err));
            queueEnabled = false;
        }
    }
    return queueEnabled ? imageQueue : null;
}

function setQueueEnabled(enabled) {
    queueEnabled = enabled;
    if (!enabled) imageQueue = null;
}

async function processImage({ filePath, filename, originalName, mimeType, uploadDir, options }) {
    if (!filePath || !filename) {
        throw new Error('filePath and filename are required');
    }

    const queue = getQueue();
    if (queue) {
        try {
            const job = await queue.add('image:process', {
                filePath,
                filename,
                originalName,
                mimeType,
                uploadDir: uploadDir || path.dirname(filePath),
                options: options || {},
            }, {
                priority: 2,
            });
            logger.debug('Enqueued image job ' + job.id + ' for ' + filename);
            return { jobId: job.id, queued: true, filename };
        } catch (err) {
            logger.warn('Queue add failed for image, processing synchronously: ' + (err.message || err));
        }
    }

    logger.info('Processing image synchronously: ' + filename);
    const { ImageWorker } = require('./queue/imageWorker');
    const worker = new ImageWorker();
    const result = await worker.process({
        data: { filePath, filename, originalName, mimeType, uploadDir: uploadDir || path.dirname(filePath), options: options || {} },
    });
    return { jobId: null, queued: false, result };
}

async function getJobResult(jobId) {
    if (!jobId) return null;
    const queue = getQueue();
    if (!queue) return null;
    try {
        const job = await queue.getJob(jobId);
        if (!job) return null;
        const state = await job.getState();
        return { jobId, state, result: job.returnvalue || null, failedReason: job.failedReason || null };
    } catch {
        return null;
    }
}

module.exports = { processImage, getJobResult, setQueueEnabled, UPLOAD_BASE };
