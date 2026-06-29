const jwt = require('jsonwebtoken');
const { prisma } = require('../utils/prisma');

const modelMap = {
    admin: 'user',
    teacher: 'teacher',
    student: 'student',
    parent: 'parent',
};

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.token_version !== undefined) {
            const modelName = modelMap[decoded.role];
            if (modelName) {
                const current = await prisma[modelName].findUnique({
                    where: { id: decoded.id },
                    select: { tokenVersion: true }
                });
                if (current && current.tokenVersion !== decoded.token_version) {
                    return res.status(401).json({ error: 'Session revoked. Please login again.' });
                }
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

module.exports = { authMiddleware, checkRole };
