const { prisma } = require('../../utils/prisma');
const logger = require('../../utils/logger');
const { getStats } = require('./stats');

async function getPulse() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let stats;
    try {
        stats = await getStats();
    } catch (err) {
        logger.warn('[executive] pulse: getStats failed, using degraded stats', err);
        stats = {};
    }

    let profitScore = 50;
    try {
        const weekSessions = await prisma.session.findMany({
            where: { date: { gte: new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0] }, status: 'completed' },
            select: { price: true },
        });
        const dailyAvg = weekSessions.reduce((s, x) => s + (Number(x.price) || 0), 0) / 7;
        profitScore = dailyAvg > 0 ? Math.min(100, Math.round((stats.todayRevenue || 0) / dailyAvg * 50)) : 50;
    } catch (err) {
        logger.warn('[executive] pulse: week sessions query failed, profitScore=50', err);
        profitScore = 50;
    }

    const attendanceScore = stats.attendanceRate || 100;
    const overdueScore = stats.overdueInvoicesCount > 0
        ? Math.max(0, 100 - stats.overdueInvoicesCount * 5)
        : 100;
    const ratingScore = stats.avgRating ? Math.round((stats.avgRating / 5) * 100) : 75;
    const systemScore = 100;
    const occupancyScore = stats.occupancyRate || 50;

    const score = Math.round(
        profitScore * 0.25 +
        attendanceScore * 0.20 +
        systemScore * 0.20 +
        overdueScore * 0.15 +
        ratingScore * 0.10 +
        occupancyScore * 0.10
    );

    let status, message;
    if (score >= 90) {
        status = 'excellent';
        message = 'المعهد يعمل بكفاءة عالية اليوم — جميع المؤشرات إيجابية';
    } else if (score >= 70) {
        status = 'good';
        message = 'المعهد بحالة جيدة — توجد بعض المؤشرات التي تستدعي المتابعة';
    } else if (score >= 50) {
        status = 'fair';
        message = 'يحتاج تدخل — يوجد انخفاض في الأداء المالي أو الحضور';
    } else {
        status = 'critical';
        message = 'يتطلب تدخلاً عاجلاً — مشكلات حرجة في النظام أو الأداء';
    }

    return { score, status, message };
}

module.exports = { getPulse };
