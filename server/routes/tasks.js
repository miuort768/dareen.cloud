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

router.use(ensureDb);

const logger = require('../utils/logger');

// GET /api/tasks - Fetch all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await req.db.all('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(tasks);
    } catch (err) {
        logger.error('Error fetching tasks', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/tasks - Add a new task
router.post('/', async (req, res) => {
    const { title, description, priority, dueDate, status } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();
    const taskStatus = status || 'pending';
    const taskPriority = priority || 'medium';

    try {
        await req.db.run(
            `INSERT INTO tasks (id, title, description, priority, dueDate, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, title.trim(), description || '', taskPriority, dueDate || '', taskStatus]
        );

        const newTask = await req.db.get('SELECT * FROM tasks WHERE id = ?', id);
        res.status(201).json(newTask);
    } catch (err) {
        logger.error('Error adding task', err, { title });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/tasks/:id - Update task status
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        const result = await req.db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });

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
        await req.db.run('DELETE FROM tasks WHERE id = ?', id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting task', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
