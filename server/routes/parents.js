const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const ResponseHandler = require('../utils/responseHandler');
const { prisma } = require('../utils/prisma');
const { AUDIT_ACTIONS } = require('../constants/auditActions');

const parentSelect = { id: true, name: true, phone: true, email: true, username: true };

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
        const newItem = await prisma.parent.findUnique({ where: { id: newId }, select: parentSelect });
        req.audit({ action: AUDIT_ACTIONS.PARENT_CREATED, entityType: 'parent', entityId: newId, metadata: { name } });
        res.status(201).json(newItem);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.' });
        }
        logger.error('Error adding parent', err, { parent: name });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
        const updated = await prisma.parent.findUnique({ where: { id }, select: parentSelect });
        req.audit({ action: AUDIT_ACTIONS.PARENT_UPDATED, entityType: 'parent', entityId: req.params.id });
        res.json(updated);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.' });
        }
        logger.error('Error updating parent', err, { id });
        ResponseHandler.serverError(res, err, 'Update parent');
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.parent.update({ where: { id }, data: { deletedAt: new Date() } });
        req.audit({ action: AUDIT_ACTIONS.PARENT_DELETED, entityType: 'parent', entityId: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting parent', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/my-children', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
    try {
        const parentPhone = req.user.phone;
        const children = await prisma.student.findMany({
            where: { parentPhone, deletedAt: null },
            include: { enrollments: true }
        });
        const childrenWithData = children.map(child => {
            const { password, ...safe } = child;
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

router.get('/child-sessions/:studentId', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentPhone = req.user.phone;
        const student = await prisma.student.findFirst({
            where: { id: studentId, parentPhone, deletedAt: null },
            select: { id: true }
        });
        if (!student) return res.status(403).json({ error: 'Unauthorized' });
        const sessions = await prisma.session.findMany({
            where: { studentId },
            orderBy: { date: 'desc' }
        });
        res.json(sessions);
    } catch (err) {
        logger.error('Error fetching child sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/child-invoices/:studentId', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentPhone = req.user.phone;
        const student = await prisma.student.findFirst({
            where: { id: studentId, parentPhone, deletedAt: null },
            select: { id: true }
        });
        if (!student) return res.status(403).json({ error: 'Unauthorized' });
        const invoices = await prisma.studentInvoice.findMany({
            where: { studentId },
            orderBy: { date: 'desc' }
        });
        res.json(invoices);
    } catch (err) {
        logger.error('Error fetching child invoices', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { parentRouter: router };
