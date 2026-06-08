const logger = require('../utils/logger');

const metrics = { total: 0, byMethod: {}, byPath: {}, slow: [], errors: 0 };

module.exports = (req, res, next) => {
    const start = Date.now();
    metrics.total++;

    const method = req.method;
    metrics.byMethod[method] = (metrics.byMethod[method] || 0) + 1;

    res.on('finish', () => {
        const duration = Date.now() - start;
        const pathGroup = req.path.split('/')[1] || 'root';
        metrics.byPath[pathGroup] = (metrics.byPath[pathGroup] || 0) + 1;

        if (res.statusCode >= 500) metrics.errors++;
        if (duration > 1000) {
            metrics.slow.push({ method: req.method, path: req.path, duration });
            if (metrics.slow.length > 100) metrics.slow.shift();
            logger.warn('Slow request', { method: req.method, path: req.path, duration });
        }
    });

    next();
};

module.exports.getMetrics = () => ({
    ...metrics,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
});

module.exports.resetMetrics = () => {
    metrics.total = 0;
    metrics.byMethod = {};
    metrics.byPath = {};
    metrics.slow = [];
    metrics.errors = 0;
};

module.exports.adminNotifyOnError = (limitPerMinute = 10) => {
    let counter = 0;
    let lastReset = Date.now();
    return (err, req, res, next) => {
        const now = Date.now();
        if (now - lastReset > 60000) { counter = 0; lastReset = now; }
        counter++;
        if (counter <= limitPerMinute) {
            const logger = require('../utils/logger');
            logger.error('Auto-notified error', err, { path: req.path, method: req.method });
        }
        next(err);
    };
};
