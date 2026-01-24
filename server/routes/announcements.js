const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { checkRole } = require('../middleware/auth');

// GET all announcements (Visible to all authenticated users)
router.get('/', async (req, res) => {
    try {
        const announcements = await req.db.all('SELECT * FROM announcements ORDER BY date DESC');
        // Convert isActive to boolean for consistency with frontend
        const parsed = announcements.map(a => ({
            ...a,
            isActive: a.isActive === 1
        }));
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new announcement (Admin only)
router.post('/', checkRole(['admin']), async (req, res) => {
    const { title, content, type, date, isActive } = req.body;
    try {
        const id = uuidv4();
        await req.db.run(
            'INSERT INTO announcements (id, title, content, type, date, isActive) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, content, type || 'general', date || new Date().toISOString(), isActive ? 1 : 0]
        );
        res.status(201).json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update announcement (Admin only)
router.put('/:id', checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { title, content, type, isActive } = req.body;
    try {
        await req.db.run(
            'UPDATE announcements SET title = ?, content = ?, type = ?, isActive = ? WHERE id = ?',
            [title, content, type, isActive ? 1 : 0, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE announcement (Admin only)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM announcements WHERE id = ?', id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { announcementsRouter: router };
