const path = require('path');
const fs = require('fs');
const { prisma } = require('../utils/prisma');

module.exports = (app) => {
    app.get('/sitemap.xml', async (req, res) => {
        try {
            const baseUrl = 'https://dareen.cloud';
            const date = new Date().toISOString().split('T')[0];
            const routes = [
                { url: '/', priority: '1.0', changefreq: 'daily' },
                { url: '/courses', priority: '0.9', changefreq: 'weekly' },
                { url: '/about', priority: '0.8', changefreq: 'monthly' },
                { url: '/contact', priority: '0.8', changefreq: 'monthly' },
                { url: '/books', priority: '0.9', changefreq: 'weekly' },
                { url: '/jobs', priority: '0.5', changefreq: 'weekly' },
                { url: '/blog', priority: '0.8', changefreq: 'weekly' },
                { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
                { url: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
                { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
                { url: '/terms-of-work', priority: '0.3', changefreq: 'yearly' },
                { url: '/login', priority: '0.5', changefreq: 'monthly' }
            ];
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
            routes.forEach(route => {
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
                xml += `    <lastmod>${date}</lastmod>\n`;
                xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
                xml += `    <priority>${route.priority}</priority>\n`;
                xml += '  </url>\n';
            });
            try {
                const posts = await prisma.blogPost.findMany({
                    select: { slug: true, date: true },
                    orderBy: { date: 'desc' }
                });
                posts.forEach((post) => {
                    const postDate = post.date ? post.date.split('T')[0] : date;
                    xml += '  <url>\n';
                    xml += `    <loc>${baseUrl}/books/${post.slug}</loc>\n`;
                    xml += `    <lastmod>${postDate}</lastmod>\n`;
                    xml += '    <changefreq>monthly</changefreq>\n';
                    xml += '    <priority>0.7</priority>\n';
                    xml += '  </url>\n';
                });
            } catch (dbErr) {
                console.warn('Could not fetch blog posts for sitemap:', dbErr.message);
            }
            xml += '</urlset>';
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        } catch (err) {
            console.error('Sitemap generation error:', err);
            res.status(500).end();
        }
    });

    app.get('/robots.txt', (req, res) => {
        res.type('text/plain');
        res.send(`User-agent: *
Allow: /
Allow: /courses
Allow: /books
Allow: /books/*
Allow: /about
Allow: /contact
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /refund-policy
Allow: /terms-of-work
Allow: /jobs
Allow: /blog

Disallow: /admin
Disallow: /api/
Disallow: /login
Disallow: /chat
Disallow: /dashboard
Disallow: /settings
Disallow: /teacher-dashboard
Disallow: /student-dashboard
Disallow: /parent-dashboard
Disallow: /teacher-invoices
Disallow: /student-invoices
Disallow: /leads
Disallow: /trial-sessions
Disallow: /appointments
Disallow: /classroom
Disallow: /attendance
Disallow: /finance
Disallow: /reports
Disallow: /forum
Disallow: /tasks
Disallow: /agenda
Disallow: /announcements
Disallow: /parent-students
Disallow: /parent-announcements
Disallow: /teachers
Disallow: /students
Disallow: /evaluations
Disallow: /parents
Disallow: /monthly-closing
Disallow: /roles
Disallow: /monitoring
Disallow: /admin-jobs
Disallow: /admin-contacts
Disallow: /admin/blog
Disallow: /student-schedule

Sitemap: https://dareen.cloud/sitemap.xml
Host: https://dareen.cloud
`);
    });

    app.get('/books/:slug', async (req, res, next) => {
        try {
            const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } }).catch(() => null);
            if (post) {
                const html = fs.readFileSync(path.join(__dirname, '../../dist/index.html'), 'utf-8');
                const esc = require('escape-html');
                const absImage = post.coverImage ? (post.coverImage.startsWith('http') ? post.coverImage : `https://dareen.cloud${post.coverImage}`) : '';
                const pageUrl = `https://dareen.cloud/books/${post.slug}`;
                const fullTitle = `${post.title} | دارين السابعة للتعليم والتدريب`;
                const excerpt = esc(post.excerpt || '');
                const safeTitle = esc(fullTitle);
                const safeImage = esc(absImage);
                const safeUrl = esc(pageUrl);
                const modified = html
                    .replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
                    .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${excerpt}"`)
                    .replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${safeTitle}"`)
                    .replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${excerpt}"`)
                    .replace(/<meta property="og:image" content=".*?"/, `<meta property="og:image" content="${safeImage}"`)
                    .replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${safeUrl}"`)
                    .replace(/<meta property="og:type" content=".*?"/, `<meta property="og:type" content="article"`)
                    .replace(/<meta name="twitter:title" content=".*?"/, `<meta name="twitter:title" content="${safeTitle}"`)
                    .replace(/<meta name="twitter:description" content=".*?"/, `<meta name="twitter:description" content="${excerpt}"`)
                    .replace(/<meta name="twitter:image" content=".*?"/, `<meta name="twitter:image" content="${safeImage}"`);
                res.send(modified);
                return;
            }
        } catch (err) {
            console.error('OG injection error:', err);
        }
        next();
    });
};
