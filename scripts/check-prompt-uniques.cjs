/**
 * check-prompt-uniques.cjs — verifies that every generated question prompt is
 * unique across ALL bank files of one language (placement + 3 levels).
 *
 * Usage:
 *   node scripts/check-prompt-uniques.cjs <language> <fileA.ts> [fileB.ts ...]
 *
 * Replicates buildPrompt/pickWrongs collision logic: for ar-begin/ar-end the
 * prompt depends on the target LETTER, so per-target-letter uniqueness is
 * required; for all other types the prompt depends on the SUBJECT (row[0]),
 * so per-subject uniqueness across the whole language is required.
 * Exits 1 on duplicates.
 */

const LANGUAGE_LABEL = {
  arabic: 'العربية',
  english: 'الإنجليزية',
  french: 'الفرنسية',
  spanish: 'الإسبانية',
}

/**
 * The prompt is the question text the user sees. For ar-begin/ar-end the prompt
 * depends only on the target LETTER, so a repeated letter = a repeated question
 * (even if the correct word differs). For every other type the prompt depends on
 * row[0], so a repeated subject = a repeated question. Keying by type+prompt
 * therefore covers every template family uniformly.
 */
function promptKey(type, row, label) {
  const subject = row[0] ?? ''
  switch (type) {
    case 'tr':
      return `${type}::ما معنى «${subject}»؟`
    case 'trA':
      return `${type}::ما الكلمة ${label} التي تعني «${subject}»؟`
    case 'phrase':
      return `${type}::ما معنى العبارة «${subject}»؟`
    case 'art':
      return `${type}::ما أداة التعريف الصحيحة قبل «${subject}»؟`
    case 'plur':
      return `${type}::ما جمع كلمة «${subject}»؟`
    case 'num':
      return `${type}::اختر الكتابة الصحيحة للعدد «${subject}»:`
    case 'cloze':
    case 'gram':
      return `${type}::${subject}`
    case 'syn':
      return `${type}::ما مرادف «${subject}»؟`
    case 'ant':
      return `${type}::ما ضد «${subject}»؟`
    case 'ar-begin':
      return `${type}::أي كلمة تبدأ بحرف «${subject}»؟`
    case 'ar-end':
      return `${type}::أي كلمة تنتهي بحرف «${subject}»؟`
    case 'ar-type':
      return `${type}::كلمة «${subject}» هي:`
    case 'ar-muthanna':
      return `${type}::ما المثنى من كلمة «${subject}»؟`
    default:
      return `${type}::${subject}`
  }
}

async function main() {
  const [, , language, ...files] = process.argv
  if (!language || files.length === 0) {
    console.error('usage: node scripts/check-prompt-uniques.cjs <language> <fileA.ts> [fileB.ts ...]')
    process.exit(2)
  }

  const seen = new Map() // prompt/letter-subject -> first file
  let bad = false
  let total = 0
  const label = LANGUAGE_LABEL[language] ?? LANGUAGE_LABEL.english

  for (const file of files) {
    const absPath = require('node:path').resolve(file)
    const mod = await import('node:url').then((u) => import(u.pathToFileURL(absPath).href))
    for (const [exportName, bank] of Object.entries(mod)) {
      if (exportName === '__esModule' || exportName === 'default' || exportName === 'banksByLanguage') continue
      const templates = bank && typeof bank === 'object' && Array.isArray(bank.templates) ? bank.templates : null
      if (!templates) continue
      for (const template of templates) {
        const rows = Array.isArray(template.items) ? template.items : []
        for (const row of rows) {
          const key = promptKey(template.type, row, label)
          if (seen.has(key)) {
            const first = seen.get(key)
            console.error(
              `[DUP] "${key}" — appears in ${first.export} (${first.file}) and ${exportName} (${file})`,
            )
            bad = true
          } else {
            seen.set(key, { export: exportName, file })
          }
          total += 1
        }
      }
    }
  }

  console.log(`[${language}] scanned ${total} rows across ${files.length} files`)
  if (bad) {
    console.error(`[FAIL] duplicate prompts found for ${language}`)
    process.exit(1)
  }
  console.log('[PASS] no duplicate prompts')
}

main().catch((err) => {
  console.error('[FAIL] checker crashed:', err)
  process.exit(1)
})