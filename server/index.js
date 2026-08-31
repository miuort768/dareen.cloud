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

const monitoringMiddleware = require('./middleware/monitoring');
const correlationIdMiddleware = require('./middleware/correlationId');
const { auditMiddleware } = require('./middleware/audit');
const { prisma } = require('./utils/prisma');
const logger = require('./utils/logger');

const { healthRouter } = require('./routes/health');

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
            "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "connect-src": ["'self'", "https:", "http:", "ws:", "wss:"]
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(correlationIdMiddleware);
app.use(auditMiddleware);
app.use(monitoringMiddleware);
// Backup restore payloads can be several MB — allow a dedicated large body
// before the global 1mb parser (body-parser skips once req._body is set).
app.use('/api/system/restore', express.json({ limit: '50mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Graceful JSON parse error — malformed body → 400, not 500
app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'تنسيق JSON غير صالح في جسم الطلب' });
    }
    next(err);
});

require('./routes/seo')(app);

app.set('trust proxy', 1);

const { createRateLimiter } = require('./middleware/rateLimiter');
const limiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 100000 : 3000,
    message: 'Too many requests, please try again later.',
    skipFailedRequests: false,
});
app.use('/api/', (req, res, next) => {
    if (req.path === '/health' || req.path === '/') return next();
    limiter(req, res, next);
});
const apiRouter = require('./routes');

// Health & flags — no auth (liveness/readiness)
app.use('/health', healthRouter);

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

app.use(express.static(path.join(__dirname, '../dist'), {
    maxAge: '1y',
    immutable: true,
    index: false,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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

prerender.set('prerenderToken', process.env.PRERENDER_TOKEN);
prerender.set('crawlerUserAgents', [
    'googlebot', 'bingbot', 'yandexbot', 'facebookexternalhit',
    'twitterbot', 'rogerbot', 'linkedinbot', 'embedly',
    'baiduspider', 'pinterestbot', 'slackbot-likex', 'vkshare',
    'w3c_validator', 'redditbot', 'applebot', 'whatsapp',
    'flipboard', 'tumblr', 'bitlybot', 'semrushbot',
    'ahrefsbot', 'dotbot'
]);
prerender.set('whitelist', ['/', '/courses', '/about', '/contact', '/books', '/login', '/privacy-policy', '/refund-policy', '/terms-of-service', '/terms-of-work', '/jobs', '/blog', '/books/.*']);
app.use(prerender);

// RSS Feed (sitemap handled in routes/seo.js)
app.get('/rss.xml', async (req, res) => {
    try {
        const posts = await prisma.blogPost.findMany({
            select: { slug: true, title: true, excerpt: true, coverImage: true, date: true, author: true, category: true, subject: true, curriculum: true },
            orderBy: { date: 'desc' },
            take: 50
        });
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

// ── Bot / crawler detector → inject OG meta into the HTML shell ──────────────
const BOT_UA = /googlebot|bingbot|yandexbot|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|applebot|baiduspider|duckduckbot|semrushbot|ahrefsbot|msnbot|rogerbot|pinterestbot|redditbot|w3c_validator/i;

// Per-route OG data (static routes that get shared)
const OG_MAP = {
    '/':                  { title: 'دارين السابعة - منصة تعليم عن بعد رائدة في الكويت والخليج', desc: 'دروس خصوصية أونلاين، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع أفضل المعلمين. احجز حصة تجريبية مجانية.', img: '/dareen_logo_new.jpg' },
    '/courses':           { title: 'دوراتنا التعليمية | دارين السابعة', desc: 'استعرض جميع المواد والدورات المتاحة في منصة دارين السابعة للتعليم عن بعد.', img: '/dareen_logo_new.jpg' },
    '/about':             { title: 'من نحن | دارين السابعة', desc: 'تعرّف على منصة دارين السابعة للتعليم والتدريب عن بعد في الكويت والخليج.', img: '/dareen_logo_new.jpg' },
    '/contact':           { title: 'تواصل معنا | دارين السابعة', desc: 'تواصل مع فريق دارين السابعة لمزيد من المعلومات.', img: '/dareen_logo_new.jpg' },
    '/jobs':              { title: 'وظائف | دارين السابعة', desc: 'انضم إلى فريق دارين السابعة — فرص عمل للمعلمين والمحترفين.', img: '/dareen_logo_new.jpg' },
    '/books':             { title: 'المدونة والموارد | دارين السابعة', desc: 'مقالات تعليمية، نصائح، وموارد مفيدة للطلاب وأولياء الأمور.', img: '/dareen_logo_new.jpg' },
    '/privacy-policy':    { title: 'سياسة الخصوصية | دارين السابعة', desc: 'اقرأ سياسة الخصوصية الخاصة بمنصة دارين السابعة.', img: '/dareen_logo_new.jpg' },
    '/terms-of-service':  { title: 'شروط الاستخدام | دارين السابعة', desc: 'اطلع على شروط وأحكام استخدام منصة دارين السابعة.', img: '/dareen_logo_new.jpg' },
};

const SITE_NAME = 'دارين السابعة للتعليم والتدريب';
const BASE_URL  = 'https://dareen.cloud';

function buildBotHtml(og) {
    const title = og.title;
    const desc  = og.desc;
    const img   = og.img.startsWith('http') ? og.img : `${BASE_URL}${og.img}`;
    const url   = og.url || BASE_URL;
    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:url" content="${url}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${SITE_NAME}"/>
<meta property="og:locale" content="ar_AR"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${desc}"/>
<meta name="twitter:image" content="${img}"/>
</head>
<body><h1>${title}</h1><p>${desc}</p></body>
</html>`;
}

app.get(/(.*)/, async (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return res.status(404).send('Not found');

    const ua = req.headers['user-agent'] || '';
    const isBot = BOT_UA.test(ua);

    if (isBot) {
        // Try to find a matching OG entry (exact, or prefix for blog posts)
        let og = OG_MAP[req.path];

        // Blog post: /books/:slug — fetch real post data from DB
        if (!og && req.path.startsWith('/books/')) {
            const slug = req.path.replace('/books/', '');
            try {
                const post = await prisma.blogPost.findUnique({
                    where: { slug },
                    select: { title: true, excerpt: true, coverImage: true }
                });
                if (post) {
                    og = {
                        title: `${post.title} | دارين السابعة`,
                        desc: post.excerpt || 'مقال تعليمي من دارين السابعة',
                        img: post.coverImage || '/dareen_logo_new.jpg',
                        url: `${BASE_URL}/books/${slug}`
                    };
                }
            } catch (_) { /* fall through */ }
        }

        // Fallback to homepage OG
        if (!og) og = { ...OG_MAP['/'], url: `${BASE_URL}${req.path}` };
        else og.url = og.url || `${BASE_URL}${req.path}`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5-min cache for bots
        return res.send(buildBotHtml(og));
    }

    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Export for testing (supertest needs the app without starting the server)
module.exports = app;

async function startServer() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully via Prisma');

        // Ensure upload directories exist (avoid per-request sync mkdir)
        const fsp = fs.promises;
        const uploadDirs = [
            path.join(__dirname, '../public/uploads/blog'),
        ];
        for (const dir of uploadDirs) {
            await fsp.mkdir(dir, { recursive: true }).catch(() => {});
        }

        // Auto-apply pending migrations on startup
        try {
            const { execSync } = require('child_process');
            execSync('npx prisma migrate deploy', { cwd: __dirname, stdio: 'pipe', timeout: 30000 });
            console.log('✅ Prisma migrations applied');
        } catch (migErr) {
            console.error('⚠️ Migration error (non-fatal):', migErr.message);
        }

        const { initQueueSystem } = require('./services');
        initQueueSystem().catch((err) => {
            console.error('Queue system init failed (non-fatal):', err.message);
        });

        // Daily reset of completed_sessions (appointment flags) at 00:10
        const completedSessionsReset = require('./services/completedSessionsReset');
        completedSessionsReset.start();

        const server = http.createServer(app);
        // ── DoS hardening (Slowloris / slow-body attacks) ───────────────────
        // headersTimeout (35s) kills the header-phase Slowloris; requestTimeout
        // defaults to 300s which is generous for slow-body — 120s still allows
        // multi-MB backup restores on slow links while cutting hold time 2.5x.
        server.requestTimeout = 120_000;
        server.keepAliveTimeout = 5_000;
        server.headersTimeout = 35_000; // must stay > keepAliveTimeout
        const io = new Server(server, {
            path: '/api/socket.io',
            cors: {
                origin: (origin, callback) => {
                    if (!origin || allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
                    callback(new Error('Not allowed by CORS'));
                },
                methods: ["GET", "POST"]
            },
            pingTimeout: 25000,
            pingInterval: 20000,
            maxHttpBufferSize: 256 * 1024, // 256 KB — chat payloads never need more
            connectionStateRecovery: false,
            transports: ['websocket', 'polling'],
        });
        app.set('socketio', io);

        require('./socket/handler')(io, app);
        require('./socket/reminderScheduler')(app);

        server.timeout = 120_000; // 2 min — close idle connections

        const serverInstance = server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down gracefully...`);

            // Force-exit if graceful shutdown hangs (open connections, stuck workers)
            const forceExit = setTimeout(() => {
                console.error('Shutdown timed out — forcing exit');
                process.exit(1);
            }, 10000);
            forceExit.unref();

            serverInstance.close(async () => {
                try {
                    // Stop background schedulers and workers
                    try { require('./socket/reminderScheduler').stop(); } catch { /* ignore */ }
                    try { require('./services/completedSessionsReset').stop(); } catch { /* ignore */ }
                    try {
                        const { shutdownSchedulers } = require('./services/queue/scheduler');
                        shutdownSchedulers();
                    } catch { /* ignore */ }
                    try {
                        const { shutdownWorkers } = require('./services/queue/workers');
                        await shutdownWorkers();
                    } catch { /* ignore */ }
                    try {
                        const { stopAutoBackup } = require('./services/backupService');
                        stopAutoBackup();
                    } catch { /* ignore */ }
                    await logger.close();
                    await prisma.$disconnect();
                    clearTimeout(forceExit);
                    process.exit(0);
                } catch (err) {
                    console.error('Error during shutdown:', err);
                    clearTimeout(forceExit);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
            shutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', reason);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    startServer();
}
