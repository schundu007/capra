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

    const { problem, provider = 'claude', language = 'auto', detailLevel = 'detailed', model, ascendMode = 'coding', designDetailLevel = 'basic', autoSwitch = false } = req.body;

    console.log('[Solve Stream] EXTRACTED VALUES - ascendMode:', ascendMode, 'designDetailLevel:', designDetailLevel, 'provider:', provider, 'autoSwitch:', autoSwitch);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Helper to stream from a provider
    async function streamFromProvider(service, providerName) {
      let fullText = '';
      for await (const chunk of service.solveProblemStream(problem, language, detailLevel, model, ascendMode, designDetailLevel)) {
        fullText += chunk;
        res.write(`data: ${JSON.stringify({ chunk, partial: true, provider: providerName })}\n\n`);
      }
      return fullText;
    }

    let service = provider === 'openai' ? openai : claude;
    let currentProvider = provider;
    let fullText = '';

    // Check if API key is available
    const apiKey = service.getApiKey ? service.getApiKey() : null;
    console.log(`[Solve Stream] Provider: ${currentProvider}, API key available: ${!!apiKey}`);

    if (!apiKey) {
      const errorMsg = `No API key configured for ${currentProvider}. Please add your API key in Settings.`;
      console.error(`[Solve Stream] ${errorMsg}`);
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
      return;
    }

    try {
      fullText = await streamFromProvider(service, currentProvider);
    } catch (primaryError) {
      console.error(`[Solve Stream] Primary provider (${currentProvider}) failed:`, primaryError.message);

      // If auto-switch is enabled, try the fallback provider
      if (autoSwitch) {
        const fallbackProvider = currentProvider === 'claude' ? 'openai' : 'claude';
        const fallbackService = fallbackProvider === 'openai' ? openai : claude;

        console.log(`[Solve Stream] Auto-switching to ${fallbackProvider}...`);
        res.write(`data: ${JSON.stringify({ switching: true, from: currentProvider, to: fallbackProvider, reason: primaryError.message })}\n\n`);

        try {
          fullText = await streamFromProvider(fallbackService, fallbackProvider);
          currentProvider = fallbackProvider;
        } catch (fallbackError) {
          console.error(`[Solve Stream] Fallback provider (${fallbackProvider}) also failed:`, fallbackError.message);
          throw new Error(`Both providers failed. ${currentProvider}: ${primaryError.message}. ${fallbackProvider}: ${fallbackError.message}`);
        }
      } else {
        throw primaryError;
      }
    }

    // Parse and send final result
    console.log('[Solve Stream] Parsing fullText, length:', fullText.length);
    console.log('[Solve Stream] First 500 chars:', fullText.substring(0, 500));

    try {
      // Try multiple ways to extract JSON from the response
      let jsonStr = null;
      let parseMethod = 'unknown';

      // Method 1: Extract from markdown code blocks
      const codeBlockMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) ||
                             fullText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
        parseMethod = 'codeblock';
      }

      // Method 2: Find JSON object that starts with { and contains "code" key
      if (!jsonStr) {
        const jsonObjectMatch = fullText.match(/\{[\s\S]*"code"\s*:\s*"[\s\S]*\}$/);
        if (jsonObjectMatch) {
          jsonStr = jsonObjectMatch[0];
          parseMethod = 'json-object';
        }
      }

      // Method 3: Find the first { and try to extract balanced JSON
      if (!jsonStr) {
        const firstBrace = fullText.indexOf('{');
        if (firstBrace !== -1) {
          jsonStr = fullText.substring(firstBrace);
          parseMethod = 'first-brace';
        }
      }

      // Method 4: Use full text as last resort
      if (!jsonStr) {
        jsonStr = fullText.trim();
        parseMethod = 'full-text';
      }

      console.log('[Solve Stream] Parse method:', parseMethod);

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
      console.error('[Solve Stream] Parse error:', parseErr.message);

      // Last resort: try to extract just the code field using regex
      try {
        const codeMatch = fullText.match(/"code"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
        const langMatch = fullText.match(/"language"\s*:\s*"([^"]+)"/);

        if (codeMatch) {
          const extractedCode = codeMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

          console.log('[Solve Stream] Extracted code via regex, length:', extractedCode.length);
          res.write(`data: ${JSON.stringify({ done: true, result: { code: extractedCode, language: langMatch?.[1] || 'python' } })}\n\n`);
        } else {
          console.error('[Solve Stream] Could not extract code from response');
          res.write(`data: ${JSON.stringify({ error: 'Failed to parse AI response. Please try again.' })}\n\n`);
        }
      } catch (regexErr) {
        console.error('[Solve Stream] Regex extraction failed:', regexErr.message);
        res.write(`data: ${JSON.stringify({ error: 'Failed to parse AI response. Please try again.' })}\n\n`);
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
