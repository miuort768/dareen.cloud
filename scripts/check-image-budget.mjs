import { readdirSync, statSync, existsSync } from 'fs';
import { join, parse, relative } from 'path';

/**
 * Fails when any image exceeds the size budget (default 300 KB).
 * Guards the source folder and — after a build — the shipped output, since the
 * bundler re-encodes public images and can still leave a heavy fallback behind.
 *
 * Usage:
 *   node scripts/check-image-budget.mjs                       # public/ (+ dist/ when built)
 *   node scripts/check-image-budget.mjs --dir=public          # one folder only
 *   node scripts/check-image-budget.mjs --limit=200           # custom KB budget
 *   node scripts/check-image-budget.mjs --list                # print the 10 largest, always exit 0
 */

const ROOT = process.cwd();
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.bmp', '.ico'];
const LIST_ONLY = process.argv.includes('--list');
const DIR_ARG = process.argv.find((a) => a.startsWith('--dir='));
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT_KB = LIMIT_ARG ? Number(LIMIT_ARG.split('=')[1]) : 300;
const LIMIT_BYTES = LIMIT_KB * 1024;

const targets = DIR_ARG
  ? [DIR_ARG.split('=')[1]]
  : ['public', 'dist'].filter((dir) => existsSync(join(ROOT, dir)));

const kb = (bytes) => (bytes / 1024).toFixed(1);

function getFilesRecursive(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getFilesRecursive(fullPath));
    else files.push(fullPath);
  }
  return files;
}

const scanned = [];
for (const target of targets) {
  for (const file of getFilesRecursive(join(ROOT, target))) {
    if (!IMAGE_EXTENSIONS.includes(parse(file).ext.toLowerCase())) continue;
    scanned.push({ file: relative(ROOT, file), size: statSync(file).size });
  }
}

const overBudget = scanned.filter((f) => f.size > LIMIT_BYTES).sort((a, b) => b.size - a.size);

console.log(`🔍 Image budget: ${LIMIT_KB} KB — scanned ${scanned.length} file(s) in ${targets.join(', ')}`);

const largest = [...scanned].sort((a, b) => b.size - a.size).slice(0, 10);
console.log('\nLargest images:');
for (const f of largest) {
  const flag = f.size > LIMIT_BYTES ? ' ✗' : '';
  console.log(`  ${kb(f.size).padStart(8)} KB  ${f.file}${flag}`);
}

if (LIST_ONLY) process.exit(0);

if (overBudget.length > 0) {
  console.error(`\n❌ ${overBudget.length} image(s) over the ${LIMIT_KB} KB budget:`);
  for (const f of overBudget) console.error(`  ${kb(f.size).padStart(8)} KB  ${f.file}`);
  console.error('\nFix: node scripts/compress-large-images.mjs');
  process.exit(1);
}

console.log(`\n✅ Every image is under ${LIMIT_KB} KB.`);