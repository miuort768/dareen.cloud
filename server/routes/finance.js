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

// --- Financial Stats & Aggregations (High Performance) ---

// GET /api/finance/stats - Get aggregated financial stats using SQL
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

        // 1. Total Income (Completed Sessions + Manual Income)
        const incomeResult = await req.db.get(`
            SELECT 
                (SELECT SUM(price) FROM sessions WHERE status = 'completed') as sessionIncome,
                (SELECT SUM(amount) FROM manual_transactions WHERE type = 'income' AND status = 'completed') as manualIncome
        `);
        const totalIncome = (incomeResult.sessionIncome || 0) + (incomeResult.manualIncome || 0);

        // 2. Current Month Income
        const monthIncomeResult = await req.db.get(`
            SELECT 
                (SELECT SUM(price) FROM sessions WHERE status = 'completed' AND date LIKE ?) as sessionMonthIncome,
                (SELECT SUM(amount) FROM manual_transactions WHERE type = 'income' AND status = 'completed' AND date LIKE ?) as manualMonthIncome
        `, [`${currentMonth}%`, `${currentMonth}%`]);
        const monthIncome = (monthIncomeResult.sessionMonthIncome || 0) + (monthIncomeResult.manualMonthIncome || 0);

        // 3. Total Expenses (Paid Invoices + Manual Expenses + Fixed Expenses)
        const expenseResult = await req.db.get(`
            SELECT 
                (SELECT SUM(amount) FROM teacher_invoices WHERE status IN ('paid', 'مدفوعة', 'تم الدفع')) as invoiceExpenses,
                (SELECT SUM(amount) FROM manual_transactions WHERE type = 'expense' AND status = 'completed') as manualExpenses,
                (SELECT SUM(amount) FROM fixed_expenses WHERE is_active = 1) as fixedExpenses
        `);
        const totalExpenses = (expenseResult.invoiceExpenses || 0) + (expenseResult.manualExpenses || 0) + (expenseResult.fixedExpenses || 0);

        // 4. Current Month Expenses
        const monthExpenseResult = await req.db.get(`
            SELECT 
                (SELECT SUM(amount) FROM teacher_invoices WHERE status IN ('paid', 'مدفوعة', 'تم الدفع') AND date LIKE ?) as invoiceMonthExpenses,
                (SELECT SUM(amount) FROM manual_transactions WHERE type = 'expense' AND status = 'completed' AND date LIKE ?) as manualMonthExpenses
        `, [`${currentMonth}%`, `${currentMonth}%`]);
        const monthExpenses = (monthExpenseResult.invoiceMonthExpenses || 0) + (monthExpenseResult.manualMonthExpenses || 0) + (expenseResult.fixedExpenses || 0);

        // 5. Monthly Data (Last 6 Months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = d.toISOString().slice(0, 7);
            const mLabel = d.toLocaleDateString('ar-EG', { month: 'short' });

            const mStats = await req.db.get(`
                SELECT 
                    (
                        SELECT IFNULL(SUM(price), 0) FROM sessions WHERE status = 'completed' AND date LIKE ?
                    ) + (
                        SELECT IFNULL(SUM(amount), 0) FROM manual_transactions WHERE type = 'income' AND status = 'completed' AND date LIKE ?
                    ) as income,
                    (
                        SELECT IFNULL(SUM(amount), 0) FROM teacher_invoices WHERE status IN ('paid', 'مدفوعة', 'تم الدفع') AND date LIKE ?
                    ) + (
                        SELECT IFNULL(SUM(amount), 0) FROM manual_transactions WHERE type = 'expense' AND status = 'completed' AND date LIKE ?
                    ) as expense
            `, [`${mStr}%`, `${mStr}%`, `${mStr}%`, `${mStr}%`]);

            monthlyData.push({
                month: mLabel,
                income: mStats.income,
                expense: mStats.expense
            });
        }

        // 6. Pie Data (Expenses by Category)
        const pieDataRaw = await req.db.all(`
            SELECT category as name, SUM(amount) as value 
            FROM manual_transactions 
            WHERE type = 'expense' AND status = 'completed'
            GROUP BY category
            UNION ALL
            SELECT 'رواتب معلمات' as name, SUM(amount) as value
            FROM teacher_invoices
            WHERE status IN ('paid', 'مدفوعة', 'تم الدفع')
            UNION ALL
            SELECT 'مصاريف ثابتة' as name, SUM(amount) as value
            FROM fixed_expenses
            WHERE is_active = 1
        `);

        res.json({
            totalIncome,
            monthIncome,
            totalExpenses,
            monthExpenses,
            netProfit: totalIncome - totalExpenses,
            monthProfit: monthIncome - monthExpenses,
            profitMargin: totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0',
            monthlyData,
            pieData: pieDataRaw.filter(d => d.value > 0)
        });

    } catch (err) {
        logger.error('Error calculating finance stats', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

