const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// POST submit job application (public, no auth)
router.post('/', async (req, res) => {
    try {
        const { name, phone, whatsapp, position, qualification, grade, graduationYear, onlineYears, curriculums } = req.body;
        if (!name || !phone || !position || !qualification) {
            return res.status(400).json({ error: 'الاسم ورقم الهاتف والوظيفة والمؤهل مطلوبة' });
        }
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        await req.db.run(
            'INSERT INTO job_applications (id, name, phone, whatsapp, position, qualification, grade, graduationYear, onlineYears, curriculums, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, phone, whatsapp || '', position, qualification, grade || '', graduationYear || '', onlineYears || '', curriculums || '', createdAt]
        );
        res.status(201).json({ message: 'تم تقديم الطلب بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
