const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../utils/prisma');
const cache = require('./cacheService');
const { audit } = require('./auditService');
const currencyService = require('./currencyService');
const logger = require('../utils/logger');

const FINANCE_CACHE_TTL = 60;

/**
 * Tolerant numeric coercion — Eastern-Arabic digits ("١٦٠"/"۱۶۰") parse to NaN
 * with Number()/parseFloat(); normalize to ASCII digits first.
 */
function parseTolerantNumber(val) {
  const s = String(val ?? '')
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function ctx(user) {
  return { userId: user.id, username: user.username };
}

async function getTransactions() {
  return prisma.manualTransaction.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

async function createTransaction(data, user) {
  const { type, category, amount, date, description, currency } = data;

  if (!type || !amount || !date) {
    throw Object.assign(new Error('Missing required fields'), { statusCode: 400 });
  }
  if (!['income', 'expense'].includes(type)) {
    throw Object.assign(new Error('type يجب أن يكون income أو expense فقط'), { statusCode: 400 });
  }
  const parsedAmount = parseTolerantNumber(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw Object.assign(new Error('amount يجب أن يكون رقماً موجباً'), { statusCode: 400 });
  }

  const id = uuidv4();
  const newTransaction = await prisma.manualTransaction.create({
    data: {
      id, type,
      category: category || '',
      amount: parsedAmount,
      date,
      description: description || '',
      status: 'completed',
      currency: currency || null,
    },
  });

  cache.invalidate('finance:*');
  await audit(user.id, user.username, 'TRANSACTION_CREATED',
    { transactionId: id, type, amount: parsedAmount, currency, date },
    'manual_transaction', id);

  return newTransaction;
}

async function deleteTransaction(id, user) {
  const existing = await prisma.manualTransaction.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
  }

  await prisma.manualTransaction.delete({ where: { id } });
  cache.invalidate('finance:*');
  await audit(user.id, user.username, 'TRANSACTION_DELETED',
    { transactionId: id, deleted: existing }, 'manual_transaction', id);
}

async function deleteAllTransactions(user) {
  const { count } = await prisma.manualTransaction.deleteMany();
  cache.invalidate('finance:*');
  await audit(user.id, user.username, 'TRANSACTION_DELETED_ALL',
    { count }, 'manual_transaction', null);
  return count;
}

async function getFixedExpenses() {
  return prisma.fixedExpense.findMany({ where: { isActive: 1 } });
}

async function updateFixedExpense(id, amount, user) {
  if (amount === undefined) {
    throw Object.assign(new Error('Amount is required'), { statusCode: 400 });
  }

  const parsed = parseTolerantNumber(amount);
  if (isNaN(parsed) || parsed < 0) {
    throw Object.assign(new Error('amount يجب أن يكون رقماً صحيحاً'), { statusCode: 400 });
  }

  const before = await prisma.fixedExpense.findUnique({ where: { id: parseInt(id) } });
  if (!before) {
    throw Object.assign(new Error('Fixed expense not found'), { statusCode: 404 });
  }

  const updated = await prisma.fixedExpense.update({
    where: { id: parseInt(id) },
    data: { amount: parsed },
  });

  cache.invalidate('finance:*');
  await audit(user.id, user.username, 'EXPENSE_UPDATED',
    { expenseId: id, name: before?.name, before: before?.amount, after: amount },
    'fixed_expense', id);

  return updated;
}

async function resetFixedExpenses(user) {
  await prisma.fixedExpense.updateMany({
    where: { isActive: 1 },
    data: { amount: 0 },
  });

  cache.invalidate('finance:*');
  await audit(user.id, user.username, 'EXPENSE_RESET', null, 'fixed_expense', null);

  return prisma.fixedExpense.findMany({ where: { isActive: 1 } });
}

async function convertItems(items, amountField, currencyField, defaultCurrency, reportCurrency) {
  if (!items || items.length === 0) return 0;
  const conversions = items.map(async (item) => {
    const amount = item[amountField] || 0;
    const currency = item[currencyField] || defaultCurrency;
    if (amount === 0) return 0;
    return currencyService.convert(amount, currency, reportCurrency);
  });
  const results = await Promise.all(conversions);
  return results.reduce((sum, v) => sum + v, 0);
}

async function sumGroupedByCurrency(rows, sumField, currencyField, defaultCurrency, reportCurrency) {
  let total = 0;
  for (const row of rows) {
    const amount = row._sum[sumField] || 0;
    if (amount === 0) continue;
    const currency = row[currencyField] || defaultCurrency;
    total += await currencyService.convert(amount, currency, reportCurrency);
  }
  return total;
}

async function getStats() {
  return cache.wrap('finance:overview:all', FINANCE_CACHE_TTL, async () => {
    const reportCurrency = await currencyService.getReportCurrency();
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);

    const [
      sessionByCurrency,
      incomeByCurrency,
      invoiceByCurrency,
      expenseByCurrency,
      expenseByCategoryCurrency,
      fixedExpenses,
    ] = await Promise.all([
      prisma.session.groupBy({
        by: ['studentCurrency'],
        where: { status: 'completed' },
        _sum: { price: true },
      }),
      prisma.manualTransaction.groupBy({
        by: ['currency'],
        where: { type: 'income', status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.teacherInvoice.groupBy({
        by: ['currency'],
        where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] } },
        _sum: { amount: true },
      }),
      prisma.manualTransaction.groupBy({
        by: ['currency'],
        where: { type: 'expense', status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.manualTransaction.groupBy({
        by: ['category', 'currency'],
        where: { type: 'expense', status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.fixedExpense.findMany({
        where: { isActive: 1 },
        select: { amount: true, currency: true },
      }),
    ]);

    const [monthSessionByCurrency, monthIncomeByCurrency, monthInvoiceByCurrency, monthExpenseByCurrency] = await Promise.all([
      prisma.session.groupBy({
        by: ['studentCurrency'],
        where: { status: 'completed', date: { startsWith: currentMonth } },
        _sum: { price: true },
      }),
      prisma.manualTransaction.groupBy({
        by: ['currency'],
        where: { type: 'income', status: 'completed', date: { startsWith: currentMonth } },
        _sum: { amount: true },
      }),
      prisma.teacherInvoice.groupBy({
        by: ['currency'],
        where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] }, date: { startsWith: currentMonth } },
        _sum: { amount: true },
      }),
      prisma.manualTransaction.groupBy({
        by: ['currency'],
        where: { type: 'expense', status: 'completed', date: { startsWith: currentMonth } },
        _sum: { amount: true },
      }),
    ]);

    const sessionIncome = await sumGroupedByCurrency(sessionByCurrency, 'price', 'studentCurrency', 'EGP', reportCurrency);
    const manualIncomeTotal = await sumGroupedByCurrency(incomeByCurrency, 'amount', 'currency', 'EGP', reportCurrency);
    const invoiceExpense = await sumGroupedByCurrency(invoiceByCurrency, 'amount', 'currency', 'EGP', reportCurrency);
    const manualExpenseTotal = await sumGroupedByCurrency(expenseByCurrency, 'amount', 'currency', 'EGP', reportCurrency);
    const fixedExpenseTotal = await convertItems(fixedExpenses, 'amount', 'currency', 'EGP', reportCurrency);

    const mSessionIncome = await sumGroupedByCurrency(monthSessionByCurrency, 'price', 'studentCurrency', 'EGP', reportCurrency);
    const mManualIncomeTotal = await sumGroupedByCurrency(monthIncomeByCurrency, 'amount', 'currency', 'EGP', reportCurrency);
    const mInvoiceExpense = await sumGroupedByCurrency(monthInvoiceByCurrency, 'amount', 'currency', 'EGP', reportCurrency);
    const mManualExpenseTotal = await sumGroupedByCurrency(monthExpenseByCurrency, 'amount', 'currency', 'EGP', reportCurrency);

    const [recentSessions, recentIncomes, recentInvoices, recentExpenses] = await Promise.all([
      prisma.session.findMany({
        where: { status: 'completed', date: { gte: sixMonthsAgoStr } },
        select: { price: true, studentCurrency: true, date: true },
      }),
      prisma.manualTransaction.findMany({
        where: { type: 'income', status: 'completed', date: { gte: sixMonthsAgoStr } },
        select: { amount: true, currency: true, date: true },
      }),
      prisma.teacherInvoice.findMany({
        where: { status: { in: ['paid', 'مدفوعة', 'تم الدفع'] }, date: { gte: sixMonthsAgoStr } },
        select: { amount: true, currency: true, date: true },
      }),
      prisma.manualTransaction.findMany({
        where: { type: 'expense', status: 'completed', date: { gte: sixMonthsAgoStr } },
        select: { amount: true, currency: true, date: true, category: true },
      }),
    ]);

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = d.toISOString().slice(0, 7);
      const mLabel = d.toLocaleDateString('ar-EG', { month: 'short' });

      const mSessions = recentSessions.filter(s => s.date && s.date.startsWith(mStr));
      const mIncomes = recentIncomes.filter(t => t.date && t.date.startsWith(mStr));
      const mInvoices = recentInvoices.filter(ix => ix.date && ix.date.startsWith(mStr));
      const mExpenses = recentExpenses.filter(t => t.date && t.date.startsWith(mStr));

      const [mSessConv, mIncConv, mInvConv, mExpConv] = await Promise.all([
        convertItems(mSessions, 'price', 'studentCurrency', 'EGP', reportCurrency),
        convertItems(mIncomes, 'amount', 'currency', 'EGP', reportCurrency),
        convertItems(mInvoices, 'amount', 'currency', 'EGP', reportCurrency),
        convertItems(mExpenses, 'amount', 'currency', 'EGP', reportCurrency),
      ]);

      monthlyData.push({ month: mLabel, income: mSessConv + mIncConv, expense: mInvConv + mExpConv });
    }

    const catMap = {};
    for (const row of expenseByCategoryCurrency) {
      const cat = row.category || 'أخرى';
      const amount = row._sum.amount || 0;
      if (amount === 0) continue;
      const currency = row.currency || 'EGP';
      const converted = await currencyService.convert(amount, currency, reportCurrency);
      catMap[cat] = (catMap[cat] || 0) + converted;
    }

    const totalIncome = sessionIncome + manualIncomeTotal;
    const monthIncome = mSessionIncome + mManualIncomeTotal;
    const totalExpenses = invoiceExpense + manualExpenseTotal + fixedExpenseTotal;
    const monthExpenses = mInvoiceExpense + mManualExpenseTotal + fixedExpenseTotal;

    const pieData = [
      ...Object.entries(catMap).map(([name, value]) => ({ name, value })),
      { name: 'رواتب معلمات', value: invoiceExpense },
      { name: 'مصاريف ثابتة', value: fixedExpenseTotal },
    ].filter(d => d.value > 0);

    return {
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
  });
}

module.exports = {
  getTransactions,
  createTransaction,
  deleteTransaction,
  deleteAllTransactions,
  getFixedExpenses,
  updateFixedExpense,
  resetFixedExpenses,
  getStats,
};
