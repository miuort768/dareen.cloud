const jwt = require('jsonwebtoken');
const { updatePresence, removePresence } = require('../services/executive/presence');

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

module.exports = (io) => {
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

            updatePresence(userId, { name: user.name, role: user.role });
            io.to('admin_room').emit('presence_update', { userId, name: user.name, role: user.role, status: 'online' });
        }

        socket.on('join_conversation', (conversationId) => {
            if (!conversationId || !userId) return;
            if (!rateLimit(socket, 'join_conversation')) return;
            socket.join(conversationId);
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

        socket.on('presence_ping', () => {
            if (!userId) return;
            updatePresence(userId, { name: user.name, role: user.role });
            socket.to('admin_room').emit('presence_update', { userId, name: user.name, role: user.role, status: 'online' });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket Disconnected: ${socket.id}`);
            if (userId) {
                removePresence(userId);
                io.to('admin_room').emit('presence_update', { userId, name: user.name, role: user.role, status: 'offline' });
            }
        });
    });
};
