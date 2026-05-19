const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/appointments/completed-sessions - Get IDs of completed sessions (Admin/Teacher only)
router.get('/completed-sessions', checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const sessions = await req.db.all('SELECT id FROM completed_sessions');
        res.json(sessions.map(s => s.id));
    } catch (err) {
        logger.error('Error fetching completed sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/appointments/completed-sessions - Mark a session as completed (Admin/Teacher only)
router.post('/completed-sessions', checkRole(['admin', 'teacher']), async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    try {
        await req.db.run('INSERT OR IGNORE INTO completed_sessions (id) VALUES (?)', id);
        res.json({ success: true });
    } catch (err) {
        logger.error('Error marking session as completed', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/appointments/completed-sessions/reset - Clear all completed sessions (Admin only)
router.delete('/completed-sessions/reset', checkRole(['admin']), async (req, res) => {
    try {
        await req.db.run('DELETE FROM completed_sessions');
        res.json({ success: true });
    } catch (err) {
        logger.error('Error resetting completed sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
