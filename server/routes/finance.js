const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Middleware to ensure DB is available
const ensureDb = (req, res, next) => {
    if (!req.db) {
        return res.status(500).json({ error: 'Database connection not available' });
    }
    next();
};

router.use(ensureDb);

// --- Manual Transactions Routes ---

// GET /api/finance/transactions - Fetch all manual transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await req.db.all('SELECT * FROM manual_transactions ORDER BY date DESC, created_at DESC');
        res.json(transactions);
    } catch (err) {
        logger.error('Error fetching transactions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/finance/transactions - Add a new transaction
router.post('/transactions', async (req, res) => {
    const { type, category, amount, date, description } = req.body;

    if (!type || !amount || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const status = 'completed';

    try {
        await req.db.run(
            `INSERT INTO manual_transactions (id, type, category, amount, date, description, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, type, category, amount, date, description || '', status]
        );

        const newTransaction = await req.db.get('SELECT * FROM manual_transactions WHERE id = ?', id);
        res.status(201).json(newTransaction);
    } catch (err) {
        logger.error('Error adding transaction', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/finance/transactions/:id - Delete a specific transaction
router.delete('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM manual_transactions WHERE id = ?', id);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        logger.error('Error deleting transaction', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/finance/transactions - Delete ALL transactions
router.delete('/transactions', async (req, res) => {
    try {
        await req.db.run('DELETE FROM manual_transactions');
        res.json({ message: 'All transactions deleted successfully' });
    } catch (err) {
        logger.error('Error deleting all transactions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Fixed Expenses Routes ---

// GET /api/finance/fixed-expenses - Fetch all fixed expenses
router.get('/fixed-expenses', async (req, res) => {
    try {
        const expenses = await req.db.all('SELECT * FROM fixed_expenses WHERE is_active = 1');
        res.json(expenses);
    } catch (err) {
        logger.error('Error fetching fixed expenses', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/finance/fixed-expenses/:id - Update an expense amount
router.put('/fixed-expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        await req.db.run('UPDATE fixed_expenses SET amount = ? WHERE id = ?', [amount, id]);
        const updated = await req.db.get('SELECT * FROM fixed_expenses WHERE id = ?', id);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating fixed expense', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/finance/fixed-expenses/reset - Reset all expenses to 0
router.post('/fixed-expenses/reset', async (req, res) => {
    try {
        await req.db.run('UPDATE fixed_expenses SET amount = 0');
        const expenses = await req.db.all('SELECT * FROM fixed_expenses WHERE is_active = 1');
        res.json(expenses);
    } catch (err) {
        logger.error('Error resetting fixed expenses', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
