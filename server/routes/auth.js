const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const rateLimit = require('express-rate-limit');

const router = express.Router();
const logger = require('../utils/logger');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'محاولات دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة' }
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
                'SELECT * FROM teachers WHERE username = ?',
                [username]
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

        if (!userData) {
            logger.warn(`Login failed: User '${username}' not found`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        let isValidPassword = false;
        if (userData.password.startsWith('$2b$')) {
            isValidPassword = await bcrypt.compare(password, userData.password);
        } else {
            isValidPassword = password === userData.password;
        }

        if (!isValidPassword) {
            logger.warn(`Login failed: Invalid password for user '${username}'`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Fix: If logged in as a System User (from 'users' table) but role is 'teacher',
        // try to find the linked Teacher entity to get the correct ID for data filtering.
        let tokenPayload = {
            id: userData.id,
            username: userData.username,
            role: role,
            teacherName: teacherName,
            permissions: userData.permissions ? (typeof userData.permissions === 'string' ? JSON.parse(userData.permissions) : userData.permissions) : []
        };

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
                id: tokenPayload.id, // Ensure frontend gets the "effective" ID
                role: role,
                teacherName: teacherName || (role === 'teacher' ? finalUserData.name : null),
                permissions: role === 'admin'
                    ? (finalUserData.permissions ? (typeof finalUserData.permissions === 'string' ? JSON.parse(finalUserData.permissions) : finalUserData.permissions) : ['*'])
                    : (role === 'teacher'
                        ? ['dashboard', 'attendance', 'schedule', 'appointments', 'tasks', 'chat']
                        : ['chat']) // Chat users only see chat
            }
        });
    } catch (error) {
        logger.error('Login error', error, { username });
        res.status(500).json({ error: 'Server error during authentication' });
    }
});

/**
 * POST /auth/verify
 * Verify if token is still valid
 */
router.post('/verify', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data from DB
        let userData = null;
        if (decoded.role === 'admin') {
            userData = await req.db.get('SELECT id, name, username, role, permissions FROM users WHERE id = ?', [decoded.id]);
        } else if (decoded.role === 'teacher') {
            userData = await req.db.get('SELECT id, name, username FROM teachers WHERE id = ?', [decoded.id]);
            if (userData) userData.role = 'teacher';
        } else if (decoded.role === 'chat_user') {
            userData = await req.db.get('SELECT id, name, username FROM chat_profiles WHERE id = ?', [decoded.id]);
            if (userData) userData.role = 'chat_user';
        }

        if (!userData) {
            return res.json({ valid: true, user: decoded }); // Fallback to token data
        }

        // Parse permissions if string
        if (userData.permissions && typeof userData.permissions === 'string') {
            userData.permissions = JSON.parse(userData.permissions);
        }

        res.json({ valid: true, user: userData });
    } catch (error) {
        res.json({ valid: false });
    }
});

module.exports = { authRouter: router };

