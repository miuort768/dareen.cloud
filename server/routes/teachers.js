const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createTeacherSchema, updateTeacherSchema } = require('../utils/validators');
const ResponseHandler = require('../utils/responseHandler');
const { prisma } = require('../utils/prisma');

const teacherSelect = { id: true, name: true, phone1: true, phone2: true, subject: true, price: true, email: true, username: true };

// 1. Get all teachers
router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const teachers = await prisma.teacher.findMany({
            where: { deletedAt: null },
            select: teacherSelect,
            orderBy: { name: 'asc' }
        });
        res.json(teachers);
    } catch (err) {
        logger.error('Error fetching teachers', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add teacher
router.post('/', authMiddleware, checkRole(['admin']), validate(createTeacherSchema), async (req, res) => {
    const { id, name, phone1, phone2, subject, price, email, username, password } = req.body;
    const newId = id || `t_${require('crypto').randomBytes(4).toString('hex')}`;

    try {
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const dbUsername = username && username.trim() !== '' ? username.trim() : null;
        const dbPassword = password && password.trim() !== '' ? await bcrypt.hash(password, 10) : null;

        await prisma.teacher.create({
            data: { id: newId, name, phone1, phone2, subject, price: price || 0, email, username: dbUsername, password: dbPassword }
        });

        const newTeacher = await prisma.teacher.findUnique({
            where: { id: newId },
            select: teacherSelect
        });
        res.status(201).json(newTeacher);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
        }
        logger.error('Error adding teacher', err, { teacher: name });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update teacher
router.put('/:id', authMiddleware, checkRole(['admin']), validate(updateTeacherSchema), async (req, res) => {
    const { id } = req.params;
    const { name, phone1, phone2, subject, price, email, username, password } = req.body;
    try {
        const dbUsername = username && username.trim() !== '' ? username.trim() : null;

        const data = { name, phone1, phone2, subject, price: price || 0, email, username: dbUsername };

        if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
            data.password = await bcrypt.hash(password, 10);
        }

        await prisma.teacher.update({ where: { id }, data });

        const updated = await prisma.teacher.findUnique({
            where: { id },
            select: teacherSelect
        });
        res.json(updated);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
        }
        logger.error('Error updating teacher', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Delete teacher (soft delete)
router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.teacher.update({ where: { id }, data: { deletedAt: new Date() } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting teacher', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. Delete all teachers
router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await prisma.teacher.updateMany({ where: { deletedAt: null }, data: { deletedAt: new Date() } });
        res.json({ message: 'All teachers deleted' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete all teachers');
    }
});

module.exports = { teacherRouter: router };