/**
 * OpenAI Service
 * Handles all interactions with the OpenAI API
 */

import OpenAI from 'openai';
import { config } from '../lib/config.js';
import { createLogger } from '../lib/logger.js';
import { AIServiceError } from '../lib/errors.js';

const logger = createLogger('services:openai');

/**
 * OpenAI API client instance
 */
const client = new OpenAI({
  apiKey: config.apiKeys.openai,
});

/**
 * System prompt for coding interview assistance
 */
const SYSTEM_PROMPT = `You are an expert coding interview assistant. Your code MUST produce the EXACT expected output.

CRITICAL RULES:
1. Read ALL examples/test cases in the problem CAREFULLY
2. Your code MUST produce output that EXACTLY matches the expected output format
3. Pay attention to exact output format: spacing, newlines, case sensitivity, special characters
4. Handle ALL edge cases mentioned or implied in the problem
5. Test your logic mentally against EVERY example before writing code
6. If output should be "V" for valid, it must be exactly "V" not "Valid" or "v"
7. If output should be "X" for invalid, it must be exactly "X" not "Invalid" or "x"

Supported languages: Python, Bash, Terraform, Jenkins, YAML, SQL, JavaScript

IMPORTANT: Respond with valid JSON in exactly this format:
{
  "language": "python|bash|terraform|jenkins|yaml|sql|javascript",
  "code": "the complete code as a string with \\n for newlines",
  "pitch": "A 1-2 minute verbal explanation of your thought process and solution approach. Structure it as: 1) Problem understanding - what we're solving, 2) Key insight - the core idea/pattern, 3) Approach - step by step strategy, 4) Why this works - reasoning. Write in first person as if explaining to an interviewer.",
  "examples": [
    {"input": "example input 1 from problem", "expected": "expected output 1"},
    {"input": "example input 2 from problem", "expected": "expected output 2"}
  ],
  "explanations": [
    {"line": 1, "code": "first line of code", "explanation": "explanation for line 1"},
    {"line": 2, "code": "second line of code", "explanation": "explanation for line 2"}
  ],
  "complexity": {
    "time": "O(n) or N/A for non-algorithmic",
    "space": "O(n) or N/A for non-algorithmic"
  }
}

Rules:
- Do NOT add any comments in the code
- Match the EXACT output format from examples
- The pitch should be conversational, suitable for verbal delivery in an interview
- CRITICAL: Always generate COMPLETE, RUNNABLE code that includes:
  - All necessary imports
  - Input reading code (using input() for Python, stdin for others) OR hardcoded test data if no stdin needed
  - Main execution logic
  - The code must be self-contained and produce output when run
- For API-based problems:
  - Use the requests library for HTTP calls in Python
  - Use correct API endpoints and methods
  - Handle HTTP errors properly
  - For GitHub PR status: GET /repos/{owner}/{repo}/commits/{sha}/status returns JSON with "state" field
    - state == "success" means all checks passed (show ✓)
    - state == "failure" or "pending" means not all passed (show ✕)
    - Do NOT use check-runs API, use the combined status endpoint
  - Parse JSON responses correctly
  - Match the EXACT output format specified
- For Bash: use proper shebang, handle all error cases
- For Terraform: use proper resource blocks
- For Jenkins: use declarative pipeline syntax`;

/**
 * Parse JSON from AI response, handling markdown code blocks
 * @param {string} content - Raw AI response content
 * @returns {Object} - Parsed JSON object
 */
function parseJsonResponse(content) {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    logger.warn('Failed to parse JSON response, returning raw content', {
      error: error.message,
    });
    return {
      code: content,
      explanations: [{ line: 1, code: content, explanation: 'Raw response from AI' }],
      complexity: { time: 'Unknown', space: 'Unknown' },
    };
  }
}

/**
 * Solve a coding problem using OpenAI GPT-4
 * @param {string} problemText - The problem description
 * @param {string} [language='auto'] - Target programming language
 * @returns {Promise<Object>} - Solution with code, explanations, complexity
 */
export async function solveProblem(problemText, language = 'auto') {
  const startTime = Date.now();

  try {
    const languageInstruction = language === 'auto'
      ? 'Detect the appropriate language from the problem context.'
      : `Write the solution in ${language.toUpperCase()}.`;

    logger.debug('Calling OpenAI API for problem solving', {
      model: config.ai.openai.model,
      language,
    });

    const response = await client.chat.completions.create({
      model: config.ai.openai.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `${languageInstruction}\n\nSolve this problem and return the response as JSON:\n\n${problemText}`,
        },
      ],
      max_tokens: config.ai.openai.maxTokens,
      response_format: { type: 'json_object' },
    });

    const duration = Date.now() - startTime;
    logger.debug('OpenAI API response received', {
      duration,
      finishReason: response.choices[0]?.finish_reason,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    });

    const content = response.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      logger.warn('Failed to parse OpenAI JSON response', { error: parseError.message });
      return {
        code: content,
        explanations: [{ line: 1, code: content, explanation: 'Raw response from AI' }],
        complexity: { time: 'Unknown', space: 'Unknown' },
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('OpenAI API error during problem solving', {
      error: error.message,
      duration,
      errorType: error.constructor?.name,
    });
    throw new AIServiceError('openai', error.message, { originalError: error.name });
  }
}

/**
 * Extract text from an image using OpenAI's vision capabilities
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<{text: string}>} - Extracted text
 */
export async function extractText(base64Image, mimeType) {
  const startTime = Date.now();

  try {
    logger.debug('Calling OpenAI API for text extraction', {
      model: config.ai.openai.model,
      mimeType,
    });

    const response = await client.chat.completions.create({
      model: config.ai.openai.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: 'Extract all text from this image. Return ONLY the extracted text, nothing else. Preserve the formatting and structure as much as possible.',
            },
          ],
        },
      ],
      max_tokens: config.ai.openai.maxTokens,
    });

    const duration = Date.now() - startTime;
    logger.debug('OpenAI API text extraction complete', { duration });

    return { text: response.choices[0].message.content };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('OpenAI API error during text extraction', {
      error: error.message,
      duration,
    });
    throw new AIServiceError('openai', error.message, { originalError: error.name });
  }
}

/**
 * Fix code that produced an error
 * @param {string} code - Original code with error
 * @param {string} error - Error message
 * @param {string} [language] - Programming language
 * @returns {Promise<{code: string}>} - Fixed code
 */
export async function fixCode(code, error, language) {
  const startTime = Date.now();

  try {
    logger.debug('Calling OpenAI API for code fix', {
      model: config.ai.openai.model,
      language,
      codeLength: code.length,
    });

    const response = await client.chat.completions.create({
      model: config.ai.openai.model,
      messages: [
        {
          role: 'user',
          content: `Fix this ${language} code that produced an error.

CODE:
\`\`\`${language}
${code}
\`\`\`

ERROR:
${error}

Return ONLY the fixed code, no explanations. Do NOT add comments.`,
        },
      ],
      max_tokens: config.ai.openai.maxTokens,
    });

    const duration = Date.now() - startTime;
    logger.debug('OpenAI API code fix complete', { duration });

    let fixedCode = response.choices[0].message.content;
    const codeMatch = fixedCode.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
      fixedCode = codeMatch[1];
    }
    return { code: fixedCode.trim() };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('OpenAI API error during code fix', {
      error: error.message,
      duration,
    });
    throw new AIServiceError('openai', error.message, { originalError: error.name });
  }
}

/**
 * Analyze an image of a coding problem and solve it
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} - Solution with code, explanations, complexity
 */
export async function analyzeImage(base64Image, mimeType) {
  const startTime = Date.now();

  try {
    logger.debug('Calling OpenAI API for image analysis', {
      model: config.ai.openai.model,
      mimeType,
    });

    const response = await client.chat.completions.create({
      model: config.ai.openai.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: 'This is a screenshot of a coding problem. Extract the problem description, then solve it and return the response as JSON with code, explanations, and complexity.',
            },
          ],
        },
      ],
      max_tokens: config.ai.openai.maxTokens,
    });

    const duration = Date.now() - startTime;
    logger.debug('OpenAI API image analysis complete', { duration });

    const content = response.choices[0].message.content;
    return parseJsonResponse(content);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('OpenAI API error during image analysis', {
      error: error.message,
      duration,
    });
    throw new AIServiceError('openai', error.message, { originalError: error.name });
  }
}
