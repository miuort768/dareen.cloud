const path = require('path');
const fs = require('fs');
const { prisma } = require('../utils/prisma');

const BASE_URL = 'https://dareen.cloud';

const PUBLIC_ROUTES_META = {
    '/':                  { title: 'دارين السابعة - منصة تعليم عن بعد رائدة في الكويت والخليج', desc: 'دروس خصوصية أونلاين، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع أفضل المعلمين. احجز حصة تجريبية مجانية.', priority: '1.0', changefreq: 'daily' },
    '/courses':           { title: 'دوراتنا التعليمية | دارين السابعة', desc: 'استعرض جميع المواد والدورات المتاحة — رياضيات، علوم، عربي، إنجليزي، قرآن وأكثر لجميع المراحل الدراسية.', priority: '0.9', changefreq: 'weekly' },
    '/about':             { title: 'من نحن | دارين السابعة للتعليم والتدريب', desc: 'تعرّف على منصة دارين السابعة الرائدة في تعليم المناهج الخليجية عن بعد في الكويت والسعودية وقطر والإمارات وعمان.', priority: '0.8', changefreq: 'monthly' },
    '/contact':           { title: 'تواصل معنا | دارين السابعة', desc: 'تواصل مع فريق دارين السابعة عبر الواتساب لحجز حصة تجريبية مجانية أو الاستفسار عن خدماتنا.', priority: '0.8', changefreq: 'monthly' },
    '/jobs':              { title: 'وظائف معلمين | دارين السابعة', desc: 'انضم إلى فريق دارين السابعة — فرص عمل للمعلمين والمعلمات المتميزين في التدريس أون لاين.', priority: '0.6', changefreq: 'weekly' },
    '/books':             { title: 'المدونة والموارد التعليمية | دارين السابعة', desc: 'مقالات تعليمية، نصائح دراسية، وموارد مفيدة للطلاب وأولياء الأمور في منهاج الخليج.', priority: '0.9', changefreq: 'weekly' },
    '/blog':              { title: 'المدونة | دارين السابعة', desc: 'أحدث المقالات والموارد التعليمية من دارين السابعة للتعليم والتدريب.', priority: '0.8', changefreq: 'weekly' },
    '/privacy-policy':    { title: 'سياسة الخصوصية | دارين السابعة', desc: 'اقرأ سياسة الخصوصية الخاصة بمنصة دارين السابعة.', priority: '0.2', changefreq: 'yearly' },
    '/refund-policy':     { title: 'سياسة الاسترداد | دارين السابعة', desc: 'اطلع على سياسة الاسترداد والاسترجاع في منصة دارين السابعة.', priority: '0.2', changefreq: 'yearly' },
    '/terms-of-service':  { title: 'شروط الاستخدام | دارين السابعة', desc: 'اطلع على شروط وأحكام استخدام منصة دارين السابعة.', priority: '0.2', changefreq: 'yearly' },
    '/terms-of-work':     { title: 'شروط العمل | دارين السابعة', desc: 'اطلع على شروط وأحكام العمل في منصة دارين السابعة.', priority: '0.2', changefreq: 'yearly' },
};

const BOT_UA = /googlebot|bingbot|yandexbot|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|applebot|baiduspider|duckduckbot|semrushbot|ahrefsbot|msnbot|rogerbot|pinterestbot|redditbot|w3c_validator/i;

function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function injectOG(html, { title, desc, image, url, type = 'website' }) {
    const absImg = image && image.startsWith('http') ? image : `${BASE_URL}${image || '/dareen_logo_new.jpg'}`;
    return html
        .replace(/(<title>).*?(<\/title>)/,                             `$1${escHtml(title)}$2`)
        .replace(/(<meta name="description" content=")[^"]*(")/,        `$1${escHtml(desc)}$2`)
        .replace(/(<meta property="og:title" content=")[^"]*(")/,       `$1${escHtml(title)}$2`)
        .replace(/(<meta property="og:description" content=")[^"]*(")/,`$1${escHtml(desc)}$2`)
        .replace(/(<meta property="og:image" content=")[^"]*(")/,       `$1${escHtml(absImg)}$2`)
        .replace(/(<meta property="og:url" content=")[^"]*(")/,         `$1${escHtml(url || BASE_URL + '/')}$2`)
        .replace(/(<meta property="og:type" content=")[^"]*(")/,        `$1${type}$2`)
        .replace(/(<meta name="twitter:title" content=")[^"]*(")/,      `$1${escHtml(title)}$2`)
        .replace(/(<meta name="twitter:description" content=")[^"]*(")/,`$1${escHtml(desc)}$2`)
        .replace(/(<meta name="twitter:image" content=")[^"]*(")/,      `$1${escHtml(absImg)}$2`);
}

let _indexCache = null, _indexCachedAt = 0;
function getIndex() {
    const now = Date.now();
    if (_indexCache && (process.env.NODE_ENV !== 'production' || now - _indexCachedAt < 60000)) return _indexCache;
    try { _indexCache = fs.readFileSync(path.join(__dirname, '../../dist/index.html'), 'utf-8'); _indexCachedAt = now; } catch (_) { _indexCache = '<!doctype html><html lang="ar"><body></body></html>'; }
    return _indexCache;
}

module.exports = (app) => {

    // ── 1. Sitemap Index ──────────────────────────────────────────────────────
    app.get('/sitemap-index.xml', (req, res) => {
        const today = new Date().toISOString().split('T')[0];
        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=3600');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE_URL}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-blog.xml</loc><lastmod>${today}</lastmod></sitemap>
</sitemapindex>`);
    });

    // ── 2. Main Sitemap (static public pages + hreflang) ─────────────────────
    app.get('/sitemap.xml', (req, res) => {
        const today = new Date().toISOString().split('T')[0];
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
        Object.entries(PUBLIC_ROUTES_META).forEach(([route, meta]) => {
            const loc = `${BASE_URL}${route}`;
            xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${meta.changefreq}</changefreq>\n    <priority>${meta.priority}</priority>\n    <xhtml:link rel="alternate" hreflang="ar"    href="${loc}"/>\n    <xhtml:link rel="alternate" hreflang="ar-KW" href="${loc}"/>\n    <xhtml:link rel="alternate" hreflang="ar-SA" href="${loc}"/>\n    <xhtml:link rel="alternate" hreflang="ar-QA" href="${loc}"/>\n    <xhtml:link rel="alternate" hreflang="ar-AE" href="${loc}"/>\n    <xhtml:link rel="alternate" hreflang="ar-OM" href="${loc}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>\n  </url>\n`;
        });
        xml += '</urlset>';
        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    });

    // ── 3. Blog Sitemap (dynamic — real lastmod from DB) ──────────────────────
    app.get('/sitemap-blog.xml', async (req, res) => {
        try {
            const posts = await prisma.blogPost.findMany({
                select: { slug: true, date: true, updatedAt: true },
                orderBy: { date: 'desc' }
            });
            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
            posts.forEach(post => {
                const raw = post.updatedAt || post.date;
                const lastmod = raw ? new Date(raw).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                xml += `  <url>\n    <loc>${BASE_URL}/books/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
            });
            xml += '</urlset>';
            res.header('Content-Type', 'application/xml');
            res.header('Cache-Control', 'public, max-age=1800');
            res.send(xml);
        } catch (err) {
            console.error('Blog sitemap error:', err);
            res.status(500).end();
        }
    });

    // ── 4. robots.txt ─────────────────────────────────────────────────────────
    app.get('/robots.txt', (req, res) => {
        res.type('text/plain');
        res.header('Cache-Control', 'public, max-age=86400');
        res.send(`# دارين السابعة — robots.txt
User-agent: *
Allow: /
Allow: /courses
Allow: /books
Allow: /books/
Allow: /about
Allow: /contact
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /refund-policy
Allow: /terms-of-work
Allow: /jobs
Allow: /blog
Allow: /sitemap.xml
Allow: /sitemap-index.xml
Allow: /sitemap-blog.xml

Disallow: /api/
Disallow: /admin
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
Disallow: /uploads/

User-agent: SemrushBot
Crawl-delay: 10

User-agent: AhrefsBot
Crawl-delay: 10

User-agent: DotBot
Disallow: /

Sitemap: ${BASE_URL}/sitemap-index.xml
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-blog.xml
`);
    });

    // ── 5. OG injection for static public pages (bots only) ───────────────────
    Object.entries(PUBLIC_ROUTES_META).forEach(([route, meta]) => {
        app.get(route, (req, res, next) => {
            if (!BOT_UA.test(req.headers['user-agent'] || '')) return next();
            const html = injectOG(getIndex(), { title: meta.title, desc: meta.desc, image: '/dareen_logo_new.jpg', url: `${BASE_URL}${route}` });
            res.header('Content-Type', 'text/html; charset=utf-8');
            res.header('Cache-Control', 'public, max-age=300');
            res.send(html);
        });
    });

    // ── 6. Blog post OG injection (real title/desc/image from DB) ────────────
    app.get('/books/:slug', async (req, res, next) => {
        try {
            const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } }).catch(() => null);
            if (post) {
                const html = injectOG(getIndex(), {
                    title: `${post.title} | دارين السابعة للتعليم والتدريب`,
                    desc:  post.excerpt || 'مقال تعليمي من دارين السابعة للتعليم والتدريب',
                    image: post.coverImage || '/dareen_logo_new.jpg',
                    url:   `${BASE_URL}/books/${post.slug}`,
                    type:  'article'
                });
                res.header('Content-Type', 'text/html; charset=utf-8');
                res.header('Cache-Control', 'public, max-age=300');
                return res.send(html);
            }
        } catch (err) {
            console.error('Blog OG injection error:', err);
        }
        next();
    });
};

