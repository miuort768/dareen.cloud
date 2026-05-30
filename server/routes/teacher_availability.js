const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createAvailabilitySchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const teacherId = req.query.teacherId;
        let rows;
        if (teacherId) {
            rows = await req.db.all('SELECT * FROM teacher_availability WHERE teacherId = ? ORDER BY dayOfWeek, startTime', [teacherId]);
        } else {
            rows = await req.db.all('SELECT * FROM teacher_availability ORDER BY teacherName, dayOfWeek, startTime');
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/available-at', async (req, res) => {
    try {
        const { day, time } = req.query;
        if (day === undefined || !time) {
            return res.status(400).json({ error: 'day and time query params required' });
        }
        const rows = await req.db.all(
            `SELECT ta.*, t.name as teacherName, t.subject 
             FROM teacher_availability ta 
             JOIN teachers t ON t.id = ta.teacherId 
             WHERE ta.dayOfWeek = ? AND ta.isAvailable = 1 AND ta.startTime <= ? AND ta.endTime >= ?`,
            [parseInt(day), time, time]
        );

        const busyTeacherIds = await req.db.all(
            `SELECT DISTINCT teacherId FROM sessions WHERE date = ? AND time = ? AND status != 'cancelled'`,
            [req.query.date || '', time]
        );
        const busyIds = new Set(busyTeacherIds.map(b => b.teacherId));
        const available = rows.filter(r => !busyIds.has(r.teacherId));

        res.json(available);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/bulk', validate(createAvailabilitySchema), async (req, res) => {
    try {
        const { teacherId, teacherName, slots } = req.body;
        if (!teacherId || !slots || !Array.isArray(slots)) {
            return res.status(400).json({ error: 'teacherId and slots array required' });
        }

        await req.db.run('DELETE FROM teacher_availability WHERE teacherId = ?', [teacherId]);

        for (const slot of slots) {
            const id = uuidv4();
            await req.db.run(
                `INSERT INTO teacher_availability (id, teacherId, teacherName, dayOfWeek, startTime, endTime, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, teacherId, teacherName, slot.dayOfWeek, slot.startTime, slot.endTime, slot.isAvailable !== undefined ? slot.isAvailable : 1]
            );
        }

        const saved = await req.db.all('SELECT * FROM teacher_availability WHERE teacherId = ? ORDER BY dayOfWeek, startTime', [teacherId]);
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { dayOfWeek, startTime, endTime, isAvailable } = req.body;
        await req.db.run(
            `UPDATE teacher_availability SET dayOfWeek = COALESCE(?, dayOfWeek), startTime = COALESCE(?, startTime), endTime = COALESCE(?, endTime), isAvailable = COALESCE(?, isAvailable) WHERE id = ?`,
            [dayOfWeek, startTime, endTime, isAvailable, req.params.id]
        );
        const updated = await req.db.get('SELECT * FROM teacher_availability WHERE id = ?', [req.params.id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await req.db.run('DELETE FROM teacher_availability WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
