const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../utils/prisma');
const { localYmd } = require('../utils/validators');

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const normalizeDigits = (t) =>
    String(t || '').replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));

const parseTimeToMinutes = (t) => {
    const raw = normalizeDigits(t).trim();
    const match = raw.match(/(\d{1,2})\s*[:.]?\s*(\d{0,2})/);
    if (!match) return null;
    let h = parseInt(match[1], 10) || 0;
    const m = match[2] ? parseInt(match[2], 10) || 0 : 0;
    const lower = raw.toLowerCase();
    const isAM = lower.includes('am') || lower.includes('صباح') || lower.includes('ص');
    const isPM = lower.includes('pm') || lower.includes('مساء') || lower.includes('م');
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    h %= 24;
    return h * 60 + (m % 60);
};

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
            const targetToday = localYmd(targetDate);
            const targetTime = `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`;
            const targetParts = targetTime.split(':').map(Number);
            const targetMinutes = (targetParts[0] || 0) * 60 + (targetParts[1] || 0);
            const upcoming = (await prisma.session.findMany({
                where: { date: targetToday, status: 'scheduled' },
                include: { student: { select: { parentPhone: true } } }
            })).filter((s) => parseTimeToMinutes(s.time) === targetMinutes);
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
                                time: { gte: new Date(localYmd()) }
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
