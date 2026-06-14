const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../middleware/advanced');

router.use(sanitizeInput);

router.post('/', async (req, res) => {
    try {
        const { name, phone, subject, message } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
        }

        const id = uuidv4();
        const createdAt = new Date().toISOString();
        await req.db.run(
            'INSERT INTO contact_messages (id, name, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name || '', phone, subject || '', message || '', createdAt]
        );
        res.status(201).json({ message: 'تم إرسال الرسالة بنجاح' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Submit contact message');
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const messages = await req.db.all('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch contact messages');
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await req.db.run('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
        res.json({ message: 'تم الحذف' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete contact message');
    }
});

module.exports = router;
