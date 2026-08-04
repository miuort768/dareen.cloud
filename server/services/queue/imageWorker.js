const { createWorker } = require('./index');
const { getQueues, QUEUE_NAMES } = require('./queues');
const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const IMAGE_SIZES = {
    thumbnail: { width: 150, height: 150, fit: 'cover' },
    medium: { width: 600, height: null, fit: 'inside' },
    large: { width: 1200, height: null, fit: 'inside' },
};

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_WIDTH = 32;
const MIN_HEIGHT = 32;

class ImageWorker {
    async process(job) {
        const start = Date.now();
        const data = job.data || {};
        const { filePath, filename, originalName, mimeType, uploadDir, options } = data;

        const sizes = options?.sizes ?? Object.keys(IMAGE_SIZES);
        const formats = options?.formats ?? ['webp'];
        const stripMetadata = options?.stripMetadata !== false;

        const metrics = {
            jobId: job.id,
            filename,
            originalName,
            mimeType,
            original: null,
            variants: {},
            compression: '0%',
            durationMs: 0,
            status: 'processing',
            errors: [],
        };

        try {
            await this.validate(filePath, mimeType);

            const sharp = require('sharp');
            const metadata = await sharp(filePath).metadata();
            const fileStat = await fsp.stat(filePath);
            metrics.original = {
                size: fileStat.size,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                hasExif: !!metadata.exif,
                hasIptc: !!metadata.iptc,
                hasXmp: !!metadata.xmp,
            };

            const baseName = path.parse(filename).name;
            const ext = path.extname(filename);

            for (const sizeName of sizes) {
                const sizeConfig = IMAGE_SIZES[sizeName];
                if (!sizeConfig) {
                    metrics.errors.push('Unknown size: ' + sizeName);
                    continue;
                }

                for (const fmt of formats) {
                    const variantStart = Date.now();
                    const outName = baseName + '_' + sizeName + '.' + fmt;
                    const outPath = path.join(uploadDir, outName);

                    let pipeline = sharp(filePath);

                    if (stripMetadata) {
                        pipeline = pipeline.withMetadata({ exif: undefined, icc: undefined, xmp: undefined });
                    }

                    if (fmt === 'webp') {
                        pipeline = pipeline.webp({ quality: 80, effort: 4 });
                    } else if (fmt === 'jpeg' || fmt === 'jpg') {
                        pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
                    } else if (fmt === 'png') {
                        pipeline = pipeline.png({ compressionLevel: 8, palette: true });
                    } else if (fmt === 'avif') {
                        pipeline = pipeline.avif({ quality: 65 });
                    }

                    if (sizeConfig.fit === 'cover') {
                        pipeline = pipeline.resize(sizeConfig.width, sizeConfig.height, { fit: 'cover', position: 'centre' });
                    } else {
                        pipeline = pipeline.resize(sizeConfig.width, sizeConfig.height, { fit: 'inside', withoutEnlargement: true });
                    }

                    await pipeline.toFile(outPath);

                    const outStat = await fsp.stat(outPath);
                    const outMeta = await sharp(outPath).metadata();

                    metrics.variants[sizeName + '_' + fmt] = {
                        size: outStat.size,
                        width: outMeta.width,
                        height: outMeta.height,
                        format: fmt,
                        path: outName,
                        durationMs: Date.now() - variantStart,
                    };
                }
            }

            if (stripMetadata && (metrics.original.hasExif || metrics.original.hasIptc || metrics.original.hasXmp)) {
                const strippedPath = path.join(uploadDir, filename + '.cleaned' + ext);
                await sharp(filePath).withMetadata({ exif: undefined, icc: undefined, xmp: undefined }).toFile(strippedPath);
                await fsp.rename(strippedPath, filePath);
                metrics.original.metadataStripped = true;
            }

            const originalSize = metrics.original.size;
            const variantSizes = Object.values(metrics.variants).reduce((s, v) => s + v.size, 0);
            const totalOptimized = originalSize + variantSizes;
            const savedBytes = originalSize - (variantSizes > 0 ? Math.min(...Object.values(metrics.variants).map(v => v.size)) : originalSize);
            metrics.compression = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) + '%' : '0%';

            metrics.status = 'completed';
        } catch (err) {
            metrics.status = 'failed';
            metrics.errors.push(err.message);
            // Validation rejections (bad user uploads) are expected outcomes,
            // not server faults — keep them out of the error log.
            const validation = /Image too small|Invalid or corrupted image|Unsupported MIME type|File (empty|not found)|exceeds max size|Unable to read image dimensions|sharp library not available/.test(err.message || '');
            if (validation) {
                logger.warn('Image rejected for ' + filename + ': ' + err.message);
            } else {
                logger.error('Image processing failed for ' + filename + ': ' + err.message);
            }
            throw err;
        }

        metrics.durationMs = Date.now() - start;
        return metrics;
    }

    async validate(filePath, mimeType) {
        if (!filePath) throw new Error('filePath is required');
        try {
            await fsp.access(filePath);
        } catch {
            throw new Error('File not found: ' + filePath);
        }

        const stat = await fsp.stat(filePath);
        if (stat.size === 0) throw new Error('File is empty');
        if (stat.size > MAX_FILE_SIZE) throw new Error('File exceeds max size (' + MAX_FILE_SIZE + ' bytes)');

        if (mimeType && !ALLOWED_MIME.includes(mimeType)) {
            throw new Error('Unsupported MIME type: ' + mimeType);
        }

        let sharp;
        try {
            sharp = require('sharp');
        } catch {
            throw new Error('sharp library not available');
        }

        let metadata;
        try {
            metadata = await sharp(filePath).metadata();
        } catch (err) {
            throw new Error('Invalid or corrupted image: ' + (err.message || err));
        }

        if (!metadata.width || !metadata.height) {
            throw new Error('Unable to read image dimensions');
        }
        if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
            throw new Error('Image too small: ' + metadata.width + 'x' + metadata.height + ' (min ' + MIN_WIDTH + 'x' + MIN_HEIGHT + ')');
        }
    }
}

function initialize() {
    const { prisma } = require('../../utils/prisma');

    const imageWorker = createWorker('images', async (job) => {
        const worker = new ImageWorker();
        return worker.process(job);
    }, {
        concurrency: 3,
    });

    imageWorker.on('completed', (job) => {
        const result = job.returnvalue;
        if (result) {
            logger.info('Image processed: ' + result.filename + ' (' + result.compression + ' compression, ' + result.durationMs + 'ms)');
        }
    });

    imageWorker.on('failed', async (job, err) => {
        const msg = (err && err.message) || '';
        const validation = /Image too small|Invalid or corrupted image|Unsupported MIME type|File (empty|not found)|exceeds max size|Unable to read image dimensions|sharp library not available/.test(msg);
        if (validation) {
            logger.warn('Image rejected for job ' + (job?.id || '?') + ': ' + msg);
        } else {
            logger.error('Image processing failed for job ' + (job?.id || '?') + ': ' + msg);
        }
        if (job && job.attemptsMade >= (job.opts?.attempts || 3)) {
            try {
                const queues = getQueues();
                const { filename } = job.data || {};
                await queues.failedImages.add('image_failed', {
                    originalJobId: job.id,
                    originalData: job.data,
                    error: err.message,
                    failedAt: new Date().toISOString(),
                });
                logger.info('Moved failed image job ' + job.id + ' (' + (filename || '?') + ') to DLQ');
            } catch (dlqErr) {
                logger.error('Failed to move image job to DLQ: ' + (dlqErr.message || dlqErr));
            }
        }
    });

    return imageWorker;
}

module.exports = { initialize, ImageWorker, IMAGE_SIZES };
