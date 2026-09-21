/**
 * Advanced Backend Middleware Collection
 */

const logger = require('../utils/logger');

/**
 * 1. Global Input Sanitizer
 * Automatically trims strings and cleans common injection patterns
 */
const sanitizeInput = (req, res, next) => {
    const MAX_SANITIZE_DEPTH = 20;
    const sanitizeValue = (val, depth = 0) => {
        if (depth > MAX_SANITIZE_DEPTH) {
            // Deeply-nested payloads would recurse until the stack overflows —
            // truncate instead of crashing the request handler.
            return null;
        }
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
                cleanObj[k] = sanitizeValue(val[k], depth + 1);
            }
            return cleanObj;
        }
        if (Array.isArray(val)) {
            return val.map((v) => sanitizeValue(v, depth + 1));
        }
        return val;
    };

    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    next();
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
    activityAuditor
};
