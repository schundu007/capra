import { Router } from 'express';
import * as claude from '../services/claude.js';
import * as openai from '../services/openai.js';
import { validate } from '../middleware/validators.js';
import { AppError, ErrorCode } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', validate('solve'), async (req, res, next) => {
  try {
    const { problem, provider = 'claude', language = 'auto', fast = true, model } = req.body;

    const service = provider === 'openai' ? openai : claude;
    const result = await service.solveProblem(problem, language, fast, model);

    res.json(result);
  } catch (error) {
    next(new AppError(
      'Failed to solve problem',
      ErrorCode.EXTERNAL_API_ERROR,
      error.message
    ));
  }
});

// Streaming endpoint for faster perceived response
router.post('/stream', validate('solve'), async (req, res, next) => {
  try {
    const { problem, provider = 'claude', language = 'auto', detailLevel = 'detailed', model } = req.body;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const service = provider === 'openai' ? openai : claude;
    let fullText = '';

    for await (const chunk of service.solveProblemStream(problem, language, detailLevel, model)) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk, partial: true })}\n\n`);
    }

    // Parse and send final result
    try {
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) ||
                        fullText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : fullText;
      const result = JSON.parse(jsonStr);
      res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
    } catch {
      // For OpenAI with json_object mode, try parsing directly
      try {
        const result = JSON.parse(fullText);
        res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
      } catch {
        res.write(`data: ${JSON.stringify({ done: true, result: { code: fullText, language: 'unknown' } })}\n\n`);
      }
    }
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
