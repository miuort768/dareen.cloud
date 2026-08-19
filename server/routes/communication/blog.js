const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { blogPostSchema, validate } = require('./blog.validation');
const cache = require('../../utils/cache');
const { prisma } = require('../../utils/prisma');

const calculateReadingTime = (content) => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 150));
};

const mapPost = (post) => post ? {
    ...post,
    showButtons: post.showButtons === 1 || post.showButtons === true,
    robotsIndex: post.robotsIndex === 1 || post.robotsIndex === true,
    isFeatured: post.isFeatured === 1 || post.isFeatured === true,
} : post;

router.get('/', async (req, res) => {
    try {
        if (req.query.all === 'true') {
            const posts = await prisma.blogPost.findMany({ orderBy: { date: 'desc' } });
            return res.json(posts.map(mapPost));
        }
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
        const cacheKey = `blog:list:${page}:${limit}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);
        const offset = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({ orderBy: { date: 'desc' }, skip: offset, take: limit }),
            prisma.blogPost.count()
        ]);
        const result = { posts: posts.map(mapPost), total, page, totalPages: Math.ceil(total / limit) };
        cache.set(cacheKey, result, 300000);
        res.json(result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch blog posts');
    }
});

const isBot = (ua) => /bot|crawl|spider|scraper|facebook|twitter|whatsapp|google|bing|yahoo|slurp|duckduck/i.test(ua || '');

router.get('/:slug', async (req, res) => {
    try {
        const cacheKey = `blog:post:${req.params.slug}`;
        if (isBot(req.headers['user-agent'])) {
            const cached = cache.get(cacheKey);
            if (cached) return res.json(cached);
        }
        if (!isBot(req.headers['user-agent'])) {
            await prisma.blogPost.update({
                where: { slug: req.params.slug },
                data: { views: { increment: 1 } }
            });
        }
        const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        const result = mapPost(post);
        cache.set(cacheKey, result, 300000);
        res.json(result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch blog post');
    }
});

router.post('/', authMiddleware, checkRole(['admin']), validate(blogPostSchema), async (req, res) => {
    try {
        const {
            title, slug, excerpt, content, coverImage, category, keywords, author, date,
            contentType, curriculum, level, grade, term, subject, downloadLink, watchLink,
            showButtons, downloadButtonText, watchButtonText,
            source, fileSize,
            seoTitle, seoDescription, ogImage, focusKeyword, canonicalUrl, robotsIndex, isFeatured, tags
        } = req.validatedBody;
        const id = uuidv4();
        const readingTime = calculateReadingTime(content);

        await prisma.blogPost.create({
            data: {
                id, slug, title,
                excerpt: excerpt || '',
                content: content || '',
                coverImage: coverImage || '',
                category: category || '',
                keywords: keywords || '',
                author: author || '',
                date: date || new Date().toISOString(),
                contentType: contentType || '',
                curriculum: curriculum || '',
                level: level || '',
                grade: grade || '',
                term: term || '',
                subject: subject || '',
                downloadLink: downloadLink || '',
                watchLink: watchLink || '',
                showButtons: showButtons === false ? 0 : 1,
                downloadButtonText: downloadButtonText || '',
                watchButtonText: watchButtonText || '',
                source: source || '',
                fileSize: fileSize || '',
                seoTitle: seoTitle || '',
                seoDescription: seoDescription || '',
                ogImage: ogImage || '',
                focusKeyword: focusKeyword || '',
                readingTime,
                canonicalUrl: canonicalUrl || '',
                robotsIndex: robotsIndex === false ? 0 : 1,
                isFeatured: isFeatured === true ? 1 : 0,
                tags: tags || '',
            }
        });

        cache.delPattern('blog:list:');
        res.status(201).json({ id, title, slug });
    } catch (err) {
        if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
            return res.status(400).json({ error: 'الرابط المختصر (slug) موجود بالفعل، يرجى استخدام رابط مختلف.' });
        }
        ResponseHandler.serverError(res, err, 'Create blog post');
    }
});

router.put('/:id', authMiddleware, checkRole(['admin']), validate(blogPostSchema), async (req, res) => {
    try {
        const {
            title, slug, excerpt, content, coverImage, category, keywords, author, date,
            contentType, curriculum, level, grade, term, subject, downloadLink, watchLink,
            showButtons, downloadButtonText, watchButtonText,
            source, fileSize,
            seoTitle, seoDescription, ogImage, focusKeyword, canonicalUrl, robotsIndex, isFeatured, tags
        } = req.validatedBody;
        const readingTime = calculateReadingTime(content);

        await prisma.blogPost.update({
            where: { id: req.params.id },
            data: {
                title, slug, excerpt: excerpt || '', content: content || '',
                coverImage: coverImage || '', category: category || '',
                keywords: keywords || '', author: author || '', date,
                contentType: contentType || '', curriculum: curriculum || '',
                level: level || '', grade: grade || '', term: term || '',
                subject: subject || '', downloadLink: downloadLink || '',
                watchLink: watchLink || '',
                showButtons: showButtons === false ? 0 : 1,
                downloadButtonText: downloadButtonText || '',
                watchButtonText: watchButtonText || '',
                source: source || '', fileSize: fileSize || '',
                seoTitle: seoTitle || '', seoDescription: seoDescription || '',
                ogImage: ogImage || '', focusKeyword: focusKeyword || '',
                readingTime, canonicalUrl: canonicalUrl || '',
                robotsIndex: robotsIndex === false ? 0 : 1,
                isFeatured: isFeatured === true ? 1 : 0,
                tags: tags || '',
            }
        });

        cache.delPattern('blog:');
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update blog post');
    }
});

router.delete('/all', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const result = await prisma.blogPost.deleteMany({});
        cache.delPattern('blog:');
        res.json({ success: true, count: result.count });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete all blog posts');
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await prisma.blogPost.delete({ where: { id: req.params.id } });
        cache.delPattern('blog:');
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete blog post');
    }
});

router.get('/:slug/related', async (req, res) => {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug: req.params.slug },
            select: { id: true, category: true, subject: true }
        });
        if (!post) return res.json([]);
        const cacheKey = `blog:related:${req.params.slug}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);
        const related = await prisma.blogPost.findMany({
            where: {
                id: { not: post.id },
                OR: [
                    { category: post.category },
                    { subject: post.subject }
                ]
            },
            select: { slug: true, title: true, excerpt: true, coverImage: true, date: true },
            orderBy: { date: 'desc' },
            take: 3
        });
        cache.set(cacheKey, related, 300000);
        res.json(related);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch related posts');
    }
});

module.exports = router;
