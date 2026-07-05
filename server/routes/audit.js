const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const { prisma } = require('../utils/prisma');
const ResponseHandler = require('../utils/responseHandler');

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

        const where = {};

        const { accountId, action, entityType, status, requestId, from, to, cursor } = req.query;

        if (accountId) where.accountId = accountId;
        if (action) where.action = action;
        if (entityType) where.entityType = entityType;
        if (status) where.status = status;
        if (requestId) where.requestId = requestId;

        if (from || to) {
            where.timestamp = {};
            if (from) where.timestamp.gte = new Date(from);
            if (to) where.timestamp.lte = new Date(to);
        }

        const orderBy = [{ timestamp: 'desc' }, { id: 'desc' }];

        if (cursor) {
            const logs = await prisma.auditLog.findMany({
                where,
                orderBy,
                cursor: { id: cursor },
                skip: 1,
                take: limit,
            });

            res.json({
                data: logs,
                pagination: {
                    limit,
                    cursor: logs.length === limit ? logs[logs.length - 1].id : null,
                    hasMore: logs.length === limit,
                },
            });
        } else {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const skip = (page - 1) * limit;

            const [logs, total] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                }),
                prisma.auditLog.count({ where }),
            ]);

            res.json({
                data: logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            });
        }
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Audit log fetch error');
    }
});

router.get('/stats', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayFilter = { timestamp: { gte: todayStart, lte: todayEnd } };

        const [
            todayCount,
            failedLogins,
            passwordResets,
            roleChanges,
        ] = await Promise.all([
            prisma.auditLog.count({ where: todayFilter }),
            prisma.auditLog.count({
                where: { ...todayFilter, action: 'LOGIN_FAILED' },
            }),
            prisma.auditLog.count({
                where: {
                    timestamp: { gte: todayStart },
                    action: { in: ['PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED'] },
                },
            }),
            prisma.auditLog.count({
                where: { ...todayFilter, action: 'ROLE_CHANGED' },
            }),
        ]);

        res.json({
            today: todayCount,
            failedLogins,
            passwordResets,
            roleChanges,
        });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Audit stats error');
    }
});

module.exports = router;
