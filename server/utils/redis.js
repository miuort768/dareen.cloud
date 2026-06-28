const Redis = require('ioredis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const NAMESPACE = {
    CACHE: 'darin:cache:',
    RATE: 'darin:rate:',
    QUEUE: 'darin:queue:',
    SESSION: 'darin:session:',
    LOCK: 'darin:lock:',
};

const CONNECT_TIMEOUT_MS = 2000;
const RETRY_MS = 100;

let client = null;
let connected = false;
let fallbackCount = 0;

function createClient() {
    if (client) return client;
    try {
        let timedOut = false;
        const timeout = setTimeout(() => {
            timedOut = true;
            client?.disconnect();
            logger.warn('Redis connection timed out after 2s — running without Redis');
            connected = false;
        }, CONNECT_TIMEOUT_MS);

        client = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (timedOut || times > 3) {
                    if (!timedOut) {
                        logger.warn('Redis connection failed after 3 retries — running without Redis');
                    }
                    connected = false;
                    return null;
                }
                return RETRY_MS;
            },
            lazyConnect: true,
            connectTimeout: CONNECT_TIMEOUT_MS,
        });

        client.on('connect', () => {
            clearTimeout(timeout);
            connected = true;
            logger.info('Redis connected');
        });

        client.on('error', (err) => {
            if (err.code !== 'ECONNREFUSED' && err.code !== 'ETIMEOUT') {
                logger.error('Redis error:', err.message);
            }
        });

        client.on('close', () => {
            connected = false;
        });

        return client;
    } catch (err) {
        logger.warn('Redis initialization failed — running without Redis:', err.message);
        return null;
    }
}

async function connect() {
    if (client && connected) return true;
    try {
        const c = createClient();
        if (c) {
            await c.connect();
            return true;
        }
    } catch {
        logger.warn('Redis connection failed — running without Redis');
    }
    return false;
}

function isConnected() {
    return connected && client?.status === 'ready';
}

function getClient() {
    return isConnected() ? client : null;
}

function status() {
    if (isConnected()) return 'connected';
    if (client) return 'disconnected';
    return 'fallback';
}

function getFallbackCount() {
    return fallbackCount;
}

function incrementFallback() {
    fallbackCount++;
}

module.exports = {
    createClient, connect, isConnected, getClient,
    status, getFallbackCount, incrementFallback,
    NAMESPACE,
};
