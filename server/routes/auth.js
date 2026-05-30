const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const rateLimit = require('express-rate-limit');
const { authMiddleware, checkRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const ResponseHandler = require('../utils/responseHandler');
const { safeTable } = require('../utils/asyncHandler');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'محاولات دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة' }
});

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: 'محاولات تحقق كثيرة جداً، يرجى المحاولة بعد 15 دقيقة' }
});

const logoutAllLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'محاولات تسجيل خروج كثيرة جداً، يرجى المحاولة بعد ساعة' }
});

router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        let userData = await req.db.get(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        let role = 'admin';
        let teacherName = null;

        if (!userData) {
            userData = await req.db.get(
                'SELECT * FROM teachers WHERE username = ? OR email = ?',
                [username, username]
            );
            if (userData) {
                role = 'teacher';
                teacherName = userData.name;
            }
        }

        // Try Chat Profiles
        if (!userData) {
            userData = await req.db.get(
                'SELECT * FROM chat_profiles WHERE username = ?',
                [username]
            );
            if (userData) {
                role = 'chat_user';
            }
        }

        // Try Parents
        if (!userData) {
            userData = await req.db.get(
                'SELECT * FROM parents WHERE username = ? OR phone = ?',
                [username, username]
            );
            if (userData) {
                role = 'parent';
            }
        }

        // Try Students
        if (!userData) {
            userData = await req.db.get(
                'SELECT * FROM students WHERE username = ? OR studentPhone = ?',
                [username, username]
            );
            if (userData) {
                role = 'student';
            }
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

        // Fix: If logged in as a System User (from 'users' table) but role is 'teacher',
        // try to find the linked Teacher entity to get the correct ID for data filtering.
        let parsedPermissions = [];
        if (userData.permissions) {
            if (typeof userData.permissions === 'string') {
                try {
                    parsedPermissions = JSON.parse(userData.permissions);
                } catch (e) {
                    logger.error('Failed to parse permissions JSON', e, { userId: userData.id });
                    parsedPermissions = [];
                }
            } else if (Array.isArray(userData.permissions)) {
                parsedPermissions = userData.permissions;
            }
        }

        let tokenPayload = {
            id: userData.id,
            username: userData.username,
            role: role,
            phone: userData.phone || null,
            teacherName: teacherName,
            token_version: userData.token_version || 1,
            permissions: parsedPermissions
        };

        // Default permissions for parents
        if (role === 'parent') {
            tokenPayload.permissions = ['parent_dashboard', 'parent_students', 'parent_attendance', 'chat'];
        }

        // Default permissions for students
        if (role === 'student') {
            tokenPayload.permissions = ['student_dashboard', 'chat'];
        }

        if (role === 'teacher' && !teacherName) {
            // User found in 'users' table, not 'teachers'. Let's see if we can link them.
            const linkedTeacher = await req.db.get('SELECT * FROM teachers WHERE username = ?', [username]);
            if (linkedTeacher) {
                // Found a matching teacher! Use their ID so the frontend shows their data.
                tokenPayload.id = linkedTeacher.id;
                tokenPayload.teacherName = linkedTeacher.name;
                teacherName = linkedTeacher.name; // Update for response
                // We keep the permissions from the System User if they exist, or defaults
            }
        }

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

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
                    : (role === 'teacher'
                        ? ['dashboard', 'attendance', 'schedule', 'appointments', 'tasks', 'chat']
                        : (role === 'parent'
                            ? ['parent_dashboard', 'chat']
                            : (role === 'student'
                                ? ['student_dashboard', 'chat']
                                : ['chat'])))
            }
        });
    } catch (error) {
        logger.error('Login error', error, { username });
        ResponseHandler.serverError(res, error, 'Login error');
    }
});

/**
 * POST /auth/verify
 * Verify if token is still valid
 */
router.post('/verify', verifyLimiter, async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data from DB
        let userData = null;
        if (decoded.role === 'admin') {
            userData = await req.db.get('SELECT id, name, username, role, permissions, token_version FROM users WHERE id = ?', [decoded.id]);
        } else if (decoded.role === 'teacher') {
            userData = await req.db.get('SELECT id, name, username, token_version FROM teachers WHERE id = ?', [decoded.id]);
            if (userData) {
                userData.role = 'teacher';
                userData.teacherName = userData.name; // Crucial for data filtering
            }
        } else if (decoded.role === 'chat_user') {
            userData = await req.db.get('SELECT id, name, username FROM chat_profiles WHERE id = ?', [decoded.id]);
            if (userData) userData.role = 'chat_user';
        } else if (decoded.role === 'parent') {
            userData = await req.db.get('SELECT id, name, username, phone, token_version FROM parents WHERE id = ?', [decoded.id]);
            if (userData) userData.role = 'parent';
        } else if (decoded.role === 'student') {
            userData = await req.db.get('SELECT id, name, username, studentPhone, token_version FROM students WHERE id = ?', [decoded.id]);
            if (userData) userData.role = 'student';
        }

        if (!userData) {
            return res.json({ valid: false });
        }

        // Enforce token revocation check on token verification
        if (decoded.token_version !== undefined && userData.token_version !== undefined && userData.token_version !== decoded.token_version) {
            return res.json({ valid: false, error: 'Session revoked' });
        }

        // Add role-based default permissions if not present (crucial for teachers/chat users on reload)
        if (!userData.permissions || (Array.isArray(userData.permissions) && userData.permissions.length === 0)) {
            if (userData.role === 'admin') {
                userData.permissions = ['*'];
            } else if (userData.role === 'teacher') {
                userData.permissions = ['dashboard', 'attendance', 'schedule', 'appointments', 'tasks', 'chat'];
            } else if (userData.role === 'chat_user') {
                userData.permissions = ['chat'];
            } else if (userData.role === 'parent') {
                userData.permissions = ['parent_dashboard', 'chat'];
            } else if (userData.role === 'student') {
                userData.permissions = ['student_dashboard', 'chat'];
            }
        }

        // Parse permissions if string safely
        if (userData.permissions && typeof userData.permissions === 'string') {
            try {
                userData.permissions = JSON.parse(userData.permissions);
            } catch (e) {
                logger.error('Failed to parse permissions string in verify', e, { userId: userData.id });
                userData.permissions = [];
            }
        }

        res.json({ valid: true, user: userData });
    } catch (error) {
        res.json({ valid: false });
    }
});

/**
 * POST /auth/logout-all
 * Invalidate all active sessions for this user
 */
router.post('/logout-all', authMiddleware, logoutAllLimiter, async (req, res) => {
    try {
        const table = safeTable(req.user.role);
        await req.db.run(`UPDATE ${table} SET token_version = token_version + 1 WHERE id = ?`, [req.user.id]);
        res.json({ success: true, message: 'Logged out from all devices.' });
    } catch (error) {
        logger.error('Logout-all error', error);
        res.status(500).json({ error: 'Failed to logout from all devices.' });
    }
});

module.exports = { authRouter: router };
