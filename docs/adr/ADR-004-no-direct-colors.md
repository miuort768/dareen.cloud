# ADR-004: No Direct Colors in Components

**Status:** Accepted  
**Date:** 2026-07-12  
**Deciders:** Dareen Design System Team

## Context

Before Sprint 4A, components used raw HEX values (`#6366f1`), Tailwind named colors (`bg-indigo-500`), and inline rgba values. This created 5,000+ violations, made dark mode impossible without overrides, and blocked theme customization.

## Decision

**Hard rule:** Components must use ONLY semantic token class names. No:

- ❌ HEX values: `#6366f1`, `#10B981`
- ❌ Tailwind named colors: `bg-indigo-500`, `text-rose-400`, `border-emerald-200`
- ❌ Inline rgba: `rgba(99, 102, 241, 0.5)` (exception: CSS var definitions in `src/styles/`)
- ❌ `text-white` / `text-black` (use `text-on-primary`, `text-inverse` — exception: glass effects)

## Rationale

1. **Theme switching impossible** if colors are hardcoded
2. **Dark mode** requires every color to have a light + dark variant
3. **Maintainability:** Changing brand primary from indigo to teal = 1 palette change
4. **Enforceability:** Automated grep checks in CI catch violations

## Consequences

- `src/theme/palette.ts` is the only source of raw color values
- Component reviews check for semantic token usage
- Exception path: `src/styles/` and `src/theme/` may contain raw values
- Glass effect exception: `bg-white/80` / `dark:bg-slate-900/60` allowed for glass morphism
