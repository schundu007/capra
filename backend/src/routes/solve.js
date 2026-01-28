import { Router } from 'express';
import * as claude from '../services/claude.js';
import * as openai from '../services/openai.js';
import { validate } from '../middleware/validators.js';
import { AppError, ErrorCode } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', validate('solve'), async (req, res, next) => {
  try {
    const { problem, provider = 'claude', language = 'auto' } = req.body;

    const service = provider === 'openai' ? openai : claude;
    const result = await service.solveProblem(problem, language);

    res.json(result);
  } catch (error) {
    next(new AppError(
      'Failed to solve problem',
      ErrorCode.EXTERNAL_API_ERROR,
      error.message
    ));
  }
});

export default router;
