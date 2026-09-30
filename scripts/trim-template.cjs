/**
 * trim-template.cjs — keeps exactly N rows for a template, preserving order.
 *
 * Usage: node scripts/trim-template.cjs <file.ts> <templateType> <N>
 */
const path = require('node:path')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')

async function main() {
  const [file, type, nRaw] = process.argv.slice(2)
  const n = Number(nRaw)
  if (!file || !type || !Number.isInteger(n)) {
    console.error('usage: node scripts/trim-template.cjs <file.ts> <templateType> <N>')
    process.exit(2)
  }
  const abs = path.resolve(file)
  const mod = await import(pathToFileURL(abs).href)
  for (const [name, bank] of Object.entries(mod)) {
    if (name === 'default' || !bank || !Array.isArray(bank.templates)) continue
    for (const t of bank.templates) {
      if (t.type !== type) continue
      const before = t.items.length
      if (before < n) {
        console.error(`[FAIL] ${name}/${type}: has ${before} rows, cannot reach ${n}`)
        process.exit(1)
      }
      t.items = t.items.slice(0, n)
      console.log(`[${name}/${type}] trimmed ${before} -> ${n}`)
    }
    const body = bank.templates
      .map((t) => {
        const d = t.distractors ? `\n      distractors: ${JSON.stringify(t.distractors)},` : ''
        const items = t.items.map((r) => `        ${JSON.stringify(r)},`).join('\n')
        return `    {\n      type: ${JSON.stringify(t.type)},${d}\n      items: [\n${items}\n      ],\n    },`
      })
      .join('\n')
    const out = `import type { LevelBank } from './_bank-types'\n\nexport const ${name}: LevelBank = {\n  id: ${JSON.stringify(bank.id)},\n  title: ${JSON.stringify(bank.title)},\n  description: ${JSON.stringify(bank.description)},\n  templates: [\n${body}\n  ],\n}\n`
    fs.writeFileSync(abs, out, 'utf8')
  }
}

main().catch((e) => {
  console.error('[FAIL]', e.message)
  process.exit(1)
})
