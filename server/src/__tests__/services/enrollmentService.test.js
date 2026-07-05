import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const enrollmentService = require('../../../services/enrollmentService');
const { prisma } = require('../../../utils/prisma');

const adminUser = { id: 'test-admin', username: 'admin' };
let testStudentId = null;
let testTeacherId = null;
let createdId = null;

describe('enrollmentService', () => {
  beforeAll(async () => {
    await prisma.student.deleteMany({ where: { name: { startsWith: 'test-enr-' } } });
    await prisma.teacher.deleteMany({ where: { name: { startsWith: 'test-enr-' } } });

    const student = await prisma.student.create({
      data: { name: 'test-enr-student', studentPhone: '0555000077', grade: 'G5' },
    });
    testStudentId = student.id;

    const teacher = await prisma.teacher.create({
      data: { name: 'test-enr-teacher', phone1: '0555000066', subject: 'Science' },
    });
    testTeacherId = teacher.id;
  });

  afterAll(async () => {
    await prisma.enrollment.deleteMany({ where: { studentId: testStudentId } });
    await prisma.student.deleteMany({ where: { name: { startsWith: 'test-enr-' } } });
    await prisma.teacher.deleteMany({ where: { name: { startsWith: 'test-enr-' } } });
  });

  it('exports expected functions', () => {
    expect(typeof enrollmentService.getEnrollments).toBe('function');
    expect(typeof enrollmentService.getEnrollmentById).toBe('function');
    expect(typeof enrollmentService.getStudentEnrollments).toBe('function');
    expect(typeof enrollmentService.getTeacherEnrollments).toBe('function');
    expect(typeof enrollmentService.createEnrollment).toBe('function');
    expect(typeof enrollmentService.updateEnrollment).toBe('function');
    expect(typeof enrollmentService.suspendEnrollment).toBe('function');
    expect(typeof enrollmentService.restoreEnrollment).toBe('function');
    expect(typeof enrollmentService.deleteEnrollment).toBe('function');
  });

  describe('createEnrollment', () => {
    it('creates an enrollment', async () => {
      const enrollment = await enrollmentService.createEnrollment({
        studentId: testStudentId, teacherId: testTeacherId,
        subject: 'Math', dayOfWeek: 1, time: '15:00',
      }, adminUser);
      expect(enrollment).toBeDefined();
      expect(enrollment.subject).toBe('Math');
      expect(enrollment.id).toBeDefined();
      createdId = enrollment.id;
    });

    it('rejects missing studentId', async () => {
      await expect(enrollmentService.createEnrollment({
        teacherId: testTeacherId, subject: 'Math',
      }, adminUser)).rejects.toThrow();
    });
  });

  describe('getEnrollments', () => {
    it('returns paginated results', async () => {
      const result = await enrollmentService.getEnrollments({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getEnrollmentById', () => {
    it('returns enrollment by id', async () => {
      if (!createdId) return;
      const enrollment = await enrollmentService.getEnrollmentById(createdId);
      expect(enrollment).toBeDefined();
      expect(enrollment.id).toBe(createdId);
    });

    it('rejects non-existent id', async () => {
      await expect(enrollmentService.getEnrollmentById('nonexistent')).rejects.toThrow();
    });
  });

  describe('updateEnrollment', () => {
    it('updates enrollment subject', async () => {
      if (!createdId) return;
      const updated = await enrollmentService.updateEnrollment(createdId, { subject: 'Science' }, adminUser);
      expect(updated.subject).toBe('Science');
    });
  });

  describe('suspendEnrollment and restoreEnrollment', () => {
    it('suspends an enrollment', async () => {
      if (!createdId) return;
      const suspended = await enrollmentService.suspendEnrollment(createdId, { reason: 'test-suspend' }, adminUser);
      expect(suspended.isFrozen).toBe(1);
    });

    it('restores a suspended enrollment', async () => {
      if (!createdId) return;
      const restored = await enrollmentService.restoreEnrollment(createdId, adminUser);
      expect(restored.isFrozen).toBe(0);
    });
  });

  describe('deleteEnrollment', () => {
    it('soft deletes an enrollment', async () => {
      if (!createdId) return;
      await enrollmentService.deleteEnrollment(createdId, adminUser);
      const deleted = await prisma.enrollment.findUnique({ where: { id: createdId } });
      expect(deleted.deletedAt).not.toBeNull();
    });
  });
});
