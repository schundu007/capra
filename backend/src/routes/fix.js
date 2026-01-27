/**
 * Fix Route
 * Handles automatic code fixing via AI
 */

import { Router } from 'express';
import * as claude from '../services/claude.js';
import * as openai from '../services/openai.js';
import { ValidationError } from '../lib/errors.js';
import { asyncHandler, sendSuccess } from '../lib/response.js';
import { validate, validateFixRequest } from '../lib/validators.js';
import { createLogger } from '../lib/logger.js';

const router = Router();
const logger = createLogger('routes:fix');

/**
 * POST /api/fix
 * Automatically fix code with errors using AI
 *
 * @body {string} code - Original code with errors
 * @body {string} error - Error message from execution
 * @body {string} [language] - Programming language
 * @body {string} [provider='openai'] - AI provider (claude/openai)
 */
router.post(
  '/',
  validate(validateFixRequest),
  asyncHandler(async (req, res) => {
    const { code, error, language, provider = 'openai' } = req.body;

    logger.info('Fixing code', {
      requestId: req.id,
      provider,
      language,
      codeLength: code.length,
      errorLength: error.length,
    });

    // Select AI service
    const service = provider === 'openai' ? openai : claude;

    // Fix the code
    const result = await service.fixCode(code, error, language);

    logger.info('Code fixed', {
      requestId: req.id,
      provider,
      hasFixedCode: !!result.code,
    });

    sendSuccess(res, result, {
      metadata: {
        provider,
        requestId: req.id,
        timestamp: new Date().toISOString(),
      },
    });
  })
);

export default router;
