const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../utils/db');

module.exports = (app) => {
    const CHECK_INTERVAL = 60 * 1000;

    setInterval(async () => {
        try {
            const db = await getDb();
            const settings = await db.get(`SELECT value FROM system_settings WHERE key = 'reminder_minutes_before'`);
            const minutesBefore = parseInt(settings?.value) || 30;
            const targetDate = new Date(Date.now() + minutesBefore * 60 * 1000);
            const targetToday = targetDate.toISOString().split('T')[0];
            const targetTime = `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`;
            const upcoming = await db.all(
                `SELECT s.*, st.parentPhone FROM sessions s LEFT JOIN students st ON st.id = s.studentId WHERE s.date = ? AND s.time = ? AND s.status = 'scheduled'`,
                [targetToday, targetTime]
            );
            for (const session of upcoming) {
                const notifId = uuidv4();
                const title = 'تذكير بالحصة القادمة';
                const message = `موعد حصة ${session.subject} مع ${session.teacherName} بعد ${minutesBefore} دقيقة`;
                if (session.parentPhone) {
                    const parents = await db.all('SELECT id FROM parents WHERE phone = ?', [session.parentPhone]);
                    for (const parent of parents) {
                        const existing = await db.get(
                            'SELECT id FROM notifications WHERE receiverId = ? AND title = ? AND message = ? AND date(time) = date(?)',
                            [parent.id, title, message, new Date().toISOString()]
                        );
                        if (!existing) {
                            await db.run(
                                `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [notifId, 'system', parent.id, 'النظام', title, message, 'warning', new Date().toISOString(), 0, '/parent-dashboard']
                            );
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
