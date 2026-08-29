const { prisma } = require('../../utils/prisma');
const logger = require('../../utils/logger');

const TYPE_GROUPS = {
    finance: ['TRANSACTION_CREATED', 'TRANSACTION_DELETED', 'TRANSACTION_DELETED_ALL', 'EXPENSE_UPDATED', 'EXPENSE_RESET', 'INVOICE_CREATED', 'INVOICE_UPDATED', 'INVOICE_DELETED', 'INVOICE_PAID', 'INVOICE_CANCELLED', 'INVOICE_RESTORED', 'REFUND_PROCESSED'],
    students: ['STUDENT_CREATED', 'STUDENT_UPDATED', 'STUDENT_DELETED'],
    teachers: ['TEACHER_CREATED', 'TEACHER_UPDATED', 'TEACHER_DELETED', 'TEACHER_SUSPENDED'],
    sessions: ['SESSION_CREATED', 'SESSION_UPDATED', 'SESSION_DELETED', 'LIVE_SESSION_START', 'LIVE_SESSION_END'],
    auth: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_ALL'],
    system: ['SETTING_UPDATED', 'SYSTEM_RESET', 'BACKUP_CREATED', 'EXPORT_DATA'],
};

async function fetchAuditEvents(filter) {
    const where = {};
    if (filter && filter !== 'all' && TYPE_GROUPS[filter]) {
        where.action = { in: TYPE_GROUPS[filter] };
    }

    const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 15,
    });

    return logs.map(log => ({
        id: `audit-${log.id}`,
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
}

// Recorded live sessions: startedAt = attendance (حضور), endedAt = departure (انصراف)
async function fetchLiveSessionEvents() {
    const since = new Date(Date.now() - 24 * 3600000);
    const sessions = await prisma.liveSession.findMany({
        where: { startedAt: { gte: since } },
        orderBy: { startedAt: 'desc' },
        take: 15,
        select: {
            id: true,
            teacherId: true,
            teacherName: true,
            subject: true,
            title: true,
            startedAt: true,
            endedAt: true,
        },
    });

    const events = [];
    for (const ls of sessions) {
        events.push({
            id: `live-start-${ls.id}`,
            userId: ls.teacherId,
            username: ls.teacherName,
            action: 'LIVE_SESSION_START',
            details: ls.subject || ls.title || null,
            entityType: 'live_session',
            entityId: ls.id,
            timestamp: ls.startedAt,
            group: 'sessions',
            icon: 'live',
        });
        if (ls.endedAt) {
            events.push({
                id: `live-end-${ls.id}`,
                userId: ls.teacherId,
                username: ls.teacherName,
                action: 'LIVE_SESSION_END',
                details: ls.subject || ls.title || null,
                entityType: 'live_session',
                entityId: ls.id,
                timestamp: ls.endedAt,
                group: 'sessions',
                icon: 'live',
            });
        }
    }
    return events;
}

async function getActivity(filter) {
    const [auditEvents, liveEvents] = await Promise.all([
        fetchAuditEvents(filter).catch((err) => {
            logger.warn('[executive] activity: audit fetch failed', err);
            return [];
        }),
        fetchLiveSessionEvents().catch((err) => {
            logger.warn('[executive] activity: live sessions fetch failed', err);
            return [];
        }),
    ]);

    return [...auditEvents, ...liveEvents]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
}

function getGroup(action) {
    for (const [group, actions] of Object.entries(TYPE_GROUPS)) {
        if (actions.includes(action)) return group;
    }
    return 'other';
}

function getIcon(action) {
    if (action === 'LIVE_SESSION_START' || action === 'LIVE_SESSION_END') return 'live';
    if (action?.startsWith('LOGIN') || action === 'LOGOUT' || action === 'LOGOUT_ALL') return 'auth';
    if (action?.startsWith('INVOICE') || action?.startsWith('TRANSACTION') || action?.startsWith('EXPENSE')) return 'finance';
    if (action?.startsWith('STUDENT')) return 'students';
    if (action?.startsWith('TEACHER')) return 'teachers';
    if (action?.startsWith('SESSION')) return 'sessions';
    return 'system';
}

module.exports = { getActivity };
