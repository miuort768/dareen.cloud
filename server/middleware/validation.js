const { z } = require('zod');
const logger = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
    try {
        // Parse the request body (and potentially query/params if needed, 
        // but usually validation is for body in POST/PUT)

        // trim string values in body before validation if possible, 
        // though Zod can handle transformations. 
        // Let's rely on Zod's parse/refine.

        const validatedData = schema.parse(req.body);

        // Replace req.body with the validated (and possibly transformed) data
        req.body = validatedData;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Validation Error', { path: req.path, errors: error.errors });
            return res.status(400).json({
                error: 'Validation Error',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }
        next(error);
    }
};

module.exports = validate;
