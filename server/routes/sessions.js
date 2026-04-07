const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { getStudentEnrollments, getStudentsWithEnrollments, withTransaction, updateEnrollmentSessions, awardPoints } = require('../utils/dbHelper');
const { authMiddleware, checkRole } = require('../middleware/auth');
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
        const isTeacher = req.user && req.user.role === 'teacher';

        const mapSession = (s) => {
            if (isTeacher) {
                const { price, ...rest } = s;
                return { ...rest, price: s.teacherPrice };
            }
            return s;
        };

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            let sql = `SELECT * FROM sessions${whereSql}`;
            let countSql = `SELECT COUNT(*) as total FROM sessions${whereSql}`;

            sql += ' ORDER BY date DESC, time DESC LIMIT ? OFFSET ?';
            const sessions = await req.db.all(sql, [...params, limit, offset]);
            const count = await req.db.get(countSql, params);

            res.json({
                data: sessions.map(mapSession),
                total: count.total,
                page,
                limit,
                totalPages: Math.ceil(count.total / limit)
            });
        } else {
            const sessions = await req.db.all(`SELECT * FROM sessions${whereSql} ORDER BY date DESC, time DESC`, params);
            res.json(sessions.map(mapSession));
        }
    } catch (err) {
        logger.error('Error fetching sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add session
router.post('/', authMiddleware, validate(createSessionSchema), async (req, res) => {
    const body = req.body;
    const isTeacher = req.user && req.user.role === 'teacher';

    try {
        const newItem = await withTransaction(req.db, async (tx) => {
            const id = body.id || `sess_${Math.random().toString(36).substr(2, 7)}`;
            let studentPrice = body.price || 0;
            let teacherPrice = 0;

            if (!studentPrice && body.studentId) {
                const student = await tx.get('SELECT sessionPrice FROM students WHERE id = ?', [body.studentId]);
                if (student) studentPrice = student.sessionPrice;
            }

            const teacherRow = await tx.get(
                'SELECT id, price FROM teachers WHERE id = ? OR LOWER(TRIM(name)) = LOWER(TRIM(?))',
                [body.teacherId || null, body.teacherName]
            );

            const finalTeacherId = body.teacherId || (teacherRow ? teacherRow.id : null);
            if (teacherRow) {
                teacherPrice = teacherRow.price;
            }

            await tx.run(
                `INSERT INTO sessions (id, studentId, studentName, teacherId, teacherName, subject, date, day, time, price, teacherPrice, status, topics, homework, needsCompensation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, body.studentId, body.studentName, finalTeacherId, body.teacherName, body.subject, body.date, body.day, body.time, studentPrice, teacherPrice, body.status, body.topics || null, body.homework || null, body.needsCompensation ? 1 : 0]
            );

            if (body.status === 'completed') {
                await updateEnrollmentSessions(tx, { studentId: body.studentId, subject: body.subject, teacherName: body.teacherName, teacherId: finalTeacherId, delta: 1 });
                await awardPoints(tx, { studentId: body.studentId, amount: 10, action: `حضور حصة: ${body.subject}` });
            }

            // 🔔 Auto-notify parent on absence
            if (body.status === 'cancelled') {
                const { v4: uuidv4 } = require('uuid');
                const notifId = uuidv4();
                const notifTime = new Date().toISOString();
                await tx.run(
                    `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                    [
                        notifId,
                        req.user?.id || 'system',
                        body.studentId,
                        req.user?.teacherName || req.user?.name || 'النظام',
                        `غياب: ${body.studentName}`,
                        `تم تسجيل غياب الطالب "${body.studentName}" في مادة "${body.subject}" بتاريخ ${body.date}.`,
                        'warning',
                        notifTime
                    ]
                );
            }

            const session = await tx.get('SELECT * FROM sessions WHERE id = ?', [id]);

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


// 3. Update session
router.patch('/:id', authMiddleware, validate(updateSessionSchema), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const isTeacher = req.user && req.user.role === 'teacher';
    const allowedFields = ['status', 'date', 'time', 'day', 'price', 'teacherId', 'teacherName', 'subject', 'topics', 'homework', 'needsCompensation'];
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

            const wasCompleted = oldSession.status === 'completed';
            const isCompleted = newSession.status === 'completed';

            if (wasCompleted && !isCompleted) {
                await updateEnrollmentSessions(tx, { studentId: oldSession.studentId, subject: oldSession.subject, teacherName: oldSession.teacherName, teacherId: oldSession.teacherId, delta: -1 });
                await awardPoints(tx, { studentId: oldSession.studentId, amount: -10, action: `تعديل حالة حصة: ${oldSession.subject}` });
            } else if (!wasCompleted && isCompleted) {
                await updateEnrollmentSessions(tx, { studentId: newSession.studentId, subject: newSession.subject, teacherName: newSession.teacherName, teacherId: newSession.teacherId, delta: 1 });
                await awardPoints(tx, { studentId: newSession.studentId, amount: 10, action: `حضور حصة: ${newSession.subject}` });
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

// 4. Delete session
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await withTransaction(req.db, async (tx) => {
            const session = await tx.get('SELECT * FROM sessions WHERE id = ?', [id]);
            if (session) {
                if (session.status === 'completed') {
                    await updateEnrollmentSessions(tx, { studentId: session.studentId, subject: session.subject, teacherName: session.teacherName, teacherId: session.teacherId, delta: -1 });
                    await awardPoints(tx, { studentId: session.studentId, amount: -10, action: `حذف حصة مكتملة: ${session.subject}` });
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
