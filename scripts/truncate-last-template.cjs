/**
 * truncate-last-template.cjs — drop the FINAL template from a bank file by text surgery.
 *
 * Why text-level: a corrupted authored batch is usually a SYNTAX error, so `import()` of the
 * module fails and any module-level tool (drop-template.cjs) cannot run. This walks the raw
 * text to the `    {` that opens the last template and cuts everything from there to EOF,
 * then re-closes the array. Bytes of every earlier template are untouched.
 *
 * Usage: node scripts/truncate-last-template.cjs <file.ts> <type> [--apply]
 */
const path = require('node:path')
const fs = require('node:fs')

function main() {
  const argv = process.argv.slice(2)
  const apply = argv.includes('--apply')
  const [file, type] = argv.filter((a) => a !== '--apply')
  if (!file || !type) {
    console.error('usage: node scripts/truncate-last-template.cjs <file.ts> <type> [--apply]')
    process.exit(2)
  }
  const abs = path.resolve(file)
  const text = fs.readFileSync(abs, 'utf8')
  const lines = text.split('\n')

  const typeIdx = lines.findIndex((l) => l.trim() === `type: '${type}',`)
  if (typeIdx === -1) {
    console.error(`[FAIL] no template "${type}" found`)
    process.exit(1)
  }
  // walk back to the line that opens this template object
  let openIdx = typeIdx
  while (openIdx >= 0 && lines[openIdx].trim() !== '{') openIdx--
  if (openIdx === -1) {
    console.error('[FAIL] could not locate the opening brace of the template')
    process.exit(1)
  }
  const removed = lines.slice(openIdx).length
  const kept = lines.slice(0, openIdx)
  const out = kept.join('\n').replace(/\s+$/, '') + '\n  ],\n}\n'
  console.log(`${apply ? 'APPLIED' : 'DRY-RUN'}: dropping "${type}" (${removed} lines from ${openIdx + 1})`)
  if (apply) {
    fs.writeFileSync(abs, out, 'utf8')
    console.log('written')
  }
}
main()
