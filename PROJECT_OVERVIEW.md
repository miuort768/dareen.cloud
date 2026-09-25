# 📘 دارين السابعة للتعليم والتدريب — نظرة شاملة على المشروع
# Darin Institute — Complete Project Overview

> وثيقة مرجعية شاملة (Single Source of Truth) للمشروع — عربي/English بجانب بعض لكل قسم.
> This is the combined technical reference: architecture, stack, database, design system, security, deployment and the 2026 changelog.
>
> **الدومين / Domain:** `dareen.cloud` · **الإصدار / Version:** v2.0.0 · **الترخيص / License:** MIT

---

## 1) نظرة عامة — Overview

نظام إدارة متكامل لمعهد **دارين السابعة للتعليم والتدريب** يدمج منصة عامة ونظام إدارة داخلي في تطبيق واحد:

A full-featured institute management system combining a public marketing site and an internal multi-role management suite in one application.

| الخاصية / Property | القيمة / Value |
|---|---|
| اللغة والاتجاه | عربي بالكامل — RTL / Arabic-first, fully RTL |
| الوضع الليلي | مدعوم بالكامل (`darkMode: 'class'`) / Full dark mode |
| الأدوار / Roles | 5: `admin`, `teacher`, `parent`, `student`, `chat_user` |
| قاعدة البيانات / DB | PostgreSQL عبر / via Prisma |
| الزمن الحقيقي / Realtime | Socket.IO على / on `/api/socket.io` |
| PWA | قابل للتثبيت + عمل جزئي دون اتصال / Installable + offline via IndexedDB + Service Worker |

### المكوّنات / Components

- **المنصة العامة (Public Site):** صفحة رئيسية، منصة كتب/مدونة، مقررات، توظيف، تواصل، سياسات — مهيّأة لمحركات البحث (Prerender + RSS + Sitemap).
- **نظام الإدارة (Institute Suite):** لوحات تحكم لكل دور (Admin / Teacher / Parent / Student) تغطي الطلاب، المعلمين، أولياء الأمور، المالية والفواتير، الحضور، الجداول والمواعيد، التقييمات، التقارير، المهام، الإعلانات، المنتدى، والمحادثات.

- **Public platform:** landing, books/blog library, courses, jobs, contact, policies — SEO-ready (Prerender + RSS + Sitemap).
- **Institute suite:** per-role dashboards covering students, teachers, parents, finance/invoices, attendance, schedules/appointments, evaluations, reports, tasks, announcements, forum and realtime chat.

---

## 2) المكدس التقني — Tech Stack

### الواجهة الأمامية — Frontend (`src/`)

| المجال / Area | التقنية / Technology | ملاحظات / Notes |
|---|---|---|
| الإطار / Framework | **React 18.3** + **TypeScript 5.4** | StrictMode + ErrorBoundary |
| البناء / Build | **Vite 6** | alias `@ → ./src`، proxy `/api → :3001` |
| التوجيه / Routing | **react-router-dom 7** | تحميل كسول `lazy()` لكل الصفحات |
| حالة الخادم / Server state | **TanStack React Query 5** | persist إلى IndexedDB (idb-keyval) — 24 ساعة |
| حالة العميل / Client state | **Zustand 5** | auth, ui, chat, unread, settings, user stores |
| الأنماط / Styling | **Tailwind CSS 3.4** | عبر CSS Variables (نظام Semantic Tokens) |
| الحركة / Motion | **Framer Motion 12** | انتقالات الصفحات والقوائم + `reducedMotion` |
| الرسوم / Charts | **Recharts** | ChartContainer/ChartTooltip موحّدة |
| الأيقونات / Icons | **lucide-react** | — |
| UI Primitives | **@radix-ui** (Avatar, Dialog, Slot) | أساس مكونات النظام |
| SEO | **react-helmet-async** | Meta ديناميكي لكل صفحة |
| إضافي / Extra | dompurify, date-fns, react-virtuoso, xlsx, socket.io-client | أمان HTML، بيانات، قوائم طويلة، Excel |

### الخادم الخلفي — Backend (`server/`)

| المجال / Area | التقنية / Technology |
|---|---|
| الإطار / Framework | **Node.js + Express 4** (CommonJS) |
| ORM | **Prisma 7** + PostgreSQL (`@prisma/adapter-pg` / libsql) |
| المصادقة / Auth | **JWT** + **bcrypt** + tokenVersion (إبطال الجلسات) |
| Realtime | **Socket.IO 4** |
| الكاش / Cache | **Redis** (ioredis) مع fallback عند تعذّر الاتصال |
| الطوابير / Queues | **BullMQ** (مهام مجدولة + workers) |
| الملفات / Files | multer + sharp (معالجة صور) |
| المستندات / Docs | pdfkit (فواتير PDF) + exceljs (Excel) |
| الإشعارات / Notifications | web-push (Web Push) |
| التحقق / Validation | **zod** |
| SEO | prerender-node |

### الاختبارات والجودة — Testing & Quality

| الأداة / Tool | الاستخدام / Use |
|---|---|
| Vitest + @testing-library + msw + jsdom | اختبارات الواجهة (165+ اختباراً) |
| Playwright | اختبارات E2E (`npm run test:e2e`) |
| ESLint + Prettier (+ prettier-plugin-tailwindcss) | جودة وتنسيق |
| Husky + lint-staged | فحوصات ما قبل الـ commit |
| ts-prune (`npm run census`) | كشف الصادرات الميتة |
| `census:colors` (census/census-colors.cjs) | إعادة تدقيق ألوان النظام دائمة |

---

## 3) المعمارية — Architecture

### سلسلة التوكن — Token Chain

```text
المكونات Components (.tsx)
    ↓  (use only semantic token class names)
Semantic Tokens (tailwind.config.js → CSS variables)
    ↓  (mapped to palette colors per theme)
Palette (src/theme/palette.ts)
    ↓  (raw color values)
Primitives (src/theme/primitives.ts)
```

### مسار الطلب — Request Flow

```text
Client → Cloudflare CDN → Nginx/HTTPS → Express (3001)
    → Rate Limiting → CORS → Helmet
    → Correlation ID → Auth Middleware
    → Route Handler (Prisma)
    → Socket.IO (realtime) || JSON Response
```

### تقسيم الحزم — Code Splitting

- كل الصفحات `lazy()` + `Suspense` + `PageLoader`
- Chunks يدوية: `vendor` (react) · `socket` · `motion` · `icons` · `date` · `query` · `charts`
- xlsx يُحمَّل ديناميكياً (chunk معزول) — لا يثقل الحزمة الرئيسية

---

## 4) هيكل المجلدات — Folder Layout

```text
new-kk/
├── src/
│   ├── main.tsx            # الدخول: QueryClient + Persist(IndexedDB) + SW + الثيم
│   ├── App.tsx             # التوجيه + ProtectedRoute + Lazy Loading
│   ├── features/           # 19 وحدة Feature-Based
│   │   ├── announcements/  # الإعلانات
│   │   ├── appointments/   # المواعيد/الجلسات الحرة
│   │   ├── attendance/     # الحضور والغياب
│   │   ├── chat/           # المحادثة الفورية (WhatsApp-like)
│   │   ├── crm/            # Leads + TrialSessions
│   │   ├── dashboard/      # لوحات التحكم (Desktop + Mobile views)
│   │   ├── design-system/  # صفحة Playground
│   │   ├── evaluations/    # التقييمات
│   │   ├── finance/        # المالية والفواتير
│   │   ├── forum/          # المنتدى
│   │   ├── parents/        # أولياء الأمور
│   │   ├── profile/        # صفحات الحساب (Teacher/Student/Parent)
│   │   ├── reports/        # التقارير
│   │   ├── roles/          # خدمات الأدوار (الخدمة فقط — الصفحة محذوفة)
│   │   ├── schedule/       # الجداول والأجندة
│   │   ├── settings/       # إعدادات النظام
│   │   ├── students/       # الطلاب
│   │   ├── tasks/          # المهام
│   │   └── teachers/       # المعلمون
│   ├── pages/              # wrappers توجيهية + صفحات عامة
│   ├── shared/
│   │   ├── components/ui/  # UI Kit (barrel export index.ts)
│   │   └── components/mobile/# MobilePage, PullToRefresh, DayDropdown...
│   ├── components/         # Layout, ErrorBoundary, PageLoader, Toast...
│   ├── context/            # AppContext (المصادقة والإعدادات)
│   ├── store/              # Zustand stores
│   ├── hooks/              # useChat, useChatSocketInit...
│   ├── lib/                # api, socket, socket-events, utils (cn/tailwind-merge)
│   ├── services/           # طبقات خدمة
│   ├── types/              # الأنواع المشتركة
│   ├── theme/              # 🚫 حدود الألوان الأولية
│   └── styles/tokens/      # CSS Variables لكل دومين
├── server/
│   ├── index.js            # Bootstrap + socket.io + shutdown graceful
│   ├── routes/             # core/ education/ communication/ finance/ admin/ seo/ health
│   ├── middleware/         # auth, permissions, rateLimiter, audit, monitoring...
│   ├── services/           # cacheService, backupService, queues (BullMQ), schedulers
│   ├── socket/             # handler + reminderScheduler
│   ├── prisma/             # schema.prisma (PostgreSQL)
│   └── utils/              # prisma, logger, redis, apiDocs
├── docs/adr/               # 4 قرارات معمارية موثقة (ADR-001..004)
├── census/                 # census-colors.cjs (إعادة تدقيق الألوان)
├── scripts/                # codemod-p1.ps1, convert-webp.mjs
├── .github/workflows/      # ci.yml (lint/typecheck/test/build)
└── public/                 # أصول ثابتة + sw.js + ads.txt
```

---

## 5) الأدوار والصلاحيات — Roles & Permissions

| الدور / Role | الوصف / Description | قواعد الوصول / Access |
|---|---|---|
| `admin` | الإدارة الكاملة | كل الصلاحيات (`*`) |
| `teacher` | المعلم | لوحة المعلم، التقييمات، الحضور، الجداول، المواعيد، المنتدى، سجل المدفوعات |
| `parent` | ولي الأمر | صفحات `parent_*` + الصلاحيات المشتركة (schedule, announcements, appointments, forum) |
| `student` | الطالب | لوحة الطالب، المواعيد، الإعلانات، الفواتير |
| `chat_user` | محادثة عامة | يُوجَّه إجبارياً إلى `/chat` عند تسجيل الدخول |

- **إعادة توجيه الدخول:** `DashboardRedirect` يوجه كل دور إلى لوحته (`/admin-dashboard`, `/teacher-dashboard`, `/parent-dashboard`, `/student-dashboard`, `/chat`).
- بدون صلاحية → `/`؛ غير مسجّل → `/login`.
- Managed via `ProtectedRoute` in `App.tsx` + per-user `permissions`.

---

## 6) خريطة المسارات — Routes

### عامة (بدون مصادقة) — Public (no auth)

| المسار | الصفحة / Page |
|---|---|
| `/` | الصفحة الرئيسية / Landing |
| `/courses` | المقررات |
| `/books` · `/books/:slug` | المكتبة/المدونة + مقال |
| `/about` · `/contact` | من نحن · تواصل معنا |
| `/jobs` | التوظيف |
| `/login` | تسجيل الدخول |
| `/privacy-policy` · `/refund-policy` · `/terms-of-service` · `/terms-of-work` | السياسات |
| `/chat` | المحادثة العامة (chat_user) |
| `*` | 404 NotFound |

### محمية (داخل Layout) — Protected

| المسار | الصلاحية / Permission | الوحدة / Module |
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
| `/finance` | `finance` | المالية |
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
| `/parent-payment-history` · `/student-invoices` | حسب الدور | سجلات الدفعات |
| `/student-profile` · `/teacher-profile` · `/parent-profile` | حسب الدور | صفحات الحساب |
| `/admin/blog` · `/admin/blog-customers` | `admin` | إدارة المدونة والعملاء |
| `/admin-jobs` · `/admin-contacts` | `admin` | التوظيف وجهات الاتصال |

> **ملاحظة:** صفحتا `/monitoring` و `/roles` أُزيلتا من التوجيه (سبتمبر 2026) — خدمة الأدوار بقيت للإعدادات.
> **Note:** `/monitoring` and `/roles` pages were removed (Sep 2026); the roles service remains for settings.

---

## 7) الوحدات الوظيفية — Functional Modules

| الوحدة / Module | أبرز الإمكانات / Highlights |
|---|---|
| **لوحات التحكم** | عرض تنفيذي + نسخة موبايل لكل دور، KPI Cards، رسوم بيانية، إجراءات سريعة، موجز نشاط |
| **الطلاب** | تسجيل، تسجيلات (Enrollments) بالمعلمين، تجميد/تفعيل، فواتير، أرصدة وتنبيه سقف |
| **المعلمون** | ملفات، أسعار جلسات، عمولات، توفر (Availability)، نقاط ومكافآت، إعداد طرق دفع (Wallet/Instapay/Bank) |
| **أولياء الأمور** | متابعة الأبناء، إشعارات، سجل مدفوعات، لوحة خاصة |
| **الحضور** | تسجيل لكل فترة، تسجيل آمن (SecureAttendanceModal)، نسخة موبايل مع Pull-to-Refresh، سجل مضمّن |
| **المالية** | فواتير الطلاب والمعلمين، مصروفات ثابتة، إقفال شهري، معاينة فاتورة PDF، عملات وأسعار صرف |
| **الجداول والمواعيد** | جدول أسبوعي، أجندة، مواعيد (Appointments)، تذكيرات (Socket + Web Push + مجدول) |
| **التواصل** | محادثة فورية (Socket.IO) مع Unread، منتدى، إعلانات متعددة الأنواع |
| **CRM** | Leads + جلسات تجريبية + Admin Contacts + متقدمي وظائف + عملاء المدونة |
| **المحتوى** | مدونة/كتب (AdminBlog) بتصنيفات ومناهج، RSS، Sitemap، Prerender |
| **النظام** | إعدادات (اسم الأكاديمية، الشعار، البانرات، الواتساب، الفصول، وضع الصيانة)، نسخ احتياطي واستعادة (حتى 50MB) |

---

## 8) قاعدة البيانات — Database (Prisma / PostgreSQL)

نماذج أساسية عبر `server/prisma/schema.prisma`:

| المجال / Domain | النماذج / Models |
|---|---|
| **Core** | `User` (مع `tokenVersion`), `Teacher`, `Student`, `Parent`, `Enrollment` (سجل teacher + sessions)، `PointsLog`, `Account` (بريمات مصيرية: accountType/entityId) |
| **Education** | `Session`, `LiveSession` (رابط Meet خارجي), `ActiveSession`, `Evaluation`, `TrialSession`, `TeacherAvailability` |
| **Finance** | `StudentInvoice`, `TeacherInvoice`, `ManualTransaction`, `FixedExpense`, `Currency`, `ExchangeRate`, `FinancialSetting`, `TeacherPaymentSetting` |
| **Content & Comm** | `BlogPost` (أعمدة SEO كاملة), `BlogCustomer`, `Lead`, `JobApplication`, `ContactMessage`, `Conversation`/`ConversationMember`/`Message`, `ChatProfile`, `ForumPost`/`ForumComment` (type + savedBy), `Announcement` |
| **System** | `SystemSetting`, `Task`, `CompletedSession`, `AuditLog` (تعقب تفصيلي), `Notification`, `PushSubscription`, `Backup`, `PasswordResetToken`, `Role`/`Permission`/`RolePermission`/`UserRole`/`PermissionAudit`, `WhatsAppTemplate` |

- فهارس على الهواتف/الإيميلات/التواريخ + `deletedAt` للحذف الناعم.
- أعمدة ForumPost الجديدة (`type`, `savedBy`) وموعد Prisma migration `20260910000000` (additive).

---

## 9) نظام التصميم — Design System

### القواعد غير القابلة للتفاوض — Non-Negotiable Rules

1. **مكونات تستخدم Semantic Tokens فقط** — لا HEX في المكونات (الاستثناء: `src/theme/` و `src/styles/`).
2. **ممنوع ألوان Tailwind المسماة** (`bg-indigo-500`...) في المكونات.
3. **لا استيراد Palette/Primitives** خارج طبقة الثيم.
4. **ألوان الحالة (Success/Warning/Error/Info) ثابتة عبر الثيمات** (ADR-004) بمستويات AA.
5. `text-white/black` مرفوضة — البدائل `text-on-primary`, `text-inverse` (استثناء تأثيرات الزجاج).
6. **مُعدّل الشفافية `/50` لا يعمل مع متغيرات hex** — استخدم توكنات مسماة (أو معرّفات RGB triplet في النطاقات).
7. **RTL-first:** `ms-/me-` و `gap` بدل `ml-/mr-`، `focus-visible` للوصولية، `start/end` للتباعد.

### سلسلة التوكن — Token files

- `src/styles/tokens/` — ملفات CSS لكل دومين (colors/semantic-tokens, spacing, elevation, motion, typography...).
- `src/styles/semantic-tokens.css` + `design-tokens.css` مدمجتان في `src/main.tsx`.
- الطباعة: `text-display/section/card-title/button/micro` + `tracking-label` — لا px عشوائي.
- الحركة: `--duration-fast/normal/slow` → `duration-fast` إلخ. الظلال: `elevation-0..4` + `shadow-card/gold/glass/soft`.
- Container: `--container-width: 1280px` → `max-w-page` (وسّع في سبتمبر 2026).

### مكتبة المكونات المشتركة — Shared UI Kit (`src/shared/components/ui`, barrel export)

`Button · Input · Card · Spinner · Skeleton(+Text/Avatar/Card/Chart/Table) · Badge · Tabs · Breadcrumb · StatCard · ActivityFeed · PageHeader · Image · Table(+Column) · Dialog · Avatar · Dropdown · SectionErrorBoundary · ProgressBar · EmptyState · ErrorState/ErrorBanner · IconButton · FilterDropdown · ActionButton/ActionRow`

- خارج الـ barrel تُستورد مباشرة: ConfirmModal, SecureAttendanceModal, SendNotificationModal, SuccessModal, AnnouncementsBanner, DashboardSectionCard, GradientHeroCard, SectionCard (المكوّن الموحّد الوحيد بعد دمج 8 نسخ), DayDropdown (مشترك), CountUp...

### نطاقات هوية الأدوار — Scoped Role Identities

| النطاق / Scope | الهوية / Identity | الاستخدام / Used in |
|---|---|---|
| `.student-scope` | **أخضر (Green)** نهاراً فقط — Gold ليلاً | لوحة الطالب (الكل) عبر Layout |
| `.parent-scope` | **برتقالي (Orange)** نهاراً فقط — Gold ليلاً | لوحة ولي الأمر (المكوّن فقط) |
| `.profile-scope` | **أخضر يشمي/جاد (Jade)** عبر CSS vars | صفحات الحساب الثلاث (الموارد فقط) |

النطاقات تُعرّف CSS variables + RGB triplet (`--color-primary 22 163 74`) لتشغيل معدّلات الشفافية — دون لمس السلسلة الذهبية/زنبقية العالمية.

### تجربة الجوال — Mobile UX (v1.3)

- Modal → **Bottom Sheet** على الجوال (`< md`)، متمركز على الديسكتوب.
- أهداف لمس ≥44px، جداول تتحول **كروت** على الجوال، تبويبات scrollable، FAB فوق AppTabBar، حواف متلاصقة (`px-2` من Layout فقط).

---

## 10) إدارة الحالة والبيانات — State & Realtime

| الطبقة / Layer | الأداة / Tool | المحتوى / Content |
|---|---|---|
| حالة الخادم | **React Query** (staleTime 5د، gcTime 30د) | API + **Persist في IndexedDB (24س)** لدعم العمل دون اتصال |
| المصادقة | `AppContext` + `store/authStore` | المستخدم، الصلاحيات، الإعدادات، وضع الصيانة |
| الواجهة | `store/uiStore` | الثيم، Toasts، إشعارات native |
| المحادثة | `chatStore`, `chatUIStore`, `unreadStore` | الرسائل، الكتابة، غير المقروء — عبر Socket.IO |
| الإعدادات | `settingsStore` | إعدادات النظام العامة |
| HTTP | `lib/api` | fetch موحّد + `safeArray` helpers |
| Realtime | `lib/socket` + `lib/socket-events` | خدمة Socket.IO مركزية + كتالوج أحداث |

- حماية الحزم القديمة بعد النشر: `vite:preloadError` → إعادة تحميل واحدة محكومة.

---

## 11) الخادم الخلفي — Backend Internals

### سلسلة الـ Middleware (بالترتيب)

```text
compression → CORS whitelist → www→https → /health → helmet (CSP + HSTS)
→ correlationId → audit → monitoring → JSON parser (1MB | 50MB backup)
→ Rate Limiter عام (/api) → /api routes → معالج أخطاء موحّد
→ static dist → uploads → prerender
```

### مجموعات المسارات — Route groups

| المجموعة / Group | المسارات / Routes |
|---|---|
| `core/` | `/auth` (strict limiter 20/15د) · `/upload` |
| `education/` | `/students`, `/teachers`, `/live`, evaluations, attendance, invoices, sessions... |
| `communication/` | `/blog`, `/public-chat`, `/jobs`, `/contact`, `/blog-customers` |
| `finance/` | فواتير ومدفوعات وإقفال شهري |
| `admin/` | organización, roles, backups, monitoring (side) |
| جذر / Root | `/docs` (API documented) · `/system/public-settings` (cache 60s) |
| `health` | فحص حياة — حالة Redis وعدد fallbacks |

- بعد المسارات العامة: `authMiddleware → sanitizeInput → activityAuditor`.

### الخدمات والخلفيات — Services & background jobs

| الخدمة / Service | الوظيفة / Function |
|---|---|
| `cacheService` + Redis | كاش استعلامات مع `wrap(key, ttl, fn)` + fallback |
| `services/queue` (BullMQ) | مهام مجدولة + workers |
| `socket/handler` | أحداث Socket.IO على `/api/socket.io` |
| `socket/reminderScheduler` | تذكيرات المواعيد (Web Push) |
| `completedSessionsReset` | تصفير جلسات يومي الساعة 00:10 |
| `backupService` | نسخ احتياطي تلقائي + استعادة حتى 50MB |
| `logger` | تسجيل منظم + `close()` عند الإيقاف |

---

## 12) الأمان — Security

| الطبقة / Layer | الإجراء / Measure |
|---|---|
| كلمات المرور | bcrypt hashing |
| الجلسات | JWT + `tokenVersion` (إبطال كل التوكنات) |
| سر التوقيع | **إجباري** `JWT_SECRET` — يرفض الإقلاع إذا مفقوداً/افتراضياً |
| Headers | helmet (CSP مخصص: GTM/Analytics/Fonts، HSTS سنة مع preload) |
| CORS | قائمة بيضاء: `dareen.cloud` + `FRONTEND_URL` + localhost (dev فقط) |
| Rate Limiting | 20/15د (login) · 100/15د (public chat) · 300/15د (verify) · عام 3000/15د (prod) |
| المدخلات | `sanitizeInput` على المسارات المحمية + **zod** |
| التدقيق | auditMiddleware + correlationId + تنبيه admin عند الأخطاء |
| Socket | تحقق `conversationMember` في join/typing (توازٍ مع REST) |
| الحجم | 1MB للجسم (50MB لنقطة النسخ) |

---

## 13) الأداء و PWA — Performance & PWA

| الآلية / Mechanism | التفصيل / Detail |
|---|---|
| Code Splitting | كل الصفحات `lazy()` + Suspense + PageLoader |
| Chunks يدوية | vendor / socket / motion / icons / date / query / charts |
| الصور | ViteImageOptimizer + `scripts/convert-webp.mjs` + مكوّن `<Image>` |
| Offline | كاش React Query في IndexedDB (24س) + `public/sw.js` |
| تثبيت PWA | `InstallPWA` يلتقط `beforeinstallprompt` |
| SEO | Prerender + `/rss.xml` + Sitemap + Helmet ديناميكي |
| AdSense | meta + loader في `index.html` + `public/ads.txt` |
| تحليل الحزمة | `VISUALIZE=true npm run build` → visualizer |

---

## 14) الاختبارات — Testing

```bash
npm run test            # Vitest (frontend) — run مرة واحدة (165+)
npm run test:watch      # وضع المراقبة
npm run test:coverage   # تغطية v8
npm run test:e2e        # Playwright
npm run test:e2e:ui     # واجهة Playwright
npm run census          # ts-prune — كشف الصادرات الميتة (صفر)
npm run census:colors   # إعادة تدقيق ألوان النظام (P0=P1=0)
cd server && npm test   # اختبارات الخادم (Vitest + Supertest + embedded-postgres)
```

---

## 15) الأوامر والسكريبتات — Scripts

### الجذر — Root

| الأمر / Command | الوظيفة / Function |
|---|---|
| `npm run dev` | Vite فقط (http://localhost:5173) |
| `npm run server` | الخادم (http://localhost:3001) |
| `npm run dev:all` | الخادم + الواجهة معاً (concurrently) |
| `npm run build` | `convert-webp` + `vite build` → `dist/` |
| `npm run preview` | معاينة البناء |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm start` | تشغيل الخادم (إنتاج) |

> `postinstall` يثبّت تبعيات `server/` تلقائياً.

### الخادم — Server (`cd server`)

| الأمر / Command | الوظيفة / Function |
|---|---|
| `npm run dev` | `node --watch index.js` |
| `npm test` | Vitest للخادم |
| `npx prisma migrate dev` / `deploy` | ترحيلات قاعدة البيانات |

---

## 16) متغيرات البيئة — Environment Variables

### `server/.env` (إجبارية قبل الإقلاع)

| المتغير / Variable | الوصف / Description |
|---|---|
| `JWT_SECRET` | **إجباري** — يرفض الإقلاع بقيمته الافتراضية |
| `PORT` | الافتراضي 3001 |
| `FRONTEND_URL` | للسماح بالـ CORS (إنتاج) |
| `DATABASE_URL` | اتصال PostgreSQL (Prisma) |
| `NODE_ENV` | `production` يقفل CORS على الدومينات الرسمية |
| `PRERENDER_TOKEN` | توكن التقديم المسبق |
| Redis/Push | `REDIS_URL`، مفاتيح VAPID لـ web-push |

---

## 17) النشر — Deployment

| المكوّن / Component | المنصة / Platform | الأمر / Command |
|---|---|---|
| الواجهة / Frontend | **Vercel** | `npm run deploy:frontend` (build + vercel --prod) |
| الخادم / Backend | **Railway** | `npm run deploy:backend` (railway up) |
| الدومين / Domain | `dareen.cloud` | إعادة توجيه www→https + HSTS في الخادم |

- الخادم يخدم `dist/` المبنية أيضاً (monolith اختياري) مع كاش سنة للأصول و`no-cache` للـ HTML و`sw.js`.
- إقفال أنيق (Graceful Shutdown): المجدولون ← workers ← النسخ الاحتياطي ← Prisma.
- **CI:** `.github/workflows/ci.yml` — gates: ESLint ← `tsc -b` ← Vitest ← Vite build (على push + PR).

---

## 18) سجل التغييرات الحديث — Changelog 2026

> ملخّص من `AGENTS.md`. للتفاصيل الكاملة راجع: `AGENTS.md`.
> Condensed from AGENTS.md; see AGENTS.md for the full record.

| التاريخ / Date | الإنجاز / Milestone |
|---|---|
| يونيو–يوليو / Jun–Jul | هجرة نظام التصميم — P0 (HEX)=0، P1 (named)=0، P2 و P3 موثّقان (Sprint 4A) |
| يوليو / Jul | v1.1 (DataTable headless + forms + dark AA) و v1.2 (Container, focus-visible, Motion, Elevation, Dialog/Avatar/Dropdown) |
| سبتمبر / Sep | **v1.3 Mobile Dashboard UX** (~122 ملف): Bottom Sheets، أهداف لمس 44px، جداول→كروت، FAB، ربط الزوايا، تكامل العربية (بايتات) |
| 04–11 سبتمبر | موبايل-أول: صفحات الحساب (هوية Jade الخاصة)، Tasks بأسلوب «الأبناء»، قوائم Appointments، إعادة تصميم Evaluations (مضمّنة)، Chat (تحسينات + تحكّم)، استعادة الصفحات من النوافذ العائمة |
| 12–13 سبتمبر | Parent-students (بوابات ملاحظات)، خدمة أسماء المعلمين الموحّدة (relation → string)، Attendance (بوابات + قائمة مضمنة + تصفية admin)، ثغرة swipe-back المنزلية محذوفة |
| 15–16 سبتمبر | هوية الأدوار: `.student-scope` (أخضر) و `.parent-scope` (برتقالي)، تحسينات الديسكتوب للوحتين، AnnouncementsBanner + Support strips |
| 18 سبتمبر | نافذة الإشعارات (دمج + دفعات)، حذف صفحة `/roles` + checkbox ميت (الإعدادات تحتفظ بالخدمة) |
| 19 سبتمبر | Google AdSense — verification meta + loader + `ads.txt` |
| 21–24 سبتمبر | تنظيف: 4 جولات حذف، `tsc` صفر أخطاء، `npm audit` (4 waivers موثّقة)، CI workflow، `census` (ts-prune) + `census:colors`، merge ضد tailwind-merge |
| 26 سبتمبر | Census delta: P2=148 / P3=14 جميعها مبررة (glass/decorative) — P0=P1=0 |

---

## 19) قواعد التطوير الإلزامية — Dev Rules

1. **أي مكوّن/صفحة جديدة تستخدم Semantic Tokens فقط** — لا HEX، لا ألوان Tailwind مسماة (مخالفة = فشل Code Review).
2. **Feature-based structure:** منطق في `features/<name>/{pages,components,hooks,types,utils}`.
3. **استيراد UI من الـ barrel**: `import { Button } from '../shared/components/ui'`.
4. **RTL-first:** `ms-/me-` و `gap`، ودعم الوضعين الليلي/النهاري دائماً.
5. **TypeScript صارم:** لا `any`، لا `@ts-ignore`.
6. **قرارات معمارية** تُوثّق كـ ADR في `docs/adr/`.
7. **قبل أي commit:** `npm run typecheck` + `npm run lint` + الاختبارات ذات الصلة.

---

## 20) حالة التقدم — Sprint Status

| السباق / Sprint | النتيجة / Result |
|---|---|
| Sprint 1–2 | الأساس: توكنات + ثيم + Playground + توثيق + إمكانية وصول (tag `design-system-v1.0`) |
| Sprint 3A–3E | إعادة بناء المكونات المشتركة، Layout، Widgets، كل الصفحات (P0=P1=0) |
| Sprint 4A | تصفير المخالفات: 568 HEX → 0، 5004 ألوان مسماة → 0، rgba → CSS-var فقط |
| Sprint 5 | DataTable headless، نظام النماذج، ثيم داكن WCAG AA، Skeletons، فصل التوكنات (tag `design-system-v1.1`) |
| v1.2 | Container، focus-visible، Motion tokens، Elevation System، Dialog/Avatar/Dropdown (tag `design-system-v1.2`) |
| v1.3 | Mobile Dashboard UX — Premium Mobile Experience (~122 ملف) |
| 2026 cleanup | `tsc` 0 خطأ · 165+ اختبار · census x2 (ts-prune + colors) = صفر · CI green |

---

*آخر تحديث / Last updated: September 2026 — تحدَّث الوثيقة عند أي تغيير معماري. / Update whenever architecture changes.*