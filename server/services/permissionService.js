const { prisma } = require('../utils/prisma');

async function getUserRoles(userId, model = 'users') {
    const userRoles = await prisma.userRole.findMany({
        where: { userId, model },
        include: {
            role: {
                include: {
                    permissions: {
                        include: { permission: true },
                        where: { granted: 1 }
                    }
                }
            }
        }
    });
    return userRoles;
}

async function getUserPermissions(userId, model = 'users') {
    const roles = await getUserRoles(userId, model);
    const permissions = new Set();
    for (const ur of roles) {
        for (const rp of ur.role.permissions) {
            permissions.add(rp.permission.key);
        }
    }
    return [...permissions];
}

async function hasPermission(userId, permissionKey, model = 'users') {
    if (permissionKey === '*') return true;
    const permissions = await getUserPermissions(userId, model);
    return permissions.includes('*') || permissions.includes(permissionKey);
}

async function hasAnyPermission(userId, permissionKeys, model = 'users') {
    const permissions = await getUserPermissions(userId, model);
    if (permissions.includes('*')) return true;
    return permissionKeys.some(p => permissions.includes(p));
}

const PERMISSIONS = {
    // Dashboard
    DASHBOARD_READ: 'dashboard.read',
    DASHBOARD_REVENUE: 'dashboard.revenue',
    DASHBOARD_ANALYTICS: 'dashboard.analytics',

    // Students
    STUDENTS_READ: 'students.read',
    STUDENTS_CREATE: 'students.create',
    STUDENTS_EDIT: 'students.edit',
    STUDENTS_DELETE: 'students.delete',

    // Teachers
    TEACHERS_READ: 'teachers.read',
    TEACHERS_CREATE: 'teachers.create',
    TEACHERS_EDIT: 'teachers.edit',
    TEACHERS_DELETE: 'teachers.delete',

    // Finance
    FINANCE_READ: 'finance.read',
    FINANCE_TRANSACTIONS_CREATE: 'finance.transactions.create',
    FINANCE_TRANSACTIONS_DELETE: 'finance.transactions.delete',
    FINANCE_INVOICES_READ: 'finance.invoices.read',
    FINANCE_INVOICES_EDIT: 'finance.invoices.edit',
    FINANCE_REPORTS: 'finance.reports',

    // Sessions
    SESSIONS_READ: 'sessions.read',
    SESSIONS_CREATE: 'sessions.create',
    SESSIONS_EDIT: 'sessions.edit',

    // Leads
    LEADS_READ: 'leads.read',
    LEADS_CREATE: 'leads.create',
    LEADS_EDIT: 'leads.edit',

    // System
    SYSTEM_SETTINGS: 'system.settings',
    SYSTEM_USERS: 'system.users',
    SYSTEM_BACKUP: 'system.backup',
    SYSTEM_AUDIT: 'system.audit',
};

module.exports = { getUserRoles, getUserPermissions, hasPermission, hasAnyPermission, PERMISSIONS };
