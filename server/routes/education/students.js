const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { createStudentSchema, updateStudentSchema, updateEnrollmentScheduleSchema, updateEnrollmentNotesSchema } = require('../../utils/validators');
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

const DELETE_ALL_PASSWORD = 'dareen';

router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  const password = req.headers['x-delete-password'];
  if (password !== DELETE_ALL_PASSWORD) {
    return res.status(403).json({ error: 'كلمة المرور التحذيرية غير صحيحة' });
  }
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

router.patch('/:studentId/enrollments/:enrollmentId/schedule', authMiddleware, checkRole(['admin', 'teacher']), validate(updateEnrollmentScheduleSchema), async (req, res) => {
  try {
    const updated = await studentService.updateEnrollmentSchedule(req.params.studentId, req.params.enrollmentId, req.body.schedule, req.user);
    res.json(updated);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    logger.error('Error updating enrollment schedule', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:studentId/enrollments/:enrollmentId/notes', authMiddleware, checkRole(['admin', 'teacher']), validate(updateEnrollmentNotesSchema), async (req, res) => {
  try {
    const updated = await studentService.updateEnrollmentNotes(req.params.studentId, req.params.enrollmentId, req.body.notes, req.user);
    res.json(updated);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    logger.error('Error updating enrollment notes', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { studentRouter: router };
