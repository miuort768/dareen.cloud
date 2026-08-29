const crypto = require('crypto');
const { prisma } = require('../utils/prisma');
const cacheService = require('./cacheService');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { CACHE_KEYS } = require('../constants/cacheKeys');
const { validateTransition } = require('../constants/invoiceStates');
const { parseItems, serializeItems, invalidateInvoiceCache, auditInvoice, checkExists } = require('./invoiceHelpers');

const CK = CACHE_KEYS.invoices;

// ---- Self-service ("me") queries ----
// Role-aware: students see their own invoices, parents their children's,
// teachers their own, and admins everything. Used by the dashboard /
// payment-history pages (declared in routes BEFORE the admin-only guard).

async function listMyStudentInvoices(user) {
  const where = { deletedAt: null };
  if (user?.role === 'student') {
    where.studentId = user.id;
  } else if (user?.role === 'parent') {
    const children = await prisma.student.findMany({
      where: { parentPhone: user.phone || '' },
      select: { id: true },
    });
    where.studentId = { in: children.map((c) => c.id) };
  }
  // admin (and any other permitted role) sees all invoices
  return prisma.studentInvoice.findMany({
    where,
    orderBy: [{ date: 'desc' }, { id: 'desc' }],
  });
}

async function listMyTeacherInvoices(user) {
  const where = { deletedAt: null };
  if (user?.role === 'teacher') {
    // invoices may reference the account id or the real Teacher row name
    const tName = (user.teacherName || user.name || '').trim();
    const or = [{ teacherId: user.id }];
    if (tName) or.push({ teacherName: { equals: tName, mode: 'insensitive' } });
    where.OR = or;
  }
  return prisma.teacherInvoice.findMany({
    where,
    orderBy: [{ date: 'desc' }, { id: 'desc' }],
  });
}

// ---- Teacher Invoice Operations ----

async function listTeacherInvoices(query) {
  const page = parseInt(query.page);
  const limit = parseInt(query.limit);
  const q = query.q ? query.q.trim().toLowerCase() : '';
  const where = { deletedAt: null };

  if (q) where.teacherName = { contains: q };

  if (!isNaN(page) && !isNaN(limit)) {
    const safeLimit = Math.min(limit, 100);
    const offset = (page - 1) * safeLimit;
    const [invoices, total] = await Promise.all([
      prisma.teacherInvoice.findMany({
        where, orderBy: [{ date: 'desc' }, { id: 'desc' }], skip: offset, take: safeLimit,
      }),
      prisma.teacherInvoice.count({ where }),
    ]);
    return { data: invoices, total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  const invoices = await prisma.teacherInvoice.findMany({ where, orderBy: [{ date: 'desc' }, { id: 'desc' }] });
  return invoices;
}

async function getTeacherInvoiceById(id) {
  return cacheService.wrap(CK.teacherById(id), 600, async () => {
    const invoice = await prisma.teacherInvoice.findFirst({ where: { id, deletedAt: null } });
    if (!invoice) {
      const err = new Error('Teacher invoice not found');
      err.statusCode = 404;
      throw err;
    }
    return invoice;
  });
}

async function createTeacherInvoice(data, user) {
  const id = data.id || `inv_t_${crypto.randomBytes(4).toString('hex')}`;

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.teacherInvoice.create({
      data: {
        id,
        teacherId: data.teacherId || '',
        teacherName: data.teacher,
        specialization: data.specialization || '',
        amount: data.amount,
        currency: data.currency || null,
        paymentMethod: data.paymentMethod || '',
        status: data.status || 'unpaid',
        personalExpenses: data.personalExpenses ?? 0,
        date: data.date,
      },
    });
    return tx.teacherInvoice.findUnique({ where: { id: created.id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_CREATED, 'teacher', id, {
    teacherName: data.teacher, amount: data.amount, currency: data.currency,
  });
  await invalidateInvoiceCache(cacheService, [CK.teacherList()]);

  return invoice;
}

async function updateTeacherInvoice(id, data, user) {
  const existing = await checkExists('teacherInvoice', id, 'Teacher invoice');

  if (data.status && data.status !== existing.status) {
    const validation = validateTransition(existing.status, data.status);
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.statusCode = 409;
      throw err;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.teacherInvoice.update({
      where: { id },
      data: {
        teacherName: data.teacher !== undefined ? data.teacher : undefined,
        specialization: data.specialization !== undefined ? (data.specialization || '') : undefined,
        amount: data.amount !== undefined ? data.amount : undefined,
        currency: data.currency !== undefined ? (data.currency || null) : undefined,
        paymentMethod: data.paymentMethod !== undefined ? (data.paymentMethod || '') : undefined,
        status: data.status !== undefined ? data.status : undefined,
        personalExpenses: data.personalExpenses !== undefined ? (data.personalExpenses ?? 0) : undefined,
        date: data.date !== undefined ? data.date : undefined,
      },
    });
    return tx.teacherInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_UPDATED, 'teacher', id, {
    before: { amount: existing.amount, status: existing.status },
    after: { amount: updated.amount, status: updated.status },
  });
  await invalidateInvoiceCache(cacheService, [CK.teacherList(), CK.teacherById(id)]);

  return updated;
}

async function payTeacherInvoice(id, data, user) {
  const existing = await checkExists('teacherInvoice', id, 'Teacher invoice');

  const validation = validateTransition(existing.status, 'paid');
  if (!validation.valid) {
    const err = new Error(validation.message);
    err.statusCode = 409;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.teacherInvoice.update({
      where: { id },
      data: {
        status: 'paid',
        paymentMethod: data.paymentMethod || existing.paymentMethod || '',
        paidAt: data.paidAt || new Date().toISOString().split('T')[0],
      },
    });
    return tx.teacherInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_PAID, 'teacher', id, {
    amount: existing.amount, paymentMethod: data.paymentMethod,
  });
  await invalidateInvoiceCache(cacheService, [CK.teacherList(), CK.teacherById(id)]);

  return updated;
}

async function cancelTeacherInvoice(id, user) {
  const existing = await checkExists('teacherInvoice', id, 'Teacher invoice');

  const validation = validateTransition(existing.status, 'cancelled');
  if (!validation.valid) {
    const err = new Error(validation.message);
    err.statusCode = 409;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.teacherInvoice.update({ where: { id }, data: { status: 'cancelled' } });
    return tx.teacherInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_CANCELLED, 'teacher', id, {
    previousStatus: existing.status, amount: existing.amount,
  });
  await invalidateInvoiceCache(cacheService, [CK.teacherList(), CK.teacherById(id)]);

  return updated;
}

async function deleteTeacherInvoice(id, user) {
  const existing = await checkExists('teacherInvoice', id, 'Teacher invoice');

  await prisma.teacherInvoice.update({ where: { id }, data: { deletedAt: new Date() } });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_DELETED, 'teacher', id, { amount: existing.amount });
  await invalidateInvoiceCache(cacheService, [CK.teacherList(), CK.teacherById(id)]);
}

async function restoreTeacherInvoice(id, user) {
  const existing = await prisma.teacherInvoice.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Teacher invoice not found');
    err.statusCode = 404;
    throw err;
  }
  if (!existing.deletedAt) {
    const err = new Error('Teacher invoice is not deleted');
    err.statusCode = 409;
    throw err;
  }

  await prisma.teacherInvoice.update({ where: { id }, data: { deletedAt: null } });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_RESTORED, 'teacher', id, { amount: existing.amount });
  await invalidateInvoiceCache(cacheService, [CK.teacherList()]);
}

// ---- Student Invoice Operations ----

async function listStudentInvoices(query) {
  const page = parseInt(query.page);
  const limit = parseInt(query.limit);
  const q = query.q ? query.q.trim().toLowerCase() : '';
  const where = { deletedAt: null };

  if (q) where.studentName = { contains: q };

  if (!isNaN(page) && !isNaN(limit)) {
    const safeLimit = Math.min(limit, 100);
    const offset = (page - 1) * safeLimit;
    const [invoices, total] = await Promise.all([
      prisma.studentInvoice.findMany({
        where, orderBy: [{ date: 'desc' }, { dueDate: 'asc' }, { id: 'desc' }], skip: offset, take: safeLimit,
      }),
      prisma.studentInvoice.count({ where }),
    ]);
    return { data: invoices.map(formatStudentInvoice), total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  const invoices = await prisma.studentInvoice.findMany({ where, orderBy: [{ date: 'desc' }, { dueDate: 'asc' }, { id: 'desc' }] });
  return invoices.map(formatStudentInvoice);
}

async function getStudentInvoiceById(id) {
  return cacheService.wrap(CK.studentById(id), 600, async () => {
    const invoice = await prisma.studentInvoice.findFirst({ where: { id, deletedAt: null } });
    if (!invoice) {
      const err = new Error('Student invoice not found');
      err.statusCode = 404;
      throw err;
    }
    return formatStudentInvoice(invoice);
  });
}

async function createStudentInvoice(data, user) {
  if (!data.studentId) {
    const err = new Error('Student ID is required');
    err.statusCode = 400;
    throw err;
  }
  const id = data.id || `inv_s_${crypto.randomBytes(4).toString('hex')}`;

  const invoice = await prisma.$transaction(async (tx) => {
    await tx.studentInvoice.create({
      data: {
        id,
        studentId: data.studentId,
        studentName: data.studentName || '',
        amount: data.amount,
        currency: data.currency || null,
        description: data.description || '',
        date: data.date,
        dueDate: data.dueDate || '',
        status: data.status || 'unpaid',
        paymentMethod: data.paymentMethod || '',
        notes: data.notes || '',
        items: serializeItems(data.items),
      },
    });
    return tx.studentInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_CREATED, 'student', id, {
    studentName: data.studentName, amount: data.amount, currency: data.currency,
  });
  await invalidateInvoiceCache(cacheService, [CK.studentList()]);

  return formatStudentInvoice(invoice);
}

async function updateStudentInvoice(id, data, user) {
  const existing = await checkExists('studentInvoice', id, 'Student invoice');

  if (data.status && data.status !== existing.status) {
    const validation = validateTransition(existing.status, data.status);
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.statusCode = 409;
      throw err;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updateData = {};
    if (data.studentId !== undefined) updateData.studentId = data.studentId;
    if (data.studentName !== undefined) updateData.studentName = data.studentName || '';
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency || null;
    if (data.description !== undefined) updateData.description = data.description || '';
    if (data.date !== undefined) updateData.date = data.date;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate || '';
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || '';
    if (data.notes !== undefined) updateData.notes = data.notes || '';
    if (data.items !== undefined) updateData.items = serializeItems(data.items);

    await tx.studentInvoice.update({ where: { id }, data: updateData });
    return tx.studentInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_UPDATED, 'student', id, {
    before: { amount: existing.amount, status: existing.status },
    after: { amount: updated.amount, status: updated.status },
  });
  await invalidateInvoiceCache(cacheService, [CK.studentList(), CK.studentById(id)]);

  return formatStudentInvoice(updated);
}

async function payStudentInvoice(id, data, user) {
  const existing = await checkExists('studentInvoice', id, 'Student invoice');

  const validation = validateTransition(existing.status, 'paid');
  if (!validation.valid) {
    const err = new Error(validation.message);
    err.statusCode = 409;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.studentInvoice.update({
      where: { id },
      data: {
        status: 'paid',
        paymentMethod: data.paymentMethod || existing.paymentMethod || '',
        paidAt: data.paidAt || new Date().toISOString().split('T')[0],
      },
    });
    return tx.studentInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_PAID, 'student', id, {
    amount: existing.amount, paymentMethod: data.paymentMethod,
  });
  await invalidateInvoiceCache(cacheService, [CK.studentList(), CK.studentById(id)]);

  return formatStudentInvoice(updated);
}

async function cancelStudentInvoice(id, user) {
  const existing = await checkExists('studentInvoice', id, 'Student invoice');

  const validation = validateTransition(existing.status, 'cancelled');
  if (!validation.valid) {
    const err = new Error(validation.message);
    err.statusCode = 409;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.studentInvoice.update({ where: { id }, data: { status: 'cancelled' } });
    return tx.studentInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_CANCELLED, 'student', id, {
    previousStatus: existing.status, amount: existing.amount,
  });
  await invalidateInvoiceCache(cacheService, [CK.studentList(), CK.studentById(id)]);

  return formatStudentInvoice(updated);
}

async function refundStudentInvoice(id, user) {
  const existing = await checkExists('studentInvoice', id, 'Student invoice');

  const validation = validateTransition(existing.status, 'refunded');
  if (!validation.valid) {
    const err = new Error(validation.message);
    err.statusCode = 409;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.studentInvoice.update({ where: { id }, data: { status: 'refunded' } });
    return tx.studentInvoice.findUnique({ where: { id } });
  });

  await auditInvoice(user, AUDIT_ACTIONS.REFUND_PROCESSED, 'student', id, {
    previousStatus: existing.status, amount: existing.amount,
  });
  await invalidateInvoiceCache(cacheService, [CK.studentList(), CK.studentById(id)]);

  return formatStudentInvoice(updated);
}

async function deleteStudentInvoice(id, user) {
  const existing = await checkExists('studentInvoice', id, 'Student invoice');

  await prisma.studentInvoice.update({ where: { id }, data: { deletedAt: new Date() } });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_DELETED, 'student', id, { amount: existing.amount });
  await invalidateInvoiceCache(cacheService, [CK.studentList(), CK.studentById(id)]);
}

async function restoreStudentInvoice(id, user) {
  const existing = await prisma.studentInvoice.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Student invoice not found');
    err.statusCode = 404;
    throw err;
  }
  if (!existing.deletedAt) {
    const err = new Error('Student invoice is not deleted');
    err.statusCode = 409;
    throw err;
  }

  await prisma.studentInvoice.update({ where: { id }, data: { deletedAt: null } });

  await auditInvoice(user, AUDIT_ACTIONS.INVOICE_RESTORED, 'student', id, { amount: existing.amount });
  await invalidateInvoiceCache(cacheService, [CK.studentList()]);
}

// ---- Shared Stats ----

async function getInvoiceStats(filters = {}) {
  const filterKey = Object.entries(filters)
    .filter(([_, v]) => v != null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  return cacheService.wrap(`invoices:stats:${filterKey || 'all'}`, 60, async () => {
    const { teacherId, studentId, currency, from, to } = filters;

    const teacherWhere = { deletedAt: null };
    const studentWhere = { deletedAt: null };
    if (currency) { teacherWhere.currency = currency; studentWhere.currency = currency; }
    if (teacherId) teacherWhere.teacherId = teacherId;
    if (studentId) studentWhere.studentId = studentId;
    if (from || to) {
      if (from) { teacherWhere.date = { ...teacherWhere.date, gte: from }; studentWhere.date = { ...studentWhere.date, gte: from }; }
      if (to) { teacherWhere.date = { ...teacherWhere.date, lte: to }; studentWhere.date = { ...studentWhere.date, lte: to }; }
    }

    const currencyService = require('./currencyService');
    const reportCurrency = await currencyService.getReportCurrency();

    const [teacherInvoices, studentInvoices, teacherCount, studentCount] = await Promise.all([
      prisma.teacherInvoice.findMany({ where: teacherWhere }),
      prisma.studentInvoice.findMany({ where: studentWhere }),
      prisma.teacherInvoice.count({ where: teacherWhere }),
      prisma.studentInvoice.count({ where: studentWhere }),
    ]);

    const convertedTeacherInvoices = await Promise.all(teacherInvoices.map(async inv => ({
      ...inv,
      convertedAmount: await currencyService.convert(inv.amount, inv.currency || 'EGP', reportCurrency)
    })));
    const convertedStudentInvoices = await Promise.all(studentInvoices.map(async inv => ({
      ...inv,
      convertedAmount: await currencyService.convert(inv.amount, inv.currency || 'EGP', reportCurrency)
    })));

    const teacherTotal = convertedTeacherInvoices.reduce((sum, inv) => sum + inv.convertedAmount, 0);
    const studentTotal = convertedStudentInvoices.reduce((sum, inv) => sum + inv.convertedAmount, 0);

    const teacherByStatus = groupByConverted(convertedTeacherInvoices, 'status');
    const studentByStatus = groupByConverted(convertedStudentInvoices, 'status');

    const teacherPaid = convertedTeacherInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.convertedAmount, 0);
    const studentPaid = convertedStudentInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.convertedAmount, 0);

    return {
      count: { teacher: teacherCount, student: studentCount, total: teacherCount + studentCount },
      amount: { teacher: teacherTotal, student: studentTotal, total: teacherTotal + studentTotal },
      paid: { teacher: teacherPaid, student: studentPaid, total: teacherPaid + studentPaid },
      teacherByStatus: Object.fromEntries(teacherByStatus),
      studentByStatus: Object.fromEntries(studentByStatus),
    };
  });
}

// ---- Internal Helpers ----

function formatStudentInvoice(inv) {
  if (!inv) return inv;
  return { ...inv, items: inv.items ? parseItems(inv.items) : [] };
}

function groupByConverted(arr, key) {
  const map = new Map();
  for (const item of arr) {
    const k = item[key] || 'unknown';
    const existing = map.get(k) || { count: 0, amount: 0 };
    existing.count += 1;
    existing.amount += (item.convertedAmount !== undefined ? item.convertedAmount : item.amount);
    map.set(k, existing);
  }
  return map;
}

function groupBy(arr, key) {
  const map = new Map();
  for (const item of arr) {
    const k = item[key] || 'unknown';
    const existing = map.get(k) || { count: 0, amount: 0 };
    existing.count += 1;
    existing.amount += item.amount;
    map.set(k, existing);
  }
  return map;
}

module.exports = {
  listMyStudentInvoices, listMyTeacherInvoices,
  listTeacherInvoices, getTeacherInvoiceById, createTeacherInvoice,
  updateTeacherInvoice, payTeacherInvoice, cancelTeacherInvoice,
  deleteTeacherInvoice, restoreTeacherInvoice,
  listStudentInvoices, getStudentInvoiceById, createStudentInvoice,
  updateStudentInvoice, payStudentInvoice, cancelStudentInvoice,
  refundStudentInvoice, deleteStudentInvoice, restoreStudentInvoice,
  getInvoiceStats,
};
