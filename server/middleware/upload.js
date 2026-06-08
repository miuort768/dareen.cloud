const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

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
            message: 'الأنواع المدعومة: JPG, PNG, GIF, WebP, SVG'
        });
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
