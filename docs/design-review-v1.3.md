# تقرير مراجعة التصميم الشامل (Design Review v1.3)

**تاريخ:** 18 يوليو 2026  
**المراجع:** Senior UI/UX Designer  
**النطاق:** 49 شاشة + 22 مكون مشترك + نظام التصميم  
**الحالة:**骨架 جيد — يحتاج تحسينات حرجة قبل الإنتاج  

---

## أولاً: المشاكل الحرجة (Critical — P0)

### 1.1 أخطاء تشغيلية (Runtime Crashes)

| # | الشاشة | الملف | السطر | المشكلة |
|---|--------|-------|-------|---------|
| 1 | **StudentDashboard** | `MobileBottomNav.tsx` | 25 | `setActiveNav` غير مُعرف — سيتسبب في ReferenceError |
| 2 | **Tasks** | `Tasks.tsx` | 124 | أيقونة `Sparkles` غير مستوردة — سيتسبب في Build Failure |
| 3 | **Tasks** | `Tasks.tsx` | 170 | دالة `cn` غير مستوردة — Build Failure |
| 4 | **Chat** | `Chat.tsx` | 118-140 | `setDeleteType`, `setItemToDelete`, `setShowDeleteConfirm`, `setIsDeleting` غير معرفة |
| 5 | **Chat** | `Chat.tsx` | 50, 109 | `React.useEffect()` بدون استيراد `React` |
| 6 | **Leads** | `Leads.tsx` | 53 | `React.useRef()` بدون استيراد `React` |
| 7 | **Agenda** | `Agenda.tsx` | 43-256 | نصوص عربية مشوشة (Mojibake) — تظهر كرموز غير مفهومة |

### 1.2 نظام الألوان (Token System)

| # | المكون | الملف | السطر | المشكلة |
|---|--------|-------|-------|---------|
| 8 | **Tokens** | `tailwind.config.js` | 105-106 | `primary-200` و `primary-400` معرفة في Tailwind لكن غير موجودة في ملفات CSS — أي استخدام لهما سيفشل بصمت |
| 9 | **Tokens** | `index.css` vs `tokens/colors.css` | 36-61 | نظامان مزدوجان للـ tokens — `index.css` يعرف متغيرات RGB والفاصلة بينما `colors.css` يعرف hex — قد يؤدي إلى تعارض في التطبيق |
| 10 | **BlogPost** | `BlogPostShareSection.tsx` | 33 | استخدام `bg-background0` — كلاس غير موجود نهائياً |

---

## ثانياً: مشاكل تجربة المستخدم (High — P1)

### 2.1 تناقض أنماط النوافذ المنبثقة

| # | الشاشة | المشكلة |
|---|--------|---------|
| 1 | **Evaluations** | تستخدم `window.confirm()` الأصلي بدلاً من `confirm()` الموحد — inconsist |
| 2 | **Roles** | تستخدم `window.confirm()` |
| 3 | **Parents** | تبني ConfirmModal يدوي بدلاً من `<ConfirmModal>` المشترك |
| 4 | **TrialSessions** | ConfirmModal يدوي |
| 5 | **Leads** | `ConfirmDeleteModal` مكرر |
| 6 | **Appointments, TrialSessions, Leads** | `alert()` بدلاً من `showNotification()` — 10 مرات عبر 5 صفحات |

### 2.2 عدم توافق مع Dark Mode

| # | الشاشة | الملف | السطر | المشكلة |
|---|--------|-------|-------|---------|
| 7 | **NextSessionHero** | `TeacherSessionTimeline.tsx` | 70 | `text-primary` على خلفية `bg-primary` — تباين صفر في الـ Teacher Dashboard |
| 8 | **Blog** | `Blog.tsx` | 154-158 | التبديل بين dark/light mode يتجاوز نظام `useDarkMode` ويعدل `documentElement` مباشرة — عند الخروج من صفحة Blog، ستكون حالة dark mode غير متسقة |
| 9 | **Jobs** | `Jobs.tsx` | 38-43 | يزيل `dark` class من `<html>` بالقوة — المستخدمون الذين يفضلون الوضع الليلي سيواجهون وميضاً أبيض |

### 2.3 بيانات وهمية / مضللة

| # | الشاشة | الملف | السطر | المشكلة |
|---|--------|-------|-------|---------|
| 10 | **DashboardHeader** | `DashboardHeader.tsx` | 57 | `Math.random() * 100` يعطي نسبة كفاءة عشوائية متغيرة مع كل render |
| 11 | **ContinueLearning** | `ContinueLearning.tsx` | 67-87 | يعرض دورة وهمية "أساسيات البرمجة" بنسبة 60% عندما لا توجد عند الطالب أي enrollments |
| 12 | **TeacherDashboardMobile** | `TeacherDashboardMobile.tsx` | 127 | تقرير الحضور يظهر 95% بشكل ثابت بغض النظر عن البيانات الحقيقية |
| 13 | **SupportBanner** | `SupportBanner.tsx` | 6 | يظهر رقم هاتف وهمي `96500000000` كبديل إذا لم يتم تعيين رقم المسؤول |

---

## ثالثاً: مشاكل إمكانية الوصول (Accessibility — P1/P2)

### 3.1 أزرار بدون تسميات (Icon-Only Buttons)

| # | المكون | الملف | السطر |
|---|--------|-------|-------|
| 1 | **Header** (Dark Mode Toggle) | `Header.tsx` | 142-147 |
| 2 | **Blog** (Theme Toggle) | `Blog.tsx` | 225-228 |
| 3 | **BlogPost** (WhatsApp/Share) | `BlogPostShareSection.tsx` | 18-35 |
| 4 | **ParentBottomNav** (Center button) | `BottomNav.tsx` | 22-45 |
| 5 | **Spinner** (role="status") | `Spinner.tsx` | 9-13 |
| 6 | **ProgressBar** (aria-label) | `ProgressBar.tsx` | 37 |

### 3.2 لوحة المفاتيح (Keyboard Navigation)

| # | المكون | المشكلة |
|---|--------|---------|
| 7 | **Dropdown** | لا يمكن إغلاقه بـ Escape — لا يدعم أسهم لوحة المفاتيح. **حرج.** |
| 8 | **Tabs** | لا يدعم `ArrowLeft`/`ArrowRight` للتنقل بين التبويبات |
| 9 | **Login** | زر إظهار/إخفاء كلمة المرور `tabIndex={-1}` — لا يمكن الوصول إليه بلوحة المفاتيح |
| 10 | **Table** | أعمدة قابلة للفرز ليست `<button>` — لا يمكن تفعيلها بلوحة المفاتيح |
| 11 | **Parents, TrialSessions, Leads** | الـ Custom Modals لا تحبس التركيز (Focus Trap) — يمكن التاب خارجها |
| 12 | **Input** | لا يوجد `aria-describedby` لربط الحقل برسالة الخطأ — **حرج** |

### 3.3 مشاكل ARIA عامة

| # | المكون | المشكلة |
|---|--------|---------|
| 13 | **Tabs** | لا يوجد `aria-controls` لربط التبويب بمحتواه |
| 14 | **Hero Carousel** | لا يوجد `aria-live="polite"` — لا تعلن تغيير الشرائح |
| 15 | **ActivityFeed** | لا يوجد `role="list"`/`listitem"` |
| 16 | **Agenda** | أزرار الأيام لا تحمل `aria-pressed` |
| 17 | **Sidebar** | لا يوجد "Skip to Content" رابط للقفز فوق 20 عنصر في القائمة |

### 3.4 `prefers-reduced-motion`

**لا يوجد أي مكون يحترم** تفضيل تقليل الحركة. متأثر:
- Skeleton: `animate-pulse`
- Spinner: `animate-spin`
- Button: `active:scale-[0.97]`, `hover:scale-[1.02]`
- Card: `hover:-translate-y-1`
- Modal: Framer Motion spring animation

---

## رابعاً: مشاكل التجاوب (Responsive — P2)

### 4.1 أنماط متعددة للتنقل السفلي (Bottom Navigation)

يوجد **4 أنماط مختلفة** للتنقل السفلي عبر المنصة:

| النمط | الصفحات | المشكلة |
|-------|---------|---------|
| `BottomNav` (5 عناصر) | عام (Home, Schedule, Tasks, Chat, Account) | يختفي لصفحات الـ Dashboard |
| `MobileBottomNav` (5 عناصر) | Student Dashboard | زرين بنفس التسمية "الرئيسية" لمسارين مختلفين! |
| `ParentBottomNav` (5 عناصر) | Parent Dashboard | تسميات غير مطابقة للوجهة ("المفضلة" → `/schedule`) |
| Teacher | لا يوجد BottomNav | يستخدم in-page tabs بدلاً من ذلك |

### 4.2 صفحات بدون تصميم متجاوب

| # | الصفحة | المشكلة |
|---|--------|---------|
| 1 | **RolesPage** | لا يوجد layout مخصص للموبايل — `max-w-lg max-h-[85vh]` قد يفيض |
| 2 | **MonitoringPage** | شبكة `grid-cols-6` على سطح المكتب — على الموبايل قد تنهار |
| 3 | **Agenda** | لا يوجد Layout مخصص للموبايل |
| 4 | **Admin Dashboard** | Desktop/Mobile كودان منفصلان — ميزات موجودة على أحدهما قد لا تكون على الآخر |

---

## خامساً: توافق مع Design System (P2)

### 5.1 Border-Radius غير موحد

| القيمة | الصفحات |
|--------|---------|
| `rounded-none` | Agenda, AdminContacts, Contact, AboutHero, TeacherSessionTimeline |
| `rounded-card` | Settings, Finance, Students, TrialSessions |
| `rounded-2xl` | Students, Parents, AboutValues |
| `rounded-3xl` | AAbdullah |

**التوصية:** توحيد `rounded-card` عبر جميع الشاشات.

### 5.2 استخدام `uppercase tracking-widest` على نصوص عربية

| الصفحات | المشكلة |
|---------|---------|
| Agenda, Parents, AdminContacts | `uppercase` لا يؤثر على العربية. `tracking-widest` يضيف فراغات زائدة تجعل العربية صعبة القراءة |

### 5.3 `dir="rtl""` مقسى في المكونات

| المكون | الملف |
|--------|-------|
| **Modal** | `Modal.tsx:76` — لا يمكن استخدامه مع محتوى LTR |
| **FormField** | `FormField.tsx:32` |
| **SectionErrorBoundary** | `SectionErrorBoundary.tsx:43,65` |

### 5.4 المكونات المفقودة (مفترض وجودها حسب AGENTS.md)

| المكون | الحالة |
|--------|--------|
| **Select** | غير موجود — لا يوجد مكون مشارك |
| **Checkbox** | غير موجود — (مذكور في Sprint 5.5) |
| **Radio** | غير موجود — (مذكور في Sprint 5.5) |
| **Switch/Toggle** | غير موجود — (مذكور في Sprint 5.5) |
| **Tooltip** | غير موجود |
| **Toast/Snackbar** | غير موجود في المكونات المشتركة |

### 5.5 عدم تناسق `forwardRef`

فقط **4 من 22** مكوناً يدعم `forwardRef`: Button, Input, Card, Badge. باقي المكونات لا تدعم composition patterns.

---

## سادساً: تقييم كل شاشة (1-10)

### الشاشات العامة (Public)

| الشاشة | التقييم | أبرز المشاكل |
|--------|---------|-------------|
| **Home** | 7/10 | Carousel بدون pause على hover، أيقونات صغيرة جداً على الموبايل |
| **About** | 6/10 | `group-hover` لا يعمل (لا يوجد `group`)، `rounded-none` مع `rounded-2xl` مخلوط |
| **Blog** | 5/10 | **حرج:** dark mode bypass، countdown 9 ثوانٍ للتحميل |
| **BlogPost** | 5/10 | `text-error` للروابط، `bg-background0` كلاس غير موجود |
| **Courses** | 7/10 | Pagination مفقودة، filter يُظهر تصنيفات بدون محتوى |
| **Contact** | 4/10 | `rounded-none` على كل العناصر (شكل صناعي)، إيميل شخصي `miuort768@gmail.com` |
| **Login** | 6/10 | Typewriter مشتت، زر الباسورد غير قابل للوحة المفاتيح |
| **Jobs** | 5/10 | يفرض light mode، `onClick` على label بدلاً من radio inputs |
| **NotFound** | 7/10 | لا يوجد بحث |
| **AAbdullah** | 4/10 | يمنع right-click، يستخدم `text-[var(--text-*)]` بدلاً من semantic tokens (11 مرة) |

### لوحات التحكم (Dashboards)

| الشاشة | التقييم | أبرز المشاكل |
|--------|---------|-------------|
| **Admin Dashboard** | 6/10 | 12+ قسم في صفحة واحدة — overload، random percentage، لا يوجد error handling |
| **Teacher Dashboard** | 6/10 | `onShare` لا يفعل شيئاً، attendance وهمي 95%، 4 طلبات API متتالية |
| **Parent Dashboard** | 5/10 | BottomNav تسميات خاطئة، polling كل 5 ثوانٍ (مفرط)، Hero نص متحرك |
| **Student Dashboard** | 4/10 | **حرج:** `setActiveNav` غير معروف، بيانات وهمية، أيقونات Emoji كصورة أساسية |
| **Reports** | 5/10 | تبويب "التسجيلات" يكرر "الأكاديمي"، type mismatch في AttendanceReport |

### صفحات الميزات (Features)

| الشاشة | التقييم | أبرز المشاكل |
|--------|---------|-------------|
| **Students** | 7/10 | No pagination, tight padding على الموبايل |
| **Teachers** | 7/10 | Props drilling — 14+ props للـ modal |
| **Finance** | 7/10 | Uses `bg-white/15` بدلاً من semantic |
| **Attendance** | 7/10 | جيد — loading, empty, error حالات |
| **Schedule** | 6/10 | inline `<style>` tag |
| **Appointments** | 5/10 | `alert()` بدلاً من `showNotification()`, polling 15s |
| **Agenda** | 3/10 | **حرج:** نصوص مشوشة، sort لا يعمل، no error state |
| **Evaluations** | 6/10 | `window.confirm()` |
| **Settings** | 6/10 | 40+ props إلى SettingsTabContent |
| **Leads** | 7/10 | Custom ConfirmModal بدلاً من المشترك |
| **TrialSessions** | 7/10 | Custom modal, `alert()` |
| **Tasks** | 4/10 | **حرج:** `Sparkles` غير مستورد، `cn` غير مستورد |
| **Chat** | 4/10 | **حرج:** متغيرات حالة غير معرفة |
| **Forum** | 6/10 | لا يوجد error state |
| **Announcements** | 7/10 | جيد — modal form pattern |
| **MonthlyClosing** | 6/10 | `var(--bg-primary)` بدلاً من semantic tokens |
| **StudentInvoices** | 6/10 | Manual `useState` بدلاً من React Query |
| **TeacherInvoices** | 6/10 | Manual `useState` بدلاً من React Query |
| **AdminBlog** | 7/10 | جيد نسبياً |
| **AdminContacts** | 6/10 | `rounded-none` على كل العناصر |
| **AdminJobs** | 6/10 | يعيد تعريف `--color-primary` — تخريب لنظام التصميم |
| **Roles** | 5/10 | لا يوجد loading state, `window.confirm()`, no error handling |
| **Monitoring** | 6/10 | Duplicate `load` function, single-column على الموبايل |
| **ParentStudents** | 7/10 | جيد |
| **ParentAnnouncements** | 6/10 | `var(--text-error)` بدلاً من semantic tokens |

### المكونات المشتركة (Design System)

| المكون | التقييم | أبرز المشاكل |
|--------|---------|-------------|
| **Button** | 8/10 | Missing `asChild`, `iconOnly`, `fullWidth` |
| **Input** | 7/10 | **حرج:** `aria-describedby` مفقود |
| **Card** | 7/10 | `overflow-hidden` دائماً، `hoverLift` افتراضي true |
| **Modal** | 6/10 | Focus trap لكن `dir="rtl"` مقسى، لا `size` prop |
| **Dialog** | 7/10 | لا أيقونات افتراضية حسب الـ variant |
| **Alert** | 6/10 | غير قابل للإغلاق، لا أيقونات افتراضية |
| **Badge** | 7/10 | لا يدوم `dot`/`removable` |
| **Tabs** | 5/10 | **حرج:** لا `aria-controls`, لا أسهم لوحة المفاتيح |
| **Table** | 7/10 | `Math.random()` في Skeleton، pagination أقصاه 7 صفحات |
| **FormField** | 7/10 | `dir="rtl"` مقسى |
| **Dropdown** | 4/10 | **حرج:** لا Escape, لا أسهم, لا focus trap |
| **Skeleton** | 7/10 | `animate-pulse` — `prefers-reduced-motion` غير مدعوم |
| **Spinner** | 5/10 | لا `role="status"`, لا `aria-label` |
| **ProgressBar** | 8/10 | جيد — `role="progressbar"` موجود لكن `aria-label` ناقص |
| **Avatar** | 7/10 | `onError` مفقود للصورة المعطلة |
| **Image** | 7/10 | `alt` افتراضي فارغ |
| **Breadcrumb** | 8/10 | جيد — أفضل مكونAccessibility في النظام |
| **StatCard** | 7/10 | ليس clickable, `hover` افتراضي |
| **ChartContainer** | 7/10 | جيد — `dir="ltr"` افتراضي صحيح |
| **ChartTooltip** | 7/10 | "المجموع" مقسى عربياً |
| **SectionErrorBoundary** | 5/10 | يستخدم `<button>` بدلاً من `<Button>`، `bg-white/50` |
| **ActivityFeed** | 7/10 | `role="list"` مفقود |
| **PageHeader** | 8/10 | جيد |

### التقييم العام للمشروع: **5.8/10**

---

## سابعاً: تقرير عام عن المشروع

### نقاط القوة

1. **نظام Tokens متين** — السلسلة `Component → Semantic Tokens → CSS Variables → Palette → Primitives` واضحة وقابلة للتطوير
2. **دعم RTL ممتاز** — استخدام `ms-`/`me-`/`ps-`/`pe-` بدلاً من `ml-`/`mr-` في معظم المكونات
3. **التنقل الجيد بين الصفحات** — Routing منظم بـ role-based permissions
4. **تغطية واسعة** — 49 شاشة تغطي كل جوانب المنصة التعليمية
5. **أداء Build** — `vite build` سريع (42 ثانية) مع تحسين الصور
6. **فصل المكونات** — Shared components منفصلة عن feature components

### نقاط الضعف

1. **أخطاء تشغيلية (7 Build/Runtime Crashes)** — `Sparkles` غير مستورد، `cn` غير مستورد، `setActiveNav` غير معرف، متغيرات Chat غير معرفة، نصوص Agenda مشوشة
2. **تضارب نظام Tokens** — `index.css` يعيد تعريف متغيرات موجودة أصلاً في `tokens/colors.css` بنظام مختلف (RGB vs hex)
3. **تعدد أنماط BottomNav** — 4 تطبيقات مختلفة للتنقل السفلي مع تسميات خاطئة ومكررة
4. **عدم تناسق ** `border-radius` — 5 قيم مختلفة عبر المشروع
5. **إعادة اختراع العجلة** — كل صفحة تبني ConfirmModal خاص بها بدلاً من المكون المشترك
6. **مكونات مفقودة** — Select, Checkbox, Radio, Switch, Tooltip, Toast
7. **إمكانية الوصول ضعيفة** — 12 مشكلة حرجة في لوحة المفاتيح و ARIA
8. **`prefers-reduced-motion` غير مدعوم** — خطر على المستخدمين ذوي الحساسية الحركية
9. **بيانات وهمية** — `Math.random()`, دورات وهمية, نسب حضور ثابتة
10. **إدارة حالة غير متسقة** — بعض الصفحات تستخدم React Query، وأخرى useState+useEffect يدوي

### الفرص

1. **توحيد Confirm/Alert patterns** — استبدال `window.confirm()`/`alert()` بـ `showNotification()` و `<ConfirmModal>`
2. **إكمال المكونات المفقودة** — Select, Checkbox, Radio, Switch ستغلق أكبر فجوة في الـ Design System
3. **توحيد mobile navigation** — مكون `RoleAwareBottomNav` واحد بدلاً من 4
4. **إضافة Pagination** — جميع جداول CRUD تحتاجها
5. **حل تضارب index.css** — دمج token systems في ملف واحد
6. **إضافة Error Boundaries** — معظم الصفحات لا تعالج أخطاء API

### التهديدات

1. **Dual token system** (`index.css` vs `colors.css`) — قد يسبب مشاكل في الصيانة مع تطور المشروع
2. **حجم المشروع** — 49 شاشة بدون توحيد أنماط يعني تكلفة صيانة متزايدة
3. **إيميل شخصي في Contact** — `miuort768@gmail.com` بدلاً من `info@dareen.cloud` يضر بالمصداقية
4. **SEO غير قانوني** — Home.tsy يحتوي على keyword stuffing مخفي قد يعرض الموقع لعقوبات Google

### خطوات مقترحة فوراً

| الأولوية | الإجراء | الجهد |
|----------|---------|-------|
| 🔴 **حرج** | إصلاح 7 أخطاء تشغيلية (Build/Runtime crashes) | 1 يوم |
| 🔴 **حرج** | تعريف `bg-primary-200/400` أو إزالتها من Tailwind config | 1 ساعة |
| 🟡 **عالي** | إضافة `aria-describedby` لـ Input، `role="status"` لـ Spinner | 4 ساعات |
| 🟡 **عالي** | إصلاح Dropdown (Escape + keyboard navigation + focus trap) | 4 ساعات |
| 🟡 **عالي** | توحيد Modal/Dialog pattern وإزالة custom modals المكررة | 1 يوم |
| 🟡 **عالي** | إضافة `prefers-reduced-motion` في جميع المكونات | 1 يوم |
| 🟢 **متوسط** | إنشاء Select, Checkbox, Radio, Switch المكونات المفقودة | 2 يوم |
| 🟢 **متوسط** | توحيد mobile navigation (BottomNav واحد) | 2 يوم |
| 🟢 **متوسط** | إزالة `rounded-none` الزائد وتوحيد `rounded-card` | 1 يوم |
| 🔵 **منخفض** | إزالة keyword stuffing من Home.tsx | 30 دقيقة |
| 🔵 **منخفض** | تغيير إيميل Contact إلى domain-based | 15 دقيقة |

---

*تم إعداد التقرير بناءً على مراجعة 49 شاشة و22 مكون مشترك ونظام التصميم بأكمله.*
