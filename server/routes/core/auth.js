const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });
const { authMiddleware, checkRole } = require('../../middleware/auth');
const logger = require('../../utils/logger');
const ResponseHandler = require('../../utils/responseHandler');
const { prisma } = require('../../utils/prisma');
const { createRateLimiter } = require('../../middleware/rateLimiter');
const { AUDIT_ACTIONS } = require('../../constants/auditActions');
const { AUDIT_STATUS } = require('../../constants/auditStatus');
const authAccounts = require('../../services/authAccounts');

const router = express.Router();

const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, max: 10,
    message: 'محاولات دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة'
});

const verifyLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, max: 30,
    message: 'محاولات تحقق كثيرة جداً، يرجى المحاولة بعد 15 دقيقة'
});

const logoutAllLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, max: 5,
    message: 'محاولات تسجيل خروج كثيرة جداً، يرجى المحاولة بعد ساعة'
});

router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        let userData, role, teacherName;
        let authSource;
        let authResult;

        try {
            const normalized = username.trim().toLowerCase();
            authResult = await authAccounts.authenticate(normalized, password);

            if (!authResult) {
                logger.warn(`Login failed: User '${username}' not found`);
                req.audit({ action: AUDIT_ACTIONS.LOGIN_FAILED, status: AUDIT_STATUS.FAILURE, metadata: { attemptedUsername: username, reason: 'user_not_found' } });
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            role = authResult.role;
            authSource = authResult.authSource;
            teacherName = null;

            if (authSource === 'accounts') {
                const modelMap = { admin: 'user', teacher: 'teacher', parent: 'parent', student: 'student', chat_user: 'chatProfile' };
                const modelName = modelMap[role];
                userData = await prisma[modelName].findUnique({ where: { id: authResult.id } });
                if (role === 'teacher') teacherName = userData?.name || null;
            } else {
                userData = authResult._rawData;
                if (role === 'teacher') teacherName = userData.name;
            }

            req.audit({ action: authSource === 'accounts' ? AUDIT_ACTIONS.AUTH_SOURCE_ACCOUNTS : AUDIT_ACTIONS.AUTH_SOURCE_LEGACY, entityType: role, entityId: authResult.id, status: AUDIT_STATUS.SUCCESS });
        } catch (dbErr) {
            logger.error('Auth database error', dbErr, { username });
            return res.status(500).json({ error: 'Authentication service temporarily unavailable' });
        }

        if (!userData) {
            logger.warn(`Login failed: User '${username}' not found`);
            req.audit({ action: AUDIT_ACTIONS.LOGIN_FAILED, status: AUDIT_STATUS.FAILURE, metadata: { attemptedUsername: username, reason: 'user_not_found' } });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        let parsedPermissions = [];
        if (userData.permissions) {
            if (typeof userData.permissions === 'string') {
                try { parsedPermissions = JSON.parse(userData.permissions); } catch (e) { parsedPermissions = []; }
            } else if (Array.isArray(userData.permissions)) {
                parsedPermissions = userData.permissions;
            }
        }

        let tokenPayload = {
            id: userData.id || authResult.id,
            username: userData.username || authResult.username,
            role: role,
            phone: userData.phone || userData.studentPhone || null,
            teacherName: teacherName,
            token_version: authResult.tokenVersion ?? userData.tokenVersion ?? userData.token_version ?? 1,
            permissions: parsedPermissions
        };

        if (role === 'parent') tokenPayload.permissions = ['parent_dashboard', 'parent_students', 'parent_attendance', 'chat'];
        if (role === 'student') tokenPayload.permissions = ['student_dashboard', 'chat'];

        if (role === 'teacher' && !teacherName) {
            const linkedTeacher = await prisma.teacher.findFirst({ where: { username, deletedAt: null } });
            if (linkedTeacher) { tokenPayload.id = linkedTeacher.id; tokenPayload.teacherName = linkedTeacher.name; teacherName = linkedTeacher.name; }
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        const { password: _, ...finalUserData } = userData;
        logger.info(`User logged in: ${authResult.username || username} (${role}) [${authSource}]`);
        req.audit({ action: AUDIT_ACTIONS.LOGIN_SUCCESS, entityType: role, entityId: authResult.id });

        res.json({
            token,
            user: {
                ...finalUserData,
                id: tokenPayload.id,
                role: role,
                teacherName: teacherName || (role === 'teacher' ? finalUserData.name : null),
                permissions: role === 'admin'
                    ? (parsedPermissions.length > 0 ? parsedPermissions : ['*'])
                    : role === 'teacher' ? ['dashboard', 'attendance', 'schedule', 'appointments', 'tasks', 'chat']
                    : role === 'parent' ? ['parent_dashboard', 'chat']
                    : role === 'student' ? ['student_dashboard', 'chat']
                    : ['chat']
            }
        });
    } catch (error) {
        logger.error('Login error', error, { username });
        ResponseHandler.serverError(res, error, 'Login error');
    }
});

router.post('/verify', verifyLimiter, async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const versionOk = await authAccounts.checkTokenVersion(decoded.id, decoded.role, decoded.token_version);
        if (!versionOk) {
            return res.json({ valid: false, error: 'Session revoked' });
        }

        let userData = null;

        if (decoded.role === 'admin') {
            userData = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, username: true, role: true, permissions: true, tokenVersion: true } });
        } else if (decoded.role === 'teacher') {
            const teacher = await prisma.teacher.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, username: true, tokenVersion: true } });
            if (teacher) userData = { ...teacher, role: 'teacher', teacherName: teacher.name };
        } else if (decoded.role === 'chat_user') {
            const cp = await prisma.chatProfile.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, username: true } });
            if (cp) userData = { ...cp, role: 'chat_user' };
        } else if (decoded.role === 'parent') {
            const parent = await prisma.parent.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, username: true, phone: true, tokenVersion: true } });
            if (parent) userData = { ...parent, role: 'parent' };
        } else if (decoded.role === 'student') {
            const student = await prisma.student.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, username: true, studentPhone: true, tokenVersion: true } });
            if (student) userData = { ...student, role: 'student' };
        }

        if (!userData) return res.json({ valid: false });

        if (!userData.permissions || (Array.isArray(userData.permissions) && userData.permissions.length === 0)) {
            if (userData.role === 'admin') userData.permissions = ['*'];
            else if (userData.role === 'teacher') userData.permissions = ['dashboard', 'attendance', 'schedule', 'appointments', 'tasks', 'chat'];
            else if (userData.role === 'chat_user') userData.permissions = ['chat'];
            else if (userData.role === 'parent') userData.permissions = ['parent_dashboard', 'chat'];
            else if (userData.role === 'student') userData.permissions = ['student_dashboard', 'chat'];
        }

        if (userData.permissions && typeof userData.permissions === 'string') {
            try { userData.permissions = JSON.parse(userData.permissions); } catch (e) { userData.permissions = []; }
        }

        req.audit({ action: AUDIT_ACTIONS.TOKEN_VERIFIED, entityType: decoded.role, entityId: decoded.id });
        res.json({ valid: true, user: userData });
    } catch (error) {
        res.json({ valid: false });
    }
});

router.post('/refresh', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user still exists in DB before issuing a new token
        const modelMap = { admin: 'user', teacher: 'teacher', parent: 'parent', student: 'student', chat_user: 'chatProfile' };
        const modelName = modelMap[decoded.role];
        if (modelName) {
            const exists = await prisma[modelName].findUnique({ where: { id: decoded.id }, select: { id: true } });
            if (!exists) return res.status(401).json({ error: 'User no longer exists' });
        }

        const newToken = jwt.sign(
            { id: decoded.id, username: decoded.username, role: decoded.role, phone: decoded.phone, teacherName: decoded.teacherName, token_version: decoded.token_version, permissions: decoded.permissions },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        req.audit({ action: AUDIT_ACTIONS.REFRESH_TOKEN, entityType: decoded.role, entityId: decoded.id });
        res.json({ token: newToken });
    } catch {
        res.status(401).json({ error: 'Token expired or invalid' });
    }
});

router.post('/logout-all', authMiddleware, logoutAllLimiter, async (req, res) => {
    try {
        await authAccounts.incrementTokenVersion(req.user.id, req.user.role);
        req.audit({ action: AUDIT_ACTIONS.LOGOUT_ALL, entityType: req.user.role, entityId: req.user.id });
        res.json({ success: true, message: 'Logged out from all devices.' });
    } catch (error) {
        logger.error('Logout-all error', error);
        res.status(500).json({ error: 'Failed to logout from all devices.' });
    }
});

// ── Password Reset Rate Limiter (per IP + per username) ──
const passwordResetLimits = new Map();

function passwordResetLimiter(req, res, next) {
    const windowMs = 15 * 60 * 1000;
    const max = 3;
    const ip = req.ip || req.connection.remoteAddress;
    const username = req.body.username || '';
    const now = Date.now();

    const getOrCreate = (key) => {
        let entry = passwordResetLimits.get(key);
        if (!entry || now > entry.resetTime) {
            entry = { count: 0, resetTime: now + windowMs };
            passwordResetLimits.set(key, entry);
        }
        return entry;
    };

    const ipEntry = getOrCreate(`rst:ip:${ip}`);
    if (ipEntry.count >= max) {
        return res.status(429).json({ error: 'محاولات كثيرة جداً، يرجى المحاولة بعد 15 دقيقة' });
    }
    const userEntry = getOrCreate(`rst:user:${username}`);
    if (userEntry.count >= max) {
        return res.status(429).json({ error: 'محاولات كثيرة جداً لهذا المستخدم، يرجى المحاولة بعد 15 دقيقة' });
    }
    ipEntry.count++;
    userEntry.count++;

    if (passwordResetLimits.size > 2000) {
        for (const [k, v] of passwordResetLimits) {
            if (now > v.resetTime) passwordResetLimits.delete(k);
        }
    }
    next();
}

// ── Forgot Password ──
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
    const { username, userType } = req.body;

    if (!username || !userType) {
        return res.status(400).json({ error: 'Username and user type are required' });
    }

    const validTypes = ['admin', 'teacher', 'student', 'parent', 'chat_user'];
    if (!validTypes.includes(userType)) {
        return res.status(400).json({ error: 'Invalid user type' });
    }

    try {
        const userRecord = await authAccounts.findAccountByIdentity(username);

        if (!userRecord || !(userRecord.password || userRecord.passwordHash)) {
            return res.json({ success: true, message: 'If that user exists, a reset link has been sent.' });
        }

        const actualId = userRecord.id;

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.passwordResetToken.deleteMany({ where: { userId: actualId, userType } });
        await prisma.passwordResetToken.create({ data: { userId: actualId, userType, tokenHash, expiresAt } });

        logger.info(`Password reset token generated for ${username} (${userType})`);
        req.audit({ action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED, entityType: userType, entityId: actualId, metadata: { username } });

        const response = { success: true, message: 'If that user exists, a reset link has been sent.' };
        if (process.env.NODE_ENV === 'development') {
            response.resetToken = token;
            response.userId = actualId;
            response.userType = userType;
        }
        res.json(response);
    } catch (err) {
        logger.error('Forgot password error', err, { username, userType });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Reset Password ──
router.post('/reset-password', async (req, res) => {
    const { token, newPassword, userId, userType } = req.body;

    if (!token || !newPassword || !userId || !userType) {
        return res.status(400).json({ error: 'Token, new password, user ID, and user type are required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: { userId, userType, tokenHash, usedAt: null, expiresAt: { gte: new Date() } },
        });
        if (!resetToken) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await authAccounts.syncPassword(userId, userType, hashedPassword);
        await prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } });
        await authAccounts.incrementTokenVersion(userId, userType);

        logger.info(`Password reset completed for ${userId} (${userType})`);
        req.audit({ action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED, entityType: userType, entityId: userId });
        res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (err) {
        logger.error('Reset password error', err, { userId, userType });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = { authRouter: router };
