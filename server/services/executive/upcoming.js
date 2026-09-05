const { localYmd, timeToMinutes } = require('../../utils/validators');
const { prisma } = require('../../utils/prisma');

async function getUpcoming() {
    const now = new Date();
    const today = localYmd(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const sessions = await prisma.session.findMany({
        where: {
            date: today,
            status: 'scheduled',
        },
        select: {
            id: true,
            studentName: true,
            subject: true,
            time: true,
            teacherName: true,
            studentId: true,
        },
        orderBy: { time: 'asc' },
        take: 20,
    });

    const upcoming = [];
    for (const s of sessions) {
        const sMin = timeToMinutes(s.time);
        if (Number.isNaN(sMin)) continue;
        const minutesUntil = sMin - nowMin;
        if (minutesUntil < -15) continue;

        let urgency;
        if (minutesUntil <= 0) urgency = 'now';
        else if (minutesUntil <= 5) urgency = 'very_soon';
        else if (minutesUntil <= 15) urgency = 'soon';
        else if (minutesUntil <= 60) urgency = 'within_hour';
        else urgency = 'later';

        upcoming.push({
            id: s.id,
            studentName: s.studentName,
            subject: s.subject,
            time: s.time,
            teacherName: s.teacherName,
            minutesUntil,
            urgency,
        });
    }

    return upcoming.slice(0, 10);
}

module.exports = { getUpcoming };
