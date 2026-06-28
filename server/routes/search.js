const express = require('express');
const router = express.Router();
const { unifiedSearch } = require('../services/searchService');

router.get('/', async (req, res) => {
    try {
        const { q, types, limit } = req.query;
        const typesArr = types ? types.split(',').map(t => t.trim()).filter(Boolean) : undefined;
        const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);

        const result = await unifiedSearch({
            q,
            types: typesArr,
            limit: limitNum,
            user: req.user,
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Search failed', details: err.message });
    }
});

module.exports = { searchRouter: router };
