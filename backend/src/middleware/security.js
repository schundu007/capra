/**
 * Security Middleware
 * Adds security headers and basic protections
 */

/**
 * Security headers middleware
 * Adds common security headers to all responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (basic)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * Sanitize request body middleware
 * Basic sanitization of string inputs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Recursively sanitize object values
 * @param {Object} obj - Object to sanitize
 * @returns {Object}
 */
function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip sanitization for known code fields that need raw content
      if (key === 'code' || key === 'problem' || key === 'error') {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }

  // Sanitize strings (basic null byte removal)
  if (typeof obj === 'string') {
    return obj.replace(/\0/g, '');
  }

  return obj;
}

/**
 * Request size limiter factory
 * @param {number} maxSize - Maximum request size in bytes
 * @returns {Function} Express middleware
 */
export function requestSizeLimit(maxSize) {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request body exceeds maximum size of ${Math.round(maxSize / (1024 * 1024))}MB`,
          timestamp: new Date().toISOString(),
        },
      });
    }
    next();
  };
}

export default securityHeaders;
