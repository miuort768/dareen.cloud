const { Queue: BullQueue } = require('bullmq');
const logger = require('../utils/logger');

const QUEUE_NAME = 'audit';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let queue = null;

function getConnection() {
  let conn = { host: 'localhost', port: 6379 };
  try {
    const url = new URL(REDIS_URL);
    conn = {
      host: url.hostname || 'localhost',
      port: parseInt(url.port, 10) || 6379,
      password: url.password ? decodeURIComponent(url.password) : undefined,
    };
  } catch { }
  return conn;
}

function getQueue() {
  if (!queue) {
    queue = new BullQueue(QUEUE_NAME, {
      connection: getConnection(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 5000, age: 86400 },
        removeOnFail: { count: 500, age: 604800 },
      },
    });

    queue.on('error', (err) => {
      logger.error('Audit queue error: ' + (err?.message || err));
    });
  }
  return queue;
}

async function enqueue(payload) {
  const q = getQueue();
  return q.add('audit:entry', payload);
}

async function getStatus() {
  try {
    const q = getQueue();
    const counts = await q.getJobCounts();
    return {
      waiting: counts.waiting || 0,
      active: counts.active || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: counts.delayed || 0,
    };
  } catch {
    return { waiting: -1, active: -1, completed: -1, failed: -1, delayed: -1 };
  }
}

async function close() {
  if (queue) {
    await queue.close();
    queue = null;
  }
}

module.exports = { getQueue, enqueue, getStatus, close, QUEUE_NAME };
