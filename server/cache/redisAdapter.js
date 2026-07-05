const logger = require('../utils/logger');
const NAMESPACE = 'darin:cache:';
let hits = 0;
let misses = 0;

function getClient() {
  try {
    const redis = require('../utils/redis');
    return redis.getClient();
  } catch {
    return null;
  }
}

function prefixed(key) {
  return NAMESPACE + key;
}

async function get(key) {
  const client = getClient();
  if (!client) return undefined;
  try {
    const val = await client.get(prefixed(key));
    if (val === null) {
      misses++;
      return undefined;
    }
    hits++;
    return JSON.parse(val);
  } catch (err) {
    logger.warn('Redis cache get error', err);
    return undefined;
  }
}

async function set(key, value, ttl) {
  const client = getClient();
  if (!client) return;
  try {
    const str = JSON.stringify(value);
    if (ttl) {
      await client.setex(prefixed(key), ttl, str);
    } else {
      await client.set(prefixed(key), str);
    }
  } catch (err) {
    logger.warn('Redis cache set error', err);
  }
}

async function del(key) {
  const client = getClient();
  if (!client) return;
  try {
    await client.del(prefixed(key));
  } catch (err) {
    logger.warn('Redis cache del error', err);
  }
}

async function clear() {
  const client = getClient();
  if (!client) return;
  try {
    const keys = await client.keys(NAMESPACE + '*');
    if (keys.length > 0) await client.del(...keys);
  } catch (err) {
    logger.warn('Redis cache clear error', err);
  }
}

async function getStats() {
  const client = getClient();
  const stats = { keys: 0, hits, misses };
  if (client) {
    try {
      const keys = await client.keys(NAMESPACE + '*');
      stats.keys = keys.length;
      const info = await client.info('memory');
      const match = info.match(/used_memory_human:([^\r\n]+)/);
      if (match) stats.memory = match[1].trim();
    } catch { }
  }
  return stats;
}

module.exports = { get, set, del, clear, getStats, NAMESPACE };
