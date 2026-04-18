const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const compression = require('compression');

const dbMiddleware = require('./middleware/db');
const { sanitizeInput, activityAuditor } = require('./middleware/advanced');
const helmet = require('helmet');

const { authRouter } = require('./routes/auth');
const { studentRouter } = require('./routes/students');
const { teacherRouter } = require('./routes/teachers');
const { parentRouter } = require('./routes/parents');
const { evaluationsRouter } = require('./routes/evaluations');
const { studentPortalRouter } = require('./routes/studentPortal');
const { sessionRouter } = require('./routes/sessions');
const { invoiceRouter } = require('./routes/invoices');
const { notificationRouter } = require('./routes/notifications');
const { systemRouter } = require('./routes/system');
const financeRouter = require('./routes/finance');
const tasksRouter = require('./routes/tasks');
const chatRouter = require('./routes/chat');
const publicChatRouter = require('./routes/publicChat');
const { announcementsRouter } = require('./routes/announcements');
const forumRouter = require('./routes/forum');
const appointmentsRouter = require('./routes/appointments');
const { pushRouter, sendPushToUser } = require('./routes/push');



const { getDb } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Global Compression (Lightning Fast Responses)
app.use(compression());
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3001',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176'
        ].filter(Boolean); // Remove undefined/null

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.FRONTEND_URL === '*') {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // Log blocked origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Production-Grade Security Headers with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:", "http:"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "connect-src": ["'self'", "https:", "http:", "ws:", "wss:"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Performance Monitoring Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 500) {
            console.warn(`[PERF WARNING] Slow request: ${req.method} ${req.path} took ${duration}ms`);
        }
    });
    next();
});

app.use(express.json({ limit: '50mb' }));

async function startServer() {
    try {
        const db = await getDb();
        console.log('Database initialized successfully');

        // Run DB Setup/Migration on start
        const { setupDatabase } = require('./db_setup');
        await setupDatabase();

        app.use(dbMiddleware);

        app.set('trust proxy', 1);

        // Security: Rate Limiting - Optimized for High Traffic
        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: process.env.NODE_ENV === 'development' ? 100000 : 50000, // High limits for scalability
            message: { error: 'Too many requests, please try again later.' },
            standardHeaders: true, // Return rate limit info in headers
            legacyHeaders: false, // Disable X-RateLimit-* headers
            skip: (req) => req.path === '/health' // Skip health checks
        });
        app.use('/api/', limiter);

        const logger = require('./utils/logger');

        // Setup API Routes
        const apiRouter = express.Router();

        const { authMiddleware, checkRole } = require('./middleware/auth');

        apiRouter.use('/auth', authRouter);

        // Public system settings (Accessable before login for Maintenance Mode & Branding)
        apiRouter.get('/system/public-settings', async (req, res) => {
            try {
                const settings = await req.db.all('SELECT * FROM system_settings WHERE key IN (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        'maintenance_mode', 'academy_name', 'admin_phone', 'theme_color', 
                        'notifications_enabled', 'auto_backup',
                        'chatbot_enabled', 'chatbot_welcome_msg', 'chatbot_name'
                    ]);
                const settingsMap = {};
                settings.forEach(s => settingsMap[s.key] = s.value);
                res.json(settingsMap);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Public Chat (Guest accessible)
        apiRouter.use('/public-chat', publicChatRouter);

        // Apply authentication to ALL other API routes
        apiRouter.use(authMiddleware);

        // Deep Sanitization & Auditing for Authenticated Requests
        apiRouter.use(sanitizeInput);
        apiRouter.use(activityAuditor);

        apiRouter.use('/students', studentRouter);
        apiRouter.use('/teachers', teacherRouter);
        apiRouter.use('/parents', parentRouter);
        apiRouter.use('/evaluations', evaluationsRouter);
        apiRouter.use('/student-portal', studentPortalRouter);
        apiRouter.use('/sessions', sessionRouter);
        apiRouter.use('/notifications', (req, res, next) => {
            // Inject sendPushToUser into notification router context if needed
            req.sendPushToUser = sendPushToUser;
            notificationRouter(req, res, next);
        });
        apiRouter.use('/system', checkRole(['admin']), systemRouter);
        apiRouter.use('/finance', checkRole(['admin']), financeRouter);
        apiRouter.use('/tasks', tasksRouter);
        apiRouter.use('/chat', chatRouter);
        apiRouter.use('/announcements', announcementsRouter);
        apiRouter.use('/forum', forumRouter);
        apiRouter.use('/appointments', appointmentsRouter);
        apiRouter.use('/push', pushRouter);


        // Compatibility middleware for invoices inside API
        apiRouter.use('/studentInvoices', checkRole(['admin']), (req, res, next) => {
            if (req.url === '' || req.url === '/') {
                req.url = '/student';
            } else {
                req.url = '/student' + req.url;
            }
            invoiceRouter(req, res, next);
        });

        apiRouter.use('/invoices', checkRole(['admin']), (req, res, next) => {
            if (req.url === '' || req.url === '/') {
                req.url = '/teacher';
            } else if (req.url.startsWith('/teacher') || req.url.startsWith('/student')) {
                // If the user already put /teacher or /student (e.g. /invoices/student), leave it
            } else {
                // otherwise default to teacher
                req.url = '/teacher' + req.url;
            }
            invoiceRouter(req, res, next);
        });

        // Compatibility for /users inside API (Admin only)
        apiRouter.use('/users', checkRole(['admin']), (req, res, next) => {
            req.url = '/users' + req.url;
            systemRouter(req, res, next);
        });

        // Serve static files from the React app with long-term caching
        app.use(express.static(path.join(__dirname, '../dist'), {
            maxAge: '1y', // Cache for 1 year (for hashed files like those from Vite)
            immutable: true,
            index: false,
            setHeaders: (res, path) => {
                if (path.endsWith('.html')) {
                    // Don't cache HTML files as they contain references to new assets
                    res.setHeader('Cache-Control', 'no-cache');
                } else if (path.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|webp|avif)$/)) {
                    // Aggressive caching for assets
                    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                }
            }
        }));

        app.use('/api', apiRouter);

        // Global Error Handler
        app.use((err, req, res, next) => {
            const isDev = process.env.NODE_ENV === 'development';
            logger.error('Unhandled Server Error', err, { 
                path: req.path,
                user: req.user?.username || 'Guest'
            });
            
            res.status(500).json({ 
                error: 'Internal Server Error', 
                message: 'حدث خطأ غير متوقع في الخادم. يرجى المحاولة لاحقاً.',
                details: isDev ? err.message : undefined 
            });
        });

        // The "catchall" handler
        app.get(/(.*)/, (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });

        const http = require('http');
        const { Server } = require('socket.io');
        const server = http.createServer(app);
        const io = new Server(server, {
            path: '/api/socket.io',
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        // Make io accessible to routers
        app.set('socketio', io);
        app.set('activeSessions', activeSessions);


        const jwt = require('jsonwebtoken');


        // Socket.io Middleware for Authentication
        io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) return next(new Error('Authentication error'));

            try {
                if (token === 'guest') {
                    socket.data.user = { id: 'guest', role: 'guest', name: 'Guest User' };
                    return next();
                }
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.data.user = decoded;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        const activeSessions = new Map(); // studentId -> sessionData

        io.on('connection', (socket) => {
            const user = socket.data.user;
            const userId = user?.id;

            console.log(`🔌 Socket Connected: ${socket.id} (User: ${user?.name || 'Anonymous'}, ID: ${userId})`);

            if (userId) {
                const userRoom = `user_${userId}`;
                socket.join(userRoom);
                console.log(`   ✅ Joined Personal Room: ${userRoom}`);

                // PERSISTENCE: If student reconnects, check if there's an active session for them
                if (user?.role === 'student' || user?.role === 'user') {
                    const activeSession = activeSessions.get(String(userId));
                    if (activeSession) {
                        console.log(`   💎 [IO] Re-sending persistent session invite to student ${userId}`);
                        socket.emit('session_invite', activeSession);
                    }
                }
            }

            socket.on('join_conversation', (conversationId) => {
                socket.join(conversationId);
                console.log(`   👥 User ${userId} joined room: ${conversationId}`);
            });

            socket.on('leave_conversation', (conversationId) => {
                socket.leave(conversationId);
                console.log(`   🚶 User ${userId} left room: ${conversationId}`);
            });

            socket.on('disconnect', (reason) => {
                console.log(`🔌 Socket Disconnected: ${socket.id} (Reason: ${reason})`);
            });

            socket.on('join_personal_room', (id) => {
                if (id === userId) {
                    socket.join(`user_${id}`);
                    console.log(`   🔄 Re-joined Personal Room: user_${id}`);
                }
            });

            socket.on('typing', (data) => {
                socket.to(data.conversationId).emit('typing', data);
            });

            // Simple-Peer Meeting Signals (New System)
            socket.on('teacher_ready', (data) => {
                // Teacher started sharing, notify all students in room
                socket.to(data.conversationId).emit('teacher_ready', data);
                // Also broadcast meeting started event for UI indicators to EVERYONE (including sender)
                io.in(data.conversationId).emit('meeting_started', {
                    conversationId: data.conversationId,
                    teacherId: data.teacherId,
                    teacherName: data.teacherName,
                    type: data.type
                });
                console.log(`   ✅ Teacher ready in room ${data.conversationId}`);
            });

            socket.on('teacher_stopped', (data) => {
                // Teacher stopped sharing
                socket.to(data.conversationId).emit('teacher_stopped', data);
                // Also broadcast meeting ended event to EVERYONE
                io.in(data.conversationId).emit('meeting_ended', {
                    conversationId: data.conversationId
                });
                console.log(`   🛑 Teacher stopped in room ${data.conversationId}`);
            });

            socket.on('student_joined', (data) => {
                // Student joined, request teacher status
                socket.to(data.conversationId).emit('student_joined', data);
                console.log(`   👋 Student ${data.studentId} joined room ${data.conversationId}`);
            });

            socket.on('student_request', (data) => {
                // Student sends WebRTC offer to teacher
                socket.to(data.conversationId).emit('student_request', data);
                console.log(`   📞 Student ${data.studentId} requesting connection`);
            });

            socket.on('teacher_signal', (data) => {
                // Teacher sends WebRTC answer to specific student
                socket.to(`user_${data.studentId}`).emit('teacher_signal', data);
                console.log(`   📡 Teacher sending signal to student ${data.studentId}`);
            });

            // --- New: Direct Session Invites ---
            socket.on('call_student', async (data) => {
                const studentIdStr = String(data.studentId);
                const targetRoom = `user_${studentIdStr}`;
                
                const sessionData = {
                    teacherId: user.id,
                    teacherName: user.name,
                    teacherSocketId: socket.id, 
                    subject: data.subject,
                    type: data.type || 'video',
                    timestamp: new Date().toISOString()
                };

                activeSessions.set(studentIdStr, sessionData);
                io.to(targetRoom).emit('session_invite', sessionData);

                // --- 🔔 Also create a persistent database notification ---
                try {
                    const db = await getDb();
                    const { v4: uuidv4 } = require('uuid');
                    
                    // Create notification for student
                    const studentNotifId = uuidv4();
                    const msg = `بدأت المعلمة ${user.name} حصة ${data.subject} الآن. يمكنك الانضمام مباشرة!`;
                    
                    await db.run(
                        `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [studentNotifId, user.id, studentIdStr, user.name, 'حصة مباشرة بدأت!', msg, 'live', new Date().toISOString(), 0, '/student-dashboard']
                    );
                    io.to(targetRoom).emit('notification', { id: studentNotifId, title: 'حصة مباشرة بدأت!', message: msg, type: 'live', time: new Date().toISOString() });

                    // Find Parent and create notification for them too
                    const student = await db.get('SELECT parentPhone FROM students WHERE id = ?', [studentIdStr]);
                    if (student && student.parentPhone) {
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
            });


            socket.on('end_session', (data) => {
                const studentIdStr = String(data.studentId);
                activeSessions.delete(studentIdStr);
                io.to(`user_${studentIdStr}`).emit('session_ended', { teacherId: user.id });
            });

            socket.on('disconnect', () => {
                console.log(`🔌 Socket Disconnected: ${socket.id}`);
                // Cleanup: Find any sessions this socket was hosting
                activeSessions.forEach((session, studentId) => {
                    if (session.teacherSocketId === socket.id) {
                        console.log(`   🧹 Cleaning up abandoned session for student ${studentId}`);
                        activeSessions.delete(studentId);
                        io.to(`user_${studentId}`).emit('session_ended', { teacherId: user.id });
                    }
                });
            });

        });

        const serverInstance = server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        // Graceful Shutdown
        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down gracefully...`);
            serverInstance.close(async () => {
                console.log('HTTP server closed.');
                try {
                    const db = await getDb();
                    await db.close();
                    console.log('Database connection closed.');
                    process.exit(0);
                } catch (err) {
                    console.error('Error during database closure:', err);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();

