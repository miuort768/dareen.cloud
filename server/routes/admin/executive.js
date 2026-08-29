const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const services = require('../../services/executive');

router.use(authMiddleware, checkRole(['admin']));

// Per-service fallbacks: a failing section must never kill the whole dashboard,
// but the failure is logged AND reported to the client via `degraded`.
const FALLBACKS = {
    stats: { error: 'Stats unavailable' },
    alerts: { critical: [], warning: [], reminder: [], info: [] },
    pulse: { score: 0, status: 'unavailable', message: 'غير متاح حالياً' },
    health: { error: 'Health unavailable' },
    presence: [],
    upcoming: [],
    activity: [],
};

router.get('/dashboard', async (req, res) => {
    try {
        const filter = req.query.activity || 'all';

        const tasks = [
            ['stats', () => services.stats.getStats()],
            ['alerts', () => services.alerts.getAlerts()],
            ['pulse', () => services.pulse.getPulse()],
            ['health', () => services.health.getHealth()],
            ['presence', () => services.presence.getPresence()],
            ['upcoming', () => services.upcoming.getUpcoming()],
            ['activity', () => services.activity.getActivity(filter)],
        ];

        const degraded = [];
        const results = await Promise.all(
            tasks.map(async ([name, fn]) => {
                try {
                    return [name, await fn()];
                } catch (err) {
                    logger.error(`[executive] ${name} service failed`, err);
                    degraded.push(name);
                    return [name, FALLBACKS[name]];
                }
            }),
        );

        const data = Object.fromEntries(results);
        res.json({ ...data, degraded });
    } catch (err) {
        logger.error('[executive] dashboard route failed', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
