const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

const services = require('./executive');

router.use(authMiddleware);

router.get('/dashboard', async (req, res) => {
    try {
        const filter = req.query.activity || 'all';
        const [
            stats,
            alerts,
            pulse,
            health,
            presence,
            upcoming,
            activity,
        ] = await Promise.all([
            services.stats.getStats().catch(() => ({ error: 'Stats unavailable' })),
            services.alerts.getAlerts().catch(() => ({ critical: [], warning: [], reminder: [], info: [] })),
            services.pulse.getPulse().catch(() => ({ score: 0, status: 'unavailable', message: 'غير متاح حالياً' })),
            services.health.getHealth().catch(() => ({ error: 'Health unavailable' })),
            services.presence.getPresence().catch(() => []),
            services.upcoming.getUpcoming().catch(() => []),
            services.activity.getActivity(filter).catch(() => []),
        ]);

        res.json({ stats, alerts, pulse, health, presence, upcoming, activity });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
