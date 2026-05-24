import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512];
const input = 'public/logo.png';
const outputDir = 'public/icons';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
    for (const size of sizes) {
        await sharp(input)
            .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .png()
            .toFile(path.join(outputDir, `icon-${size}x${size}.png`));

        // Also generate maskable icon (with padding)
        const pad = Math.round(size * 0.1);
        await sharp(input)
            .resize(size - pad * 2, size - pad * 2, { fit: 'contain' })
            .extend({
                top: pad, bottom: pad, left: pad, right: pad,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .png()
            .toFile(path.join(outputDir, `maskable-icon-${size}x${size}.png`));
    }
    console.log(`Generated ${sizes.length} icon pairs in ${outputDir}/`);
}

generate();
