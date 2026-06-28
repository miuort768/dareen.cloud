const { Queue: BullQueue, Worker, QueueScheduler } = require('bullmq');
const logger = require('../../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let connection = null;

function getConnection() {
    if (connection) return connection;
    connection = { host: 'localhost', port: 6379 };
    try {
        const url = new URL(REDIS_URL);
        connection = {
            host: url.hostname || 'localhost',
            port: parseInt(url.port, 10) || 6379,
            password: url.password ? decodeURIComponent(url.password) : undefined,
        };
    } catch { /* use default */ }
    return connection;
}

function createQueue(name, opts = {}) {
    return new BullQueue(name, {
        connection: getConnection(),
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 100, age: 86400 },
            removeOnFail: { count: 50, age: 604800 },
            ...opts.defaultJobOptions,
        },
        ...opts,
    });
}

function createWorker(name, processor, opts = {}) {
    const worker = new Worker(name, processor, {
        connection: getConnection(),
        concurrency: opts.concurrency || 5,
        ...opts,
    });
    return worker;
}

async function shutdown() {
    const { queues } = require('./queues');
    for (const q of Object.values(queues)) {
        await q.close();
    }
    if (connection && typeof connection.disconnect === 'function') {
        connection.disconnect();
    }
}

module.exports = { getConnection, createQueue, createWorker, shutdown };
