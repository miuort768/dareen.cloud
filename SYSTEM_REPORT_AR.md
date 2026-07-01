# تقرير نظام دارين السابعة للتعليم والتدريب - v2.0.0

## 1. نظرة عامة

نظام إدارة شامل لمعهد دارين السابعة، مبني بمعمارية React + Node.js.
- **الإصدار:** 2.0.0
- **الواجهة الأمامية:** React 18 + TypeScript + Vite + Tailwind CSS
- **الخادم:** Node.js + Express.js
- **قاعدة البيانات:** SQLite (حالياً) مع دعم PostgreSQL
- **ORM:** Prisma (43 نموذجاً)
- **التوثيق:** JWT (jsonwebtoken + bcrypt)
- **الوقت الفعلي:** Socket.io
- **التطبيق الجوال:** Capacitor (Android + iOS)
- **المهام الخلفية:** BullMQ + Redis

## 2. إحصائيات الكود

| القياس | العدد |
|--------|-------|
| ملفات الواجهة (TS/TSX/JS/JSX) | 454 |
| ملفات الخادم (routes/services/middleware) | 59 |
| نماذج Prisma | 43 |
| الوحدات الوظيفية (features) | 18 |

## 3. الوحدات الوظيفية (Features)

| الوحدة | الحالة | الوصف |
|--------|--------|-------|
| dashboard | مكتمل | لوحة تحكم متقدمة بـ 35+ مكون (إحصائيات، رسوم بيانية، تنبيهات، حضور، إلخ) |
| students | مكتمل | إدارة الطلاب (CRUD، تسجيل، جداول) |
| teachers | مكتمل | إدارة المعلمين (CRUD، جداول، تقييم) |
| parents | مكتمل | إدارة أولياء الأمور |
| sessions | مكتمل | إدارة الحصص (إنشاء، تعديل، حضور) |
| evaluations | مكتمل | نظام تقييم الطلاب |
| finance | مكتمل | المالية: المعاملات، الفواتير، المصروفات الثابتة، العملات، أسعار الصرف |
| reports | مكتمل | تقارير مالية وأكاديمية وحضور |
| appointments | مكتمل | المواعيد |
| attendance | مكتمل | الحضور والغياب |
| announcements | مكتمل | الإعلانات |
| chat | مكتمل | محادثة فورية |
| forum | مكتمل | منتدى نقاش |
| blog | مكتمل | مدونة |
| leads (CRM) | مكتمل | إدارة العملاء المحتملين |
| schedule | مكتمل | الجدول الزمني |
| monitoring | جديد | مراقبة حالة النظام (الذاكرة، الأداء، الأخطاء) |
| roles | جديد | إدارة الصلاحيات (RBAC) |

## 4. الإضافات الحديثة (Phase 1-5)

### Phase 1a — إزالة SQLite المباشر
- إزالة جميع استدعاءات `getDb()` و `sqlite3`
- نقل 5 ملفات (db.js, dbPool.js, db_setup.js, middleware/db.js, backup.js) إلى Prisma فقط
- تحويل: `finance.js`, `auth.js`, `index.js`, `reminderScheduler.js`
- **التأثير:** −1217 سطر، 5 ملفات محذوفة

### Phase 2 — سجل التدقيق (Audit Log)
- `server/services/auditService.js` — خدمة تسجيل العمليات
- إضافة تسجيل audit لـ: المالية (finance)، الفواتير (invoices)، الإعدادات (system)
- API مع pagination وتصفية: `GET /api/system/audit-logs`
- واجهة عرض بسيطة في `src/features/settings/components/AuditLog.tsx`

### Phase 3 — نظام الصلاحيات (RBAC)
- **6 نماذج Prisma جديدة:** `Role`, `Permission`, `RolePermission`, `UserRole`, `PermissionAudit`
- **Seed:** 28 صلاحية افتراضية + دور `admin` بكل الصلاحيات
- `server/services/permissionService.js` — دوال `hasPermission()`, `getUserPermissions()`
- `server/middleware/auth.js` — middleware `requirePermission()`
- `server/routes/roles.js` — CRUD للأدوار + إدارة صلاحيات المستخدمين
- **واجهة:** `RolesPage` في `/app/roles` مع محرر صلاحيات متكامل

### Phase 4 — اختبارات (Tests)
- **Backend:** 7 اختبارات (auditService + permissionService)
- **Frontend:** 2 اختبارات (rolesService)
- **إجمالي:** 9 اختبارات
- **الأدوات:** Vitest + Supertest + MSW

### Phase 5 — المراقبة والنسخ الاحتياطي (Monitoring + Backup)
- **Monitoring API:** `GET /api/system/monitoring` — حالة الخادم، الذاكرة، الأداء، قاعدة البيانات
- **Monitoring middleware:** يتتبع عدد الطلبات، الأخطاء، الطلبات البطيئة (>1s)
- **Monitoring UI:** `MonitoringPage` في `/app/monitoring` مع تحديث تلقائي كل 15 ثانية
- **Backup model:** نموذج `Backup` في Prisma لتتبع تاريخ النسخ
- **Backup service:** `server/services/backupService.js` — إنشاء واستعادة النسخ مع التتبع
- **Backup API:** `GET /system/backup-history` (pagination) + `POST /system/backup`
- **Auto-backup:** دعم جدولة النسخ التلقائي (24 ساعة)

## 5. قاعدة البيانات (Prisma — 43 Models)

### النطاقات:
- **User Domain (Phase 1):** User, Teacher, Student, Parent
- **Academic Domain (Phase 2):** Enrollment, PointsLog, Session, LiveSession, ActiveSession, Evaluation
- **Trials (Phase 3):** TrialSession, TeacherAvailability
- **Finance (Phase 4):** Currency, ExchangeRate, FinancialSetting, StudentInvoice, TeacherInvoice, ManualTransaction, FixedExpense
- **System (Phase 5):** SystemSetting, Task, CompletedSession, AuditLog, WhatsAppTemplate, PushSubscription, Backup
- **Content (Phase 5 cont.):** BlogPost, Lead, JobApplication, ContactMessage
- **Chat (Phase 6):** Conversation, ConversationMember, Message, ChatProfile
- **Community (Phase 7):** ForumPost, ForumComment, Announcement, Notification
- **RBAC (جديد):** Role, Permission, RolePermission, UserRole, PermissionAudit

## 6. المكدس التقني

### Frontend
- React 18 + TypeScript
- Vite 5 (build)
- Tailwind CSS 3
- TanStack Query 5 (إدارة البيانات)
- Zustand 5 (إدارة الحالة)
- Framer Motion (حركات)
- Recharts (رسوم بيانية)
- React Virtuoso (قوائم طويلة)
- React Router DOM 6
- MSW (mock API للاختبارات)

### Backend
- Node.js + Express.js
- Prisma 7 (ORM مع SQLite/PG/LibSQL)
- JWT (jsonwebtoken)
- Socket.io (اتصال فوري)
- BullMQ + Redis (مهام خلفية)
- ExcelJS (تصدير Excel)
- PDFKit (تصدير PDF)
- Helmet + CORS (أمان)

### DevOps
- Docker + docker-compose
- Capacitor (تطبيق جوال)
- Prerender.io (SEO)
- Railway (hosting)

## 7. الـ API Endpoints

| المسار | الوصف |
|--------|-------|
| `GET /health` | فحص حالة الخادم |
| `POST /api/auth/*` | المصادقة (تسجيل، دخول، نسيت كلمة المرور) |
| `GET/POST/PUT/DELETE /api/students` | إدارة الطلاب |
| `GET/POST/PUT/DELETE /api/teachers` | إدارة المعلمين |
| `GET/POST/DELETE /api/sessions` | إدارة الحصص |
| `GET/POST/DELETE /api/finance/*` | المالية |
| `GET/POST/DELETE /api/invoices/*` | الفواتير |
| `GET/POST /api/system/backup` | النسخ الاحتياطي |
| `GET /api/system/backup-history` | تاريخ النسخ |
| `GET /api/system/monitoring` | مراقبة النظام |
| `GET/POST /api/system/audit-logs` | سجل التدقيق |
| `GET/POST/PUT /api/roles/*` | إدارة الأدوار والصلاحيات |
| `GET /api/roles/permissions` | قائمة الصلاحيات |
| `GET/POST /api/roles/user/:userId` | صلاحيات المستخدم |
| `GET /api/export/:entity` | تصدير (Excel/PDF) |

## 8. حالة المشروع

### ✅ مكتمل
- نظام إدارة الطلاب والمعلمين وأولياء الأمور
- نظام الحصص والتقييم
- المالية (معاملات، فواتير، عملات، مصاريف)
- المحادثة الفورية والإعلانات والمنتدى
- لوحة تحكم متقدمة بـ 35+ مكون
- التقارير والتصدير (Excel/PDF)
- سجل التدقيق (Audit Log)
- نظام الصلاحيات (RBAC)
- اختبارات أساسية
- مراقبة النظام والنسخ الاحتياطي

### ❌ ملغي
- **Phase 6 — Multi-Tenant SaaS** (أزيل بقرار من صاحب المشروع)

### ⏳ لم يبدأ
- الترحيل إلى PostgreSQL للإنتاج
- تحسينات الواجهة المستمرة

## 9. روابط

- **GitHub:** https://github.com/miuort768/dareen.cloud
- **الموقع:** https://dareen.cloud

---

*آخر تحديث: 29 يونيو 2026*
