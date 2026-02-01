import { verifyToken, isAuthEnabled, hasRole, hasMinRole, ROLES } from '../services/users.js';

/**
 * Authentication middleware
 * Checks for valid JWT token in Authorization header
 */
export function authenticate(req, res, next) {
  // If no users configured, skip authentication
  if (!isAuthEnabled()) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  // Extract token from "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Invalid authorization format. Use: Bearer <token>',
      code: 'INVALID_AUTH_FORMAT',
    });
  }

  const token = parts[1];
  const result = verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }

  // Attach user to request
  req.user = result.user;
  next();
}

/**
 * Require specific role middleware
 * Usage: requireRole(ROLES.ADMIN)
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!hasRole(req.user, role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${role}`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * Require minimum role level middleware
 * Usage: requireMinRole(ROLES.DEVELOPER)
 */
export function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!hasMinRole(req.user, minRole)) {
      return res.status(403).json({
        error: `Access denied. Minimum required role: ${minRole}`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * Require admin role middleware
 */
export const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const result = verifyToken(parts[1]);
      if (result.valid) {
        req.user = result.user;
      }
    }
  }

  next();
}

// Re-export ROLES for convenience
export { ROLES };
