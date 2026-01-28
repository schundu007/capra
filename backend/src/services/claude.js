import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function solveProblem(problemText, language = 'auto', fast = true) {
  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  // Use Claude 3.5 Sonnet for best speed/quality balance
  const model = 'claude-3-5-sonnet-20241022';

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${languageInstruction}\n\nSolve this problem and return the response as JSON:\n\n${problemText}`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const content = response.content[0].text;

  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      code: content,
      explanations: [{ line: 1, code: content, explanation: 'Raw response from AI' }],
      complexity: { time: 'Unknown', space: 'Unknown' },
    };
  }
}

export async function extractText(base64Image, mimeType) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: 'Extract all text from this image. Return ONLY the extracted text, nothing else. Preserve the formatting and structure as much as possible.',
          },
        ],
      },
    ],
  });

  return { text: response.content[0].text };
}

export async function fixCode(code, error, language) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
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
  });

  let fixedCode = response.content[0].text;
  const codeMatch = fixedCode.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
  if (codeMatch) {
    fixedCode = codeMatch[1];
  }
  return { code: fixedCode.trim() };
}

export async function analyzeImage(base64Image, mimeType) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: 'This is a screenshot of a coding problem. Extract the problem description, then solve it and return the response as JSON with code, explanations, and complexity.',
          },
        ],
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const content = response.content[0].text;

  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      code: content,
      explanations: [{ line: 1, code: content, explanation: 'Raw response from AI' }],
      complexity: { time: 'Unknown', space: 'Unknown' },
    };
  }
}
