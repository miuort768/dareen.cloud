# Migration Progress — Design System v1.0

## Official Baseline (تحديث: 2 يوليو 2026)

### نطاق الفحص (Audit Scope)
- **يشمل:** `src/` بالكامل — `pages/`، `features/`، `components/`، `shared/`
- **يستثني:** `src/theme/`، `src/styles/`، `src/lib/` (مسموح فيها HEX/Primitives)
- **طريقة القياس:** Regex search لكل فئة
- **تاريخ التجميد:** هذا الـ Baseline هو المرجع الرسمي ولا يتغير

### الأرقام النهائية

| الفئة | الوصف | العدد | الملفات |
|-------|-------|-------|---------|
| **P0** | HEX مباشر في Tailwind arbitrary values / inline styles | **568** | 61 |
| **P1** | Named Tailwind colors (e.g. `bg-indigo-500`, `text-emerald-600`) | **5,004** | 200+ |
| **P2** | `text-white` / `text-black` | **656** | 126 |
| **P3** | `rgb()` / `rgba()` مضمّنة | **108** | 48 |

### تعريفات واضحة

| الفئة | التعريف | مثال (مخالفة) | مثال (صحيح) |
|-------|---------|----------------|-------------|
| **P0** | أي HEX (#XXXXXX) خارج `src/theme/` و `src/styles/` | `className="bg-[#4f46e5]"` | `className="bg-primary"` |
| **P1** | أي لون Tailwind مُسمّى متبوع برقم shade | `className="bg-indigo-500"` | `className="bg-primary"` |
| **P2** | `text-white` أو `text-black` (استثناء: glass effects بتقنية backdrop-blur) | `<span className="text-white">` | `<span className="text-on-primary">` |
| **P3** | دوال `rgb()` / `rgba()` في styles | `style={{ color: 'rgba(0,0,0,0.5)' }}` | استخدام semantic token أو shadow |

---

## Sprint Status

| Sprint | المرحلة | P0 | P1 | P2 | P3 | الحالة |
|--------|---------|----|----|----|----|--------|
| **Sprint 1** | Foundation (Tokens + Theme + Docs) | — | — | — | — | ✅ |
| **Sprint 2** | Brand + UI + Accessibility Validation | — | — | — | — | ✅ |
| **Sprint 3A** | Shared Components (Button, Input, Card, Modal, Badge, Alert, Select, Checkbox, Radio, Switch) | 0 | 0 | ≤2/component | 0 | ✅ |
| **Sprint 3B** | Layout (Sidebar, Header, Nav/Tabs, Breadcrumb, Footer) | 0 | 0 | ≤3/component | 0 | ✅ |
| **Sprint 3C** | Dashboard Widgets (StatCard, Charts, QuickActions, ActivityFeed) | 0 | 0 | ≤2 | 0 | ✅ |
| **Sprint 3D** | Business Pages (Home, Login, Settings, Students, Teachers, Finance) | 0 | 0 | ≤5/page | 0 | ✅ |
| **Sprint 3E** | Parent Pages (ParentDashboard, Parents, ParentAnnouncements) | 0 | 0 | ≤3/page | 0 | ✅ |
| **Sprint 3F** | Hotspot Files (Tasks, Attendance, Appointments, Announcements, AdminBlog, ClosingUI) | 0 | 0 | ≤5/file | ≤2/file | ✅ |
| **Sprint 3G** | Public UI (12 files: About, Blog, BlogPost, Contact, Courses, NotFound, Privacy, Refund, TermsOfService, TermsOfWork, FAQSection, HowItWorks) | **0** ✅ | **Remaining** | **Remaining** | **Remaining** | ✅ P0=0 |

---

## Top Hotspot Files — P0 (HEX)

| الملف | P0 Count |
|-------|----------|
| `src/features/dashboard/components/MobileAdminDashboard.tsx` | 54 |
| `src/features/chat/components/ChatWindow.tsx` | 44 |
| `src/features/chat/components/ChatSidebar.tsx` | 36 |
| `src/features/chat/components/ChatModals.tsx` | 32 |
| `src/features/appointments/components/MobileAppointments.tsx` | 19 |
| `src/features/parents/components/ParentsTable.tsx` | 18 |
| `src/components/public/MasarSection.tsx` | 18 |
| `src/features/attendance/components/TeacherStudentCard.tsx` | 17 |
| `src/features/attendance/components/MobileAttendance.tsx` | 16 |
| `src/pages/Forum.tsx` | 15 |

> ملفات الـ Pages Business (Sprint 3D) والـ Public UI (Sprint 3G) تم تصفير P0 فيها بالكامل ✅

---

## Release Checklist

### ✅ Completed
- [x] Foundation — Design Tokens + Theme Engine + Playground
- [x] Shared Components refactored (10 components)
- [x] Layout Components refactored (5 components)
- [x] Dashboard Widgets refactored (5 widgets)
- [x] Business Pages refactored (6 pages)
- [x] Parent Pages refactored (3 pages)
- [x] Hotspot Files refactored (6 files)
- [x] Public UI refactored (12 files)
- [x] Build ناجح (3927 modules, ~41s)
- [x] All Shared Components exported from barrel (`src/shared/components/ui/index.ts`)

### ☐ Before Release
- [ ] **P0 = 0** in all files (currently 568)
- [ ] **P1 = 0** in all files (currently 5,004)
- [ ] P2 within target (≤3 legitimate/file, currently 656)
- [ ] P3 within target (≤1 legitimate/file, currently 108)
- [ ] Accessibility Review — focus rings, aria attributes, keyboard nav
- [ ] Dark Mode Review — all components work in both modes
- [ ] RTL Review — border directions, margin/padding
- [ ] Responsive Review — mobile/tablet/desktop
- [ ] Documentation updated — AGENTS.md, README
- [ ] CI — Theme Compliance rule (fail build on HEX outside theme/styles)

### Summary
```
Progress: ████████████████████░░░  ~82%
Sprints Complete: 9/11
```

## Key Decisions

1. **P0/P1/P2/P3 baseline** مجمّدة من 2 يوليو 2026 — أي تغيير في طريقة القياس يتم توثيقه هنا
2. **Sprint 3G** (Public UI) أُنجز P0=0 فقط — P1/P2/P3 لا تزال موجودة وتحتاج Sprint منفصل
3. P1=0 الذي تحقق سابقًا كان فقط للملفات التي تمت هجرتها، وليس للمشروع بأكمله
4. Release يتحقق عندما يصل المشروع إلى P0=0 وP1=0 وP2/P3 ضمن الحدود المستهدفة
