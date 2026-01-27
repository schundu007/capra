/**
 * Solve Route
 * Handles problem solving requests via AI providers
 */

import { Router } from 'express';
import * as claude from '../services/claude.js';
import * as openai from '../services/openai.js';
import { ValidationError } from '../lib/errors.js';
import { asyncHandler, sendSuccess } from '../lib/response.js';
import { validate, validateSolveRequest } from '../lib/validators.js';
import { createLogger } from '../lib/logger.js';

const router = Router();
const logger = createLogger('routes:solve');

/**
 * POST /api/solve
 * Solve a coding problem using AI
 *
 * @body {string} problem - The problem description
 * @body {string} [provider='claude'] - AI provider (claude/openai)
 * @body {string} [language='auto'] - Target programming language
 */
router.post(
  '/',
  validate(validateSolveRequest),
  asyncHandler(async (req, res) => {
    const { problem, provider = 'claude', language = 'auto' } = req.body;

    logger.info('Solving problem', {
      requestId: req.id,
      provider,
      language,
      problemLength: problem.length,
    });

    // Select AI service
    const service = provider === 'openai' ? openai : claude;

    // Solve the problem
    const result = await service.solveProblem(problem, language);

    logger.info('Problem solved', {
      requestId: req.id,
      provider,
      hasCode: !!result.code,
      language: result.language,
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
