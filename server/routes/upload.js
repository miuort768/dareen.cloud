const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { validateImageUpload } = require('../middleware/upload');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/blog');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
    },
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

router.post('/blog-image', authMiddleware, checkRole(['admin']), upload.single('image'), validateImageUpload, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    }
    const url = `/uploads/blog/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

router.delete('/blog-image/:filename', authMiddleware, checkRole(['admin']), (req, res) => {
    const fs = require('fs');
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'الملف غير موجود' });
    }
});

module.exports = router;
