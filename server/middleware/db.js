const { getDb } = require('../utils/db');

async function dbMiddleware(req, res, next) {
    try {
        req.db = await getDb();
        next();
    } catch (err) {
        console.error('Database middleware error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
}

module.exports = dbMiddleware;
