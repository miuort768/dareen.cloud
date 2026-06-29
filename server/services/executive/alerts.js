const { prisma } = require('../../utils/prisma');

async function getAlerts() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const in10Min = new Date(now.getTime() + 10 * 60000);
    const in10MinTime = `${String(in10Min.getHours()).padStart(2, '0')}:${String(in10Min.getMinutes()).padStart(2, '0')}`;
    const twoDaysFromNow = new Date(now.getTime() + 2 * 86400000).toISOString();

    const critical = [];
    const warning = [];
    const reminder = [];
    const info = [];

    // 🔴 Critical: DB health
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        critical.push({ type: 'db_down', message: 'قاعدة البيانات غير متصلة', severity: 'critical' });
    }

    // 🔴 Critical: Redis (check via monitoring middleware)
    try {
        const redis = require('../../utils/redis');
        const status = redis.status();
        if (status !== 'online') {
            critical.push({ type: 'redis_down', message: 'Redis غير متصل — Queue قد يتأثر', severity: 'critical' });
        }
    } catch { /* ignore */ }

    // 🔴 Critical: backup failures
    const recentBackups = await prisma.backup.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
    });
    const failedBackups = recentBackups.filter(b => b.status !== 'completed');
    if (failedBackups.length >= 3) {
        critical.push({ type: 'backup_failed', message: 'آخر 3 نسخ احتياطية فشلت', severity: 'critical' });
    }

    // 🟠 Warning: overdue invoices
    const overdueInvoices = await prisma.studentInvoice.findMany({
        where: { status: { in: ['overdue', 'متأخرة'] } },
        select: { amount: true, currency: true },
    });
    const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    if (overdueInvoices.length > 0) {
        warning.push({
            type: 'overdue_invoices',
            message: `${overdueInvoices.length} فواتير متأخرة (إجمالي ${overdueTotal.toLocaleString()} د.ك)`,
            count: overdueInvoices.length,
            severity: 'warning',
        });
    }

    // 🟠 Warning: subscriptions ending soon
    const enrollments = await prisma.enrollment.findMany({ select: { studentId: true, teacher: true, subject: true, sessionsTotal: true } });
    const allSessions = await prisma.session.findMany({
        where: { status: 'completed' },
        select: { studentId: true, teacherName: true, subject: true },
    });
    const endingSoon = [];
    for (const e of enrollments) {
        const used = allSessions.filter(s => s.studentId === e.studentId && s.teacherName === e.teacher && s.subject === e.subject).length;
        const remaining = (Number(e.sessionsTotal) || 0) - used;
        if (remaining <= 2 && remaining > 0) endingSoon.push({ studentId: e.studentId, remaining });
    }
    if (endingSoon.length > 0) {
        warning.push({
            type: 'subscriptions_ending',
            message: `${endingSoon.length} اشتراكاً سينتهي قريباً (متبقي ${endingSoon[0].remaining} حصص)`,
            count: endingSoon.length,
            severity: 'warning',
        });
    }

    // 🟡 Reminder: upcoming sessions in 10 min
    const upcomingSessions = await prisma.session.findMany({
        where: {
            date: today,
            status: 'scheduled',
            time: { gte: currentTime, lte: in10MinTime },
        },
        select: { id: true, studentName: true, subject: true, time: true, teacherName: true },
        orderBy: { time: 'asc' },
    });
    if (upcomingSessions.length > 0) {
        for (const s of upcomingSessions) {
            reminder.push({
                type: 'session_soon',
                message: `حصّة ${s.subject} مع ${s.studentName} بعد ${timeDiff(s.time, currentTime)} دقائق`,
                sessionId: s.id,
                time: s.time,
                severity: 'reminder',
            });
        }
    }

    // 🟡 Reminder: last backup age
    const lastBackup = recentBackups[0];
    if (lastBackup) {
        const hoursAgo = Math.floor((now.getTime() - new Date(lastBackup.createdAt).getTime()) / 3600000);
        if (hoursAgo > 8) {
            reminder.push({
                type: 'old_backup',
                message: `آخر نسخة احتياطية: منذ ${hoursAgo} ساعات`,
                severity: 'reminder',
            });
        }
    }

    // 🔵 Info: new students today
    const newStudentsToday = await prisma.student.count({
        where: { createdAt: { gte: today } },
    });
    if (newStudentsToday > 0) {
        info.push({ type: 'new_students', message: `تم تسجيل ${newStudentsToday} طالب${newStudentsToday > 1 ? 'اً' : ''} جديد اليوم`, count: newStudentsToday, severity: 'info' });
    }

    return { critical, warning, reminder, info };
}

function timeDiff(t1, t2) {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    return (h1 * 60 + m1) - (h2 * 60 + m2);
}

module.exports = { getAlerts };
