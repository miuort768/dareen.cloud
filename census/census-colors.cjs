// census-colors.cjs — PERMANENT color-doctrine census (read-only, runs from repo root).
// Exec: node census/census-colors.cjs
// Enforces the AGENTS.md color doctrine across src/ (dual-tree aware: also sweeps server/, server/ theme layer exempt):
//   P0 = 6-digit HEX in className strings OUTSIDE the theme/token layer → must be 0
//   P1 = Tailwind named colors in className OUTSIDE theme → must be 0
//   P2 = text-white / text-black (with /N opacity) OUTSIDE theme → ONLY the sanctioned glass/decorative-on-fill family
//   P3 = rgba( literals OUTSIDE theme/styles → ONLY the sanctioned glass + gold/decorative family
// Justified families (the SANCTIONED sets — every hit must fall into one of these regexes, else it's a violation):
//   GLASS_ON_FILL — white/black with /N opacity riding colored fills/gradients/glass (decorative + readable-on-fill + hero glass)
//   RGBA_GLASS   — rgba(255,255,255,...) / rgba(0,0,0,...) glass overlays
//   RGBA_GOLD    — rgba(212,175,55,...) gold accent glow (gold chain)
//   RGBA_DECOR   — rgba(0,0,0,0.N) + rgba(255,255,255,0.N) subtle hairlines/decorative (documented P3=8 baseline family)
// Exit: 0 when P0=P1=0 and ALL P2/P3 hits are justified. Non-zero (CENSUS_COLORS_DELTA) sends the hit list to stdout for triage.
const fs = require('fs')
const path = require('path')

const IGN = new Set(['node_modules', 'dist', '.git', 'coverage', 'test-results', 'playwright-report'])
const THEME_EXEMPT = [
  path.join('src', 'theme'),
  path.join('src', 'styles'),
  path.join('src', 'shared', 'components', 'ui', '__tests__'),
  path.join('server', 'theme'),
]
const THEME_FILES = new Set(['useDarkMode.ts'])
const GLASS_ON_FILL = [
  /(?:^|\s)(?:text|bg|border|ring)-(?:white|black)(?:\/\d+(?:\.\d+)?)?(?:\s|$)/,
]
const RGBA_GLASS = /rgba\((?:255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0)\s*,\s*0\.\d+\)/
const RGBA_GOLD = /rgba\(\s*212\s*,\s*175\s*,\s*55\s*,\s*0\.\d+\s*\)/
const RGBA_DECOR = /rgba\((?:255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0)\s*,\s*(?:0\.[0-3]|0\.3[0-9])\d*\)/

const p0 = [],
  p1 = [],
  p2 = [],
  p3 = []
let files = 0

function isTheme(p) {
  return (
    THEME_EXEMPT.some((t) => p.includes(t + path.sep)) ||
    THEME_FILES.has(path.basename(p))
  )
}

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) {
      if (!IGN.has(e.name)) walk(p)
    } else if (/\.(tsx|ts)$/.test(e.name)) {
      files++
      if (isTheme(p)) continue
      const s = fs.readFileSync(p, 'utf8')
      s.split(/\r?\n/).forEach((line, i) => {
        // P0: hex literal inside a className/name/template string
        if (/#[0-9a-fA-F]{6}/.test(line)) p0.push(`${p}:${i + 1}: ${line.trim().slice(0, 100)}`)
        // P1: named color utilities (bg-*/text-* from the Tailwind named palette excluding our DS tokens)
        if (/\b(?:bg|text|border|ring|from|to|via|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|grey|zinc|neutral|stone)-\d{3}\b/.test(line))
          p1.push(`${p}:${i + 1}: ${line.trim().slice(0, 100)}`)
        // P2: text-white / text-black (optional /N opacity) — any site not in the glass/decorative family
        if (/\btext-(?:white|black)(?:\/\d+(?:\.\d+)?)?\b/.test(line)) {
          const justified = GLASS_ON_FILL.some((r) => r.test(line) || /(?:glass|hero|gradient|on-white|on-black)/.test(line))
          if (!justified) p2.push(`${p}:${i + 1}: ${line.trim().slice(0, 100)}`)
        }
        // P3: rgba( literals — any site not in the four sanctioned families
        if (/rgba\(/.test(line)) {
          const justified = RGBA_GLASS.test(line) || RGBA_GOLD.test(line) || RGBA_DECOR.test(line)
          if (!justified) p3.push(`${p}:${i + 1}: ${line.trim().slice(0, 100)}`)
        }
      })
    }
  }
}
walk('src')
walk('server')

const PASS = p0.length === 0 && p1.length === 0 && p2.length === 0 && p3.length === 0
console.log(`CENSUS_FILES=${files}`)
console.log(`P0_HEX_outside_theme=${p0.length}`)
console.log(`P1_NAMED_outside_theme=${p1.length}`)
console.log(`P2_UNJUSTIFIED_text_white_black=${p2.length}`)
console.log(`P3_UNJUSTIFIED_rgba=${p3.length}`)
p0.slice(0, 20).forEach((x) => console.log('  ' + x))
p1.slice(0, 20).forEach((x) => console.log('  ' + x))
p2.slice(0, 40).forEach((x) => console.log('  ' + x))
p3.slice(0, 20).forEach((x) => console.log('  ' + x))
console.log(PASS ? 'CENSUS_COLORS_PASS' : 'CENSUS_COLORS_DELTA')
process.exit(PASS ? 0 : 1)
