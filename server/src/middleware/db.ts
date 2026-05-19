import '../types/express.d.ts'
import { Request, Response, NextFunction } from 'express';
import { getDb } from '../utils/db';

export async function dbMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        req.db = await getDb();
        next();
    } catch (err) {
        console.error('Database middleware error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
}
