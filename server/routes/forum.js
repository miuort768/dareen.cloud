const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const user = req.user;
        let query = `SELECT p.*, (SELECT COUNT(*) FROM forum_comments WHERE postId = p.id) as commentCount FROM forum_posts p`;
        let params = [];

        if (user.role !== 'admin') {
            query += ' WHERE p.status = "approved"';
        }

        query += ' ORDER BY p.created_at DESC';

        const posts = await req.db.all(query, params);
        const formattedPosts = posts.map(p => ({
            ...p,
            upvotes: JSON.parse(p.upvotes || '[]'),
            downvotes: JSON.parse(p.downvotes || '[]'),
            commentCount: p.commentCount || 0
        }));

        res.json(formattedPosts);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch forum posts');
    }
});

router.post('/', async (req, res) => {
    const { content } = req.body;
    const user = req.user;

    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required.' });
    }

    try {
        let realName = user.name || user.username;
        const dbUser = await req.db.get('SELECT name FROM users WHERE id = ?', [user.id]) ||
                       await req.db.get('SELECT name FROM teachers WHERE id = ?', [user.id]) ||
                       await req.db.get('SELECT name FROM students WHERE id = ?', [user.id]);

        if (dbUser && dbUser.name) realName = dbUser.name;

        const newPost = {
            id: 'post_' + uuidv4(),
            authorId: user.id || user.username,
            authorName: realName,
            authorRole: user.role,
            content: content.trim(),
            status: user.role === 'admin' ? 'approved' : 'pending',
            upvotes: '[]',
            downvotes: '[]'
        };

        await req.db.run(
            `INSERT INTO forum_posts (id, authorId, authorName, authorRole, content, status, upvotes, downvotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newPost.id, newPost.authorId, newPost.authorName, newPost.authorRole, newPost.content, newPost.status, newPost.upvotes, newPost.downvotes]
        );

        res.status(201).json({
            ...newPost,
            upvotes: [],
            downvotes: [],
            message: newPost.status === 'pending' ? 'تم إرسال المنشور للمراجعة.' : 'تم النشر بنجاح.'
        });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create forum post');
    }
});

router.patch('/:id/status', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    const { status } = req.body;
    try {
        await req.db.run('UPDATE forum_posts SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update post status');
    }
});

router.delete('/:id', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    try {
        await req.db.run('DELETE FROM forum_posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Post deleted successfully.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete forum post');
    }
});

router.post('/:id/vote', async (req, res) => {
    const { type } = req.body;
    const userId = req.user.id;

    try {
        const post = await req.db.get('SELECT upvotes, downvotes FROM forum_posts WHERE id = ?', [req.params.id]);
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        let upvotes = JSON.parse(post.upvotes || '[]');
        let downvotes = JSON.parse(post.downvotes || '[]');

        const wasUpvoted = upvotes.includes(userId);
        const wasDownvoted = downvotes.includes(userId);

        upvotes = upvotes.filter(id => id !== userId);
        downvotes = downvotes.filter(id => id !== userId);

        if (type === 'upvote' && !wasUpvoted) {
            upvotes.push(userId);
        } else if (type === 'downvote' && !wasDownvoted) {
            downvotes.push(userId);
        }

        await req.db.run(
            'UPDATE forum_posts SET upvotes = ?, downvotes = ? WHERE id = ?',
            [JSON.stringify(upvotes), JSON.stringify(downvotes), req.params.id]
        );

        res.json({ upvotes, downvotes });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Vote on post');
    }
});

router.post('/:id/report', async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const post = await req.db.get('SELECT authorName, content FROM forum_posts WHERE id = ?', [id]);
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        const admins = await req.db.all('SELECT id FROM users WHERE role = "admin"');

        for (const admin of admins) {
            const notifId = 'notif_' + uuidv4();
            await req.db.run(
                `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [notifId, user.id, admin.id, user.name || user.username, 'تبليغ عن محتوى', `قام ${user.name || user.username} بالتبليغ عن منشور لـ ${post.authorName}`, 'warning', new Date().toISOString(), 0, `/forum?postId=${id}`]
            );
        }

        res.json({ message: 'تم إرسال التبليغ للإدارة.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Report post');
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await req.db.all('SELECT * FROM forum_comments WHERE postId = ? ORDER BY created_at ASC', [req.params.id]);
        res.json(comments);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch comments');
    }
});

router.post('/:id/comments', async (req, res) => {
    const { content } = req.body;
    const user = req.user;

    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required.' });

    try {
        let realName = user.name || user.username;
        const dbUser = await req.db.get('SELECT name FROM users WHERE id = ?', [user.id]) ||
                       await req.db.get('SELECT name FROM teachers WHERE id = ?', [user.id]) ||
                       await req.db.get('SELECT name FROM students WHERE id = ?', [user.id]);

        if (dbUser && dbUser.name) realName = dbUser.name;

        const newComment = {
            id: 'comment_' + uuidv4(),
            postId: req.params.id,
            authorId: user.id || user.username,
            authorName: realName,
            authorRole: user.role,
            content: content.trim()
        };

        await req.db.run(
            `INSERT INTO forum_comments (id, postId, authorId, authorName, authorRole, content) VALUES (?, ?, ?, ?, ?, ?)`,
            [newComment.id, newComment.postId, newComment.authorId, newComment.authorName, newComment.authorRole, newComment.content]
        );

        res.status(201).json(newComment);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create comment');
    }
});

router.delete('/comments/:commentId', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    try {
        await req.db.run('DELETE FROM forum_comments WHERE id = ?', [req.params.commentId]);
        res.json({ message: 'Comment deleted.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete comment');
    }
});

module.exports = router;
