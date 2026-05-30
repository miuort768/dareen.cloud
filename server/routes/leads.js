const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const validate = require('../middleware/validation');
const { createLeadSchema, updateLeadSchema } = require('../utils/validators');

const emitLeadUpdate = (req) => {
    const io = req.app.get('socketio');
    if (io) io.emit('lead_updated');
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const leads = await req.db.all('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(leads);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch leads');
    }
});

router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const leads = await req.db.all('SELECT status FROM leads');
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
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        const finalName = studentName?.trim() || 'عميل بدون اسم';
        await req.db.run(
            'INSERT INTO leads (id, studentName, phone, subject, curriculum, status, priority, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, finalName, phone, subject, curriculum || '', status || 'new', priority || 'medium', notes || '', createdAt]
        );
        const lead = await req.db.get('SELECT * FROM leads WHERE id = ?', [id]);
        emitLeadUpdate(req);
        res.status(201).json(lead);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create lead');
    }
});

router.put('/:id', authMiddleware, validate(updateLeadSchema), async (req, res) => {
    try {
        const { studentName, phone, subject, curriculum, status, priority, notes } = req.body;
        await req.db.run(
            'UPDATE leads SET studentName = COALESCE(?, studentName), phone = COALESCE(?, phone), subject = COALESCE(?, subject), curriculum = COALESCE(?, curriculum), status = COALESCE(?, status), priority = COALESCE(?, priority), notes = COALESCE(?, notes) WHERE id = ?',
            [studentName, phone, subject, curriculum, status, priority, notes, req.params.id]
        );
        const lead = await req.db.get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        emitLeadUpdate(req);
        res.json(lead);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update lead');
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await req.db.run('DELETE FROM leads WHERE id = ?', [req.params.id]);
        emitLeadUpdate(req);
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete lead');
    }
});

module.exports = router;
