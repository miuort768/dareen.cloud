const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const { sanitizeInput } = require('../../middleware/advanced');
const { prisma } = require('../../utils/prisma');

const SUPPORTED_COUNTRIES = ['الكويت', 'السعودية', 'قطر', 'الإمارات', 'عمان'];

router.use(sanitizeInput);

router.post('/', async (req, res) => {
    try {
        const { country, phone } = req.body || {};
        const normalizedPhone = String(phone || '').replace(/\s/g, '').trim();
        if (!SUPPORTED_COUNTRIES.includes(country)) {
            return res.status(400).json({ error: 'يرجى اختيار الدولة من القائمة' });
        }
        if (!normalizedPhone || normalizedPhone.replace(/\D/g, '').length < 8) {
            return res.status(400).json({ error: 'يرجى إدخال رقم هاتف صحيح' });
        }
        const existing = await prisma.blogCustomer.findFirst({
            where: { phone: normalizedPhone }
        });
        if (existing) {
            return res.json({ message: 'تم تسجيل بياناتك بنجاح', alreadyExists: true });
        }
        await prisma.blogCustomer.create({
            data: {
                id: uuidv4(),
                country,
                phone: normalizedPhone,
            }
        });
        res.status(201).json({ message: 'تم تسجيل بياناتك بنجاح' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Subscribe blog customer');
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const customers = await prisma.blogCustomer.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(customers);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch blog customers');
    }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
    const roles = ['admin'];
    if (!roles.includes(req.user.role) && !req.user.permissions?.includes('*')) {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    try {
        await prisma.blogCustomer.delete({ where: { id: req.params.id } });
        res.json({ message: 'تم الحذف' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete blog customer');
    }
});

module.exports = router;
