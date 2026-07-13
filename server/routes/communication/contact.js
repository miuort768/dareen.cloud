const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { sanitizeInput } = require('../../middleware/advanced');
const { prisma } = require('../../utils/prisma');

router.use(sanitizeInput);

router.post('/', async (req, res) => {
    try {
        const { name, phone, subject, message, curriculum } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
        }
        await prisma.contactMessage.create({
            data: {
                id: uuidv4(),
                name: name || '',
                phone,
                subject: subject || '',
                message: message || '',
                curriculum: curriculum || '',
            }
        });
        res.status(201).json({ message: 'تم إرسال الرسالة بنجاح' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Submit contact message');
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(messages);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch contact messages');
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.contactMessage.delete({ where: { id: req.params.id } });
        res.json({ message: 'تم الحذف' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete contact message');
    }
});

module.exports = router;
