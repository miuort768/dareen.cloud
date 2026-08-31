const fs = require('fs');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Magic-byte signatures — multipart mimetype is attacker-controlled and
// trivially spoofed; the file header is the reliable identity check.
const MAGIC_BYTES = [
    { ext: '.jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { ext: '.png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
    { ext: '.gif', test: (b) => b.slice(0, 3).toString('ascii') === 'GIF' },
    { ext: '.webp', test: (b) => b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP' },
];

const validateImageUpload = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
            error: 'حجم الصورة كبير جداً',
            message: `الحد الأقصى هو ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
    }

    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        return res.status(400).json({
            error: 'نوع الملف غير مدعوم',
            message: 'الأنواع المدعومة: JPG, PNG, GIF, WebP'
        });
    }

    // SVG rejected entirely — it can embed <script> and event handlers
    // (stored XSS served from the app origin). Magiс-byte check: reject
    // any file whose header doesn't match an allowed raster image type.
    try {
        const fd = fs.openSync(req.file.path, 'r');
        const buf = Buffer.alloc(16);
        fs.readSync(fd, buf, 0, 16, 0);
        fs.closeSync(fd);
        const ok = MAGIC_BYTES.some((m) => {
            try { return m.test(buf); } catch { return false; }
        });
        if (!ok) {
            try { fs.unlinkSync(req.file.path); } catch { /* already gone */ }
            return res.status(400).json({
                error: 'ملف غير صالح',
                message: 'محتوى الملف لا يطابق نوع الصورة المصرّح به'
            });
        }
    } catch (e) {
        return res.status(400).json({ error: 'تعذر التحقق من الملف' });
    }

    next();
};

const validateImageUrl = (url) => {
    if (!url) return true;
    const ext = url.split('?')[0].toLowerCase();
    const fileExt = ext.slice(ext.lastIndexOf('.'));
    return ALLOWED_EXTENSIONS.includes(fileExt) || url.startsWith('data:image/');
};

module.exports = { validateImageUpload, validateImageUrl, MAX_FILE_SIZE, ALLOWED_MIME_TYPES };
