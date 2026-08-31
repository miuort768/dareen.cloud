const express = require('express');
const router = express.Router();
const { exportData } = require('../../services/exportService');
const { createRateLimiter } = require('../../middleware/rateLimiter');
const { createConcurrencyGate } = require('../../middleware/concurrency');

// PDF/XLSX generation is CPU + memory heavy: rate-limit per IP and cap the
// number of simultaneous generations to protect the event loop from
// starvation (a flood of exports = full-API outage).
const exportLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'عمليات تصدير كثيرة جداً. حاول بعد 15 دقيقة.',
});
const exportGate = createConcurrencyGate(2);

router.get('/:entity', exportLimiter, exportGate, async (req, res) => {
    try {
        const { entity } = req.params;
        const { format, q, from, to, status, teacherId, type } = req.query;

        if (!format || !['xlsx', 'pdf'].includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Use xlsx or pdf.' });
        }

        // Cap the requested window to keep generation bounded
        if (from && to) {
            const spanDays = (new Date(to) - new Date(from)) / 86_400_000;
            if (Number.isFinite(spanDays) && spanDays > 366) {
                return res.status(400).json({ error: 'الفترة المطلوبة واسعة جداً. الحد الأقصى سنة واحدة.' });
            }
        }

        const result = await exportData(entity, format, {
            q, from, to, status, teacherId, type,
        });

        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
    } catch (err) {
        if (err.message.startsWith('Unknown entity')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Export failed', details: err.message });
    }
});

module.exports = { exportRouter: router };
