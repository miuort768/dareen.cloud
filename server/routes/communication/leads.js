const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const validate = require('../../middleware/validation');
const { createLeadSchema, updateLeadSchema } = require('../../utils/validators');
const { prisma } = require('../../utils/prisma');

const emitLeadUpdate = (req) => {
    const io = req.app.get('socketio');
    if (io) io.to('admin_room').emit('lead_updated');
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(leads);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch leads');
    }
});

router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({ select: { status: true } });
        const total = leads.length;
        const newCount = leads.filter(l => l.status === 'new').length;
        const interested = leads.filter(l => l.status === 'interested').length;
        const converted = leads.filter(l => l.status === 'converted').length;
        const conversionRate = total > 0 ? (converted / total) * 100 : 0;
        res.json({ total, new: newCount, interested, converted, conversionRate });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch lead stats');
    }
});

router.post('/', authMiddleware, validate(createLeadSchema), async (req, res) => {
    try {
        const { studentName, phone, subject, curriculum, status, priority, notes } = req.body;
        const finalName = studentName?.trim() || 'عميل بدون اسم';
        const lead = await prisma.lead.create({
            data: {
                id: uuidv4(),
                studentName: finalName,
                phone,
                subject: subject || '',
                curriculum: curriculum || '',
                status: status || 'new',
                priority: priority || 'medium',
                notes: notes || '',
            }
        });
        emitLeadUpdate(req);
        res.status(201).json(lead);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create lead');
    }
});

router.put('/:id', authMiddleware, validate(updateLeadSchema), async (req, res) => {
    try {
        const { studentName, phone, subject, curriculum, status, priority, notes } = req.body;
        const updateData = {};
        if (studentName !== undefined) updateData.studentName = studentName;
        if (phone !== undefined) updateData.phone = phone;
        if (subject !== undefined) updateData.subject = subject;
        if (curriculum !== undefined) updateData.curriculum = curriculum;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (notes !== undefined) updateData.notes = notes;

        await prisma.lead.update({
            where: { id: req.params.id },
            data: updateData
        });
        const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
        emitLeadUpdate(req);
        res.json(lead);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update lead');
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await prisma.lead.delete({ where: { id: req.params.id } });
        emitLeadUpdate(req);
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete lead');
    }
});

module.exports = router;
