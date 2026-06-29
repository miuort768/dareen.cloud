import { describe, it, expect } from 'vitest';
const { log, ACTION_TYPES } = require('../../../services/auditService');
const { prisma } = require('../../../utils/prisma');

describe('auditService', () => {
    it('exports log function and ACTION_TYPES', () => {
        expect(typeof log).toBe('function');
        expect(ACTION_TYPES).toBeDefined();
        expect(typeof ACTION_TYPES).toBe('object');
    });

    it('logs an audit entry to the database', async () => {
        await log('test-user', 'testuser', 'TEST_ACTION', 'Test audit entry', 'test', '1');
        const count = await prisma.auditLog.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });
});
