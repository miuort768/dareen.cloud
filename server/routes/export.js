const express = require('express');
const router = express.Router();
const { exportData } = require('../services/exportService');

router.get('/:entity', async (req, res) => {
    try {
        const { entity } = req.params;
        const { format, q, from, to, status, teacherId, type } = req.query;

        if (!format || !['xlsx', 'pdf'].includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Use xlsx or pdf.' });
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
