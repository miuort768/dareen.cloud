const os = require('os');

let cacheFallbacks = 0;
let redisStatus = 'unavailable';

try {
    const redis = require('../../utils/redis');
    redisStatus = redis.status();
    cacheFallbacks = redis.getFallbackCount();
} catch { /* ignore */ }

async function getHealth() {
    const memory = process.memoryUsage();
    const memUsage = Math.round((memory.rss / os.totalmem()) * 100);
    const cpuLoad = os.loadavg()[0] || 0;
    const cpuCount = os.cpus().length;

    let dbStatus = 'connected';
    let dbLatency = 0;
    try {
        const { prisma } = require('../../utils/prisma');
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbLatency = Date.now() - start;
    } catch {
        dbStatus = 'disconnected';
        dbLatency = -1;
    }

    return {
        database: { status: dbStatus, latency: dbLatency },
        redis: { status: redisStatus, fallbacks: cacheFallbacks },
        memory: { used: memory.rss, total: os.totalmem(), usagePercent: memUsage },
        cpu: { load: Math.round(cpuLoad * 10) / 10, cores: cpuCount },
        uptime: process.uptime(),
        platform: process.platform,
        node: process.version,
        timestamp: new Date().toISOString(),
    };
}

module.exports = { getHealth };
