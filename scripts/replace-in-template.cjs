/**
 * replace-in-template.cjs — template-SCOPED row replacement in a bank file.
 *
 * Why this exists: an earlier text-level replacer matched the first row with a given
 * subject ANYWHERE in the file, so replacing an `ar-muthanna` subject silently rewrote the
 * `ar-type` row that shared the same subject. This version resolves the template first and
 * only ever touches rows inside that one template.
 *
 * Usage:
 *   node scripts/replace-in-template.cjs <file.ts> <bankExportName> <templateType> <replacements.json> [--apply]
 *
 * replacements.json: { "<old subject>": ["<new subject>", "<new answer>"], ... }
 *
 * Without --apply it is a dry run. The replacement file must be JSON (not a JS module) so the
 * Arabic keys survive the shell.
 */
const path = require('node:path')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')

async function main() {
  const argv = process.argv.slice(2)
  const apply = argv.includes('--apply')
  const [file, exportName, type, jsonPath] = argv.filter((a) => a !== '--apply')
  if (!file || !exportName || !type || !jsonPath) {
    console.error(
      'usage: node scripts/replace-in-template.cjs <file.ts> <export> <type> <repl.json> [--apply]'
    )
    process.exit(2)
  }
  const map = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const abs = path.resolve(file)
  const mod = await import(pathToFileURL(abs).href)
  const bank = mod[exportName]
  if (!bank || !Array.isArray(bank.templates)) {
    console.error(`[FAIL] ${exportName} has no templates`)
    process.exit(1)
  }
  const tpl = bank.templates.find((t) => t.type === type)
  if (!tpl) {
    console.error(`[FAIL] template "${type}" not found in ${exportName}`)
    process.exit(1)
  }

  // subjects already used by the SAME type in any other bank file
  const otherFiles = fs
    .readdirSync(path.dirname(abs))
    // index.ts is an aggregator with extensionless imports Node cannot resolve, and it
    // holds no rows of its own.
    .filter((f) => f.endsWith('.ts') && f !== path.basename(abs) && f !== 'index.ts')
  const takenByType = new Set()
  const takenAny = new Set()
  for (const f of otherFiles) {
    const om = await import(pathToFileURL(path.resolve(path.dirname(abs), f)).href)
    for (const [n, b] of Object.entries(om)) {
      if (n === 'default' || !b || !Array.isArray(b.templates)) continue
      for (const t of b.templates) {
        for (const row of t.items) {
          takenAny.add(row[0])
          if (t.type === type) takenByType.add(row[0])
        }
      }
    }
  }

  const kept = new Set(tpl.items.map((r) => r[0]))
  const problems = []
  let n = 0
  for (const [old, [ns, na]] of Object.entries(map)) {
    const idx = tpl.items.findIndex((r) => r[0] === old)
    if (idx === -1) {
      problems.push(`MISS  ${type}: "${old}" is not a subject of this template`)
      continue
    }
    if (takenByType.has(ns)) {
      problems.push(`USED  ${type}: "${ns}" already used by this type in another file`)
      continue
    }
    if (kept.has(ns)) {
      problems.push(`INL2  ${type}: "${ns}" already a subject of this template`)
      continue
    }
    if (typeof na !== 'string' || na.length === 0) {
      problems.push(`ANS   ${type}: missing answer for "${old}"`)
      continue
    }
    tpl.items[idx] = [ns, na]
    kept.delete(old)
    kept.add(ns)
    n += 1
  }

  console.log(`${apply ? 'APPLIED' : 'DRY-RUN'} ${type}/${exportName}: ${n} rows replaced`)
  if (problems.length) {
    console.log('PROBLEMS:')
    for (const p of problems) console.log('  ' + p)
    if (apply) process.exitCode = 1
    return
  }
  if (apply) {
    const body = bank.templates
      .map((t) => {
        const d = t.distractors ? `\n      distractors: ${JSON.stringify(t.distractors)},` : ''
        const items = t.items.map((r) => `        ${JSON.stringify(r)},`).join('\n')
        return `    {\n      type: ${JSON.stringify(t.type)},${d}\n      items: [\n${items}\n      ],\n    },`
      })
      .join('\n')
    const out = `import type { LevelBank } from './_bank-types'\n\nexport const ${exportName}: LevelBank = {\n  id: ${JSON.stringify(bank.id)},\n  title: ${JSON.stringify(bank.title)},\n  description: ${JSON.stringify(bank.description)},\n  templates: [\n${body}\n  ],\n}\n`
    fs.writeFileSync(abs, out, 'utf8')
    console.log('written')
  }
}

main().catch((e) => {
  console.error('[FAIL]', e.message)
  process.exit(1)
})
