import { describe, it, expect, beforeAll } from 'vitest';
const { hasPermission, getUserPermissions, PERMISSIONS } = require('../../../services/permissionService');

describe('permissionService', () => {
    it('exports expected functions and constants', () => {
        expect(typeof hasPermission).toBe('function');
        expect(typeof getUserPermissions).toBe('function');
        expect(PERMISSIONS).toBeDefined();
        expect(PERMISSIONS.DASHBOARD_READ).toBe('dashboard.read');
        expect(PERMISSIONS.STUDENTS_READ).toBe('students.read');
        expect(PERMISSIONS.SYSTEM_SETTINGS).toBe('system.settings');
    });

    it('returns false for unknown user permissions', async () => {
        const result = await hasPermission('nonexistent-user', 'dashboard.read');
        expect(result).toBe(false);
    });

    it('returns permissions for admin role', async () => {
        const perms = await getUserPermissions('admin-user');
        expect(Array.isArray(perms)).toBe(true);
    });
});
