/**
 * Request ID Middleware
 * Generates and attaches unique request IDs for tracing
 */

import { randomUUID } from 'crypto';

/**
 * Generate a short request ID
 * @returns {string}
 */
function generateRequestId() {
  return randomUUID().split('-')[0];
}

/**
 * Request ID middleware
 * Adds a unique request ID to each request for tracing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function requestIdMiddleware(req, res, next) {
  // Use existing request ID from header or generate new one
  req.id = req.get('X-Request-ID') || generateRequestId();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);

  next();
}

export default requestIdMiddleware;
