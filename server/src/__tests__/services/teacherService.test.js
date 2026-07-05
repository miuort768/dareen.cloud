import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const teacherService = require('../../../services/teacherService');
const { prisma } = require('../../../utils/prisma');

const adminUser = { id: 'test-admin', username: 'admin' };
let createdId = null;

describe('teacherService', () => {
  beforeAll(async () => {
    await prisma.teacher.deleteMany({ where: { name: { startsWith: 'test-' } } });
  });

  afterAll(async () => {
    await prisma.teacher.deleteMany({ where: { name: { startsWith: 'test-' } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'test-' } } });
  });

  it('exports expected functions', () => {
    expect(typeof teacherService.listTeachers).toBe('function');
    expect(typeof teacherService.getTeacherById).toBe('function');
    expect(typeof teacherService.createTeacher).toBe('function');
    expect(typeof teacherService.updateTeacher).toBe('function');
    expect(typeof teacherService.deleteTeacher).toBe('function');
    expect(typeof teacherService.deleteAllTeachers).toBe('function');
    expect(typeof teacherService.restoreTeacher).toBe('function');
  });

  describe('createTeacher', () => {
    it('creates a teacher with minimal data', async () => {
      const teacher = await teacherService.createTeacher({
        name: 'test-teacher-1', phone1: '0555000001', subject: 'Math', password: 'Test123!',
      }, adminUser);
      expect(teacher).toBeDefined();
      expect(teacher.name).toBe('test-teacher-1');
      expect(teacher.subject).toBe('Math');
      expect(teacher.id).toBeDefined();
      createdId = teacher.id;
    });

    it('creates teacher with duplicate phone (no unique constraint)', async () => {
      const teacher = await teacherService.createTeacher({
        name: 'test-teacher-dup', phone1: '0555000001', subject: 'Science', password: 'Test123!',
      }, adminUser);
      expect(teacher).toBeDefined();
      expect(teacher.name).toBe('test-teacher-dup');
    });

    it('creates teacher with minimal fields', async () => {
      const teacher = await teacherService.createTeacher({ name: 'test-bad' }, adminUser);
      expect(teacher).toBeDefined();
      expect(teacher.name).toBe('test-bad');
    });
  });

  describe('listTeachers', () => {
    it('returns an array', async () => {
      const teachers = await teacherService.listTeachers();
      expect(Array.isArray(teachers)).toBe(true);
    });
  });

  describe('getTeacherById', () => {
    it('returns teacher by id', async () => {
      if (!createdId) return;
      const teacher = await teacherService.getTeacherById(createdId);
      expect(teacher).toBeDefined();
      expect(teacher.id).toBe(createdId);
    });

    it('rejects non-existent id', async () => {
      await expect(teacherService.getTeacherById('nonexistent'))
        .rejects.toThrow();
    });
  });

  describe('updateTeacher', () => {
    it('updates teacher name', async () => {
      if (!createdId) return;
      const updated = await teacherService.updateTeacher(createdId, { name: 'test-teacher-1-updated' }, adminUser);
      expect(updated.name).toBe('test-teacher-1-updated');
    });

    it('rejects non-existent teacher', async () => {
      await expect(teacherService.updateTeacher('nonexistent', { name: 'nobody' }, adminUser))
        .rejects.toThrow();
    });
  });

  describe('deleteTeacher and restoreTeacher', () => {
    it('soft deletes a teacher', async () => {
      if (!createdId) return;
      await teacherService.deleteTeacher(createdId, adminUser);
      const deleted = await prisma.teacher.findUnique({ where: { id: createdId } });
      expect(deleted.deletedAt).not.toBeNull();
    });

    it('restores a soft-deleted teacher', async () => {
      if (!createdId) return;
      await teacherService.restoreTeacher(createdId, adminUser);
      const restored = await prisma.teacher.findUnique({ where: { id: createdId } });
      expect(restored.deletedAt).toBeNull();
    });
  });
});
