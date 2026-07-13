const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const {
  createTeacherInvoiceSchema, updateTeacherInvoiceSchema,
  createStudentInvoiceSchema, updateStudentInvoiceSchema,
} = require('../../utils/validators');
const {
  listTeacherInvoices, getTeacherInvoiceById, createTeacherInvoice,
  updateTeacherInvoice, payTeacherInvoice, cancelTeacherInvoice,
  deleteTeacherInvoice, restoreTeacherInvoice,
  listStudentInvoices, getStudentInvoiceById, createStudentInvoice,
  updateStudentInvoice, payStudentInvoice, cancelStudentInvoice,
  refundStudentInvoice, deleteStudentInvoice, restoreStudentInvoice,
  getInvoiceStats,
} = require('../../services/invoiceService');
const logger = require('../../utils/logger');

router.use(authMiddleware);
router.use(checkRole(['admin']));

// ---- Stats ----

router.get('/stats', async (req, res) => {
  try {
    const stats = await getInvoiceStats({
      teacherId: req.query.teacherId,
      studentId: req.query.studentId,
      currency: req.query.currency,
      from: req.query.from,
      to: req.query.to,
    });
    res.json(stats);
  } catch (err) {
    logger.error('Error fetching invoice stats', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---- Teacher Invoices ----

router.get('/teacher', async (req, res) => {
  try {
    const result = await listTeacherInvoices(req.query);
    res.json(result);
  } catch (err) {
    logger.error('Error fetching teacher invoices', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/teacher/:id', async (req, res) => {
  try {
    const invoice = await getTeacherInvoiceById(req.params.id);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    logger.error('Error fetching teacher invoice', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/teacher', validate(createTeacherInvoiceSchema), async (req, res) => {
  try {
    const invoice = await createTeacherInvoice(req.body, req.user);
    res.status(201).json(invoice);
  } catch (err) {
    logger.error('Error creating teacher invoice', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  }
});

router.put('/teacher/:id', validate(updateTeacherInvoiceSchema), async (req, res) => {
  try {
    const invoice = await updateTeacherInvoice(req.params.id, req.body, req.user);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error updating teacher invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/teacher/:id/pay', async (req, res) => {
  try {
    const invoice = await payTeacherInvoice(req.params.id, req.body, req.user);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error paying teacher invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/teacher/:id/cancel', async (req, res) => {
  try {
    const invoice = await cancelTeacherInvoice(req.params.id, req.user);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error cancelling teacher invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/teacher/:id', async (req, res) => {
  try {
    await deleteTeacherInvoice(req.params.id, req.user);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    logger.error('Error deleting teacher invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/teacher/:id/restore', async (req, res) => {
  try {
    await restoreTeacherInvoice(req.params.id, req.user);
    res.json({ message: 'Restored' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error restoring teacher invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---- Student Invoices ----

router.get('/student', async (req, res) => {
  try {
    const result = await listStudentInvoices(req.query);
    res.json(result);
  } catch (err) {
    logger.error('Error fetching student invoices', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/student/:id', async (req, res) => {
  try {
    const invoice = await getStudentInvoiceById(req.params.id);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    logger.error('Error fetching student invoice', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/student', validate(createStudentInvoiceSchema), async (req, res) => {
  try {
    const invoice = await createStudentInvoice(req.body, req.user);
    res.status(201).json(invoice);
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    logger.error('Error creating student invoice', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

router.put('/student/:id', validate(updateStudentInvoiceSchema), async (req, res) => {
  try {
    const invoice = await updateStudentInvoice(req.params.id, req.body, req.user);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error updating student invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/student/:id/pay', async (req, res) => {
  try {
    const invoice = await payStudentInvoice(req.params.id, req.body, req.user);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error paying student invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/student/:id/cancel', async (req, res) => {
  try {
    const invoice = await cancelStudentInvoice(req.params.id, req.user);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error cancelling student invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/student/:id/refund', async (req, res) => {
  try {
    const invoice = await refundStudentInvoice(req.params.id, req.user);
    res.json(invoice);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error refunding student invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/student/:id', async (req, res) => {
  try {
    await deleteStudentInvoice(req.params.id, req.user);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    logger.error('Error deleting student invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/student/:id/restore', async (req, res) => {
  try {
    await restoreStudentInvoice(req.params.id, req.user);
    res.json({ message: 'Restored' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 409) return res.status(409).json({ error: err.message });
    logger.error('Error restoring student invoice', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { invoiceRouter: router };
