import { Router } from 'express';
import { logger } from '../middleware/requestLogger.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  authenticateUser,
  verifyToken,
  isAuthEnabled,
  getUserCount,
  registerUser,
  getAllUsers,
  getPendingUsers,
  updateUserRoles,
  deleteUser,
  ROLES,
} from '../services/users.js';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';

const router = Router();

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
      });
    }

    const result = await registerUser(username, password, name);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Registration failed');
    res.status(500).json({
      error: 'Registration failed',
    });
  }
});

/**
 * Login
 * POST /api/auth/login
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
      });
    }

    const result = await authenticateUser(username, password);

    if (!result.success) {
      return res.status(401).json({
        error: result.error,
      });
    }

    res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Login failed');
    res.status(500).json({
      error: 'Login failed',
    });
  }
});

/**
 * Verify token / Get current user
 * GET /api/auth/me
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

/**
 * Check if auth is enabled
 * GET /api/auth/check
 */
router.get('/check', (req, res) => {
  const authEnabled = isAuthEnabled();
  res.json({
    authEnabled,
    userCount: authEnabled ? getUserCount() : 0,
  });
});

/**
 * Get available roles
 * GET /api/auth/roles
 */
router.get('/roles', (req, res) => {
  res.json({
    roles: Object.values(ROLES),
  });
});

// =====================================================
// ADMIN ROUTES - Require admin role
// =====================================================

/**
 * Get all users (admin only)
 * GET /api/auth/admin/users
 */
router.get('/admin/users', authenticate, requireAdmin, (req, res) => {
  const users = getAllUsers();
  res.json({ users });
});

/**
 * Get pending users - users without roles (admin only)
 * GET /api/auth/admin/pending
 */
router.get('/admin/pending', authenticate, requireAdmin, (req, res) => {
  const pending = getPendingUsers();
  res.json({ users: pending, count: pending.length });
});

/**
 * Update user roles (admin only)
 * PUT /api/auth/admin/users/:username/roles
 */
router.put('/admin/users/:username/roles', authenticate, requireAdmin, (req, res) => {
  try {
    const { username } = req.params;
    const { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({
        error: 'Roles must be an array',
      });
    }

    const result = updateUserRoles(username, roles);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    res.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to update user roles');
    res.status(500).json({
      error: 'Failed to update user roles',
    });
  }
});

/**
 * Delete user (admin only)
 * DELETE /api/auth/admin/users/:username
 */
router.delete('/admin/users/:username', authenticate, requireAdmin, (req, res) => {
  try {
    const { username } = req.params;

    // Prevent self-deletion
    if (req.user.username === username.toLowerCase()) {
      return res.status(400).json({
        error: 'Cannot delete your own account',
      });
    }

    const result = deleteUser(username);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to delete user');
    res.status(500).json({
      error: 'Failed to delete user',
    });
  }
});

// =====================================================
// PLATFORM AUTH ROUTES
// =====================================================

// In-memory storage for platform auth tokens
// SECURITY: Keyed by device ID to prevent cross-user cookie leakage
// Format: Map<deviceId:platform, {cookies, timestamp, expiresAt}>
const platformAuth = new Map();

// Token expiry time (4 hours)
const TOKEN_EXPIRY = 4 * 60 * 60 * 1000;

/**
 * Get storage key for platform auth (includes device isolation)
 */
function getPlatformAuthKey(req, platform) {
  // For Electron apps, use device ID for isolation
  const deviceId = req.headers['x-device-id'] || req.deviceId;
  if (deviceId) {
    return `${deviceId}:${platform}`;
  }
  // For webapp users, use user ID for isolation
  if (req.user?.id) {
    return `user-${req.user.id}:${platform}`;
  }
  // Fallback for extension sync - use client IP as weak identifier
  // SECURITY: This is less secure but allows extension cookies to work
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'anonymous';
  return `ip-${clientIP}:${platform}`;
}

/**
 * Store platform authentication
 * POST /api/auth/platform
 */
router.post('/platform', (req, res) => {
  try {
    const { platform, cookies, timestamp } = req.body;

    if (!platform || !cookies) {
      return res.status(400).json({
        error: 'Platform and cookies are required',
      });
    }

    const validPlatforms = ['glider', 'lark', 'hackerrank', 'leetcode', 'codesignal', 'codility', 'coderpad'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        error: `Invalid platform. Supported: ${validPlatforms.join(', ')}`,
      });
    }

    // Get device/user-specific storage key
    const storageKey = getPlatformAuthKey(req, platform);
    if (!storageKey) {
      return res.status(401).json({
        error: 'Device or user identification required to store platform auth',
        code: 'AUTH_REQUIRED',
      });
    }

    platformAuth.set(storageKey, {
      cookies,
      timestamp: timestamp || Date.now(),
      expiresAt: Date.now() + TOKEN_EXPIRY,
    });

    logger.info({ platform, storageKey: storageKey.split(':')[0] }, 'Platform auth stored');

    res.json({
      success: true,
      platform,
      expiresAt: platformAuth.get(storageKey).expiresAt,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to store platform auth');
    res.status(500).json({
      error: 'Failed to store authentication',
    });
  }
});

/**
 * Get authentication status for all platforms
 * GET /api/auth/status
 */
router.get('/status', (req, res) => {
  const status = {};
  const now = Date.now();
  const validPlatforms = ['glider', 'lark', 'hackerrank', 'leetcode', 'codesignal', 'codility', 'coderpad'];

  // Check status for each valid platform for this device/user
  for (const platform of validPlatforms) {
    const storageKey = getPlatformAuthKey(req, platform);
    if (!storageKey) continue;

    const auth = platformAuth.get(storageKey);
    if (auth) {
      const isExpired = auth.expiresAt < now;
      status[platform] = {
        authenticated: !isExpired,
        expiresAt: auth.expiresAt,
        expired: isExpired,
      };
    }
  }

  res.json(status);
});

/**
 * Get cookies for a specific platform (internal use)
 * SECURITY: Now requires request context to get device/user-scoped cookies
 */
export function getPlatformCookies(platform, req = null) {
  // If no request context, return null (can't determine which user's cookies)
  if (!req) {
    return null;
  }

  const storageKey = getPlatformAuthKey(req, platform);
  if (!storageKey) {
    return null;
  }

  const auth = platformAuth.get(storageKey);

  if (!auth) {
    return null;
  }

  // Check if expired
  if (auth.expiresAt < Date.now()) {
    platformAuth.delete(storageKey);
    return null;
  }

  return auth.cookies;
}

/**
 * Clear authentication for a platform
 * DELETE /api/auth/platform/:platform
 */
router.delete('/platform/:platform', (req, res) => {
  const { platform } = req.params;
  const storageKey = getPlatformAuthKey(req, platform);

  if (!storageKey) {
    return res.status(401).json({ error: 'Device or user identification required' });
  }

  if (platformAuth.has(storageKey)) {
    platformAuth.delete(storageKey);
    logger.info({ platform }, 'Platform auth cleared');
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Platform auth not found' });
  }
});

/**
 * Clear all authentication for this device/user
 * DELETE /api/auth/all
 */
router.delete('/all', (req, res) => {
  const validPlatforms = ['glider', 'lark', 'hackerrank', 'leetcode', 'codesignal', 'codility', 'coderpad'];
  let cleared = 0;

  for (const platform of validPlatforms) {
    const storageKey = getPlatformAuthKey(req, platform);
    if (storageKey && platformAuth.has(storageKey)) {
      platformAuth.delete(storageKey);
      cleared++;
    }
  }

  logger.info({ cleared }, 'Platform auth cleared for device/user');
  res.json({ success: true, cleared });
});

export default router;
