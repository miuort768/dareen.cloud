const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const ResponseHandler = require('../utils/responseHandler');
const { prisma } = require('../utils/prisma');

const parentSelect = { id: true, name: true, phone: true, email: true, username: true };

// 1. Get all parents
router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const parents = await prisma.parent.findMany({
            where: { deletedAt: null },
            select: parentSelect,
            orderBy: { name: 'asc' }
        });
        res.json(parents);
    } catch (err) {
        logger.error('Error fetching parents', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add parent
router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id, name, phone, email, username, password } = req.body;
    const bcrypt = require('bcrypt');
    const dbUsername = username || phone;
    const dbPassword = password || '123456';
    const hashedPassword = await bcrypt.hash(dbPassword, 10);

    const { v4: uuidv4 } = require('uuid');
    const newId = id || uuidv4();
    try {
        await prisma.parent.create({
            data: { id: newId, name, phone, email: email || '', username: dbUsername, password: hashedPassword }
        });
        const newItem = await prisma.parent.findUnique({
            where: { id: newId },
            select: parentSelect
        });
        res.status(201).json(newItem);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.' });
        }
        logger.error('Error adding parent', err, { parent: name });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update parent
router.put('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, username, password } = req.body;
    const bcrypt = require('bcrypt');

    try {
        const data = { name, phone, email: email || '', username: username || phone };
        if (password && password.trim() !== '') {
            data.password = await bcrypt.hash(password, 10);
        }
        await prisma.parent.update({ where: { id }, data });
        const updated = await prisma.parent.findUnique({
            where: { id },
            select: parentSelect
        });
        res.json(updated);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.' });
        }
        logger.error('Error updating parent', err, { id });
        ResponseHandler.serverError(res, err, 'Update parent');
    }
});

// 4. Delete parent (soft delete)
router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.parent.update({ where: { id }, data: { deletedAt: new Date() } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting parent', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. Parent Portal: Get Children (with deep data)
router.get('/my-children', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
    try {
        const parentPhone = req.user.phone;
        const children = await prisma.student.findMany({
            where: { parentPhone, deletedAt: null },
            include: {
                enrollments: true
            }
        });

        const childrenWithData = children.map(child => {
            const { password: _, ...safe } = child;
            return {
                ...safe,
                enrollments: (child.enrollments || []).map(en => ({
                    ...en,
                    schedule: typeof en.schedule === 'string' ? JSON.parse(en.schedule) : (en.schedule || [])
                }))
            };
        });

        res.json(childrenWithData);
    } catch (err) {
        logger.error('Error fetching children with data', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 6. Parent Portal: Get Child Sessions (uses SQLite until Phase 2)
router.get('/child-sessions/:studentId', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentPhone = req.user.phone;

        const student = await prisma.student.findFirst({
            where: { id: studentId, parentPhone, deletedAt: null },
            select: { id: true }
        });
        if (!student) return res.status(403).json({ error: 'Unauthorized' });

        const sessions = await req.db.all('SELECT * FROM sessions WHERE studentId = ? ORDER BY date DESC', [studentId]);
        res.json(sessions);
    } catch (err) {
        logger.error('Error fetching child sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 7. Parent Portal: Get Child Invoices (uses SQLite until Phase 3)
router.get('/child-invoices/:studentId', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentPhone = req.user.phone;

        const student = await prisma.student.findFirst({
            where: { id: studentId, parentPhone, deletedAt: null },
            select: { id: true }
        });
        if (!student) return res.status(403).json({ error: 'Unauthorized' });

        const invoices = await req.db.all('SELECT * FROM student_invoices WHERE studentId = ? ORDER BY date DESC', [studentId]);
        res.json(invoices);
    } catch (err) {
        logger.error('Error fetching child invoices', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { parentRouter: router };