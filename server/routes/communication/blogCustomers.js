const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const { sanitizeInput } = require('../../middleware/advanced');
const { prisma } = require('../../utils/prisma');
const { createRateLimiter } = require('../../middleware/rateLimiter');

const SUPPORTED_COUNTRIES = ['الكويت', 'السعودية', 'قطر', 'الإمارات', 'عمان'];

const ARABIC_DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };

const normalizePhone = (phone) => String(phone || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[٠-٩]/g, d => ARABIC_DIGITS[d]);

const subscribeLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'لقد تجاوزت عدد محاولات الاشتراك، يرجى المحاولة لاحقاً'
});

router.use(sanitizeInput);

router.post('/', subscribeLimiter, async (req, res) => {
    try {
        const { country, phone } = req.body || {};
        const normalizedPhone = normalizePhone(phone);
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

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const customers = await prisma.blogCustomer.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(customers);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch blog customers');
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await prisma.blogCustomer.delete({ where: { id: req.params.id } });
        res.json({ message: 'تم الحذف' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete blog customer');
    }
});

module.exports = router;
