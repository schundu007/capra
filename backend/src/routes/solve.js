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
    const { problem, provider = 'claude', language = 'auto', detailLevel = 'detailed', model, interviewMode = 'coding', designDetailLevel = 'basic' } = req.body;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const service = provider === 'openai' ? openai : claude;
    let fullText = '';

    for await (const chunk of service.solveProblemStream(problem, language, detailLevel, model, interviewMode, designDetailLevel)) {
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

// Follow-up question endpoint for any interview problem
router.post('/followup', validate('solve'), async (req, res, next) => {
  try {
    const { question, problem, code, pitch, currentDesign, provider = 'claude', model } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!problem && !code && !pitch && !currentDesign) {
      return res.status(400).json({ error: 'Need problem context (problem, code, pitch, or currentDesign)' });
    }

    const service = provider === 'openai' ? openai : claude;

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullText = '';

    // Build context for the question
    const context = {
      problem,
      code,
      pitch,
      systemDesign: currentDesign
    };

    for await (const chunk of service.answerFollowUpQuestion(question, context, model)) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk, partial: true })}\n\n`);
    }

    // Send the answer directly (no JSON parsing needed for simple answers)
    res.write(`data: ${JSON.stringify({ done: true, result: { answer: fullText.trim() } })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
