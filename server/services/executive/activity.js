const { prisma } = require('../../utils/prisma');

const TYPE_GROUPS = {
    finance: ['TRANSACTION_CREATE', 'TRANSACTION_DELETE', 'EXPENSE_UPDATE', 'INVOICE_CREATE', 'INVOICE_UPDATE', 'INVOICE_DELETE'],
    students: ['STUDENT_CREATE', 'STUDENT_UPDATE', 'STUDENT_DELETE'],
    teachers: ['TEACHER_CREATE', 'TEACHER_UPDATE', 'TEACHER_DELETE'],
    sessions: ['SESSION_CREATE', 'SESSION_UPDATE', 'SESSION_DELETE'],
    system: ['SETTING_UPDATE', 'SYSTEM_RESET', 'BACKUP_CREATED'],
};

async function getActivity(filter) {
    const where = {};
    if (filter && filter !== 'all' && TYPE_GROUPS[filter]) {
        where.action = { in: TYPE_GROUPS[filter] };
    }

    try {
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        return logs.map(log => ({
            id: log.id,
            userId: log.userId,
            username: log.username,
            action: log.action,
            details: log.details,
            entityType: log.entityType,
            entityId: log.entityId,
            timestamp: log.timestamp,
            group: getGroup(log.action),
            icon: getIcon(log.action),
        }));
    } catch {
        return [];
    }
}

function getGroup(action) {
    for (const [group, actions] of Object.entries(TYPE_GROUPS)) {
        if (actions.includes(action)) return group;
    }
    return 'other';
}

function getIcon(action) {
    if (action?.startsWith('INVOICE') || action?.startsWith('TRANSACTION') || action?.startsWith('EXPENSE')) return 'finance';
    if (action?.startsWith('STUDENT')) return 'students';
    if (action?.startsWith('TEACHER')) return 'teachers';
    if (action?.startsWith('SESSION')) return 'sessions';
    return 'system';
}

module.exports = { getActivity };
