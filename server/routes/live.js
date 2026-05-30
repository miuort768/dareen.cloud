const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

const genId = () => crypto.randomBytes(16).toString('hex');

// TURN Credentials (lightweight, no DB needed)
router.get('/turn-credentials', (req, res) => {
    const secret = process.env.TURN_SECRET;
    const turnUrl = process.env.TURN_SERVER_URL;

    if (!secret || !turnUrl) {
        return res.json({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        });
    }

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
            { urls: turnUrl, username, credential },
            ...(process.env.TURNS_SERVER_URL ? [{ urls: process.env.TURNS_SERVER_URL, username, credential }] : []),
        ],
        expiresAt,
    });
});

// LiveKit Token Generation (requires auth)
const { AccessToken } = require('livekit-server-sdk');

router.get('/token', authMiddleware, (req, res) => {
    const roomName = req.query.room;
    const participantName = req.user?.name || req.user?.username || req.user?.teacherName || 'مستخدم';
    const participantId = req.user?.id ? String(req.user.id) : genId();

    if (!roomName) {
        return res.status(400).json({ error: 'Room name is required' });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) {
        return res.status(500).json({ error: 'LiveKit credentials not configured' });
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantId,
        name: participantName,
    });

    const isTeacher = req.user?.role === 'teacher' || req.user?.role === 'admin' || req.user?.permissions?.includes('*');

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: isTeacher,
        canPublishData: true,
        canSubscribe: true,
    });

    res.json({ token: at.toJwt() });
});

router.get('/active', authMiddleware, async (req, res) => {
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
            query = `SELECT * FROM live_sessions WHERE status = "active" AND (targetStudentId = ? OR (targetStudentId IS NULL AND teacherId IN (SELECT teacherId FROM enrollments WHERE studentId = ?)))`;
            params = [id, id];
        } else if (role === 'parent') {
            query = `SELECT * FROM live_sessions WHERE status = "active" AND (targetStudentId IN (SELECT id FROM students WHERE parentId = ?) OR (targetStudentId IS NULL AND teacherId IN (SELECT teacherId FROM enrollments WHERE studentId IN (SELECT id FROM students WHERE parentId = ?))))`;
            params = [id, id];
        } else {
            return res.json([]);
        }

        const sessions = await req.db.all(query, params);
        res.json(sessions);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch active live sessions');
    }
});

router.post('/start', authMiddleware, async (req, res) => {
    if (!['teacher', 'admin'].includes(req.user.role) && !req.user.permissions?.includes('*')) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { title, subject, targetStudentId } = req.body;
        const id = genId();
        const teacherId = req.user.id;
        const teacherName = req.user.teacherName || req.user.name || req.user.username || 'معلمة';

        await req.db.run(
            'UPDATE live_sessions SET status = "ended" WHERE teacherId = ? AND status = "active"',
            [teacherId]
        );

        await req.db.run(
            `INSERT INTO live_sessions (id, teacherId, teacherName, title, subject, targetStudentId) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, teacherId, teacherName, title || 'بث مباشر', subject || '', targetStudentId || null]
        );

        res.status(201).json({ id, teacherId, teacherName });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Start live session');
    }
});

router.post('/end/:id', authMiddleware, async (req, res) => {
    try {
        const isAdmin = req.user?.role === 'admin' || req.user?.permissions?.includes('*');
        const result = await req.db.run(
            isAdmin
                ? 'UPDATE live_sessions SET status = "ended" WHERE id = ?'
                : 'UPDATE live_sessions SET status = "ended" WHERE id = ? AND teacherId = ?',
            isAdmin ? [req.params.id] : [req.params.id, req.user.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found or already ended' });
        }

        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'End live session');
    }
});

module.exports = router;
