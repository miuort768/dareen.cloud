import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const studentService = require('../../../services/studentService');
const { prisma } = require('../../../utils/prisma');

const adminUser = { id: 'test-admin', username: 'admin' };
let createdId = null;

describe('studentService', () => {
  beforeAll(async () => {
    await prisma.student.deleteMany({ where: { name: { startsWith: 'test-' } } });
  });

  afterAll(async () => {
    await prisma.student.deleteMany({ where: { name: { startsWith: 'test-' } } });
  });

  it('exports expected functions', () => {
    expect(typeof studentService.getStudents).toBe('function');
    expect(typeof studentService.createStudent).toBe('function');
    expect(typeof studentService.updateStudent).toBe('function');
    expect(typeof studentService.deleteStudent).toBe('function');
    expect(typeof studentService.deleteAllStudents).toBe('function');
    expect(typeof studentService.freezeEnrollment).toBe('function');
  });

  describe('createStudent', () => {
    it('creates a student with minimal data', async () => {
      const student = await studentService.createStudent({
        name: 'test-student-1', phone: '0555000088', password: 'Test123!',
        grade: 'Grade 5', subject: 'Math',
      }, adminUser);
      expect(student).toBeDefined();
      expect(student.name).toBe('test-student-1');
      expect(student.id).toBeDefined();
      createdId = student.id;
    });

    it('creates student with minimal fields', async () => {
      const student = await studentService.createStudent({ name: 'test-bad' }, adminUser);
      expect(student).toBeDefined();
      expect(student.name).toBe('test-bad');
    });
  });

  describe('getStudents', () => {
    it('returns paginated results', async () => {
      const result = await studentService.getStudents({ page: 1, limit: 10 }, adminUser);
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.total).toBe('number');
    });

    it('returns all students without pagination', async () => {
      const result = await studentService.getStudents({}, adminUser);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateStudent', () => {
    it('updates student name', async () => {
      if (!createdId) return;
      const updated = await studentService.updateStudent(createdId, { name: 'test-student-1-updated' }, adminUser);
      expect(updated.name).toBe('test-student-1-updated');
    });

    it('rejects non-existent student', async () => {
      await expect(studentService.updateStudent('nonexistent', { name: 'nobody' }, adminUser))
        .rejects.toThrow();
    });
  });

  describe('deleteStudent', () => {
    it('soft deletes a student', async () => {
      if (!createdId) return;
      await studentService.deleteStudent(createdId, adminUser);
      const deleted = await prisma.student.findUnique({ where: { id: createdId } });
      expect(deleted.deletedAt).not.toBeNull();
    });
  });
});
