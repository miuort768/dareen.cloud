/**
 * Standard utility for consistent API responses.
 */
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

    static notFound(res, entity = 'Resource') {
        return this.error(res, `${entity} not found`, 404);
    }

    static badRequest(res, message) {
        return this.error(res, message, 400);
    }
}

module.exports = ResponseHandler;
