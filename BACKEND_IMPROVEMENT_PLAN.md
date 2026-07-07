# خطة تحسين الباك اند — نظام دارين لإدارة المعاهد

بناءً على تقييم الخبير، تم تحديد 5 تحسينات رئيسية مرتبة حسب الأولوية.
خطة التنفيذ لكل تحسين تشمل: الخطوات، الملفات المتأثرة، المخاطر، وطريقة الاختبار.

---

## 📋 جدول الأولويات

| # | التحسين | الجهد | التأثير | المخاطرة | الأولوية |
|---|---------|-------|---------|----------|----------|
| 1 | تنظيم `routes/` إلى مجلدات فرعية | ساعتان | عالي (صيانة) | منخفضة | 🔴 عاجل |
| 2 | توحيد المصادقة في جدول `credentials` | يومان | عالي (أداء + أمان) | متوسطة | 🔴 عاجل |
| 3 | إعداد `@socket.io/redis-adapter` | نصف يوم | عالي (توسع) | منخفضة | 🟡 مهم |
| 4 | إضافة Turborepo لإدارة الـ monorepo | يوم واحد | متوسط (تنظيم) | متوسطة | 🟡 مهم |
| 5 | زيادة تغطية الاختبارات | مستمر | عالي (جودة) | منخفضة | 🟢 مستمر |

---

## 1️⃣ تنظيم `server/routes/` إلى مجلدات فرعية

### الوصف
حالياً 35 ملف Route في مجلد واحد. الهدف: تقسيمها إلى 4 مجلدات حسب المجال.

### الهيكل المستهدف

```
server/routes/
├── index.js                          # تجميع وMount لكل الـ Routers
├── core/
│   ├── auth.js
│   ├── search.js
│   ├── upload.js
│   └── system.js
├── education/
│   ├── students.js
│   ├── teachers.js
│   ├── parents.js
│   ├── sessions.js
│   ├── active_sessions.js
│   ├── evaluations.js
│   ├── studentPortal.js
│   ├── trial_sessions.js
│   ├── teacher_availability.js
│   └── live.js
├── finance/
│   ├── finance.js
│   ├── currencies.js
│   ├── invoices.js
│   └── export.js
├── communication/
│   ├── blog.js
│   ├── blog.validation.js
│   ├── chat.js
│   ├── publicChat.js
│   ├── forum.js
│   ├── announcements.js
│   ├── notifications.js
│   ├── push.js
│   ├── contact.js
│   ├── jobs.js
│   └── leads.js
├── admin/
│   ├── roles.js
│   ├── appointments.js
│   ├── tasks.js
│   ├── executive.js
│   └── seo.js
└── seo/                              # يبقى كمجلد مستقل (إن وجد)
```

### خطوات التنفيذ

1. إنشاء المجلدات: `core/`, `education/`, `finance/`, `communication/`, `admin/`
2. نقل كل ملف Route إلى المجلد المناسب
3. إنشاء `routes/index.js`:

```js
const express = require('express');
const router = express.Router();

// Core
const { authRouter } = require('./core/auth');
const { searchRouter } = require('./core/search');
const uploadRouter = require('./core/upload');
const { systemRouter } = require('./core/system');

// Education
const { studentRouter } = require('./education/students');
const { teacherRouter } = require('./education/teachers');
// ... rest of imports

// Mount
router.use('/auth', authRouter);
router.use('/search', searchRouter);
router.use('/upload', uploadRouter);
router.use('/system', systemRouter);
// ...

module.exports = router;
```

4. تحديث `server/index.js`:
   - استبدال 35 `require` بـ `require('./routes')` واحد
   - استبدال `app.use('/api/auth', authRouter)` إلخ بـ `app.use('/api', apiRouter)`

### الملفات المتأثرة
- `server/index.js` — تبسيط الـ imports
- جميع ملفات `server/routes/*.js` — تغيير المسار فقط

### طريقة الاختبار
- تشغيل `npm run dev` والتأكد من أن جميع endpoints تعمل
- تشغيل `npm test` في مجلد `server/`

### المخاطر
- **منخفضة**: تغيير مسارات الملفات فقط، لا تغيير في الـ logic أو الـ API paths
- التأكد من تحديث المسارات النسبية داخل الملفات إذا كانت تستخدم `__dirname`

---

## 2️⃣ توحيد المصادقة — جدول `credentials`

### المشكلة
حالياً login يبحث في 5 جداول بالتسلسل: `users` ← `teachers` ← `chat_profiles` ← `parents` ← `students`. هذا يسبب:
- 5 Queries لكل محاولة دخول
- تعقيد في إدارة `tokenVersion` (كل جدول له حقل مختلف)
- صعوبة في إضافة أنواع مستخدمين جدد
- عدم انتظام في الحقول (`phone` vs `studentPhone` vs `email`)

### الحل: جدول `credentials` واحد

```prisma
model Credential {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hash
  role      String   // admin | teacher | parent | student | chat_user
  userId    String   // Polymorphic: ID in the respective table
  tokenVersion Int   @default(1)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### خطوات التنفيذ — المرحلة الأولى (إضافة الجدول)

1. إضافة `Credential` model إلى `schema.prisma` و `schema.pg.prisma` و `schema.sqlite.prisma`
2. تشغيل `npx prisma migrate dev --name add_credentials`
3. إنشاء سكربت ترحيل البيانات `server/scripts/migrate_credentials.js`:
   ```js
   // يجلب كل المستخدمين من الـ 5 جداول
   // ويدمجهم في جدول credentials
   // مع تعيين role المناسب لكل واحد
   ```
4. تشغيل السكربت على قاعدة البيانات الحالية

### خطوات التنفيذ — المرحلة الثانية (تحديث Auth)

5. إعادة كتابة `routes/core/auth.js`:
   - `POST /login`: Query واحد → `prisma.credential.findUnique({ where: { username } })`
   - جلب بيانات المستخدم من الجدول المختص بناءً على `role` + `userId`
   - `POST /logout-all`: تحديث `tokenVersion` في جدول `credentials` فقط
   - `POST /verify`: Query واحد → `credential` + جلب البيانات من الجدول المختص

### الملفات المتأثرة
- `server/prisma/schema.prisma` — إضافة Credential model
- `server/prisma/schema.pg.prisma` — إضافة Credential model
- `server/prisma/schema.sqlite.prisma` — إضافة Credential model
- `server/routes/auth.js` (سيصبح `core/auth.js`) — إعادة كتابة كاملة
- `server/middleware/auth.js` — تحديث التحقق من `tokenVersion`
- جميع الـ Routes التي تتعامل مع `tokenVersion`

### طريقة الاختبار
- `npm test` — جميع اختبارات auth
- اختبار يدوي لـ login, verify, refresh, logout-all لكل الـ 5 roles
- التحقق من أن token يتجدد، وأن logout-all يبطل كل الجلسات

### المخاطر
- **متوسطة**: تغيير جوهري في تدفق المصادقة
- **مطلوب**: عمل backup لقاعدة البيانات قبل الترحيل
- **مطلوب**: اختبار شامل لكل الـ 5 roles بعد التحديث
- **التعامل مع الطوارئ**: script rollback لاستعادة الحالة السابقة

---

## 3️⃣ إعداد `@socket.io/redis-adapter`

### الوصف
حالياً Socket.IO يخزن الاتصالات في الذاكرة المحلية. مع Redis adapter، يمكن توزيع الاتصالات عبر عدة instances.

### خطوات التنفيذ

1. تثبيت الاعتماديات:
```bash
cd server && npm install @socket.io/redis-adapter @socket.io/redis
```

2. تحديث `server/socket/handler.js`:
```js
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

// عند وجود Redis (اختياري — fallback للذاكرة المحلية)
if (process.env.REDIS_URL) {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Socket.IO using Redis adapter');
}
```

### الملفات المتأثرة
- `server/package.json` — إضافة الاعتماديات
- `server/socket/handler.js` — إعداد Redis adapter
- `.env.example` — إضافة `REDIS_URL` (إذا لم تكن موجودة)

### طريقة الاختبار
- تشغيل instance1 مع `REDIS_URL` و instance2 مع `REDIS_URL`
- التأكد من أن الاتصال في instance1 يظهر في instance2
- التأكد من أن fallback يعمل عند عدم وجود Redis

### المخاطر
- **منخفضة**: التغيير اختياري (optional) مع fallback تلقائي
- ضمان توافق إصدارات `redis` packages مع بعضها

---

## 4️⃣ إضافة Turborepo لتنظيم الـ Monorepo

### المشكلة
حالياً:
- `package.json` (root) + `server/package.json` منفصلين
- `postinstall` script: `cd server && npm install`
- `npm run dev:all` عبر `concurrently`
- CommonJS في السيرفر vs ESM في الفرونت

### الحل — Turborepo

### خطوات التنفيذ

1. تثبيت Turborepo:
```bash
npm install -D turbo
```

2. إنشاء `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {
      "outputs": []
    },
    "server": {
      "cache": false,
      "persistent": true
    }
  }
}
```

3. إعادة هيكلة المجلدات:
```
darin-institute/
├── apps/
│   ├── web/          ← الفرونت (Vite + React)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server/       ← الباك اند (Express)
│       ├── src/      ← (اختياري: يمكن بقاء الملفات في الجذر)
│       ├── prisma/
│       ├── package.json
│       └── index.js
├── packages/
│   └── shared/       ← الأنواع والثوابت المشتركة (اختياري)
├── turbo.json
├── package.json      ← root package.json (Turborepo orchestration)
└── pnpm-workspace.yaml  (أو npm workspaces)
```

4. تحديث `package.json` (root):
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "server": "turbo run server"
  },
  "workspaces": ["apps/*", "packages/*"]
}
```

5. تحديث `apps/web/package.json` و `apps/server/package.json`

6. نقل ملفات الفرونت إلى `apps/web/` وملفات السيرفر إلى `apps/server/`

### الملفات المتأثرة
- إنشاء `turbo.json` (جديد)
- `package.json` (root) — إضافة workspaces وإزالة postinstall
- `apps/web/package.json` (جديد — منقول من root)
- `apps/server/package.json` (جديد — منقول من `server/package.json`)
- `Dockerfile` — تحديث مسارات الملفات
- `docker-compose.yml` — تحديث مسارات volumes

### طريقة الاختبار
- `npm run dev` — تشغيل الفرونت والسيرفر معاً مع Turborepo caching
- `npm run build` — بناء كلا المشروعين
- التأكد من تشغيل Docker بعد إعادة الهيكلة

### المخاطر
- **متوسطة**: تغيير في هيكلية المجلدات—Dockerfile, CI/CD scripts ستتأثر
- **مطلوب**: تحديث Vite config لتعمل من المسار الجديد (`apps/web/`)
- **مطلوب**: تحديث مسارات Prisma migrations في Dockerfile
- **هام**: إعادة تثبيت الاعتماديات من الصفر

---

## 5️⃣ زيادة تغطية الاختبارات

### الوضع الحالي
- Vitest + Supertest موجودين
- لا يوجد معلومات عن التغطية الحالية (نحتاج تشغيل `vitest run --coverage`)

### خطة التغطية المستهدفة لكل طبقة

| الطبقة | التغطية المستهدفة | الأولوية |
|--------|-------------------|----------|
| **Auth** (login, verify, refresh, logout-all) | 90%+ | 🔴 عاجل |
| **Middleware** (auth, permissions, rate limiter, sanitize) | 90%+ | 🔴 عاجل |
| **Routes — Finance** | 70%+ | 🟡 مهم |
| **Routes — Students/Teachers/Parents** | 70%+ | 🟡 مهم |
| **Services** (currency, audit, chat) | 60%+ | 🟢 مستمر |
| **Socket** (handler, events) | 50%+ | 🟢 مستمر |

### أمثلة لاختبارات أساسية

```js
// tests/auth.test.js
describe('POST /api/auth/login', () => {
  it('returns token with valid admin credentials');
  it('returns token with valid teacher credentials');
  it('returns 401 with invalid password');
  it('returns 401 with non-existent username');
  it('rate-limits after 10 attempts');
});

// tests/middleware/permissions.test.js
describe('requirePermission', () => {
  it('allows access with correct permission');
  it('denies access without permission');
  it('allows admin to bypass all checks');
});
```

### الأدوات
- `vitest` + `supertest` (موجودين بالفعل)
- إضافة `@vitest/coverage-v8` للتقرير:
  ```bash
  cd server && npm install -D @vitest/coverage-v8
  ```

### طريقة الاختبار
```bash
cd server
npx vitest run --coverage  # إظهار التغطية الحالية
```

---

## 🗓 الجدول الزمني

| الأسبوع | التحسين | المدة |
|---------|---------|-------|
| الأسبوع 1 | 🔴 1. تنظيم routes/ | يوم 1 (ساعتان) |
| الأسبوع 1 | 🔴 2. توحيد المصادقة (المرحلة 1: إضافة جدول + ترحيل) | يوم 2-3 |
| الأسبوع 1 | 🔴 2. توحيد المصادقة (المرحلة 2: تحديث Auth) | يوم 4-5 |
| الأسبوع 2 | 🟡 3. Redis adapter لـ Socket.IO | يوم 1 |
| الأسبوع 2 | 🟡 4. Turborepo | يوم 2-3 |
| الأسبوع 2+ | 🟢 5. اختبارات | مستمر |

---

## ✅ قائمة التحقق النهائية (DoD)

كل تحسين يجب أن يمر بالفحوصات التالية قبل إغلاقه:

- [ ] جميع الاختبارات الحالية تمر (`cd server && npm test`)
- [ ] لا توجد أخطاء في `console` عند تشغيل `npm run dev:all`
- [ ] الـ API يعمل عبر Postman/Curl للتأكد من عدم تغيير الـ endpoints
- [ ] تحديث التوثيق إذا لزم الأمر (README, API docs)
- [ ] المراجعة (Code Review) من مطور آخر
- [ ] backup للبيانات قبل أي ترحيل (migration)
