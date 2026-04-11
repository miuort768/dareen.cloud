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
            // Trim and simple XSS prevention
            return val.trim()
                .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '')
                .replace(/on\w+="[^"]*"/gmi, '');
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
 * 2. Activity Auditor
 * Logs high-level actions with user context
 */
const activityAuditor = (req, res, next) => {
    const user = req.user ? req.user.username : 'Guest';
    const role = req.user ? req.user.role : 'None';

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        // Redact sensitive fields from logs
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

/**
 * 3. Security Headers (redundant if using helmet, but good for manual control)
 */
const secureHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    next();
};

module.exports = {
    sanitizeInput,
    activityAuditor,
    secureHeaders
};
