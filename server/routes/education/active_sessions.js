const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authMiddleware } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/prisma');

router.use(authMiddleware);

router.get('/my', async (req, res) => {
    try {
        let activeSessions = [];
        if (req.user.role === 'parent') {
            const children = await prisma.student.findMany({
                where: {
                    OR: [
                        { parentPhone: req.user.phone },
                        { parentId: req.user.id }
                    ]
                },
                select: { id: true }
            });
            if (children.length > 0) {
                const childIds = children.map(c => c.id);
                activeSessions = await prisma.activeSession.findMany({
                    where: { studentId: { in: childIds } }
                });
            }
        } else if (req.user.role === 'student') {
            activeSessions = await prisma.activeSession.findMany({
                where: { studentId: req.user.id }
            });
        } else if (req.user.role === 'teacher') {
            activeSessions = await prisma.activeSession.findMany({
                where: { teacherId: req.user.id }
            });
        } else {
            activeSessions = await prisma.activeSession.findMany();
        }
        res.json(activeSessions);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch active sessions');
    }
});

router.post('/', async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { studentId, subject } = req.body;
    try {
        await prisma.activeSession.deleteMany({
            where: { studentId, subject }
        });

        const id = Date.now().toString() + '_' + crypto.randomBytes(2).toString('hex');
        await prisma.activeSession.create({
            data: {
                id,
                studentId,
                teacherId: req.user.id,
                teacherName: req.user.teacherName || req.user.name,
                subject,
                startedAt: new Date(),
            }
        });
        res.json({ success: true, id });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create active session');
    }
});

router.delete('/', async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { studentId, subject } = req.body;
    try {
        if (studentId && subject) {
            await prisma.activeSession.deleteMany({
                where: { studentId, subject }
            });
        }
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete active session');
    }
});

module.exports = router;
