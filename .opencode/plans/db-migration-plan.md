# خطة ترحيل قاعدة البيانات: SQLite → PostgreSQL + Prisma

## 1. نظرة عامة

**الهدف:** ترحيل 35 جدولًا من SQLite إلى PostgreSQL باستخدام Prisma ORM.
**النظام الحالي:** SQLite خام مع SQL مكتوب يدويًا في 30 ملف Route + `db_setup.js` (974 سطر).
**المنهج:** موديول بموديول — 4 مراحل، كل مرحلة قابلة للاختبار والتشغيل بشكل مستقل.

---

## 2. القرارات التصميمية

| القرار | الاختيار | السبب |
|--------|---------|-------|
| **Multi-tenancy (Academy)** | ✗ لا — حالياً | النظام لمستخدم واحد. إضافتها تعني إعادة تصميم كل الـ API. تؤجل للمرحلة القادمة |
| **Soft Delete** | ✓ نعم — للجداول الأساسية فقط | `students`, `teachers`, `parents`, `blog_posts`, `leads`, `forum_posts` |
| **الحذف النهائي** | ✓ للباقي | `audit_logs`, `points_log`, `messages`, `notifications` — لا داعي للـ soft delete |
| **UUID** | `cuid()` | أسرع من UUIDv4 في Prisma، متوافق مع الأداء |
| **Enums** | `enum` في Prisma | بديل الـ CHECK constraints في SQLite |
| **JSON** | `Json` من Prisma | `schedule` في enrollments, `items` في invoices, `badges` في students |
| **Timestamps** | `createdAt` + `updatedAt` (خيار `@updatedAt`) | لكل الجداول التشغيلية |
| **Date** | `DateTime` (وليس String) | `date` في sessions, invoices, blog_posts |
| **Indexes** | `@@index` + `@@unique` + `@@id` | تحويل كل الـ SQLite indexes إلى Prisma |
| **Transactions** | `prisma.$transaction()` | بديل `BEGIN IMMEDIATE TRANSACTION` + COMMIT/ROLLBACK |

---

## 3. خريطة العلاقات الحالية (As-Is)

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  teachers  │<────│  enrollments  │────>│  students  │
└─────┬────┘     └──────────────┘     └─────┬────┘
      │                                     │
      ├──< sessions                          ├──< sessions
      ├──< teacher_invoices                  ├──< student_invoices
      ├──< teacher_availability              ├──< points_log
      ├──< live_sessions                     ├──< evaluations
      ├──< evaluations                       └──< active_sessions
      └──< active_sessions
      
┌──────────┐     ┌────────────────┐
│  parents   │────>│    students     │ (parentId)
└──────────┘
      
┌──────────────┐     ┌──────────────────────┐     ┌──────────┐
│ conversations  │────>│ conversation_members  │<────│   users   │
└──────┬───────┘     └──────────────────────┘     └──────────┘
       │
       └──< messages

┌────────────┐     ┌────────────────┐
│ forum_posts │────>│ forum_comments  │
└──────┬─────┘     └────────────────┘
       │
       └──< votes (embedded JSON: upvotes/downvotes)
```

**ملاحظات مهمة:**
- `enrollments.teacher` (TEXT) و `enrollments.teacherId` (FK) — مرحلة انتقالية، نحتاج `teacher` فقط كـ fallback
- `sessions.teacherName` و `sessions.studentName` — تكرار بيانات، لكنه مقصود للسرعة (denormalization)
- `teacher_invoices.teacher` (TEXT) و `teacher_invoices.teacherId` (FK) — نفس القصة
- `students.badges` — JSON مخزن كنص
- `enrollments.schedule` — JSON مخزن كنص

---

## 4. المراحل (4 مراحل)

### المرحلة 1: الأساسيات (Core Domain)
**الجداول:** Academy, User, Teacher, Student, Parent

| Prisma Model | SQLite Table | ملاحظات |
|-------------|-------------|---------|
| `User` | `users` | + `deletedAt` |
| `Teacher` | `teachers` | + `deletedAt`، توحيد `phone1`/`phone2` → `phones Json` |
| `Student` | `students` | + `deletedAt`، `badges` → `Json` |
| `Parent` | `parents` | + `deletedAt` |
| `Enrollment` | `enrollments` | `schedule` → `Json`، إزالة `teacher` (نص) ← نحتفظ بها كـ fallback |
| `PointsLog` | `points_log` | بدون `deletedAt` |

**العلاقات:**
- `Teacher` ← `Enrollment[]` → `Student`
- `Parent` ← `Student[]`
- `Student` ← `PointsLog[]`

**اختبار:** بعد هذه المرحلة، يجب أن تعمل صفحات: المعلمين، الطلاب، أولياء الأمور، نقاط الطلاب.

---

### المرحلة 2: التعليم (Education Domain)
**الجداول:** Session, LiveSession, ActiveSession, Evaluation, TrialSession, TeacherAvailability

| Prisma Model | SQLite Table | ملاحظات |
|-------------|-------------|---------|
| `Session` | `sessions` | إبقاء `teacherName`/`studentName` (denormalized)، + `deletedAt` |
| `LiveSession` | `live_sessions` | بدون `deletedAt` |
| `ActiveSession` | `active_sessions` | بدون `deletedAt` |
| `Evaluation` | `evaluations` | بدون `deletedAt` |
| `TrialSession` | `trial_sessions` | بدون `deletedAt` |
| `TeacherAvailability` | `teacher_availability` | بدون `deletedAt` |

**العلاقات:**
- `Teacher` ← `Session[]` → `Student`
- `Teacher` ← `LiveSession[]`
- `Teacher` ← `ActiveSession[]` → `Student`
- `Teacher` ← `Evaluation[]` → `Student`
- `Session` ← `Evaluation[]`
- `Teacher` ← `TrialSession[]`
- `Teacher` ← `TeacherAvailability[]`

**Enums:**
- `SessionStatus`: `SCHEDULED, PENDING, COMPLETED, CANCELLED`
- `LiveSessionStatus`: `ACTIVE, ENDED`
- `EvaluationRating`: حسب القيم الموجودة
- `TrialSessionStatus`: `PENDING, COMPLETED, CANCELLED, CONVERTED`

**اختبار:** بعد هذه المرحلة، يجب أن تعمل: الحصص، الجلسات المباشرة، التقييمات، الجلسات التجريبية، جدول المعلم.

---

### المرحلة 3: المالية (Finance Domain)
**الجداول:** TeacherInvoice, StudentInvoice, ManualTransaction, FixedExpense

| Prisma Model | SQLite Table | ملاحظات |
|-------------|-------------|---------|
| `TeacherInvoice` | `teacher_invoices` | إزالة `teacher` (نص) ← `Teacher` relation |
| `StudentInvoice` | `student_invoices` | `items` → `Json` |
| `ManualTransaction` | `manual_transactions` | بدون `deletedAt` |
| `FixedExpense` | `fixed_expenses` | بدون `deletedAt` |

**Enums:**
- `InvoiceStatus`: `PENDING, PAID, UNPAID, OVERDUE, PARTIALLY_PAID, ABSENT`
- `TeacherInvoiceStatus`: `PENDING, PAID, REVIEWED, UNPAID`
- `TransactionType`: `INCOME, EXPENSE`
- `TransactionStatus`: `PENDING, COMPLETED`

**اختبار:** بعد هذه المرحلة، يجب أن تعمل: فواتير المعلمين، فواتير الطلاب، التقارير المالية.

---

### المرحلة 4: المحتوى والتواصل (Content & Communication Domain)
**الجداول:** BlogPost, ForumPost, ForumComment, Conversation, ConversationMember, Message, ChatProfile, Notification, Announcement, Lead, JobApplication, ContactMessage, Task, AuditLog, SystemSetting, PushSubscription, WhatsAppTemplate

| Prisma Model | SQLite Table | ملاحظات |
|-------------|-------------|---------|
| `BlogPost` | `blog_posts` | + `deletedAt`، توحيد `show_buttons` → `showButtons` |
| `ForumPost` | `forum_posts` | `upvotes`/`downvotes` → `Json`، + `deletedAt` |
| `ForumComment` | `forum_comments` | بدون `deletedAt` |
| `Conversation` | `conversations` | بدون `deletedAt` |
| `ConversationMember` | `conversation_members` | Composite PK |
| `Message` | `messages` | بدون `deletedAt` |
| `ChatProfile` | `chat_profiles` | بدون `deletedAt` |
| `Notification` | `notifications` | بدون `deletedAt` |
| `Announcement` | `announcements` | بدون `deletedAt` |
| `Lead` | `leads` | + `deletedAt` |
| `JobApplication` | `job_applications` | بدون `deletedAt` |
| `ContactMessage` | `contact_messages` | بدون `deletedAt` |
| `Task` | `tasks` | بدون `deletedAt` |
| `AuditLog` | `audit_logs` | بدون `deletedAt` |
| `SystemSetting` | `system_settings` | Key-Value بسيط |
| `PushSubscription` | `push_subscriptions` | `subscription` → `Json` |
| `WhatsAppTemplate` | `whatsapp_templates` | بدون `deletedAt` |

**Enums:**
- `ForumPostStatus`: `PENDING, APPROVED, REJECTED`
- `LeadStatus`: `NEW, CONTACTED, INTERESTED, TRIAL, CONVERTED, LOST`
- `LeadPriority`: `LOW, MEDIUM, HIGH`
- `TaskStatus`: `PENDING, IN_PROGRESS, COMPLETED`
- `TaskPriority`: `LOW, MEDIUM, HIGH`
- `NotificationType`: `INFO, SUCCESS, WARNING`

**اختبار:** بعد هذه المرحلة، يجب أن يعمل: المقالات، المنتدى، الدردشة، الإشعارات، الإعلانات، leads، المهام.

---

## 5. الـ Enums (موحدة)

```prisma
enum SessionStatus { SCHEDULED PENDING COMPLETED CANCELLED }
enum LiveSessionStatus { ACTIVE ENDED }
enum TrialSessionStatus { PENDING COMPLETED CANCELLED CONVERTED }
enum InvoiceStatus { PENDING PAID UNPAID OVERDUE PARTIALLY_PAID ABSENT }
enum TeacherInvoiceStatus { PENDING PAID REVIEWED UNPAID }
enum TransactionType { INCOME EXPENSE }
enum TransactionStatus { PENDING COMPLETED }
enum ForumPostStatus { PENDING APPROVED REJECTED }
enum LeadStatus { NEW CONTACTED INTERESTED TRIAL CONVERTED LOST }
enum LeadPriority { LOW MEDIUM HIGH }
enum TaskStatus { PENDING IN_PROGRESS COMPLETED }
enum TaskPriority { LOW MEDIUM HIGH }
enum NotificationType { INFO SUCCESS WARNING }
```

---

## 6. الـ Indexes المخطط لها

```prisma
// لكل Foreign Key
@@index([teacherId])
@@index([studentId])
@@index([parentId])
@@index([sessionId])

// للحقول المُستخدمة في البحث
@@index([status])
@@index([date])
@@index([slug], unique: true)
@@index([email])
@@index([phone])

// مركبة (Composite)
@@index([receiverId, isDismissed, read])   // notifications
@@index([studentId, teacherId, subject])    // sessions
@@index([teacherId, status])                // live_sessions
@@index([conversationId, userId])           // conversation_members
```

---

## 7. استراتيجية الترحيل (Migration Path)

### الخطوة 1: إعداد البيئة
```bash
npm install prisma @prisma/client
npx prisma init
# ضبط DATABASE_URL في .env
```

### الخطوة 2: كتابة Prisma Schema (مرحلة 1)
إنشاء schema.prisma يحتوي على Models المرحلة 1 فقط.

### الخطوة 3: تشغيل أول Migration
```bash
npx prisma migrate dev --name init_core
```

### الخطوة 4: كتابة سكربت تصدير البيانات من SQLite
```js
// scripts/export-sqlite.js
// يقرأ من SQLite عبر sqlite3
// يحول JSON dates, JSON fields
// يكتب إلى PostgreSQL عبر @prisma/client
```

### الخطوة 5: تعديل Routes
كل Route حالي:
```js
// old
const rows = await req.db.all('SELECT * FROM teachers WHERE ...');
// new
const teachers = await prisma.teacher.findMany({ where: { ... } });
```

### الخطوة 6: اختبار كل Route
اختبار API بعد تعديل كل Route للتأكد من عدم كسر الوظائف.

### الخطوة 7: إزالة الاعتماد على SQLite
إزالة `sqlite3`/`sqlite` من dependencies بعد الانتهاء.

---

## 8. أولويات التنفيذ

| الأولوية | الموديول | ملفات Routes المتأثرة | التعقيد |
|---------|---------|----------------------|---------|
| 1 | Core (User, Teacher, Student, Parent) | `teachers.js`, `students.js`, `parents.js`, `auth.js` | متوسط |
| 2 | Education (Session, Evaluation, Trial) | `sessions.js`, `evaluations.js`, `trial_sessions.js`, `live.js`, `teacher_availability.js` | عالي (بسبب side-effects) |
| 3 | Finance (Invoices, Transactions) | `invoices.js`, `finance.js` | متوسط |
| 4 | Content (Blog, Forum, Chat, Notifications) | `blog.js`, `forum.js`, `chat.js`, `notifications.js`, `announcements.js`, `leads.js`, `jobs.js`, `tasks.js`, `system.js` | منخفض (معظمها CRUD بسيط) |

---

## 9. الملاحظات الفنية الهامة

### JSON Fields
```prisma
schedule  Json?      // enrollments
badges    Json?      // students
items     Json?      // student_invoices
upvotes   Json?      // forum_posts (default: [])
downvotes Json?      // forum_posts (default: [])
subscription Json?   // push_subscriptions
```

### Dynamic SET clauses → Prisma
```js
// old: dynamic SQL
const fields = { name, phone, subject };
const setClause = Object.keys(fields).map(k => `${k} = ?`).join(', ');
await db.run(`UPDATE teachers SET ${setClause} WHERE id = ?`, [...Object.values(fields), id]);

// new: Prisma
await prisma.teacher.update({
  where: { id },
  data: { name, phone, subject }
});
```

### Transactions with side-effects
```js
// old
await db.run('BEGIN IMMEDIATE TRANSACTION');
await db.run('UPDATE enrollments SET sessionsUsed = sessionsUsed + 1 WHERE ...');
await db.run('INSERT INTO points_log ...');
await db.run('UPDATE students SET totalPoints = totalPoints + 10 WHERE ...');
await db.run('COMMIT');

// new
await prisma.$transaction([
  prisma.enrollment.update({ where: ..., data: { sessionsUsed: { increment: 1 } } }),
  prisma.pointsLog.create({ data: { ... } }),
  prisma.student.update({ where: ..., data: { totalPoints: { increment: 10 } } }),
]);
```

### LOWER(TRIM()) → Prisma
```js
// old
await db.get("SELECT id FROM teachers WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))", [name]);

// new (PostgreSQL)
await prisma.teacher.findFirst({
  where: { name: { equals: name, mode: 'insensitive' } }
});
// أو
await prisma.teacher.findFirst({
  where: { name: { equals: name.trim() } }
});
```

---

## 10. الجدول الزمني التقديري

| المرحلة | الوقت التقديري | الاختبار |
|---------|---------------|---------|
| الإعداد (Prisma + PostgreSQL) | يوم واحد | اتصال ناجح + أول migration |
| المرحلة 1: Core | 2-3 أيام | Routes: teachers, students, parents, auth |
| المرحلة 2: Education | 3-4 أيام | Routes: sessions, live, evaluations, trials |
| المرحلة 3: Finance | 1-2 يوم | Routes: invoices, finance |
| المرحلة 4: Content | 2-3 أيام | Routes: blog, forum, chat, notifications, etc. |
| نقل البيانات من SQLite | 1 يوم | تصدير SQLite → PostgreSQL |
| اختبار شامل + Fixes | 2-3 أيام | Smoke test لكل API |
| **المجموع** | **~12-17 يوم** | |
