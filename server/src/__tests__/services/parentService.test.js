import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const parentService = require('../../../services/parentService');
const { prisma } = require('../../../utils/prisma');

const adminUser = { id: 'test-admin', username: 'admin' };
let createdId = null;

describe('parentService', () => {
  beforeAll(async () => {
    await prisma.parent.deleteMany({ where: { name: { startsWith: 'test-' } } });
  });

  afterAll(async () => {
    await prisma.parent.deleteMany({ where: { name: { startsWith: 'test-' } } });
  });

  it('exports expected functions', () => {
    expect(typeof parentService.listParents).toBe('function');
    expect(typeof parentService.getParentById).toBe('function');
    expect(typeof parentService.createParent).toBe('function');
    expect(typeof parentService.updateParent).toBe('function');
    expect(typeof parentService.deleteParent).toBe('function');
    expect(typeof parentService.restoreParent).toBe('function');
    expect(typeof parentService.getMyChildren).toBe('function');
    expect(typeof parentService.getChildSessions).toBe('function');
    expect(typeof parentService.getChildInvoices).toBe('function');
  });

  describe('createParent', () => {
    it('creates a parent with minimal data', async () => {
      const parent = await parentService.createParent({
        name: 'test-parent-1', phone: '0555000099', password: 'Test123!', email: 'test@parent.com',
      }, adminUser);
      expect(parent).toBeDefined();
      expect(parent.name).toBe('test-parent-1');
      expect(parent.id).toBeDefined();
      createdId = parent.id;
    });

    it('rejects missing required fields', async () => {
      await expect(parentService.createParent({ name: 'test-bad' }, adminUser)).rejects.toThrow();
    });
  });

  describe('listParents', () => {
    it('returns an array', async () => {
      const parents = await parentService.listParents();
      expect(Array.isArray(parents)).toBe(true);
    });
  });

  describe('getParentById', () => {
    it('returns parent by id', async () => {
      if (!createdId) return;
      const parent = await parentService.getParentById(createdId);
      expect(parent).toBeDefined();
      expect(parent.id).toBe(createdId);
    });

    it('rejects non-existent id', async () => {
      await expect(parentService.getParentById('nonexistent')).rejects.toThrow();
    });
  });

  describe('updateParent', () => {
    it('updates parent name', async () => {
      if (!createdId) return;
      const updated = await parentService.updateParent(createdId, { name: 'test-parent-1-updated' }, adminUser);
      expect(updated.name).toBe('test-parent-1-updated');
    });
  });

  describe('deleteParent and restoreParent', () => {
    it('soft deletes a parent', async () => {
      if (!createdId) return;
      await parentService.deleteParent(createdId, adminUser);
      const deleted = await prisma.parent.findUnique({ where: { id: createdId } });
      expect(deleted.deletedAt).not.toBeNull();
    });

    it('restores a soft-deleted parent', async () => {
      if (!createdId) return;
      await parentService.restoreParent(createdId, adminUser);
      const restored = await prisma.parent.findUnique({ where: { id: createdId } });
      expect(restored.deletedAt).toBeNull();
    });
  });

  describe('getMyChildren', () => {
    it('returns an array for non-existent parent', async () => {
      const children = await parentService.getMyChildren('nonexistent-phone');
      expect(Array.isArray(children)).toBe(true);
    });
  });
});
