# AGENTS.md — Dareen Design System v1.0 Migration

## 1. Project Status

| Sprint | Phase | Status |
|--------|-------|--------|
| Sprint 1 | Foundation (Tokens + Theme + Playground + Docs) | ✅ Done |
| Sprint 2 | Brand Validation + UI Validation + Accessibility | ✅ Done (tag: `design-system-v1.0`) |
| Sprint 3A | Shared Components Refactor (Button, Input, Card, Modal, Badge, Alert, Select, Checkbox, Radio, Switch) | ✅ Done — Quality Gate PASS |
| Sprint 3B | Layout Refactor (Sidebar ✅ → Header ✅ → Nav/Tabs ✅ → Breadcrumb ✅ → Footer ✅) | ✅ Done |
| Sprint 3C | Dashboard Widgets (Stats Cards → Charts → Quick Actions → Activity Feed → KPI Cards) | ✅ Done |
| Sprint 3D | Business Pages (Landing → Login → Settings → Students → Teachers → Finance) | ✅ Done — P1=0 |
| Sprint 3E | Parent Pages (ParentDashboard + Parents + ParentAnnouncements) | ✅ Done — P0=0, P1=0 |
| Sprint 4A | Full Project P0 → 0 (568 HEX violations) | ✅ Done — P0=0 |
| Sprint 4A | Full Project P1 → 0 (5004 Named colors via Codemod) | ✅ Done — P1=0 |
| Sprint 4A | Full Project P3 → 0 (108 rgba — 8 CSS-var остаются) | ✅ Done — P3~0 |
| Sprint 4A | P2 Audit: 656→63 (593 replaced with text-on-primary/inverse) | ✅ Done — all remaining justified |
| **Sprint 5** | **Design System v1.1 — Production Ready** | **✅ Done (tag: `design-system-v1.1`)** |
| Sprint 5.1 | DataTable Headless API + StudentTable migration | ✅ Done |
| Sprint 5.2 | Form System (FormField compound + Input/Select/Textarea/Login) | ✅ Done |
| Sprint 5.3 | Dark Mode Primary Family (WCAG AA contrast) | ✅ Done |
| Sprint 5.4 | Skeleton System + Dashboard skeleton loader | ✅ Done |
| Sprint 5.5 | Custom Checkbox/Radio/Switch (RTL + size variants) | ✅ Done |
| Sprint 5.6 | Token split (per-domain CSS files under `src/styles/tokens/`) | ✅ Done |
| Sprint 5.7 | Design System Playground (Skeleton + Dialog + Avatar + Dropdown sections) | ✅ Done |
| Sprint 5.8 | ADRs (4 decisions documented under `docs/adr/`) | ✅ Done |
| **v1.2** | **Design System Polish — Consistency & Components** | **✅ Done (tag: `design-system-v1.2`)** |
| v1.2.1 | Container component + 15 pages migrated from `max-w-[1600px]` → `max-w-page` | ✅ Done |
| v1.2.2 | `focus` → `focus-visible` (keyboard a11y) in Button, Tabs, Modal, Table | ✅ Done |
| v1.2.3 | Motion tokens (`--duration-fast/normal/slow`) + `transition-all` cleanup | ✅ Done |
| v1.2.4 | Elevation System (5 levels: elevation-0 through elevation-4) | ✅ Done |
| v1.2.5 | Color tokens expansion (primary-200/400, text-secondary, border-hover, surface-active) | ✅ Done |
| v1.2.6 | Dialog (Confirm/Cancel), Avatar (first-letter + status), Dropdown | ✅ Done |
| **v1.3** | **Mobile Dashboard UX — Premium Mobile Experience** | **✅ Done (~122 files)** |
| v1.3.1 | Modal → Bottom Sheet on mobile (`< md`), centered on Desktop — all system modals inherit | ✅ Done |
| v1.3.2 | Touch targets ≥44px on mobile: Button, IconButton, ActionRow, Dropdown, FilterDropdown, Dialog, ErrorState retry | ✅ Done |
| v1.3.3 | Table: default mobile cards via `mobileLabel` columns + improved mobileCard styling + pagination targets | ✅ Done |
| v1.3.4 | Tabs `scrollable` variant; Settings 17-tabs → grouped native select on mobile | ✅ Done |
| v1.3.5 | Table split point unified at `md` (Teachers, Leads were `lg` — broken 768–1024 band) | ✅ Done |
| v1.3.6 | FAB unified above AppTabBar: `bottom: calc(96px + env(safe-area-inset-bottom))` (MonthlyClosing, TeacherInvoices, TeacherPaymentHistory fixed) | ✅ Done |
| v1.3.7 | Settings tables (Currencies, AuditLog) → mobile cards; MonthlyClosing date range full-width on mobile | ✅ Done |
| v1.3.8 | Custom centered dialogs → Bottom Sheet on mobile (ConfirmModal, SendNotification, SecureAttendance, Settings×4, AddTransaction, Reschedule, StartLiveSession, Parents×2, Dashboard×4, Schedule×2) | ✅ Done |
| v1.3.9 | Radius unification: `rounded-none` → `rounded-2xl` (73+ files); SalarySlip/InvoicePreview → Bottom Sheet | ✅ Done |
| v1.3.10 | Toolbar restructure (AdminJobs 3-col action grid, AdminContacts/AdminBlog touch chips, TeacherToolbar search text-base) | ✅ Done |
| v1.3.11 | Encoding integrity: byte-level Arabic verification across all 122 modified files (3 BOM files repaired via Node) | ✅ Done |

## 2. Design System Rules (Non-Negotiable)

1. **Components use Semantic Tokens ONLY** — `text-main`, `bg-primary`, `border-border`, etc.
2. **HEX is FORBIDDEN** in components — no `#6C4BFF`, `#10B981`, etc. (exception: `src/theme/` and `src/styles/`)
3. **Tailwind named colors FORBIDDEN** — no `bg-indigo-*`, `text-rose-*`, `border-emerald-*` in components
4. **Palette is NEVER imported inside components** — only imported by Theme layer
5. **Primitives are NEVER imported outside Theme layer** — `src/theme/palette.ts` is the boundary
6. **Status colors** (Success, Warning, Error, Info) are fixed across all themes (ADR-004)
7. **`text-white`/`text-black` discouraged** — use `text-on-primary`, `text-inverse`, etc. Exception: glass effects (`bg-white/80`, `dark:bg-slate-900/60`)
8. **Tailwind opacity modifier** (`/50`, `/20`) doesn't work with hex-based CSS Variables — use named colors for opacity or use a separate class

## 3. Architecture — Token Chain

```
Components (.tsx)
    ↓  (use only semantic token class names)
Semantic Tokens (tailwind.config.js → CSS variables)
    ↓  (mapped to palette colors per theme)
Palette (src/theme/palette.ts)
    ↓  (raw color values)
Primitives (src/theme/primitives.ts)
```

- `src/styles/semantic-tokens.css` — CSS variable definitions for light & dark
- `src/styles/design-tokens.css` — design tokens (spacing, radius, shadows, fonts)
- `src/main.tsx` — imports both CSS files (added in Sprint 3A)
- `src/shared/components/ui/index.ts` — barrel export for all shared components

## 4. Sprint Roadmap

### Sprint 3B — Layout Components
1. Sidebar ✅
2. Header ✅
3. Navigation / Tabs ✅ (Tabs component created + BottomNav refactored + Layout bg refactored)
4. Breadcrumb ✅ (Breadcrumb component created + BlogBreadcrumb refactored + Playground updated)
5. Footer ✅ (PublicFooter refactored — brand colors kept for indigo-950 bg + decorative blurs)

### Sprint 3C — Dashboard Widgets
1. StatCard ✅ (shared component + 8+ inline implementations migrated)
2. Charts ✅ (ChartContainer + ChartTooltip + chart-1..6 tokens + 7 chart files refactored)
3. Quick Actions ✅ (QuickActionsHub + QuickActions + QuickActionsGrid refactored)
4. Activity Feed ✅ (shared ActivityFeed component + executive + recent feed migrated)
5. KPI Cards ✅ (covered by StatCard variant system)

### Sprint 3D — Business Pages
1. Landing ✅ (Home.tsx — 25+ violations → 0)
2. Login ✅ (50+ violations → 0)
3. Settings ✅ (SettingsPage + 20 sub-components → 0)
4. Students ✅ (StudentDashboard + 11 component files → 0)
5. Teachers ✅ (TeacherDashboard + 7 component files → 0)
6. Finance ✅ (FinancePage + 5 component files → 0)

### Audit at end of Sprint 3D
- **P0 (HEX)**: ~146 (remaining in un-migrated files: AdminBlog, Announcements, Appointments, Attendance, etc.)
- **P1 (named colors)**: **0** ✅ — milestone achieved!
- **P2 (text-white/black)**: ~194 (mostly glass effects + legitimate uses on colored backgrounds)
- **P3 (inline rgb/rgba)**: ~45

## 4. Sprint Roadmap

### Sprint 3E — Parent Pages
1. ParentDashboard ✅ (905 lines, ~40 HEX + ~50 named colors → 0)
2. Parents ✅ (194 lines, ~6 HEX + ~8 named → 0)
3. ParentAnnouncements ✅ (240 lines, ~14 HEX + ~20 named → 0)

### Audit after Sprint 3E
All Parent pages clean: P0=0, P1=0

### Completed
- Jul 15 | Dead code cleanup (10 unused files removed): PageTransition, StaggeredList, semantic-tokens.css (migrated to tokens/), App.css (empty), usePageLoader hook, ForumHeader, QuickSearch, MouseGlow, PageContainer, ParentAttendance page (+ 14 empty feature dirs)
- Jul 15 | Second dead code pass (22 more files): AgendaTable, ChatManagement, ImportantNotifications, ParentChildVisualProgress, ParentExcellenceRadar, PerformanceSummary, RenewalAlerts/List, SessionAnalysis, SmartAlerts, TeacherLeaderboard/RewardsKPIs/SalaryPreview/WeeklySummary, dashboardService, ReportsStatsGrid, StudentToolbar, useSharedData (x2), Profile, testUtils, design-tokens.css. tsc + vite build pass.
- Jul 15 | Third cleanup pass: useSettings hook dead (never imported), StudentHeader dead, executive/index barrel dead, VAcademicCap vector dead, json-server dep removed, useToasts/useRequestDesktopNotifications removed, design-tokens.css confirmed dead. tsc + vite build pass.

## 5. Final Audit (Sprint 4A Complete)

| Priority | Baseline (June 2026) | Final (July 2 2026) | Action |
|----------|---------------------|---------------------|--------|
| **P0 (HEX)** | 568 in 61 files | **0** ✅ | Manual fixes |
| **P1 (Named colors)** | 5,004 in 200+ files | **0** ✅ | Codemod scripts |
| **P2 (text-white/black)** | 656 in 126 files | **63** (all glass/decorative) ✅ | All justified (glass effects, opacity) |
| **P3 (rgba)** | 108 in 48 files | **8** (all CSS-var based) ✅ | Acceptable |

### Tooling
- `scripts/codemod-p1.ps1` — P1 replacement script (exact + regex pass)
  - Usage: `.\scripts\codemod-p1.ps1 -Folder "src/folder"`

## 6. Known Issues

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| P1 | 🔴 High | Dark mode primary contrast (indigo on dark bg) | Deferred to Sprint 4 |
| P2 | 🟡 Medium | Native Checkbox/Radio (no custom styling, uses native `<input type="checkbox">`) | Deferred to Sprint 4 forms refactor |
| P3 | 🔵 Low | RTL border logic in shared components | Deferred to Sprint 4 |
| P4 | 🟡 Medium | `text-on-accent` CSS variable defined in tailwind.config but missing from `semantic-tokens.css` | Fixed in 3C.1 |
| P5 | 🟡 Medium | `text-on-success`, `text-on-warning`, `text-on-info` missing from token chain | Fixed in 3C.1 |
| P6 | 🟡 Medium | Chart color tokens needed (6 distinct chart-safe colors) | Fixed in 3C.2 — `--chart-1` through `--chart-6` |

## 7. Definition of Done (DoD)

Every component MUST pass all checks before being marked complete:

- [ ] **100% Semantic Tokens** — no HEX, no `bg-indigo-*`, no `text-rose-*`, no `border-emerald-*`
- [ ] **Accessibility** — focus ring (`focus:ring-2 focus:ring-focus`), `aria-*` attributes, `role` where needed, keyboard navigation
- [ ] **Dark/Light** — works in both modes via CSS variables
- [ ] **All States** — hover, active, focus, disabled (where applicable)
- [ ] **Responsive** — works at mobile/tablet/desktop
- [ ] **Barrel Export** — exported from `src/shared/components/ui/index.ts`
- [ ] **No Legacy Colors** — zero legacy Tailwind named colors
- [ ] **TypeScript** — clean types, no `any`, no `@ts-ignore`

> **Hard Rule**: أي مكون أو صفحة جديدة يجب أن تستخدم Design Tokens و Semantic Tokens فقط. يُمنع استخدام HEX أو Named Tailwind Colors مباشرة خارج `src/theme/` و `src/styles/`. أي مخالفة تعتبر فشلًا في الـ Code Review.

## 8. Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| S2 | `bg-error` light: rose[500]→[600] | WCAG AA contrast 3.67:1 → 4.82:1 |
| S2 | Error hover/active: 600→700→800 | Consistent darkening chain |
| S3A | Added 7 missing tokens to tailwind.config | `on-primary`, `on-error`, `on-accent`, `primary-hover`, `primary-active`, `primary-soft`, `primary-light` |
| S3A | Input/Select/Textarea: auto-generated `id` + `htmlFor` | WCAG label association |
| S3B | Added `main` + `hover` to tailwind.config colors | `text-main`, `bg-hover` used in 3A components but not mapped |
| S3C | StatCard: single component replaces 8+ inline implementations | Reduce maintenance, enforce consistent design |
| S3C | ChartContainer + ChartTooltip as shared infrastructure | Eliminate 437 violations across 12 chart files |
| S3C | Chart tokens (chart-1..6) with light+dark variants | Recharts fill/stroke needs CSS variables, not Tailwind classes |
| S3C | QuickActions: use existing Card+Button+semantic tokens | No new patterns, per user guidance |
| S3C | ActivityFeed: uses Badge variant for status colors | Per user guidance: "عن طريق Alert/Badge وليس ألوانًا خاصة" |
| S4A | P1 Codemod script with explicit map + regex pass | 5,004 named colors → 0 in single automated run |
| S4A | P2 Audit: non-glass text-white → text-on-primary/inverse | 656 → 63 (all remaining justified as glass/decorative) |
| S4A | Migration closed — Design System v1.0 is now a stable platform | No Sprint 5; future work is feature-led |
| Jul 6 | Unused barrel exports removed (Modal, Select, Checkbox, Radio, Switch, Table, Image, Textarea, StaggeredList/Grid) | 12 unused components not in barrel; available for direct import |
| Jul 6 | MonitoringPage refactored: all inline styles → Tailwind semantic | Fixed dark mode compatibility |
| Jul 6 | Button RTL: `ml-/mr-` → `gap-2`; QuickSearch RTL: `ml-4` → `ms-auto me-0` | Direction-agnostic spacing |
| Jul 6 | Codemod: 1,353 `text-[*]` → semantic typography tokens (145 files) | Removed 16 arbitrary pixel size variants; only `text-[6px]` (2) and `text-[var(...)]` (3) remain |
| Jul 6 | Image component: added `imgClassName` prop, exported from barrel, migrated 25/32 native `<img>` → `<Image>` | 7 `<img>` remain inside `<picture>` elements (webp/avif) or raw HTML strings
| Jul 11 | AdminContacts Purity UI reskin — unified card rhythm, semantic tokens, accessibility | First Purity UI migration (commit `9a26f55`) |
| Jul 11 | Leads Purity UI reskin + 4 sub-components (LeadsUI, AddLeadModal, LeadCards, LeadTable) | Unified card rhythm, semantic tokens, accessibility (commit `4e2b979` + QA `cbcdbf0`) |
| Jul 11 | TrialSessions Purity UI reskin — unified card rhythm, semantic tokens, accessibility | Removed glass/gradients (commit `2d7442b` + QA `af22a65`) |
| Jul 11 | Teachers Purity UI reskin — 7 files (TeachersPage, Stats, Toolbar, Table, Form, Details, Card) | Unified card rhythm, semantic tokens, accessibility (commit `2f37466` + QA `c254a08`) |
| Jul 11 | Jobs Purity UI reskin — hero gradients/glass removed, semantic tokens, unified inputs, error modal, success view | Purity UI skeleton (commit `500dc00` + QA `30eb8bc`) |
| Jul 15 | Dead code removal: semantic-tokens.css (4.5 kB), App.css (empty), PageTransition, StaggeredList, usePageLoader, ForumHeader, QuickSearch, MouseGlow, PageContainer, ParentAttendance page | 10 files deleted, tsc --noEmit passes; cleaned up empty feature directories |
| Jul 15 | Second cleanup pass: 22 unused files deleted; design-tokens.css removed (content lives in tokens/); public/sw.js restored (dynamically registered) | Cleanup round 2, tsc --noEmit + vite build pass |
| Jul 15 | Third cleanup: 3 dead files deleted, VAcademicCap removed, json-server purged, 2 unused hook exports removed | Cleanup round 3, all verified |
| Jul 19 | Typography cleanup: `text-[color]` corrected in 4 files (Home, ExecutiveDashboard, BlogHero, About), `tracking-[0.2em]`→`tracking-label` in 14 files (18 occurrences), `leading-[*]`→Tailwind leading tokens in 7 files, `design-tokens.ts` font family mismatch fixed | `tsc --noEmit` passes |
| Jul 19 | Gradient cleanup: `from-[var(--bg-*)]`→`from-*`, `to-[var(--bg-*)]`→`to-*`, `via-[var(--bg-*)]`→`via-*` across 24 files (HeroSelection, SelectionGrid, CollectionsTable, SalarySlipModal, InvoiceTables, HowToSubscribe, AboutCTA, Contact, AboutValues, Blog, MonthlyClosing, MasarSection, MobileHeader, PublicNavbar, PageLoader, AdminHomeTab, Home, Courses, TermsOfService, TermsOfWork, RefundPolicy, WhyChooseUs, BlogPostShareSection, HowItWorks) | `tsc --noEmit` passes |
| Sep 4 | Mobile Dashboard UX (v1.3): ~122 files — Modal/Dialog → mobile Bottom Sheet, ≥44px touch targets, unified `md` table split, FAB above AppTabBar, Settings grouped select, mobile cards for Currencies/AuditLog, radius unification | `tsc` + `vite build` + 173 tests pass; Arabic byte-integrity verified on all modified files |
| Sep 5 | Dashboards pass 1 — unified `DashboardGreeting` hero (Teacher/Student/Parent) + admin greeted by name in Executive header | 4 components delegate to shared component; `tsc` clean |
| Sep 5 | Inner-pages pass — `ParentsHeader`/`ParentsStudentHeader` → `PageHeader`; dead `avgChildren` removed; TrialSessions header wrapped in card; FAB unified above AppTabBar (Attendance/Tasks); 44px touch targets (TrialSessions pagination, EvaluationsHeader, TeacherInvoicesHeader) | Consistency targets: PageHeader for table pages, gradient hero for context pages, stat-card hero for finance pages |
| Sep 6 | Shared `DashboardSectionCard` (teacher desktop+mobile `SectionCard` dedup) + `GradientHeroCard` (Attendance/Appointments/Schedule/Forum gradient heroes unified) | Removes ~160 duplicated lines; single source for card/gradient hero chrome |
| Sep 6 | RTL fixes — status dots `-left/-right` → `-start/-end` (LiveSessions, ExecutiveAlerts); Student dashboard micro-typography raised one step (8–10px → 9–11px) | Physical-side utilities break RTL mirroring; readable label hierarchy |
| Sep 6 | Micro-typography pass 2 — zero `text-[7px]` project-wide; document labels 8px → 9px (Parent/Student drawers & tables, ScheduleGrid, FinanceCharts/Stats, AttendanceHistoryModal, Executive chips), 9px → 10px (admin QuickActions/Focus/FinanceOverview) | Full-project hierarchy 9–11px labels vs ≥12px titles; 8px kept only in notification badges/tooltips/24px avatars |
| Sep 6 | Keyboard focus pass — `outline-none focus-visible:ring-2 focus-visible:ring-focus` added to every interactive element lacking it: shared Table (pagination + both mobile-card row variants), MobileListItem/MobilePageHeader/MobileTopBar/BottomSheet, Confirm/Success modals, SectionErrorBoundary, LiveSessions join link + QuickActions desktop cards (manual) then codemod across 35+18 files (53 total); input `focus:ring-primary/10` border rings deliberately untouched | DoD a11y — Tab-navigable elements must show a visible ring; `:focus-visible` (not `:focus`) avoids mouse-click rings; text inputs keep their instant `:focus` border cue |
| Sep 6 | Empty-state copy unification — one recipe `text-xs font-bold text-muted` (primary) + `text-xs text-muted` (detail); arbitrary `[9px][10px][11px][13px]` raised to `text-xs`; `text-main`→`text-muted` quieting; redundant `dark:text-muted` dropped; 24 files / 40 changes; 7 deliberate exceptions kept (icon-hero empties ≥32px, GamificationCard stamp style, NextSessionRadar emphasis); BOM stripped in 4 files | 26 different inherited/legacy classes on empty lines → one readable tier (12px bold muted); arbitrary pixel sizes violate hierarchy; BOM removal aligns with Sep 4 encoding work |
| Sep 6 | RTL logical-utility sweep pass 2 — Toast stack `left-4`→`start-4`, TrialSessions desktop FAB `left-8`→`end-8`, AdminJobs status accent `border-r-4 border-r-*`→`border-s-4 border-s-*`, Sheet footer `space-x-2`→`gap-2`; verified `border-s-success`+`border-s-primary/40` generate in build; audited 1163 physical utilities — the rest are symmetric `px-*`/`mx-*`, chart-axis margins, centered tooltips `left-1/2 -translate-x-1/2`, or JS props | RTL-first app: logical inset/border utilities mirror correctly if any LTR page appears; visual identical in Arabic (me/ms/start/end = physical right in RTL); Input already used `start-3`/`end-2`/`ps-10`/`pe-12` |
| Sep 6 | Card-title weight unification — `text-sm font-bold text-main` → `text-sm font-black text-main` for every card/section title (executive dashboards, finance panel titles, settings sections, Roles, FinancialReport, shared ActivityFeed + profile header, Jobs font-heading titles), 18 files / 18 lines; `dark:text-main` dups dropped (FinanceOverview, TeacherSessionTimeline); legitimately left `font-bold`: modal-title family, entity/student names, colored `on-primary`/`on-error` band headers, content titles (announcements/blog posts) | Sanctioned tier from shared components: card titles = `font-black text-sm` (DashboardSectionCard, GradientHeroCard), page titles = `font-bold` (PageHeader), numerals inherit `font-dash` wrapper — one visible weight inconsistency across ~30 card titles eliminated |
| Sep 6 | Contrast audit on colored fills — `--bg-success` light emerald[500]→[600] (palette.ts + colors.css; dark was already 600): white text on success fills was 2.5:1 (failed even 3:1 bold) → now 7.3:1 AA, matches darker status-fill precedent (S2 error 500→600); secondary text on primary/gradients bumped `text-white/70`→`/90`, `/65`→`/90`, `/60`→`/80` across ~24 internal sites (hero chips, modal band labels, toast/card text) — 3.9:1/3.3:1 → ≥4.9:1 AA; `--chart-2` stays #10b981 (chart token, not a text fill); icons (glyphs, buttons) left at original opacity (decorative icons exempt from WCAG text contrast), Login/`dark:`-guarded copies also raised — one uniform rule | WCAG AA normal-text 4.5:1 validated numerically against palette luminance — token-layer fix repairs every success surface at once (charts untouched) |
| Sep 6 | Contrast audit part 2 — `--bg-warning` + `--bg-info` light and dark unified to amber[700]/sky[700] (palette.ts + colors.css; were amber500/sky500 light + amber600/sky600 dark): white/`text-warning-foreground` on them was 1.5–2.8:1 (failed even 3:1) → now 5.0:1 / 5.9:1 AA; light `--bg-info-hover` → sky[800] (7.6:1), dark hover sky[600] (dark-mode lighten logic); soft/dark-text pairs (`bg-warning-soft text-warning`, `bg-info-soft text-info`) and gradients untouched — verified zero literal `bg-{warning,info} text-{warning,info}` broken pairs app-wide | Same invariant as S2 error → emerald600 success: any `bg-<status>` + `text-on-<status>` pair must meet AA in both modes; warning/info joins error/success on the darker-fill standard |
