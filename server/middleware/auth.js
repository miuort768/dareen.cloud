const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // --- Security Enhancement: Token Version Check ---
        // This ensures that "Logout from all devices" works instantly.
        if (decoded.token_version !== undefined && req.db) {
            let table = 'users';
            if (decoded.role === 'teacher') table = 'teachers';
            if (decoded.role === 'parent') table = 'parents';
            if (decoded.role === 'student') table = 'students';

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
