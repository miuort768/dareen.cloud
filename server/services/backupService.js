const { prisma } = require('../utils/prisma');

async function createBackup(userId, username, type = 'manual') {
    const data = await collectBackupData();
    const json = JSON.stringify(data);
    const size = Buffer.byteLength(json, 'utf8');
    const backup = await prisma.backup.create({
        data: { userId, username, type, size, status: 'completed', filePath: null },
    });
    return { backup, data };
}

async function collectBackupData() {
    const [students, teachers, parents, sessions, teacherInvoices, studentInvoices, transactions, fixedExpenses, settings, enrollments, evaluations, announcements, leads] = await Promise.all([
        prisma.student.findMany({ where: { deletedAt: null } }),
        prisma.teacher.findMany({ where: { deletedAt: null } }),
        prisma.parent.findMany({ where: { deletedAt: null } }),
        prisma.session.findMany(),
        prisma.teacherInvoice.findMany(),
        prisma.studentInvoice.findMany(),
        prisma.manualTransaction.findMany(),
        prisma.fixedExpense.findMany(),
        prisma.systemSetting.findMany(),
        prisma.enrollment.findMany(),
        prisma.evaluation.findMany(),
        prisma.announcement.findMany(),
        prisma.lead.findMany(),
    ]);
    return { version: '1.2', timestamp: new Date().toISOString(), students, teachers, parents, sessions, teacherInvoices, studentInvoices, transactions, fixedExpenses, settings, enrollments, evaluations, announcements, leads };
}

async function getBackupHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        prisma.backup.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
        prisma.backup.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

let backupTimer = null;

function stopAutoBackup() {
    if (backupTimer) { clearInterval(backupTimer); backupTimer = null; }
}

module.exports = { createBackup, collectBackupData, getBackupHistory, stopAutoBackup };
