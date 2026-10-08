import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, renameSync, unlinkSync, existsSync } from 'fs';
import { join, parse } from 'path';

/**
 * Compresses any raster image that exceeds the size budget (default 300 KB).
 * Dimensions and filenames are preserved so no reference in the codebase changes.
 * Idempotent: files already under the limit are skipped.
 *
 * Usage:
 *   node scripts/compress-large-images.mjs             # limit 300 KB
 *   node scripts/compress-large-images.mjs --limit=200 # custom KB budget
 *   node scripts/compress-large-images.mjs --dry-run  # report only, write nothing
 *   node scripts/compress-large-images.mjs --dir=dist # scan another folder
 */

const ROOT = process.cwd();
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const DRY_RUN = process.argv.includes('--dry-run');
const DIR_ARG = process.argv.find((a) => a.startsWith('--dir='));
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT_KB = LIMIT_ARG ? Number(LIMIT_ARG.split('=')[1]) : 300;
const LIMIT_BYTES = LIMIT_KB * 1024;
const SCAN_DIR = join(ROOT, DIR_ARG ? DIR_ARG.split('=')[1] : 'public');

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

function hasAlpha(data, channels) {
  if (channels < 4) return false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) return true;
  }
  return false;
}

/**
 * Encodes under the budget by walking a quality ladder, so no file is ever
 * silently left oversized. Opaque PNGs fall back to mozjpeg bytes (several
 * project PNGs are photographic and ship JPEG payloads behind a .png name).
 */
async function encodeUnderLimit(raw, info, ext) {
  const rebuild = () => sharp(raw, { raw: info });

  if (ext === '.jpg' || ext === '.jpeg') {
    for (const quality of [82, 76, 70, 64]) {
      const buffer = await rebuild().jpeg({ quality, mozjpeg: true }).toBuffer();
      if (buffer.length < LIMIT_BYTES) return buffer;
    }
    return null;
  }

  for (const quality of [85, 80, 75, 70, 65]) {
    const buffer = await rebuild()
      .png({ compressionLevel: 9, effort: 10, palette: true, quality })
      .toBuffer();
    if (buffer.length < LIMIT_BYTES) return buffer;
  }

  if (!hasAlpha(raw, info.channels)) {
    for (const quality of [82, 76, 70, 64]) {
      const buffer = await rebuild().jpeg({ quality, mozjpeg: true }).toBuffer();
      if (buffer.length < LIMIT_BYTES) return buffer;
    }
  }

  return null;
}

/**
 * Replaces a file atomically: Windows virus scanners can hold a handle on a
 * freshly-read image and make an in-place write fail with
 * "UNKNOWN: unknown error, open ..." — writing a sibling temp file and renaming
 * it over the target avoids that window entirely.
 */
async function writeFileAtomic(target, buffer) {
  const temp = `${target}.tmp-compress`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      writeFileSync(temp, buffer);
      renameSync(temp, target);
      return;
    } catch (err) {
      if (existsSync(temp)) unlinkSync(temp);
      if (attempt === 3) throw err;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
}

async function compressFile(filePath) {
  const ext = parse(filePath).ext.toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) return null;

  const originalSize = statSync(filePath).size;
  if (originalSize <= LIMIT_BYTES) return null;

  try {
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const buffer = await encodeUnderLimit(data, info, ext);

    if (!buffer) {
      console.warn(`✗ ${filePath.slice(ROOT.length + 1)} stayed over budget (${kb(originalSize)} KB)`);
      return { filePath, originalSize, newSize: originalSize, ok: false };
    }

    if (!DRY_RUN) await writeFileAtomic(filePath, buffer);
    return { filePath, originalSize, newSize: buffer.length, ok: true };
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
    return { filePath, originalSize, newSize: originalSize, ok: false };
  }
}

async function main() {
  console.log(`🔧 Compressing images over ${LIMIT_KB} KB in ${SCAN_DIR}${DRY_RUN ? ' (dry run)' : ''}\n`);

  const files = getFilesRecursive(SCAN_DIR).filter((f) =>
    IMAGE_EXTENSIONS.includes(parse(f).ext.toLowerCase()),
  );
  const oversized = files.filter((f) => statSync(f).size > LIMIT_BYTES);

  if (oversized.length === 0) {
    console.log('✅ Nothing over budget.');
    return;
  }

  console.log(`Found ${oversized.length} image(s) over budget.\n`);

  // Sequential on purpose: libvips' thread pool drops reads ("UNKNOWN: unknown
  // error, open ...") when many pipelines start at once on Windows.
  const results = [];
  for (const file of oversized) {
    const result = await compressFile(file);
    if (result) results.push(result);
  }
  let freed = 0;
  let failed = 0;

  for (const r of results) {
    const rel = r.filePath.slice(ROOT.length + 1);
    if (!r.ok) {
      failed += 1;
      console.log(`✗ ${rel}: ${kb(r.originalSize)} KB (unchanged)`);
      continue;
    }
    freed += r.originalSize - r.newSize;
    const pct = Math.round(((r.originalSize - r.newSize) / r.originalSize) * 100);
    console.log(`✓ ${rel}: ${kb(r.originalSize)} KB → ${kb(r.newSize)} KB (-${pct}%)`);
  }

  console.log(
    `\n✅ Done — freed ${(freed / 1024 / 1024).toFixed(2)} MB${failed ? `, ${failed} failed` : ''}`,
  );
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});