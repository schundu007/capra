import { verifyToken, isAuthEnabled, hasRole, hasMinRole, ROLES } from '../services/users.js';
import jwt from 'jsonwebtoken';
import { initUser } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';

/**
 * Try to verify JWT token (for webapp users with Cariara OAuth)
 */
async function tryJwtAuth(token) {
  if (!JWT_SECRET) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    if (payload.type === 'access' && payload.sub) {
      const userId = parseInt(payload.sub, 10);
      if (userId) {
        // Initialize user data
        try {
          await initUser(userId);
        } catch (err) {
          // Ignore init errors
        }

        return {
          id: userId,
          email: payload.email,
          role: payload.role || 'user',
        };
      }
    }
  } catch (error) {
    // JWT verification failed
  }
  return null;
}

/**
 * Authentication middleware
 * Supports multiple auth methods:
 * 1. Electron apps (X-Electron-App header) - skip auth
 * 2. JWT tokens (Cariara OAuth) - verify JWT
 * 3. Local tokens - verify with local user service
 */
export async function authenticate(req, res, next) {
  // Allow Electron apps through (they provide their own API keys)
  const isElectron = req.headers['x-electron-app'] === 'true';
  if (isElectron) {
    return next();
  }

  // If no users configured and no JWT secret, skip authentication
  if (!isAuthEnabled() && !JWT_SECRET) {
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

  // Try JWT auth first (for webapp users)
  const jwtUser = await tryJwtAuth(token);
  if (jwtUser) {
    req.user = jwtUser;
    return next();
  }

  // Fall back to local token verification
  if (isAuthEnabled()) {
    const result = verifyToken(token);
    if (result.valid) {
      req.user = result.user;
      return next();
    }
  }

  return res.status(401).json({
    error: 'Invalid or expired token',
    code: 'INVALID_TOKEN',
  });
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
