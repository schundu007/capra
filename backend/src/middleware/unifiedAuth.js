/**
 * Unified Authentication Middleware
 *
 * Handles authentication for all platforms:
 * 1. Webapp users - JWT tokens from Cariara OAuth
 * 2. Electron apps - Device ID + optional linked account
 * 3. Local deployment - Username/password tokens
 *
 * SECURITY NOTES:
 * - Never trust headers alone for authentication
 * - Always verify tokens cryptographically
 * - Electron apps must provide device ID for audit trail
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { verifyToken, isAuthEnabled } from '../services/users.js';
import { initUser, query, isDatabaseConfigured } from '../config/database.js';
import { logger } from './requestLogger.js';

// IMPORTANT: Read env vars lazily (not at module load time) to avoid race
// conditions where dotenv hasn't loaded yet when this module is first imported.
function getJwtSecret() {
  return process.env.JWT_SECRET_KEY;
}
function getJwtAlgorithm() {
  return process.env.JWT_ALGORITHM || 'HS256';
}
const ELECTRON_SECRET = process.env.ELECTRON_SECRET || null;

/**
 * Verify JWT token from Cariara OAuth
 */
async function verifyJwtToken(token) {
  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: [getJwtAlgorithm()],
    });

    if (payload.type === 'access' && payload.sub) {
      const userId = parseInt(payload.sub, 10);
      if (userId) {
        // Initialize user data in database
        try {
          await initUser(userId);
        } catch (err) {
          logger.warn({ error: err.message }, 'Failed to init user');
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
    logger.debug({ error: error.message }, 'JWT verification failed');
  }
  return null;
}

/**
 * Verify Electron device request
 * Requires valid device ID header and optional auth token
 */
async function verifyElectronRequest(req) {
  const deviceId = req.headers['x-device-id'];
  const authHeader = req.headers.authorization;

  // Device ID is required for Electron apps
  if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 10) {
    return null;
  }

  // Validate device ID format (platform-hash)
  const deviceIdPattern = /^(darwin|win32|linux)-[a-f0-9]{24}$/;
  if (!deviceIdPattern.test(deviceId)) {
    logger.warn({ deviceId }, 'Invalid device ID format');
    return null;
  }

  // If auth token provided, verify it (for linked accounts)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const jwtUser = await verifyJwtToken(token);
    if (jwtUser && !jwtUser.error) {
      return {
        ...jwtUser,
        deviceId,
        source: 'electron-linked',
      };
    }
  }

  // Electron without linked account - allow with device tracking
  return {
    id: null,
    deviceId,
    source: 'electron-anonymous',
    anonymous: true,
  };
}

/**
 * Check if user has active subscription
 */
async function checkSubscription(userId) {
  if (!isDatabaseConfigured() || !userId) {
    return { hasSubscription: false };
  }

  try {
    const result = await query(
      `SELECT plan_type, status, current_period_end
       FROM ascend_subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return { hasSubscription: false };
    }

    const sub = result.rows[0];
    const isPaid = ['monthly', 'quarterly_pro', 'desktop_lifetime'].includes(sub.plan_type);
    const isActive = sub.status === 'active';
    const notExpired = !sub.current_period_end || new Date(sub.current_period_end) > new Date();

    return {
      hasSubscription: isPaid && isActive && notExpired,
      planType: sub.plan_type,
      status: sub.status,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to check subscription');
    return { hasSubscription: false };
  }
}

/**
 * Main authentication middleware
 *
 * Options:
 * - requireAuth: true = must be authenticated (default)
 * - requireSubscription: true = must have active subscription
 * - allowAnonymousElectron: true = allow Electron without linked account
 */
export function unifiedAuth(options = {}) {
  const {
    requireAuth = true,
    requireSubscription = false,
    allowAnonymousElectron = true,
  } = options;

  return async (req, res, next) => {
    const isElectron = req.headers['x-electron-app'] === 'true';
    const authHeader = req.headers.authorization;

    // Track request source for logging
    req.authSource = 'none';

    try {
      // 1. Try Electron authentication
      if (isElectron) {
        const electronAuth = await verifyElectronRequest(req);

        if (electronAuth) {
          req.user = electronAuth;
          req.authSource = electronAuth.source;
          req.deviceId = electronAuth.deviceId;

          // Check if anonymous Electron is allowed
          if (electronAuth.anonymous && !allowAnonymousElectron) {
            return res.status(401).json({
              error: 'Account linking required for this feature',
              code: 'ACCOUNT_LINK_REQUIRED',
            });
          }

          // Check subscription if required
          if (requireSubscription && electronAuth.id) {
            const subStatus = await checkSubscription(electronAuth.id);
            if (!subStatus.hasSubscription) {
              return res.status(403).json({
                error: 'Active subscription required',
                code: 'SUBSCRIPTION_REQUIRED',
              });
            }
            req.subscription = subStatus;
          }

          return next();
        }

        // Electron request but invalid device ID
        return res.status(401).json({
          error: 'Invalid device identification',
          code: 'INVALID_DEVICE',
        });
      }

      // 2. Try JWT authentication (webapp)
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const jwtUser = await verifyJwtToken(token);

        if (jwtUser && !jwtUser.error) {
          req.user = jwtUser;
          req.authSource = 'jwt';

          // Check subscription if required
          if (requireSubscription) {
            const subStatus = await checkSubscription(jwtUser.id);
            if (!subStatus.hasSubscription) {
              return res.status(403).json({
                error: 'Active subscription required',
                code: 'SUBSCRIPTION_REQUIRED',
              });
            }
            req.subscription = subStatus;
          }

          return next();
        }

        if (jwtUser?.error === 'TOKEN_EXPIRED') {
          return res.status(401).json({
            error: 'Token expired',
            code: 'TOKEN_EXPIRED',
          });
        }
      }

      // 3. Try local token authentication
      if (authHeader && authHeader.startsWith('Bearer ') && isAuthEnabled()) {
        const token = authHeader.split(' ')[1];
        const result = verifyToken(token);

        if (result.valid) {
          req.user = { ...result.user, source: 'local' };
          req.authSource = 'local';
          return next();
        }
      }

      // 4. No valid authentication found
      if (requireAuth) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      // Optional auth - continue without user
      next();

    } catch (error) {
      logger.error({ error: error.message }, 'Auth middleware error');
      return res.status(500).json({
        error: 'Authentication error',
        code: 'AUTH_ERROR',
      });
    }
  };
}

/**
 * Middleware presets for common use cases
 */

// Standard auth - requires authentication
export const requireAuthentication = unifiedAuth({ requireAuth: true });

// Premium features - requires subscription
export const requireSubscription = unifiedAuth({
  requireAuth: true,
  requireSubscription: true
});

// Linked account required - no anonymous Electron
export const requireLinkedAccount = unifiedAuth({
  requireAuth: true,
  allowAnonymousElectron: false
});

// Optional auth - attaches user if present
export const optionalAuth = unifiedAuth({ requireAuth: false });

export default unifiedAuth;
