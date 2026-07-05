const os = require('os');
const { prisma } = require('../utils/prisma');
const { getAuthMode } = require('./authAccounts');
const { getAuditMode, getFallbackWrites } = require('./auditService');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const logger = require('../utils/logger');

const CRITICAL_ACTIONS = new Set([
  AUDIT_ACTIONS.ROLE_CHANGED,
  AUDIT_ACTIONS.PERMISSION_GRANTED,
  AUDIT_ACTIONS.PERMISSION_REVOKED,
  AUDIT_ACTIONS.TEACHER_DELETED,
  AUDIT_ACTIONS.STUDENT_DELETED,
  AUDIT_ACTIONS.PARENT_DELETED,
  AUDIT_ACTIONS.USER_DELETED,
  AUDIT_ACTIONS.ACCOUNT_CUTOVER,
  AUDIT_ACTIONS.REFUND_PROCESSED,
  AUDIT_ACTIONS.INVOICE_PAID,
]);

const LOGIN_ACTIONS = [AUDIT_ACTIONS.LOGIN_SUCCESS, AUDIT_ACTIONS.LOGIN_FAILED];

async function getSystemStats() {
  const mem = process.memoryUsage();
  return {
    uptime: process.uptime(),
    memory: {
      usedMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    cpu: {
      loadAvg1: os.loadavg()[0],
      loadAvg5: os.loadavg()[1],
      loadAvg15: os.loadavg()[2],
      cpus: os.cpus().length,
    },
    platform: os.platform(),
    hostname: os.hostname(),
  };
}

async function getEventLoopDelay() {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setTimeout(() => {
      const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
      resolve(Math.max(0, Math.round(elapsed - 100)));
    }, 100);
  });
}

async function getAuthStats() {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    const [success24h, failed24h, todaySuccess] = await Promise.all([
      prisma.auditLog.count({
        where: { action: AUDIT_ACTIONS.LOGIN_SUCCESS, timestamp: { gte: twentyFourHoursAgo } },
      }),
      prisma.auditLog.count({
        where: { action: AUDIT_ACTIONS.LOGIN_FAILED, timestamp: { gte: twentyFourHoursAgo } },
      }),
      prisma.auditLog.count({
        where: { action: AUDIT_ACTIONS.LOGIN_SUCCESS, timestamp: { gte: todayStart } },
      }),
    ]);

    return { success24h, failed24h, todaySuccess };
  } catch (err) {
    logger.warn('Failed to fetch auth stats for monitoring', err);
    return { success24h: -1, failed24h: -1, todaySuccess: -1 };
  }
}

async function getAuditStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    const [today, critical, lastError] = await Promise.all([
      prisma.auditLog.count({ where: { timestamp: { gte: todayStart } } }),
      prisma.auditLog.count({
        where: { action: { in: [...CRITICAL_ACTIONS] }, timestamp: { gte: todayStart } },
      }),
      prisma.auditLog.findFirst({
        where: { status: 'ERROR' },
        orderBy: { timestamp: 'desc' },
        select: { action: true, details: true, timestamp: true, username: true },
      }),
    ]);

    return { today, critical, lastError: lastError || null };
  } catch (err) {
    logger.warn('Failed to fetch audit stats for monitoring', err);
    return { today: -1, critical: -1, lastError: null };
  }
}

async function getQueueStatus() {
  let redisAvailable = false;
  try {
    const redis = require('../utils/redis');
    redisAvailable = redis.status() === 'connected';
  } catch {
    return { available: false, reason: 'Redis module not available' };
  }

  if (!redisAvailable) {
    return { available: false, reason: 'Redis not connected' };
  }

  try {
    const { getQueues } = require('./queue/queues');
    const queues = getQueues();
    const status = {};
    let activeCount = 0;
    let waitingCount = 0;
    let failedCount = 0;

    for (const [name, queue] of Object.entries(queues)) {
      try {
        const counts = await queue.getJobCounts();
        status[name] = {
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
          delayed: counts.delayed || 0,
        };
        activeCount += counts.active || 0;
        waitingCount += counts.waiting || 0;
        failedCount += counts.failed || 0;
      } catch (e) {
        status[name] = { error: e.message };
      }
    }

    return { available: true, queues: status, totals: { active: activeCount, waiting: waitingCount, failed: failedCount } };
  } catch (err) {
    return { available: false, reason: 'Queue system error: ' + (err.message || err) };
  }
}

async function getAuditQueueStatus() {
  if (getAuditMode() !== 'queue') {
    return { mode: 'direct' };
  }
  try {
    const redis = require('../utils/redis');
    if (redis.status() !== 'connected') {
      return { mode: 'queue', available: false, reason: 'Redis not connected' };
    }
    const [counts, batchMetrics] = await Promise.all([
      require('../queue/auditQueue').getStatus(),
      require('../queue/auditWorker').getMetrics().catch(() => ({})),
    ]);
    const deadLetters = counts.failed || 0;
    let health;
    if (deadLetters === 0) health = 'healthy';
    else if (deadLetters < 10) health = 'degraded';
    else health = 'critical';
    return {
      mode: 'queue',
      available: true,
      health,
      ...counts,
      batch: {
        flushes: batchMetrics.flushes || 0,
        entries: batchMetrics.entries || 0,
        averageBatchSize: batchMetrics.averageBatchSize || 0,
        errors: batchMetrics.errors || 0,
      },
      fallbackWrites: getFallbackWrites(),
    };
  } catch (err) {
    return { mode: 'queue', available: false, reason: err.message };
  }
}

function getFeatureFlags() {
  return {
    authMode: getAuthMode(),
    auditMode: getAuditMode(),
    passwordResetEnabled: true,
    queueEnabled: false,
  };
}

function getRequestMetrics() {
  try {
    const monitoring = require('../middleware/monitoring');
    const metrics = monitoring.getMetrics();
    return {
      total: metrics.total,
      byMethod: metrics.byMethod,
      byPath: metrics.byPath,
      slowCount: metrics.slow?.length || 0,
      errors: metrics.errors || 0,
    };
  } catch {
    return { total: 0, slowCount: 0, errors: 0 };
  }
}

async function getCacheMetrics() {
  try {
    const cacheService = require('./cacheService');
    return cacheService.getMetrics();
  } catch {
    return { mode: 'off' };
  }
}

async function getOverview() {
  const timeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);

  const [system, eventLoopDelay, auth, audit, queue, auditQueue, cache, requestMetrics] = await Promise.all([
    getSystemStats(),
    timeout(getEventLoopDelay(), 1000).catch(() => -1),
    getAuthStats(),
    getAuditStats(),
    timeout(getQueueStatus(), 3000).catch(() => ({ available: false, reason: 'timeout' })),
    timeout(getAuditQueueStatus(), 2000).catch(() => ({ mode: 'direct' })),
    timeout(getCacheMetrics(), 1000).catch(() => ({ mode: 'off' })),
    getRequestMetrics(),
  ]);

  return {
    timestamp: new Date().toISOString(),
    system: {
      ...system,
      eventLoopDelay,
    },
    auth,
    audit,
    queue,
    auditQueue,
    cache,
    requestMetrics,
    featureFlags: getFeatureFlags(),
  };
}

module.exports = { getOverview, getSystemStats, getEventLoopDelay, getAuthStats, getAuditStats, getQueueStatus, getAuditQueueStatus, getFeatureFlags };
