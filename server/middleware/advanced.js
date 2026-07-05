/**
 * Advanced Backend Middleware Collection
 */

const logger = require('../utils/logger');

/**
 * 1. Global Input Sanitizer
 * Automatically trims strings and cleans common injection patterns
 */
const sanitizeInput = (req, res, next) => {
    const sanitizeValue = (val) => {
        if (typeof val === 'string') {
            return val.trim()
                .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '')
                .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gmi, '')
                .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gmi, '')
                .replace(/<embed\b[^>]*>/gmi, '')
                .replace(/<form\b[^>]*>([\s\S]*?)<\/form>/gmi, '')
                .replace(/on\w+=["'][^"']*["']/gmi, '')
                .replace(/on\w+=`[^`]*`/gmi, '')
                .replace(/on\w+=\w+/gmi, '')
                .replace(/javascript\s*:/gmi, '')
                .replace(/data\s*:\s*text\s*\/\s*html/gmi, '');
        }
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
            const cleanObj = {};
            for (let k in val) {
                cleanObj[k] = sanitizeValue(val[k]);
            }
            return cleanObj;
        }
        if (Array.isArray(val)) {
            return val.map(sanitizeValue);
        }
        return val;
    };

    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    next();
};

/**
 * 2. Request Body Validator
 * Lightweight schema validation for request bodies.
 * Usage:
 *   router.post('/endpoint', validateBody({
 *     name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
 *     age: { type: 'number', min: 0, max: 150 },
 *     email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *     role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
 *     tags: { type: 'array' }
 *   }), handler);
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'يجب إرسال بيانات صالحة في جسم الطلب' });
        }

        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];
            const isPresent = value !== undefined && value !== null && value !== '';

            if (rules.required && !isPresent) {
                errors.push(`الحقل "${field}" مطلوب`);
                continue;
            }

            if (!isPresent) continue;

            if (rules.type === 'string' && typeof value !== 'string') {
                errors.push(`الحقل "${field}" يجب أن يكون نصاً`);
                continue;
            }
            if (rules.type === 'number') {
                const num = Number(value);
                if (isNaN(num)) {
                    errors.push(`الحقل "${field}" يجب أن يكون رقماً`);
                    continue;
                }
                if (rules.min !== undefined && num < rules.min) errors.push(`الحقل "${field}" أقل من الحد المسموح (${rules.min})`);
                if (rules.max !== undefined && num > rules.max) errors.push(`الحقل "${field}" أكبر من الحد المسموح (${rules.max})`);
            }
            if (rules.type === 'boolean' && typeof value !== 'boolean') {
                errors.push(`الحقل "${field}" يجب أن يكون منطقياً (true/false)`);
                continue;
            }
            if (rules.type === 'array' && !Array.isArray(value)) {
                errors.push(`الحقل "${field}" يجب أن يكون مصفوفة`);
                continue;
            }
            if (typeof value === 'string') {
                if (rules.minLength !== undefined && value.length < rules.minLength) errors.push(`الحقل "${field}" أقصر من الحد المسموح (${rules.minLength})`);
                if (rules.maxLength !== undefined && value.length > rules.maxLength) errors.push(`الحقل "${field}" أطول من الحد المسموح (${rules.maxLength})`);
                if (rules.pattern && !rules.pattern.test(value)) errors.push(`الحقل "${field}" غير صالح`);
                if (rules.enum && !rules.enum.includes(value)) errors.push(`الحقل "${field}" غير مسموح به، القيم المسموحة: ${rules.enum.join('، ')}`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'بيانات غير صالحة',
                details: errors
            });
        }

        next();
    };
};

/**
 * 3. Activity Auditor
 * Logs high-level actions with user context
 */
const activityAuditor = (req, res, next) => {
    const user = req.user ? req.user.username : 'Guest';
    const role = req.user ? req.user.role : 'None';

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const redact = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;
            const clean = Array.isArray(obj) ? [...obj] : { ...obj };
            const sensitiveKeys = ['password', 'newPassword', 'oldPassword', 'token', 'secret'];
            
            for (let key in clean) {
                if (sensitiveKeys.includes(key.toLowerCase())) {
                    clean[key] = '***REDACTED***';
                } else if (typeof clean[key] === 'object') {
                    clean[key] = redact(clean[key]);
                }
            }
            return clean;
        };

        logger.info(`[AUDIT] ${req.method} ${req.originalUrl} by ${user} (${role})`, {
            params: req.params,
            body: req.method !== 'DELETE' ? redact(req.body) : undefined
        });
    }
    next();
};

module.exports = {
    sanitizeInput,
    validateBody,
    activityAuditor
};
