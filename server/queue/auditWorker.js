const { Worker } = require('bullmq');
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

const QUEUE_NAME = 'audit';
const BATCH_SIZE = 25;
const FLUSH_INTERVAL_MS = 100;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let buffer = [];
let pending = [];
let timer = null;
let worker = null;

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

async function flush() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  const resolvers = pending.splice(0);
  try {
    await prisma.auditLog.createMany({ data: batch });
    resolvers.forEach(r => r.resolve());
  } catch (err) {
    logger.error('Audit batch write failed (' + batch.length + ' entries): ' + (err?.message || err));
    resolvers.forEach(r => r.reject(err));
  }
}

function startFlushTimer() {
  if (timer) return;
  timer = setInterval(flush, FLUSH_INTERVAL_MS);
}

function stopFlushTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function addToBuffer(data) {
  return new Promise((resolve, reject) => {
    buffer.push(data);
    pending.push({ resolve, reject });
    if (buffer.length >= BATCH_SIZE) {
      flush();
    }
  });
}

async function processor(job) {
  startFlushTimer();
  await addToBuffer(job.data);
}

async function handleFailed(job, err) {
  if (job && job.attemptsMade >= (job.opts?.attempts || 5)) {
    try {
      const { getQueue } = require('./auditQueue');
      const q = getQueue();
      await q.add('audit:dead', {
        originalJobId: job.id,
        data: job.data,
        error: err.message,
        failedAt: new Date().toISOString(),
      });
    } catch (dlqErr) {
      logger.error('Audit DLQ write failed: ' + (dlqErr?.message || dlqErr));
    }
  }
}

function start() {
  if (worker) return worker;
  worker = new Worker(QUEUE_NAME, processor, {
    connection: getConnection(),
    concurrency: 5,
    lockDuration: 30000,
  });
  worker.on('completed', (job) => {
    logger.debug('Audit job ' + job.id + ' completed');
  });
  worker.on('failed', handleFailed);
  worker.on('error', (err) => {
    logger.error('Audit worker error: ' + (err?.message || err));
  });
  logger.info('Audit worker started (batch size=' + BATCH_SIZE + ', flush interval=' + FLUSH_INTERVAL_MS + 'ms)');
  return worker;
}

async function stop() {
  stopFlushTimer();
  await flush();
  if (worker) {
    await worker.close();
    worker = null;
  }
}

module.exports = { start, stop, flush };
