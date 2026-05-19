const express = require('express');
const router = express.Router();

router.get('/my', async (req, res) => {
    try {
        let activeSessions = [];
        if (req.user.role === 'parent') {
            // Find children by parentPhone to match the logic in parents.js
            const children = await req.db.all('SELECT id FROM students WHERE parentPhone = ? OR parentId = ?', [req.user.phone, req.user.id]);
            console.log(`[DEBUG] Parent ${req.user.id} (${req.user.phone}) has children:`, children.map(c => c.id));
            if (children.length > 0) {
                const childIds = children.map(c => c.id);
                const placeholders = childIds.map(() => '?').join(',');
                activeSessions = await req.db.all(`SELECT * FROM active_sessions WHERE studentId IN (${placeholders})`, childIds);
                console.log(`[DEBUG] Active sessions for children:`, activeSessions.length);
            }
        } else if (req.user.role === 'student') {
            activeSessions = await req.db.all(`SELECT * FROM active_sessions WHERE studentId = ?`, req.user.id);
        } else if (req.user.role === 'teacher') {
            activeSessions = await req.db.all(`SELECT * FROM active_sessions WHERE teacherId = ?`, req.user.id);
        } else {
            activeSessions = await req.db.all(`SELECT * FROM active_sessions`);
        }
        res.json(activeSessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/', async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.status(403).json({error: 'Forbidden'});
    const { studentId, subject } = req.body;
    try {
        // delete any existing session for this student/subject
        await req.db.run(`DELETE FROM active_sessions WHERE studentId = ? AND subject = ?`, [studentId, subject]);

        const id = Date.now().toString() + '_' + require('crypto').randomBytes(2).toString('hex');
        await req.db.run(
            `INSERT INTO active_sessions (id, studentId, teacherId, teacherName, subject, startedAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, studentId, req.user.id, req.user.teacherName || req.user.name, subject, new Date().toISOString()]
        );
        res.json({ success: true, id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.delete('/', async (req, res) => {
    const { studentId, subject } = req.body;
    try {
        if(studentId && subject) {
            await req.db.run(`DELETE FROM active_sessions WHERE studentId = ? AND subject = ?`, [studentId, subject]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
