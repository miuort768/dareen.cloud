const logger = require('./logger');

class ResponseHandler {
    static success(res, data, status = 200) {
        return res.status(status).json(data);
    }

    static error(res, message, status = 500, details = null) {
        const response = { error: message };
        if (details) response.details = details;
        if (process.env.NODE_ENV === 'development' && details instanceof Error) {
            response.stack = details.stack;
        }
        return res.status(status).json(response);
    }

    static serverError(res, err, context = '') {
        const isDev = process.env.NODE_ENV === 'development';
        logger.error(`${context}: ${err?.message || err}`, err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'حدث خطأ غير متوقع في الخادم',
            ...(isDev && { details: err?.message })
        });
    }

    static notFound(res, entity = 'Resource') {
        return this.error(res, `${entity} not found`, 404);
    }

    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }

    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }

    static badRequest(res, message) {
        return this.error(res, message, 400);
    }
}

module.exports = ResponseHandler;
