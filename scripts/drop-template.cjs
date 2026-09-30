/**
 * drop-template.cjs — remove one template from a bank file, mechanically.
 *
 * Why: when a hand-authored Arabic batch comes out corrupted, the safe recovery is to strip
 * the bad template programmatically instead of retyping Arabic (retyping is what produced the
 * corruption in the first place). Rows from the good templates are preserved byte-for-byte.
 *
 * Usage: node scripts/drop-template.cjs <file.ts> <exportName> <type> [--apply]
 */
const path = require('node:path')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')

async function main() {
  const argv = process.argv.slice(2)
  const apply = argv.includes('--apply')
  const [file, exportName, type] = argv.filter((a) => a !== '--apply')
  if (!file || !exportName || !type) {
    console.error('usage: node scripts/drop-template.cjs <file.ts> <export> <type> [--apply]')
    process.exit(2)
  }
  const abs = path.resolve(file)
  const mod = await import(pathToFileURL(abs).href)
  const bank = mod[exportName]
  const before = bank.templates.length
  const removed = bank.templates.find((t) => t.type === type)
  if (!removed) {
    console.error(`[FAIL] no "${type}" in ${exportName}`)
    process.exit(1)
  }
  bank.templates = bank.templates.filter((t) => t.type !== type)
  const after = bank.templates.length
  const kept = bank.templates.reduce((n, t) => n + t.items.length, 0)
  console.log(`${apply ? 'APPLIED' : 'DRY-RUN'}: removed ${type} (${removed.items.length} rows)`)
  console.log(`templates ${before}->${after}, kept rows ${kept}`)

  const body = bank.templates
    .map((t) => {
      const d = t.distractors ? `\n      distractors: ${JSON.stringify(t.distractors)},` : ''
      const items = t.items.map((r) => `        ${JSON.stringify(r)},`).join('\n')
      return `    {\n      type: ${JSON.stringify(t.type)},${d}\n      items: [\n${items}\n      ],\n    },`
    })
    .join('\n')
  const out = `import type { LevelBank } from './_bank-types'\n\nexport const ${exportName}: LevelBank = {\n  id: ${JSON.stringify(bank.id)},\n  title: ${JSON.stringify(bank.title)},\n  description: ${JSON.stringify(bank.description)},\n  templates: [\n${body}\n  ],\n}\n`
  if (apply) {
    fs.writeFileSync(abs, out, 'utf8')
    console.log('written')
  }
}
main().catch((e) => {
  console.error('[FAIL]', e.message)
  process.exit(1)
})
