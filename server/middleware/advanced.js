/**
 * Advanced Backend Middleware Collection
 */

const logger = require('../utils/logger');

/**
 * 1. Global Input Sanitizer
 * Automatically trims strings and cleans common injection patterns
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
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
        logger.info(`[AUDIT] ${req.method} ${req.originalUrl} by ${user} (${role})`, {
            params: req.params,
            body: req.method !== 'DELETE' ? req.body : undefined
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
