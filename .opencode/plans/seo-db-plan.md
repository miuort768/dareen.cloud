# خطة تطوير SEO + قاعدة البيانات (متكاملة)

## تحليل الوضع الحالي

### ✅ الموجود فعلاً (لا يحتاج تغيير)
| البند | الحالة |
|-------|--------|
| Prerender.io للـ crawling | مكوّن في السيرفر مع 25+ crawler agent |
| Meta Tags ديناميكية لكل الصفحات العامة | SEO.tsx يُستخدم في جميع الصفحات الـ 12 العامة |
| Structured Data | WebSite, EducationalOrganization, Course, FAQ, Article, BreadcrumbList, ContactPage, AboutPage, CollectionPage |
| Article Schema في BlogPost | كامل مع headline, author, publisher, datePublished |
| Breadcrumb Schema | ديناميكي عبر prop في SEO.tsx |
| Code Splitting | Lazy loading + manual chunks |
| Image Optimization | ViteImageOptimizer (WebP/AVIF) |
| Caching | 1y للملفات الثابتة |
| Canonical URLs | في كل الصفحات |
| 404 page | موجودة مع noindex |

### ❌ المفقود — يحتاج تنفيذ
| البند | الأولوية | يتطلب DB؟ |
|-------|---------|-----------|
| Sitemap.xml ديناميكي | 🔴 عالية | لا |
| Robots.txt | 🔴 عالية | لا |
| حقول SEO في blog_posts | 🔴 عالية | **نعم** |
| Reading Time للمقالات | 🟡 متوسطة | لا (يحسب من content) |
| Related Posts | 🟡 متوسطة | **نعم** (tags/categories) |
| OG Image لـ Privacy + Terms | 🟢 منخفضة | لا |
| RSS Feed | 🟢 منخفضة | لا |

---

## 1. الملفات الأساسية (Sitemap + Robots)

### Robots.txt
**مسار:** `public/robots.txt`
**ملاحظات:** ملف ثابت — لا يحتاج Route

```
User-agent: *
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

Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /chat
Disallow: /dashboard
Disallow: /teacher-dashboard
Disallow: /student-dashboard
Disallow: /parent-dashboard
Disallow: /settings
Disallow: /teacher-invoices
Disallow: /student-invoices
Disallow: /leads
Disallow: /trial-sessions
Disallow: /appointments
Disallow: /classroom
Disallow: /attendance

Sitemap: https://dareen.cloud/sitemap.xml
Host: https://dareen.cloud
```

### Sitemap.xml
**مسار:** إضافة Route في `server/index.js` — يُنشئ sitemap ديناميكيًا من API.

```js
// Route جديد في server/index.js (قبل catch-all)
app.get('/sitemap.xml', async (req, res) => {
    const db = await getDb();
    const posts = await db.all('SELECT slug, date FROM blog_posts ORDER BY date DESC');
    
    const urls = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/courses', priority: '0.9', changefreq: 'weekly' },
        { loc: '/books', priority: '0.9', changefreq: 'daily' },
        { loc: '/about', priority: '0.6', changefreq: 'monthly' },
        { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
        { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
        { loc: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
        { loc: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
        { loc: '/terms-of-work', priority: '0.3', changefreq: 'yearly' },
        { loc: '/jobs', priority: '0.5', changefreq: 'weekly' },
        ...posts.map(p => ({
            loc: `/books/${p.slug}`,
            priority: '0.8',
            changefreq: 'monthly',
            lastmod: p.date
        }))
    ];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `
    <url>
        <loc>https://dareen.cloud${u.loc}</loc>
        <priority>${u.priority}</priority>
        <changefreq>${u.changefreq}</changefreq>
        ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    </url>`).join('')}
</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
});
```

---

## 2. حقول SEO في قاعدة البيانات

### التعديل على جدول blog_posts (عبر Prisma أو ALTER TABLE)

```sql
ALTER TABLE blog_posts ADD COLUMN seo_title TEXT;
ALTER TABLE blog_posts ADD COLUMN seo_description TEXT;
ALTER TABLE blog_posts ADD COLUMN og_image TEXT;
ALTER TABLE blog_posts ADD COLUMN focus_keyword TEXT;
ALTER TABLE blog_posts ADD COLUMN reading_time INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN canonical_url TEXT;
ALTER TABLE blog_posts ADD COLUMN robots_index INTEGER DEFAULT 1;
ALTER TABLE blog_posts ADD COLUMN is_featured INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN tags TEXT; -- JSON array
```

### Prisma Schema (عند الترحيل لـ PostgreSQL)

```prisma
model BlogPost {
  // الحقول الموجودة
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String
  excerpt       String?
  content       String?
  coverImage    String?
  category      String?
  keywords      String?
  author        String?
  date          DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // حقول التصنيف التعليمي
  contentType   String?
  curriculum    String?
  level         String?
  grade         String?
  term          String?
  subject       String?
  
  // حقول التحميل والمشاهدة
  downloadLink        String?
  watchLink           String?
  showButtons         Boolean  @default(true)
  downloadButtonText  String?
  watchButtonText     String?
  
  // حقول إضافية
  source    String?
  fileSize  String?
  views     Int      @default(0)
  isNew     Boolean  @default(false)
  
  // ⭐ حقول SEO الجديدة
  seoTitle        String?
  seoDescription  String?
  ogImage         String?
  focusKeyword    String?
  readingTime     Int      @default(0)
  canonicalUrl    String?
  robotsIndex     Boolean  @default(true)
  isFeatured      Boolean  @default(false)
  tags            Json?    // ["tag1", "tag2", ...]
  
  // Soft Delete
  deletedAt DateTime?
  
  // العلاقات
  relatedFrom  BlogPostRelation @relation("relatedFrom")
  relatedTo    BlogPostRelation @relation("relatedTo")
}

// جدول مساعد للـ Related Posts
model BlogPostRelation {
  postId    String
  relatedId String
  post      BlogPost @relation("relatedFrom", fields: [postId], references: [id])
  related   BlogPost @relation("relatedTo", fields: [relatedId], references: [id])
  
  @@id([postId, relatedId])
}
```

### تحديث AdminBlog.tsx (لوحة التحكم)

إضافة حقول SEO في نموذج المقال:

```
┌─────────────────────────────────────┐
│  ⚙️ إعدادات SEO                     │
├─────────────────────────────────────┤
│  عنوان SEO (seoTitle)               │
│  وصف SEO (seoDescription)           │
│  الكلمة المفتاحية (focusKeyword)    │
│  رابط الصورة المميزة (ogImage)      │
│  الوسوم (tags) — JSON               │
│  [✓] مقال مميز (isFeatured)         │
└─────────────────────────────────────┘
```

### تحديث BlogPost.tsx (العرض العام)

في `SEO` component:

```tsx
// إضافة: استخدام حقول SEO المخصصة إن وجدت
const seoTitle = post.seoTitle || post.title;
const seoDescription = post.seoDescription || post.excerpt;
const ogImage = post.ogImage || post.coverImage;
```

في نهاية المقال (بعد المحتوى):

```tsx
// إضافة: وقت القراءة
{post.readingTime > 0 && (
    <div className="text-sm text-slate-500">⏱ وقت القراءة: ~{post.readingTime} دقيقة</div>
)}

// إضافة: الوسوم
{post.tags && JSON.parse(post.tags).length > 0 && (
    <div className="flex flex-wrap gap-2 my-4">
        {JSON.parse(post.tags).map(tag => (
            <Link to={`/books?tag=${tag}`} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
                #{tag}
            </Link>
        ))}
    </div>
)}

// إضافة: المقالات المرتبطة
{relatedPosts.length > 0 && (
    <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-bold mb-4">مقالات ذات صلة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map(rp => (
                <Link to={`/books/${rp.slug}`} className="...">
                    {rp.title}
                </Link>
            ))}
        </div>
    </div>
)}
```

### حساب وقت القراءة (server-side)

في `server/routes/blog.js` عند إنشاء أو تحديث مقال:

```js
const calculateReadingTime = (content) => {
    if (!content) return 0;
    // إزالة HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    // متوسط سرعة القراءة بالعربية: 150 كلمة/دقيقة
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 150));
};
```

---

## 3. تحسين BlogPost.tsx (المقالات)

### المطلوب إضافته بعد المحتوى

```
[⏱ وقت القراءة: 5 دقائق]
[#tag1 #tag2 #tag3 ...]
[📖 مقالات ذات صلة (3 cards)]
```

### ترتيب العناصر في المقال

```
1. ✅ Header (title, author, date, category, tags)
2. ✅ [Image] | [First Content] ← جنبًا لجنب (desktop)
3. ✅ Download / Watch buttons
4. ✅ Rest of content
5. ⏱ وقت القراءة (جديد)
6. 🏷️ الوسوم (جديد)
7. 📖 المقالات المرتبطة (جديد)
8. ✅ Share buttons
```

### API للمقالات المرتبطة

إضافة Route في `server/routes/blog.js`:

```js
// GET /api/blog/:slug/related
router.get('/:slug/related', async (req, res) => {
    const post = await db.get('SELECT id, category, tags, subject FROM blog_posts WHERE slug = ?', [req.params.slug]);
    if (!post) return res.json([]);
    
    const related = await db.all(`
        SELECT slug, title, excerpt, coverImage, date 
        FROM blog_posts 
        WHERE id != ? AND (category = ? OR subject = ?)
        ORDER BY date DESC 
        LIMIT 3
    `, [post.id, post.category, post.subject]);
    
    res.json(related);
});
```

---

## 4. تحسين الصور (Alt + Dimensions)

### مشكلة موجودة
بعض الصور في `BlogPost.tsx` تفتقر إلى `alt text` و `width`/`height`.

### الحل
تحديث `processContent` في `BlogPost.tsx` لإضافة `alt` و `width`/`height` تلقائيًا للصور في المحتوى:

```tsx
const processContent = (text: string): string => {
    if (!text) return '';
    const lines = text.split('\n');
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);
    const processed = lines.map((line: string) => {
        const trimmed = line.trim();
        // تحويل روابط الصور إلى <img> مع alt و dimensions
        const imgRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
        if (imgRegex.test(trimmed)) {
            return `<img src="${trimmed}" alt="" loading="lazy" width="800" height="450" class="w-full h-auto my-8 rounded-2xl" onerror="this.style.display='none'" />`;
        }
        // إضافة alt للصور الموجودة في HTML
        return line.replace(/<img\s+/gi, '<img alt="" loading="lazy" ');
    });
    return hasHtml ? processed.join('\n') : processed.join('<br/>');
};
```

---

## 5. الـ priorty والترتيب

| المرحلة | البند | الملفات المتأثرة | الوقت التقريبي |
|---------|-------|-----------------|---------------|
| **1** 🔴 | Sitemap.xml | `server/index.js` | ساعة |
| **1** 🔴 | Robots.txt | `public/robots.txt` (ملف جديد) | 15 دقيقة |
| **2** 🔴 | إضافة حقول SEO في DB | `server/db_setup.js` + `server/routes/blog.js` | ساعتين |
| **2** 🔴 | تحديث AdminBlog (حقول SEO) | `src/pages/AdminBlog.tsx` | ساعتين |
| **2** 🔴 | تحديث BlogPost (قراءة حقول SEO) | `src/pages/public/BlogPost.tsx` | ساعة |
| **3** 🟡 | حساب Reading Time | `server/routes/blog.js` + `AdminBlog.tsx` | ساعة |
| **3** 🟡 | إضافة Reading Time + Tags في العرض | `src/pages/public/BlogPost.tsx` | ساعة |
| **3** 🟡 | Related Posts API + UI | `server/routes/blog.js` + `BlogPost.tsx` | ساعتين |
| **4** 🟢 | OG Image لـ Privacy + Terms | `PrivacyPolicy.tsx` + `TermsOfService.tsx` | 15 دقيقة |
| **4** 🟢 | RSS Feed | `server/index.js` | ساعة |
| **4** 🟢 | تحسين Alt tags للصور | `src/pages/public/BlogPost.tsx` | 30 دقيقة |

---

## 6. Prisma Schema — الكود الكامل لجزء BlogPost

> هذا هو الـ schema الذي سنستخدمه عند الترحيل إلى PostgreSQL + Prisma:

```prisma
enum BlogContentType {
  NOTES
  SOLUTIONS
  MORE
  FOUNDATION
}

model BlogPost {
  id                  String      @id @default(cuid())
  slug                String      @unique
  title               String
  excerpt             String?
  content             String?
  coverImage          String?
  category            String?
  keywords            String?
  author              String?
  date                DateTime
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  
  // Educational classification
  contentType         BlogContentType?
  curriculum          String?
  level               String?
  grade               String?
  term                String?
  subject             String?
  
  // Download & Watch
  downloadLink        String?
  watchLink           String?
  showButtons         Boolean     @default(true)
  downloadButtonText  String?
  watchButtonText     String?
  
  // Extras
  source              String?
  fileSize            String?
  views               Int         @default(0)
  isNew               Boolean     @default(false)
  
  // ⭐ SEO Fields
  seoTitle            String?
  seoDescription      String?
  ogImage             String?
  focusKeyword        String?
  readingTime         Int         @default(0)
  canonicalUrl        String?
  robotsIndex         Boolean     @default(true)
  isFeatured          Boolean     @default(false)
  tags                Json?       // ["tag1", "tag2"]
  
  // Relations
  relatedFrom         BlogPostRelation[] @relation("relatedFrom")
  relatedTo           BlogPostRelation[] @relation("relatedTo")
  
  // Timestamps
  deletedAt           DateTime?
  
  // Indexes
  @@index([category])
  @@index([subject])
  @@index([contentType])
  @@index([curriculum])
  @@index([date])
  @@index([isFeatured])
  @@index([slug])
}

model BlogPostRelation {
  postId    String
  relatedId String
  post      BlogPost @relation("relatedFrom", fields: [postId], references: [id], onDelete: Cascade)
  related   BlogPost @relation("relatedTo", fields: [relatedId], references: [id], onDelete: Cascade)
  
  @@id([postId, relatedId])
  @@index([postId])
  @@index([relatedId])
}
```

---

## ملاحظة مهمة

هذه الخطة تفصل **الجزء الخاص بـ SEO + BlogPost فقط** من خطة الـ DB الشاملة. إذا بدأنا العمل، نبدأ بالمرحلة 1 (Sitemap + Robots) لأنها لا تحتاج أي تعديل في قاعدة البيانات ويمكن إنجازها فورًا.

هل تريد البدء بالمرحلة 1 مباشرة؟
