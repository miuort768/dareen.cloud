// Concurrency gate — protects CPU/memory-heavy endpoints (PDF/Excel export,
// bulk operations) from resource exhaustion. Independent of rate limiting:
// N legitimate users issuing simultaneous heavy requests can exhaust the
// event loop and starve the whole API. This caps in-flight executions and
// rejects overflow with 429 immediately.
function createConcurrencyGate(maxConcurrent = 3) {
    let inFlight = 0;

    return function concurrencyGate(req, res, next) {
        if (inFlight >= maxConcurrent) {
            res.setHeader('Retry-After', 10);
            return res.status(429).json({
                error: 'الخادم مشغول حالياً بعمليات ثقيلة. حاول بعد قليل.'
            });
        }
        inFlight++;
        const release = () => { inFlight--; };
        res.on('finish', release);
        res.on('close', release);
        next();
    };
}

module.exports = { createConcurrencyGate };
