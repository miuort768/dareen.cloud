import sharp from 'sharp';
import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, parse, relative } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

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

  const webpPath = inputPath.replace(ext, '.webp');
  const avifPath = inputPath.replace(ext, '.avif');

  try {
    const img = sharp(inputPath);
    const metadata = await img.metadata();

    // Skip if source is already tiny
    if (metadata.width < 50 && metadata.height < 50) return;

    // Generate WebP
    const webpBuffer = await img
      .webp({ quality: 75, effort: 4 })
      .toBuffer();

    if (webpBuffer.length < statSync(inputPath).size) {
      await sharp(webpBuffer).toFile(webpPath);
      console.log(`✓ WebP: ${inputPath} → ${(webpBuffer.length / 1024).toFixed(1)} KB`);
    }

    // Generate AVIF
    const avifBuffer = await img
      .avif({ quality: 60, effort: 4 })
      .toBuffer();

    if (avifBuffer.length < statSync(inputPath).size) {
      await sharp(avifBuffer).toFile(avifPath);
      console.log(`✓ AVIF: ${inputPath} → ${(avifBuffer.length / 1024).toFixed(1)} KB`);
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
