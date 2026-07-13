const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { createAvailabilitySchema } = require('../../utils/validators');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/prisma');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const teacherId = req.query.teacherId;
        let rows;
        if (teacherId) {
            rows = await prisma.teacherAvailability.findMany({
                where: { teacherId },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
            });
        } else {
            rows = await prisma.teacherAvailability.findMany({
                orderBy: [{ teacherName: 'asc' }, { dayOfWeek: 'asc' }, { startTime: 'asc' }]
            });
        }
        res.json(rows);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch availability');
    }
});

router.get('/available-at', async (req, res) => {
    try {
        const { day, time } = req.query;
        if (day === undefined || !time) {
            return res.status(400).json({ error: 'day and time query params required' });
        }

        const rows = await prisma.teacherAvailability.findMany({
            where: {
                dayOfWeek: parseInt(day),
                isAvailable: 1,
                startTime: { lte: time },
                endTime: { gte: time }
            },
            include: {
                teacher: { select: { name: true, subject: true } }
            }
        });

        const busySessions = await prisma.session.findMany({
            where: {
                date: req.query.date || '',
                time,
                status: { not: 'cancelled' }
            },
            select: { teacherId: true },
            distinct: ['teacherId']
        });
        const busyIds = new Set(busySessions.map(b => b.teacherId));
        const available = rows.filter(r => !busyIds.has(r.teacherId));

        const mapped = available.map(r => ({
            ...r,
            teacherName: r.teacher?.name || r.teacherName,
            subject: r.teacher?.subject || null
        }));
        res.json(mapped);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch available slots');
    }
});

router.post('/bulk', validate(createAvailabilitySchema), async (req, res) => {
    try {
        const { teacherId, teacherName, slots } = req.body;
        if (!teacherId || !slots || !Array.isArray(slots)) {
            return res.status(400).json({ error: 'teacherId and slots array required' });
        }

        await prisma.teacherAvailability.deleteMany({ where: { teacherId } });

        if (slots.length > 0) {
            await prisma.teacherAvailability.createMany({
                data: slots.map(slot => ({
                    id: uuidv4(),
                    teacherId,
                    teacherName,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : 1,
                }))
            });
        }

        const saved = await prisma.teacherAvailability.findMany({
            where: { teacherId },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
        res.status(201).json(saved);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Bulk save availability');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { dayOfWeek, startTime, endTime, isAvailable } = req.body;
        const data = {};
        if (dayOfWeek !== undefined) data.dayOfWeek = dayOfWeek;
        if (startTime !== undefined) data.startTime = startTime;
        if (endTime !== undefined) data.endTime = endTime;
        if (isAvailable !== undefined) data.isAvailable = isAvailable;

        await prisma.teacherAvailability.update({
            where: { id: req.params.id },
            data
        });
        const updated = await prisma.teacherAvailability.findUnique({ where: { id: req.params.id } });
        res.json(updated);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update availability slot');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.teacherAvailability.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete availability slot');
    }
});

module.exports = router;
