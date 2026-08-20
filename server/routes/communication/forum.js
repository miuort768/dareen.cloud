const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/prisma');

router.use(authMiddleware);

const resolveAuthorNames = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return items;
    const authorIds = [...new Set(items.map(item => item.authorId).filter(Boolean))];
    if (authorIds.length === 0) return items;

    try {
        const [users, teachers, students, parents] = await Promise.all([
            prisma.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } }),
            prisma.teacher.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } }),
            prisma.student.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } }),
            prisma.parent.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } }),
        ]);

        const nameMap = {};
        [...users, ...teachers, ...students, ...parents].forEach(u => {
            if (u.id && u.name) nameMap[u.id] = u.name;
        });

        return items.map(item => {
            let name = nameMap[item.authorId] || item.authorName;
            if (!name || name.toLowerCase() === 'a.abdullah' || /^[a-z0-9_\-.]+$/i.test(name)) {
                if (name && name.toLowerCase() === 'a.abdullah') name = 'أ. عبد الله';
                else if (item.authorRole === 'parent') name = 'ولي أمر';
                else if (item.authorRole === 'teacher') name = 'معلمة';
                else if (item.authorRole === 'student') name = 'طالب';
                else if (item.authorRole === 'admin') name = 'إدارة المنصة';
            }
            return {
                ...item,
                authorName: name || 'عضو المنصة'
            };
        });
    } catch (e) {
        logger.warn('Error resolving author names:', e);
        return items;
    }
};

router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const where = {};
        if (user.role !== 'admin') {
            where.status = 'approved';
        }
        const posts = await prisma.forumPost.findMany({
            where,
            include: { _count: { select: { comments: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const formattedPosts = await resolveAuthorNames(posts.map(p => ({
            ...p,
            created_at: p.createdAt,
            upvotes: JSON.parse(p.upvotes || '[]'),
            downvotes: JSON.parse(p.downvotes || '[]'),
            commentCount: p._count?.comments || 0,
            _count: undefined,
        })));
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
        let realName = user.name;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } })
            ?? await prisma.teacher.findUnique({ where: { id: user.id }, select: { name: true } })
            ?? await prisma.student.findUnique({ where: { id: user.id }, select: { name: true } })
            ?? await prisma.parent.findUnique({ where: { id: user.id }, select: { name: true } });
        if (dbUser && dbUser.name) {
            realName = dbUser.name;
        } else if (!realName || realName === user.username) {
            realName = (user.role === 'parent' ? 'ولي أمر' : user.role === 'teacher' ? 'معلمة' : user.role === 'admin' ? 'إدارة المنصة' : user.name || user.username);
        }

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

        await prisma.forumPost.create({ data: newPost });

        let awardedPoints = 0;
        if (user.role === 'teacher') {
            awardedPoints = 10;
            await prisma.teacher.update({
                where: { id: user.id },
                data: { points: { increment: awardedPoints } }
            });
            logger.info(`Teacher ${realName} awarded ${awardedPoints} points for forum post`);
        }

        res.status(201).json({
            ...newPost,
            upvotes: [],
            downvotes: [],
            awardedPoints,
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
        await prisma.forumPost.update({ where: { id: req.params.id }, data: { status } });
        res.json({ message: 'Status updated.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update post status');
    }
});

router.delete('/:id', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    try {
        await prisma.forumPost.delete({ where: { id: req.params.id } });
        res.json({ message: 'Post deleted successfully.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete forum post');
    }
});

router.post('/:id/vote', async (req, res) => {
    const { type } = req.body;
    const userId = req.user.id;

    try {
        const post = await prisma.forumPost.findUnique({
            where: { id: req.params.id },
            select: { upvotes: true, downvotes: true }
        });
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

        await prisma.forumPost.update({
            where: { id: req.params.id },
            data: { upvotes: JSON.stringify(upvotes), downvotes: JSON.stringify(downvotes) }
        });

        res.json({ upvotes, downvotes });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Vote on post');
    }
});

router.post('/:id/report', async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const post = await prisma.forumPost.findUnique({
            where: { id },
            select: { authorName: true, content: true }
        });
        if (!post) return res.status(404).json({ error: 'Post not found.' });

        const admins = await prisma.user.findMany({
            where: { role: 'admin' },
            select: { id: true }
        });

        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    id: 'notif_' + uuidv4(),
                    senderId: user.id,
                    receiverId: admin.id,
                    senderName: user.name || user.username,
                    title: 'تبليغ عن محتوى',
                    message: `قام ${user.name || user.username} بالتبليغ عن منشور لـ ${post.authorName}`,
                    type: 'warning',
                    time: new Date().toISOString(),
                    link: `/forum?postId=${id}`,
                }
            });
        }

        res.json({ message: 'تم إرسال التبليغ للإدارة.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Report post');
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await prisma.forumComment.findMany({
            where: { postId: req.params.id },
            orderBy: { createdAt: 'asc' }
        });
        const formattedComments = await resolveAuthorNames(comments.map(c => ({ ...c, created_at: c.createdAt })));
        res.json(formattedComments);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch comments');
    }
});

router.post('/:id/comments', async (req, res) => {
    const { content } = req.body;
    const user = req.user;

    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required.' });

    try {
        let realName = user.name;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } })
            ?? await prisma.teacher.findUnique({ where: { id: user.id }, select: { name: true } })
            ?? await prisma.student.findUnique({ where: { id: user.id }, select: { name: true } })
            ?? await prisma.parent.findUnique({ where: { id: user.id }, select: { name: true } });
        if (dbUser && dbUser.name) {
            realName = dbUser.name;
        } else if (!realName || realName === user.username) {
            realName = (user.role === 'parent' ? 'ولي أمر' : user.role === 'teacher' ? 'معلمة' : user.role === 'admin' ? 'إدارة المنصة' : user.name || user.username);
        }

        const newComment = {
            id: 'comment_' + uuidv4(),
            postId: req.params.id,
            authorId: user.id || user.username,
            authorName: realName,
            authorRole: user.role,
            content: content.trim()
        };

        await prisma.forumComment.create({ data: newComment });

        let awardedPoints = 0;
        if (user.role === 'teacher') {
            awardedPoints = 10;
            await prisma.teacher.update({
                where: { id: user.id },
                data: { points: { increment: awardedPoints } }
            });
            logger.info(`Teacher ${realName} awarded ${awardedPoints} points for forum answer`);
        }

        res.status(201).json({ ...newComment, awardedPoints });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Create comment');
    }
});

router.delete('/comments/:commentId', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });
    try {
        await prisma.forumComment.delete({ where: { id: req.params.commentId } });
        res.json({ message: 'Comment deleted.' });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete comment');
    }
});

module.exports = router;
