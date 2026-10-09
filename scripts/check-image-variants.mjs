import { readdirSync, statSync, existsSync } from 'fs';
import { join, parse, relative } from 'path';

/**
 * Fails when a public raster has no generated `.webp`/`.avif` sibling, or when the
 * sibling is older than its source.
 *
 * WHY: `src/shared/components/ui/pictureVariants.ts` derives those siblings for every
 * root-relative raster, and `<picture>` commits to the first `<source>` whose `type` it
 * supports — it never retries the `<img>` when that request 404s. A missing (or stale)
 * sibling is therefore a *blank image with no console error*, which is the worst kind of
 * image regression. This gate turns that silent failure into a build failure.
 *
 * The skipped directories are the exact same two prefixes `pictureVariants` bails on
 * (`/uploads/` = user uploads, `/icons/` = PWA icons). Keep both lists in sync —
 * `src/shared/components/ui/pictureVariants.test.ts` pins the component side.
 *
 * Usage:
 *   node scripts/check-image-variants.mjs            # public/ (+ dist/ when built)
 *   node scripts/check-image-variants.mjs --dir=dist
 *   node scripts/check-image-variants.mjs --list     # report only, always exit 0
 *
 * In `dist/` only the *existence* of a sibling is enforced, never its mtime: the build
 * runs `vite-plugin-image-optimizer` over the copied rasters (rewriting them with a fresh
 * mtime) while the generated siblings keep their `public/` timestamps — so staleness
 * there is a copy artifact, not a content drift. A missing sibling still fails, because
 * that is the real "<picture> silently renders blank" risk on the deployed site.
 */

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const GENERATED_EXTENSIONS = ['.webp', '.avif'];
const SKIP_PREFIXES = ['uploads' + '/', 'icons' + '/'];

const LIST_ONLY = process.argv.includes('--list');
const DIR_ARG = process.argv.find((a) => a.startsWith('--dir='));
const targets = DIR_ARG
  ? [DIR_ARG.split('=')[1]]
  : ['public', 'dist'].filter((dir) => existsSync(join(ROOT, dir)));

const posix = (p) => p.split('\\').join('/');

function getFilesRecursive(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getFilesRecursive(fullPath));
    else files.push(fullPath);
  }
  return files;
}

const isSkipped = (relPath) => {
  // Always root the path so a direct child (`icons/x.png`) matches the same prefix as a
  // nested one (`blog/icons/x.png`) — `relative()` returns no leading slash.
  const normalized = '/' + posix(relPath);
  return SKIP_PREFIXES.some((prefix) => normalized.includes(prefix));
};

const scanned = [];
for (const target of targets) {
  const base = join(ROOT, target);
  if (!existsSync(base)) continue;
  // `dist/` rasters are rewritten by the image optimizer after the copy, so their mtime
  // is always newer than the copied sibling — only existence is meaningful there.
  const checkStaleness = posix(target).replace(/\/+$/, '') !== 'dist';
  for (const file of getFilesRecursive(base)) {
    if (!SOURCE_EXTENSIONS.includes(parse(file).ext.toLowerCase())) continue;
    const rel = posix(relative(base, file));
    if (isSkipped(rel)) continue;
    const sourceMtime = statSync(file).mtimeMs;

    const missing = [];
    const stale = [];
    for (const ext of GENERATED_EXTENSIONS) {
      const generated = file.replace(/\.(png|jpe?g)$/i, ext);
      if (!existsSync(generated)) missing.push(ext);
      else if (checkStaleness && statSync(generated).mtimeMs < sourceMtime) stale.push(ext);
    }

    scanned.push({ file: posix(relative(ROOT, file)), missing, stale });
  }
}

const broken = scanned.filter((f) => f.missing.length > 0 || f.stale.length > 0);

console.log(`🔍 Image variants: scanned ${scanned.length} public raster(s) in ${targets.join(', ')}`);
console.log(`   (skipped directories: ${SKIP_PREFIXES.map((p) => '/' + p).join(', ')})`);

if (broken.length === 0) {
  if (!LIST_ONLY) console.log(`\n✅ Every raster has fresh .webp + .avif siblings.`);
  process.exit(0);
}

const describe = (f) => {
  const parts = [];
  if (f.missing.length) parts.push(`missing ${f.missing.join(', ')}`);
  if (f.stale.length) parts.push(`stale ${f.stale.join(', ')}`);
  return parts.join(' · ');
};

console.log('\nRasters without usable variants:');
for (const f of broken) console.log(`  ${f.file} — ${describe(f)}`);

if (LIST_ONLY) process.exit(0);

console.error(`\n❌ ${broken.length} raster(s) would render blank inside <picture>.`);
console.error('\nFix: node scripts/convert-webp.mjs');
process.exit(1);