/**
 * Fetch Route
 * Handles URL fetching and problem extraction
 */

import { Router } from 'express';
import { fetchProblemFromUrl } from '../services/scraper.js';
import { ValidationError, ExternalServiceError } from '../lib/errors.js';
import { asyncHandler, sendSuccess } from '../lib/response.js';
import { validate, validateFetchRequest } from '../lib/validators.js';
import { createLogger } from '../lib/logger.js';

const router = Router();
const logger = createLogger('routes:fetch');

/**
 * POST /api/fetch
 * Fetch and extract problem from URL
 *
 * @body {string} url - URL to fetch problem from
 */
router.post(
  '/',
  validate(validateFetchRequest),
  asyncHandler(async (req, res) => {
    const { url } = req.body;

    logger.info('Fetching URL', {
      requestId: req.id,
      url: url.substring(0, 100),
    });

    const result = await fetchProblemFromUrl(url);

    if (!result.success) {
      logger.warn('URL fetch failed', {
        requestId: req.id,
        error: result.error,
        url: url.substring(0, 100),
      });

      throw new ExternalServiceError('Scraper', result.error, {
        sourceUrl: result.sourceUrl,
      });
    }

    logger.info('URL fetched successfully', {
      requestId: req.id,
      contentLength: result.problemText?.length,
    });

    sendSuccess(res, {
      problemText: result.problemText,
      sourceUrl: result.sourceUrl,
    });
  })
);

export default router;
