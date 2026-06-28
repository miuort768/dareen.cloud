const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { authMiddleware, checkRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const ResponseHandler = require('../utils/responseHandler');
const { prisma } = require('../utils/prisma');
const { createRateLimiter } = require('../middleware/rateLimiter');

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
        let userData = null;
        let role = 'admin';
        let teacherName = null;

        userData = await prisma.user.findUnique({ where: { username } });
        role = 'admin';

        if (!userData) {
            userData = await prisma.teacher.findFirst({
                where: { OR: [{ username }, { email: username }], deletedAt: null }
            });
            if (userData) { role = 'teacher'; teacherName = userData.name; }
        }

        if (!userData) {
            userData = await prisma.chatProfile.findUnique({ where: { username } });
            if (userData) role = 'chat_user';
        }

        if (!userData) {
            userData = await prisma.parent.findFirst({
                where: { OR: [{ username }, { phone: username }], deletedAt: null }
            });
            if (userData) role = 'parent';
        }

        if (!userData) {
            userData = await prisma.student.findFirst({
                where: { OR: [{ username }, { studentPhone: username }], deletedAt: null }
            });
            if (userData) role = 'student';
        }

        if (!userData) {
            logger.warn(`Login failed: User '${username}' not found`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        let isValidPassword = false;
        if (userData.password && userData.password.startsWith('$2b$')) {
            isValidPassword = await bcrypt.compare(password, userData.password);
        }

        if (!isValidPassword) {
            logger.warn(`Login failed: Invalid password for user '${username}'`);
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
            id: userData.id,
            username: userData.username,
            role: role,
            phone: userData.phone || userData.studentPhone || null,
            teacherName: teacherName,
            token_version: userData.tokenVersion || userData.token_version || 1,
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
        logger.info(`User logged in: ${username} (${role})`);

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

        const tvField = userData.tokenVersion ?? userData.token_version;
        if (decoded.token_version !== undefined && tvField !== undefined && tvField !== decoded.token_version) {
            return res.json({ valid: false, error: 'Session revoked' });
        }

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
        const newToken = jwt.sign(
            { id: decoded.id, username: decoded.username, role: decoded.role, phone: decoded.phone, teacherName: decoded.teacherName, token_version: decoded.token_version, permissions: decoded.permissions },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        res.json({ token: newToken });
    } catch {
        res.status(401).json({ error: 'Token expired or invalid' });
    }
});

router.post('/logout-all', authMiddleware, logoutAllLimiter, async (req, res) => {
    try {
        const roleFieldMap = {
            admin: 'user', teacher: 'teacher', parent: 'parent', student: 'student'
        };
        const modelName = roleFieldMap[req.user.role];
        if (modelName) {
            await prisma[modelName].update({
                where: { id: req.user.id },
                data: { tokenVersion: { increment: 1 } }
            });
        } else if (req.user.role === 'chat_user') {
            await prisma.chatProfile.update({
                where: { id: req.user.id },
                data: { password: req.user.password }
            });
        }
        res.json({ success: true, message: 'Logged out from all devices.' });
    } catch (error) {
        logger.error('Logout-all error', error);
        res.status(500).json({ error: 'Failed to logout from all devices.' });
    }
});

module.exports = { authRouter: router };
