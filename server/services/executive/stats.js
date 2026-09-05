const { localYmd, timeToMinutes } = require('../../utils/validators');
const { prisma } = require('../../utils/prisma');

async function getStats() {
    const now = new Date();
    const today = localYmd(now);
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const [
        sessionsToday,
        activeSessions,
        transactionsToday,
        fixedExpenses,
        students,
        teachers,
        enrollments,
        evaluations,
        studentInvoices,
        teacherInvoices,
        allSessions,
    ] = await Promise.all([
        prisma.session.findMany({ where: { date: today } }),
        prisma.activeSession.count(),
        prisma.manualTransaction.findMany({ where: { date: { gte: today } } }),
        prisma.fixedExpense.findMany({ where: { isActive: 1 } }),
        prisma.student.findMany({ where: { deletedAt: null }, select: { id: true, createdAt: true, sessionPrice: true } }),
        prisma.teacher.findMany({ select: { id: true, name: true, price: true } }),
        prisma.enrollment.findMany({ where: { deletedAt: null }, select: { id: true, teacherFallback: true, subject: true, sessionsTotal: true, sessionsUsed: true, studentId: true } }),
        prisma.evaluation.findMany({ select: { rating: true, studentId: true } }),
        prisma.studentInvoice.findMany({ where: { status: { in: ['overdue', 'pending'] } } }),
        prisma.teacherInvoice.findMany(),
        prisma.session.findMany({ where: { status: 'completed' }, select: { id: true, studentId: true, studentName: true, teacherName: true, subject: true, price: true, date: true } }),
    ]);

    const completedToday = sessionsToday.filter(s => ['completed', 'مكتملة'].includes(s.status?.toLowerCase()));
    const cancelledToday = sessionsToday.filter(s => ['cancelled', 'ملغاة'].includes(s.status?.toLowerCase()));
    const scheduledToday = sessionsToday.filter(s => ['scheduled', 'مجدولة'].includes(s.status?.toLowerCase()));

    const currencyService = require('../currencyService');
    const reportCurrency = await currencyService.getReportCurrency();

    const todayRevenueRaw = await Promise.all(completedToday.map(async s => {
        let price = Number(s.price) || 0;
        let currency = s.studentCurrency || 'EGP';
        if (price === 0) {
            const stu = students.find(x => x.id === s.studentId || x.name?.trim().toLowerCase() === s.studentName?.trim().toLowerCase());
            price = Number(stu?.sessionPrice) || 0;
            currency = stu?.currency || 'EGP';
        }
        return currencyService.convert(price, currency, reportCurrency);
    }));
    
    const todayTransIncome = await Promise.all(transactionsToday.filter(t => t.type === 'income').map(t => 
        currencyService.convert(Number(t.amount) || 0, t.currency || 'EGP', reportCurrency)
    ));

    const todayRevenue = todayRevenueRaw.reduce((a, b) => a + b, 0) + todayTransIncome.reduce((a, b) => a + b, 0);

    const cashToday = todayTransIncome.reduce((a, b) => a + b, 0);

    const todayFixedExp = await Promise.all(fixedExpenses.map(f => 
        currencyService.convert(Number(f.amount) || 0, f.currency || 'EGP', reportCurrency)
    ));
    const todayTransExp = await Promise.all(transactionsToday.filter(t => t.type === 'expense').map(t => 
        currencyService.convert(Number(t.amount) || 0, t.currency || 'EGP', reportCurrency)
    ));

    const todayExpenses = (todayFixedExp.reduce((a, b) => a + b, 0) / 30) + todayTransExp.reduce((a, b) => a + b, 0);

    const todayProfit = todayRevenue - todayExpenses;

    const teacherHours = teachers.length * 8;
    const workloadToday = scheduledToday.length + completedToday.length;
    const occupancyRate = teacherHours > 0 ? Math.min(100, Math.round((workloadToday / teacherHours) * 100)) : 0;

    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e =>
        (Number(e.sessionsTotal) || 0) - (Number(e.sessionsUsed) || 0) > 0
    ).length;
    const renewalRate = totalEnrollments > 0 ? Math.round((activeEnrollments / totalEnrollments) * 100) : 100;

    const subjectRevenue = {};
    for (const s of allSessions) {
        let price = Number(s.price) || 0;
        let currency = s.studentCurrency || 'EGP';
        if (price === 0) {
            const stu = students.find(x => x.id === s.studentId || x.name?.trim().toLowerCase() === s.studentName?.trim().toLowerCase());
            price = Number(stu?.sessionPrice) || 0;
            currency = stu?.currency || 'EGP';
        }
        const convertedPrice = await currencyService.convert(price, currency, reportCurrency);
        const subj = s.subject || 'غير محدد';
        subjectRevenue[subj] = (subjectRevenue[subj] || 0) + convertedPrice;
    }
    const mostProfitableSubject = Object.entries(subjectRevenue)
        .sort((a, b) => b[1] - a[1])[0] || ['—', 0];

    const teacherSessionCount = {};
    for (const s of allSessions) {
        const name = s.teacherName || 'غير معروف';
        teacherSessionCount[name] = (teacherSessionCount[name] || 0) + 1;
    }
    const mostActiveTeacher = Object.entries(teacherSessionCount)
        .sort((a, b) => b[1] - a[1])[0] || ['—', 0];

    const todayAbsences = cancelledToday.length + sessionsToday.filter(s =>
        ['absent', 'غياب', 'no-show'].includes(s.status?.toLowerCase())
    ).length;

    const newStudentsThisWeek = students.filter(s =>
        s.createdAt && s.createdAt >= weekAgo
    ).length;

    const overdueInvoicesCount = studentInvoices.length;

    const lowSessionStudents = [];
    for (const e of enrollments) {
        const remaining = (Number(e.sessionsTotal) || 0) - (Number(e.sessionsUsed) || 0);
        if (remaining >= 0 && remaining <= 3) {
            lowSessionStudents.push({ studentId: e.studentId, remaining });
        }
    }

    const avgRating = evaluations.length > 0
        ? Math.round((evaluations.reduce((sum, e) => {
            const ratingMap = { 'ممتاز': 5, 'جيد جداً': 4, 'جيد': 3, 'مقبول': 2, 'ضعيف': 1 };
            return sum + (ratingMap[e.rating] || 3);
        }, 0) / evaluations.length) * 10) / 10
        : 0;

    const totalScheduled = scheduledToday.length + completedToday.length;
    const attendanceRate = totalScheduled > 0 ? Math.round((completedToday.length / totalScheduled) * 100) : 100;

    const lateStarts = sessionsToday.filter(s => {
        if (s.status?.toLowerCase() !== 'scheduled') return false;
        const sMin = timeToMinutes(s.time);
        if (Number.isNaN(sMin)) return false;
        return (now.getHours() * 60 + now.getMinutes() - sMin) > 15;
    }).length;

    // Attendance analytics across all completed sessions
    const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const subjectCount = {};
    const dayCount = {};
    const hourCount = {};
    for (const s of allSessions) {
        if (s.subject) subjectCount[s.subject] = (subjectCount[s.subject] || 0) + 1;
        const d = new Date(`${s.date}T00:00:00`);
        if (!isNaN(d.getTime())) {
            const day = DAY_NAMES[d.getDay()];
            dayCount[day] = (dayCount[day] || 0) + 1;
        }
        const h = parseInt(String(s.time || '').split(':')[0], 10);
        if (!isNaN(h)) hourCount[h] = (hourCount[h] || 0) + 1;
    }
    const topOf = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0] || null;
    const topSubject = topOf(subjectCount);
    const topDay = topOf(dayCount);
    const topHour = topOf(hourCount);

    return {
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        cashToday: Math.round(cashToday * 100) / 100,
        todayProfit: Math.round(todayProfit * 100) / 100,
        activeSessions,
        occupancyRate,
        renewalRate,
        todayAbsences,
        attendanceRate,
        avgRating,
        lateStarts,
        newStudentsThisWeek,
        overdueInvoicesCount,
        lowSessionStudentsCount: lowSessionStudents.length,
        mostProfitableSubject: { name: mostProfitableSubject[0], revenue: Math.round(mostProfitableSubject[1] * 100) / 100 },
        mostActiveTeacher: { name: mostActiveTeacher[0], sessions: mostActiveTeacher[1] },
        mostAttendedSubject: topSubject ? { name: topSubject[0], sessions: topSubject[1] } : null,
        busiestDay: topDay ? { name: topDay[0], sessions: topDay[1] } : null,
        busiestHour: topHour
            ? {
                hour: topHour[0],
                sessions: topHour[1],
                share: allSessions.length > 0 ? Math.round((topHour[1] / allSessions.length) * 100) : 0,
            }
            : null,
        teachersCount: teachers.length,
        studentsCount: students.length,
    };
}

module.exports = { getStats };
