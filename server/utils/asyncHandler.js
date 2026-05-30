const logger = require('./logger');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const safeTable = (role) => {
    const map = { admin: 'users', teacher: 'teachers', parent: 'parents', student: 'students' };
    return map[role] || 'users';
};

const handleError = (res, err, context = '') => {
    const isDev = process.env.NODE_ENV === 'development';
    logger.error(`${context}: ${err.message}`, err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'حدث خطأ غير متوقع في الخادم',
        ...(isDev && { details: err.message })
    });
};

module.exports = { asyncHandler, safeTable, handleError };
