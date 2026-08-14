const express = require('express');
const router = express.Router();

const { createRateLimiter } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../middleware/permissions');
const { sanitizeInput, activityAuditor } = require('../middleware/advanced');
const { prisma } = require('../utils/prisma');
const cache = require('../services/cacheService');

// Rate limiters
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

router.use('/auth/login', strictLimiter);
router.use('/auth/register', strictLimiter);
router.use('/auth/forgot-password', strictLimiter);
router.use('/auth/reset-password', strictLimiter);
router.use('/public-chat', moderateLimiter);

// Verify only validates an existing token (no session created) — generous cap
const verifyLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'محاولات تحقق كثيرة جداً، يرجى المحاولة بعد 15 دقيقة',
});
router.use('/auth/verify', verifyLimiter);

// ── Public routes (no auth) ──
const { authRouter } = require('./core/auth');
router.use('/auth', authRouter);

const blogRouter = require('./communication/blog');
router.use('/blog', blogRouter);

const uploadRouter = require('./core/upload');
router.use('/upload', uploadRouter);

router.get('/docs', (req, res) => {
    res.json(require('../utils/apiDocs'));
});

router.get('/system/public-settings', async (req, res) => {
    try {
        const keys = ['maintenance_mode', 'academy_name', 'academy_logo', 'academy_tagline', 'academy_address',
            'admin_phone', 'theme_color',
            'notifications_enabled', 'auto_backup', 'chatbot_enabled',
            'chatbot_welcome_msg', 'chatbot_name', 'hero_banners',
            'reminder_minutes_before', 'library_whatsapp', 'library_telegram',
            'whatsapp_numbers', 'whatsapp_auto_notify', 'default_session_price', 'default_teacher_price',
            'currency_symbol', 'semester_name', 'semesters', 'whatsapp_template',
            'balance_warning_threshold', 'backdate_lock_enabled', 'teacher_commission_type',
            'auto_freeze_threshold', 'telegram_handle', 'academic_year', 'semester_start_date',
            'semester_end_date', 'footer_description', 'footer_address', 'footer_instagram'];
        const settingsMap = await cache.wrap('system:public-settings', 60000, async () => {
            const settings = await prisma.systemSetting.findMany({
                where: { key: { in: keys } }
            });
            const map = {};
            settings.forEach(s => map[s.key] = s.value);
            return map;
        });
        res.json(settingsMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const publicChatRouter = require('./communication/publicChat');
router.use('/public-chat', publicChatRouter);

const jobsRouter = require('./communication/jobs');
router.use('/jobs', jobsRouter);

const contactRouter = require('./communication/contact');
router.use('/contact', contactRouter);

const blogCustomersRouter = require('./communication/blogCustomers');
router.use('/blog-customers', blogCustomersRouter);

// ── Auth middleware (protect all subsequent routes) ──
router.use(authMiddleware);
router.use(sanitizeInput);
router.use(activityAuditor);

// ── Protected routes (auth required) ──
const liveRouter = require('./education/live');
router.use('/live', liveRouter);

const { studentRouter } = require('./education/students');
router.use('/students', studentRouter);

const { teacherRouter } = require('./education/teachers');
router.use('/teachers', teacherRouter);

const { parentRouter } = require('./education/parents');
router.use('/parents', parentRouter);

const { evaluationsRouter } = require('./education/evaluations');
router.use('/evaluations', evaluationsRouter);

const { studentPortalRouter } = require('./education/studentPortal');
router.use('/student-portal', studentPortalRouter);

const { sessionRouter } = require('./education/sessions');
router.use('/sessions', sessionRouter);

const { notificationRouter } = require('./communication/notifications');
router.use('/notifications', notificationRouter);

const tasksRouter = require('./admin/tasks');
router.use('/tasks', tasksRouter);

const activeSessionsRouter = require('./education/active_sessions');
router.use('/active-sessions', activeSessionsRouter);

const chatRouter = require('./communication/chat');
router.use('/chat', chatRouter);

const { announcementsRouter } = require('./communication/announcements');
router.use('/announcements', announcementsRouter);

const forumRouter = require('./communication/forum');
router.use('/forum', forumRouter);

const appointmentsRouter = require('./admin/appointments');
router.use('/appointments', appointmentsRouter);

const { pushRouter } = require('./communication/push');
router.use('/push', pushRouter);

const leadsRouter = require('./communication/leads');
router.use('/leads', leadsRouter);

const trialSessionsRouter = require('./education/trial_sessions');
router.use('/trial-sessions', trialSessionsRouter);

const teacherAvailabilityRouter = require('./education/teacher_availability');
router.use('/teacher-availability', teacherAvailabilityRouter);

const { searchRouter } = require('./core/search');
router.use('/search', searchRouter);

const enrollmentRouter = require('./education/enrollment');
router.use('/enrollments', enrollmentRouter);

const executiveRouter = require('./admin/executive');
router.use('/v1/executive', executiveRouter);

// ── Admin routes (auth + isAdmin) ──
const { systemRouter } = require('./core/system');
router.use('/system', isAdmin, systemRouter);

const financeRouter = require('./finance/finance');
router.use('/finance', isAdmin, financeRouter);

const { currenciesRouter } = require('./core/currencies');
router.use('/currencies', isAdmin, currenciesRouter);

const { exportRouter } = require('./finance/export');
router.use('/export', isAdmin, exportRouter);

const rolesRouter = require('./admin/roles');
router.use('/roles', isAdmin, rolesRouter);

const auditRouter = require('./admin/audit');
router.use('/audit', isAdmin, auditRouter);

const { monitoringRouter } = require('./admin/monitoring');
router.use('/monitoring', isAdmin, monitoringRouter);

// ── Special routes with URL rewriting ──
const { selfInvoiceRouter } = require('./finance/selfInvoices');
router.use('/invoices/me', selfInvoiceRouter);

const { invoiceRouter } = require('./finance/invoices');
router.use('/studentInvoices', isAdmin, (req, res, next) => {
    req.url = (req.url === '' || req.url === '/') ? '/student' : '/student' + req.url;
    invoiceRouter(req, res, next);
});

router.use('/invoices', isAdmin, (req, res, next) => {
    if (req.url === '' || req.url === '/') req.url = '/teacher';
    else if (req.url === '/stats') req.url = '/stats';
    else if (!req.url.startsWith('/teacher') && !req.url.startsWith('/student')) req.url = '/teacher' + req.url;
    invoiceRouter(req, res, next);
});

router.use('/users', isAdmin, (req, res, next) => {
    req.url = '/users' + req.url;
    systemRouter(req, res, next);
});

// ── 404 handler ──
router.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'API endpoint not found.' });
});

module.exports = router;
