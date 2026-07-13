const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const { prisma } = require('../../utils/prisma');

router.get('/', async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({ orderBy: { date: 'desc' } });
        const parsed = announcements.map(a => ({ ...a, isActive: a.isActive === 1 }));
        res.json(parsed);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch announcements');
    }
});

router.post('/', checkRole(['admin']), async (req, res) => {
    const { title, content, type, date, isActive } = req.body;
    try {
        const id = uuidv4();
        await prisma.announcement.create({
            data: {
                id,
                title,
                content: content || '',
                type: type || 'general',
                date: date || new Date().toISOString(),
                isActive: isActive ? 1 : 0,
            }
        });
        res.status(201).json({ success: true, id });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create announcement');
    }
});

router.put('/:id', checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { title, content, type, isActive } = req.body;
    try {
        await prisma.announcement.update({
            where: { id },
            data: { title, content, type, isActive: isActive ? 1 : 0 }
        });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update announcement');
    }
});

router.delete('/:id', checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.announcement.delete({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete announcement');
    }
});

module.exports = { announcementsRouter: router };
