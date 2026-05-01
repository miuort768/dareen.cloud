const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Get all blog posts
router.get('/', async (req, res) => {
    try {
        const posts = await req.db.all('SELECT * FROM blog_posts ORDER BY date DESC');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single blog post by slug
router.get('/:slug', async (req, res) => {
    try {
        const post = await req.db.get('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new blog post (Admin only)
router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const { title, slug, excerpt, content, coverImage, category, keywords, author, date } = req.body;
        const id = uuidv4();
        
        await req.db.run(
            `INSERT INTO blog_posts (id, slug, title, excerpt, content, coverImage, category, keywords, author, date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, slug, title, excerpt, content, coverImage, category, keywords, author, date || new Date().toISOString()]
        );
        
        res.status(201).json({ id, title, slug });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed: blog_posts.slug')) {
            return res.status(400).json({ error: 'الرابط المختصر (slug) موجود بالفعل، يرجى استخدام رابط مختلف.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Update blog post (Admin only)
router.put('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const { title, slug, excerpt, content, coverImage, category, keywords, author, date } = req.body;
        
        await req.db.run(
            `UPDATE blog_posts 
             SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, category = ?, keywords = ?, author = ?, date = ?
             WHERE id = ?`,
            [title, slug, excerpt, content, coverImage, category, keywords, author, date, req.params.id]
        );
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete blog post (Admin only)
router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await req.db.run('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
