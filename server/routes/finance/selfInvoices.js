const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { prisma } = require('../../utils/prisma');
const logger = require('../../utils/logger');
const parentService = require('../../services/parentService');

const studentInvoiceSelect = {
  id: true, studentId: true, studentName: true, amount: true, currency: true,
  description: true, date: true, dueDate: true, status: true, paymentMethod: true,
  notes: true, paidAt: true,
};

const teacherInvoiceSelect = {
  id: true, teacherId: true, teacherName: true, specialization: true,
  amount: true, currency: true, paymentMethod: true, status: true,
  personalExpenses: true, date: true, paidAt: true,
};

// Teacher: their own invoices
router.get('/teacher', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الميزة متاحة للمعلمين فقط' });
    }

    const where = { deletedAt: null };
    const name = req.user.teacherName || req.user.name || '';

    if (req.user.role === 'teacher') {
      where.OR = [
        { teacherId: req.user.id },
        ...(name ? [{ teacherName: name }] : []),
      ];
    }

    const invoices = await prisma.teacherInvoice.findMany({
      where,
      select: teacherInvoiceSelect,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    res.json(invoices.map(inv => ({ ...inv, teacher: inv.teacherName, teacherName: undefined })));
  } catch (err) {
    logger.error('Error fetching own teacher invoices', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Student: their own invoices; Parent: their children's invoices
router.get('/student', authMiddleware, async (req, res) => {
  try {
    let studentIds = [];

    if (req.user.role === 'student') {
      studentIds = [req.user.id];
    } else if (req.user.role === 'parent') {
      const children = await parentService.getMyChildren(req.user.phone);
      studentIds = children.map(c => c.id);
    } else if (req.user.role === 'admin') {
      // Admin may pass ?studentId= to view one student's invoices
      if (req.query.studentId) studentIds = [req.query.studentId];
    } else {
      return res.status(403).json({ error: 'ليس لديك صلاحية للوصول إلى الفواتير' });
    }

    if (studentIds.length === 0) {
      return res.json([]);
    }

    const invoices = await prisma.studentInvoice.findMany({
      where: { deletedAt: null, studentId: { in: studentIds } },
      select: studentInvoiceSelect,
      orderBy: [{ date: 'desc' }, { dueDate: 'asc' }, { id: 'desc' }],
    });

    res.json(invoices);
  } catch (err) {
    logger.error('Error fetching own student invoices', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { selfInvoiceRouter: router };
