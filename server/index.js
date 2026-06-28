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
const correlationIdMiddleware = require('./middleware/correlationId');
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
const uploadRouter = require('./routes/upload');
const liveRouter = require('./routes/live');
const trialSessionsRouter = require('./routes/trial_sessions');
const teacherAvailabilityRouter = require('./routes/teacher_availability');
const { searchRouter } = require('./routes/search');
const { exportRouter } = require('./routes/export');

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
    let redisStatus = 'unavailable';
    let cacheFallbacks = 0;
    try {
        const redis = require('./utils/redis');
        redisStatus = redis.status();
        cacheFallbacks = redis.getFallbackCount();
    } catch { /* ignore */ }
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: redisStatus,
        cacheFallbackCount: cacheFallbacks,
    });
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

app.use(correlationIdMiddleware);
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

        const { initQueueSystem } = require('./services');
        initQueueSystem().catch((err) => {
            console.error('Queue system init failed (non-fatal):', err.message);
        });

        const { createRateLimiter } = require('./middleware/rateLimiter');
        const limiter = createRateLimiter({
            windowMs: 15 * 60 * 1000,
            max: process.env.NODE_ENV === 'development' ? 100000 : 3000,
            message: 'Too many requests, please try again later.',
            skipFailedRequests: false,
        });

        const strictLimiter = createRateLimiter({
            windowMs: 15 * 60 * 1000,
            max: 20,
            message: 'محاولات كثيرة. حاول بعد 15 دقيقة.',
        });
        const moderateLimiter = createRateLimiter({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: 'محاولات كثيرة. حاول بعد 15 دقيقة.',
        });
        app.use('/api/', (req, res, next) => {
            if (req.path === '/health' || req.path === '/') return next();
            limiter(req, res, next);
        });
        const apiRouter = express.Router();
        const { authMiddleware, checkRole } = require('./middleware/auth');
        const { isAdmin } = require('./middleware/permissions');

        apiRouter.use('/auth/login', strictLimiter);
        apiRouter.use('/auth/register', strictLimiter);
        apiRouter.use('/auth/forgot-password', strictLimiter);
        apiRouter.use('/auth/reset-password', strictLimiter);
        apiRouter.use('/auth/verify', moderateLimiter);
        apiRouter.use('/public-chat', moderateLimiter);

        apiRouter.use('/auth', authRouter);
        apiRouter.use('/blog', blogRouter);
        apiRouter.use('/upload', uploadRouter);
        apiRouter.get('/docs', (req, res) => {
            res.json(require('./utils/apiDocs'));
        });

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

        const contactRouter = require('./routes/contact');
        apiRouter.use('/contact', contactRouter);

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
        apiRouter.use('/notifications', notificationRouter);
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
        apiRouter.use('/search', searchRouter);
        apiRouter.use('/export', isAdmin, exportRouter);

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

        app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'), {
            maxAge: '7d',
            setHeaders: (res, filePath) => {
                if (filePath.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/)) {
                    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
                }
            }
        }));

        app.use('/api', apiRouter);

        app.use((err, req, res, next) => {
            const isDev = process.env.NODE_ENV === 'development';
            logger.error('Unhandled Server Error', err, { path: req.path, user: req.user?.username || 'Guest' });
            const { adminNotifyOnError } = require('./middleware/monitoring');
            adminNotifyOnError()(err, req, res, () => {
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: 'حدث خطأ غير متوقع في الخادم. يرجى المحاولة لاحقاً.',
                    details: isDev ? err.message : undefined
                });
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

        // Sitemap
        app.get('/sitemap.xml', async (req, res) => {
            try {
                const posts = await req.db.all('SELECT slug, date FROM blog_posts ORDER BY date DESC');
                const urls = [
                    { loc: '/', priority: '1.0', changefreq: 'weekly' },
                    { loc: '/courses', priority: '0.9', changefreq: 'weekly' },
                    { loc: '/books', priority: '0.9', changefreq: 'daily' },
                    { loc: '/about', priority: '0.6', changefreq: 'monthly' },
                    { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
                    { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
                    { loc: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
                    { loc: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
                    { loc: '/terms-of-work', priority: '0.3', changefreq: 'yearly' },
                    { loc: '/jobs', priority: '0.5', changefreq: 'weekly' },
                    ...posts.map(p => ({
                        loc: `/books/${p.slug}`,
                        priority: '0.8',
                        changefreq: 'monthly',
                        lastmod: p.date
                    }))
                ];
                const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${urls.map(u => `
            <url>
                <loc>https://dareen.cloud${u.loc}</loc>
                <priority>${u.priority}</priority>
                <changefreq>${u.changefreq}</changefreq>
                ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
            </url>`).join('')}
        </urlset>`;
                res.header('Content-Type', 'application/xml');
                res.send(xml);
            } catch (err) {
                res.status(500).send('Error generating sitemap');
            }
        });

        // RSS Feed
        app.get('/rss.xml', async (req, res) => {
            try {
                const posts = await req.db.all('SELECT slug, title, excerpt, coverImage, date, author, category, subject, curriculum FROM blog_posts ORDER BY date DESC LIMIT 50');
                const items = posts.map(p => `
                <item>
                    <title><![CDATA[${p.title}]]></title>
                    <link>https://dareen.cloud/books/${p.slug}</link>
                    <guid>https://dareen.cloud/books/${p.slug}</guid>
                    <description><![CDATA[${p.excerpt || ''}]]></description>
                    <author>${p.author}</author>
                    <category>${p.category || ''}${p.subject ? `, ${p.subject}` : ''}</category>
                    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
                    ${p.coverImage ? `<enclosure url="https://dareen.cloud${p.coverImage}" type="image/jpeg" />` : ''}
                </item>`).join('');
                const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>دارين السابعة - المدونة</title>
        <link>https://dareen.cloud/books</link>
        <description>أحدث المقالات والموارد التعليمية من دارين السابعة للتعليم والتدريب</description>
        <language>ar</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="https://dareen.cloud/rss.xml" rel="self" type="application/rss+xml" />
        ${items}
    </channel>
</rss>`;
                res.header('Content-Type', 'application/rss+xml; charset=utf-8');
                res.send(xml);
            } catch (err) {
                res.status(500).send('Error generating RSS feed');
            }
        });

        const knownRoutes = new Set(['/', '/courses', '/about', '/contact', '/books', '/login', '/privacy-policy', '/refund-policy', '/terms-of-service', '/terms-of-work', '/jobs', '/trial-sessions']);
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
