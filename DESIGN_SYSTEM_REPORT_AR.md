# تقرير نظام التصميم — دارين السابعة (v1.0)

**تاريخ التقرير:** 13 يوليو 2026  
**الموجه إلى:** خبير تصميم واجهات المستخدم (UI/UX) — لوحة تحكم مدير النظام  
**الإصدار:** Design System v1.0 (Stable)

---

## 1. ملخص تنفيذي

تم بناء نظام تصميم متكامل (Design System) لتوحيد مظهر وتجربة منصة دارين السابعة. يتكون النظام من 4 طبقات مترابطة (Token Chain) تبدأ من الألوان الأولية وتنتهي بمكونات واجهة قابلة لإعادة الاستخدام. تم إكمال 4 سباقات تطوير رئيسية، وتم تطهير الكود بالكامل من الألوان المخالفة (568 خطأ P0 + 5,004 خطأ P1 = 0).

**الهدف من هذا التقرير:** تزويد خبير التصميم بصورة كاملة عن الوضع الحالي للنظام لتقييم جودة التصميم واقتراح التحسينات.

---

## 2. هيكل نظام الألوان (Token Chain)

```
Components (.tsx)  ──►  Semantic Tokens (CSS Variables)  ──►  Palette  ──►  Primitives
```

### 2.1 الطبقة الأولى — Primitives (الألوان الأولية)

| العائلة | الدور | اللون الأساسي |
|---------|-------|--------------|
| Indigo | العلامة التجارية / الأساسي | `#6366f1` (500) |
| Slate | الحيادي / النصوص / الحدود | `#0f172a` (900) |
| Gold | التمييز (استخدام محدود) | `#D4AF37` (500) |
| Emerald | حالة النجاح | `#10b981` (500) |
| Amber | حالة التحذير | `#f59e0b` (500) |
| Rose | حالة الخطأ | `#e11d48` (600) |
| Sky | حالة المعلومات | `#0ea5e9` (500) |

### 2.2 الطبقة الثانية — Palette (لوحة الألوان)

تختار درجات محددة من Primitives وتصنفها دلالياً:

| المجموعة | أمثلة التوكنات |
|----------|---------------|
| Primary | `primary` (indigo-600), `primaryHover`, `primaryActive`, `primarySoft`, `primaryLight`, `primaryDark` |
| Neutral | `surface` (slate-50), `background` (slate-100), `card` (#fff), `border`, `divider` |
| Text | `text` (slate-900), `textMuted` (slate-500), `textInverse` (#fff), `textOnPrimary` (#fff) |
| Status (ثابت) | `success` (emerald), `warning` (amber), `error` (rose-600), `info` (sky) — مع soft/light/dark |
| Focus | `focusRing` (indigo-600) |

### 2.3 الطبقة الثالثة — Semantic Tokens (`semantic-tokens.css`)

**96+ متغير CSS** مقسمة كالتالي:
- **خلفيات:** `--bg-surface`, `--bg-background`, `--bg-card`, `--bg-hover`
- **أساسي:** `--bg-primary`, `--bg-primary-hover/active/soft/light`, `--text-primary`, `--text-on-primary`, `--border-primary`
- **نصوص:** `--text-main`, `--text-muted`, `--text-dim`, `--text-inverse`
- **رسوم بيانية:** `--chart-1` حتى `--chart-6` (6 ألوان متميزة)
- **حالات (نجاح/تحذير/خطأ/معلومات):** 4 مجموعات كاملة
- **حدود:** `--border`, `--border-strong`, `--divider`
- **الوضع المظلم:** `.dark` يعيد تعريف جميع المتغيرات

### 2.4 الطبقة الرابعة — Tailwind Config (`tailwind.config.js`)

يربط متغيرات CSS بكلاسات Tailwind. يتم استخدام `class`-based dark mode. الخطوط العربية المدعومة:
- **العادي:** Readex Pro
- **العناوين:** El Messiri
- **لوحة التحكم:** IBM Plex Sans Arabic

---

## 3. المكونات المشتركة (Shared Components)

### 3.1 المكونات المصدرة من الـ Barrel (`src/shared/components/ui/index.ts`)

| المكون | دوره | أنواعه |
|--------|------|--------|
| **Button** | زر تفاعلي متعدد الأشكال | `ButtonProps` |
| **Input** | حقل إدخال مع تسمية | `InputProps` |
| **Card** | بطاقة محتوى | `CardProps` |
| **Badge** | شارة حالة | `BadgeProps` |
| **Alert** | إشعار/تنبيه | `AlertProps` |
| **Tabs** | علامات تبويب | `TabsProps`, `Tab` |
| **Breadcrumb** | مسار التنقل | `BreadcrumbItem`, `BreadcrumbProps` |
| **StatCard** | بطاقة إحصاء للوحة التحكم | `StatCardProps` |
| **ChartContainer** | غلاف للرسوم البيانية (Recharts) | — |
| **ChartTooltip** | تلميح مخصص للرسوم البيانية | — |
| **ActivityFeed** | تغذية الأحداث والنشاطات | `ActivityItem`, `ActivityFeedProps` |
| **PageHeader** | رأس الصفحة مع عنوان ووصف | `PageHeaderProps` |
| **Image** | صورة محسّنة مع `imgClassName` | — |
| **EmptyState** | حالة عدم وجود محتوى | — |
| **Spinner** | مؤشر تحميل | — |
| **ErrorDisplay** | عرض الخطأ | — |
| **PageTransition** | حركة انتقال الصفحات (Framer Motion) | — |

### 3.2 مكونات متاحة للاستخدام المباشر (غير مصدرة من Barrel)

`Modal`, `Select`, `Checkbox`, `Radio`, `Switch`, `Table`, `StaggeredList` — متوفرة للاستيراد المباشر لكنها بحاجة لمراجعة تصميمية.

### 3.3 ملاحظات هامة لخبير التصميم

- **Checkbox / Radio:** يستخدمان `<input>` الأصلي للمتصفح بدون تنسيق مخصص — **مؤجل إلى Sprint 4** (إعادة هيكلة النماذج).
- **Table:** لا يوجد مكون جدول مشترك موحد — كل صفحة تستخدم جداولها الخاصة.
- **Modal / Select / Switch:** موجودة لكن بحاجة تقييم لجودة التصميم والتجربة.
- **RTL:** بعض المكونات تستخدم `ml-`/`mr-` بدلاً من `ms-`/`me-` — بحاجة تصحيح (مؤجل).

---

## 4. حالة الصفحات (Pages Status)

### ✅ الصفحات المكتملة (Migrated + Audited)

| الصفحة | حالة P0 (HEX) | حالة P1 (Named) | حالة Dark Mode | ملاحظات |
|--------|--------------|-----------------|----------------|---------|
| Landing (Home) | ✅ 0 | ✅ 0 | ✅ | — |
| Login | ✅ 0 | ✅ 0 | ✅ | — |
| Settings (25+ صفحة فرعية) | ✅ 0 | ✅ 0 | ✅ | — |
| StudentDashboard | ✅ 0 | ✅ 0 | ✅ | — |
| TeacherDashboard | ✅ 0 | ✅ 0 | ✅ | — |
| FinancePage | ✅ 0 | ✅ 0 | ✅ | — |
| ParentDashboard | ✅ 0 | ✅ 0 | ✅ | 905 سطر |
| Parents | ✅ 0 | ✅ 0 | ✅ | — |
| ParentAnnouncements | ✅ 0 | ✅ 0 | ✅ | — |
| AdminContacts | ✅ 0 | ✅ 0 | ✅ | Purity UI reskin |
| Leads + 4 sub-components | ✅ 0 | ✅ 0 | ✅ | Purity UI reskin |
| TrialSessions | ✅ 0 | ✅ 0 | ✅ | Purity UI reskin |
| Teachers (7 ملفات) | ✅ 0 | ✅ 0 | ✅ | Purity UI reskin |
| Jobs | ✅ 0 | ✅ 0 | ✅ | Purity UI reskin |
| Monitoring | ✅ 0 | ✅ 0 | ✅ | Refactored |

### 🔄 الصفحات المتبقية (بحاجة تدقيق تصميمي)

| الصفحة | ملاحظات |
|--------|---------|
| AdminBlog | محتوى غني — بحاجة مراجعة |
| Announcements | — |
| Appointments | — |
| Attendance | — |
| Chat | — |
| Evaluations | — |
| Forum | — |
| Profile | — |
| Schedule | — |
| Tasks | — |
| Students (main) | — |
| StudentInvoices | — |
| TeacherInvoices | — |
| Reports | — |

**ملاحظة:** جميع الصفحات المتبقية قد تكون اجتازت فحص الألوان لكنها لم تخضع لـ Purity UI Reskin أو تقييم تجربة المستخدم.

---

## 5. توزيع الملفات — Backend Routes

تم إعادة هيكلة ملفات المسارات (Routes) في الخادم إلى مجلدات فرعية:

```
server/routes/
├── core/           (5)  auth, currencies, search, system, upload
├── education/      (11) students, teachers, parents, sessions, evaluations, ...
├── finance/        (3)  finance, export, invoices
├── communication/  (11) blog, chat, contact, jobs, leads, announcements, ...
└── admin/          (6)  roles, audit, monitoring, tasks, appointments, executive
```

---

## 6. الإنجازات الرئيسية

| المجال | الإنجاز |
|--------|---------|
| **التوحيد** | 568 خطأ HEX → 0 (P0) عبر 61 ملفاً |
| **التنظيف** | 5,004 لون مسموت → 0 (P1) عبر 200+ ملف |
| **الشفافية** | 108 rgba → 8 فقط (جميعها مبررة عبر CSS Variables) |
| **الطباعة** | 1,353 حجم خط ثابت → توكنات دلالية |
| **الصور** | 25/32 صورة أصلية ← مكون Image الموحد |
| **RTL** | إصلاح `ml-`/`mr-` ← `gap-2` و `ms-auto` |
| **Purity UI** | 5 مجموعات صفحات أعيد تصميمها (AdminContacts, Leads, TrialSessions, Teachers, Jobs) |

---

## 7. المشاكل المعروفة (بحاجة تقييم خبير التصميم)

| المعرف | الخطورة | المشكلة | الحالة |
|--------|---------|---------|--------|
| **P1** | 🟠 عالية | **تباين الوضع المظلم**: النص الأساسي (indigo) على خلفية داكنة غير مقروء | مؤجل |
| **P2** | 🟡 متوسطة | **Checkbox/Radio أصلي**: بدون تنسيق مخصص، يختلف حسب المتصفح | مؤجل |
| **P3** | 🔵 منخفضة | **RTL**: بعض المكونات تستخدم `border-l-*` بدلاً من `border-s-*` | مؤجل |
| **P7** | 🟡 متوسطة | **Table**: لا يوجد مكون جدول موحد — 6+ تطبيقات مختلفة عبر الصفحات | جديد |
| **P8** | 🟡 متوسطة | **Responsive**: بعض الصفحات لا تدعم الجوال بشكل كامل (مثل Finance) | جديد |
| **P9** | 🟡 متوسطة | **Loading States**: بعض الصفحات تفتقر إلى Skeleton Loader | جديد |
| **P10** | 🔵 منخفضة | **Form Validation**: رسائل الخطأ غير موحدة عبر النماذج | جديد |

---

## 8. أسئلة مفتوحة لخبير التصميم

1. **نظام الألوان الأساسي:** هل درجات indigo الحالية مناسبة للوضع المظلم؟ هل نحتاج لوناً أساسياً مختلفاً للـ Dark mode؟
2. **Card Rhythm:** هل نمط البطاقات الحالي (خلفية بيضاء، ظل ناعم، زوايا قائمة) مناسب لكل الصفحات؟
3. **Data Tables:** ما هو التصميم الموصى لجداول البيانات الكبيرة؟ (تصفية، فرز، ترقيم صفحات)
4. **Charts:** هل ألوان `chart-1..6` الحالية مناسبة لجميع أنواع البيانات (مالية، تعليمية، إحصائية)؟
5. **Glass Effects:** هل استخدام `bg-white/80` و `dark:bg-slate-900/60` مقبول في التصميم الجديد أم بحاجة إزالة؟
6. **Responsive:** هل هناك حاجة لنسخة جوال منفصلة أم Responsive كافٍ؟
7. **Accessibility:** هل أحجام الخطوط الحالية (xs=0.75rem إلى 7xl=3.75rem) كافية لـ WCAG AA؟
8. **RTL First:** هل جميع المكونات تدعم RTL بشكل صحيح؟ أي منها يحتاج إعادة بناء كاملة؟

---

## 9. المرفقات

- **رمز المصدر:** `https://github.com/miuort768/dareen.cloud`
- **نظام التصميم:** `src/styles/semantic-tokens.css` (96+ متغير)
- **توكنات التصميم:** `src/styles/design-tokens.css` (مسافات، زوايا، ظلال)
- **الألوان الأولية:** `src/theme/primitives.ts`
- **لوحة الألوان:** `src/theme/palette.ts`
- **إعداد Tailwind:** `tailwind.config.js`
- **المكونات المشتركة:** `src/shared/components/ui/` (23 ملفاً)
- **سجل القرارات:** `AGENTS.md` (قسم Key Decisions Log)
- **خارطة الطريق:** `AGENTS.md` (Sprint Roadmap)

---

*تم إعداد هذا التقرير في 13 يوليو 2026. نظام التصميم في حالة Stable (v1.0) وجاهز لمراجعة خبير التصميم.*
