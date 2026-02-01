import { Router } from 'express';
import { logger } from '../middleware/requestLogger.js';
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
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
// In production, consider using Redis or encrypted file storage
const platformAuth = new Map();

// Token expiry time (4 hours)
const TOKEN_EXPIRY = 4 * 60 * 60 * 1000;

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

    const validPlatforms = ['glider', 'lark', 'hackerrank', 'leetcode', 'codesignal', 'codility'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        error: `Invalid platform. Supported: ${validPlatforms.join(', ')}`,
      });
    }

    platformAuth.set(platform, {
      cookies,
      timestamp: timestamp || Date.now(),
      expiresAt: Date.now() + TOKEN_EXPIRY,
    });

    logger.info({ platform }, 'Platform auth stored');

    res.json({
      success: true,
      platform,
      expiresAt: platformAuth.get(platform).expiresAt,
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

  for (const [platform, auth] of platformAuth) {
    const isExpired = auth.expiresAt < now;
    status[platform] = {
      authenticated: !isExpired,
      expiresAt: auth.expiresAt,
      expired: isExpired,
    };
  }

  res.json(status);
});

/**
 * Get cookies for a specific platform (internal use)
 */
export function getPlatformCookies(platform) {
  const auth = platformAuth.get(platform);

  if (!auth) {
    return null;
  }

  // Check if expired
  if (auth.expiresAt < Date.now()) {
    platformAuth.delete(platform);
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

  if (platformAuth.has(platform)) {
    platformAuth.delete(platform);
    logger.info({ platform }, 'Platform auth cleared');
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Platform auth not found' });
  }
});

/**
 * Clear all authentication
 * DELETE /api/auth/all
 */
router.delete('/all', (req, res) => {
  platformAuth.clear();
  logger.info('All platform auth cleared');
  res.json({ success: true });
});

export default router;
