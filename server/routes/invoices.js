const express = require('express');
const router = express.Router();

// Using req.db from middleware


const logger = require('../utils/logger');
const validate = require('../middleware/validation');
const {
    createTeacherInvoiceSchema, updateTeacherInvoiceSchema,
    createStudentInvoiceSchema, updateStudentInvoiceSchema
} = require('../utils/validators');

// --- Teacher Invoices ---

router.get('/teacher', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            let sql = 'SELECT * FROM teacher_invoices';
            let countSql = 'SELECT COUNT(*) as total FROM teacher_invoices';
            let params = [];

            if (q) {
                const searchClause = ' WHERE lower(teacher) LIKE ?';
                sql += searchClause;
                countSql += searchClause;
                params.push(`%${q}%`);
            }

            sql += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?';
            const invoices = await req.db.all(sql, [...params, limit, offset]);
            const count = await req.db.get(countSql, params);

            res.json({
                data: invoices,
                total: count.total,
                page,
                limit,
                totalPages: Math.ceil(count.total / limit)
            });
        } else {
            const invoices = await req.db.all('SELECT * FROM teacher_invoices ORDER BY date DESC, id DESC');
            res.json(invoices);
        }
    } catch (err) {
        logger.error('Error fetching teacher invoices', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/teacher', validate(createTeacherInvoiceSchema), async (req, res) => {
    const body = req.body;
    const id = body.id || `inv_t_${Math.random().toString(36).substr(2, 7)}`;
    try {
        await req.db.run(
            `INSERT INTO teacher_invoices (id, teacherId, teacher, specialization, amount, paymentMethod, status, personalExpenses, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, body.teacherId || null, body.teacher, body.specialization, body.amount, body.paymentMethod, body.status, body.personalExpenses, body.date]
        );
        const newItem = await req.db.get('SELECT * FROM teacher_invoices WHERE id = ?', [id]);
        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding teacher invoice', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/teacher/:id', validate(updateTeacherInvoiceSchema), async (req, res) => {
    const { id } = req.params;
    const { teacher, specialization, amount, paymentMethod, status, personalExpenses, date } = req.body;
    try {
        const result = await req.db.run(
            `UPDATE teacher_invoices SET teacher = ?, specialization = ?, amount = ?, paymentMethod = ?, status = ?, personalExpenses = ?, date = ? WHERE id = ?`,
            [teacher, specialization, amount, paymentMethod, status, personalExpenses, date, id]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Invoice not found' });

        const updated = await req.db.get('SELECT * FROM teacher_invoices WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating teacher invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM teacher_invoices WHERE id = ?', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting teacher invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Student Invoices ---

router.get('/student', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const q = req.query.q ? req.query.q.trim().toLowerCase() : '';

        if (!isNaN(page) && !isNaN(limit)) {
            const offset = (page - 1) * limit;
            let sql = 'SELECT * FROM student_invoices';
            let countSql = 'SELECT COUNT(*) as total FROM student_invoices';
            let params = [];

            if (q) {
                const searchClause = ' WHERE lower(studentName) LIKE ?';
                sql += searchClause;
                countSql += searchClause;
                params.push(`%${q}%`);
            }

            sql += ' ORDER BY date DESC, dueDate ASC, id DESC LIMIT ? OFFSET ?';
            const invoices = await req.db.all(sql, [...params, limit, offset]);
            const count = await req.db.get(countSql, params);

            res.json({
                data: invoices,
                total: count.total,
                page,
                limit,
                totalPages: Math.ceil(count.total / limit)
            });
        } else {
            const invoices = await req.db.all('SELECT * FROM student_invoices ORDER BY date DESC, dueDate ASC, id DESC');
            res.json(invoices);
        }
    } catch (err) {
        logger.error('Error fetching student invoices', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/student', validate(createStudentInvoiceSchema), async (req, res) => {
    const body = req.body;
    const id = body.id || `inv_s_${Math.random().toString(36).substr(2, 7)}`;
    try {
        await req.db.run(
            `INSERT INTO student_invoices (id, studentId, studentName, amount, description, date, dueDate, status, paymentMethod, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, body.studentId || 'unknown', body.studentName, body.amount, body.description, body.date, body.dueDate, body.status, body.paymentMethod, body.notes]
        );
        const newItem = await req.db.get('SELECT * FROM student_invoices WHERE id = ?', [id]);
        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding student invoice', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/student/:id', validate(updateStudentInvoiceSchema), async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const result = await req.db.run(
            `UPDATE student_invoices SET studentId = ?, studentName = ?, amount = ?, description = ?, date = ?, dueDate = ?, status = ?, paymentMethod = ?, notes = ? WHERE id = ?`,
            [body.studentId, body.studentName, body.amount, body.description, body.date, body.dueDate, body.status, body.paymentMethod, body.notes, id]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Invoice not found' });

        const updated = await req.db.get('SELECT * FROM student_invoices WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating student invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/student/:id', validate(updateStudentInvoiceSchema), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await req.db.run(`UPDATE student_invoices SET status = ? WHERE id = ?`, [status, id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Invoice not found' });

        const updated = await req.db.get('SELECT * FROM student_invoices WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        logger.error('Error patching student invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/student/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM student_invoices WHERE id = ?', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting student invoice', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { invoiceRouter: router };

