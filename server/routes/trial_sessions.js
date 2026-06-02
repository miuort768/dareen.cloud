const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createTrialSessionSchema, updateTrialSessionSchema } = require('../utils/validators');

router.use(authMiddleware);

const emitTrialUpdate = (req) => {
    const io = req.app.get('socketio');
    if (io) io.to('admin_room').emit('trial_session_updated');
};

router.get('/', async (req, res) => {
    try {
        const trials = await req.db.all('SELECT * FROM trial_sessions ORDER BY created_at DESC');
        res.json(trials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = await req.db.get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM trial_sessions
        `);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', validate(createTrialSessionSchema), async (req, res) => {
    try {
        const { studentName, parentPhone, subject, teacherId, teacherName, date, time, notes } = req.body;
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        await req.db.run(
            `INSERT INTO trial_sessions (id, studentName, parentPhone, subject, teacherId, teacherName, date, time, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
            [id, studentName, parentPhone, subject, teacherId || null, teacherName || null, date, time, notes || '', createdAt]
        );
        const trial = await req.db.get('SELECT * FROM trial_sessions WHERE id = ?', [id]);
        emitTrialUpdate(req);
        res.status(201).json(trial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', validate(updateTrialSessionSchema), async (req, res) => {
    try {
        const { studentName, parentPhone, subject, teacherId, teacherName, date, time, status, notes } = req.body;
        await req.db.run(
            `UPDATE trial_sessions SET studentName = COALESCE(?, studentName), parentPhone = COALESCE(?, parentPhone), subject = COALESCE(?, subject), teacherId = COALESCE(?, teacherId), teacherName = COALESCE(?, teacherName), date = COALESCE(?, date), time = COALESCE(?, time), status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?`,
            [studentName, parentPhone, subject, teacherId, teacherName, date, time, status, notes, req.params.id]
        );
        const trial = await req.db.get('SELECT * FROM trial_sessions WHERE id = ?', [req.params.id]);
        emitTrialUpdate(req);
        res.json(trial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', checkRole(['admin']), async (req, res) => {
    try {
        await req.db.run('DELETE FROM trial_sessions WHERE id = ?', [req.params.id]);
        emitTrialUpdate(req);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/convert', checkRole(['admin']), async (req, res) => {
    try {
        const trial = await req.db.get('SELECT * FROM trial_sessions WHERE id = ?', [req.params.id]);
        if (!trial) return res.status(404).json({ error: 'Trial session not found' });

        const studentId = uuidv4();
        const now = new Date().toISOString();
        await req.db.run(
            `INSERT INTO students (id, name, parentPhone, curriculum, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [studentId, trial.studentName, trial.parentPhone, '', `منقول من جلسة مراجعة: ${trial.id}`, now]
        );

        if (trial.teacherId) {
            await req.db.run(
                `INSERT INTO enrollments (studentId, teacherId, teacher, subject, sessionsTotal, sessionsUsed) VALUES (?, ?, ?, ?, ?, ?)`,
                [studentId, trial.teacherId, trial.teacherName, trial.subject || '', 1, 1]
            );
        }

        await req.db.run('UPDATE trial_sessions SET status = ? WHERE id = ?', ['converted', trial.id]);

        const student = await req.db.get('SELECT id, name, parentPhone FROM students WHERE id = ?', [studentId]);
        res.status(201).json({ student, message: 'تم تحويل طالب المراجعة إلى طالب مقيد بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
