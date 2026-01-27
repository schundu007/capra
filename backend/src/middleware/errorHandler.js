/**
 * Global Error Handler Middleware
 * Handles all errors and sends consistent error responses
 */

import { isAppError, wrapError, ErrorCode } from '../lib/errors.js';
import { createLogger } from '../lib/logger.js';
import { config } from '../lib/config.js';

const logger = createLogger('error-handler');

/**
 * Map known error types to appropriate responses
 * @param {Error} error - Original error
 * @returns {Object} - Error response details
 */
function mapExternalError(error) {
  // Anthropic SDK errors
  if (error.name === 'APIError' || error.constructor?.name === 'APIError') {
    if (error.status === 401) {
      return {
        code: ErrorCode.INVALID_API_KEY,
        message: 'Invalid API key for AI service',
        status: 401,
      };
    }
    if (error.status === 429) {
      return {
        code: ErrorCode.RATE_LIMITED,
        message: 'AI service rate limit exceeded. Please try again later.',
        status: 429,
      };
    }
    return {
      code: ErrorCode.AI_SERVICE_ERROR,
      message: 'AI service error. Please try again.',
      status: 502,
    };
  }

  // OpenAI SDK errors
  if (error.name === 'OpenAIError' || error.constructor?.name === 'OpenAIError') {
    return {
      code: ErrorCode.AI_SERVICE_ERROR,
      message: 'AI service error. Please try again.',
      status: 502,
    };
  }

  // Multer file upload errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return {
        code: ErrorCode.FILE_TOO_LARGE,
        message: 'File size exceeds the maximum allowed limit',
        status: 400,
      };
    }
    return {
      code: ErrorCode.VALIDATION_ERROR,
      message: error.message,
      status: 400,
    };
  }

  return null;
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function errorHandler(err, req, res, next) {
  // Already sent response
  if (res.headersSent) {
    return next(err);
  }

  let errorResponse;

  // Check if it's our custom AppError
  if (isAppError(err)) {
    errorResponse = err.toJSON();
    errorResponse.error.requestId = req.id;

    logger.logError('Application error', err, {
      requestId: req.id,
      path: req.path,
      method: req.method,
    });

    return res.status(err.status).json(errorResponse);
  }

  // Map known external errors
  const mappedError = mapExternalError(err);
  if (mappedError) {
    logger.logError('External service error', err, {
      requestId: req.id,
      path: req.path,
      method: req.method,
      errorType: err.name,
    });

    return res.status(mappedError.status).json({
      success: false,
      error: {
        code: mappedError.code,
        message: mappedError.message,
        requestId: req.id,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Unknown error - wrap and log
  const wrappedError = wrapError(err, 'Unhandled error');

  logger.logError('Unhandled error', err, {
    requestId: req.id,
    path: req.path,
    method: req.method,
  });

  // In production, don't expose internal error details
  const message = config.env.isProduction
    ? 'An unexpected error occurred. Please try again.'
    : err.message;

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message,
      requestId: req.id,
      timestamp: new Date().toISOString(),
      ...(config.env.isDevelopment && { stack: err.stack }),
    },
  });
}

/**
 * Not found handler middleware
 * Handles 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  });
}

export default errorHandler;
