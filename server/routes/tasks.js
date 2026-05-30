const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Middleware to ensure DB is available
const ensureDb = (req, res, next) => {
    if (!req.db) {
        return res.status(500).json({ error: 'Database connection not available' });
    }
    next();
};

const { authMiddleware } = require('../middleware/auth');

router.use(ensureDb);
router.use(authMiddleware);

const logger = require('../utils/logger');
const { z } = require('zod');
const validate = require('../middleware/validation');
const { createTaskSchema } = require('../utils/validators');

// GET /api/tasks - Fetch all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await req.db.all('SELECT * FROM tasks WHERE userId = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(tasks);
    } catch (err) {
        logger.error('Error fetching tasks', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/tasks - Add a new task
router.post('/', validate(createTaskSchema), async (req, res) => {
    const { title, description, priority, dueDate, status } = req.body;

    const id = uuidv4();
    const taskStatus = status || 'pending';
    const taskPriority = priority || 'medium';

    try {
        await req.db.run(
            `INSERT INTO tasks (id, title, description, priority, dueDate, status, userId) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, title.trim(), description || '', taskPriority, dueDate || '', taskStatus, req.user.id]
        );

        const newTask = await req.db.get('SELECT * FROM tasks WHERE id = ?', id);
        res.status(201).json(newTask);
    } catch (err) {
        logger.error('Error adding task', err, { title });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/tasks/:id - Update task status
router.patch('/:id', validate(z.object({ status: z.enum(['pending', 'in-progress', 'completed']) })), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await req.db.run('UPDATE tasks SET status = ? WHERE id = ? AND userId = ?', [status, id, req.user.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });

        const updated = await req.db.get('SELECT * FROM tasks WHERE id = ?', id);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating task status', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await req.db.run('DELETE FROM tasks WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting task', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
