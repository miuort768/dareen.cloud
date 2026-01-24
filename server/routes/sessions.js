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
        const studentId = req.query.studentId;
        const teacherId = req.query.teacherId;

        let whereClauses = [];
        let params = [];

        if (q) {
            whereClauses.push('(lower(studentName) LIKE ? OR lower(teacherName) LIKE ? OR subject LIKE ?)');
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }

        if (studentId) {
            whereClauses.push('studentId = ?');
            params.push(studentId);
        }

        if (teacherId) {
            whereClauses.push('teacherId = ?');
            params.push(teacherId);
        }

        const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            let sql = `SELECT * FROM sessions${whereSql}`;
            let countSql = `SELECT COUNT(*) as total FROM sessions${whereSql}`;

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
            const sessions = await req.db.all(`SELECT * FROM sessions${whereSql} ORDER BY date DESC, time DESC`, params);
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

    try {
        const newItem = await withTransaction(req.db, async (tx) => {
            // Check for existing session for same student, teacher, subject and date to prevent duplicates
            const existing = await tx.get(
                'SELECT id, status FROM sessions WHERE studentId = ? AND (teacherName = ?) AND subject = ? AND date = ?',
                [body.studentId, body.teacherName, body.subject, body.date]
            );

            if (existing) {
                // If it exists and status is the same, just return it
                if (existing.status === body.status) {
                    return tx.get('SELECT * FROM sessions WHERE id = ?', [existing.id]);
                }

                // If status is different, update the existing one instead of creating new
                await tx.run(
                    'UPDATE sessions SET status = ?, time = ?, day = ? WHERE id = ?',
                    [body.status, body.time, body.day, existing.id]
                );

                // Handle sessionsUsed counting logic for update
                if (existing.status !== 'completed' && body.status === 'completed') {
                    const enrollmentUpdate = await tx.run(
                        `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                         WHERE studentId = ? AND subject = ? AND (teacherId = ? OR (teacherId IS NULL AND teacher = ?))`,
                        [body.studentId, body.subject, body.teacherId || 'NEVER_MATCH', body.teacherName]
                    );

                    if (enrollmentUpdate.changes === 0) {
                        await tx.run(
                            `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                             WHERE studentId = ? AND subject = ? AND teacher = ?`,
                            [body.studentId, body.subject, body.teacherName]
                        );
                    }
                } else if (existing.status === 'completed' && body.status !== 'completed') {
                    const enrollmentUpdate = await tx.run(
                        `UPDATE enrollments SET sessionsUsed = MAX(0, sessionsUsed - 1) 
                         WHERE studentId = ? AND subject = ? AND (teacherId = ? OR (teacherId IS NULL AND teacher = ?))`,
                        [body.studentId, body.subject, body.teacherId || 'NEVER_MATCH', body.teacherName]
                    );

                    if (enrollmentUpdate.changes === 0) {
                        await tx.run(
                            `UPDATE enrollments SET sessionsUsed = MAX(0, sessionsUsed - 1) 
                             WHERE studentId = ? AND subject = ? AND teacher = ?`,
                            [body.studentId, body.subject, body.teacherName]
                        );
                    }
                }

                return tx.get('SELECT * FROM sessions WHERE id = ?', [existing.id]);
            }

            // If not existing, proceed with insert
            const id = body.id || `sess_${Math.random().toString(36).substr(2, 7)}`;
            let studentPrice = body.price || 0;
            let teacherPrice = 0;

            if (!studentPrice && body.studentId) {
                const student = await tx.get('SELECT sessionPrice FROM students WHERE id = ?', [body.studentId]);
                if (student) studentPrice = student.sessionPrice;
            }

            if (body.teacherId || body.teacherName) {
                const teacher = await tx.get(
                    'SELECT price FROM teachers WHERE id = ? OR name = ?',
                    [body.teacherId || null, body.teacherName]
                );
                if (teacher) {
                    teacherPrice = teacher.price;
                }
            }

            await tx.run(
                `INSERT INTO sessions (id, studentId, studentName, teacherId, teacherName, subject, date, day, time, price, teacherPrice, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, body.studentId, body.studentName, body.teacherId || null, body.teacherName, body.subject, body.date, body.day, body.time, studentPrice, teacherPrice, body.status]
            );

            if (body.status === 'completed') {
                const enrollmentUpdate = await tx.run(
                    `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                     WHERE studentId = ? AND subject = ? AND (teacherId = ? OR (teacherId IS NULL AND teacher = ?))`,
                    [body.studentId, body.subject, body.teacherId || 'NEVER_MATCH', body.teacherName]
                );

                if (enrollmentUpdate.changes === 0) {
                    // Secondary attempt: match by teacher name if teacherId didn't match
                    await tx.run(
                        `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                         WHERE studentId = ? AND subject = ? AND teacher = ?`,
                        [body.studentId, body.subject, body.teacherName]
                    );
                }
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
            const newSession = await tx.get('SELECT * FROM sessions WHERE id = ?', [id]);

            // Handle sessionsUsed counting logic
            const wasCompleted = oldSession.status === 'completed';
            const isCompleted = newSession.status === 'completed';

            // 1. If it was completed, decrement the OLD bucket
            if (wasCompleted) {
                const enrollmentUpdate = await tx.run(
                    `UPDATE enrollments SET sessionsUsed = MAX(0, sessionsUsed - 1) 
                     WHERE studentId = ? AND subject = ? AND (teacherId = ? OR (teacherId IS NULL AND teacher = ?))`,
                    [oldSession.studentId, oldSession.subject, oldSession.teacherId || 'NEVER_MATCH', oldSession.teacherName]
                );

                if (enrollmentUpdate.changes === 0) {
                    await tx.run(
                        `UPDATE enrollments SET sessionsUsed = MAX(0, sessionsUsed - 1) 
                         WHERE studentId = ? AND subject = ? AND teacher = ?`,
                        [oldSession.studentId, oldSession.subject, oldSession.teacherName]
                    );
                }
            }

            // 2. If it is NOW completed, increment the NEW bucket
            if (isCompleted) {
                const enrollmentUpdate = await tx.run(
                    `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                     WHERE studentId = ? AND subject = ? AND (teacherId = ? OR (teacherId IS NULL AND teacher = ?))`,
                    [newSession.studentId, newSession.subject, newSession.teacherId || 'NEVER_MATCH', newSession.teacherName]
                );

                if (enrollmentUpdate.changes === 0) {
                    await tx.run(
                        `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 
                         WHERE studentId = ? AND subject = ? AND teacher = ?`,
                        [newSession.studentId, newSession.subject, newSession.teacherName]
                    );
                }
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

