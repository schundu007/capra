import { Router } from 'express';
import { fetchProblemFromUrl } from '../services/scraper.js';
import { validate } from '../middleware/validators.js';
import { AppError, ErrorCode } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', validate('fetch'), async (req, res, next) => {
  try {
    const { url } = req.body;

    // Pass electron platform cookies if available (for desktop app)
    const electronCookies = req.electronPlatformCookies || null;

    const result = await fetchProblemFromUrl(url, electronCookies);

    if (!result.success) {
      throw new AppError(
        result.error || 'Failed to fetch problem',
        ErrorCode.EXTERNAL_API_ERROR,
        { sourceUrl: result.sourceUrl }
      );
    }

    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(
      'Failed to fetch URL',
      ErrorCode.EXTERNAL_API_ERROR,
      error.message
    ));
  }
});

export default router;
