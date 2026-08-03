const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { createTeacherSchema, updateTeacherSchema } = require('../../utils/validators');
const teacherService = require('../../services/teacherService');

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const teachers = await teacherService.listTeachers();
    res.json(teachers);
  } catch (err) {
    logger.error('Error fetching teachers', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الميزة متاحة للمعلمين فقط' });
    }
    const teacher = await teacherService.getTeacherById(req.user.id);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    logger.error('Error fetching own teacher profile', err, { id: req.user.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    logger.error('Error fetching teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', authMiddleware, checkRole(['admin']), validate(createTeacherSchema), async (req, res) => {
  try {
    const teacher = await teacherService.createTeacher(req.body, req.user);
    res.status(201).json(teacher);
  } catch (err) {
    if (err.statusCode === 400 || err.code === 'P2002') return res.status(400).json({ error: err.message || 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
    logger.error('Error adding teacher', err, { name: req.body.name });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authMiddleware, checkRole(['admin']), validate(updateTeacherSchema), async (req, res) => {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body, req.user);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    if (err.code === 'P2002') return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
    logger.error('Error updating teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    await teacherService.deleteTeacher(req.params.id, req.user);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    logger.error('Error deleting teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const count = await teacherService.deleteAllTeachers(req.user);
    res.json({ message: 'All teachers deleted', count });
  } catch (err) {
    logger.error('Error deleting all teachers', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/restore', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const teacher = await teacherService.restoreTeacher(req.params.id, req.user);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    logger.error('Error restoring teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { teacherRouter: router };
