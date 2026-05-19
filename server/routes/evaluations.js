const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { awardPoints, withTransaction } = require('../utils/dbHelper');

// 0. Get all evaluations (Admin/Staff view)
router.get('/', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const evaluations = await req.db.all('SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 200');
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching all evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 1. Get evaluations for a specific student (Used by Parent/Student)
router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Access control:
        if (req.user.role === 'student' && req.user.id !== studentId) {
            return res.status(403).json({ error: 'Access denied: cannot view other students evaluations' });
        }
        if (req.user.role === 'parent') {
            const child = await req.db.get('SELECT id FROM students WHERE id = ? AND (parentPhone = ? OR parentId = ?)', [studentId, req.user.phone, req.user.id]);
            if (!child) {
                return res.status(403).json({ error: 'Access denied: student is not your child' });
            }
        }
        const evaluations = await req.db.all('SELECT * FROM evaluations WHERE studentId = ? ORDER BY date DESC, created_at DESC', [studentId]);
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching student evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get evaluations by a specific teacher
router.get('/teacher/:teacherId', authMiddleware, async (req, res) => {
    try {
        const { teacherId } = req.params;
        if (req.user.role !== 'admin' && (req.user.role !== 'teacher' || req.user.id !== teacherId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const evaluations = await req.db.all('SELECT * FROM evaluations WHERE teacherId = ? ORDER BY created_at DESC', [teacherId]);
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching teacher evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Create a new evaluation (Teacher/Admin only)
router.post('/', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
    const { studentId, sessionId, rating, notes, points } = req.body;
    // Enforce creator data from the auth token
    const teacherId = req.user.role === 'teacher' ? req.user.id : (req.body.teacherId || 'admin');
    const teacherName = req.user.role === 'teacher' ? (req.user.teacherName || req.user.name) : 'المدير';
    const newId = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    try {
        await withTransaction(req.db, async (tx) => {
            await tx.run(
                `INSERT INTO evaluations (id, studentId, teacherId, teacherName, sessionId, date, rating, notes, points) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newId, studentId, teacherId, teacherName || 'معلم', sessionId || null, date, rating, notes || '', points || 0]
            );

            // Update student's total points via helper
            if (points && points > 0) {
                await awardPoints(tx, { 
                    studentId, 
                    amount: points, 
                    action: `تقييم من ${teacherName || 'معلم'}: ${rating}` 
                });
            }
        });

        const newEval = await req.db.get('SELECT * FROM evaluations WHERE id = ?', [newId]);
        res.status(201).json(newEval);
    } catch (err) {
        logger.error('Error adding evaluation', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Delete evaluation
router.delete('/:id', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
    const { id } = req.params;
    try {
        const evaluation = await req.db.get('SELECT * FROM evaluations WHERE id = ?', [id]);
        if (!evaluation) return res.status(404).json({ error: 'Not found' });

        // Teachers can only delete evaluations they wrote
        if (req.user.role === 'teacher' && evaluation.teacherId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied: cannot delete other teachers evaluations' });
        }

        await withTransaction(req.db, async (tx) => {
            await tx.run('DELETE FROM evaluations WHERE id = ?', [id]);

            // Revert points
            if (evaluation.points && evaluation.points > 0) {
                await awardPoints(tx, { 
                    studentId: evaluation.studentId, 
                    amount: -evaluation.points, 
                    action: `حذف تقييم: ${evaluation.rating}` 
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
