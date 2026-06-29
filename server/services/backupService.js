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

async function restoreBackup(data, userId) {
    await prisma.$transaction(async (tx) => {
        await tx.student.deleteMany();
        await tx.teacher.deleteMany();
        await tx.parent.deleteMany();
        await tx.session.deleteMany();
        await tx.teacherInvoice.deleteMany();
        await tx.studentInvoice.deleteMany();
        await tx.manualTransaction.deleteMany();
        await tx.fixedExpense.deleteMany();
        await tx.systemSetting.deleteMany();
        await tx.enrollment.deleteMany();
        await tx.evaluation.deleteMany();
        await tx.announcement.deleteMany();
        await tx.lead.deleteMany();
        for (const s of data.students || []) await tx.student.create({ data: s });
        for (const t of data.teachers || []) await tx.teacher.create({ data: t });
        for (const p of data.parents || []) await tx.parent.create({ data: p });
        for (const s of data.sessions || []) await tx.session.create({ data: s });
        for (const i of data.teacherInvoices || []) await tx.teacherInvoice.create({ data: i });
        for (const i of data.studentInvoices || []) await tx.studentInvoice.create({ data: i });
        for (const t of data.transactions || []) await tx.manualTransaction.create({ data: t });
        for (const f of data.fixedExpenses || []) await tx.fixedExpense.create({ data: f });
        for (const s of data.settings || []) await tx.systemSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
        for (const e of data.enrollments || []) await tx.enrollment.create({ data: e });
        for (const e of data.evaluations || []) await tx.evaluation.create({ data: e });
        for (const a of data.announcements || []) await tx.announcement.create({ data: a });
        for (const l of data.leads || []) await tx.lead.create({ data: l });
    });
}

async function getBackupHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        prisma.backup.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
        prisma.backup.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
let backupTimer = null;

function startAutoBackup(intervalMs = BACKUP_INTERVAL_MS) {
    stopAutoBackup();
    backupTimer = setInterval(async () => {
        try {
            await createBackup('system', 'system', 'auto');
        } catch (err) {
            console.error('Auto-backup failed:', err.message);
        }
    }, intervalMs);
}

function stopAutoBackup() {
    if (backupTimer) { clearInterval(backupTimer); backupTimer = null; }
}

module.exports = { createBackup, collectBackupData, restoreBackup, getBackupHistory, startAutoBackup, stopAutoBackup };
