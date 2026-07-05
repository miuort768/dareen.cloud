import { describe, it, expect, beforeAll } from 'vitest';
const { log, ACTION_TYPES, sanitizeMetadata, isCriticalAction, AUDIT_ACTIONS, AUDIT_STATUS } = require('../../../services/auditService');
const { isValidAction } = require('../../../constants/auditActions');
const { isValidStatus } = require('../../../constants/auditStatus');
const { prisma } = require('../../../utils/prisma');

describe('auditService', () => {
    it('exports log function and ACTION_TYPES', () => {
        expect(typeof log).toBe('function');
        expect(ACTION_TYPES).toBeDefined();
        expect(typeof ACTION_TYPES).toBe('object');
    });

    it('logs an audit entry to the database', async () => {
        await log('test-user', 'testuser', 'LOGIN_SUCCESS', 'Test audit entry', 'test', '1');
        const count = await prisma.auditLog.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });
});

describe('sanitizeMetadata', () => {
    it('removes password', () => {
        const result = sanitizeMetadata({ password: 'secret123', name: 'test' });
        expect(result.password).toBeUndefined();
        expect(result.name).toBe('test');
    });

    it('removes token', () => {
        const result = sanitizeMetadata({ token: 'abc123', name: 'test' });
        expect(result.token).toBeUndefined();
    });

    it('removes jwt', () => {
        const result = sanitizeMetadata({ jwt: 'eyJhbGci' });
        expect(result.jwt).toBeUndefined();
    });

    it('removes authorization', () => {
        const result = sanitizeMetadata({ authorization: 'Bearer xxx' });
        expect(result.authorization).toBeUndefined();
    });

    it('removes cookie', () => {
        const result = sanitizeMetadata({ cookie: 'session=abc' });
        expect(result.cookie).toBeUndefined();
    });

    it('removes secret', () => {
        const result = sanitizeMetadata({ secret: 'my-secret-key' });
        expect(result.secret).toBeUndefined();
    });

    it('removes apiKey', () => {
        const result = sanitizeMetadata({ apiKey: 'sk-123' });
        expect(result.apiKey).toBeUndefined();
    });

    it('recursively cleans nested objects', () => {
        const result = sanitizeMetadata({ user: { password: 'secret', name: 'test' } });
        expect(result.user.password).toBeUndefined();
        expect(result.user.name).toBe('test');
    });

    it('does not modify non-sensitive data', () => {
        const input = { name: 'Alice', email: 'alice@test.com', count: 42 };
        const result = sanitizeMetadata(input);
        expect(result).toEqual(input);
    });

    it('handles null and undefined gracefully', () => {
        expect(sanitizeMetadata(null)).toBeNull();
        expect(sanitizeMetadata(undefined)).toBeUndefined();
    });
});

describe('action validation', () => {
    it('isValidAction returns true for known actions', () => {
        expect(isValidAction(AUDIT_ACTIONS.LOGIN_SUCCESS)).toBe(true);
        expect(isValidAction(AUDIT_ACTIONS.TEACHER_CREATED)).toBe(true);
    });

    it('isValidAction returns false for unknown actions', () => {
        expect(isValidAction('BAD_ACTION')).toBe(false);
        expect(isValidAction('login_success')).toBe(false);
    });
});

describe('status validation', () => {
    it('isValidStatus returns true for known statuses', () => {
        expect(isValidStatus(AUDIT_STATUS.SUCCESS)).toBe(true);
        expect(isValidStatus(AUDIT_STATUS.FAILURE)).toBe(true);
        expect(isValidStatus(AUDIT_STATUS.WARNING)).toBe(true);
    });

    it('isValidStatus returns false for unknown statuses', () => {
        expect(isValidStatus('UNKNOWN')).toBe(false);
    });
});

describe('isCriticalAction', () => {
    it('returns true for ROLE_CHANGED', () => {
        expect(isCriticalAction(AUDIT_ACTIONS.ROLE_CHANGED)).toBe(true);
    });

    it('returns true for ACCOUNT_CUTOVER', () => {
        expect(isCriticalAction(AUDIT_ACTIONS.ACCOUNT_CUTOVER)).toBe(true);
    });

    it('returns false for LOGIN_SUCCESS', () => {
        expect(isCriticalAction(AUDIT_ACTIONS.LOGIN_SUCCESS)).toBe(false);
    });
});
