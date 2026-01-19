const express = require('express');
const router = express.Router();

// Using req.db from middleware


const logger = require('../utils/logger');
const { withTransaction } = require('../utils/dbHelper');
const validate = require('../middleware/validation');
const { createSessionSchema, updateSessionSchema } = require('../utils/validators');

// 1. Get all sessions
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            let sql = 'SELECT * FROM sessions';
            let countSql = 'SELECT COUNT(*) as total FROM sessions';
            let params = [];

            if (q) {
                const searchClause = ' WHERE lower(studentName) LIKE ? OR lower(teacherName) LIKE ? OR subject LIKE ?';
                sql += searchClause;
                countSql += searchClause;
                params.push(`%${q}%`, `%${q}%`, `%${q}%`);
            }

            sql += ' ORDER BY date DESC, time DESC LIMIT ? OFFSET ?';
            const sessions = await req.db.all(sql, [...params, limit, offset]);
            const count = await req.db.get(countSql, params);

            res.json({
                data: sessions,
                total: count.total,
                page,
                limit,
                totalPages: Math.ceil(count.total / limit)
            });
        } else {
            const sessions = await req.db.all('SELECT * FROM sessions ORDER BY date DESC, time DESC');
            res.json(sessions);
        }
    } catch (err) {
        logger.error('Error fetching sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add session
router.post('/', validate(createSessionSchema), async (req, res) => {
    const body = req.body;
    const id = body.id || `sess_${Math.random().toString(36).substr(2, 7)}`;

    try {
        const newItem = await withTransaction(req.db, async (tx) => {
            await tx.run(
                `INSERT INTO sessions (id, studentId, studentName, teacherId, teacherName, subject, date, day, time, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, body.studentId, body.studentName, body.teacherId || null, body.teacherName, body.subject, body.date, body.day, body.time, body.price, body.status]
            );

            if (body.status === 'completed') {
                await tx.run(
                    `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                     WHERE studentId = ? AND (teacher = ? OR teacherId = ?) AND subject = ?`,
                    [body.studentId, body.teacherName, body.teacherId || null, body.subject]
                );
            }
            return tx.get('SELECT * FROM sessions WHERE id = ?', [id]);
        });

        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding session', err, { studentId: body.studentId });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update session
router.patch('/:id', validate(updateSessionSchema), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const allowedFields = ['status', 'date', 'time', 'day', 'price', 'teacherId', 'teacherName', 'subject'];
    const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

    if (keys.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);

    try {
        const updated = await withTransaction(req.db, async (tx) => {
            const oldSession = await tx.get('SELECT * FROM sessions WHERE id = ?', [id]);
            if (!oldSession) throw new Error('Session not found');

            await tx.run(`UPDATE sessions SET ${setClause} WHERE id = ?`, [...values, id]);

            if (updates.status && updates.status !== oldSession.status) {
                if (updates.status === 'completed') {
                    await tx.run(
                        `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                         WHERE studentId = ? AND (teacher = ? OR teacherId = ?) AND subject = ?`,
                        [oldSession.studentId, oldSession.teacherName, oldSession.teacherId || null, oldSession.subject]
                    );
                } else if (oldSession.status === 'completed') {
                    await tx.run(
                        `UPDATE enrollments SET sessionsUsed = sessionsUsed - 1 
                         WHERE studentId = ? AND (teacher = ? OR teacherId = ?) AND subject = ?`,
                        [oldSession.studentId, oldSession.teacherName, oldSession.teacherId || null, oldSession.subject]
                    );
                }
            }
            return tx.get('SELECT * FROM sessions WHERE id = ?', [id]);
        });

        res.json(updated);
    } catch (err) {
        if (err.message === 'Session not found') return res.status(404).json({ error: err.message });
        logger.error('Error updating session', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Delete session
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await withTransaction(req.db, async (tx) => {
            const session = await tx.get('SELECT * FROM sessions WHERE id = ?', [id]);
            if (session) {
                if (session.status === 'completed') {
                    await tx.run(
                        `UPDATE enrollments SET sessionsUsed = sessionsUsed - 1 
                         WHERE studentId = ? AND (teacher = ? OR teacherId = ?) AND subject = ?`,
                        [session.studentId, session.teacherName, session.teacherId || null, session.subject]
                    );
                }
                await tx.run('DELETE FROM sessions WHERE id = ?', [id]);
            }
        });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting session', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { sessionRouter: router };

