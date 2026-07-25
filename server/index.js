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

app.get(/(.*)/, (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return res.status(404).send('Not found');
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

        // Schema sync is intentionally disabled in production.
        // Use `npx prisma migrate deploy` for controlled migrations instead.
        if (process.env.NODE_ENV !== 'production') {
            try {
                const { execSync } = require('child_process');
                execSync('npx prisma db push', {
                    cwd: __dirname,
                    stdio: 'pipe',
                    timeout: 30000,
                    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
                });
            } catch (syncErr) {
                console.warn('DB schema sync warning (non-fatal):', syncErr.message);
            }
        }

        const { initQueueSystem } = require('./services');
        initQueueSystem().catch((err) => {
            console.error('Queue system init failed (non-fatal):', err.message);
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

        server.timeout = 120_000; // 2 min — close idle connections
        server.headersTimeout = 65_000; // slightly above timeout for HTTP headers

        const serverInstance = server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down gracefully...`);
            serverInstance.close(async () => {
                try {
                    await logger.close();
                    await prisma.$disconnect();
                    process.exit(0);
                } catch (err) {
                    console.error('Error during shutdown:', err);
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

if (process.env.NODE_ENV !== 'test') {
    startServer();
}
