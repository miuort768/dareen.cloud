const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { createEvaluationSchema } = require('../../utils/validators');
const { prisma } = require('../../utils/prisma');

router.get('/', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const evaluations = await prisma.evaluation.findMany({
            orderBy: { createdAt: 'desc' },
            take: 200
        });
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching all evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;

        if (req.user.role === 'student' && req.user.id !== studentId) {
            return res.status(403).json({ error: 'Access denied: cannot view other students evaluations' });
        }
        if (req.user.role === 'parent') {
            const child = await prisma.student.findFirst({
                where: { id: studentId, OR: [{ parentPhone: req.user.phone }, { parentId: req.user.id }] }
            });
            if (!child) {
                return res.status(403).json({ error: 'Access denied: student is not your child' });
            }
        }
        const evaluations = await prisma.evaluation.findMany({
            where: { studentId },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
        });
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching student evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/teacher/:teacherId', authMiddleware, async (req, res) => {
    try {
        const { teacherId } = req.params;
        if (req.user.role !== 'admin' && (req.user.role !== 'teacher' || req.user.id !== teacherId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const evaluations = await prisma.evaluation.findMany({
            where: { teacherId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching teacher evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', authMiddleware, checkRole(['admin', 'teacher']), validate(createEvaluationSchema), async (req, res) => {
    const { studentId, sessionId, rating, notes, points } = req.body;
    const teacherId = req.user.role === 'teacher' ? req.user.id : (req.body.teacherId || 'admin');
    const teacherName = req.user.role === 'teacher' ? (req.user.teacherName || req.user.name) : 'المدير';
    const newId = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    try {
        await prisma.$transaction(async (tx) => {
            await tx.evaluation.create({
                data: {
                    id: newId,
                    studentId,
                    teacherId,
                    teacherName: teacherName || 'معلم',
                    sessionId: sessionId || '',
                    date,
                    rating,
                    notes: notes || '',
                    points: points || 0,
                }
            });

            if (points && points > 0) {
                await tx.pointsLog.create({
                    data: {
                        id: uuidv4(),
                        studentId,
                        amount: points,
                        action: `تقييم من ${teacherName || 'معلم'}: ${rating}`
                    }
                });
                const student = await tx.student.findUnique({ where: { id: studentId }, select: { totalPoints: true, badges: true } });
                if (student) {
                    await tx.student.update({
                        where: { id: studentId },
                        data: { totalPoints: { increment: points } }
                    });
                    let badges = [];
                    try { badges = JSON.parse(student.badges || '[]'); } catch (e) { badges = []; }
                    const milestones = [
                        { threshold: 500, name: 'شاطر ومجتهد', color: 'emerald' },
                        { threshold: 1500, name: 'العبقري / العبقرية', color: 'blue' },
                        { threshold: 2500, name: 'بطل المعهد', color: 'violet' },
                        { threshold: 3500, name: 'جوكر المعهد', color: 'amber' }
                    ];
                    let badgeAdded = false;
                    const newTotal = (student.totalPoints || 0) + points;
                    milestones.forEach(m => {
                        if (newTotal >= m.threshold && !badges.some(b => b.name === m.name)) {
                            badges.push({ name: m.name, color: m.color, date: new Date().toISOString() });
                            badgeAdded = true;
                        }
                    });
                    if (badgeAdded) {
                        await tx.student.update({
                            where: { id: studentId },
                            data: { badges: JSON.stringify(badges) }
                        });
                    }
                }
            }
        });

        const newEval = await prisma.evaluation.findUnique({ where: { id: newId } });
        res.status(201).json(newEval);
    } catch (err) {
        logger.error('Error adding evaluation', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
    const { id } = req.params;
    try {
        const evaluation = await prisma.evaluation.findUnique({ where: { id } });
        if (!evaluation) return res.status(404).json({ error: 'Not found' });

        if (req.user.role === 'teacher' && evaluation.teacherId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied: cannot delete other teachers evaluations' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.evaluation.delete({ where: { id } });

            if (evaluation.points && evaluation.points > 0) {
                await tx.pointsLog.create({
                    data: {
                        id: uuidv4(),
                        studentId: evaluation.studentId,
                        amount: -evaluation.points,
                        action: `حذف تقييم: ${evaluation.rating}`
                    }
                });
                await tx.student.update({
                    where: { id: evaluation.studentId },
                    data: { totalPoints: { increment: -evaluation.points } }
                });
            }
        });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting evaluation', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { evaluationsRouter: router };
