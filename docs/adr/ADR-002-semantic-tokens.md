# ADR-002: CSS-Variable-Based Semantic Tokens via Tailwind

**Status:** Accepted  
**Date:** 2026-06-01 (Updated 2026-07-12)  
**Deciders:** Dareen Design System Team

## Context

The project used arbitrary Tailwind colors (`bg-indigo-500`, `text-rose-400`) directly in components, creating 5,000+ violations and making theme changes impossible without touching every file.

## Decision

Implement a **three-layer token chain**:

```
Components → Semantic Tokens (CSS vars) → Palette/Theme
```

- Components use ONLY semantic classes: `text-main`, `bg-primary`, `border-border`
- `tailwind.config.js` maps CSS variables to Tailwind color names
- `semantic-tokens.css` / `tokens/colors.css` defines variable values per theme (light/dark)
- Palette (`src/theme/palette.ts`) is the single source of truth for color values
- Primitives never leave `src/theme/`

## Rationale

1. **Theme switching:** CSS variables change at the `:root` / `.dark` level → instant theme toggle
2. **Single source of truth:** Change a palette value → all components update
3. **Enforcement:** grep for HEX in `src/pages/` and `src/shared/` catches violations

## Consequences

- 0 HEX violations in components (after Sprint 4A codemod)
- Dark mode works via `.dark` class toggling CSS variables
- Any new component inherits theme automatically
- Exception: `src/theme/` and `src/styles/` files may contain raw color values
