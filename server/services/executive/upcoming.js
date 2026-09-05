const { localYmd } = require('../../utils/validators');
const { prisma } = require('../../utils/prisma');

async function getUpcoming() {
    const now = new Date();
    const today = localYmd(now);
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const sessions = await prisma.session.findMany({
        where: {
            date: today,
            status: 'scheduled',
            time: { gte: currentTime },
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
        take: 10,
    });

    return sessions.map(s => {
        const [h, m] = s.time.split(':').map(Number);
        const schedMs = h * 3600000 + m * 60000;
        const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;
        const diffMs = schedMs - nowMs;
        const minutesUntil = Math.round(diffMs / 60000);

        let urgency;
        if (minutesUntil <= 0) urgency = 'now';
        else if (minutesUntil <= 5) urgency = 'very_soon';
        else if (minutesUntil <= 15) urgency = 'soon';
        else if (minutesUntil <= 60) urgency = 'within_hour';
        else urgency = 'later';

        return {
            id: s.id,
            studentName: s.studentName,
            subject: s.subject,
            time: s.time,
            teacherName: s.teacherName,
            minutesUntil,
            urgency,
        };
    });
}

module.exports = { getUpcoming };
