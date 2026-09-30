/**
 * audit-bank-text.cjs — catches cross-script corruption introduced while authoring banks.
 *
 * Bank writing repeatedly produced two failure modes that row-counting cannot see:
 *   1. non-Arabic fragments (Latin / Cyrillic / CJK / replacement chars) leaking into
 *      Arabic-only rows,
 *   2. stray mojibake anywhere.
 *
 * It does NOT police reciprocal antonym pairs: "ضد ثقيل؟ ← خفيف" and "ضد خفيف؟ ← ثقيل"
 * are two distinct prompts over the same knowledge item, and dropping either would
 * break the per-template counts. Prompt uniqueness is enforced separately by
 * scripts/check-prompt-uniques.cjs.
 *
 * Usage:
 *   node scripts/audit-bank-text.cjs <fileA.ts> [fileB.ts ...]
 *
 * Exits 1 if any row is flagged.
 */

// Templates whose row[0] (prompt subject) MUST be an Arabic letter — the prompt is
// literally «أي كلمة تبدأ بحرف …؟». Every other template legitimately carries Latin
// script in English/French/Spanish banks, so a Latin check there would be a false alarm.
const ARABIC_SUBJECT_TEMPLATES = new Set(['ar-begin', 'ar-end', 'ar-type'])

// Latin letters that are legitimately used in French/Spanish/English rows are only
// rejected inside Arabic-only templates. Digits and Arabic punctuation are fine.
const LATIN = /[A-Za-z]/
const SUSPECT = /[\u0400-\u04FF\uFFFD\u3000-\u303F]/
const ARABIC = /[\u0600-\u06FF]/

function main() {
  const [, , ...files] = process.argv
  if (files.length === 0) {
    console.error('usage: node scripts/audit-bank-text.cjs <fileA.ts> [fileB.ts ...]')
    process.exit(2)
  }

  let bad = false
  let rows = 0

  for (const file of files) {
    const abs = require('node:path').resolve(file)
    const mod = require('node:url').pathToFileURL(abs)
    import(mod.href)
      .then((m) => {
        for (const [name, bank] of Object.entries(m)) {
          if (name === 'default' || !bank || !Array.isArray(bank.templates)) continue
          for (const t of bank.templates) {
            const isAr = ARABIC_SUBJECT_TEMPLATES.has(t.type)
            for (const [i, row] of t.items.entries()) {
              rows += 1
              const cells = row.map((c) => String(c))
              if (cells.some((c) => SUSPECT.test(c))) {
                console.error(`[CORRUPT] ${name}/${t.type}[${i}] suspect chars: ${JSON.stringify(row)}`)
                bad = true
              }
              if (isAr) {
                const subject = cells[0] ?? ''
                if (LATIN.test(subject) && !ARABIC.test(subject)) {
                  console.error(`[CORRUPT] ${name}/${t.type}[${i}] latin subject: ${JSON.stringify(row)}`)
                  bad = true
                }
              }
            }
          }
        }
      })
      .catch((e) => {
        console.error(`[FAIL] cannot load ${file}: ${e.message.split('\n')[0]}`)
        bad = true
      })
  }

  setTimeout(() => {
    console.log(`[audit] scanned ${rows} rows across ${files.length} files`)
    if (bad) {
      console.error('[FAIL] bank text audit found problems')
      process.exit(1)
    }
    console.log('[PASS] bank text clean')
  }, 50)
}

main()
