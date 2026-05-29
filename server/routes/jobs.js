const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');

// POST submit job application (public, no auth)
router.post('/', async (req, res) => {
    try {
        const { name, phone, whatsapp, position, qualification, grade, graduationYear, onlineYears, curriculums, subject } = req.body;
        if (!name || !phone || !position || !qualification) {
            return res.status(400).json({ error: 'الاسم ورقم الهاتف والوظيفة والمؤهل مطلوبة' });
        }

        // Check if phone or whatsapp already exists
        const existing = await req.db.get(
            'SELECT id, name, created_at FROM job_applications WHERE phone = ? OR (whatsapp != "" AND whatsapp = ?)',
            [phone, phone]
        );
        if (existing) {
            return res.status(409).json({ error: 'هذا الرقم مسجل لدينا مسبقاً، يوجد طلب تقديم سابق' });
        }
        if (whatsapp && whatsapp !== phone) {
            const existingWhatsapp = await req.db.get(
                'SELECT id, name, created_at FROM job_applications WHERE phone = ? OR (whatsapp != "" AND whatsapp = ?)',
                [whatsapp, whatsapp]
            );
            if (existingWhatsapp) {
                return res.status(409).json({ error: 'رقم الواتساب مسجل لدينا مسبقاً، يوجد طلب تقديم سابق' });
            }
        }

        const id = uuidv4();
        const createdAt = new Date().toISOString();
        await req.db.run(
            'INSERT INTO job_applications (id, name, phone, whatsapp, position, qualification, grade, graduationYear, onlineYears, curriculums, subject, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, phone, whatsapp || '', position, qualification, grade || '', graduationYear || '', onlineYears || '', curriculums || '', subject || '', createdAt]
        );
        res.status(201).json({ message: 'تم تقديم الطلب بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all applications (authenticated)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const apps = await req.db.all('SELECT * FROM job_applications ORDER BY created_at DESC');
        res.json(apps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH toggle contacted status
router.patch('/:id/contacted', authMiddleware, async (req, res) => {
    try {
        const app = await req.db.get('SELECT contacted FROM job_applications WHERE id = ?', [req.params.id]);
        if (!app) return res.status(404).json({ error: 'الطلب غير موجود' });
        const newVal = app.contacted ? 0 : 1;
        await req.db.run('UPDATE job_applications SET contacted = ? WHERE id = ?', [newVal, req.params.id]);
        res.json({ contacted: !!newVal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE an application
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await req.db.run('DELETE FROM job_applications WHERE id = ?', [req.params.id]);
        res.json({ message: 'تم الحذف' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
