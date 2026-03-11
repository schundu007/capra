import { verifyToken, isAuthEnabled, hasRole, hasMinRole, ROLES } from '../services/users.js';
import jwt from 'jsonwebtoken';
import { initUser } from '../config/database.js';
import { logger } from './requestLogger.js';

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
          source: 'jwt',
        };
      }
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'TOKEN_EXPIRED' };
    }
    // JWT verification failed silently
  }
  return null;
}

/**
 * Verify Electron request with device ID
 * SECURITY: Requires valid device ID with strict format validation
 */
function verifyElectronRequest(req) {
  const deviceId = req.headers['x-device-id'];

  // Device ID is now required (legacy support removed)
  if (!deviceId) {
    logger.warn({ path: req.path, ip: req.ip }, 'Electron request rejected: missing device ID');
    return { valid: false, error: 'Device ID required' };
  }

  // Strict device ID format validation
  // Format: {platform}-{24 hex chars}
  const deviceIdPattern = /^(darwin|win32|linux)-[a-f0-9]{24}$/;
  if (!deviceIdPattern.test(deviceId)) {
    logger.warn({ path: req.path, deviceId: deviceId.substring(0, 10) + '...' }, 'Electron request rejected: invalid device ID format');
    return { valid: false, error: 'Invalid device ID format' };
  }

  // Additional validation: check platform matches common patterns
  const platform = deviceId.split('-')[0];
  const validPlatforms = ['darwin', 'win32', 'linux'];
  if (!validPlatforms.includes(platform)) {
    logger.warn({ path: req.path, platform }, 'Electron request rejected: invalid platform');
    return { valid: false, error: 'Invalid platform' };
  }

  return { valid: true, deviceId };
}

/**
 * Authentication middleware
 * Supports multiple auth methods:
 * 1. Electron apps - with device ID verification
 * 2. JWT tokens (Cariara OAuth) - verify JWT signature
 * 3. Local tokens - verify with local user service
 *
 * SECURITY: Electron apps are allowed through because they:
 * - Provide their own API keys (Claude/OpenAI)
 * - Use local resources, not our backend credits
 * - Are validated by device ID (prevents simple header spoofing)
 */
export async function authenticate(req, res, next) {
  const isElectron = req.headers['x-electron-app'] === 'true';
  const authHeader = req.headers.authorization;

  // 1. Handle Electron apps
  if (isElectron) {
    const electronVerify = verifyElectronRequest(req);
    if (!electronVerify.valid) {
      return res.status(401).json({
        error: electronVerify.error || 'Invalid Electron request',
        code: 'INVALID_ELECTRON_REQUEST',
      });
    }

    req.deviceId = electronVerify.deviceId;
    req.isElectron = true;

    // If Electron provides auth token, still verify it for linked accounts
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtUser = await tryJwtAuth(token);
      if (jwtUser && !jwtUser.error) {
        req.user = jwtUser;
      }
    }

    return next();
  }

  // 2. Try JWT authentication (webapp users)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const jwtUser = await tryJwtAuth(token);

    if (jwtUser && !jwtUser.error) {
      req.user = jwtUser;
      return next();
    }

    if (jwtUser?.error === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        error: 'Token expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    // 3. Try local token verification as fallback
    if (isAuthEnabled()) {
      const result = verifyToken(token);
      if (result.valid) {
        req.user = { ...result.user, source: 'local' };
        return next();
      }
    }
  }

  // 4. No authentication provided
  // If no auth methods are configured, allow through (local dev mode)
  if (!isAuthEnabled() && !JWT_SECRET) {
    return next();
  }

  // Authentication required but not provided
  if (!authHeader) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  // Invalid token
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
