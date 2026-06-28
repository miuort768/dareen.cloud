# خطة التطوير الشاملة - دارين السابعة

> باستثناء تطبيقات الجوال (Capacitor)

---

## نظرة عامة على الأولويات

```
الأولوية   |      المدة      |   المخاطرة   |  القيمة
──────────┼────────────────┼──────────────┼──────────
1. Prisma  │  4-6 أسابيع    │   متوسطة     │    عالية
2. PostgreSQL │  1-2 أسبوع  │   عالية      │    عالية جداً
3. Redis   │  1-2 أسبوع    │   منخفضة     │    عالية
4. Backup  │  1 أسبوع      │   منخفضة     │    عالية جداً
5. Monitoring │  2 أسبوع   │   منخفضة     │    عالية
6. Modular │  3-4 أسابيع   │   متوسطة     │    متوسطة
7. Tests   │  4-6 أسابيع   │   منخفضة     │    عالية
────────────────────────────────────────────────
المجموع   │  16-22 أسبوعاً │              │
```

---

## ملخص التبعيات (Dependency Graph)

```
Prisma Migration (6wks)
    │
    ▼
PostgreSQL (2wks) ──────────────┐
    │                            │
    ▼                            ▼
Redis (2wks)          Backup & Restore (1wk)
    │                            │
    ├────────────────────────────┘
    ▼
Monitoring (2wks)
    │
    ▼
Modularization (4wks)
    │
    ▼
Tests (6wks)
```

- **Prisma → PostgreSQL**: لا يمكن البدء بـ PostgreSQL قبل إنهاء Prisma
- **PostgreSQL → Redis (Cache)**: يمكن البدء معاً
- **PostgreSQL → Backup**: الـ backup المنظّم بعد PostgreSQL
- **Redis → Monitoring**: مفيد لكن غير ضروري
- **كل ما سبق → Modularization**: أسهل بعد اكتمال Prisma + PostgreSQL
- **كل ما سبق → Tests**: يجب أن تكون DB مستقرة قبل كتابة الاختبارات

---

## الجدول الزمني الإجمالي

```
الأسبوع   | المرحلة
──────────┼─────────────────────────────────
1-2       │ Prisma 1: مسارات بسيطة
3         │ Prisma 2: مسارات متوسطة
4         │ Prisma 3: مسارات متوسطة-صعبة
5         │ Prisma 4: مسارات أساسية + بداية 5
6         │ Prisma 6+7: Chat, Live, System
──────────┼─────────────────────────────────
7-8       │ PostgreSQL + هجرة البيانات
──────────┼─────────────────────────────────
9         │ Redis (Cache + Queue)
10        │ Backup & Restore
11-12     │ Monitoring (Sentry, Winston, Grafana)
──────────┼─────────────────────────────────
13-16     │ Backend Modularization
──────────┼─────────────────────────────────
17-22     │ Integration + E2E Tests
──────────┼─────────────────────────────────
          │ الإطلاق: الأسبوع 22
```

---

## المرحلة 1: إنهاء الهجرة إلى Prisma (4-6 أسابيع)

**الهدف:** تحويل ~260 استعلام SQL خام في 25 ملفاً إلى Prisma ORM.

### التقسيم حسب الدفعات

| الدفعة | المسارات | الاستعلامات | المدة |
|--------|---------|-------------|-------|
| **1** | appointments, announcements, contact, tasks, jobs, active_sessions, leads | ~36 | ~8 أيام |
| **2** | studentPortal, teacher_availability, notifications, push, seo | ~28 | ~8 أيام |
| **3** | blog, evaluations, trial_sessions, forum | ~36 | ~9 أيام |
| **4** | sessions, invoices | ~27 | ~6 أيام |
| **5** | finance | ~18 | ~3 أيام |
| **6** | chat, publicChat, live | ~14 | ~5 أيام |
| **7** | system, auth (بقايا), parents (بقايا) | ~96 | ~7 أيام |

### إجمالي المرحلة 1
- **25 ملفاً** ← Prisma
- **260+ استعلام SQL خام** ← استعلامات Prisma

### مثال: نمط الترحيل

**قبل (SQLite خام):**
```js
router.get('/', async (req, res) => {
  const sessions = await req.db.all(`
    SELECT s.*, e.isFrozen, e.sessionsTotal, e.sessionsUsed
    FROM sessions s
    LEFT JOIN enrollments e ON s.studentId = e.studentId
    WHERE ...
  `);
});
```

**بعد (Prisma ORM):**
```js
const { prisma } = require('../utils/prisma');

router.get('/', async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: { ... },
    include: {
      student: { include: { enrollments: true } }
    }
  });
});
```

---

## المرحلة 2: الانتقال إلى PostgreSQL (1-2 أسبوع)

### المهام

| المهمة | المدة |
|--------|-------|
| إنشاء Container PostgreSQL في docker-compose.yml | 3 ساعات |
| تغيير schema.prisma: `sqlite` → `postgresql` | 3 ساعات |
| تعديل أنواع البيانات: JSON, AutoIncrement وغيرها | 4 ساعات |
| إنشاء migration: `prisma migrate dev` | 3 ساعات |
| Script هجرة البيانات من SQLite → PostgreSQL | يومان |
| تحديث Dockerfile للتخلص من sqlite3 build dependencies | 3 ساعات |
| تحديث .env وإزالة الاعتماد على `req.db`/`dbMiddleware` | 4 ساعات |

### الاعتبارات الهامة

#### حقول JSON المخزنة كـ TEXT في SQLite حالياً:
- `schedule` (enrollments), `badges` (students), `permissions` (users)
- `items` (student_invoices), `upvotes`/`downvotes` (forum_posts)

#### PostgreSQL AutoIncrement:
- `enrollments.id`, `fixed_expenses.id`, `audit_logs.id`, `push_subscriptions.id`

#### Case Sensitivity:
- SQLite: case-insensitive افتراضياً
- PostgreSQL: case-sensitive → نحتاج `citext` extension أو `LOWER()` indexes

### docker-compose.yml بعد PostgreSQL

```yaml
services:
  app:
    build: .
    container_name: darin-app
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://darin:${DB_PASSWORD}@postgres:5432/darin

  postgres:
    image: postgres:16-alpine
    container_name: darin-db
    environment:
      POSTGRES_USER: darin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: darin
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U darin"]

volumes:
  app_data:
  pg_data:
```

---

## المرحلة 3: Redis (Cache + Queue) (1-2 أسبوع)

### 3.1 Cache (استبدال in-memory Map)

**الوضع الحالي:** `server/utils/cache.js` — Map بسيط في الذاكرة
**الوضع الجديد:** Redis مع TTL + pub/sub للإشعارات بين السيرفرات

### 3.2 Queue للمهام الخلفية (Bull/BullMQ)

| المهمة | التكرار | الوصف |
|--------|---------|-------|
| الفواتير الشهرية | أول كل شهر | إنشاء فواتير الطلاب تلقائياً |
| إشعارات التذكير | قبل كل حصة | إرسال إشعارات وواتساب |
| النسخ الاحتياطي | يومياً | pg_dump + رفع للسحابة |
| تنظيف الجلسات | كل ساعة | حذف الجلسات منتهية الصلاحية |
| إرسال البريد | حسب الطلب | Password reset, reports |

### 3.3 Use Cases إضافية

| الاستخدام | التفاصيل |
|-----------|---------|
| Rate Limiting موزع | استبدال express-rate-limit بـ Redis-based |
| Socket.IO Adapter | لتعدد العقد (Horizontal Scaling) |
| Online Status | تتبع آخر نشاط للمستخدمين |
| Leaderboard | نقاط الطلاب (Sorted Sets) |

---

## المرحلة 4: Backup & Restore (أسبوع واحد)

### أنواع النسخ

| النوع | التكرار | المحتوى |
|-------|---------|---------|
| كاملة | يومياً | `pg_dump` + ملفات الرفع + الإعدادات |
| تفاضلية | كل 6 ساعات | تغييرات فقط |
| فورية | قبل كل تحديث | تُنشأ تلقائياً قبل git pull/deploy |

### API للاستعادة

```
POST /api/system/backup/create   → إنشاء نسخة
GET  /api/system/backup/list     → عرض النسخ
POST /api/system/backup/restore  → استعادة (يوقف الخادم مؤقتاً)
POST /api/system/backup/upload   → رفع نسخة يدوية
DELETE /api/system/backup/:id    → حذف نسخة قديمة
```

### هيكل الملفات

```
/backups/
├── daily/2026-06-28/
│   ├── dareen_db.pgdump.gz
│   ├── uploads.tar.gz
│   └── config.tar.gz
├── hourly/...
└── pre-deploy/...
```

---

## المرحلة 5: Monitoring & Logging (أسبوعان)

### الوضع الحالي → بعد التحسين

| المكون | الحالي | بعد التحسين |
|--------|--------|-------------|
| **Logging** | `logger.js` → ملف نصي | Winston + Daily Rotation + JSON format |
| **Error Tracking** | try/catch يدوي | Sentry + Stack Traces + User Context |
| **Metrics** | in-memory object | Prometheus + Grafana Dashboard |
| **Alerts** | 10 errors/min limit | Webhook + Slack/Telegram + Email |
| **Health** | `/health` → status ok | Extended health (DB, Redis, LiveKit, Disk) |

### مؤشرات Prometheus

| المؤشر | النوع |
|--------|-------|
| `http_requests_total` | Counter |
| `http_request_duration_seconds` | Histogram (p50, p95, p99) |
| `db_query_duration_seconds` | Histogram |
| `active_users` | Gauge |
| `queue_jobs_waiting` | Gauge |
| `backup_size_bytes` | Gauge |

### Grafana Dashboard

لوحة تحكم تتضمن: الطلبات، الأخطاء، زمن الاستجابة، استعلامات DB، حالة النظام، Queue.

---

## المرحلة 6: Modularization (3-4 أسابيع)

### الهيكل المقترح

```
server/
├── index.js                     # خفيف جداً (app.js + listen)
├── app.js                       # تكوين Express
├── config/                      # إعدادات موحدة
├── modules/                     # وحدات التطبيق
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   └── auth.validation.js
│   ├── students/ → students.controller, service, repository, routes
│   ├── teachers/ → ...
│   ├── sessions/ → ...
│   └── ...
├── middleware/                   # Middleware مشترك
├── shared/                      # خطأ موحد (AppError)، ثوابت
```

### نمط Module واحد

| الطبقة | المسؤولية |
|--------|-----------|
| **routes** | تعريف endpoints + middleware |
| **controller** | معالجة Request/Response + نداء service |
| **service** | منطق الأعمال + تكامل الخدمات |
| **repository** | استعلامات Prisma فقط |

### Error Handling الموحد

```js
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message, code: err.code
    });
  }
  // Unknown → Sentry + 500
  Sentry.captureException(err);
  res.status(500).json({ error: 'خطأ غير متوقع', code: 'INTERNAL_ERROR' });
};
```

### خطة التقسيم

| المرحلة | المدة | الوصف |
|---------|-------|-------|
| 6.1 | 3 أيام | إنشاء الهيكل + middleware |
| 6.2 | 5 أيام | Modules البسيطة |
| 6.3 | 5 أيام | Core modules (students, teachers, auth) |
| 6.4 | 5 أيام | Modules المعقدة (sessions, finance, blog) |
| 6.5 | 3 أيام | النظام والتواصل (system, chat, live) |
| 6.6 | 3 أيام | التنظيف والتأكد |

---

## المرحلة 7: اختبارات Integration + E2E (4-6 أسابيع)

### الوضع الحالي
- **Unit tests:** ❌ لا يوجد
- **Integration tests:** ملفان فقط (blog.test.js + security.test.js)
- **E2E tests:** ❌ لا يوجد

### خطة الاختبارات

#### Integration (138 اختباراً في 14 ملفاً)

| المجموعة | التقدير |
|----------|---------|
| auth.test.js | 3 أيام |
| students.test.js | 3 أيام |
| teachers.test.js | يومان |
| parents.test.js | يومان |
| sessions.test.js | 4 أيام |
| evaluations.test.js | يومان |
| finance.test.js | 4 أيام |
| blog.test.js (توسيع) | 3 أيام |
| system.test.js | 3 أيام |
| chat.test.js | 3 أيام |
| live.test.js | يومان |
| notifications.test.js | يومان |
| forum.test.js | يومان |
| seo.test.js | يوم واحد |

#### E2E (3 سيناريوهات رئيسية — أسبوعان)

```
1. رحلة الطالب: Lead → حصة تجريبية → طالب → حصص → فواتير → تقييم
2. الدورة المالية: مصروفات → فواتير → معاملات → إغلاق شهري
3. إدارة النظام: إعدادات → صيانة → نسخ احتياطي → استعادة → مستخدمين
```

#### CI/CD (GitHub Actions)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    services:
      postgres: ...  # image: postgres:16-alpine
      redis: ...     # image: redis:7-alpine
    steps:
      - run: npm ci && npx prisma generate && npm test
```

---

## المخاطر والتخفيف

| المخاطرة | الاحتمال | التأثير | التخفيف |
|----------|---------|---------|---------|
| توقف الخدمة أثناء الهجرة | متوسط | عالي | ترحيل تدريجي، Hybrid SQLite/Prisma |
| فقدان البيانات | منخفض | عالي جداً | نسخ احتياطي قبل كل خطوة |
| تأخر Prisma | متوسط | متوسط | البدء بأسهل الملفات، تقييم أسبوعي |
| تكلفة Sentry/Grafana | منخفض | منخفض | البدء بـ Open Source |
| Redis SPOF | منخفض | متوسط | Redis Sentinel في الإنتاج |

---

## التوصيات النهائية

1. **البدء بـ Prisma الدفعة 1 فوراً** — لا تتطلب تغييرات في البنية التحتية
2. **تثبيت PostgreSQL مبكراً** — للتجربة عليها قبل التبديل
3. **Redis تنتظر PostgreSQL** — لكن إعداد Queue للمهام الخلفية مبكراً ممكن
4. **اختبارات Shift-Left** — كتابة Integration Tests فور الانتهاء من كل ملف مهاجر
5. **Modularization تدريجي** — إعادة هيكلة الملفات أثناء ترحيل Prisma (توفير وقت)
