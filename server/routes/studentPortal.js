const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authMiddleware } = require('../middleware/auth');

// 1. Student Portal: Get Profile & Enrollments
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Ensure student exists
        const student = await req.db.get('SELECT id, name, grade, parentPhone, studentPhone, curriculum, notes, totalPoints FROM students WHERE id = ?', [studentId]);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Deep fetch enrollments
        const enrollments = await req.db.all('SELECT * FROM enrollments WHERE studentId = ?', [studentId]);
        
        // Parse schedule JSON if it exists
        const enrollmentsWithParsedData = enrollments.map(en => ({
            ...en,
            schedule: en.schedule ? (typeof en.schedule === 'string' ? JSON.parse(en.schedule) : en.schedule) : []
        }));

        res.json({
            ...student,
            enrollments: enrollmentsWithParsedData
        });
    } catch (err) {
        logger.error('Error fetching student profile with data', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Student Portal: Get My Sessions
router.get('/me/sessions', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;

        const sessions = await req.db.all(`
            SELECT id, studentId, teacherId, studentName, teacherName, subject, date, day, time, status, created_at
            FROM sessions 
            WHERE studentId = ? ORDER BY date DESC
        `, [studentId]);
        
        // Price is excluded intentionally from SELECT query
        
        res.json(sessions);
    } catch (err) {
        logger.error('Error fetching student sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { studentPortalRouter: router };
