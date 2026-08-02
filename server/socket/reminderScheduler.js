const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../utils/prisma');

let timer = null;

module.exports = (app) => {
    const CHECK_INTERVAL = 60 * 1000;

    timer = setInterval(async () => {
        try {
            const settings = await prisma.systemSetting.findUnique({
                where: { key: 'reminder_minutes_before' }
            });
            const minutesBefore = parseInt(settings?.value) || 30;
            const targetDate = new Date(Date.now() + minutesBefore * 60 * 1000);
            const targetToday = targetDate.toISOString().split('T')[0];
            const targetTime = `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`;
            const upcoming = await prisma.session.findMany({
                where: { date: targetToday, time: targetTime, status: 'scheduled' },
                include: { student: { select: { parentPhone: true } } }
            });
            for (const session of upcoming) {
                const notifId = uuidv4();
                const title = 'تذكير بالحصة القادمة';
                const message = `موعد حصة ${session.subject} مع ${session.teacherName} بعد ${minutesBefore} دقيقة`;
                if (session.student?.parentPhone) {
                    const parents = await prisma.parent.findMany({
                        where: { phone: session.student.parentPhone },
                        select: { id: true }
                    });
                    for (const parent of parents) {
                        const existing = await prisma.notification.findFirst({
                            where: {
                                receiverId: parent.id,
                                title,
                                message,
                                time: { gte: new Date(new Date().toISOString().split('T')[0]) }
                            }
                        });
                        if (!existing) {
                            await prisma.notification.create({
                                data: {
                                    id: notifId,
                                    senderId: 'system',
                                    receiverId: parent.id,
                                    senderName: 'النظام',
                                    title,
                                    message,
                                    type: 'warning',
                                    time: new Date().toISOString(),
                                    read: 0,
                                    link: '/parent-dashboard'
                                }
                            });
                            const io = app.get('socketio');
                            if (io) {
                                io.to(`user_${parent.id}`).emit('notification', { id: notifId, title, message, type: 'warning', time: new Date().toISOString() });
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[ReminderScheduler] Error:', err.message);
        }
    }, CHECK_INTERVAL);
    console.log(`⏰ Reminder scheduler started (checking every ${CHECK_INTERVAL / 1000}s)`);
};

module.exports.stop = () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
};
