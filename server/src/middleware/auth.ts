/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { JWTPayload } from '../types/express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('No token provided', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid or expired token', 401));
    }
};

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Unauthorized', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Forbidden: Insufficient permissions', 403));
        }

        next();
    };
};
