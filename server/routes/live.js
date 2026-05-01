const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Get active live sessions (Filtered for privacy)
router.get('/active', authMiddleware, async (req, res) => {
    try {
        const { id, role, permissions } = req.user;
        let query = '';
        let params = [];

        if (permissions?.includes('*')) {
            // Admin sees all active sessions
            query = 'SELECT * FROM live_sessions WHERE status = "active" ORDER BY started_at DESC';
        } else if (role === 'teacher') {
            // Teacher sees only their own active session
            query = 'SELECT * FROM live_sessions WHERE teacherId = ? AND status = "active"';
            params = [id];
        } else if (role === 'student') {
            // Student sees sessions from teachers they are enrolled with
            query = `
                SELECT * FROM live_sessions 
                WHERE status = "active" 
                AND teacherId IN (SELECT teacherId FROM enrollments WHERE studentId = ?)
            `;
            params = [id];
        } else if (role === 'parent') {
            // Parent sees sessions from teachers their children are enrolled with
            query = `
                SELECT * FROM live_sessions 
                WHERE status = "active" 
                AND teacherId IN (
                    SELECT teacherId FROM enrollments 
                    WHERE studentId IN (SELECT id FROM students WHERE parentId = ?)
                )
            `;
            params = [id];
        } else {
            return res.json([]);
        }

        const sessions = await req.db.all(query, params);
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
