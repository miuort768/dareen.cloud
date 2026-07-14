import sharp from 'sharp';
import { readdirSync, statSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, parse, relative } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const DELETE_ORIGINALS = process.argv.includes('--delete');

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
    let webpCreated = false;
    const webpBuffer = await img
      .webp({ quality: 75, effort: 4 })
      .toBuffer();

    if (webpBuffer.length < statSync(inputPath).size) {
      await sharp(webpBuffer).toFile(webpPath);
      webpCreated = true;
      console.log(`✓ WebP: ${inputPath} → ${(webpBuffer.length / 1024).toFixed(1)} KB`);
    }

    // Generate AVIF
    let avifCreated = false;
    const avifBuffer = await img
      .avif({ quality: 60, effort: 4 })
      .toBuffer();

    if (avifBuffer.length < statSync(inputPath).size) {
      await sharp(avifBuffer).toFile(avifPath);
      avifCreated = true;
      console.log(`✓ AVIF: ${inputPath} → ${(avifBuffer.length / 1024).toFixed(1)} KB`);
    }

    // Delete original if both WebP and AVIF were created successfully
    if (DELETE_ORIGINALS && (webpCreated || avifCreated)) {
      const originalSize = statSync(inputPath).size;
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
