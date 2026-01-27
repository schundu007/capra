import { Router } from 'express';
import * as claude from '../services/claude.js';
import * as openai from '../services/openai.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { code, error, language, provider = 'openai' } = req.body;

    if (!code || !error) {
      return res.status(400).json({
        error: 'Code and error are required',
      });
    }

    const service = provider === 'openai' ? openai : claude;
    const result = await service.fixCode(code, error, language);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fix code',
      details: error.message,
    });
  }
});

export default router;
