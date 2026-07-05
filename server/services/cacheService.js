const memoryAdapter = require('../cache/memoryAdapter');
const redisAdapter = require('../cache/redisAdapter');
const logger = require('../utils/logger');

const pending = new Map();
let sets = 0;
let deletes = 0;
let invalidations = 0;
let loadTimes = [];

function getMode() {
  return (process.env.CACHE_MODE || 'off').toLowerCase();
}

function getAdapter() {
  switch (getMode()) {
    case 'memory':
      return memoryAdapter;
    case 'redis':
      return redisAdapter;
    default:
      return null;
  }
}

async function get(key) {
  const adapter = getAdapter();
  if (!adapter) return undefined;
  return adapter.get(key);
}

async function set(key, value, ttl) {
  const adapter = getAdapter();
  if (!adapter) return;
  sets++;
  return adapter.set(key, value, ttl);
}

async function del(key) {
  const adapter = getAdapter();
  if (!adapter) return;
  deletes++;
  return adapter.del(key);
}

async function wrap(key, ttl, loader) {
  const adapter = getAdapter();
  if (!adapter) return loader();

  const cached = await adapter.get(key);
  if (cached !== undefined) return cached;

  if (pending.has(key)) {
    return pending.get(key);
  }

  const start = Date.now();
  const promise = loader().then(async (value) => {
    loadTimes.push(Date.now() - start);
    if (loadTimes.length > 1000) loadTimes.shift();
    if (value !== undefined) {
      sets++;
      await adapter.set(key, value, ttl);
    }
    pending.delete(key);
    return value;
  }).catch((err) => {
    pending.delete(key);
    throw err;
  });

  pending.set(key, promise);
  return promise;
}

async function invalidate(pattern) {
  const adapter = getAdapter();
  if (!adapter) return;
  invalidations++;

  if (getMode() === 'memory') {
    const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
    const keys = memoryAdapter.getKeys();
    const toDelete = keys.filter(k => k.startsWith(prefix));
    for (const key of toDelete) {
      await adapter.del(key);
      deletes++;
    }
    return;
  }

  if (getMode() === 'redis') {
    try {
      const redis = require('../utils/redis');
      const client = redis.getClient();
      if (client) {
        const ns = redisAdapter.NAMESPACE || 'darin:cache:';
        const keys = await client.keys(ns + pattern);
        if (keys.length > 0) {
          deletes += keys.length;
          await client.del(...keys);
        }
      }
    } catch (err) {
      logger.warn('Cache invalidate error', err);
    }
  }
}

function getMetrics() {
  const mode = getMode();
  if (mode === 'off') {
    return { mode: 'off' };
  }
  const adapter = getAdapter();
  const stats = adapter ? adapter.getStats() : { keys: 0, hits: 0, misses: 0 };
  const total = stats.hits + stats.misses;
  const avgLoad = loadTimes.length > 0
    ? (loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length).toFixed(1)
    : 0;
  return {
    mode,
    ...stats,
    sets,
    deletes,
    invalidations,
    hitRate: total > 0 ? ((stats.hits / total) * 100).toFixed(1) : 0,
    avgLoadTimeMs: avgLoad,
    pendingLoads: pending.size,
  };
}

function clearAll() {
  const adapter = getAdapter();
  if (adapter) adapter.clear();
  pending.clear();
  sets = 0;
  deletes = 0;
  invalidations = 0;
  loadTimes = [];
}

const remember = wrap;

module.exports = { get, set, del, wrap, remember, invalidate, getMetrics, getMode, clearAll };
