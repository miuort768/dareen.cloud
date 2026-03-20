const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { checkRole } = require('../middleware/auth');

// 1. Get evaluations for a specific student (Used by Parent/Student)
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const evaluations = await req.db.all('SELECT * FROM evaluations WHERE studentId = ? ORDER BY date DESC, created_at DESC', [studentId]);
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching student evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get evaluations by a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const evaluations = await req.db.all('SELECT * FROM evaluations WHERE teacherId = ? ORDER BY created_at DESC', [teacherId]);
        res.json(evaluations);
    } catch (err) {
        logger.error('Error fetching teacher evaluations', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Create a new evaluation (Teacher/Admin)
router.post('/', async (req, res) => {
    const { studentId, teacherId, teacherName, sessionId, rating, notes, points } = req.body;
    const newId = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    try {
        await req.db.run('BEGIN TRANSACTION');

        await req.db.run(
            `INSERT INTO evaluations (id, studentId, teacherId, teacherName, sessionId, date, rating, notes, points) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, studentId, teacherId, teacherName || 'معلم', sessionId || null, date, rating, notes || '', points || 0]
        );

        // Update student's total points
        if (points && points > 0) {
            await req.db.run(
                `UPDATE students SET totalPoints = totalPoints + ? WHERE id = ?`,
                [points, studentId]
            );
        }

        await req.db.run('COMMIT');

        const newEval = await req.db.get('SELECT * FROM evaluations WHERE id = ?', [newId]);
        res.status(201).json(newEval);
    } catch (err) {
        await req.db.run('ROLLBACK');
        logger.error('Error adding evaluation', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Delete evaluation
router.delete('/:id', checkRole(['admin', 'teacher']), async (req, res) => {
    const { id } = req.params;
    try {
        const evaluation = await req.db.get('SELECT * FROM evaluations WHERE id = ?', [id]);
        if (!evaluation) return res.status(404).json({ error: 'Not found' });

        await req.db.run('BEGIN TRANSACTION');

        await req.db.run('DELETE FROM evaluations WHERE id = ?', [id]);

        // Revert points
        if (evaluation.points && evaluation.points > 0) {
            await req.db.run(
                `UPDATE students SET totalPoints = MAX(0, totalPoints - ?) WHERE id = ?`,
                [evaluation.points, evaluation.studentId]
            );
        }

        await req.db.run('COMMIT');
        res.json({ message: 'Deleted' });
    } catch (err) {
        await req.db.run('ROLLBACK');
        logger.error('Error deleting evaluation', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { evaluationsRouter: router };
