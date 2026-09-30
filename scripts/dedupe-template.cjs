/**
 * dedupe-template.cjs — removes duplicate row[0] (the prompt subject) inside one template.
 *
 * Long hand-written batches keep re-introducing the same subject; the prompt is built from
 * row[0] so a repeat IS a duplicate question. Keeps the first occurrence of each subject.
 *
 * Usage: node scripts/dedupe-template.cjs <file.ts> <templateType>
 */
const path = require('node:path')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')

async function main() {
  const [file, type] = process.argv.slice(2)
  if (!file || !type) {
    console.error('usage: node scripts/dedupe-template.cjs <file.ts> <templateType>')
    process.exit(2)
  }
  const abs = path.resolve(file)
  const mod = await import(pathToFileURL(abs).href)
  for (const [name, bank] of Object.entries(mod)) {
    if (name === 'default' || !bank || !Array.isArray(bank.templates)) continue

    let removed = 0
    for (const t of bank.templates) {
      if (t.type !== type) continue
      const seen = new Set()
      const kept = []
      for (const row of t.items) {
        if (seen.has(row[0])) {
          removed += 1
          continue
        }
        seen.add(row[0])
        kept.push(row)
      }
      t.items = kept
    }
    if (removed === 0) {
      console.log(`[${name}/${type}] nothing to dedupe`)
      continue
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
    console.log(`[${name}/${type}] removed ${removed} duplicate rows`)
  }
}

main().catch((e) => {
  console.error('[FAIL]', e.message)
  process.exit(1)
})
