import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const financeService = require('../../../services/financeService');
const { prisma } = require('../../../utils/prisma');

const adminUser = { id: 'test-admin', username: 'admin' };

describe('financeService', () => {
  beforeAll(async () => {
    await prisma.manualTransaction.deleteMany({ where: { id: { startsWith: 'test-' } } });
    await prisma.fixedExpense.deleteMany({ where: { name: { startsWith: 'test-' } } });
  });

  afterAll(async () => {
    await prisma.manualTransaction.deleteMany({ where: { id: { startsWith: 'test-' } } });
    await prisma.fixedExpense.deleteMany({ where: { name: { startsWith: 'test-' } } });
  });

  it('exports expected functions', () => {
    expect(typeof financeService.getTransactions).toBe('function');
    expect(typeof financeService.createTransaction).toBe('function');
    expect(typeof financeService.deleteTransaction).toBe('function');
    expect(typeof financeService.deleteAllTransactions).toBe('function');
    expect(typeof financeService.getFixedExpenses).toBe('function');
    expect(typeof financeService.updateFixedExpense).toBe('function');
    expect(typeof financeService.resetFixedExpenses).toBe('function');
    expect(typeof financeService.getStats).toBe('function');
  });

  describe('createTransaction', () => {
    it('creates an income transaction', async () => {
      const tx = await financeService.createTransaction({
        type: 'income', amount: 100, date: '2026-07-05', category: 'test-income',
      }, adminUser);
      expect(tx).toBeDefined();
      expect(tx.id).toMatch(/^[0-9a-f-]+$/);
      expect(tx.type).toBe('income');
      expect(tx.amount).toBe(100);
      expect(tx.status).toBe('completed');
    });

    it('creates an expense transaction', async () => {
      const tx = await financeService.createTransaction({
        type: 'expense', amount: 50, date: '2026-07-05', description: 'test expense',
      }, adminUser);
      expect(tx).toBeDefined();
      expect(tx.type).toBe('expense');
      expect(tx.amount).toBe(50);
    });

    it('rejects missing fields', async () => {
      await expect(financeService.createTransaction({}, adminUser))
        .rejects.toThrow('Missing required fields');
    });

    it('rejects invalid type', async () => {
      await expect(financeService.createTransaction({
        type: 'invalid', amount: 100, date: '2026-07-05',
      }, adminUser)).rejects.toThrow('income أو expense');
    });

    it('rejects non-positive amount', async () => {
      await expect(financeService.createTransaction({
        type: 'income', amount: -5, date: '2026-07-05',
      }, adminUser)).rejects.toThrow('رقماً موجباً');
    });
  });

  describe('getTransactions', () => {
    it('returns an array', async () => {
      const txs = await financeService.getTransactions();
      expect(Array.isArray(txs)).toBe(true);
    });
  });

  describe('deleteTransaction', () => {
    it('deletes an existing transaction', async () => {
      const tx = await financeService.createTransaction({
        type: 'income', amount: 1, date: '2026-07-05', category: 'test-del',
      }, adminUser);
      await financeService.deleteTransaction(tx.id, adminUser);
      const txs = await financeService.getTransactions();
      expect(txs.find(t => t.id === tx.id)).toBeUndefined();
    });

    it('rejects non-existent transaction', async () => {
      await expect(financeService.deleteTransaction('non-existent', adminUser))
        .rejects.toThrow('Transaction not found');
    });
  });

  describe('getFixedExpenses', () => {
    it('returns an array', async () => {
      const expenses = await financeService.getFixedExpenses();
      expect(Array.isArray(expenses)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('returns valid stats object', async () => {
      const stats = await financeService.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalIncome).toBe('number');
      expect(typeof stats.monthIncome).toBe('number');
      expect(typeof stats.totalExpenses).toBe('number');
      expect(typeof stats.monthExpenses).toBe('number');
      expect(typeof stats.reportCurrency).toBe('string');
      expect(Array.isArray(stats.monthlyData)).toBe(true);
      expect(Array.isArray(stats.pieData)).toBe(true);
    });
  });
});
