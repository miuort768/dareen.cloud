const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authMiddleware } = require('../middleware/auth');

// 1. Student Portal: Get Profile & Enrollments
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Ensure student exists
        const student = await req.db.get('SELECT id, name, grade, parentPhone, studentPhone, curriculum, notes, totalPoints, badges FROM students WHERE id = ?', [studentId]);
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

// 3. Student Portal: Get Points Log
router.get('/me/points-log', authMiddleware, async (req, res) => {
    try {
        let studentId = req.user.id;
        
        // If parent is requesting, allow based on studentId query param
        if (req.user.role === 'parent' && req.query.studentId) {
            // VERIFY: Does this parent own this student?
            const relation = await req.db.get('SELECT id FROM students WHERE id = ? AND parentPhone = ?', [req.query.studentId, req.user.phone]);
            if (relation) {
                studentId = req.query.studentId;
            } else {
                return res.status(403).json({ error: 'Access denied to this student data' });
            }
        }
        
        const logs = await req.db.all('SELECT * FROM points_log WHERE studentId = ? ORDER BY timestamp DESC LIMIT 50', [studentId]);
        res.json(logs);
    } catch (err) {
        logger.error('Error fetching points log', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { studentPortalRouter: router };
