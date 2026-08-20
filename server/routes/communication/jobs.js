const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { sanitizeInput } = require('../../middleware/advanced');
const { prisma } = require('../../utils/prisma');
const { exportData } = require('../../services/exportService');

router.use(sanitizeInput);

router.post('/', async (req, res) => {
    try {
        const { name, phone, whatsapp, position, qualification, grade, graduationYear, onlineYears, curriculums, subject } = req.body;
        if (!name || !phone || !position || !qualification) {
            return res.status(400).json({ error: 'الاسم ورقم الهاتف والوظيفة والمؤهل مطلوبة' });
        }

        const existing = await prisma.jobApplication.findFirst({
            where: {
                OR: [
                    { phone },
                    { whatsapp: phone }
                ]
            }
        });
        if (existing) {
            return res.status(409).json({ error: 'هذا الرقم مسجل لدينا مسبقاً، يوجد طلب تقديم سابق' });
        }
        if (whatsapp && whatsapp !== phone) {
            const existingWhatsapp = await prisma.jobApplication.findFirst({
                where: {
                    OR: [
                        { phone: whatsapp },
                        { whatsapp }
                    ]
                }
            });
            if (existingWhatsapp) {
                return res.status(409).json({ error: 'رقم الواتساب مسجل لدينا مسبقاً، يوجد طلب تقديم سابق' });
            }
        }

        await prisma.jobApplication.create({
            data: {
                id: uuidv4(),
                name,
                phone,
                whatsapp: whatsapp || '',
                position,
                qualification,
                grade: grade || '',
                graduationYear: graduationYear || '',
                onlineYears: onlineYears || '',
                curriculums: curriculums || '',
                subject: subject || '',
            }
        });
        // Emit socket event for real-time admin updates
        try {
            const io = req.app.get('socketio');
            if (io) io.to('admin_room').emit('job_application_received');
        } catch (_) { /* socket not available */ }
        res.status(201).json({ message: 'تم تقديم الطلب بنجاح' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Submit job application');
    }
});

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const apps = await prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(apps);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch job applications');
    }
});

router.patch('/:id/contacted', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const app = await prisma.jobApplication.findUnique({ where: { id: req.params.id } });
        if (!app) return res.status(404).json({ error: 'الطلب غير موجود' });
        const newVal = app.contacted ? 0 : 1;
        await prisma.jobApplication.update({
            where: { id: req.params.id },
            data: { contacted: newVal }
        });
        res.json({ contacted: !!newVal });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Toggle job contacted');
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await prisma.jobApplication.delete({ where: { id: req.params.id } });
        res.json({ message: 'تم الحذف' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete job application');
    }
});

module.exports = router;
