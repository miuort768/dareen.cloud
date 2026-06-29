const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

const ACTION_TYPES = {
    // Finance
    TRANSACTION_CREATE: 'TRANSACTION_CREATE',
    TRANSACTION_DELETE: 'TRANSACTION_DELETE',
    TRANSACTION_DELETE_ALL: 'TRANSACTION_DELETE_ALL',
    EXPENSE_UPDATE: 'EXPENSE_UPDATE',
    EXPENSE_RESET: 'EXPENSE_RESET',

    // Invoices
    INVOICE_CREATE: 'INVOICE_CREATE',
    INVOICE_UPDATE: 'INVOICE_UPDATE',
    INVOICE_DELETE: 'INVOICE_DELETE',

    // Sessions
    SESSION_CREATE: 'SESSION_CREATE',
    SESSION_UPDATE: 'SESSION_UPDATE',
    SESSION_DELETE: 'SESSION_DELETE',

    // Students
    STUDENT_CREATE: 'STUDENT_CREATE',
    STUDENT_UPDATE: 'STUDENT_UPDATE',
    STUDENT_DELETE: 'STUDENT_DELETE',

    // Teachers
    TEACHER_CREATE: 'TEACHER_CREATE',
    TEACHER_UPDATE: 'TEACHER_UPDATE',
    TEACHER_DELETE: 'TEACHER_DELETE',

    // System
    SETTING_UPDATE: 'SETTING_UPDATE',
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    LOGIN: 'LOGIN',
    LOGOUT_ALL: 'LOGOUT_ALL',
};

async function log(userId, username, action, details = null, entityType = null, entityId = null) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                username,
                action,
                details: details ? JSON.stringify(details) : null,
                entityType,
                entityId,
            }
        });
    } catch (err) {
        logger.error('Audit log failed', err);
    }
}

function logMiddleware(action, entityType, getDetails) {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = async function (body) {
            if (res.statusCode < 400 && req.user) {
                const details = getDetails ? getDetails(req, body) : null;
                const entityId = req.params.id || body?.id || null;
                await log(req.user.id, req.user.username, action, details, entityType, entityId);
            }
            return originalJson(body);
        };
        next();
    };
}

module.exports = { audit: log, log, logMiddleware, ACTION_TYPES };
