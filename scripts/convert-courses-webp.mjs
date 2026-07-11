import { readdirSync, existsSync } from 'fs';
import sharp from 'sharp';
import { join, parse } from 'path';

const targets = [
  { dir: join(import.meta.dirname, '../src/assets/courses'), ext: '.jpg', width: 640 },
  { dir: join(import.meta.dirname, '../public'), files: ['dareen_logo_new.jpg'], width: 400 },
  { dir: join(import.meta.dirname, '../public'), files: ['hero-child.webp'], width: 320, isWebp: true },
];

for (const target of targets) {
  const files = target.files || readdirSync(target.dir).filter(f => f.endsWith(target.ext));
  for (const file of files) {
    const inputPath = join(target.dir, file);
    if (!existsSync(inputPath)) continue;
    const outName = parse(file).name + '.webp';
    const outputPath = join(target.dir, outName);
    const img = sharp(inputPath);
    const meta = await img.metadata();
    const newWidth = Math.min(meta.width || 1024, target.width);
    await img
      .resize(newWidth, undefined, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    const inKB = ((meta.size || 0) / 1024).toFixed(1);
    const outMeta = await sharp(outputPath).metadata();
    const outKB = ((outMeta.size || 0) / 1024).toFixed(1);
    console.log(`${file} (${inKB} KB) → ${outName} (${outKB} KB)`);
  }
}
