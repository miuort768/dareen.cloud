process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.CACHE_MODE = 'off';
process.env.AUDIT_MODE = 'off';

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql')) {
    throw new Error(
        'Backend tests require PostgreSQL. DATABASE_URL must be a postgresql:// URL ' +
            '(configured via vitest.config.ts using the embedded test database).'
    );
}

const { prisma } = require('../../utils/prisma');
prisma.$connect().catch(() => {});
