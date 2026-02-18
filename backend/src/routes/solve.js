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
    // Log the ENTIRE validated request body
    console.log('[Solve Stream] FULL req.body after validation:', JSON.stringify(req.body, null, 2));

    const { problem, provider = 'claude', language = 'auto', detailLevel = 'detailed', model, interviewMode = 'coding', designDetailLevel = 'basic' } = req.body;

    console.log('[Solve Stream] EXTRACTED VALUES - interviewMode:', interviewMode, 'designDetailLevel:', designDetailLevel, 'provider:', provider);

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
    console.log('[Solve Stream] Parsing fullText, length:', fullText.length);
    console.log('[Solve Stream] First 500 chars:', fullText.substring(0, 500));

    try {
      // Try to extract JSON from markdown code blocks first
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) ||
                        fullText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : fullText.trim();

      console.log('[Solve Stream] jsonMatch found:', !!jsonMatch);

      const result = JSON.parse(jsonStr);

      // Validate result has expected structure
      if (result && typeof result === 'object') {
        console.log('[Solve Stream] Parsed result keys:', Object.keys(result));
        console.log('[Solve Stream] result.code type:', typeof result.code, 'length:', result.code?.length);

        // Ensure code is a string, not an object
        if (result.code && typeof result.code !== 'string') {
          console.warn('[Solve Stream] result.code is not a string, converting');
          result.code = JSON.stringify(result.code);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
    } catch (parseErr) {
      console.error('[Solve Stream] First parse error:', parseErr.message);
      // For OpenAI with json_object mode, try parsing directly
      try {
        const result = JSON.parse(fullText.trim());
        console.log('[Solve Stream] Direct parse succeeded, keys:', Object.keys(result));
        res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
      } catch (directParseErr) {
        console.error('[Solve Stream] Direct parse also failed:', directParseErr.message);
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
router.post('/followup', validate('followup'), async (req, res, next) => {
  try {
    const { question, problem, code, pitch, currentDesign, provider = 'claude', model } = req.body;

    console.log('[Followup] Received request:', { question, hasCode: !!code, hasPitch: !!pitch, hasDesign: !!currentDesign, provider, model });

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

    console.log('[Followup] Starting stream...');
    for await (const chunk of service.answerFollowUpQuestion(question, context, model)) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk, partial: true })}\n\n`);
    }

    console.log('[Followup] Stream complete, sending final result, length:', fullText.length);
    // Send the answer directly (no JSON parsing needed for simple answers)
    const finalMsg = `data: ${JSON.stringify({ done: true, result: { answer: fullText.trim() } })}\n\n`;
    console.log('[Followup] Final message:', finalMsg.substring(0, 200));
    res.write(finalMsg);
    res.end();
    console.log('[Followup] Response ended');
  } catch (error) {
    console.error('[Followup] Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
