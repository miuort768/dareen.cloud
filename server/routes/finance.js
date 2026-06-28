const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const cache = require('../utils/cache');
const { prisma } = require('../utils/prisma');

router.use(authMiddleware, checkRole(['admin']));

router.get('/transactions', async (req, res) => {
    try {
        const transactions = await prisma.manualTransaction.findMany({ orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] });
        res.json(transactions);
    } catch (err) {
        logger.error('Error fetching transactions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/transactions', async (req, res) => {
    const { type, category, amount, date, description } = req.body;
    if (!type || !amount || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    try {
        await prisma.manualTransaction.create({
            data: { id, type, category: category || '', amount, date, description: description || '', status: 'completed' }
        });
        cache.del('finance:stats');
        const newTransaction = await prisma.manualTransaction.findUnique({ where: { id } });
        res.status(201).json(newTransaction);
    } catch (err) {
        logger.error('Error adding transaction', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.manualTransaction.delete({ where: { id } });
        cache.del('finance:stats');
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        logger.error('Error deleting transaction', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/transactions', async (req, res) => {
    try {
        await prisma.manualTransaction.deleteMany();
        cache.del('finance:stats');
        res.json({ message: 'All transactions deleted successfully' });
    } catch (err) {
        logger.error('Error deleting all transactions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/fixed-expenses', async (req, res) => {
    try {
        const expenses = await prisma.fixedExpense.findMany({ where: { isActive: 1 } });
        res.json(expenses);
    } catch (err) {
        logger.error('Error fetching fixed expenses', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/fixed-expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    if (amount === undefined) {
        return res.status(400).json({ error: 'Amount is required' });
    }
    try {
        await prisma.fixedExpense.update({ where: { id: parseInt(id) }, data: { amount } });
        cache.del('finance:stats');
        const updated = await prisma.fixedExpense.findUnique({ where: { id: parseInt(id) } });
        res.json(updated);
    } catch (err) {
        logger.error('Error updating fixed expense', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/fixed-expenses/reset', async (req, res) => {
    try {
        await prisma.fixedExpense.updateMany({ data: { amount: 0 } });
        cache.del('finance:stats');
        const expenses = await prisma.fixedExpense.findMany({ where: { isActive: 1 } });
        res.json(expenses);
    } catch (err) {
        logger.error('Error resetting fixed expenses', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const cached = cache.get('finance:stats');
        if (cached) return res.json(cached);

        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);

        const [
            sessionIncomeAgg,
            manualIncomeAgg,
            invoiceExpenseAgg,
            manualExpenseAgg,
            fixedExpenseAgg,
            monthSessionAgg,
            monthManualIncomeAgg,
            monthInvoiceExpenseAgg,
            monthManualExpenseAgg,
            expenseByCat,
            teacherPieAgg,
            fixedPieAgg,
        ] = await Promise.all([
            prisma.session.aggregate({ where: { status: 'completed' }, _sum: { price: true } }),
            prisma.manualTransaction.aggregate({ where: { type: 'income', status: 'completed' }, _sum: { amount: true } }),
            prisma.teacherInvoice.aggregate({ where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] } }, _sum: { amount: true } }),
            prisma.manualTransaction.aggregate({ where: { type: 'expense', status: 'completed' }, _sum: { amount: true } }),
            prisma.fixedExpense.aggregate({ where: { isActive: 1 }, _sum: { amount: true } }),
            prisma.session.aggregate({ where: { status: 'completed', date: { startsWith: currentMonth } }, _sum: { price: true } }),
            prisma.manualTransaction.aggregate({ where: { type: 'income', status: 'completed', date: { startsWith: currentMonth } }, _sum: { amount: true } }),
            prisma.teacherInvoice.aggregate({ where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] }, date: { startsWith: currentMonth } }, _sum: { amount: true } }),
            prisma.manualTransaction.aggregate({ where: { type: 'expense', status: 'completed', date: { startsWith: currentMonth } }, _sum: { amount: true } }),
            prisma.manualTransaction.groupBy({ by: ['category'], where: { type: 'expense', status: 'completed' }, _sum: { amount: true } }),
            prisma.teacherInvoice.aggregate({ where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] } }, _sum: { amount: true } }),
            prisma.fixedExpense.aggregate({ where: { isActive: 1 }, _sum: { amount: true } }),
        ]);

        const totalIncome = (sessionIncomeAgg._sum.price || 0) + (manualIncomeAgg._sum.amount || 0);
        const monthIncome = (monthSessionAgg._sum.price || 0) + (monthManualIncomeAgg._sum.amount || 0);
        const totalExpenses = (invoiceExpenseAgg._sum.amount || 0) + (manualExpenseAgg._sum.amount || 0) + (fixedExpenseAgg._sum.amount || 0);
        const monthExpenses = (monthInvoiceExpenseAgg._sum.amount || 0) + (monthManualExpenseAgg._sum.amount || 0) + (fixedExpenseAgg._sum.amount || 0);

        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = d.toISOString().slice(0, 7);
            const mLabel = d.toLocaleDateString('ar-EG', { month: 'short' });

            const [mS, mI, mTi, mE] = await Promise.all([
                prisma.session.aggregate({ where: { status: 'completed', date: { startsWith: mStr } }, _sum: { price: true } }),
                prisma.manualTransaction.aggregate({ where: { type: 'income', status: 'completed', date: { startsWith: mStr } }, _sum: { amount: true } }),
                prisma.teacherInvoice.aggregate({ where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] }, date: { startsWith: mStr } }, _sum: { amount: true } }),
                prisma.manualTransaction.aggregate({ where: { type: 'expense', status: 'completed', date: { startsWith: mStr } }, _sum: { amount: true } }),
            ]);

            monthlyData.push({
                month: mLabel,
                income: (mS._sum.price || 0) + (mI._sum.amount || 0),
                expense: (mTi._sum.amount || 0) + (mE._sum.amount || 0),
            });
        }

        const pieData = [
            ...expenseByCat.map(e => ({ name: e.category, value: e._sum.amount || 0 })),
            { name: 'رواتب معلمات', value: teacherPieAgg._sum.amount || 0 },
            { name: 'مصاريف ثابتة', value: fixedPieAgg._sum.amount || 0 },
        ].filter(d => d.value > 0);

        const result = {
            totalIncome,
            monthIncome,
            totalExpenses,
            monthExpenses,
            netProfit: totalIncome - totalExpenses,
            monthProfit: monthIncome - monthExpenses,
            profitMargin: totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0',
            monthlyData,
            pieData,
        };
        cache.set('finance:stats', result, 300000);
        res.json(result);
    } catch (err) {
        logger.error('Error calculating finance stats', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
