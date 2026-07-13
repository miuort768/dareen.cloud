const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../../middleware/auth');
const financeService = require('../../services/financeService');

router.use(authMiddleware, checkRole(['admin']));

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await financeService.getTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const result = await financeService.createTransaction(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message });
  }
});

router.delete('/transactions/:id', async (req, res) => {
  try {
    await financeService.deleteTransaction(req.params.id, req.user);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message });
  }
});

router.delete('/transactions', async (req, res) => {
  try {
    const count = await financeService.deleteAllTransactions(req.user);
    res.json({ message: 'All transactions deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/fixed-expenses', async (req, res) => {
  try {
    const expenses = await financeService.getFixedExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/fixed-expenses/:id', async (req, res) => {
  try {
    const updated = await financeService.updateFixedExpense(req.params.id, req.body.amount, req.user);
    res.json(updated);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/fixed-expenses/reset', async (req, res) => {
  try {
    const expenses = await financeService.resetFixedExpenses(req.user);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await financeService.getStats();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
