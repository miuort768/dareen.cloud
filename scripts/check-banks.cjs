/**
 * check-banks.cjs — validates a quiz bank .ts file (Node 24 native type-stripping).
 *
 * Usage:
 *   node scripts/check-banks.cjs <bankFile> <expectedRows>
 *
 * Verifies:
 *   - every template's rows have >= 2 fields (last = correct answer)
 *   - total rows across templates == expectedRows
 *   - no exact-duplicate rows
 * Exits non-zero (1) on failure, prints a per-template breakdown on success.
 */

async function main() {
  const [, , fileArg, expectedArg] = process.argv
  if (!fileArg || !expectedArg) {
    console.error('usage: node scripts/check-banks.cjs <bankFile.ts> <expectedRows>')
    process.exit(2)
  }
  const expected = Number(expectedArg)
  if (!Number.isInteger(expected) || expected <= 0) {
    console.error(`invalid expected rows: ${expectedArg}`)
    process.exit(2)
  }

  const absPath = require('node:path').resolve(fileArg)
  const mod = await import('node:url').then((u) => import(u.pathToFileURL(absPath).href))

  const levels = Object.entries(mod).filter(([k]) => {
    const v = k
    return v !== '__esModule' && v !== 'default' && v !== 'banksByLanguage'
  })

  if (levels.length === 0) {
    console.error(`[FAIL] no LevelBank exports found in ${fileArg}`)
    process.exit(1)
  }

  let grandTotal = 0
  const allRows = []
  let bad = false

  for (const [exportName, bank] of levels) {
    const bankObj = bank && typeof bank === 'object' && Array.isArray(bank.templates) ? bank : null
    if (!bankObj) {
      console.error(`[FAIL] export "${exportName}" is not a LevelBank (no templates array)`)
      bad = true
      continue
    }
    let fileTotal = 0
    for (const [ti, template] of bankObj.templates.entries()) {
      const rows = Array.isArray(template.items) ? template.items : []
      for (const [ri, row] of rows.entries()) {
        if (!Array.isArray(row) || row.length < 2) {
          console.error(
            `[FAIL] ${exportName} template[${ti}] (${template.type}) row[${ri}] needs >= 2 fields, got ${JSON.stringify(row)}`,
          )
          bad = true
          continue
        }
        allRows.push(row)
        if (typeof row[row.length - 1] !== 'string' || row[row.length - 1] === '') {
          console.error(`[FAIL] ${exportName} template[${ti}] row[${ri}] has empty/blank correct answer`)
          bad = true
        }
      }
      const answers = rows.map((r) => r[r.length - 1])
      const distractors = Array.isArray(template.distractors) ? template.distractors : []
      const union = new Set([...distractors, ...answers])
      if (union.size < 4) {
        console.error(
          `[FAIL] ${exportName} template[${ti}] (${template.type}) has only ${union.size} distinct answer/distractor values; need >= 4 to build 3 distractors`,
        )
        bad = true
      }
      fileTotal += rows.length
    }
    console.log(
      `  ${exportName}: ${fileTotal} rows across ${bankObj.templates.length} templates (${bankObj.templates
        .map((t) => `${t.type}=${t.items.length}`)
        .join(', ')})`,
    )
    grandTotal += fileTotal
  }

  const seen = new Set()
  let dupes = 0
  for (const row of allRows) {
    const key = row.join('\u0001')
    if (seen.has(key)) {
      dupes += 1
      console.error(`[FAIL] duplicate row: ${JSON.stringify(row)}`)
      bad = true
    }
    seen.add(key)
  }

  console.log(`\nTOTAL ROWS: ${grandTotal} (expected ${expected})`)
  if (grandTotal !== expected) {
    console.error(`[FAIL] row count mismatch`)
    bad = true
  }
  if (dupes > 0) console.error(`[FAIL] ${dupes} duplicate row(s)`)

  if (bad) {
    process.exit(1)
  }
  console.log('[PASS]')
}

main().catch((err) => {
  console.error('[FAIL] checker crashed:', err)
  process.exit(1)
})