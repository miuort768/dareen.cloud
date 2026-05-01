const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Get all active live sessions
router.get('/active', async (req, res) => {
    try {
        const sessions = await req.db.all('SELECT * FROM live_sessions WHERE status = "active" ORDER BY started_at DESC');
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start a live session (Teacher only)
router.post('/start', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const { title, subject } = req.body;
        const id = uuidv4();
        const teacherId = req.user.id;
        const teacherName = req.user.name;

        // End any previous active sessions for this teacher
        await req.db.run('UPDATE live_sessions SET status = "ended" WHERE teacherId = ? AND status = "active"', [teacherId]);

        await req.db.run(
            `INSERT INTO live_sessions (id, teacherId, teacherName, title, subject)
             VALUES (?, ?, ?, ?, ?)`,
            [id, teacherId, teacherName, title, subject]
        );

        res.status(201).json({ id, teacherId, teacherName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// End a live session (Teacher only)
router.post('/end/:id', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        await req.db.run('UPDATE live_sessions SET status = "ended" WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
