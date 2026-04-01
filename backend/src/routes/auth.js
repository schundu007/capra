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
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '613343492889-3snli8cnfpib37d3v4gichargk236ae6.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? 'https://capra-backend.up.railway.app/api/auth/google/callback'
  : 'http://localhost:3001/api/auth/google/callback';
const FRONTEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://capra.cariara.com'
  : 'http://localhost:5173';

/**
 * GET /api/auth/google/login — Redirect to Google OAuth
 */
router.get('/google/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

/**
 * GET /api/auth/google/callback — Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${FRONTEND_URL}?error=no_code`);

  try {
    // Exchange code for tokens
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenResp.json();
    if (!tokens.access_token) throw new Error('No access token');

    // Get user info
    const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const gUser = await userResp.json();
    if (!gUser.email) throw new Error('No email from Google');

    // Find or create user in shared users table
    let userResult = await query('SELECT id, onboarding_completed FROM users WHERE email = $1', [gUser.email]);
    let userId;
    let onboardingCompleted = false;

    if (userResult.rows.length === 0) {
      // Create new user in shared users table
      const insertResult = await query(
        'INSERT INTO users (email, name, avatar, provider, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id',
        [gUser.email, gUser.name || gUser.email, gUser.picture || null, 'google']
      );
      userId = insertResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
      onboardingCompleted = userResult.rows[0].onboarding_completed || false;
    }

    // Initialize Ascend data (subscription, credits, free usage)
    try {
      await initUser(userId);
    } catch (initErr) {
      // Non-fatal — user can still log in
      logger.warn({ error: initErr.message, userId }, 'Failed to init Ascend user data');
    }

    // Issue JWT
    const jwtSecret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET_KEY not configured');
    const accessToken = jwt.sign(
      { sub: userId, email: gUser.email, type: 'access' },
      jwtSecret,
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token in URL hash
    // IMPORTANT: param names must match what AuthContext.parseAuthFromHash() expects
    res.redirect(`${FRONTEND_URL}/#access_token=${accessToken}&user_id=${userId}&user_email=${encodeURIComponent(gUser.email)}&user_name=${encodeURIComponent(gUser.name || '')}&user_avatar=${encodeURIComponent(gUser.picture || '')}&user_role=user&onboarding_completed=${onboardingCompleted}`);
  } catch (err) {
    logger.error({ error: err.message }, 'Google OAuth failed');
    res.redirect(`${FRONTEND_URL}/#error=oauth_failed`);
  }
});

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
 * Refresh access token
 * POST /api/auth/refresh
 * Accepts an expired access token and issues a fresh one with the same claims.
 */
router.post('/refresh', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Auth not configured' });
  }

  try {
    // Verify token but allow expired ones
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: [process.env.JWT_ALGORITHM || 'HS256'],
      ignoreExpiration: true,
    });

    if (!payload.sub || payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Issue fresh token
    const newToken = jwt.sign(
      { sub: payload.sub, email: payload.email, type: 'access' },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({ accessToken: newToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Verify token / Get current user
 * GET /api/auth/me
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // Fetch onboarding data from DB
    const result = await query(
      'SELECT onboarding_completed, job_roles FROM users WHERE id = $1',
      [req.user.id]
    );
    const dbUser = result.rows[0] || {};
    res.json({
      authenticated: true,
      user: {
        ...req.user,
        onboarding_completed: dbUser.onboarding_completed || false,
        job_roles: dbUser.job_roles || [],
      },
    });
  } catch (error) {
    // Fallback: return user without onboarding data if DB query fails
    res.json({
      authenticated: true,
      user: req.user,
    });
  }
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

/**
 * Grant admin subscription to a user (admin secret required)
 * POST /api/auth/admin/grant-subscription
 */
router.post('/admin/grant-subscription', async (req, res) => {
  const { email, adminSecret } = req.body;

  // Require admin secret from environment (no default — must be explicitly configured)
  const expectedSecret = process.env.ADMIN_SECRET;
  if (!expectedSecret || adminSecret !== expectedSecret) {
    return res.status(403).json({ error: 'Invalid admin secret' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { query } = await import('../config/database.js');

    // Find user by email
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: `User not found: ${email}` });
    }

    const userId = userResult.rows[0].id;

    // Upsert subscription
    await query(
      `INSERT INTO ascend_subscriptions (user_id, plan_type, status, created_at, updated_at)
       VALUES ($1, 'quarterly_pro', 'active', NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         plan_type = 'quarterly_pro', status = 'active', updated_at = NOW()`,
      [userId]
    );

    // Reset free usage limits to max
    await query(
      `INSERT INTO ascend_free_usage (user_id, coding_used, coding_limit, design_used, design_limit, company_prep_used, company_prep_limit)
       VALUES ($1, 0, 9999, 0, 9999, 0, 9999)
       ON CONFLICT (user_id) DO UPDATE SET
         coding_used = 0, coding_limit = 9999,
         design_used = 0, design_limit = 9999,
         company_prep_used = 0, company_prep_limit = 9999`,
      [userId]
    );

    // Add 10000 credits
    await query(
      `INSERT INTO ascend_credits (user_id, balance, lifetime_earned)
       VALUES ($1, 10000, 10000)
       ON CONFLICT (user_id) DO UPDATE SET
         balance = ascend_credits.balance + 10000,
         lifetime_earned = ascend_credits.lifetime_earned + 10000`,
      [userId]
    );

    logger.info({ email, userId }, 'Admin granted subscription');
    res.json({
      success: true,
      message: `Subscription granted to ${email}`,
      userId,
      subscription: 'quarterly_pro',
      freeLimit: 9999,
      creditsAdded: 10000,
    });
  } catch (error) {
    logger.error({ error: error.message, email }, 'Grant subscription failed');
    res.status(500).json({ error: error.message });
  }
});

export default router;
