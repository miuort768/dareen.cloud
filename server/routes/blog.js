const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { blogPostSchema, validate } = require('./blog.validation');

const calculateReadingTime = (content) => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 150));
};

const mapPost = (post) => post ? {
    ...post,
    fileSize: post.file_size,
    showButtons: post.show_buttons === 1 || post.show_buttons === true,
    downloadButtonText: post.download_button_text,
    watchButtonText: post.watch_button_text,
    seoTitle: post.seo_title,
    seoDescription: post.seo_description,
    ogImage: post.og_image,
    focusKeyword: post.focus_keyword,
    readingTime: post.reading_time,
    canonicalUrl: post.canonical_url,
    robotsIndex: post.robots_index === 1 || post.robots_index === true,
    isFeatured: post.is_featured === 1 || post.is_featured === true,
    tags: post.tags,
    file_size: undefined,
    show_buttons: undefined,
    download_button_text: undefined,
    watch_button_text: undefined,
    seo_title: undefined,
    seo_description: undefined,
    og_image: undefined,
    focus_keyword: undefined,
    reading_time: undefined,
    canonical_url: undefined,
    robots_index: undefined,
    is_featured: undefined,
} : post;

router.get('/', async (req, res) => {
    try {
        if (req.query.all === 'true') {
            const posts = await req.db.all('SELECT * FROM blog_posts ORDER BY date DESC');
            return res.json(posts.map(mapPost));
        }
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
        const offset = (page - 1) * limit;
        const total = await req.db.get('SELECT COUNT(*) as count FROM blog_posts');
        const posts = await req.db.all('SELECT * FROM blog_posts ORDER BY date DESC LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ posts: posts.map(mapPost), total: total.count, page, totalPages: Math.ceil(total.count / limit) });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch blog posts');
    }
});

const isBot = (ua) => /bot|crawl|spider|scraper|facebook|twitter|whatsapp|google|bing|yahoo|slurp|duckduck/i.test(ua || '');

router.get('/:slug', async (req, res) => {
    try {
        if (!isBot(req.headers['user-agent'])) {
            await req.db.run('UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE slug = ?', [req.params.slug]);
        }
        const post = await req.db.get('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(mapPost(post));
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

        await req.db.run(
            `INSERT INTO blog_posts (id, slug, title, excerpt, content, coverImage, category, keywords, author, date, contentType, curriculum, level, grade, term, subject, downloadLink, watchLink, show_buttons, download_button_text, watch_button_text, source, file_size, seo_title, seo_description, og_image, focus_keyword, reading_time, canonical_url, robots_index, is_featured, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, slug, title, excerpt, content, coverImage, category, keywords, author,
             date || new Date().toISOString(),
             contentType || null, curriculum || null, level || null,
             grade || null, term || null, subject || null,
             downloadLink || null, watchLink || null,
             showButtons === false ? 0 : 1, downloadButtonText || null, watchButtonText || null,
             source || null, fileSize || null,
             seoTitle || null, seoDescription || null, ogImage || null,
             focusKeyword || null, readingTime, canonicalUrl || null,
             robotsIndex === false ? 0 : 1, isFeatured === true ? 1 : 0, tags || null]
        );

        res.status(201).json({ id, title, slug });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed: blog_posts.slug')) {
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

        await req.db.run(
            `UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, category = ?, keywords = ?, author = ?, date = ?, contentType = ?, curriculum = ?, level = ?, grade = ?, term = ?, subject = ?, downloadLink = ?, watchLink = ?, show_buttons = ?, download_button_text = ?, watch_button_text = ?, source = ?, file_size = ?, seo_title = ?, seo_description = ?, og_image = ?, focus_keyword = ?, reading_time = ?, canonical_url = ?, robots_index = ?, is_featured = ?, tags = ? WHERE id = ?`,
            [title, slug, excerpt, content, coverImage, category, keywords, author, date,
             contentType || null, curriculum || null, level || null,
             grade || null, term || null, subject || null,
             downloadLink || null, watchLink || null,
             showButtons === false ? 0 : 1, downloadButtonText || null, watchButtonText || null,
             source || null, fileSize || null,
             seoTitle || null, seoDescription || null, ogImage || null,
             focusKeyword || null, readingTime, canonicalUrl || null,
             robotsIndex === false ? 0 : 1, isFeatured === true ? 1 : 0, tags || null,
             req.params.id]
        );

        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Update blog post');
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        await req.db.run('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Delete blog post');
    }
});

// Related posts
router.get('/:slug/related', async (req, res) => {
    try {
        const post = await req.db.get('SELECT id, category, subject FROM blog_posts WHERE slug = ?', [req.params.slug]);
        if (!post) return res.json([]);
        const related = await req.db.all(
            `SELECT slug, title, excerpt, coverImage, date FROM blog_posts 
             WHERE id != ? AND (category = ? OR subject = ?) 
             ORDER BY date DESC LIMIT 3`,
            [post.id, post.category, post.subject]
        );
        res.json(related);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Fetch related posts');
    }
});

module.exports = router;
