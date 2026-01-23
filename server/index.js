const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const compression = require('compression');

const dbMiddleware = require('./middleware/db');
const { sanitizeInput, activityAuditor } = require('./middleware/advanced');

// Route Imports
const { authRouter } = require('./routes/auth');
const { studentRouter } = require('./routes/students');
const { teacherRouter } = require('./routes/teachers');
const { parentRouter } = require('./routes/parents');
const { sessionRouter } = require('./routes/sessions');
const { invoiceRouter } = require('./routes/invoices');
const { notificationRouter } = require('./routes/notifications');
const { systemRouter } = require('./routes/system');
const financeRouter = require('./routes/finance');
const tasksRouter = require('./routes/tasks');
const appointmentsRouter = require('./routes/appointments');
const chatRouter = require('./routes/chat');



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

// Deep Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

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

app.use(express.json({ limit: '1mb' }));

async function startServer() {
    try {
        const db = await getDb();
        console.log('Database initialized successfully');

        // Run DB Setup/Migration on start
        const { setupDatabase } = require('./db_setup');
        await setupDatabase();

        app.use(dbMiddleware);

        app.set('trust proxy', 1);

        // Security: Rate Limiting
        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: process.env.NODE_ENV === 'development' ? 100000 : 50000, // Increased for production
            message: { error: 'Too many requests, please try again later.' }
        });
        app.use('/api/', limiter);

        const logger = require('./utils/logger');

        // Setup API Routes
        const apiRouter = express.Router();

        const { authMiddleware, checkRole } = require('./middleware/auth');

        apiRouter.use('/auth', authRouter);

        // Apply authentication to ALL other API routes
        apiRouter.use(authMiddleware);

        // Deep Sanitization & Auditing for Authenticated Requests
        apiRouter.use(sanitizeInput);
        apiRouter.use(activityAuditor);

        apiRouter.use('/students', studentRouter);
        apiRouter.use('/teachers', teacherRouter);
        apiRouter.use('/parents', parentRouter);
        apiRouter.use('/sessions', sessionRouter);
        apiRouter.use('/notifications', notificationRouter);
        apiRouter.use('/system', checkRole(['admin']), systemRouter);
        apiRouter.use('/finance', checkRole(['admin']), financeRouter);
        apiRouter.use('/tasks', tasksRouter);
        apiRouter.use('/appointments', appointmentsRouter);
        apiRouter.use('/chat', chatRouter);


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
            maxAge: '7d', // Cache images/assets for 7 days
            index: false
        }));

        app.use('/api', apiRouter);

        // Global Error Handler
        app.use((err, req, res, next) => {
            logger.error('Unhandled Server Error', err, { path: req.path });
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
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

        const jwt = require('jsonwebtoken');

        // Socket.io Middleware for Authentication
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
                console.log(`   ✅ Joined Personal Room: ${userRoom}`);
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

