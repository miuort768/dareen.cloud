# Migration Progress Tracker

Tracking reduction of legacy color violations across Sprints.

| Sprint | P0 (HEX) | P1 (Tailwind named colors) | P2 (text-white/black) | P3 (rgb/rgba) |
|--------|---------:|---------------------------:|----------------------:|--------------:|
| **Baseline** | 45 | 1,500 | 200 | 100 |
| After 3A | 44 | 1,480 | 195 | 100 |
| After 3B — Sidebar | ~44 | ~1,475 | ~193 | ~99 |
| After 3B — Header | ~44 | ~1,468 | ~190 | ~99 |
| After 3B — Nav/Tabs | ~44 | ~1,460 | ~188 | ~98 |
| After 3B — Footer | ~44 | ~1,445 | ~175 | ~97 |
| After 3C — Dashboard Widgets | ~10 | ~1,000 | ~95 | ~45 |
| After 3D (full audit)        | ~146 | ~0    | ~194 | ~45 |
| After 3E (full audit)        | ~86  | ~0    | ~194 | ~45 |
| **After 3F — Comprehensive Scan** | **198** ⚠️ | **0** ✅ | **~184** | **~45** |
| *(methodology: widened grep to catch `#AABBCCDD` + all `src/pages/`)* | | | | |
| **Final Target**             | **0** | **0** | **0** | **0** |

## Methodology

- **Source:** Automated grep/ripgrep scan across `.ts`, `.tsx`, `.css` files (excluding `src/theme/`, `src/styles/`, `tailwind.config.js`, `node_modules/`)
- **P0:** Pattern `#[0-9a-fA-F]{3,8}` — all HEX formats including 8-digit (with alpha) outside theme layer
- **P1:** Patterns `bg-(indigo|rose|sky|emerald|amber|violet)-*`, `text-(indigo|rose|sky|emerald|amber|violet)-*`, `border-(indigo|rose|sky|emerald|amber|violet)-*`
- **P2:** Pattern `text-white` / `text-black` (excluding glass effects `bg-white/80`, `dark:bg-slate-900/60`)
- **P3:** Pattern `rgb(` / `rgba(` outside theme layer

## Notes

- Violations are expected to spike before dropping as new pages are created during migration
- Counts are approximate due to multiple instances per line
- Run full audit before/after each Sprint to update counts
