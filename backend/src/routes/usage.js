import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth.js';
import * as usageService from '../services/usageService.js';
import { logger } from '../middleware/requestLogger.js';

const router = Router();

/**
 * Get user's usage info
 * GET /api/usage
 */
router.get('/', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const usage = await usageService.getUsage(userId);

    res.json({
      usage,
      allowancesPerCredit: usageService.ALLOWANCES_PER_CREDIT,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get usage');
    res.status(500).json({ error: 'Failed to get usage info' });
  }
});

/**
 * Check if user can use a feature
 * GET /api/usage/can-use/:feature
 */
router.get('/can-use/:feature', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { feature } = req.params;
    const minutes = req.query.minutes ? parseInt(req.query.minutes, 10) : 1;

    let result;
    switch (feature) {
      case 'coding':
        result = await usageService.canUseCoding(userId);
        break;
      case 'system-design':
        result = await usageService.canUseSystemDesign(userId);
        break;
      case 'company-prep':
        result = await usageService.canUseCompanyPrep(userId);
        break;
      case 'interview':
        result = await usageService.canUseInterview(userId, minutes);
        break;
      default:
        return res.status(400).json({ error: 'Invalid feature type' });
    }

    res.json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to check usage');
    res.status(500).json({ error: 'Failed to check usage' });
  }
});

export default router;
