import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const invoiceService = require('../../../services/invoiceService');
const { prisma } = require('../../../utils/prisma');

const adminUser = { id: 'test-admin', username: 'admin' };
let testStudentId = null;
let testTeacherId = null;
let teacherInvoiceId = null;
let studentInvoiceId = null;

describe('invoiceService', () => {
  beforeAll(async () => {
    await prisma.teacherInvoice.deleteMany({ where: { id: { startsWith: 'inv_t_test' } } });
    await prisma.studentInvoice.deleteMany({ where: { id: { startsWith: 'inv_s_test' } } });
    await prisma.student.deleteMany({ where: { name: { startsWith: 'test-inv-' } } });
    await prisma.teacher.deleteMany({ where: { name: { startsWith: 'test-inv-' } } });

    const student = await prisma.student.create({
      data: { name: 'test-inv-student', studentPhone: '0555000055', grade: 'G5' },
    });
    testStudentId = student.id;

    const teacher = await prisma.teacher.create({
      data: { name: 'test-inv-teacher', phone1: '0555000044', subject: 'Science' },
    });
    testTeacherId = teacher.id;
  });

  afterAll(async () => {
    await prisma.teacherInvoice.deleteMany({ where: { id: { startsWith: 'inv_t_test' } } });
    await prisma.studentInvoice.deleteMany({ where: { id: { startsWith: 'inv_s_test' } } });
    await prisma.student.deleteMany({ where: { name: { startsWith: 'test-inv-' } } });
    await prisma.teacher.deleteMany({ where: { name: { startsWith: 'test-inv-' } } });
  });

  it('exports expected functions', () => {
    expect(typeof invoiceService.listTeacherInvoices).toBe('function');
    expect(typeof invoiceService.getTeacherInvoiceById).toBe('function');
    expect(typeof invoiceService.createTeacherInvoice).toBe('function');
    expect(typeof invoiceService.updateTeacherInvoice).toBe('function');
    expect(typeof invoiceService.payTeacherInvoice).toBe('function');
    expect(typeof invoiceService.cancelTeacherInvoice).toBe('function');
    expect(typeof invoiceService.deleteTeacherInvoice).toBe('function');
    expect(typeof invoiceService.restoreTeacherInvoice).toBe('function');
    expect(typeof invoiceService.listStudentInvoices).toBe('function');
    expect(typeof invoiceService.getStudentInvoiceById).toBe('function');
    expect(typeof invoiceService.createStudentInvoice).toBe('function');
    expect(typeof invoiceService.updateStudentInvoice).toBe('function');
    expect(typeof invoiceService.payStudentInvoice).toBe('function');
    expect(typeof invoiceService.cancelStudentInvoice).toBe('function');
    expect(typeof invoiceService.refundStudentInvoice).toBe('function');
    expect(typeof invoiceService.deleteStudentInvoice).toBe('function');
    expect(typeof invoiceService.restoreStudentInvoice).toBe('function');
    expect(typeof invoiceService.getInvoiceStats).toBe('function');
  });

  describe('createTeacherInvoice', () => {
    it('creates a teacher invoice', async () => {
      const inv = await invoiceService.createTeacherInvoice({
        teacher: 'test-inv-teacher', amount: 500, date: '2026-07-05', currency: 'SAR',
        teacherId: testTeacherId,
      }, adminUser);
      expect(inv).toBeDefined();
      expect(inv.amount).toBe(500);
      expect(inv.status).toBe('unpaid');
      expect(inv.id).toMatch(/^inv_t_/);
      teacherInvoiceId = inv.id;
    });

    it('rejects missing amount', async () => {
      await expect(invoiceService.createTeacherInvoice({
        teacher: 'test-inv-teacher', date: '2026-07-05',
      }, adminUser)).rejects.toThrow();
    });
  });

  describe('createStudentInvoice', () => {
    it('creates a student invoice', async () => {
      const inv = await invoiceService.createStudentInvoice({
        studentId: testStudentId, studentName: 'test-inv-student',
        amount: 300, date: '2026-07-05', dueDate: '2026-08-05',
      }, adminUser);
      expect(inv).toBeDefined();
      expect(inv.amount).toBe(300);
      expect(inv.status).toBe('unpaid');
      expect(inv.id).toMatch(/^inv_s_/);
      studentInvoiceId = inv.id;
    });

    it('rejects missing studentId', async () => {
      await expect(invoiceService.createStudentInvoice({
        studentName: 'nobody', amount: 100, date: '2026-07-05',
      }, adminUser)).rejects.toThrow('Student ID is required');
    });
  });

  describe('getTeacherInvoiceById', () => {
    it('returns teacher invoice by id', async () => {
      if (!teacherInvoiceId) return;
      const inv = await invoiceService.getTeacherInvoiceById(teacherInvoiceId);
      expect(inv).toBeDefined();
      expect(inv.id).toBe(teacherInvoiceId);
    });

    it('rejects non-existent id', async () => {
      await expect(invoiceService.getTeacherInvoiceById('nonexistent')).rejects.toThrow();
    });
  });

  describe('getStudentInvoiceById', () => {
    it('returns student invoice by id', async () => {
      if (!studentInvoiceId) return;
      const inv = await invoiceService.getStudentInvoiceById(studentInvoiceId);
      expect(inv).toBeDefined();
      expect(inv.id).toBe(studentInvoiceId);
    });
  });

  describe('payTeacherInvoice', () => {
    it('pays an unpaid teacher invoice', async () => {
      if (!teacherInvoiceId) return;
      const paid = await invoiceService.payTeacherInvoice(teacherInvoiceId, { paymentMethod: 'cash' }, adminUser);
      expect(paid.status).toBe('paid');
      expect(paid.paidAt).toBeDefined();
    });

    it('rejects double payment', async () => {
      if (!teacherInvoiceId) return;
      await expect(invoiceService.payTeacherInvoice(teacherInvoiceId, {}, adminUser))
        .rejects.toThrow('Invalid transition');
    });
  });

  describe('payStudentInvoice', () => {
    it('pays an unpaid student invoice', async () => {
      if (!studentInvoiceId) return;
      const paid = await invoiceService.payStudentInvoice(studentInvoiceId, { paymentMethod: 'card' }, adminUser);
      expect(paid.status).toBe('paid');
      expect(paid.paidAt).toBeDefined();
    });
  });

  describe('refundStudentInvoice', () => {
    it('refunds a paid student invoice', async () => {
      if (!studentInvoiceId) return;
      const refunded = await invoiceService.refundStudentInvoice(studentInvoiceId, adminUser);
      expect(refunded.status).toBe('refunded');
    });

    it('rejects double refund', async () => {
      if (!studentInvoiceId) return;
      await expect(invoiceService.refundStudentInvoice(studentInvoiceId, adminUser))
        .rejects.toThrow('Invalid transition');
    });
  });

  describe('getInvoiceStats', () => {
    it('returns stats object with required fields', async () => {
      const stats = await invoiceService.getInvoiceStats();
      expect(stats).toBeDefined();
      expect(typeof stats.count).toBe('object');
      expect(typeof stats.amount).toBe('object');
      expect(typeof stats.paid).toBe('object');
      expect(typeof stats.teacherByStatus).toBe('object');
      expect(typeof stats.studentByStatus).toBe('object');
    });

    it('filters by currency', async () => {
      const stats = await invoiceService.getInvoiceStats({ currency: 'SAR' });
      expect(stats).toBeDefined();
      expect(stats.count.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cancelTeacherInvoice', () => {
    it('rejects cancelling a paid teacher invoice', async () => {
      if (!teacherInvoiceId) return;
      await expect(invoiceService.cancelTeacherInvoice(teacherInvoiceId, adminUser))
        .rejects.toThrow('Invalid transition');
    });
  });

  describe('soft delete and restore', () => {
    it('soft deletes a teacher invoice', async () => {
      if (!teacherInvoiceId) return;
      await invoiceService.deleteTeacherInvoice(teacherInvoiceId, adminUser);
      const deleted = await prisma.teacherInvoice.findUnique({ where: { id: teacherInvoiceId } });
      expect(deleted.deletedAt).not.toBeNull();
    });

    it('restores a soft-deleted teacher invoice', async () => {
      if (!teacherInvoiceId) return;
      await invoiceService.restoreTeacherInvoice(teacherInvoiceId, adminUser);
      const restored = await prisma.teacherInvoice.findUnique({ where: { id: teacherInvoiceId } });
      expect(restored.deletedAt).toBeNull();
    });
  });
});
