const jwt = require('jsonwebtoken');
const authAccounts = require('../services/authAccounts');
const { updatePresence, removePresence } = require('../services/executive/presence');

const socketRateLimiter = (maxPerWindow = 60, windowMs = 10000) => {
    const counts = new Map();
    // Sweep stale entries periodically — sockets churn constantly and stale
    // keys would otherwise grow the Map without bound (memory-exhaustion DoS).
    const sweep = () => {
        const now = Date.now();
        for (const [key, entry] of counts) {
            if (now - entry.windowStart > windowMs * 2) counts.delete(key);
        }
    };
    const sweepInterval = setInterval(sweep, windowMs * 3);
    if (sweepInterval.unref) sweepInterval.unref();
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

// Cap concurrent sockets per account — one compromised/bot account must not
// be able to open thousands of live connections and amplify broadcasts.
const MAX_SOCKETS_PER_USER = 5;

module.exports = (io) => {
    const rateLimit = socketRateLimiter(30, 10000);
    const socketsByUser = new Map(); // userId -> Set<socketId>

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.token_version !== undefined) {
                const versionOk = await authAccounts.checkTokenVersion(decoded.id, decoded.role, decoded.token_version);
                if (!versionOk) {
                    console.warn(`[SOCKET] Token revoked for user ${decoded.id} (${decoded.name})`);
                    return next(new Error('Authentication error'));
                }
            }
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

        // Per-user concurrent-connection cap
        if (userId) {
            let ids = socketsByUser.get(userId);
            if (!ids) {
                ids = new Set();
                socketsByUser.set(userId, ids);
            }
            if (ids.size >= MAX_SOCKETS_PER_USER) {
                console.warn(`[SOCKET-CAP] User ${userId} exceeded ${MAX_SOCKETS_PER_USER} concurrent sockets — rejecting`);
                socket.emit('error_message', { message: 'عدد كبير من الاتصالات النشطة. سيتم إغلاق هذا الاتصال.' });
                socket.disconnect(true);
                return;
            }
            ids.add(socket.id);
        }

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
                const ids = socketsByUser.get(userId);
                if (ids) {
                    ids.delete(socket.id);
                    if (ids.size === 0) socketsByUser.delete(userId);
                }
                removePresence(userId);
                io.to('admin_room').emit('presence_update', { userId, name: user.name, role: user.role, status: 'offline' });
            }
        });
    });
};
