const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { getStudentEnrollments, getStudentsWithEnrollments, withTransaction } = require('../utils/dbHelper');
const { authMiddleware, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createStudentSchema, updateStudentSchema } = require('../utils/validators');

// 1. Get all students
router.get('/', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
        const isTeacher = req.user && req.user.role === 'teacher';

        const mapStudent = (s) => {
            if (isTeacher) {
                const { sessionPrice, ...restStudent } = s;
                const enrollments = (s.enrollments || []).map(en => {
                    const { price, ...restEnrollment } = en;
                    return restEnrollment;
                });
                return { ...restStudent, sessionPrice: 0, enrollments };
            }
            return s;
        };

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            let querySql = 'SELECT id FROM students';
            let countSql = 'SELECT COUNT(*) as total FROM students';
            let params = [];

            if (q) {
                const searchClause = ' WHERE lower(name) LIKE ? OR parentPhone LIKE ? OR studentPhone LIKE ?';
                querySql += searchClause;
                countSql += searchClause;
                params.push(`%${q}%`, `%${q}%`, `%${q}%`);
            }

            querySql += ' LIMIT ? OFFSET ?';
            const studentIdsRaw = await req.db.all(querySql, [...params, limit, offset]);
            const countResult = await req.db.get(countSql, params);

            const studentIds = studentIdsRaw.map(s => s.id);
            const studentsWithEnrollments = studentIds.length > 0
                ? await getStudentsWithEnrollments(req.db, studentIds)
                : [];

            res.json({
                data: studentsWithEnrollments.map(mapStudent),
                total: countResult.total,
                page,
                limit,
                totalPages: Math.ceil(countResult.total / limit)
            });
        } else {
            const studentsWithEnrollments = await getStudentsWithEnrollments(req.db);
            res.json(studentsWithEnrollments.map(mapStudent));
        }

    } catch (err) {
        logger.error('Error fetching students', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add student
router.post('/', validate(createStudentSchema), async (req, res) => {
    const { id, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, enrollments } = req.body;
    const newId = id || `std_${Math.random().toString(36).substr(2, 7)}`;

    try {
        const newStudent = await withTransaction(req.db, async (tx) => {
            await tx.run(
                `INSERT INTO students (id, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [newId, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice]
            );

            if (enrollments && enrollments.length > 0) {
                for (const e of enrollments) {
                    let finalTeacherId = e.teacherId || null;
                    // Fallback: Try to find teacher ID by name if missing
                    if (!finalTeacherId && e.teacher) {
                        const teacherRecord = await tx.get('SELECT id FROM teachers WHERE name = ?', [e.teacher]);
                        if (teacherRecord) finalTeacherId = teacherRecord.id;
                    }

                    await tx.run(
                        `INSERT INTO enrollments (studentId, teacher, teacherId, subject, curr, sessionsTotal, sessionsUsed, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [newId, e.teacher, finalTeacherId, e.subject, e.curr, e.sessionsTotal, e.sessionsUsed, JSON.stringify(e.schedule)]
                    );
                }
            }

            const results = await getStudentsWithEnrollments(tx, [newId]);
            return results[0];
        });

        res.status(201).json(newStudent);
    } catch (err) {
        logger.error('Error adding student', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update student
router.put('/:id', validate(updateStudentSchema), async (req, res) => {
    const { id } = req.params;
    const { name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, enrollments } = req.body;

    try {
        const updatedStudent = await withTransaction(req.db, async (tx) => {
            // 1. Update basic student info
            await tx.run(
                `UPDATE students SET name = ?, grade = ?, parentPhone = ?, studentPhone = ?, curriculum = ?, notes = ?, sessionPrice = ? WHERE id = ?`,
                [name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, id]
            );

            // 2. Fetch existing enrollments to preserve their sessionsUsed
            const existingEnrollments = await tx.all('SELECT teacher, subject, sessionsUsed FROM enrollments WHERE studentId = ?', [id]);
            const sessionsMap = {};
            existingEnrollments.forEach(en => {
                const key = `${en.teacher.trim().toLowerCase()}-${en.subject.trim().toLowerCase()}`;
                sessionsMap[key] = en.sessionsUsed;
            });

            // 3. Re-sync enrollments
            await tx.run('DELETE FROM enrollments WHERE studentId = ?', [id]);

            if (enrollments && enrollments.length > 0) {
                for (const e of enrollments) {
                    let finalTeacherId = e.teacherId || null;
                    if (!finalTeacherId && e.teacher) {
                        const teacherRecord = await tx.get('SELECT id FROM teachers WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))', [e.teacher]);
                        if (teacherRecord) finalTeacherId = teacherRecord.id;
                    }

                    // CRITICAL FIX: Preserve sessionsUsed if this (teacher/subject) pair existed
                    const matchKey = `${e.teacher.trim().toLowerCase()}-${e.subject.trim().toLowerCase()}`;
                    const preservedUsed = sessionsMap[matchKey] !== undefined ? sessionsMap[matchKey] : (e.sessionsUsed || 0);

                    await tx.run(
                        `INSERT INTO enrollments (studentId, teacher, teacherId, subject, curr, sessionsTotal, sessionsUsed, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [id, e.teacher, finalTeacherId, e.subject, e.curr, e.sessionsTotal, preservedUsed, JSON.stringify(e.schedule)]
                    );
                }
            }

            const results = await getStudentsWithEnrollments(tx, [id]);
            return results[0];
        });

        res.json(updatedStudent);
    } catch (err) {
        logger.error('Error updating student', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Delete student
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await withTransaction(req.db, async (tx) => {
            await tx.run('DELETE FROM enrollments WHERE studentId = ?', [id]);
            await tx.run('DELETE FROM students WHERE id = ?', [id]);
        });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        logger.error('Error deleting student', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. Delete all students (admin only)
router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await withTransaction(req.db, async (tx) => {
            await tx.run('DELETE FROM enrollments');
            await tx.run('DELETE FROM students');
        });
        res.json({ message: 'All students and enrollments deleted' });
    } catch (err) {
        logger.error('Error deleting all students', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 6. Freeze / Unfreeze enrollment
router.patch('/:studentId/enrollments/:enrollmentId/freeze', authMiddleware, async (req, res) => {
    const { studentId, enrollmentId } = req.params;
    const { isFrozen, frozenReason } = req.body;
    try {
        await req.db.run(
            'UPDATE enrollments SET isFrozen = ?, frozenReason = ? WHERE id = ? AND studentId = ?',
            [isFrozen ? 1 : 0, frozenReason || null, enrollmentId, studentId]
        );
        const updated = await req.db.get('SELECT * FROM enrollments WHERE id = ?', [enrollmentId]);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating freeze status', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { studentRouter: router };


