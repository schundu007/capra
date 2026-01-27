/**
 * API Response Utilities
 * Provides consistent response formatting across the application
 */

/**
 * Success response structure
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for success
 * @property {*} data - Response data
 * @property {Object} [metadata] - Optional metadata
 */

/**
 * Error response structure
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {Object} error - Error details
 * @property {string} error.code - Error code
 * @property {string} error.message - Error message
 * @property {*} [error.details] - Additional error details
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {Object} [options] - Response options
 * @param {number} [options.status=200] - HTTP status code
 * @param {Object} [options.metadata] - Optional metadata to include
 */
export function sendSuccess(res, data, options = {}) {
  const { status = 200, metadata } = options;

  const response = {
    success: true,
    data,
  };

  if (metadata) {
    response.metadata = metadata;
  }

  res.status(status).json(response);
}

/**
 * Send a created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {Object} [metadata] - Optional metadata
 */
export function sendCreated(res, data, metadata) {
  sendSuccess(res, data, { status: 201, metadata });
}

/**
 * Send a no content response (204)
 * @param {Object} res - Express response object
 */
export function sendNoContent(res) {
  res.status(204).end();
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} [options] - Response options
 * @param {number} [options.status=500] - HTTP status code
 * @param {*} [options.details] - Additional error details
 */
export function sendError(res, code, message, options = {}) {
  const { status = 500, details } = options;

  const response = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  };

  if (details !== undefined) {
    response.error.details = details;
  }

  res.status(status).json(response);
}

/**
 * Send a validation error response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 * @param {*} [details] - Validation error details
 */
export function sendValidationError(res, message, details) {
  sendError(res, 'VALIDATION_ERROR', message, { status: 400, details });
}

/**
 * Send a not found error response (404)
 * @param {Object} res - Express response object
 * @param {string} [resource='Resource'] - Name of the resource
 */
export function sendNotFound(res, resource = 'Resource') {
  sendError(res, 'NOT_FOUND', `${resource} not found`, { status: 404 });
}

/**
 * Send an internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} [message='An unexpected error occurred'] - Error message
 */
export function sendInternalError(res, message = 'An unexpected error occurred') {
  sendError(res, 'INTERNAL_ERROR', message, { status: 500 });
}

/**
 * Wrap async route handlers to catch errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Add request ID to response headers
 * @param {Object} res - Express response object
 * @param {string} requestId - Request ID
 */
export function setRequestIdHeader(res, requestId) {
  res.setHeader('X-Request-ID', requestId);
}
