const logger = require('./logger');

let redisMod = null;
try { redisMod = require('./redis'); } catch { /* no redis */ }

const store = new Map();
const defaults = { ttl: 300000 };
const KEY_PREFIX = redisMod?.NAMESPACE?.CACHE || 'darin:cache:';

function getClient() {
    return redisMod?.getClient ? redisMod.getClient() : null;
}

function pkey(key) {
    return `${KEY_PREFIX}${key}`;
}

function pprefix(prefix) {
    return `${KEY_PREFIX}${prefix}`;
}

async function get(key) {
    const r = getClient();
    if (r) {
        try {
            const val = await r.get(pkey(key));
            if (val !== null) return JSON.parse(val);
        } catch {
            redisMod?.incrementFallback();
            logger.warn('Cache fallback (get): Redis read failed, using in-memory');
        }
    }
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        store.delete(key);
        return null;
    }
    return entry.value;
}

async function set(key, value, ttl) {
    const r = getClient();
    const ms = ttl || defaults.ttl;
    if (r) {
        try {
            await r.setex(pkey(key), Math.ceil(ms / 1000), JSON.stringify(value));
        } catch {
            redisMod?.incrementFallback();
            logger.warn('Cache fallback (set): Redis write failed, using in-memory');
        }
    }
    store.set(key, { value, expiry: Date.now() + ms });
}

async function del(key) {
    const r = getClient();
    if (r) {
        try { await r.del(pkey(key)); } catch { /* best effort */ }
    }
    store.delete(key);
}

async function delPattern(prefix) {
    const r = getClient();
    const full = pprefix(prefix);
    if (r) {
        try {
            const keys = await r.keys(`${full}*`);
            if (keys.length > 0) await r.del(keys);
        } catch { /* best effort */ }
    }
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

async function wrap(key, ttl, fetchFn) {
    const cached = await get(key);
    if (cached !== null) return cached;
    const value = await fetchFn();
    await set(key, value, ttl);
    return value;
}

function stats() {
    return {
        size: store.size,
        keys: [...store.keys()],
        redis: !!getClient(),
        redisStatus: redisMod?.status ? redisMod.status() : 'unavailable',
        fallbackCount: redisMod?.getFallbackCount ? redisMod.getFallbackCount() : 0,
    };
}

module.exports = { get, set, del, delPattern, wrap, stats };
