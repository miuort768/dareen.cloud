# 📘 نظام إدارة معهد دارين للتعليم والتدريب — الوثيقة الشاملة

> وثيقة معيارية (Single Source of Truth) تصف معمارية النظام ووحداته الوظيفية ونظام التصميم والأمان والنشر.
> **الدومين:** `dareen.cloud` · **الإصدار:** v2.0.0 · **الترخيص:** MIT

---

## 1) نظرة عامة

نظام إدارة متكامل لمعاهد التعليم والتدريب (دارين السابعة) يجمع بين:

- **منصة عامة (Public Site):** صفحة رئيسية، منصة كتب/مدونة، مقررات، توظيف، تواصل، سياسات — مهيّأة لمحركات البحث (Prerender + RSS + Sitemap).
- **نظام إدارة داخلي (Institute Suite):** متعدد الأدوار (Admin / Teacher / Parent / Student) يغطي الطلاب، المعلمون، أولياء الأمور، الماليّة والفواتير، الحضور، الجداول والمواعيد، التقييمات، التقارير، المهام، الإعلانات، المنتدى، والمحادثات الفورية.
- **PWA:** قابل للتثبيت، يعمل جزئياً دون اتصال (كاش React Query في IndexedDB + Service Worker).

| الخاصية | القيمة |
|---|---|
| اللغة/الاتجاه | عربي — RTL بالكامل |
| الوضع الليلي | مدعوم بالكامل (`darkMode: 'class'`) |
| عدد الأدوار | 5 (`admin`, `teacher`, `parent`, `student`, `chat_user`) |
| قاعدة البيانات | PostgreSQL عبر Prisma (مع دعم libsql/pg adapter) |
| الزمن الحقيقي | Socket.IO على مسار `/api/socket.io` |

---

## 2) المكدس التقني (Tech Stack)

### الواجهة الأمامية — `src/`

| المجال | التقنية | ملاحظات |
|---|---|---|
| الإطار | **React 18.3** + **TypeScript 5.4** | StrictMode + ErrorBoundary |
| البناء | **Vite 6** | alias `@ → ./src`، Proxy `/api → :3001` |
| التوجيه | **react-router-dom 7** | تحميل كسول (lazy) لكل الصفحات |
| حالة الخادم | **TanStack React Query 5** | Persist إلى IndexedDB (idb-keyval) — 24 ساعة |
| حالة العميل | **Zustand 5** | auth, ui, chat, unread, settings, user stores |
| الأنماط | **Tailwind CSS 3.4** | عبر CSS Variables (نظام Semantic Tokens) |
| الحركة | **Framer Motion 12** | انتقالات صفحات وقوائم |
| الرسوم البيانية | **Recharts** | مع ChartContainer/ChartTooltip موحّدة |
| الأيقونات | **lucide-react** | — |
| UI Primitives | **@radix-ui** (Avatar, Checkbox, Dialog, Slot) | أساس مكونات النظام |
| SEO | **react-helmet-async** | Meta ديناميكي لكل صفحة |
| إضافي | dompurify, qrcode.react, react-virtuoso, date-fns, socket.io-client | أمان HTML، QR، قوائم طويلة افتراضياً |

### الخادم الخلفي — `server/`

| المجال | التقنية |
|---|---|
| الإطار | **Node.js + Express 4** (CommonJS) |
| ORM | **Prisma 7** + PostgreSQL (`@prisma/adapter-pg` / `@prisma/adapter-libsql`) |
| المصادقة | **jsonwebtoken (JWT)** + **bcrypt** + tokenVersion لإبطال الجلسات |
| الزمن الحقيقي | **Socket.IO 4** |
| الكاش | **Redis** (ioredis) مع طبقة fallback عند تعذّر الاتصال |
| الطوابير | **BullMQ** (نظام مهام مجدولة + workers) |
| الملفات | multer (رفع) + sharp (معالجة صور) |
| المستندات | pdfkit (فواتير PDF) + exceljs (تصدير Excel) |
| الإشعارات | web-push (Web Push Notifications) |
| التحقق | **zod** للتحقق من المدخلات |
| SEO Server | prerender-node (تقديم مسبق لعناكب البحث) |

### الاختبارات والجودة

| الأداة | الاستخدام |
|---|---|
| Vitest + @testing-library + msw + jsdom | اختبارات الواجهة |
| Playwright | اختبارات E2E (`npm run test:e2e`) |
| Supertest + embedded-postgres | اختبارات الخادم |
| ESLint + Prettier (+ prettier-plugin-tailwindcss) | جودة وتنسيق الكود |
| Husky + lint-staged | فحوصات ما قبل الـ commit |


---

## 3) هيكل المجلدات

```text
new-kk/
├── src/
│   ├── main.tsx              # نقطة الدخول: QueryClient + Persist(IndexedDB) + SW + الثيم
│   ├── App.tsx               # التوجيه + ProtectedRoute + Lazy Loading
│   ├── index.css             # Tailwind الأساسي
│   ├── features/             # وحدات Feature-Based (كل وحدة: pages/components/hooks/types/utils)
│   │   ├── attendance/       # الحضور والغياب
│   │   ├── announcements/    # الإعلانات
│   │   ├── appointments/     # المواعيد (جلسات حرة)
│   │   ├── dashboard/        # لوحات التحكم (Executive + Mobile views)
│   │   ├── design-system/    # صفحة Playground للنظام التصميمي
│   │   ├── finance/          # الماليّة والفواتير
│   │   ├── monitoring/       # مراقبة النظام (Admin)
│   │   ├── parents/          # أولياء الأمور
│   │   ├── profile/          # صفحات الحساب (Student/Teacher/Parent)
│   │   ├── roles/            # إدارة الأدوار والصلاحيات
│   │   ├── settings/         # إعدادات النظام
│   │   ├── students/         # الطلاب
│   │   ├── tasks/            # المهام
│   │   └── teachers/         # المعلمون
│   ├── pages/                # صفحات التوجيه (ragged wrappers + صفحات عامة في pages/public/)
│   ├── shared/
│   │   ├── components/ui/    # UI Kit (barrel export: index.ts)
│   │   └── components/mobile/# MobilePage, PullToRefresh...
│   ├── components/           # Layout, ErrorBoundary, PageLoader, Toast...
│   ├── context/              # AppContext (المصادقة والإعدادات العامة)
│   ├── store/                # Zustand stores
│   ├── hooks/                # useChat, useChatSocketInit...
│   ├── lib/                  # api, socket, socket-events, utils, confirmDialog
│   ├── services/             # طبقات خدمة (liveSessionService...)
│   ├── types/                # الأنواع المشتركة (auth, invoice...)
│   ├── config/               # constants
│   ├── theme/                # 🚫 حدود الألوان الأولية (palette.ts / primitives.ts)
│   └── styles/tokens/        # ملفات CSS Variables لكل دومين (tokens split)
├── server/
│   ├── index.js              # Bootstrap: express + socket.io + middlewares + shutdown
│   ├── routes/               # core/ (auth, upload) · education/ · communication/ · finance/ · health
│   ├── middleware/           # auth, permissions, rateLimiter, audit, monitoring, correlationId, advanced
│   ├── services/             # cacheService, backupService, queues (BullMQ), schedulers
│   ├── socket/               # handler + reminderScheduler
│   ├── prisma/               # schema.prisma (PostgreSQL)
│   ├── utils/                # prisma, logger, redis, apiDocs
│   └── middleware/uploads    # مجلد الرفع عبر /uploads
├── docs/adr/                 # قرارات معمارية موثقة (4 ADRs)
├── scripts/                  # codemod-p1.ps1, convert-webp.mjs
└── public/                   # أصول ثابتة + sw.js (Service Worker)
```

---

## 4) الأدوار والصلاحيات

يُدار الوصول عبر `ProtectedRoute` في `App.tsx` مع صلاحيات نصية لكل مستخدم (`permissions`):

| الدور | الوصف | قواعد الوصول |
|---|---|---|
| `admin` | الإدارة الكاملة | كل الصلاحيات (`*`) |
| `teacher` | المعلم | لوحة المعلم، التقييمات، الحضور، الجداول، الإعلانات، المواعيد، المنتدى، سجل مدفوعاته |
| `parent` | ولي الأمر | صفحات `parent_*` + الصلاحيات المشتركة (schedule, announcements, appointments, forum) |
| `student` | الطالب | لوحة الطالب، المواعيد، الإعلانات، فواتير الطالب |
| `chat_user` | مستخدم محادثة عامة | يُوجَّه إجبارياً إلى `/chat` عند تسجيل الدخول |

- **إعادة توجيه الدخول:** `DashboardRedirect` يوجه كل دور إلى لوحته (`/admin-dashboard`, `/teacher-dashboard`, `/parent-dashboard`, `/student-dashboard`, `/chat`).
- من دون صلاحية → تحويل إلى `/`؛ وغير مسجّل → `/login`.


---

## 5) خريطة المسارات (Routes)

### عامة (بدون مصادقة)

| المسار | الصفحة |
|---|---|
| `/` | الصفحة الرئيسية (Landing) |
| `/courses` | المقررات |
| `/books` · `/books/:slug` | الكتب/المدونة + مقال |
| `/about` · `/contact` | من نحن · تواصل معنا |
| `/jobs` | التوظيف |
| `/login` | تسجيل الدخول |
| `/privacy-policy` · `/refund-policy` · `/terms-of-service` · `/terms-of-work` | السياسات |
| `/chat` | المحادثة العامة (chat_user) |
| `*` | 404 NotFound |

### محمية (داخل `Layout` مع Sidebar/Header)

| المسار | الصلاحية | الوحدة |
|---|---|---|
| `/dashboard` | — | إعادة توجيه حسب الدور |
| `/admin-dashboard` | `dashboard` | لوحة الإدارة التنفيذية |
| `/teacher-dashboard` | `dashboard` | لوحة المعلم (Desktop + Mobile) |
| `/parent-dashboard` | `parent_dashboard` | لوحة ولي الأمر |
| `/student-dashboard` | `student_dashboard` | لوحة الطالب |
| `/students` · `/teachers` · `/parents` | `students` / `teachers` / `parents` | إدارة المستخدمين |
| `/evaluations` | `evaluations` | التقييمات |
| `/attendance` | `attendance` | الحضور والغياب |
| `/schedule` · `/agenda` | `schedule` | الجداول والأجندة |
| `/appointments` | `appointments` | المواعيد/الجلسات الحرة |
| `/finance` | `finance` | الماليّة |
| `/student-invoices` | `student_invoices` | فواتير الطلاب |
| `/teacher-invoices` | `teacher_invoices` | فواتير المعلمين |
| `/monthly-closing` | `monthly_closing` | الإقفال الشهري |
| `/leads` | `leads` | العملاء المحتملون |
| `/trial-sessions` | `trial_sessions` | الجلسات التجريبية |
| `/tasks` | `tasks` | المهام |
| `/announcements` | `announcements` | الإعلانات (إدارة) |
| `/parent-announcements` | `parent_announcements` | إعلانات أولياء الأمور |
| `/forum` | `forum` | المنتدى |
| `/chat` | `chat` | المحادثات |
| `/reports` | `reports` | التقارير |
| `/settings` | `settings` | الإعدادات |
| `/teacher-payment-history` | `teacher_payment_history` | سجل مدفوعات المعلم |
| `/parent-payment-history` | `parent_dashboard` | سجل مدفوعات ولي الأمر |
| `/student-profile` · `/teacher-profile` · `/parent-profile` | حسب الدور | صفحات الحساب |
| `/admin/blog` · `/admin/blog-customers` | `admin` | إدارة المدونة وعملائها |
| `/admin-jobs` · `/admin-contacts` | `admin` | إدارة التوظيف وجهات الاتصال |
| `/roles` | `admin` | الأدوار والصلاحيات |
| `/monitoring` | `admin` | مراقبة النظام |

---

## 6) الوحدات الوظيفية (Functional Modules)

| الوحدة | أبرز الإمكانات |
|---|---|
| **لوحات التحكم** | عرض تنفيذي (Executive Dashboard) + نسخة موبايل لكل دور، KPI Cards، رسوم بيانية (Recharts)، إجراءات سريعة، موجز نشاط |
| **الطلاب** | تسجيل، تسجيلات (Enrollments) بالمعلمين، تجميد/تفعيل، فواتير، أرصدة وتنبيه سقف رصيد |
| **المعلمون** | ملفات، أسعار جلسات، عمولات (`teacher_commission_type`)، توفر (Availability)، جلسات نشطة، مكافآت ونقاط |
| **أولياء الأمور** | متابعة الأبناء، إشعارات، سجل مدفوعات، لوحة خاصة |
| **الحضور** | تسجيل لكل فترة (slotUtils/periodRange)، تسجيل آمن (SecureAttendanceModal)، نسخة موبايل مع Pull-to-Refresh |
| **الماليّة** | فواتير الطلاب والمعلمين، مصروفات ثابتة، إقفال شهري، معاينة فاتورة PDF، عملة قابلة للضبط |
| **الجداول والمواعيد** | جدول أسبوعي، أجندة، جلسات تجريبية، تذكيرات (Socket + Web Push + مجدول) |
| **التواصل** | محادثة فورية (Socket.IO) مع Unread states، منتدى، إعلانات متعددة الأنواع |
| **CRM** | Leads + جلسات تجريبية + Admin Contacts + متقدمي وظائف + عملاء المدونة |
| **المحتوى** | مدونة/كتب (AdminBlog) بتصنيفات ومناهج، RSS، Sitemap، Prerender |
| **النظام** | إعدادات (اسم الأكاديمية، الشعار، البانرات، الواتساب، الفصول، وضع الصيانة)، أدوار، مراقبة، نسخ احتياطي واستعادة (حتى 50MB) |


---

## 7) نظام التصميم (Design System v1.2 — مستقر)

### سلسلة التوكن (Token Chain)

```text
المكونات (.tsx)
   ↓  أسماء classes دلالية فقط
Semantic Tokens (tailwind.config.js → CSS Variables)
   ↓  ربط لكل ثيم (light/dark)
Palette (src/theme/palette.ts)
   ↓  قيم خام
Primitives (src/theme/primitives.ts)
```

- ملفات التوكن مقسّمة لكل دومين في `src/styles/tokens/` (ألوان، مسافات، ظلال، خطوط...).
- القائمة في `tailwind.config.js`: ألوان دلالية (`surface`, `card`, `main`, `muted`, `hover`, `border`, `success/warning/error/info` مع `soft/light/hover/active/dark`)، `sidebar.*`، ذهبي (`gold`)، `avatar-1..11`، `premium.*`.
- الطباعة كلها توكنات (`text-display`, `text-section`, `text-card-title`, `text-micro` + `tracking-label`) — لا أحجام بكسل عشوائية.
- حركة: `--duration-fast/normal/slow` → `duration-fast` إلخ. ظلال: `elevation-1..3` + `shadow-card/gold/glass/soft/broad`.

### القواعد غير القابلة للتفاوض

1. **ممنوع HEX** في المكونات (الاستثناء: `src/theme/` و `src/styles/`).
2. **ممنوع ألوان Tailwind المسماة** (`bg-indigo-500`...`)` في المكونات.
3. **لا استيراد Palette/Primitives** خارج طبقة الثيم.
4. ألوان الحالة (Success/Warning/Error/Info) ثابتة عبر الثيمات (ADR-004).
5. `text-white/black` مرفوضة — البدائل `text-on-primary`, `text-inverse` (استثناء تأثيرات الزجاج `bg-white/80`).
6. مُعدِّل الشفافية `/50` لا يعمل مع متغيرات hex — استخدم توكنات مسماة.
7. RTL: مسافات اتجاهية (`ms-/me-`) و`gap` بدل `ml-/mr-`، و`focus-visible` للوصولية.

### مكتبة المكونات (`src/shared/components/ui` — barrel export)

`Button · Input · Card · Spinner · Skeleton(+Text/Avatar/Card/Chart/Table) · Badge · Alert · Tabs · Breadcrumb · StatCard · ActivityFeed · PageHeader · Image · Table(+Column) · Dialog · Avatar · Dropdown · SectionErrorBoundary · ProgressBar · EmptyState · ErrorState/ErrorBanner · IconButton · FilterDropdown · ActionButton/ActionRow`

> مكوّنات خارج الـ barrel تُستورد مباشرة: Modal, Select, Checkbox, Radio, Switch, ConfirmModal, SecureAttendanceModal, MobilePage...

### معايير القبول (DoD)

- [ ] توكنات دلالية 100% (لا HEX، لا ألوان مسماة)
- [ ] إمكانية وصول: focus ring، aria-*، لوحة مفاتيح
- [ ] يعمل في الوضعين الليلي/النهاري
- [ ] جميع الحالات (hover/active/focus/disabled)
- [ ] متجاوب موبايل/تابلت/ديسكتوب
- [ ] تصدير من barrel + TypeScript نظيف (لا any/ts-ignore)

---

## 8) إدارة الحالة والبيانات

| الطبقة | الأداة | المحتوى |
|---|---|---|
| حالة الخادم | **React Query** (staleTime 5د، gcTime 30د) | كل جلب/تعديل API + **Persist في IndexedDB** لمدة 24 ساعة (دعم العمل دون اتصال) |
| حالة المصادقة | `AppContext` + `store/authStore` (persist) | المستخدم الحالي، الصلاحيات، الإعدادات العامة، وضع الصيانة |
| حالة الواجهة | `store/uiStore` (persist) | الثيم، Toasts، إشعارات native |
| المحادثة | `chatStore`, `chatUIStore`, `unreadStore` | الرسائل، حالة الكتابة، غير المقروء — عبر Socket.IO |
| الإعدادات | `settingsStore` | إعدادات النظام العامة من `/api/system/public-settings` |
| HTTP | `lib/api` | عميل fetch موحّد مع `safeArray` helpers |
| Realtime | `lib/socket` + `lib/socket-events` | خدمة Socket.IO مركزية + كتالوج أحداث |

- حماية من تعطل الحزم القديمة بعد النشر: `vite:preloadError` → إعادة تحميل واحد محكوم (SessionStorage guard).


---

## 9) الخادم الخلفي (`server/`)

### سلسلة الـ Middleware (بالترتيب)

```text
compression → CORS whitelist → www→https redirect → /health → helmet (CSP + HSTS)
→ correlationId → audit → monitoring → JSON parser (1MB | 50MB للنسخ الاحتياطي)
→ Rate Limiter عام (/api) → /api routes → معالج أخطاء موحّد → static dist → uploads → prerender
```

### تنظيم المسارات (`server/routes/`)

| المجموعة | المسارات |
|---|---|
| `core/` | `/auth` (login/register/forgot/reset/verify بـ strict limiter 20/15د) · `/upload` |
| `education/` | `/students`, `/teachers`, `/live` (جلسات مباشرة), evaluations, attendance, invoices... |
| `communication/` | `/blog` (عام) · `/public-chat` · `/jobs` · `/contact` · `/blog-customers` |
| `finance/` | فواتير ومدفوعات وإقفال شهري |
| جذر | `/docs` (توثيق API ذاتي من `utils/apiDocs`) · `/system/public-settings` (كاش 60ث) |
| `health` | فحص حياة خارج `/api` — يعرض حالة Redis وعدد fallbacks |

- بعد المسارات العامة: `authMiddleware → sanitizeInput → activityAuditor` تحمي كل ما بعدها.

### الخدمات والخلفيات

| الخدمة | الوظيفة |
|---|---|
| `cacheService` + Redis | كاش استعلامات مع `wrap(key, ttl, fn)` و fallback عند سقوط Redis |
| `services/queue` (BullMQ) | نظام مهام مجدولة + workers مع `initQueueSystem/shutdownSchedulers/shutdownWorkers` |
| `socket/handler` | أحداث Socket.IO (محادثات، تحديثات حية) على `/api/socket.io` |
| `socket/reminderScheduler` | تذكيرات المواعيد (Web Push) |
| `completedSessionsReset` | تصفير جلسات يومي الساعة 00:10 |
| `backupService` | نسخ احتياطي تلقائي (`auto_backup`) + استعادة حتى 50MB |
| `logger` | تسجيل منظم + `close()` عند الإيقاف |

### Prisma — نماذج أساسية

`User` (مع `tokenVersion`) · `Teacher` (أسعار، نقاط، توفر) · `Student` · `Enrollment` · `Session` · `Evaluation` · `TrialSession` · `TeacherInvoice`/فواتير الطلاب · `BlogPost` · `SystemSetting` · إشعارات وجلسات مباشرة — مع فهارس على الهواتف/الإيميلات و`deletedAt` للحذف الناعم.

---

## 10) الأمان

| الطبقة | الإجراء |
|---|---|
| كلمات المرور | bcrypt hashing |
| الجلسات | JWT + `tokenVersion` لإبطال كل التوكنات عند تغييره |
| سر التوقيع | **إجباري**: `JWT_SECRET` — الخادم يفشل عند الإقلاع إذا كان مفقوداً/افتراضياً |
| Headers | helmet (CSP مخصص: GTM/Analytics/Fonts، HSTS سنة مع preload) |
| CORS | قائمة بيضاء: `dareen.cloud` + `FRONTEND_URL` + منافذ localhost في التطوير فقط |
| Rate Limiting | strict 20/15د (تسجيل الدخول) · 100/15د (محادثة عامة) · 300/15د (verify) · عام 3000/15د إنتاج (100000 تطوير) |
| المدخلات | `sanitizeInput` على كل المسارات المحمية + **zod** للتحقق في الخادم |
| التدقيق | `auditMiddleware` (سجل أنشطة) + `correlationId` لتتبع الطلبات + تنبيه admin عند الأخطاء |
| الحجم | حد 1MB للجسم (50MB لنقطة استعادة النسخ) + رسالة 400 واضحة لـ JSON تالف |
| رفع الملفات | عبر `/upload` مع معالجة sharp |


---

## 11) الأداء و PWA

| الآلية | التفصيل |
|---|---|
| Code Splitting | كل الصفحات `lazy()` + `Suspense` + `PageLoader` |
| Chunks يدوية | `vendor` (react) · `socket` · `motion` · `icons` · `date` · `query` · `charts` |
| الصور | `ViteImageOptimizer` (jpg/png/webp 80، avif 65) + `scripts/convert-webp.mjs` قبل البناء + مكون `<Image>` |
| Offline | كاش React Query في IndexedDB (24س) + `public/sw.js` مسجّل ديناميكياً |
| تثبيت | `InstallPWA` يلتقط `beforeinstallprompt` |
| SEO | Helmet ديناميكي + Prerender لعناكب البحث + `/rss.xml` + Sitemap (`routes/seo`) |
| إعادة التحميل الذكي | `vite:preloadError` → تحميل واحد لالتقاط النسخة الجديدة |
| تحليل الحزمة | `VISUALIZE=true npm run build` → visualizer |

---

## 12) الاختبارات

```bash
npm run test            # Vitest (frontend) — run مرة واحدة
npm run test:watch      # وضع المراقبة
npm run test:coverage   # تغطية v8
npm run test:e2e        # Playwright
npm run test:e2e:ui     # واجهة Playwright
cd server && npm test   # اختبارات الخادم (Vitest + Supertest + embedded-postgres)
```

---

## 13) الأوامر والسكريبتات

### الجذر

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل Vite فقط (http://localhost:5173) |
| `npm run server` | تشغيل الخادم (http://localhost:3001) |
| `npm run dev:all` | الخادم + الواجهة معاً (concurrently) |
| `npm run build` | `convert-webp` + `vite build` → `dist/` |
| `npm run preview` | معاينة البناء |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm start` | تشغيل الخادم (إنتاج) |

> `postinstall` يثبّت تبعيات `server/` تلقائياً.

### الخادم (`cd server`)

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | `node --watch index.js` |
| `npm test` | Vitest للخادم |
| `npx prisma migrate dev` / `deploy` | ترحيلات قاعدة البيانات |

---

## 14) متغيرات البيئة

### `server/.env` (إجبارية قبل الإقلاع)

| المتغير | الوصف |
|---|---|
| `JWT_SECRET` | **إجباري** — يرفض الإقلاع بقيمته الافتراضية |
| `PORT` | الافتراضي 3001 |
| `FRONTEND_URL` | للسماح بالـ CORS (إنتاج) |
| `DATABASE_URL` | اتصال PostgreSQL (Prisma) |
| `NODE_ENV` | `production` يقفل CORS على الدومينات الرسمية |
| `PRERENDER_TOKEN` | توكن التقديم المسبق |
| إعدادات Redis/Push | `REDIS_URL`، مفاتيح VAPID لـ web-push |

> إنشاء: انسخ نموذج البيئة إلى `server/.env` وضع سراً قوياً.

---

## 15) النشر

| المكوّن | المنصة | الأمر |
|---|---|---|
| الواجهة | **Vercel** | `npm run deploy:frontend` (build + vercel --prod) |
| الخادم | **Railway** | `npm run deploy:backend` (railway up) |
| الدومين | `dareen.cloud` | إعادة توجيه www→https + HSTS في الخادم |

- الخادم يخدم `dist/` المبنية أيضاً (وضع monolith اختياري) مع كاش سنة للأصول و`no-cache` للـ HTML و`sw.js`.
- الإقفال الأنيق (Graceful Shutdown): يوقف المجدولين والـ workers والنسخ الاحتياطي ثم يفصل Prisma.

---

## 16) قواعد التطوير الإلزامية

1. **أي مكون/صفحة جديدة تستخدم Semantic Tokens فقط** — لا HEX، لا ألوان Tailwind مسماة خارج `src/theme/` و `src/styles/` (مخالفة = فشل Code Review).
2. **Feature-based structure**: المنطق في `features/<name>/{pages,components,hooks,types,utils}`؛ `pages/` مجرد wrappers توجيهية.
3. **استيراد UI من الـ barrel**: `import { Button } from '../shared/components/ui'`.
4. **RTL-first**: `ms-/me-` و `gap`، ودعم الوضعين الليلي/النهاري دائماً.
5. **TypeScript صارم**: لا `any`، لا `@ts-ignore`.
6. **قرارات معمارية** تُوثّق كـ ADR في `docs/adr/`.
7. **قبل أي commit**: `npm run typecheck` + `npm run lint` + الاختبارات ذات الصلة.

---

## 17) حالات السباقات المكتملة (خلاصة تاريخية)

| السباق | النتيجة |
|---|---|
| Sprint 1–2 | الأساس: توكنات + ثيم + Playground + توثيق + إمكانية وصول (tag `design-system-v1.0`) |
| Sprint 3A–3E | إعادة بناء المكونات المشتركة، Layout، Widgets، كل الصفحات (P0=P1=0) |
| Sprint 4A | تصفير المخالفات على مستوى المشروع: 568 HEX → 0، 5004 ألوان مسماة → 0، rgba → 8 CSS-var فقط |
| Sprint 5 | DataTable headless، نظام النماذج، ثيم داكن متوافق WCAG، Skeletons، فصل التوكنات (tag `design-system-v1.1`) |
| v1.2 | Container، focus-visible، Motion tokens، Elevation، Dialog/Avatar/Dropdown (tag `design-system-v1.2`) |

---

*آخر تحديث للوثيقة: أغسطس 2026 — تُحدَّث عند أي تغيير معماري.*