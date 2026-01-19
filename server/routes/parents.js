const express = require('express');
const router = express.Router();

// Using req.db from middleware


const logger = require('../utils/logger');

// 1. Get all parents
router.get('/', async (req, res) => {
    try {
        const parents = await req.db.all('SELECT * FROM parents ORDER BY name ASC');
        res.json(parents);
    } catch (err) {
        logger.error('Error fetching parents', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Add parent
router.post('/', async (req, res) => {
    const { id, name, phone, email } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const newId = id || uuidv4();
    try {
        await req.db.run(
            `INSERT INTO parents (id, name, phone, email) VALUES (?, ?, ?, ?)`,
            [newId, name, phone, email]
        );
        const newItem = await req.db.get('SELECT * FROM parents WHERE id = ?', [newId]);
        res.status(201).json(newItem);
    } catch (err) {
        logger.error('Error adding parent', err, { parent: name });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Update parent
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    try {
        await req.db.run(
            `UPDATE parents SET name = ?, phone = ?, email = ? WHERE id = ?`,
            [name, phone, email, id]
        );
        const updated = await req.db.get('SELECT * FROM parents WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        logger.error('Error updating parent', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Delete parent
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM parents WHERE id = ?', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        logger.error('Error deleting parent', err, { id });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { parentRouter: router };

