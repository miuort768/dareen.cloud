const logger = require('../utils/logger');
let redisMod = null;
let redisClient = null;
try {
    redisMod = require('../utils/redis');
    redisClient = redisMod.getClient();
} catch { /* no redis */ }

const KEY_PREFIX = redisMod?.NAMESPACE?.RATE || 'darin:rate:';

function createRateLimiter(options) {
    const {
        windowMs = 15 * 60 * 1000,
        max = 100,
        message = 'Too many requests, please try again later.',
        keyPrefix = KEY_PREFIX,
    } = options;

    const inMemoryStore = new Map();

    return function rateLimiter(req, res, next) {
        const key = `${keyPrefix}${req.ip || req.connection.remoteAddress}`;

        if (redisClient) {
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
                return res.status(429).json({ error: message });
            }
            next();
        }
    };
}

module.exports = { createRateLimiter };
