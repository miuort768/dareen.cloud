const { z } = require('zod');

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blogPostSchema = z.object({
    title: z.string().min(1, 'العنوان مطلوب').max(200, 'العنوان طويل جداً'),
    slug: z.string().min(1, 'الرابط المختصر مطلوب').regex(slugRegex, 'الرابط المختصر يجب أن يكون أحرف إنجليزية وأرقام وشرطات فقط'),
    excerpt: z.string().max(500, 'الملخص طويل جداً').optional().default(''),
    content: z.string().optional().default(''),
    coverImage: z.string().max(500, 'رابط الصورة طويل جداً').optional().default(''),
    category: z.string().max(100).optional().default(''),
    keywords: z.string().max(500).optional().default(''),
    author: z.string().max(100).optional().default(''),
    date: z.string().optional(),
    contentType: z.string().max(50).optional().nullable(),
    curriculum: z.string().max(100).optional().nullable(),
    level: z.string().max(100).optional().nullable(),
    grade: z.string().max(100).optional().nullable(),
    term: z.string().max(100).optional().nullable(),
    subject: z.string().max(100).optional().nullable(),
    downloadLink: z.string().max(500).optional().nullable(),
    watchLink: z.string().max(500).optional().nullable(),
    showButtons: z.boolean().optional().default(true),
    downloadButtonText: z.string().max(100).optional().nullable(),
    watchButtonText: z.string().max(100).optional().nullable(),
    source: z.string().max(500).optional().nullable(),
    fileSize: z.string().max(50).optional().nullable(),
    // SEO fields
    seoTitle: z.string().max(200).optional().nullable(),
    seoDescription: z.string().max(500).optional().nullable(),
    ogImage: z.string().max(500).optional().nullable(),
    focusKeyword: z.string().max(200).optional().nullable(),
    readingTime: z.number().int().min(0).optional().default(0),
    canonicalUrl: z.string().max(500).optional().nullable(),
    robotsIndex: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    tags: z.string().max(1000).optional().nullable()
});

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    req.validatedBody = result.data;
    next();
};

module.exports = { blogPostSchema, validate };
