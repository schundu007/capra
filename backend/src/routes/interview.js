import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getApiKey as getClaudeKey } from '../services/claude.js';
import { getApiKey as getOpenAIKey } from '../services/openai.js';

const router = Router();

const INTERVIEW_SYSTEM_PROMPT = `You are an expert interview assistant helping a candidate in a live technical interview.

RULES:
1. Provide CONCISE, DIRECT answers - the candidate needs to respond quickly
2. Focus on the key points that matter most
3. If it's a coding question, provide a brief approach first, then code if needed
4. If it's a behavioral question, use the STAR method briefly
5. If it's a system design question, hit the main components quickly
6. Keep answers to 2-3 key points maximum
7. Use bullet points for clarity
8. Be conversational - this should sound natural when spoken

FORMAT YOUR RESPONSE AS:
- Start with the most important point
- Add 1-2 supporting points if needed
- End with a brief conclusion or next step

Remember: The candidate will read this aloud, so keep it natural and speakable.`;

// POST /api/interview/answer - Generate answer for interview question (streaming)
router.post('/answer', async (req, res) => {
  const { question, context = '', provider = 'claude', model } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const contextPrompt = context
      ? `\n\nPREVIOUS CONTEXT:\n${context}\n\n`
      : '';

    const userMessage = `${contextPrompt}INTERVIEWER QUESTION: "${question}"\n\nProvide a concise, natural-sounding answer that the candidate can speak aloud.`;

    if (provider === 'openai') {
      const apiKey = getOpenAIKey();
      if (!apiKey) {
        res.write(`data: ${JSON.stringify({ error: 'OpenAI API key not configured' })}\n\n`);
        res.end();
        return;
      }

      const openai = new OpenAI({ apiKey });
      const selectedModel = model || 'gpt-4o';

      const stream = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: INTERVIEW_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1024,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
        }
      }
    } else {
      // Claude (default)
      const apiKey = getClaudeKey();
      if (!apiKey) {
        res.write(`data: ${JSON.stringify({ error: 'Anthropic API key not configured' })}\n\n`);
        res.end();
        return;
      }

      const anthropic = new Anthropic({ apiKey });
      const selectedModel = model || 'claude-sonnet-4-20250514';

      const stream = await anthropic.messages.stream({
        model: selectedModel,
        max_tokens: 1024,
        system: INTERVIEW_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userMessage },
        ],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.text) {
          res.write(`data: ${JSON.stringify({ chunk: event.delta.text })}\n\n`);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[Interview] Error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
