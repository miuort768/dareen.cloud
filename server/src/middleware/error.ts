import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;

    console.error('ERROR 💥', err);

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            stack: err.stack,
            error: err
        });
    } else {
        // Production mode
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: 'error',
                message: err.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!'
            });
        }
    }
};
