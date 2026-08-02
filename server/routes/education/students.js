const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { createStudentSchema, updateStudentSchema } = require('../../utils/validators');
const studentService = require('../../services/studentService');
const logger = require('../../utils/logger');

router.get('/', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const result = await studentService.getStudents(req.query, req.user);
    res.json(result);
  } catch (err) {
    logger.error('Error fetching students', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', authMiddleware, checkRole(['admin']), validate(createStudentSchema), async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body, req.user);
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر للطالب.' });
    }
    logger.error('Error adding student', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authMiddleware, checkRole(['admin']), validate(updateStudentSchema), async (req, res) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body, req.user);
    res.json(student);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر للطالب.' });
    }
    logger.error('Error updating student', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id, req.user);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    logger.error('Error deleting student', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    await studentService.deleteAllStudents(req.user);
    res.json({ message: 'All students and enrollments deleted' });
  } catch (err) {
    logger.error('Error deleting all students', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:studentId/enrollments/:enrollmentId/freeze', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const updated = await studentService.freezeEnrollment(req.params.studentId, req.params.enrollmentId, req.body, req.user);
    res.json(updated);
  } catch (err) {
    logger.error('Error updating freeze status', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { studentRouter: router };
