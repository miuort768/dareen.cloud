const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

let timer = null;

function msUntilNextMidnight() {
    const now = new Date();
    const next = new Date(now);
    // Reset at 00:10 local time (10 min after midnight to avoid edge-of-day)
    next.setHours(0, 10, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next - now;
}

async function run() {
    try {
        const { count } = await prisma.completedSession.deleteMany({});
        logger.info(`[completed-sessions] Daily reset — cleared ${count} rows`);
    } catch (err) {
        logger.error('Completed-sessions daily reset failed: ' + (err?.message || err));
    } finally {
        scheduleNext();
    }
}

function scheduleNext() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, msUntilNextMidnight());
    // Allow process to exit without waiting for the timer
    if (timer && typeof timer === 'object' && timer.unref) timer.unref();
}

function start() {
    if (timer) return;
    scheduleNext();
    logger.info('[completed-sessions] Daily reset scheduled (00:10 local time)');
}

function stop() {
    if (timer) { clearTimeout(timer); timer = null; }
}

module.exports = { start, stop };
