const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createTrialSessionSchema, updateTrialSessionSchema } = require('../utils/validators');
const { prisma } = require('../utils/prisma');

router.use(authMiddleware);

const emitTrialUpdate = (req) => {
    const io = req.app.get('socketio');
    if (io) io.to('admin_room').emit('trial_session_updated');
};

router.get('/', async (req, res) => {
    try {
        const trials = await prisma.trialSession.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(trials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const [total, completed, pending, cancelled] = await Promise.all([
            prisma.trialSession.count(),
            prisma.trialSession.count({ where: { status: 'completed' } }),
            prisma.trialSession.count({ where: { status: 'pending' } }),
            prisma.trialSession.count({ where: { status: 'cancelled' } }),
        ]);
        res.json({ total, completed, pending, cancelled });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', validate(createTrialSessionSchema), async (req, res) => {
    try {
        const { studentName, parentPhone, subject, teacherId, teacherName, date, time, notes } = req.body;
        const id = uuidv4();
        await prisma.trialSession.create({
            data: {
                id, studentName, parentPhone,
                subject: subject || '',
                teacherId: teacherId || '',
                teacherName: teacherName || '',
                date, time: time || '',
                notes: notes || '',
            }
        });
        const trial = await prisma.trialSession.findUnique({ where: { id } });
        emitTrialUpdate(req);
        res.status(201).json(trial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', validate(updateTrialSessionSchema), async (req, res) => {
    try {
        const { studentName, parentPhone, subject, teacherId, teacherName, date, time, status, notes } = req.body;
        const data = {};
        if (studentName !== undefined) data.studentName = studentName;
        if (parentPhone !== undefined) data.parentPhone = parentPhone;
        if (subject !== undefined) data.subject = subject;
        if (teacherId !== undefined) data.teacherId = teacherId;
        if (teacherName !== undefined) data.teacherName = teacherName;
        if (date !== undefined) data.date = date;
        if (time !== undefined) data.time = time;
        if (status !== undefined) data.status = status;
        if (notes !== undefined) data.notes = notes;

        await prisma.trialSession.update({
            where: { id: req.params.id },
            data
        });
        const trial = await prisma.trialSession.findUnique({ where: { id: req.params.id } });
        emitTrialUpdate(req);
        res.json(trial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', checkRole(['admin']), async (req, res) => {
    try {
        await prisma.trialSession.delete({ where: { id: req.params.id } });
        emitTrialUpdate(req);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/convert', checkRole(['admin']), async (req, res) => {
    try {
        const trial = await prisma.trialSession.findUnique({ where: { id: req.params.id } });
        if (!trial) return res.status(404).json({ error: 'Trial session not found' });

        const studentId = uuidv4();
        await prisma.student.create({
            data: {
                id: studentId,
                name: trial.studentName,
                parentPhone: trial.parentPhone,
                curriculum: '',
                notes: `منقول من جلسة مراجعة: ${trial.id}`,
            }
        });

        if (trial.teacherId) {
            await prisma.$transaction(async (tx) => {
                await tx.enrollment.create({
                    data: {
                        studentId,
                        teacherId: trial.teacherId,
                        teacherFallback: trial.teacherName || '',
                        subject: trial.subject || '',
                        sessionsTotal: 1,
                        sessionsUsed: 1,
                    }
                });
                await tx.session.create({
                    data: {
                        studentId,
                        studentName: trial.studentName,
                        teacherId: trial.teacherId,
                        teacherName: trial.teacherName || '',
                        subject: trial.subject || '',
                        date: trial.date || new Date().toISOString().split('T')[0],
                        time: trial.time || '',
                        status: 'completed',
                    }
                });
            });
        }

        await prisma.trialSession.update({
            where: { id: trial.id },
            data: { status: 'converted' }
        });

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { id: true, name: true, parentPhone: true }
        });
        res.status(201).json({ student, message: 'تم تحويل طالب المراجعة إلى طالب مقيد بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
