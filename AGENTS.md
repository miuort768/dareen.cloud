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
