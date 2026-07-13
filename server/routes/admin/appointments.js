const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const { prisma } = require('../../utils/prisma');

router.use(authMiddleware);

router.get('/completed-sessions', checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const sessions = await prisma.completedSession.findMany({ select: { id: true } });
        res.json(sessions.map(s => s.id));
    } catch (err) {
        logger.error('Error fetching completed sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/completed-sessions', checkRole(['admin', 'teacher']), async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    try {
        await prisma.completedSession.upsert({ where: { id }, update: {}, create: { id } });
        res.json({ success: true });
    } catch (err) {
        logger.error('Error marking session as completed', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/completed-sessions/reset', checkRole(['admin']), async (req, res) => {
    try {
        await prisma.completedSession.deleteMany();
        res.json({ success: true });
    } catch (err) {
        logger.error('Error resetting completed sessions', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
