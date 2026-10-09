import sharp from 'sharp';
import { readdirSync, statSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, parse, relative } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const DELETE_ORIGINALS = process.argv.includes('--delete');

// Directories the app never wraps in <picture> — `pictureVariants` bails on the same
// two prefixes, so their rasters must NOT get generated siblings (user uploads would
// just accumulate dead files, and PWA icons are always referenced as .png).
const SKIP_DIRS = ['uploads', 'icons'];

function getFilesRecursive(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function convertToWebP(inputPath) {
  const ext = parse(inputPath).ext.toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) return;

  const skipped = SKIP_DIRS.some((dir) => relative(PUBLIC_DIR, inputPath).split('\\').join('/').startsWith(dir + '/'));
  const webpPath = inputPath.replace(ext, '.webp');
  const avifPath = inputPath.replace(ext, '.avif');

  try {
    // `public/**/*.webp|avif` are gitignored build artifacts, so a fresh clone has
    // none of them. <picture> commits to the first matching <source> and never
    // retries the <img> on a 404 — so this must run before dev too, not just build.
    // Both siblings matter (the avif <source> is offered first), so only a full pair
    // counts as already converted.
    const fresh = [webpPath, avifPath].every((p) => existsSync(p) && statSync(p).mtimeMs >= statSync(inputPath).mtimeMs);
    if (fresh) {
      return;
    }

    const img = sharp(inputPath);
    const metadata = await img.metadata();
    const originalSize = statSync(inputPath).size;

    // Skip if source is already tiny (skipped dirs only — a public raster this small is
    // still wrapped in <picture>, so it must ship both siblings or it renders blank)
    if (skipped && metadata.width < 50 && metadata.height < 50) return;

    // Generate WebP
    let webpCreated = false;
    const webpBuffer = await img
      .webp({ quality: 75, effort: 4 })
      .toBuffer();

    if (skipped && webpBuffer.length >= originalSize) {
      console.log(`- WebP skipped (not smaller): ${inputPath}`);
    } else {
      await sharp(webpBuffer).toFile(webpPath);
      webpCreated = true;
      console.log(`✓ WebP: ${inputPath} → ${(webpBuffer.length / 1024).toFixed(1)} KB`);
    }

    // Generate AVIF
    let avifCreated = false;
    const avifBuffer = await img
      .avif({ quality: 60, effort: 4 })
      .toBuffer();

    if (skipped && avifBuffer.length >= originalSize) {
      console.log(`- AVIF skipped (not smaller): ${inputPath}`);
    } else {
      await sharp(avifBuffer).toFile(avifPath);
      avifCreated = true;
      console.log(`✓ AVIF: ${inputPath} → ${(avifBuffer.length / 1024).toFixed(1)} KB`);
    }

    // Delete original only when both variants landed — a half-converted file would leave
    // <picture> pointing at a 404 source.
    if (DELETE_ORIGINALS && webpCreated && avifCreated) {
      unlinkSync(inputPath);
      console.log(`🗑️ Deleted original: ${inputPath} (${(originalSize / 1024).toFixed(1)} KB freed)`);
    }
  } catch (err) {
    console.error(`✗ Error processing ${inputPath}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Converting images to WebP/AVIF...\n');
  const start = Date.now();

  const files = getFilesRecursive(PUBLIC_DIR);
  const imageFiles = files.filter(f => IMAGE_EXTENSIONS.includes(parse(f).ext.toLowerCase()));

  if (imageFiles.length === 0) {
    console.log('No images found to convert.');
    return;
  }

  console.log(`Found ${imageFiles.length} images to process.\n`);

  const results = await Promise.allSettled(imageFiles.map(convertToWebP));
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`\n✅ Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`   Processed: ${succeeded}, Failed: ${failed}`);
}

main().catch(console.error);
