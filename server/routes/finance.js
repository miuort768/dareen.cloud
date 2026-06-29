const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const cache = require('../utils/cache');
const currencyService = require('../services/currencyService');
const { prisma } = require('../utils/prisma');
const { audit } = require('../services/auditService');

router.use(authMiddleware, checkRole(['admin']));

router.get('/transactions', async (req, res) => {
    try {
        const transactions = await prisma.manualTransaction.findMany({
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
        });
        res.json(transactions);
    } catch (err) {
        logger.error('Error fetching transactions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/transactions', async (req, res) => {
    const { type, category, amount, date, description, currency } = req.body;
    if (!type || !amount || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = uuidv4();
    try {
        const newTransaction = await prisma.manualTransaction.create({
            data: {
                id,
                type,
                category: category || '',
                amount: parseFloat(amount),
                date,
                description: description || '',
                status: 'completed',
                currency: currency || null,
            }
        });
        cache.del('finance:stats');
        await audit(req.user.id, req.user.username, 'TRANSACTION_CREATE', { transactionId: id, type, amount, currency, date }, 'manual_transaction', id);
        res.status(201).json(newTransaction);
    } catch (err) {
        logger.error('Error adding transaction', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await prisma.manualTransaction.findUnique({ where: { id } });
        await prisma.manualTransaction.delete({ where: { id } });
        cache.del('finance:stats');
        await audit(req.user.id, req.user.username, 'TRANSACTION_DELETE', { transactionId: id, deleted }, 'manual_transaction', id);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        logger.error('Error deleting transaction', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/transactions', async (req, res) => {
    try {
        const { count } = await prisma.manualTransaction.deleteMany();
        cache.del('finance:stats');
        await audit(req.user.id, req.user.username, 'TRANSACTION_DELETE_ALL', { count }, 'manual_transaction', null);
        res.json({ message: 'All transactions deleted successfully' });
    } catch (err) {
        logger.error('Error deleting all transactions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/fixed-expenses', async (req, res) => {
    try {
        const expenses = await prisma.fixedExpense.findMany({
            where: { isActive: 1 }
        });
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
        const before = await prisma.fixedExpense.findUnique({ where: { id: parseInt(id) } });
        const updated = await prisma.fixedExpense.update({
            where: { id: parseInt(id) },
            data: { amount: parseFloat(amount) }
        });
        cache.del('finance:stats');
        await audit(req.user.id, req.user.username, 'EXPENSE_UPDATE', { expenseId: id, name: before?.name, before: before?.amount, after: amount }, 'fixed_expense', id);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating fixed expense', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/fixed-expenses/reset', async (req, res) => {
    try {
        await prisma.fixedExpense.updateMany({
            where: { isActive: 1 },
            data: { amount: 0 }
        });
        cache.del('finance:stats');
        await audit(req.user.id, req.user.username, 'EXPENSE_RESET', null, 'fixed_expense', null);
        const expenses = await prisma.fixedExpense.findMany({
            where: { isActive: 1 }
        });
        res.json(expenses);
    } catch (err) {
        logger.error('Error resetting fixed expenses', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function convertItems(items, amountField, currencyField, defaultCurrency, reportCurrency) {
    let total = 0;
    if (!items || items.length === 0) return total;
    const conversions = items.map(async (item) => {
        const amount = item[amountField] || 0;
        const currency = item[currencyField] || defaultCurrency;
        if (amount === 0) return 0;
        const converted = await currencyService.convert(amount, currency, reportCurrency);
        return converted;
    });
    const results = await Promise.all(conversions);
    return results.reduce((sum, v) => sum + v, 0);
}

router.get('/stats', async (req, res) => {
    try {
        const cached = cache.get('finance:stats');
        if (cached) return res.json(cached);

        const reportCurrency = await currencyService.getReportCurrency();
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);

        const [sessions, manualIncomes, teacherInvoices, manualExpenses, fixedExpenses] = await Promise.all([
            prisma.session.findMany({
                where: { status: 'completed' },
                select: { price: true, studentCurrency: true, date: true }
            }),
            prisma.manualTransaction.findMany({
                where: { type: 'income', status: 'completed' },
                select: { amount: true, currency: true, date: true }
            }),
            prisma.teacherInvoice.findMany({
                where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] } },
                select: { amount: true, currency: true, date: true }
            }),
            prisma.manualTransaction.findMany({
                where: { type: 'expense', status: 'completed' },
                select: { amount: true, currency: true, date: true, category: true }
            }),
            prisma.fixedExpense.findMany({
                where: { isActive: 1 },
                select: { amount: true, currency: true }
            }),
        ]);

        const monthSessions = sessions.filter(s => s.date && s.date.startsWith(currentMonth));
        const monthManualIncomes = manualIncomes.filter(t => t.date && t.date.startsWith(currentMonth));
        const monthTeacherInvoices = teacherInvoices.filter(i => i.date && i.date.startsWith(currentMonth));
        const monthManualExpenses = manualExpenses.filter(t => t.date && t.date.startsWith(currentMonth));

        const [sessionIncome, manualIncomeTotal] = await Promise.all([
            convertItems(sessions, 'price', 'studentCurrency', 'KWD', reportCurrency),
            convertItems(manualIncomes, 'amount', 'currency', 'KWD', reportCurrency),
        ]);
        const [mSessionIncome, mManualIncomeTotal] = await Promise.all([
            convertItems(monthSessions, 'price', 'studentCurrency', 'KWD', reportCurrency),
            convertItems(monthManualIncomes, 'amount', 'currency', 'KWD', reportCurrency),
        ]);
        const [invoiceExpense, manualExpenseTotal, fixedExpenseTotal] = await Promise.all([
            convertItems(teacherInvoices, 'amount', 'currency', 'EGP', reportCurrency),
            convertItems(manualExpenses, 'amount', 'currency', 'KWD', reportCurrency),
            convertItems(fixedExpenses, 'amount', 'currency', 'KWD', reportCurrency),
        ]);
        const [mInvoiceExpense, mManualExpenseTotal] = await Promise.all([
            convertItems(monthTeacherInvoices, 'amount', 'currency', 'EGP', reportCurrency),
            convertItems(monthManualExpenses, 'amount', 'currency', 'KWD', reportCurrency),
        ]);

        const totalIncome = sessionIncome + manualIncomeTotal;
        const monthIncome = mSessionIncome + mManualIncomeTotal;
        const totalExpenses = invoiceExpense + manualExpenseTotal + fixedExpenseTotal;
        const monthExpenses = mInvoiceExpense + mManualExpenseTotal + fixedExpenseTotal;

        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = d.toISOString().slice(0, 7);
            const mLabel = d.toLocaleDateString('ar-EG', { month: 'short' });

            const mSessions = sessions.filter(s => s.date && s.date.startsWith(mStr));
            const mIncomes = manualIncomes.filter(t => t.date && t.date.startsWith(mStr));
            const mInvoices = teacherInvoices.filter(i => i.date && i.date.startsWith(mStr));
            const mExpenses = manualExpenses.filter(t => t.date && t.date.startsWith(mStr));

            const [mSessConv, mIncConv, mInvConv, mExpConv] = await Promise.all([
                convertItems(mSessions, 'price', 'studentCurrency', 'KWD', reportCurrency),
                convertItems(mIncomes, 'amount', 'currency', 'KWD', reportCurrency),
                convertItems(mInvoices, 'amount', 'currency', 'EGP', reportCurrency),
                convertItems(mExpenses, 'amount', 'currency', 'KWD', reportCurrency),
            ]);

            monthlyData.push({ month: mLabel, income: mSessConv + mIncConv, expense: mInvConv + mExpConv });
        }

        const catMap = {};
        const catConversions = manualExpenses.map(async (e) => {
            const cat = e.category || 'أخرى';
            const converted = await currencyService.convert(e.amount || 0, e.currency || 'KWD', reportCurrency);
            catMap[cat] = (catMap[cat] || 0) + converted;
        });
        await Promise.all(catConversions);

        const pieData = [
            ...Object.entries(catMap).map(([name, value]) => ({ name, value })),
            { name: 'رواتب معلمات', value: invoiceExpense },
            { name: 'مصاريف ثابتة', value: fixedExpenseTotal },
        ].filter(d => d.value > 0);

        const result = {
            totalIncome: await currencyService.roundMoney(totalIncome),
            monthIncome: await currencyService.roundMoney(monthIncome),
            totalExpenses: await currencyService.roundMoney(totalExpenses),
            monthExpenses: await currencyService.roundMoney(monthExpenses),
            netProfit: await currencyService.roundMoney(totalIncome - totalExpenses),
            monthProfit: await currencyService.roundMoney(monthIncome - monthExpenses),
            profitMargin: totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0',
            reportCurrency,
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
