const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { authMiddleware } = require('../../middleware/auth');
const { prisma } = require('../../utils/prisma');
const { PORTAL_TTL } = require('../../services/dashboardCache');
const cache = require('../../services/cacheService');
const { CACHE_KEYS } = require('../../constants/cacheKeys');

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;

        // Student dashboard polls every 5s; per-user cache dedupes tabs. Session
        // and enrollment writes invalidate this key (see dashboardCache), so the
        // snapshot stays near-real-time and only cross-feature writes ride the TTL.
        const result = await cache.wrap(CACHE_KEYS.studentPortal.me(studentId), PORTAL_TTL, async () => {
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { id: true, name: true, grade: true, parentPhone: true, studentPhone: true, curriculum: true, notes: true, totalPoints: true, badges: true }
            });
            if (!student) return null;

            const enrollments = await prisma.enrollment.findMany({
                where: { studentId },
                include: { teacher: { select: { id: true, name: true, subject: true } } },
            });

            const enrollmentsWithParsedData = enrollments.map(en => ({
                ...en,
                teacher:
                    (en.teacher && en.teacher.name) ||
                    en.teacherFallback ||
                    null,
                schedule: en.schedule ? (typeof en.schedule === 'string' ? JSON.parse(en.schedule) : en.schedule) : []
            }));

            const activeSession = await prisma.activeSession.findFirst({
                where: { studentId },
                orderBy: { startedAt: 'desc' }
            });

            return {
                ...student,
                enrollments: enrollmentsWithParsedData,
                isLive: !!activeSession,
                activeSession: activeSession || null
            };
        });

        if (result === null) return res.status(404).json({ error: 'Student not found' });
        res.json(result);
    } catch (err) {
        logger.error('Error fetching student profile with data', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me/sessions', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;
        const sessions = await prisma.session.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
            take: 100
        });
        res.json(sessions);
    } catch (err) {
        logger.error('Error fetching student sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me/points-log', authMiddleware, async (req, res) => {
    try {
        let studentId = req.user.id;

        if (req.user.role === 'parent' && req.query.studentId) {
            const relation = await prisma.student.findFirst({
                where: { id: req.query.studentId, parentPhone: req.user.phone }
            });
            if (relation) {
                studentId = req.query.studentId;
            } else {
                return res.status(403).json({ error: 'Access denied to this student data' });
            }
        }

        const logs = await prisma.pointsLog.findMany({
            where: { studentId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (err) {
        logger.error('Error fetching points log', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me/announcements', authMiddleware, async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: { key: { startsWith: 'announcement_' } },
            orderBy: { key: 'desc' },
            take: 10
        });
        const parsed = settings.map(a => {
            try { return JSON.parse(a.value); } catch(e) { return null; }
        }).filter(Boolean);
        res.json(parsed);
    } catch (err) {
        logger.error('Error fetching student announcements', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { studentPortalRouter: router };
