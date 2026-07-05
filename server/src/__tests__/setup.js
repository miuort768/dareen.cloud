process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'file:./dev.db';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.CACHE_MODE = 'off';
process.env.AUDIT_MODE = 'off';

const { prisma } = require('../../utils/prisma');
prisma.$connect().catch(() => {});
