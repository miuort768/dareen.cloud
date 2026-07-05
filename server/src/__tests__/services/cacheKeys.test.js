import { describe, it, expect } from 'vitest';
const { CACHE_KEYS } = require('../../../constants/cacheKeys');

describe('cacheKeys', () => {
  describe('teachers', () => {
    it('generates list key', () => {
      expect(CACHE_KEYS.teachers.list()).toBe('teachers:list');
    });
    it('generates byId key', () => {
      expect(CACHE_KEYS.teachers.byId('abc')).toBe('teachers:id:abc');
    });
  });

  describe('parents', () => {
    it('generates list key', () => {
      expect(CACHE_KEYS.parents.list()).toBe('parents:list');
    });
    it('generates byId key', () => {
      expect(CACHE_KEYS.parents.byId('xyz')).toBe('parents:id:xyz');
    });
  });

  describe('students', () => {
    it('generates list key', () => {
      expect(CACHE_KEYS.students.list()).toBe('students:list');
    });
    it('generates byId key', () => {
      expect(CACHE_KEYS.students.byId('s1')).toBe('students:id:s1');
    });
  });

  describe('enrollments', () => {
    it('generates list key', () => {
      expect(CACHE_KEYS.enrollments.list()).toBe('enrollments:list');
    });
    it('generates byId key', () => {
      expect(CACHE_KEYS.enrollments.byId('e1')).toBe('enrollments:id:e1');
    });
    it('generates byStudent key', () => {
      expect(CACHE_KEYS.enrollments.byStudent('st1')).toBe('enrollments:student:st1');
    });
    it('generates byTeacher key', () => {
      expect(CACHE_KEYS.enrollments.byTeacher('t1')).toBe('enrollments:teacher:t1');
    });
  });

  describe('invoices', () => {
    it('generates teacher list key', () => {
      expect(CACHE_KEYS.invoices.teacherList()).toBe('invoices:teacher:list');
    });
    it('generates teacher byId key', () => {
      expect(CACHE_KEYS.invoices.teacherById('ti1')).toBe('invoices:teacher:id:ti1');
    });
    it('generates student list key', () => {
      expect(CACHE_KEYS.invoices.studentList()).toBe('invoices:student:list');
    });
    it('generates student byId key', () => {
      expect(CACHE_KEYS.invoices.studentById('si1')).toBe('invoices:student:id:si1');
    });
    it('generates stats key', () => {
      expect(CACHE_KEYS.invoices.stats()).toBe('invoices:stats');
    });
  });
});
