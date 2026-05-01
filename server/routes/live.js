const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { checkRole } = require('../middleware/auth');

// Simple ID generator (no uuid dependency needed)
const genId = () => crypto.randomBytes(16).toString('hex');

// GET /api/live/active — Filtered by role
router.get('/active', async (req, res) => {
    try {
        const { id, role, permissions } = req.user;
        let query = '';
        let params = [];

        if (permissions?.includes('*')) {
            // Admin sees all active sessions
            query = 'SELECT * FROM live_sessions WHERE status = "active" ORDER BY started_at DESC';
        } else if (role === 'teacher') {
            // Teacher sees only their own sessions
            query = 'SELECT * FROM live_sessions WHERE teacherId = ? AND status = "active"';
            params = [id];
        } else if (role === 'student') {
            // Student sees:
            // 1. Sessions explicitly targeted to them (always visible)
            // 2. General broadcasts (no targetStudentId) from their enrolled teachers
            query = `
                SELECT * FROM live_sessions 
                WHERE status = "active" 
                AND (
                    targetStudentId = ?
                    OR (targetStudentId IS NULL AND teacherId IN (SELECT teacherId FROM enrollments WHERE studentId = ?))
                )
            `;
            params = [id, id];
        } else if (role === 'parent') {
            // Parent sees:
            // 1. Sessions explicitly targeted to their children
            // 2. General broadcasts from teachers their children are enrolled with
            query = `
                SELECT * FROM live_sessions 
                WHERE status = "active" 
                AND (
                    targetStudentId IN (SELECT id FROM students WHERE parentId = ?)
                    OR (targetStudentId IS NULL AND teacherId IN (
                        SELECT teacherId FROM enrollments 
                        WHERE studentId IN (SELECT id FROM students WHERE parentId = ?)
                    ))
                )
            `;
            params = [id, id];
        } else {
            return res.json([]);
        }

        const sessions = await req.db.all(query, params);
        res.json(sessions);
    } catch (err) {
        console.error('[LIVE] /active error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/live/start — Teacher or Admin starts a session
router.post('/start', checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const { title, subject, targetStudentId } = req.body;
        const id = genId();
        const teacherId = req.user.id;
        // JWT payload uses 'teacherName' for teachers, 'username' as fallback
        const teacherName = req.user.teacherName || req.user.name || req.user.username || 'معلمة';

        // End any previous active sessions for this teacher
        await req.db.run(
            'UPDATE live_sessions SET status = "ended" WHERE teacherId = ? AND status = "active"',
            [teacherId]
        );

        await req.db.run(
            `INSERT INTO live_sessions (id, teacherId, teacherName, title, subject, targetStudentId)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, teacherId, teacherName, title || `بث مباشر`, subject || '', targetStudentId || null]
        );

        res.status(201).json({ id, teacherId, teacherName });
    } catch (err) {
        console.error('[LIVE] /start error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/live/end/:id — End a session
router.post('/end/:id', checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        await req.db.run(
            'UPDATE live_sessions SET status = "ended" WHERE id = ? AND teacherId = ?',
            [req.params.id, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
