/**
 * /api/live/turn-credentials
 * Returns short-lived HMAC-signed TURN credentials.
 * Based on the RFC 5389 time-limited credential mechanism (same as Twilio/Agora).
 * Credentials expire in 1 hour.
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Simple ID generator
const genId = () => crypto.randomBytes(16).toString('hex');

// ── TURN Credentials ────────────────────────────────────────────────────────
router.get('/turn-credentials', (req, res) => {
    const secret = process.env.TURN_SECRET;
    const turnUrl = process.env.TURN_SERVER_URL;

    if (!secret || !turnUrl) {
        // No TURN configured — return only STUN (still works on open networks)
        return res.json({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        });
    }

    // Generate time-limited credential (expires in 1 hour)
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const userId = req.user?.id || 'anon';
    const username = `${expiresAt}:${userId}`;
    const credential = crypto
        .createHmac('sha1', secret)
        .update(username)
        .digest('base64');

    res.json({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
                urls: turnUrl,
                username,
                credential,
            },
            // Also add TURNS (TLS) if configured
            ...(process.env.TURNS_SERVER_URL ? [{
                urls: process.env.TURNS_SERVER_URL,
                username,
                credential,
            }] : []),
        ],
        expiresAt,
    });
});

// ── GET /api/live/active — Filtered by role ──────────────────────────────────
router.get('/active', async (req, res) => {
    try {
        const { id, role, permissions } = req.user;
        let query = '';
        let params = [];

        if (permissions?.includes('*')) {
            query = 'SELECT * FROM live_sessions WHERE status = "active" ORDER BY started_at DESC';
        } else if (role === 'teacher') {
            query = 'SELECT * FROM live_sessions WHERE teacherId = ? AND status = "active"';
            params = [id];
        } else if (role === 'student') {
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

// ── POST /api/live/start — Teacher starts a session ─────────────────────────
router.post('/start', async (req, res) => {
    // Only teachers and admins
    if (!['teacher', 'admin'].includes(req.user.role) && !req.user.permissions?.includes('*')) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { title, subject, targetStudentId } = req.body;
        const id = genId();
        const teacherId = req.user.id;
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

// ── POST /api/live/end/:id — End a session ───────────────────────────────────
router.post('/end/:id', async (req, res) => {
    try {
        const result = await req.db.run(
            'UPDATE live_sessions SET status = "ended" WHERE id = ?',
            [req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found or already ended' });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
