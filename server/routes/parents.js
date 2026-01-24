const express = require('express');
const router = express.Router();

// Using req.db from middleware


const logger = require('../utils/logger');

// 1. Get all parents
router.get('/', async (req, res) => {
    try {
        const parents = await req.db.all('SELECT * FROM parents ORDER BY name ASC');
        res.json(parents);
    } catch (err) {
        logger.error('Error fetching parents', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add parent
router.post('/', async (req, res) => {
    const { id, name, phone, email, username, password } = req.body;
    const bcrypt = require('bcrypt');
    const dbUsername = username || phone;
    const dbPassword = password || '123456';
    const hashedPassword = await bcrypt.hash(dbPassword, 10);

    const { v4: uuidv4 } = require('uuid');
    const newId = id || uuidv4();
    try {
        await req.db.run(
            `INSERT INTO parents (id, name, phone, email, username, password) VALUES (?, ?, ?, ?, ?, ?)`,
            [newId, name, phone, email || '', dbUsername, hashedPassword]
        );
        const newItem = await req.db.get('SELECT * FROM parents WHERE id = ?', [newId]);
        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding parent', err, { parent: name });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update parent
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, username, password } = req.body;
    const bcrypt = require('bcrypt');

    try {
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await req.db.run(
                `UPDATE parents SET name = ?, phone = ?, email = ?, username = ?, password = ? WHERE id = ?`,
                [name, phone, email || '', username || phone, hashedPassword, id]
            );
        } else {
            await req.db.run(
                `UPDATE parents SET name = ?, phone = ?, email = ?, username = ? WHERE id = ?`,
                [name, phone, email || '', username || phone, id]
            );
        }
        const updated = await req.db.get('SELECT id, name, phone, email, username FROM parents WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        console.error('SERVER UPDATE PARENT ERROR:', err);
        logger.error('Error updating parent', err, { id });
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 4. Delete parent
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM parents WHERE id = ?', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting parent', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. Parent Portal: Get Children (with deep data)
router.get('/my-children', async (req, res) => {
    try {
        const parentPhone = req.user.phone;
        const children = await req.db.all('SELECT * FROM students WHERE parentPhone = ?', [parentPhone]);

        // Deep fetch enrollments for each child
        const childrenWithData = await Promise.all(children.map(async (child) => {
            const enrollments = await req.db.all('SELECT * FROM enrollments WHERE studentId = ?', [child.id]);
            // Parse schedule JSON if it exists
            const enrollmentsWithParsedData = enrollments.map(en => ({
                ...en,
                schedule: en.schedule ? (typeof en.schedule === 'string' ? JSON.parse(en.schedule) : en.schedule) : []
            }));
            return {
                ...child,
                enrollments: enrollmentsWithParsedData
            };
        }));

        res.json(childrenWithData);
    } catch (err) {
        logger.error('Error fetching children with data', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 6. Parent Portal: Get Child Sessions
router.get('/child-sessions/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentPhone = req.user.phone;

        // Security check: ensure student belongs to parent
        const student = await req.db.get('SELECT id FROM students WHERE id = ? AND parentPhone = ?', [studentId, parentPhone]);
        if (!student) return res.status(403).json({ error: 'Unauthorized' });

        const sessions = await req.db.all('SELECT * FROM sessions WHERE studentId = ? ORDER BY date DESC', [studentId]);
        res.json(sessions);
    } catch (err) {
        logger.error('Error fetching child sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 7. Parent Portal: Get Child Invoices
router.get('/child-invoices/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentPhone = req.user.phone;

        // Security check
        const student = await req.db.get('SELECT id FROM students WHERE id = ? AND parentPhone = ?', [studentId, parentPhone]);
        if (!student) return res.status(403).json({ error: 'Unauthorized' });

        const invoices = await req.db.all('SELECT * FROM student_invoices WHERE studentId = ? ORDER BY date DESC', [studentId]);
        res.json(invoices);
    } catch (err) {
        logger.error('Error fetching child invoices', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { parentRouter: router };

