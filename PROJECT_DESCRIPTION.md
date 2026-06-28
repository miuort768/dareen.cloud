# دارين السابعة للتعليم والتدريب - نظام الإدارة الشامل

## 1. نظرة عامة

نظام إدارة متكامل لمعهد **دارين السابعة للتعليم والتدريب**، يهدف إلى أتمتة ورقمنة جميع العمليات الإدارية والتعليمية والمالية. النظام مبني على بنية **SPA (Single Page Application)** مع واجهة خلفية **RESTful API** تدعمه، ويتضمن بوابات منفصلة لكل من (الإداري، المعلم، ولي الأمر، الطالب).

- **الموقع الرسمي:** [https://dareen.cloud](https://dareen.cloud)
- **النسخة الحالية:** v2.0.0

---

## 2. الأهداف الاستراتيجية

- تقديم نظام إدارة مدرسية متكامل وسهل الاستخدام
- رقمنة جميع العمليات (التسجيل، الجدولة، الحضور، المالية، التقارير)
- توفير بوابات مخصصة لكل مستخدم (إداري، معلم، ولي أمر، طالب)
- دعم التعلم التفاعلي عبر الفصول الافتراضية (Live Classroom) بتقنية WebRTC
- تحسين ظهور الموقع في محركات البحث (SEO) وجذب الزوار عبر المدونة
- تمكين أولياء الأمور من متابعة أبنائهم آنياً
- رفع كفاءة المعلمين عبر أدوات جدولة الحصص وتقييم الطلاب
- أتمتة الفواتير والمالية وإدارة الإشتراكات

---

## 3. بنية النظام (Architecture)

### 3.1 العمارة العامة (System Architecture)

```
┌──────────────────────────────────────────────────┐
│                  Frontend (SPA)                   │
│          React 18 + TypeScript + Vite             │
│                   Port 5173                       │
├──────────────────────────────────────────────────┤
│              HTTP API / WebSocket                 │
├──────────────────────────────────────────────────┤
│                 Backend (Express)                  │
│          Node.js 22 + JavaScript/ES6              │
│                   Port 3001                       │
│          + Prisma ORM (Phase 1 partial)           │
├──────────────────────────────────────────────────┤
│               Database Layer                       │
│  ┌──────────────────┬─────────────────────┐      │
│  │  SQLite (Legacy) │  SQLite (Prisma)     │      │
│  │  database.sqlite  │  dev.db              │      │
│  └──────────────────┴─────────────────────┘      │
├──────────────────────────────────────────────────┤
│            External Services                      │
│  ┌────────────┬──────────┬──────────────┐        │
│  │ LiveKit    │ Socket.IO│  Web Push API│        │
│  │ (WebRTC)   │ (Realtime)│ (Notifications)│      │
│  └────────────┴──────────┴──────────────┘        │
└──────────────────────────────────────────────────┘
```

#### 3.1.1 مسار الطلب (Request Flow)

```
Client Request
    ↓
Cloudflare CDN / VPS
    ↓
Nginx Reverse Proxy (HTTPS termination)
    ↓
Express.js Server (Port 3001)
    ↓
Rate Limiting → CORS → Helmet (Security Headers)
    ↓
Correlation ID → Database Middleware → Auth Middleware
    ↓
Route Handler (Prisma ORM / Raw SQL)
    ↓
Socket.IO (Real-time events) || JSON Response
```

### 3.2 الواجهة الأمامية (Frontend - SPA)

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| React | 18.3.1 | مكتبة بناء واجهة المستخدم |
| TypeScript | 5.4.5 | لغة برمجة مع دعم الأنواع |
| Vite | 5.4.21 | أداة بناء وتطوير |
| React Router | 6.22.3 | إدارة التوجيه والصفحات |
| TanStack React Query | 5.x | إدارة حالة الخادم والتخزين المؤقت |
| Zustand | 5.x | إدارة الحالة العامة |
| Socket.IO Client | 4.8.3 | الاتصال الآني مع الخادم |
| Tailwind CSS | 3.4.17 | إطار عمل CSS لبناء الواجهات |
| Framer Motion | 12.x | مكتبة الحركات والانتقالات |
| Lucide React | 0.344 | مجموعة أيقونات |
| Recharts | 2.12.2 | الرسوم البيانية والتقارير |
| react-virtuoso | 4.18.7 | التمرير الافتراضي للقوائم الكبيرة |
| date-fns | 3.3.1 | معالجة التواريخ |
| LiveKit Components | 2.x | غرفة الفصول الافتراضية |
| React Helmet Async | 2.0.5 | إدارة وسم SEO |

#### 3.2.1 تقسيم الحزم (Code Splitting)

تم تقسيم الحزم (Chunks) في Vite كالتالي لتحسين زمن التحميل:

| الحزمة | المحتوى | الحجم التقريبي |
|--------|---------|---------------|
| `vendor` | React, React DOM, React Router | ~45KB gzip |
| `query` | TanStack Query + persist client | ~25KB gzip |
| `motion` | Framer Motion | ~35KB gzip |
| `icons` | Lucide React (الأيقونات) | ~30KB gzip |
| `date` | date-fns | ~20KB gzip |
| `ui` | المكونات المشتركة (ui/) | ~15KB gzip |
| باقي الصفحات | تحميل كسول (Lazy Loading) | حسب الحاجة |

### 3.3 الواجهة الخلفية (Backend - API)

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Node.js | 22.x | بيئة تشغيل JavaScript |
| Express.js | 4.19 | إطار عمل REST API |
| Prisma ORM | 7.8.0 | ORM للتعامل مع قاعدة البيانات (قيد الترحيل) |
| SQLite3 | 5.1.7 | قاعدة البيانات الحالية (مرحل جزئياً من legacy) |
| JWT | 9.0.2 | التوثيق وإدارة الجلسات |
| Socket.IO | 4.8.3 | الاتصالات الآنية (دردشة، إشعارات) |
| LiveKit Server SDK | 2.x | إدارة الفصول الافتراضية |
| Zod | 4.3.5 | التحقق من صحة البيانات (Validation) |
| Helmet | 8.1.0 | تعزيز الأمان (CSP, XSS, إلخ) |
| express-rate-limit | 7.x | تحديد معدل الطلبات |
| Web Push | 3.6.7 | الإشعارات الفورية |
| Prerender | 3.5.0 | تجهيز الصفحات لمحركات البحث (SEO) |
| Sharp | 0.34 | تحسين الصور وتقليل الحجم |

#### 3.3.1 قواعد API

```
API Base: https://dareen.cloud/api/

     ├── /auth          → تسجيل الدخول، تسجيل، استعادة كلمة المرور
     ├── /students      → إدارة الطلاب
     ├── /teachers      → إدارة المعلمين
     ├── /parents       → إدارة أولياء الأمور
     ├── /sessions      → جدولة الحصص
     ├── /evaluations   → تقييم الطلاب
     ├── /invoices      → الفواتير (طلاب + معلمين)
     ├── /finance       → التقارير المالية والإحصائيات
     ├── /blog          → المدونة والمقالات (عام)
     ├── /leads         → إدارة العملاء المحتملين
     ├── /tasks         → المهام
     ├── /trial-sessions→ الحصص التجريبية
     ├── /chat          → الدردشة الداخلية
     ├── /forum         → المنتدى
     ├── /announcements → الإعلانات
     ├── /notifications → الإشعارات (مع إرسال Web Push)
     ├── /push          → إدارة أجهزة الإشعارات
     ├── /system        → إعدادات النظام
     ├── /live          → الفصول الافتراضية
     ├── /jobs          → الوظائف والتوظيف
     ├── /contact       → رسائل التواصل
     ├── /appointments  → المواعيد
     ├── /upload        → رفع الملفات
     ├── /student-portal→ بوابة الطالب
     │
     ├── /public-chat   → الدردشة العامة
     ├── /blog          → المدونة (نقاط عامة)
     │
     ├── GET  /sitemap.xml  → خريطة الموقع
     ├── GET  /rss.xml      → تغذية RSS للمدونة
     └── POST /graphql      → GraphQL endpoint (قيد التطوير)
```

### 3.4 قاعدة البيانات (Database Schema)

**51 جدولاً** مقسمة كالتالي:

#### المجال الأساسي (Core Domain) - 6 جداول (مهاجرة إلى Prisma)
- `users` — مستخدمي النظام
- `teachers` — المعلمون
- `students` — الطلاب
- `parents` — أولياء الأمور
- `enrollments` — تسجيل الطلاب
- `points_log` — سجل النقاط

#### المجال التعليمي (Education Domain) - 9 جداول
- `sessions` — الحصص
- `live_sessions` — الحصص المباشرة
- `active_sessions` — الحصص النشطة حالياً
- `evaluations` — التقييمات
- `trial_sessions` — الحصص التجريبية
- `teacher_availability` — أوقات توفر المعلمين
- `appointments` — المواعيد
- `homework` — الواجبات

#### المجال المالي (Finance Domain) - 10 جداول
- `student_invoices` — فواتير الطلاب
- `teacher_invoices` — فواتير المعلمين
- `manual_transactions` — المعاملات المالية اليدوية
- `expenses` — المصروفات
- `monthly_closing` — الإغلاق الشهري
- `students_account` — حسابات الطلاب
- `salary` — الرواتب

#### المحتوى والتواصل (Content & Communication) - 14 جدولاً
- `blog_posts` — المقالات (مع أعمدة SEO)
- `chat_messages` — رسائل الدردشة (× 4 أنواع)
- `forum_posts` — مناقشات المنتدى
- `announcements` — الإعلانات
- `jobs`, `job_applications` — التوظيف
- `contact_messages` — رسائل التواصل

#### النظام والإعدادات (System) - 12 جدولاً
- `system_settings` — إعدادات النظام
- `sessions` (جلسات العمل)
- `notifications` — الإشعارات
- `push_subscriptions` — اشتراكات الإشعارات الفورية
- `audit_log` — سجل التدقيق

---

## 4. الميزات والوحدات (Features & Modules)

### 4.1 لوحة التحكم العامة (Admin Dashboard)
- إحصائيات فورية (عدد الطلاب، المعلمين، الحصص، الإيرادات)
- رسوم بيانية تفاعلية (Recharts)
- مؤشرات الأداء الرئيسية (KPI)
- نظام إشعارات فورية (Socket.IO)

### 4.2 إدارة الطلاب (Students Management)
- تسجيل وتحرير وحذف الطلاب مع دعم الحذف الناعم (soft delete)
- ربط الطلاب بأولياء الأمور
- نقاط المكافآت
- المجموعات الدراسية والمناهج
- بيانات الاتصال (هاتف ولي الأمر، هاتف الطالب)

### 4.3 إدارة المعلمين (Teachers Management)
- سجل المعلمين مع المواد والتخصصات
- الأسعار والعمولات
- نقاط المكافآت
- إحصاءات عدد الطلاب لكل معلم

### 4.4 إدارة أولياء الأمور (Parents Portal)
- عرض أبناء ولي الأمر
- جدول الحصص
- الإعلانات والملاحظات

### 4.5 الحصص والجدولة (Sessions & Scheduling)
- جدولة الحصص الدراسية
- الحصص التجريبية
- تحديث حالة الحصة (تمت، غياب، إلغاء)
- سجل الحضور والغياب
- التقويم والأجندة

### 4.6 التقييم (Evaluations)
- تقييم الطلاب حسب المواد
- سجل التقييمات
- إشعار ولي الأمر عند إضافة تقييم

### 4.7 الفواتير والمالية (Invoices & Finance)
- فواتير الطلاب (شهرية تلقائية)
- فواتير المعلمين (عمولات)
- المعاملات النقدية اليدوية
- المصروفات
- إحصائيات الأرباح والإيرادات
- الإغلاق الشهري

### 4.8 إدارة العملاء المحتملين (Leads CRM)
- تسجيل العملاء المحتملين من الموقع
- متابعة حالة العميل (جديد، تم التواصل، حجز تجربة، تحول لطالب، ملغي)
- إحصائيات التحويل

### 4.9 الفصول الافتراضية (Live Classroom)
- فيديو وصوت بتقنية WebRTC عبر LiveKit
- دردشة نصية أثناء الحصة
- التحكم في حالة الحصة (بدأت، منتهية)
- عزل العضو (Mute/Unmute)

### 4.10 المدونة والمحتوى (Blog & Content)
- مقالات مع دعم SEO (Meta description, keywords, canonical URL)
- تقسيم المقالات: كتاب، منشور
- تصنيف حسب: الفئة، المادة، المنهج، الصف الدراسي
- صورة غلاف مع نص بديل (alt text)
- وقت القراءة التقديري
- المنشورات ذات الصلة
- خريطة موقع XML (sitemap.xml)
- تغذية RSS (rss.xml)
- واجهة إدارة متكاملة للمقالات

### 4.11 التواصل (Communication)
- دردشة داخلية فورية (Socket.IO)
- دردشة عامة مع الزوار
- إعلانات مع إشعارات فورية
- منتدى للنقاشات
- إشعارات Web Push (Push API)
- إشعارات تذكير بالحصص (Reminder Scheduler)
- رسائل واتساب وتليجرام (مدمجة)

### 4.12 النظام والإعدادات (System Settings)
- إعدادات الموقع (الاسم، الهاتف، الألوان)
- وضع الصيانة
- إدارة المستخدمين والأدوار والصلاحيات
- خيارات تفعيل/تعطيل البوت والبث
- إعدادات الإشعارات

### 4.13 التوظيف (Jobs)
- إعلانات الوظائف
- تقديم طلبات التوظيف
- إدارة الطلبات

### 4.14 التحسين لمحركات البحث (SEO)
- Pre-rendering عبر Prerender.io للصفحات العامة
- خريطة موقع XML ديناميكية (sitemap.xml)
- تغذية RSS (rss.xml)
- تحسين العناوين والوصف لكل صفحة
- بيانات منظمة JSON-LD
- صفحة الخطأ 404 المخصصة
- روابط بروتوكول HTTPS مع إعادة توجيه WWW
- ملف robots.txt

---

## 5. الأمان (Security)

### 5.1 طبقات الأمان

```
الطبقة الأولى: Cloudflare (DDoS protection, WAF)
الطبقة الثانية: HTTPS (TLS 1.3) عبر Nginx
الطبقة الثالثة: Helmet.js (CSP, XSS, Clickjacking, etc.)
الطبقة الرابعة: Rate Limiting (100-3000 req/15min)
الطبقة الخامسة: JWT Authentication (Access + Refresh tokens)
الطبقة السادسة: Role-Based Access Control (صلاحيات دقيقة)
الطبقة السابعة: Input Validation (Zod) + Sanitization
الطبقة الثامنة: Correlation ID لتتبع الأخطاء
الطبقة التاسعة: Audit Log (سجل التدقيق)
الطبقة العاشرة: Soft Delete (الحذف الناعم)
```

### 5.2 الإجراءات الأمنية
- تشفير كلمات المرور باستخدام bcrypt
- التحقق من صحة البيانات (Zod schema validation)
- تصفية المدخلات (Sanitization)
- JWT مع token version لمنع إعادة استخدام التوكن المسروق
- CORS محدود (النطاقات المسموحة فقط)
- Content Security Policy (CSP) عبر Helmet
- معدّل طلبات صارم (15 دقيقة، 20 محاولة لتسجيل الدخول)
- حماية من CSRF عبر توثيق Same-Origin
- تقييد الصلاحيات لكل مسار

---

## 6. تحسين الأداء (Performance)

### 6.1 الإجراءات المطبقة

| التحسين | النسبة/الأثر |
|---------|-------------|
| تحسين الصور (Sharp) | توفير ~53% من حجم الصور (4.8MB من 9MB) |
| التحميل الكسول للصفحات (Lazy Loading) | تحميل الصفحات عند الطلب فقط |
| تقسيم الحزم (Code Splitting) 6 Chunks | تحميل متوازي للحزم |
| التخزين المؤقت للـ API (In-Memory Cache) | تقليل طلبات DB للمسارات المتكررة |
| 34 فهرس جديد في قاعدة البيانات | تسريع استعلامات SQL بمتوسط 10-50x |
| React.memo للجداول (6 مكونات) | منع إعادة التصيير غير الضروري |
| useMemo للصفحات (4 صفحات) | تخزين مؤقت للحسابات المكلفة |
| التمرير الافتراضي (LeadTable) | عرض آلاف الصفوف بدون بطء |
| ضغط الاستجابات (Compression) | تقليل حجم الاستجابات بنسبة ~70% |
| التخزين المؤقت للملفات الثابتة (1 سنة) | عدم إعادة تحميل الملفات |
| TanStack Query (React Query) | تخزين مؤقت للاستعلامات من جهة العميل |

### 6.2 أحجام الحزم بعد التحسين

| المقياس | قبل التحسين | بعد التحسين |
|---------|------------|------------|
| JS الإجمالي | ~420KB gzip | ~280KB gzip |
| أوقات التحميل الأول | 2.5s | ~1.2s |
| حجم الصور الإجمالي | 9MB | 4.2MB |

---

## 7. البنية التحتية للنشر (Deployment Infrastructure)

### 7.1 بيئة الإنتاج (Production)

```
┌─────────────────────────────────────────────────┐
│               Cloudflare CDN                     │
│          (DNS, DDoS Protection, SSL)             │
├─────────────────────────────────────────────────┤
│            Hostinger VPS (Ubuntu 24.04)          │
│            Intel Xeon, 4GB RAM, 100GB SSD         │
├─────────────────────────────────────────────────┤
│                 Docker Host                       │
├──────────────────┬──────────────────────────────┤
│   Container 1    │        Container 2             │
│  dareen-app       │       LiveKit Server           │
│  (Node 22-alpine) │       (Media Server)           │
│  Port 3001        │       Port 7880-7882           │
│  SQLite Volumes   │       TURN/STUN                │
└──────────────────┴──────────────────────────────┘
```

### 7.2 أمر النشر (Docker Compose)
```yaml
services:
  app:
    image: node:22-alpine
    volumes:
      - ./app:/app (الكود المصدري)
      - app_data:/database (بيانات SQLite)
    ports:
      - "3001:3001"
    restart: unless-stopped
```

### 7.3 بيئة التطوير (Local Development)
- Node.js v18+ / npm 9+
- SQLite (مضمنة، لا حاجة لخادم قاعدة بيانات منفصل)
- Vite Dev Server (HMR - Hot Module Replacement)
- `npm run dev` → Frontend (5173)
- `npm run server` → Backend API (3001)
- `npm run dev:all` → كلاهما معاً

### 7.4 الأدوات المساعدة
- **Vite** — بناء سريع مع HMR
- **ESLint** — تحليل جودة الكود
- **Vitest** — اختبارات الوحدة
- **TypeScript** — كتابة كود آمن
- **Sharp** — تحسين الصور تلقائياً أثناء البناء

---

## 8. خارطة الطريق (Roadmap)

### ✅ تم الإنجاز

#### المرحلة 0: الأساسيات (SEO)
- [x] ملف robots.txt
- [x] خريطة موقع XML (sitemap.xml)
- [x] تغذية RSS (rss.xml)
- [x] Pre-rendering (Prerender.io)
- [x] تحسين SEO للمقالات (Meta, alt, JSON-LD)
- [x] إدارة SEO في لوحة التحكم

#### المرحلة 1: الهجرة إلى Prisma (Core Domain)
- [x] إعداد Prisma مع SQLite
- [x] ترحيل جداول: Users, Teachers, Students, Parents, Enrollments, PointsLog
- [x] إعادة كتابة مسارات API (teachers, students, parents, auth) إلى Prisma
- [x] بَذر البيانات الأولية (Admin Seeder)

### 🔄 قيد التنفيذ

#### تحسين الأداء (Performance Sprint)
- [x] طبقة تخزين مؤقت (In-Memory Cache)
- [x] 34 فهرس قاعدة بيانات جديد
- [x] React.memo للجداول
- [x] useMemo للصفحات
- [x] التمرير الافتراضي (Virtual Scrolling)
- [x] إزالة الحزم غير المستخدمة
- [x] تحسين تقسيم الحزم في Vite
- [ ] إزالة `SELECT *` من المسارات (جاري)
- [ ] تحويل الأنماط المضمنة (`.map()` styles)

#### المرحلة 2: الهجرة إلى Prisma (Education Domain)
- [ ] Sessions, LiveSessions, ActiveSessions
- [ ] Evaluations, TrialSessions
- [ ] TeacherAvailability

#### المرحلة 3: الهجرة إلى Prisma (Finance Domain)
- [ ] Invoices, Transactions, Expenses
- [ ] Monthly Closing

#### المرحلة 4: الهجرة إلى Prisma (Content & System)
- [ ] Blog, Forum, Chat, Announcements
- [ ] Settings, Notifications

### 📋 مستقبلاً (Backlog)

- [ ] الانتقال إلى PostgreSQL عند توفر الدعم
- [ ] دفع آلي (Stripe/Tap Payment Gateway)
- [ ] تطبيق جوال (Capacitor - Android/iOS)
- [ ] نظام حضور بالبصمة أو QR Code
- [ ] تكامل مع Google Calendar
- [ ] تكامل مع Zoom/Google Meet كخيار للفصول الافتراضية
- [ ] تطبيق ولي الأمر المستقل (موبايل)
- [ ] نظام تقارير متقدم قابل للتخصيص
- [ ] التكامل مع أنظمة ERP خارجية
- [ ] دعم متعدد اللغات (RTL/LTR)
- [ ] GraphQL API

---

## 9. التقنيات المستخدمة (Tech Stack Summary)

### الواجهة الأمامية (Frontend)
| المجال | التقنيات |
|--------|---------|
| الإطار الرئيسي | React 18 + TypeScript |
| البناء | Vite 5 |
| التوجيه | React Router 6 |
| حالة الخادم | TanStack Query 5 |
| الحالة العامة | Zustand 5 |
| التصميم | Tailwind CSS 3 + Framer Motion |
| الأيقونات | Lucide React |
| الرسوم البيانية | Recharts |
| الأداء | react-virtuoso, Lazy Loading, Suspense |
| SEO | React Helmet Async |

### الواجهة الخلفية (Backend)
| المجال | التقنيات |
|--------|---------|
| الخادم | Node.js 22 + Express 4 |
| قاعدة البيانات | SQLite (Legacy + Prisma) |
| ORM | Prisma 7 |
| التوثيق | JWT + bcrypt |
| الوقت الفعلي | Socket.IO 4 |
| الفصول الافتراضية | LiveKit (WebRTC) |
| الأمان | Helmet, Rate Limiting, CORS, CSP |
| التحقق | Zod 4 |
| الإشعارات | Web Push API |
| SEO | Prerender.io |

### البنية التحتية (Infrastructure)
| المجال | التقنيات |
|--------|---------|
| الاستضافة | Hostinger VPS (Ubuntu 24.04) |
| الحاوية | Docker + Docker Compose |
| CDN | Cloudflare |
| HTTPS | Nginx + Let's Encrypt |
| قاعدة البيانات | SQLite (مضمنة) |
| خادم الوسائط | LiveKit Server |

---

## 10. إحصائيات المشروع

| المقياس | القيمة |
|---------|--------|
| إصدار Node.js | v22 (Docker), v18 (Dev) |
| عدد وحدات API | 25+ route module |
| عدد جداول DB | 51 جدولاً |
| عدد مكونات React | 80+ مكون وصفحة |
| عدد ملفات TypeScript | 200+ ملف |
| عدد ملفات الخادم | 50+ ملف |
| حجم قاعدة البيانات SQLite | ~10MB |
| زمن النشر (Docker) | ~2 دقيقة |
| زمن البناء (Frontend) | 30-60 ثانية |
| تحسين الصور | -53% (4.8MB) |

---

## 11. خلاصة

نظام **دارين السابعة للتعليم والتدريب** هو منصة إدارة تعليمية متكاملة تقدم حلولاً رقمية لجميع جوانب إدارة المعهد: من تسجيل الطلاب والمعلمين، وجدولة الحصص، والتقييم، والفواتير، إلى الفصول الافتراضية والتواصل الآني. تم تطويره باستخدام أحدث التقنيات (React 18, Node.js 22, Vite 5, Prisma 7, WebRTC) ويركز على الأداء العالي، الأمان، وتجربة المستخدم السلسة مع دعم كامل للغة العربية والـ RTL.

النظام يعمل حالياً في بيئة إنتاجية حقيقية على Hostinger VPS عبر Docker بمعمارية حديثة وقابلة للتوسع، ويخدم المعهد في إدارة عملياته اليومية بكفاءة عالية.
