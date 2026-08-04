const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const { validateImageUpload } = require('../../middleware/upload');
const { processImage } = require('../../services/imageService');
const logger = require('../../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'blog');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WebP, SVG'));
        }
    }
});

router.post('/blog-image', authMiddleware, checkRole(['admin']), upload.single('image'), validateImageUpload, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    }

    const { filename, originalname, mimetype, path: filePath } = req.file;
    const url = `/uploads/blog/${filename}`;

    processImage({
        filePath,
        filename,
        originalName: originalname,
        mimeType: mimetype,
        uploadDir: UPLOAD_DIR,
        options: {
            sizes: ['thumbnail', 'medium', 'large'],
            formats: ['webp'],
            stripMetadata: true,
        },
    }).then((result) => {
        if (result.queued) {
            logger.info('Image queued for processing: ' + filename + ' (job ' + result.jobId + ')');
        } else if (result.result) {
            logger.info('Image processed synchronously: ' + filename + ' (' + result.result.compression + ' compression)');
        }
    }).catch((err) => {
        const msg = (err && err.message) || '';
        // Validation rejections (bad user uploads) are expected outcomes,
        // not server faults — keep them out of the error log.
        const validation = /Image too small|Invalid or corrupted image|Unsupported MIME type|File (empty|not found)|exceeds max size|Unable to read image dimensions|sharp library not available/.test(msg);
        if (validation) {
            logger.warn('Image rejected for ' + filename + ': ' + msg);
        } else {
            logger.error('Image processing failed for ' + filename + ': ' + msg);
        }
    });

    res.json({ url, filename });
});

router.delete('/blog-image/:filename', authMiddleware, checkRole(['admin']), async (req, res) => {
    const fsp = require('fs').promises;
    const baseName = path.parse(req.params.filename).name;
    const dir = UPLOAD_DIR;

    const patterns = [
        req.params.filename,
        baseName + '_thumbnail.webp',
        baseName + '_medium.webp',
        baseName + '_large.webp',
    ];

    let deleted = 0;
    for (const pattern of patterns) {
        const filePath = path.join(dir, pattern);
        try {
            await fsp.access(filePath);
            await fsp.unlink(filePath);
            deleted++;
        } catch (err) {
            if (err.code !== 'ENOENT') {
                logger.warn('Failed to delete ' + pattern + ': ' + (err.message || err));
            }
        }
    }

    if (deleted > 0) {
        res.json({ success: true, deleted });
    } else {
        res.status(404).json({ error: 'الملف غير موجود' });
    }
});

module.exports = router;
