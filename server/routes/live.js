const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { prisma } = require('../utils/prisma');

const genId = () => crypto.randomBytes(16).toString('hex');

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
        let where = { status: 'active' };

        if (permissions?.includes('*')) {
        } else if (role === 'teacher') {
            where.teacherId = id;
        } else if (role === 'student') {
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: id },
                select: { teacherId: true }
            });
            const teacherIds = enrollments.map(e => e.teacherId).filter(Boolean);
            where.OR = [
                { targetStudentId: id },
                { targetStudentId: null, teacherId: { in: teacherIds } }
            ];
        } else if (role === 'parent') {
            const children = await prisma.student.findMany({
                where: { parentId: id },
                select: { id: true }
            });
            const childIds = children.map(c => c.id);
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: { in: childIds } },
                select: { teacherId: true }
            });
            const teacherIds = enrollments.map(e => e.teacherId).filter(Boolean);
            where.OR = [
                { targetStudentId: { in: childIds } },
                { targetStudentId: null, teacherId: { in: teacherIds } }
            ];
        } else {
            return res.json([]);
        }

        const sessions = await prisma.liveSession.findMany({
            where,
            orderBy: { startedAt: 'desc' }
        });
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

        await prisma.liveSession.updateMany({
            where: { teacherId, status: 'active' },
            data: { status: 'ended' }
        });

        await prisma.liveSession.create({
            data: {
                id, teacherId, teacherName,
                title: title || 'بث مباشر',
                subject: subject || '',
                targetStudentId: targetStudentId || '',
            }
        });

        res.status(201).json({ id, teacherId, teacherName });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Start live session');
    }
});

router.post('/end/:id', authMiddleware, async (req, res) => {
    try {
        const isAdmin = req.user?.role === 'admin' || req.user?.permissions?.includes('*');
        const where = isAdmin
            ? { id: req.params.id, status: 'active' }
            : { id: req.params.id, teacherId: req.user.id, status: 'active' };

        const result = await prisma.liveSession.updateMany({
            where,
            data: { status: 'ended' }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Session not found or already ended' });
        }

        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'End live session');
    }
});

module.exports = router;
