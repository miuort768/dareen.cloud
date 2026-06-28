const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authMiddleware, checkRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const validate = require('../middleware/validation');
const {
    createTeacherInvoiceSchema, updateTeacherInvoiceSchema,
    createStudentInvoiceSchema, updateStudentInvoiceSchema
} = require('../utils/validators');
const { prisma } = require('../utils/prisma');

router.use(authMiddleware);
router.use(checkRole(['admin']));

// --- Teacher Invoices ---

router.get('/teacher', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
        const where = {};

        if (q) {
            where.teacherName = { contains: q };
        }

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            const [invoices, total] = await Promise.all([
                prisma.teacherInvoice.findMany({ where, orderBy: [{ date: 'desc' }, { id: 'desc' }], skip: offset, take: limit }),
                prisma.teacherInvoice.count({ where })
            ]);
            res.json({ data: invoices, total, page, limit, totalPages: Math.ceil(total / limit) });
        } else {
            const invoices = await prisma.teacherInvoice.findMany({ where, orderBy: [{ date: 'desc' }, { id: 'desc' }] });
            res.json(invoices);
        }
    } catch (err) {
        logger.error('Error fetching teacher invoices', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/teacher', validate(createTeacherInvoiceSchema), async (req, res) => {
    const body = req.body;
    const id = body.id || `inv_t_${crypto.randomBytes(4).toString('hex')}`;
    try {
        await prisma.teacherInvoice.create({
            data: {
                id,
                teacherId: body.teacherId || '',
                teacherName: body.teacher,
                specialization: body.specialization || '',
                amount: body.amount,
                paymentMethod: body.paymentMethod || '',
                status: body.status || 'unpaid',
                personalExpenses: body.personalExpenses ?? 0,
                date: body.date,
            }
        });
        const newItem = await prisma.teacherInvoice.findUnique({ where: { id } });
        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding teacher invoice', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/teacher/:id', validate(updateTeacherInvoiceSchema), async (req, res) => {
    const { id } = req.params;
    const { teacher, specialization, amount, paymentMethod, status, personalExpenses, date } = req.body;
    try {
        const existing = await prisma.teacherInvoice.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Invoice not found' });

        await prisma.teacherInvoice.update({
            where: { id },
            data: {
                teacherName: teacher,
                specialization: specialization || '',
                amount,
                paymentMethod: paymentMethod || '',
                status: status || 'unpaid',
                personalExpenses: personalExpenses ?? 0,
                date,
            }
        });
        const updated = await prisma.teacherInvoice.findUnique({ where: { id } });
        res.json(updated);
    } catch (err) {
        logger.error('Error updating teacher invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.teacherInvoice.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting teacher invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Student Invoices ---

router.get('/student', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';
        const where = {};

        if (q) {
            where.studentName = { contains: q };
        }

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            const [invoices, total] = await Promise.all([
                prisma.studentInvoice.findMany({ where, orderBy: [{ date: 'desc' }, { dueDate: 'asc' }, { id: 'desc' }], skip: offset, take: limit }),
                prisma.studentInvoice.count({ where })
            ]);
            const parsed = invoices.map(inv => ({
                ...inv, items: inv.items ? JSON.parse(inv.items) : []
            }));
            res.json({ data: parsed, total, page, limit, totalPages: Math.ceil(total / limit) });
        } else {
            const invoices = await prisma.studentInvoice.findMany({ where, orderBy: [{ date: 'desc' }, { dueDate: 'asc' }, { id: 'desc' }] });
            const parsed = invoices.map(inv => ({
                ...inv, items: inv.items ? JSON.parse(inv.items) : []
            }));
            res.json(parsed);
        }
    } catch (err) {
        logger.error('Error fetching student invoices', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/student', validate(createStudentInvoiceSchema), async (req, res) => {
    const body = req.body;
    if (!body.studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }
    const id = body.id || `inv_s_${crypto.randomBytes(4).toString('hex')}`;
    try {
        const items = body.items ? (typeof body.items === 'string' ? body.items : JSON.stringify(body.items)) : null;
        await prisma.studentInvoice.create({
            data: {
                id, studentId: body.studentId, studentName: body.studentName || '',
                amount: body.amount, description: body.description || '',
                date: body.date, dueDate: body.dueDate || '',
                status: body.status || 'unpaid', paymentMethod: body.paymentMethod || '',
                notes: body.notes || '', items,
            }
        });
        const newItem = await prisma.studentInvoice.findUnique({ where: { id } });
        if (newItem && newItem.items) newItem.items = JSON.parse(newItem.items);
        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding student invoice', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/student/:id', validate(updateStudentInvoiceSchema), async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const existing = await prisma.studentInvoice.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Invoice not found' });

        const items = body.items ? (typeof body.items === 'string' ? body.items : JSON.stringify(body.items)) : null;
        await prisma.studentInvoice.update({
            where: { id },
            data: {
                studentId: body.studentId, studentName: body.studentName || '',
                amount: body.amount, description: body.description || '',
                date: body.date, dueDate: body.dueDate || '',
                status: body.status || 'unpaid', paymentMethod: body.paymentMethod || '',
                notes: body.notes || '', items,
            }
        });
        const updated = await prisma.studentInvoice.findUnique({ where: { id } });
        if (updated && updated.items) updated.items = JSON.parse(updated.items);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating student invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/student/:id', validate(updateStudentInvoiceSchema), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }
    try {
        const existing = await prisma.studentInvoice.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Invoice not found' });

        await prisma.studentInvoice.update({ where: { id }, data: { status } });
        const updated = await prisma.studentInvoice.findUnique({ where: { id } });
        res.json(updated);
    } catch (err) {
        logger.error('Error patching student invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/student/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.studentInvoice.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting student invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { invoiceRouter: router };
