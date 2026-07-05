const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const parentService = require('../services/parentService');

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const parents = await parentService.listParents();
    res.json(parents);
  } catch (err) {
    logger.error('Error fetching parents', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/my-children', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
  try {
    const children = await parentService.getMyChildren(req.user.phone);
    res.json(children);
  } catch (err) {
    logger.error('Error fetching children', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/child-sessions/:studentId', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
  try {
    const sessions = await parentService.getChildSessions(req.params.studentId, req.user.phone);
    res.json(sessions);
  } catch (err) {
    if (err.statusCode === 403) return res.status(403).json({ error: 'Unauthorized' });
    logger.error('Error fetching child sessions', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/child-invoices/:studentId', authMiddleware, checkRole(['parent', 'admin']), async (req, res) => {
  try {
    const invoices = await parentService.getChildInvoices(req.params.studentId, req.user.phone);
    res.json(invoices);
  } catch (err) {
    if (err.statusCode === 403) return res.status(403).json({ error: 'Unauthorized' });
    logger.error('Error fetching child invoices', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const parent = await parentService.getParentById(req.params.id);
    res.json(parent);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Parent not found' });
    logger.error('Error fetching parent', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const parent = await parentService.createParent(req.body, req.user);
    res.status(201).json(parent);
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    if (err.code === 'P2002') return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.' });
    logger.error('Error adding parent', err, { name: req.body.name });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const parent = await parentService.updateParent(req.params.id, req.body, req.user);
    res.json(parent);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Parent not found' });
    if (err.code === 'P2002') return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.' });
    logger.error('Error updating parent', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    await parentService.deleteParent(req.params.id, req.user);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Parent not found' });
    logger.error('Error deleting parent', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const count = await parentService.deleteAllParents(req.user);
    res.json({ message: 'All parents deleted', count });
  } catch (err) {
    logger.error('Error deleting all parents', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/restore', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const parent = await parentService.restoreParent(req.params.id, req.user);
    res.json(parent);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Parent not found' });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    logger.error('Error restoring parent', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { parentRouter: router };
