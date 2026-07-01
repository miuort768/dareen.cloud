# Design System Architecture — دارين

## Layer Architecture

```
┌────────────────────────────────────────┐
│  Components (JSX/TSX)                   │
│  تستخدم Semantic Tokens فقط             │
│  bg-surface, text-muted, border-primary │
├────────────────────────────────────────┤
│  Semantic Tokens (semantic.ts)          │
│  surface → palette.surface              │
│  text.muted → palette.textMuted         │
│  border.primary → palette.primary       │
├────────────────────────────────────────┤
│  Palette (palette.ts)                   │
│  primary = primitives.indigo[600]       │
│  surface = primitives.slate[50]         │
├────────────────────────────────────────┤
│  Primitives (primitives.ts)             │
│  indigo { 50→900 }, slate { 50→900 }    │
└────────────────────────────────────────┘
```

## Single Source of Truth

TypeScript هو المصدر الوحيد للحقيقة:
```
primitives.ts → palette.ts → semantic.ts → semantic-tokens.css (مُوَلَّد)
```

## Token Types

| النوع | مثال | ملف |
|---|---|---|
| Color | `--bg-surface`, `--text-muted` | `semantic.ts` |
| Spacing | `--space-4`, `--space-8` | `design-tokens.ts` |
| Radius | `--radius-md`, `--radius-lg` | `design-tokens.ts` |
| Shadow | `--shadow-sm`, `--shadow-lg` | `design-tokens.ts` |
| Typography | `--font-size-base`, `--font-family-sans` | `design-tokens.ts` |
| Motion | `--ease-in`, `--duration-fast` | `design-tokens.ts` (Sprint 2+) |
| Z-index | `--z-dropdown`, `--z-modal` | `design-tokens.ts` (Sprint 2+) |

## Dependency Rules

1. **Components** → تستخدم Semantic Tokens فقط
2. **Semantic Tokens** → تستخدم Palette فقط
3. **Palette** → تستخدم Primitives فقط
4. **Primitives** → لا تعتمد على أي طبقة أخرى

**ممنوع:**
- ❌ استخدام `primitives` مباشرة داخل Component
- ❌ استخدام HEX مباشر داخل Component
- ❌ استخدام `rgb(` / `hsl(` مباشر داخل Component
- ❌ استخدام `bg-indigo-*` / `text-slate-*` مباشر داخل Component

**مسموح فقط في:**
- ✅ `primitives.ts`
- ✅ `palette.ts`
- ✅ `semantic.ts`
- ✅ `theme.ts`
- ✅ `tailwind.config.js`

## هيكل الملفات

```
src/theme/
├── primitives.ts      # Raw scales (50→900) لكل عائلة لونية
├── palette.ts          # اختيار الدرجات المعتمدة لهوية دارين
├── semantic.ts         # ربط القيم بالاستخدامات الدلالية
├── design-tokens.ts    # Non-color tokens (Typography, Spacing, Radius, Shadow)
└── theme.ts            # Light / Dark mapping + Future variants

src/styles/
├── semantic-tokens.css   # Color CSS variables (مُولَّدة من semantic.ts)
└── design-tokens.css     # Non-color CSS variables (مُولَّدة من design-tokens.ts)
```

## Freeze Policy (v1.0+)

> أي تعديل على Palette أو Semantic Tokens بعد اعتماد **Brand Palette v1.0** يجب أن يمر عبر ADR جديد، مع تحديث `brand-palette-changelog.md`.

**الغرض:**
- منع تغييرات عشوائية على الهوية بعد اعتمادها.
- توثيق أي انحراف مستقبلي مع أسبابه.
- الحفاظ على استقرار النظام للمشاريع التي تعتمد عليه.

## Versioning

| الإصدار | الحالة | الوصف |
|---|---|---|
| v0.9 Experimental | قيد المراجعة | العائلات اللونية معتمدة، الدرجات قيد الاختبار |
| v1.0 | — | غير معتمد بعد — ينتظر Visual Review |
| v2.0+ | مستقبلي | إضافة Motion, Z-index, Elevation, Breakpoints |
