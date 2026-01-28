import { Router } from 'express';
import { logger } from '../middleware/requestLogger.js';

const router = Router();

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
