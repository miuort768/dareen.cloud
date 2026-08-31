const logger = require('../utils/logger');
let redisMod = null;
let redisClient = null;
try {
    redisMod = require('../utils/redis');
    redisClient = redisMod.getClient();
} catch { /* no redis */ }

const KEY_PREFIX = redisMod?.NAMESPACE?.RATE || 'darin:rate:';

// ── IPv6 normalization ──────────────────────────────────────────────────────
// A single attacker can rotate millions of addresses inside one /64 block to
// bypass per-IP limits. Normalizing IPv6 to its /64 prefix collapses those
// rotations into a single bucket (IPv4 addresses pass through untouched).
function normalizeIp(rawIp) {
    const ip = String(rawIp || '').trim().toLowerCase();
    if (!ip) return 'unknown';
    if (ip.includes(':')) {
        // Handle IPv4-mapped IPv6 (::ffff:1.2.3.4) — use the IPv4 part
        const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
        if (mapped) return mapped[1];
        // Collapse to /64: the high-order bits before '::' identify the block
        const prefix = ip.split('::')[0].replace(/:$/, '');
        return (prefix || '0') + '::/64';
    }
    return ip;
}

function createRateLimiter(options) {
    const {
        windowMs = 15 * 60 * 1000,
        max = 100,
        message = 'Too many requests, please try again later.',
        keyPrefix = KEY_PREFIX,
    } = options;

    const inMemoryStore = new Map();

    // ── Memory-exhaustion guard ─────────────────────────────────────────────
    // Each unique IP adds an entry; without cleanup an attacker with rotating
    // IPs (or a botnet) grows the Map until the process OOMs. Sweep expired
    // entries every 5 minutes and hard-cap the store size.
    const MAX_STORE_ENTRIES = 50_000;
    function sweepInMemoryStore() {
        const now = Date.now();
        for (const [key, entry] of inMemoryStore) {
            if (now > entry.resetTime) inMemoryStore.delete(key);
        }
        // Still oversized (attack in progress)? Drop oldest half.
        if (inMemoryStore.size > MAX_STORE_ENTRIES) {
            const keys = inMemoryStore.keys();
            const toDelete = inMemoryStore.size - MAX_STORE_ENTRIES;
            for (let i = 0; i < toDelete; i++) inMemoryStore.delete(keys.next().value);
        }
    }
    const sweepInterval = setInterval(sweepInMemoryStore, 5 * 60 * 1000);
    if (sweepInterval.unref) sweepInterval.unref();

    return function rateLimiter(req, res, next) {
        const key = `${keyPrefix}${normalizeIp(req.ip || req.connection?.remoteAddress)}`;

        if (redisClient && redisClient.status === 'ready') {
            redisClient
                .multi()
                .incr(key)
                .pttl(key)
                .exec()
                .then((results) => {
                    if (results instanceof Error) throw results;
                    const count = results[0][1];
                    let ttl;

                    if (count === 1) {
                        redisClient.pexpire(key, windowMs).catch(() => {});
                        ttl = windowMs;
                    } else {
                        ttl = results[1][1];
                    }

                    res.setHeader('X-RateLimit-Limit', max);
                    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
                    res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + ttl) / 1000));

                    if (count > max) {
                        res.setHeader('Retry-After', Math.max(1, Math.ceil(ttl / 1000)));
                        return res.status(429).json({ error: message });
                    }
                    next();
                })
                .catch(() => {
                    redisMod?.incrementFallback();
                    logger.warn('Rate limiter fallback: Redis error, using in-memory');
                    inMemoryFallback();
                });
        } else {
            inMemoryFallback();
        }

        function inMemoryFallback() {
            const now = Date.now();
            const entry = inMemoryStore.get(key);

            if (!entry || now > entry.resetTime) {
                inMemoryStore.set(key, { count: 1, resetTime: now + windowMs });
                res.setHeader('X-RateLimit-Limit', max);
                res.setHeader('X-RateLimit-Remaining', max - 1);
                res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
                return next();
            }

            entry.count++;
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
            res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

            if (entry.count > max) {
                res.setHeader('Retry-After', Math.max(1, Math.ceil((entry.resetTime - now) / 1000)));
                return res.status(429).json({ error: message });
            }
            next();
        }
    };
}

module.exports = { createRateLimiter, normalizeIp };
