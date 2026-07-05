const jwt = require('jsonwebtoken');
const { hasPermission } = require('../services/permissionService');
const authAccounts = require('../services/authAccounts');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.token_version !== undefined) {
            const versionOk = await authAccounts.checkTokenVersion(decoded.id, decoded.role, decoded.token_version);
            if (!versionOk) {
                return res.status(401).json({ error: 'Session revoked. Please login again.' });
            }
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

const requirePermission = (permissionKey) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (req.user.role === 'admin') {
            return next();
        }

        // Use the correct model based on user role
        const roleModelMap = {
            teacher: 'teachers',
            parent: 'parents',
            student: 'students',
            chat_user: 'chat_users',
        };
        const model = roleModelMap[req.user.role] || 'users';

        try {
            const has = await hasPermission(req.user.id, permissionKey, model);
            if (!has) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
            next();
        } catch (err) {
            return res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

module.exports = { authMiddleware, checkRole, requirePermission };
