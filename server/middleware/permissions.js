const ResponseHandler = require('../utils/responseHandler');

const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return ResponseHandler.unauthorized(res, 'يجب تسجيل الدخول أولاً');
        }
        if (!roles.includes(req.user.role)) {
            return ResponseHandler.forbidden(res, 'ليس لديك صلاحية للوصول إلى هذه الميزة');
        }
        next();
    };
};

const hasPermission = (...perms) => {
    return (req, res, next) => {
        if (!req.user) {
            return ResponseHandler.unauthorized(res, 'يجب تسجيل الدخول أولاً');
        }
        if (req.user.role === 'admin' || perms.some(p => req.user.permissions?.includes(p))) {
            return next();
        }
        return ResponseHandler.forbidden(res, 'ليس لديك صلاحية للوصول إلى هذه الميزة');
    };
};

const isAdmin = hasRole('admin');

const isTeacherOrAdmin = (req, res, next) => {
    if (!req.user) {
        return ResponseHandler.unauthorized(res, 'يجب تسجيل الدخول أولاً');
    }
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
        return next();
    }
    return ResponseHandler.forbidden(res, 'هذه الميزة متاحة للمعلمين فقط');
};

module.exports = { hasRole, hasPermission, isAdmin, isTeacherOrAdmin };
