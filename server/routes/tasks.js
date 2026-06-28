const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');
const { z } = require('zod');
const validate = require('../middleware/validation');
const { createTaskSchema } = require('../utils/validators');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (err) {
        logger.error('Error fetching tasks', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', validate(createTaskSchema), async (req, res) => {
    const { title, description, priority, dueDate, status } = req.body;
    const id = uuidv4();
    try {
        await prisma.task.create({
            data: {
                id,
                title: title.trim(),
                description: description || '',
                priority: priority || 'medium',
                dueDate: dueDate || '',
                status: status || 'pending',
                userId: req.user.id,
            }
        });
        const newTask = await prisma.task.findUnique({ where: { id } });
        res.status(201).json(newTask);
    } catch (err) {
        logger.error('Error adding task', err, { title });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/:id', validate(z.object({ status: z.enum(['pending', 'in-progress', 'completed']) })), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await prisma.task.updateMany({
            where: { id, userId: req.user.id },
            data: { status }
        });
        if (result.count === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
        const updated = await prisma.task.findUnique({ where: { id } });
        res.json(updated);
    } catch (err) {
        logger.error('Error updating task status', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.task.deleteMany({ where: { id, userId: req.user.id } });
        if (result.count === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting task', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
