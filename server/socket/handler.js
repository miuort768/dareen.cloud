const jwt = require('jsonwebtoken');
const { getDb } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

const socketRateLimiter = (maxPerWindow = 60, windowMs = 10000) => {
    const counts = new Map();
    return (socket, eventName, ...args) => {
        const key = `${socket.id}:${eventName}`;
        const now = Date.now();
        const entry = counts.get(key);
        if (!entry || now - entry.windowStart > windowMs) {
            counts.set(key, { count: 1, windowStart: now });
            return true;
        }
        entry.count++;
        if (entry.count > maxPerWindow) {
            console.warn(`[SOCKET-RATE] ${socket.id} exceeded ${eventName} (${entry.count}/${maxPerWindow})`);
            socket.emit('error_message', { message: 'طلبات كثيرة جداً. حاول ببطء.' });
            return false;
        }
        return true;
    };
};

const wrapEvent = (handler, limiter) => {
    return function (...args) {
        if (!limiter(this, handler.name || 'unknown', ...args)) return;
        handler.call(this, ...args);
    };
};

module.exports = (io, app) => {
    const activeSessions = new Map();
    app.set('activeSessions', activeSessions);
    const rateLimit = socketRateLimiter(30, 10000);

    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.data.user;
        const userId = user?.id;
        console.log(`🔌 Socket Connected: ${socket.id} (User: ${user?.name || 'Anonymous'}, ID: ${userId})`);

        if (userId) {
            const userRoom = `user_${userId}`;
            socket.join(userRoom);
            if (user?.role === 'admin' || user?.permissions?.includes('*')) {
                socket.join('admin_room');
            }
            console.log(`   ✅ Joined Personal Room: ${userRoom}`);
            if (user?.role === 'student' || user?.role === 'user') {
                const activeSession = activeSessions.get(String(userId));
                if (activeSession) {
                    console.log(`   💎 [IO] Re-sending persistent session invite to student ${userId}`);
                    socket.emit('session_invite', activeSession);
                }
            }
        }

        socket.on('join_conversation', async (conversationId) => {
            if (!conversationId || !userId) return;
            if (!rateLimit(socket, 'join_conversation')) return;
            if (conversationId.startsWith('live_session_')) {
                socket.join(conversationId);
                return;
            }
            try {
                const db = await getDb();
                const member = await db.get(
                    'SELECT 1 FROM chat_members WHERE conversationId = ? AND userId = ?',
                    [conversationId, userId]
                );
                if (member || user?.role === 'admin') {
                    socket.join(conversationId);
                }
            } catch (err) {
                console.error(`   ❌ Error verifying conversation membership:`, err);
            }
        });

        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on('join_personal_room', (id) => {
            if (id === userId) {
                socket.join(`user_${id}`);
            }
        });

        const typingThrottle = new Map();
        socket.on('typing', (data) => {
            if (!data?.conversationId || !userId) return;
            if (!rateLimit(socket, 'typing')) return;
            const key = `${userId}:${data.conversationId}`;
            const now = Date.now();
            const last = typingThrottle.get(key);
            if (last && now - last < 2000) return;
            typingThrottle.set(key, now);
            socket.to(data.conversationId).emit('typing', data);
        });

        const drawingThrottle = new Map();
        socket.on('drawing', (data) => {
            if (!data?.conversationId || !userId) return;
            if (!rateLimit(socket, 'drawing')) return;
            const key = `${userId}:${data.conversationId}`;
            const now = Date.now();
            const last = drawingThrottle.get(key);
            if (last && now - last < 200) return;
            drawingThrottle.set(key, now);
            socket.to(data.conversationId).emit('drawing', data);
        });

        socket.on('whiteboard_state', (data) => {
            if (!data?.conversationId || !userId) return;
            if (!rateLimit(socket, 'whiteboard_state')) return;
            socket.to(data.conversationId).emit('whiteboard_state', data);
        });

        socket.on('clear_whiteboard', (data) => {
            if (!data?.conversationId || !userId) return;
            if (!rateLimit(socket, 'clear_whiteboard')) return;
            socket.to(data.conversationId).emit('clear_whiteboard', data);
        });

        const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin' || user?.permissions?.includes('*');

        socket.on('teacher_ready', (data) => {
            if (!isTeacherOrAdmin) return;
            socket.to(data.conversationId).emit('teacher_ready', data);
            io.in(data.conversationId).emit('meeting_started', {
                conversationId: data.conversationId,
                teacherId: data.teacherId,
                teacherName: data.teacherName,
                type: data.type
            });
        });

        socket.on('teacher_stopped', async (data) => {
            if (!isTeacherOrAdmin) return;
            try {
                const sessionId = data.conversationId?.replace(/^live_session_/, '');
                if (sessionId) {
                    const db = await getDb();
                    await db.run(
                        'UPDATE live_sessions SET status = "ended" WHERE id = ? AND teacherId = ?',
                        [sessionId, userId]
                    );
                }
                socket.to(data.conversationId).emit('teacher_stopped', data);
                io.in(data.conversationId).emit('meeting_ended', { conversationId: data.conversationId });
            } catch (err) {
                console.error('[Live] Failed to end session in DB:', err);
            }
        });

        socket.on('student_joined', (data) => {
            socket.to(data.conversationId).emit('student_joined', data);
        });

            socket.on('student_request', (data) => {
                if (!rateLimit(socket, 'student_request')) return;
                socket.to(data.conversationId).emit('student_request', data);
            });

            socket.on('teacher_signal', (data) => {
                if (!rateLimit(socket, 'teacher_signal')) return;
                socket.to(`user_${data.studentId}`).emit('teacher_signal', data);
            });

        socket.on('call_student', async (data) => {
            if (!isTeacherOrAdmin) return;
            const studentIdStr = String(data.studentId);
            const targetRoom = `user_${studentIdStr}`;
            try {
                const db = await getDb();
                const student = await db.get('SELECT id, parentPhone FROM students WHERE id = ?', [studentIdStr]);
                if (!student) {
                    socket.emit('error_message', { message: 'الطالب غير موجود في النظام' });
                    return;
                }
                const sessionData = {
                    teacherId: user.id,
                    teacherName: user.name,
                    teacherSocketId: socket.id,
                    subject: data.subject,
                    type: data.type || 'video',
                    sessionId: data.sessionId,
                    timestamp: new Date().toISOString()
                };
                activeSessions.set(studentIdStr, sessionData);
                const timeoutId = setTimeout(() => {
                    if (activeSessions.get(studentIdStr)?.teacherSocketId === socket.id) {
                        activeSessions.delete(studentIdStr);
                    }
                }, 300000);
                sessionData._timeoutId = timeoutId;
                io.to(targetRoom).emit('session_invite', sessionData);

                try {
                    const studentNotifId = uuidv4();
                    const msg = `بدأت المعلمة ${user.name} حصة ${data.subject} الآن. يمكنك الانضمام مباشرة!`;
                    await db.run(
                        `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [studentNotifId, user.id, studentIdStr, user.name, 'حصة مباشرة بدأت!', msg, 'live', new Date().toISOString(), 0, '/student-dashboard']
                    );
                    io.to(targetRoom).emit('notification', { id: studentNotifId, title: 'حصة مباشرة بدأت!', message: msg, type: 'live', time: new Date().toISOString() });

                    if (student.parentPhone) {
                        const parent = await db.get('SELECT id FROM users WHERE phone = ? AND role = ?', [student.parentPhone, 'parent']);
                        if (parent) {
                            const parentNotifId = uuidv4();
                            const parentMsg = `بدأت الحصة المباشرة لابنكم/ابنتكم في مادة ${data.subject} مع المعلمة ${user.name}.`;
                            await db.run(
                                `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [parentNotifId, user.id, parent.id, user.name, 'تنبيه حصة مباشرة لابنكم', parentMsg, 'live', new Date().toISOString(), 0, '/parent-dashboard']
                            );
                            io.to(`user_${parent.id}`).emit('notification', { id: parentNotifId, title: 'تنبيه حصة مباشرة لابنكم', message: parentMsg, type: 'live', time: new Date().toISOString() });
                        }
                    }
                } catch (err) {
                    console.error('Error creating live session notifications:', err);
                }
            } catch (err) {
                console.error('Error in call_student:', err);
            }
        });

        socket.on('end_session', (data) => {
            if (!isTeacherOrAdmin) return;
            const studentIdStr = String(data.studentId);
            const session = activeSessions.get(studentIdStr);
            if (session && session.teacherSocketId !== socket.id && !user?.permissions?.includes('*')) return;
            activeSessions.delete(studentIdStr);
            io.to(`user_${studentIdStr}`).emit('session_ended', { teacherId: user.id });
        });

        socket.on('disconnect', async () => {
            console.log(`🔌 Socket Disconnected: ${socket.id}`);
            activeSessions.forEach((session, studentId) => {
                if (session.teacherSocketId === socket.id) {
                    if (session._timeoutId) clearTimeout(session._timeoutId);
                    activeSessions.delete(studentId);
                    io.to(`user_${studentId}`).emit('session_ended', { teacherId: user.id });
                }
            });
            try {
                const db = await getDb();
                await db.run(
                    'UPDATE live_sessions SET status = "ended" WHERE teacherId = ? AND status = "active"',
                    [userId]
                );
            } catch (err) {
                console.error('[Live] Failed to end sessions on disconnect:', err);
            }
        });
    });

    return activeSessions;
};
