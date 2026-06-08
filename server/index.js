const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.error('FATAL: JWT_SECRET is not set or is still the default value. Set a strong secret in server/.env');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const prerender = require('prerender-node');
const helmet = require('helmet');
const { Server } = require('socket.io');
const http = require('http');

const dbMiddleware = require('./middleware/db');
const { sanitizeInput, activityAuditor } = require('./middleware/advanced');
const monitoringMiddleware = require('./middleware/monitoring');
const { setupDatabase } = require('./db_setup');
const { getDb } = require('./utils/db');
const logger = require('./utils/logger');

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
const activeSessionsRouter = require('./routes/active_sessions');
const chatRouter = require('./routes/chat');
const publicChatRouter = require('./routes/publicChat');
const { announcementsRouter } = require('./routes/announcements');
const forumRouter = require('./routes/forum');
const appointmentsRouter = require('./routes/appointments');
const { pushRouter, sendPushToUser } = require('./routes/push');
const leadsRouter = require('./routes/leads');
const blogRouter = require('./routes/blog');
const liveRouter = require('./routes/live');
const trialSessionsRouter = require('./routes/trial_sessions');
const teacherAvailabilityRouter = require('./routes/teacher_availability');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(compression());

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://dareen.cloud',
    'https://www.dareen.cloud'
].filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
        'http://localhost:3001', 'http://localhost:5173',
        'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'
    );
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use((req, res, next) => {
    const host = req.headers.host;
    if (host && host.startsWith('www.')) {
        return res.redirect(301, `https://${host.slice(4)}${req.url}`);
    }
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:", "http:"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "connect-src": ["'self'", "https:", "http:", "ws:", "wss:"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(monitoringMiddleware);
app.use(express.json({ limit: '10mb' }));

require('./routes/seo')(app);

async function startServer() {
    try {
        await getDb();
        console.log('Database initialized successfully');
        await setupDatabase();

        app.use(dbMiddleware);
        app.set('trust proxy', 1);

        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: process.env.NODE_ENV === 'development' ? 100000 : 3000,
            message: { error: 'Too many requests, please try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req) => req.path === '/health'
        });
        app.use('/api/', limiter);

        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 20,
            message: { error: 'محاولات تسجيل دخول كثيرة. حاول بعد 15 دقيقة.' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        apiRouter.use('/auth/login', authLimiter);

        const apiRouter = express.Router();
        const { authMiddleware, checkRole } = require('./middleware/auth');
        const { isAdmin } = require('./middleware/permissions');

        apiRouter.use('/auth', authRouter);
        apiRouter.use('/blog', blogRouter);

        apiRouter.get('/system/public-settings', async (req, res) => {
            try {
                const settings = await req.db.all('SELECT * FROM system_settings WHERE key IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    ['maintenance_mode', 'academy_name', 'admin_phone', 'theme_color',
                     'notifications_enabled', 'auto_backup', 'chatbot_enabled',
                     'chatbot_welcome_msg', 'chatbot_name', 'hero_banners',
                     'reminder_minutes_before', 'library_whatsapp', 'library_telegram']);
                const settingsMap = {};
                settings.forEach(s => settingsMap[s.key] = s.value);
                res.json(settingsMap);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        apiRouter.use('/public-chat', publicChatRouter);

        const jobsRouter = require('./routes/jobs');
        apiRouter.use('/jobs', jobsRouter);

        apiRouter.use(authMiddleware);
        apiRouter.use(sanitizeInput);
        apiRouter.use(activityAuditor);

        apiRouter.use('/live', liveRouter);
        apiRouter.use('/students', studentRouter);
        apiRouter.use('/teachers', teacherRouter);
        apiRouter.use('/parents', parentRouter);
        apiRouter.use('/evaluations', evaluationsRouter);
        apiRouter.use('/student-portal', studentPortalRouter);
        apiRouter.use('/sessions', sessionRouter);
        apiRouter.use('/notifications', (req, res, next) => {
            req.sendPushToUser = sendPushToUser;
            notificationRouter(req, res, next);
        });
        apiRouter.use('/system', isAdmin, systemRouter);
        apiRouter.use('/finance', isAdmin, financeRouter);
        apiRouter.use('/tasks', tasksRouter);
        apiRouter.use('/active-sessions', activeSessionsRouter);
        apiRouter.use('/chat', chatRouter);
        apiRouter.use('/announcements', announcementsRouter);
        apiRouter.use('/forum', forumRouter);
        apiRouter.use('/appointments', appointmentsRouter);
        apiRouter.use('/push', pushRouter);
        apiRouter.use('/leads', leadsRouter);
        apiRouter.use('/trial-sessions', trialSessionsRouter);
        apiRouter.use('/teacher-availability', teacherAvailabilityRouter);

        apiRouter.use('/studentInvoices', isAdmin, (req, res, next) => {
            req.url = (req.url === '' || req.url === '/') ? '/student' : '/student' + req.url;
            invoiceRouter(req, res, next);
        });

        apiRouter.use('/invoices', isAdmin, (req, res, next) => {
            if (req.url === '' || req.url === '/') req.url = '/teacher';
            else if (!req.url.startsWith('/teacher') && !req.url.startsWith('/student')) req.url = '/teacher' + req.url;
            invoiceRouter(req, res, next);
        });

        apiRouter.use('/users', isAdmin, (req, res, next) => {
            req.url = '/users' + req.url;
            systemRouter(req, res, next);
        });

        apiRouter.use((req, res) => {
            res.status(404).json({ error: 'Not Found', message: 'API endpoint not found.' });
        });

        app.use(express.static(path.join(__dirname, '../dist'), {
            maxAge: '1y',
            immutable: true,
            index: false,
            setHeaders: (res, filePath) => {
                if (filePath.endsWith('.html')) {
                    res.setHeader('Cache-Control', 'no-cache');
                } else if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|webp|avif)$/)) {
                    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                }
            }
        }));

        app.use('/api', apiRouter);

        app.use((err, req, res, next) => {
            const isDev = process.env.NODE_ENV === 'development';
            logger.error('Unhandled Server Error', err, { path: req.path, user: req.user?.username || 'Guest' });
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'حدث خطأ غير متوقع في الخادم. يرجى المحاولة لاحقاً.',
                details: isDev ? err.message : undefined
            });
        });

        prerender.set('prerenderToken', process.env.PRERENDER_TOKEN);
        prerender.set('crawlerUserAgents', [
            'googlebot', 'bingbot', 'yandexbot', 'facebookexternalhit',
            'twitterbot', 'rogerbot', 'linkedinbot', 'embedly',
            'baiduspider', 'pinterestbot', 'slackbot-likex', 'vkshare',
            'w3c_validator', 'redditbot', 'applebot', 'whatsapp',
            'flipboard', 'tumblr', 'bitlybot', 'semrushbot',
            'ahrefsbot', 'dotbot'
        ]);
        prerender.set('whitelist', ['/', '/courses', '/about', '/contact', '/books', '/login', '/privacy-policy', '/refund-policy', '/terms-of-service', '/terms-of-work', '/jobs', '/books/.*']);
        app.use(prerender);

        const knownRoutes = new Set(['/', '/courses', '/about', '/contact', '/books', '/login', '/privacy-policy', '/refund-policy', '/terms-of-service', '/terms-of-work', '/jobs']);
        app.get(/(.*)/, (req, res) => {
            const isKnown = knownRoutes.has(req.path) || req.path.startsWith('/books/');
            res.status(isKnown ? 200 : 404).sendFile(path.join(__dirname, '../dist/index.html'));
        });

        const server = http.createServer(app);
        const io = new Server(server, {
            path: '/api/socket.io',
            cors: {
                origin: (origin, callback) => {
                    if (!origin || allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
                    callback(new Error('Not allowed by CORS'));
                },
                methods: ["GET", "POST"]
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });
        app.set('socketio', io);

        require('./socket/handler')(io, app);
        require('./socket/reminderScheduler')(app);

        const serverInstance = server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down gracefully...`);
            serverInstance.close(async () => {
                try {
                    const db = await getDb();
                    await db.close();
                    process.exit(0);
                } catch (err) {
                    console.error('Error during database closure:', err);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', reason);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
