const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authMiddleware, checkRole } = require('../middleware/auth');
const enrollmentService = require('../services/enrollmentService');

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const result = await enrollmentService.getEnrollments(req.query);
    res.json(result);
  } catch (err) {
    logger.error('Error fetching enrollments', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/student/:studentId', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const enrollments = await enrollmentService.getStudentEnrollments(req.params.studentId);
    res.json(enrollments);
  } catch (err) {
    logger.error('Error fetching student enrollments', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/teacher/:teacherId', authMiddleware, checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const enrollments = await enrollmentService.getTeacherEnrollments(req.params.teacherId);
    res.json(enrollments);
  } catch (err) {
    logger.error('Error fetching teacher enrollments', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const enrollment = await enrollmentService.getEnrollmentById(req.params.id);
    res.json(enrollment);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Enrollment not found' });
    logger.error('Error fetching enrollment', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const enrollment = await enrollmentService.createEnrollment(req.body, req.user);
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    logger.error('Error creating enrollment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const enrollment = await enrollmentService.updateEnrollment(req.params.id, req.body, req.user);
    res.json(enrollment);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Enrollment not found' });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    logger.error('Error updating enrollment', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/suspend', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const enrollment = await enrollmentService.suspendEnrollment(req.params.id, req.body, req.user);
    res.json(enrollment);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Enrollment not found' });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    logger.error('Error suspending enrollment', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/restore', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const enrollment = await enrollmentService.restoreEnrollment(req.params.id, req.user);
    res.json(enrollment);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Enrollment not found' });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    logger.error('Error restoring enrollment', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    await enrollmentService.deleteEnrollment(req.params.id, req.user);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Enrollment not found' });
    logger.error('Error deleting enrollment', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
