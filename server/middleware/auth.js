const jwt = require('jsonwebtoken');
const { safeTable } = require('../utils/asyncHandler');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.token_version !== undefined && req.db) {
            const table = safeTable(decoded.role);
            const current = await req.db.get(`SELECT token_version FROM ${table} WHERE id = ?`, [decoded.id]);
            if (current && current.token_version !== decoded.token_version) {
                return res.status(401).json({ error: 'Session revoked. Please login again.' });
            }
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
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

module.exports = { authMiddleware, checkRole };
