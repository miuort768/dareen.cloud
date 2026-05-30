const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

router.use(authMiddleware);

router.get('/my', async (req, res) => {
    try {
        let activeSessions = [];
        if (req.user.role === 'parent') {
            const children = await req.db.all('SELECT id FROM students WHERE parentPhone = ? OR parentId = ?', [req.user.phone, req.user.id]);
            if (children.length > 0) {
                const childIds = children.map(c => c.id);
                const placeholders = childIds.map(() => '?').join(',');
                activeSessions = await req.db.all(`SELECT * FROM active_sessions WHERE studentId IN (${placeholders})`, childIds);
            }
        } else if (req.user.role === 'student') {
            activeSessions = await req.db.all('SELECT * FROM active_sessions WHERE studentId = ?', req.user.id);
        } else if (req.user.role === 'teacher') {
            activeSessions = await req.db.all('SELECT * FROM active_sessions WHERE teacherId = ?', req.user.id);
        } else {
            activeSessions = await req.db.all('SELECT * FROM active_sessions');
        }
        res.json(activeSessions);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch active sessions');
    }
});

router.post('/', async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { studentId, subject } = req.body;
    try {
        await req.db.run('DELETE FROM active_sessions WHERE studentId = ? AND subject = ?', [studentId, subject]);

        const id = Date.now().toString() + '_' + crypto.randomBytes(2).toString('hex');
        await req.db.run(
            'INSERT INTO active_sessions (id, studentId, teacherId, teacherName, subject, startedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, studentId, req.user.id, req.user.teacherName || req.user.name, subject, new Date().toISOString()]
        );
        res.json({ success: true, id });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create active session');
    }
});

router.delete('/', async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { studentId, subject } = req.body;
    try {
        if (studentId && subject) {
            await req.db.run('DELETE FROM active_sessions WHERE studentId = ? AND subject = ?', [studentId, subject]);
        }
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete active session');
    }
});

module.exports = router;
