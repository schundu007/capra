import { Router } from 'express';
import * as claude from '../services/claude.js';
import * as openai from '../services/openai.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { problem, provider = 'claude', language = 'auto' } = req.body;

    if (!problem || typeof problem !== 'string') {
      return res.status(400).json({
        error: 'Problem text is required',
      });
    }

    const service = provider === 'openai' ? openai : claude;
    const result = await service.solveProblem(problem, language);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to solve problem',
      details: error.message,
    });
  }
});

export default router;
