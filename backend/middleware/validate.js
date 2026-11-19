const { z } = require('zod');

/**
 * Centralized DRY validation middleware using Zod schemas
 * @param {z.ZodSchema} schema - Zod schema to validate req.body, req.query, or req.params
 * @param {'body' | 'query' | 'params'} source - HTTP request property to validate
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError || err.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        const errorDetails = issues.map(e => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message
        }));
        const primaryMessage = errorDetails.map(d => `${d.field ? d.field + ': ' : ''}${d.message}`).join(', ') || 'Validation error';

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: primaryMessage,
            details: errorDetails
          }
        });
      }
      next(err);
    }
  };
};

module.exports = { validate };
