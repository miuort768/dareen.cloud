const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createStudentSchema, updateStudentSchema } = require('../utils/validators');
const { prisma } = require('../utils/prisma');

const studentInclude = {
    enrollments: true,
    parent: { select: { id: true, name: true, phone: true } }
};

const mapEnrollment = (e) => ({
    ...e,
    schedule: typeof e.schedule === 'string' ? JSON.parse(e.schedule) : (e.schedule || [])
});

const mapStudent = (s, isTeacher = false) => {
    const { password, ...safe } = s;
    const enrollments = (s.enrollments || []).map(mapEnrollment);
    if (isTeacher) {
        const { sessionPrice, ...rest } = safe;
        return { ...rest, sessionPrice: 0, enrollments: enrollments.map(e => { const { price, ...er } = e; return er; }) };
    }
    return { ...safe, enrollments };
};

// 1. Get all students
router.get('/', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
        const isTeacher = req.user && req.user.role === 'teacher';

        let teacherStudentIds = null;
        if (isTeacher) {
            const enrollments = await prisma.enrollment.findMany({
                where: { teacherId: req.user.id },
                select: { studentId: true }
            });
            teacherStudentIds = enrollments.map(e => e.studentId);
            if (teacherStudentIds.length === 0) {
                return res.json(!isNaN(page) && !isNaN(limit) ? { data: [], total: 0, page, limit, totalPages: 0 } : []);
            }
        }

        const where = { deletedAt: null };
        if (isTeacher && teacherStudentIds) {
            where.id = { in: teacherStudentIds };
        }
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { parentPhone: { contains: q } },
                { studentPhone: { contains: q } }
            ];
        }

        if (!isNaN(page) && !isNaN(limit)) {
            const [students, total] = await Promise.all([
                prisma.student.findMany({
                    where,
                    include: studentInclude,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { name: 'asc' }
                }),
                prisma.student.count({ where })
            ]);

            res.json({
                data: students.map(s => mapStudent(s, isTeacher)),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });
        } else {
            const students = await prisma.student.findMany({
                where,
                include: studentInclude,
                orderBy: { name: 'asc' }
            });
            res.json(students.map(s => mapStudent(s, isTeacher)));
        }
    } catch (err) {
        logger.error('Error fetching students', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add student
router.post('/', validate(createStudentSchema), async (req, res) => {
    const { id, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, enrollments, username, password, currency } = req.body;
    const newId = id || `std_${require('crypto').randomBytes(4).toString('hex')}`;
    const bcrypt = require('bcrypt');

    try {
        let hashedPassword = null;
        if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        const dbUsername = (username && username.trim() !== '') ? username.trim() : null;

        const student = await prisma.$transaction(async (tx) => {
            await tx.student.create({
                data: {
                    id: newId, name, grade, parentPhone, studentPhone, curriculum, notes,
                    sessionPrice: sessionPrice || 0, currency: currency || 'KWD',
                    username: dbUsername, password: hashedPassword
                }
            });

            if (enrollments && enrollments.length > 0) {
                for (const e of enrollments) {
                    let finalTeacherId = e.teacherId || null;
                    if (!finalTeacherId && e.teacher) {
                        const teacher = await tx.teacher.findFirst({ where: { name: e.teacher } });
                        if (teacher) finalTeacherId = teacher.id;
                    }
                    await tx.enrollment.create({
                        data: {
                            studentId: newId, teacher: e.teacher, teacherId: finalTeacherId,
                            subject: e.subject, curr: e.curr,
                            sessionsTotal: e.sessionsTotal || 0, sessionsUsed: e.sessionsUsed || 0,
                            schedule: JSON.stringify(e.schedule || []), nextSessionNotes: e.nextSessionNotes || null
                        }
                    });
                }
            }

            return tx.student.findUnique({
                where: { id: newId },
                include: studentInclude
            });
        });

        res.status(201).json(mapStudent(student));
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر للطالب.' });
        }
        logger.error('Error adding student', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update student
router.put('/:id', validate(updateStudentSchema), async (req, res) => {
    const { id } = req.params;
    const { name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, enrollments, username, password, currency } = req.body;
    const bcrypt = require('bcrypt');

    try {
        const dbUsername = (username && username.trim() !== '') ? username.trim() : null;

        const student = await prisma.$transaction(async (tx) => {
            // 1. Fetch existing enrollments to preserve sessionsUsed and nextSessionNotes
            const existingEnrollments = await tx.enrollment.findMany({
                where: { studentId: id },
                select: { teacher: true, subject: true, sessionsUsed: true, nextSessionNotes: true }
            });
            const preservedMap = {};
            existingEnrollments.forEach(en => {
                const key = `${(en.teacher || '').trim().toLowerCase()}-${(en.subject || '').trim().toLowerCase()}`;
                preservedMap[key] = { used: en.sessionsUsed, notes: en.nextSessionNotes };
            });

            // 2. Update basic student info
            const data = { name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice: sessionPrice || 0, currency: currency || 'KWD', username: dbUsername };
            if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
                data.password = await bcrypt.hash(password, 10);
            }
            await tx.student.update({ where: { id }, data });

            // 3. Re-sync enrollments
            await tx.enrollment.deleteMany({ where: { studentId: id } });

            if (enrollments && enrollments.length > 0) {
                for (const e of enrollments) {
                    let finalTeacherId = e.teacherId || null;
                    if (!finalTeacherId && e.teacher) {
                        const teacher = await tx.teacher.findFirst({ where: { name: { equals: e.teacher.trim(), mode: 'insensitive' } } });
                        if (teacher) finalTeacherId = teacher.id;
                    }

                    const matchKey = `${(e.teacher || '').trim().toLowerCase()}-${(e.subject || '').trim().toLowerCase()}`;
                    const preservedData = preservedMap[matchKey] || {};
                    const preservedUsed = preservedData.used !== undefined ? preservedData.used : (e.sessionsUsed || 0);
                    const finalNotes = e.nextSessionNotes !== undefined ? e.nextSessionNotes : (preservedData.notes || null);

                    await tx.enrollment.create({
                        data: {
                            studentId: id, teacher: e.teacher, teacherId: finalTeacherId,
                            subject: e.subject, curr: e.curr,
                            sessionsTotal: e.sessionsTotal || 0, sessionsUsed: preservedUsed,
                            schedule: JSON.stringify(e.schedule || []), nextSessionNotes: finalNotes
                        }
                    });
                }
            }

            return tx.student.findUnique({
                where: { id },
                include: studentInclude
            });
        });

        res.json(mapStudent(student));
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر للطالب.' });
        }
        logger.error('Error updating student', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Delete student (soft delete)
router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.enrollment.deleteMany({ where: { studentId: id } });
            await tx.student.update({ where: { id }, data: { deletedAt: new Date() } });
        });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        logger.error('Error deleting student', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. Delete all students
router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.enrollment.deleteMany();
            await tx.student.updateMany({ data: { deletedAt: new Date() } });
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
        const updated = await prisma.enrollment.update({
            where: { id: parseInt(enrollmentId), studentId },
            data: { nextSessionNotes: isFrozen ? `[مجمدة] ${frozenReason || ''}` : null }
        });
        res.json(updated);
    } catch (err) {
        logger.error('Error updating freeze status', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { studentRouter: router };