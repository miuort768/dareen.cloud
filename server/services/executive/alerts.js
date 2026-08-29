const { prisma } = require('../../utils/prisma');
const logger = require('../../utils/logger');

// Each alert source is isolated: one failing query must never kill the whole
// alerts service (which previously caused the frontend "degraded" banner).
async function getAlerts() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const in10Min = new Date(now.getTime() + 10 * 60000);
    const in10MinTime = `${String(in10Min.getHours()).padStart(2, '0')}:${String(in10Min.getMinutes()).padStart(2, '0')}`;

    const critical = [];
    const warning = [];
    const reminder = [];
    const info = [];

    const safe = async (source, fn) => {
        try {
            return await fn();
        } catch (err) {
            logger.warn(`[executive] alerts source "${source}" failed — skipped`, err);
            return null;
        }
    };

    // 🔴 Critical: DB health (probe — failure here is intentional signal, not an error)
    const dbOk = await prisma
        .$queryRaw`SELECT 1`
        .then(() => true)
        .catch(() => false);
    if (!dbOk) {
        critical.push({ type: 'db_down', message: 'قاعدة البيانات غير متصلة', severity: 'critical' });
    }

    // 🟠 Warning: Redis (system degrades gracefully to in-memory cache/rate-limit)
    await safe('redis', async () => {
        const redis = require('../../utils/redis');
        if (!redis.isConnected()) {
            warning.push({
                type: 'redis_down',
                message: 'Redis غير متصل — الكاش وتحديد المعدل يعملان بذاكرة مؤقتة',
                severity: 'warning',
            });
        }
    });

    // 🔴 Critical: backup failures + 🟡 last backup age
    const backupsResult = await safe('backups', () =>
        prisma.backup.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
    );
    if (backupsResult) {
        const recentBackups = backupsResult;
        const failedBackups = recentBackups.filter(b => b.status !== 'completed');
        if (failedBackups.length >= 3) {
            critical.push({ type: 'backup_failed', message: 'آخر 3 نسخ احتياطية فشلت', severity: 'critical' });
        }
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
    }

    // 🟠 Warning: overdue invoices
    const overdueResult = await safe('overdue_invoices', () =>
        prisma.studentInvoice.findMany({
            where: { status: { in: ['overdue', 'متأخرة'] } },
            select: { amount: true, currency: true },
        }),
    );
    if (overdueResult) {
        const overdueTotal = overdueResult.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        if (overdueResult.length > 0) {
            warning.push({
                type: 'overdue_invoices',
                message: `${overdueResult.length} فواتير متأخرة (إجمالي ${overdueTotal.toLocaleString()} د.ك)`,
                count: overdueResult.length,
                severity: 'warning',
            });
        }
    }

    // 🟠 Warning: subscriptions ending soon
    await safe('subscriptions_ending', async () => {
        const enrollments = await prisma.enrollment.findMany({
            select: { studentId: true, teacher: true, subject: true, sessionsTotal: true },
        });
        const allSessions = await prisma.session.findMany({
            where: { status: 'completed' },
            select: { studentId: true, teacherName: true, subject: true },
        });
        const endingSoon = [];
        for (const e of enrollments) {
            const used = allSessions.filter(
                s => s.studentId === e.studentId && s.teacherName === e.teacher && s.subject === e.subject,
            ).length;
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
    });

    // 🟡 Reminder: upcoming sessions in 10 min
    await safe('sessions_soon', async () => {
        const upcomingSessions = await prisma.session.findMany({
            where: {
                date: today,
                status: 'scheduled',
                time: { gte: currentTime, lte: in10MinTime },
            },
            select: { id: true, studentName: true, subject: true, time: true, teacherName: true },
            orderBy: { time: 'asc' },
        });
        for (const s of upcomingSessions) {
            reminder.push({
                type: 'session_soon',
                message: `حصّة ${s.subject} مع ${s.studentName} بعد ${timeDiff(s.time, currentTime)} دقائق`,
                sessionId: s.id,
                time: s.time,
                severity: 'reminder',
            });
        }
    });

    // 🔵 Info: new students today
    await safe('new_students', async () => {
        const newStudentsToday = await prisma.student.count({
            where: { createdAt: { gte: new Date(today) } },
        });
        if (newStudentsToday > 0) {
            info.push({
                type: 'new_students',
                message: `تم تسجيل ${newStudentsToday} طالب${newStudentsToday > 1 ? 'اً' : ''} جديد اليوم`,
                count: newStudentsToday,
                severity: 'info',
            });
        }
    });

    return { critical, warning, reminder, info };
}

function timeDiff(t1, t2) {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    return (h1 * 60 + m1) - (h2 * 60 + m2);
}

module.exports = { getAlerts };
