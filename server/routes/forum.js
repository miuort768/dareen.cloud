const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Get all forum posts (Filter out pending if not admin)
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        let query = `
            SELECT p.*, (SELECT COUNT(*) FROM forum_comments WHERE postId = p.id) as commentCount 
            FROM forum_posts p
        `;
        let params = [];

        // If not admin, only show approved posts
        if (user.role !== 'admin') {
            query += ' WHERE p.status = "approved"';
        }

        query += ' ORDER BY p.created_at DESC';

        const posts = await req.db.all(query, params);
        
        // Parse JSON lists for upvotes and downvotes
        const formattedPosts = posts.map(p => ({
            ...p,
            upvotes: JSON.parse(p.upvotes || '[]'),
            downvotes: JSON.parse(p.downvotes || '[]'),
            commentCount: p.commentCount || 0
        }));

        res.json(formattedPosts);
    } catch (err) {
        console.error('Fetch posts error:', err);
        res.status(500).json({ error: 'Failed to find posts.' });
    }
});

// Create a post
router.post('/', async (req, res) => {
    const { content } = req.body;
    const user = req.user;

    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required.' });
    }

    try {
        const newPost = {
            id: 'post_' + uuidv4(),
            authorId: user.id || user.username, // some fallback
            authorName: user.username,
            authorRole: user.role,
            content: content.trim(),
            status: user.role === 'admin' ? 'approved' : 'pending',
            upvotes: '[]',
            downvotes: '[]'
        };

        await req.db.run(
            `INSERT INTO forum_posts (id, authorId, authorName, authorRole, content, status, upvotes, downvotes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newPost.id, newPost.authorId, newPost.authorName, newPost.authorRole, newPost.content, newPost.status, newPost.upvotes, newPost.downvotes]
        );

        res.status(201).json({ 
            ...newPost, 
            upvotes: [], 
            downvotes: [],
            message: newPost.status === 'pending' ? 'تم إرسال المنشور للمراجعة.' : 'تم النشر بنجاح.' 
        });
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ error: 'Failed to create post.' });
    }
});

// Approve/Reject a post (Admin only)
router.patch('/:id/status', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    const { status } = req.body;
    try {
        await req.db.run('UPDATE forum_posts SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post (Admin only)
router.delete('/:id', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    try {
        await req.db.run('DELETE FROM forum_posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Post deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vote on a post
router.post('/:id/vote', async (req, res) => {
    const { type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    try {
        const post = await req.db.get('SELECT upvotes, downvotes FROM forum_posts WHERE id = ?', [req.params.id]);
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        let upvotes = JSON.parse(post.upvotes || '[]');
        let downvotes = JSON.parse(post.downvotes || '[]');

        // Check if the user is already in the target array
        const wasUpvoted = upvotes.includes(userId);
        const wasDownvoted = downvotes.includes(userId);

        // Remove user from both arrays to reset
        upvotes = upvotes.filter(id => id !== userId);
        downvotes = downvotes.filter(id => id !== userId);

        // If clicking same type, just leave it removed (toggle off)
        // If clicking different type, add to new one
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
        res.status(500).json({ error: err.message });
    }
});

// Report a post
router.post('/:id/report', async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const { v4: uuidv4 } = require('uuid');

    try {
        const post = await req.db.get('SELECT authorName, content FROM forum_posts WHERE id = ?', [id]);
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        // Find all admins
        const admins = await req.db.all('SELECT id FROM users WHERE role = "admin"');
        
        // Create notifications for all admins
        for (const admin of admins) {
            const notifId = 'notif_' + uuidv4();
            await req.db.run(
                `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, link) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    notifId, 
                    user.id, 
                    admin.id, 
                    user.name || user.username, 
                    'تبليغ عن محتوى', 
                    `قام ${user.name || user.username} بالتبليغ عن منشور لـ ${post.authorName}`, 
                    'warning', 
                    new Date().toISOString(), 
                    0,
                    `/forum?postId=${id}`
                ]
            );
        }

        res.json({ message: 'تم إرسال التبليغ للإدارة.' });
    } catch (err) {
        console.error('Report error:', err);
        res.status(500).json({ error: 'Failed to send report.' });
    }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await req.db.all('SELECT * FROM forum_comments WHERE postId = ? ORDER BY created_at ASC', [req.params.id]);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch comments.' });
    }
});

// Add a comment
router.post('/:id/comments', async (req, res) => {
    const { content } = req.body;
    const user = req.user;

    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required.' });

    try {
        const newComment = {
            id: 'comment_' + uuidv4(),
            postId: req.params.id,
            authorId: user.id || user.username,
            authorName: user.username,
            authorRole: user.role,
            content: content.trim()
        };

        await req.db.run(
            `INSERT INTO forum_comments (id, postId, authorId, authorName, authorRole, content) VALUES (?, ?, ?, ?, ?, ?)`,
            [newComment.id, newComment.postId, newComment.authorId, newComment.authorName, newComment.authorRole, newComment.content]
        );

        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create comment.' });
    }
});

// Delete a comment (Admin only)
router.delete('/comments/:commentId', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    try {
        await req.db.run('DELETE FROM forum_comments WHERE id = ?', [req.params.commentId]);
        res.json({ message: 'Comment deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
