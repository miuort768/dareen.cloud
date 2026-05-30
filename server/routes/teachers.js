const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createTeacherSchema, updateTeacherSchema } = require('../utils/validators');

// Using req.db from middleware


// 1. Get all teachers (Admin only)
router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const teachers = await req.db.all('SELECT id, name, phone1, phone2, subject, price, email, username FROM teachers ORDER BY name ASC');
        res.json(teachers);
    } catch (err) {
        logger.error('Error fetching teachers', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add teacher
router.post('/', authMiddleware, checkRole(['admin']), validate(createTeacherSchema), async (req, res) => {
    const { id, name, phone1, phone2, subject, price, email, username, password } = req.body;
    const newId = id || `t_${require('crypto').randomBytes(4).toString('hex')}`;

    try {
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Handle empty strings as NULL for UNIQUE constraint
        const dbUsername = username && username.trim() !== '' ? username.trim() : null;
        const dbPassword = password && password.trim() !== '' ? await bcrypt.hash(password, 10) : null;

        await req.db.run(
            `INSERT INTO teachers (id, name, phone1, phone2, subject, price, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, name, phone1, phone2, subject, price || 0, email, dbUsername, dbPassword]
        );

        const newTeacher = await req.db.get(
            'SELECT id, name, phone1, phone2, subject, price, email, username FROM teachers WHERE id = ?',
            [newId]
        );
        res.status(201).json(newTeacher);
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed: teachers.username')) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
        }
        logger.error('Error adding teacher', err, { teacher: name });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// 3. Update teacher
router.put('/:id', authMiddleware, checkRole(['admin']), validate(updateTeacherSchema), async (req, res) => {
    const { id } = req.params;
    const { name, phone1, phone2, subject, price, email, username, password } = req.body;
    try {
        const dbUsername = username && username.trim() !== '' ? username.trim() : null;

        // Build dynamic update to avoid touching password if not changed
        const updateFields = { name, phone1, phone2, subject, price: price || 0, email, username: dbUsername };
        const keys = Object.keys(updateFields);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updateFields[k]);

        if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
            const dbPassword = await bcrypt.hash(password, 10);
            await req.db.run(
                `UPDATE teachers SET ${setClause}, password = ? WHERE id = ?`,
                [...values, dbPassword, id]
            );
        } else {
            await req.db.run(
                `UPDATE teachers SET ${setClause} WHERE id = ?`,
                [...values, id]
            );
        }
        const updated = await req.db.get('SELECT id, name, phone1, phone2, subject, price, email, username FROM teachers WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed: teachers.username')) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
        }
        logger.error('Error updating teacher', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// 4. Delete teacher
router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM teachers WHERE id = ?', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting teacher', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// 5. Delete all teachers (admin only)
router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await req.db.run('DELETE FROM teachers');
        res.json({ message: 'All teachers deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { teacherRouter: router };

