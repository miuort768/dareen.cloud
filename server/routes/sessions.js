const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createSessionSchema, updateSessionSchema } = require('../utils/validators');
const { prisma } = require('../utils/prisma');

async function updateSessionCount(tx, { studentId, subject, teacherName, teacherId, delta }) {
    const enrollments = await tx.enrollment.findMany({
        where: { studentId, subject: subject || '' },
        select: { id: true, teacherId: true, teacherFallback: true, sessionsUsed: true }
    });
    const match = enrollments.find(e =>
        (teacherId && e.teacherId === teacherId) ||
        (teacherName && e.teacherFallback && e.teacherFallback.trim().toLowerCase() === teacherName.trim().toLowerCase())
    ) || enrollments[0];
    if (!match) {
        throw new Error(`لم يتم العثور على اشتراك للطالب ${studentId} في مادة ${subject}`);
    }
    const newVal = delta > 0 ? match.sessionsUsed + 1 : Math.max(0, match.sessionsUsed - 1);
    await tx.enrollment.update({ where: { id: match.id }, data: { sessionsUsed: newVal } });
}

async function awardPointsInline(tx, { studentId, amount, action }) {
    if (!amount || amount === 0) return;
    await tx.pointsLog.create({ data: { id: uuidv4(), studentId, amount, action } });
    const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { totalPoints: true, badges: true }
    });
    if (!student) return;
    const newTotal = (student.totalPoints || 0) + amount;
    await tx.student.update({ where: { id: studentId }, data: { totalPoints: newTotal } });
    if (amount > 0) {
        let badges = [];
        try { badges = JSON.parse(student.badges || '[]'); } catch (e) { badges = []; }
        const milestones = [
            { threshold: 500, name: 'شاطر ومجتهد', color: 'emerald' },
            { threshold: 1500, name: 'العبقري / العبقري', color: 'blue' },
            { threshold: 2500, name: 'بطل المعهد', color: 'violet' },
            { threshold: 3500, name: 'جوكر المعهد', color: 'amber' }
        ];
        let badgeAdded = false;
        milestones.forEach(m => {
            if (newTotal >= m.threshold && !badges.some(b => b.name === m.name)) {
                badges.push({ name: m.name, color: m.color, date: new Date().toISOString() });
                badgeAdded = true;
            }
        });
        if (badgeAdded) {
            await tx.student.update({ where: { id: studentId }, data: { badges: JSON.stringify(badges) } });
        }
    }
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
        const studentId = req.query.studentId;
        const teacherId = req.query.teacherId;
        const where = {};

        if (q) {
            where.OR = [
                { studentName: { contains: q } },
                { teacherName: { contains: q } },
                { subject: { contains: q } }
            ];
        }

        if (req.user.role === 'student') {
            where.studentId = req.user.id;
        } else if (req.user.role === 'parent') {
            const children = await prisma.student.findMany({
                where: { OR: [{ parentPhone: req.user.phone }, { parentId: req.user.id }] },
                select: { id: true }
            });
            const childIds = children.map(c => c.id);
            if (childIds.length === 0) {
                return res.json(!isNaN(page) && !isNaN(limit) ? { data: [], total: 0, page, limit, totalPages: 0 } : []);
            }
            if (studentId) {
                if (!childIds.includes(studentId)) {
                    return res.status(403).json({ error: 'Access denied: student is not your child' });
                }
                where.studentId = studentId;
            } else {
                where.studentId = { in: childIds };
            }
        } else if (req.user.role === 'teacher') {
            where.teacherId = req.user.id;
        } else {
            if (studentId) where.studentId = studentId;
            if (teacherId) where.teacherId = teacherId;
        }

        const isTeacher = req.user.role === 'teacher';

        const mapSession = (s) => {
            if (isTeacher) {
                const { price, ...rest } = s;
                return { ...rest, price: s.teacherPrice };
            }
            return s;
        };

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            const [sessions, total] = await Promise.all([
                prisma.session.findMany({ where, orderBy: [{ date: 'desc' }, { time: 'desc' }], skip: offset, take: limit }),
                prisma.session.count({ where })
            ]);
            res.json({ data: sessions.map(mapSession), total, page, limit, totalPages: Math.ceil(total / limit) });
        } else {
            const sessions = await prisma.session.findMany({ where, orderBy: [{ date: 'desc' }, { time: 'desc' }] });
            res.json(sessions.map(mapSession));
        }
    } catch (err) {
        logger.error('Error fetching sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', authMiddleware, validate(createSessionSchema), async (req, res) => {
    const body = req.body;
    const isTeacher = req.user.role === 'teacher';

    try {
        const newItem = await prisma.$transaction(async (tx) => {
            const id = body.id || `sess_${crypto.randomBytes(4).toString('hex')}`;
            let studentPrice = body.price || 0;
            let teacherPrice = 0;

            const student = body.studentId
                ? await tx.student.findUnique({ where: { id: body.studentId }, select: { sessionPrice: true, currency: true } })
                : null;

            if (!studentPrice && student) {
                studentPrice = student.sessionPrice ?? 0;
            }

            const teacherRow = body.teacherId
                ? await tx.teacher.findUnique({ where: { id: body.teacherId }, select: { id: true, price: true, currency: true } })
                : body.teacherName
                    ? await tx.teacher.findFirst({ where: { name: body.teacherName }, select: { id: true, price: true, currency: true } })
                    : null;

            const finalTeacherId = body.teacherId ?? (teacherRow ? teacherRow.id : null);
            if (teacherRow) teacherPrice = teacherRow.price;

            // Phase 2B: Currency snapshot
            const studentCurrency = body.currency || (student ? student.currency : null) || 'KWD';
            const teacherCurrency = body.teacherCurrency || (teacherRow ? teacherRow.currency : null) || 'EGP';

            let exchangeRateFrom = null;
            let exchangeRateTo = null;
            let exchangeRateValue = null;

            if (studentCurrency !== teacherCurrency) {
                const rate = await prisma.exchangeRate.findFirst({
                    where: { fromCurrency: studentCurrency, toCurrency: teacherCurrency },
                    orderBy: { effectiveDate: 'desc' }
                });
                if (rate) {
                    exchangeRateFrom = studentCurrency;
                    exchangeRateTo = teacherCurrency;
                    exchangeRateValue = rate.buyRate;
                }
            }

            await tx.session.create({
                data: {
                    id, studentId: body.studentId, studentName: body.studentName || '',
                    teacherId: finalTeacherId, teacherName: body.teacherName || '',
                    subject: body.subject || '', date: body.date, day: body.day || '',
                    time: body.time || '', price: studentPrice, teacherPrice,
                    studentCurrency, teacherCurrency,
                    exchangeRateFrom, exchangeRateTo, exchangeRateValue,
                    status: body.status || 'scheduled',
                    topics: body.topics || '', homework: body.homework || '',
                    needsCompensation: body.needsCompensation ? 1 : 0,
                }
            });

            if (body.status === 'completed') {
                await updateSessionCount(tx, { studentId: body.studentId, subject: body.subject, teacherName: body.teacherName, teacherId: finalTeacherId, delta: 1 });
                await awardPointsInline(tx, { studentId: body.studentId, amount: 10, action: `حضور حصة: ${body.subject}` });
            }

            if (body.status === 'cancelled') {
                await tx.notification.create({
                    data: {
                        id: uuidv4(), senderId: req.user?.id || 'system', receiverId: body.studentId,
                        senderName: req.user?.teacherName || req.user?.name || 'النظام',
                        title: `غياب: ${body.studentName}`,
                        message: `تم تسجيل غياب الطالب "${body.studentName}" في مادة "${body.subject}" بتاريخ ${body.date}.`,
                        type: 'warning', time: new Date().toISOString(), read: 0,
                    }
                });
            }

            const session = await tx.session.findUnique({ where: { id } });
            if (isTeacher) {
                const { price, ...rest } = session;
                return { ...rest, price: session.teacherPrice };
            }
            return session;
        });

        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding session', err, { studentId: body.studentId });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/:id', authMiddleware, validate(updateSessionSchema), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const isTeacher = req.user.role === 'teacher';
    const allowedFields = ['status', 'date', 'time', 'day', 'price', 'teacherId', 'teacherName', 'subject', 'topics', 'homework', 'needsCompensation', 'studentCurrency', 'teacherCurrency', 'exchangeRateFrom', 'exchangeRateTo', 'exchangeRateValue'];
    const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
    if (keys.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const data = {};
    keys.forEach(k => { data[k] = updates[k]; });

    try {
        const updated = await prisma.$transaction(async (tx) => {
            const oldSession = await tx.session.findUnique({ where: { id } });
            if (!oldSession) throw new Error('Session not found');

            await tx.session.update({ where: { id }, data });
            const newSession = await tx.session.findUnique({ where: { id } });

            const wasCompleted = oldSession.status === 'completed';
            const isCompleted = newSession.status === 'completed';
            const identityChanged =
                oldSession.studentId !== newSession.studentId ||
                oldSession.subject !== newSession.subject ||
                oldSession.teacherId !== newSession.teacherId;

            if (wasCompleted && isCompleted && identityChanged) {
                await updateSessionCount(tx, { studentId: oldSession.studentId, subject: oldSession.subject, teacherName: oldSession.teacherName, teacherId: oldSession.teacherId, delta: -1 });
                await awardPointsInline(tx, { studentId: oldSession.studentId, amount: -10, action: `تعديل بيانات حصة مكتملة: ${oldSession.subject}` });
                await updateSessionCount(tx, { studentId: newSession.studentId, subject: newSession.subject, teacherName: newSession.teacherName, teacherId: newSession.teacherId, delta: 1 });
                await awardPointsInline(tx, { studentId: newSession.studentId, amount: 10, action: `حضور حصة (انتقال): ${newSession.subject}` });
            } else if (!identityChanged) {
                if (wasCompleted && !isCompleted) {
                    await updateSessionCount(tx, { studentId: oldSession.studentId, subject: oldSession.subject, teacherName: oldSession.teacherName, teacherId: oldSession.teacherId, delta: -1 });
                    await awardPointsInline(tx, { studentId: oldSession.studentId, amount: -10, action: `تعديل حالة حصة: ${oldSession.subject}` });
                } else if (!wasCompleted && isCompleted) {
                    await updateSessionCount(tx, { studentId: newSession.studentId, subject: newSession.subject, teacherName: newSession.teacherName, teacherId: newSession.teacherId, delta: 1 });
                    await awardPointsInline(tx, { studentId: newSession.studentId, amount: 10, action: `حضور حصة: ${newSession.subject}` });
                }
            } else {
                if (wasCompleted && !isCompleted) {
                    await updateSessionCount(tx, { studentId: oldSession.studentId, subject: oldSession.subject, teacherName: oldSession.teacherName, teacherId: oldSession.teacherId, delta: -1 });
                    await awardPointsInline(tx, { studentId: oldSession.studentId, amount: -10, action: `إلغاء حصة مكتملة: ${oldSession.subject}` });
                } else if (!wasCompleted && isCompleted) {
                    await updateSessionCount(tx, { studentId: newSession.studentId, subject: newSession.subject, teacherName: newSession.teacherName, teacherId: newSession.teacherId, delta: 1 });
                    await awardPointsInline(tx, { studentId: newSession.studentId, amount: 10, action: `حضور حصة جديدة: ${newSession.subject}` });
                }
            }

            if (isTeacher) {
                const { price, ...rest } = newSession;
                return { ...rest, price: newSession.teacherPrice };
            }
            return newSession;
        });

        res.json(updated);
    } catch (err) {
        if (err.message === 'Session not found') return res.status(404).json({ error: err.message });
        logger.error('Error updating session', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            const session = await tx.session.findUnique({ where: { id } });
            if (session) {
                if (session.status === 'completed') {
                    await updateSessionCount(tx, { studentId: session.studentId, subject: session.subject, teacherName: session.teacherName, teacherId: session.teacherId, delta: -1 });
                    await awardPointsInline(tx, { studentId: session.studentId, amount: -10, action: `حذف حصة مكتملة: ${session.subject}` });
                }
                await tx.session.delete({ where: { id } });
            }
        });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting session', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { sessionRouter: router };
