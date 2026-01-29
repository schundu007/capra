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
  - MUST include print() or console.log() or echo statements to OUTPUT THE RESULT
  - The code must be self-contained and produce visible output when run
- IMPORTANT: Your code MUST print the final answer/result to stdout. Without print statements, the code will show "no output"
- For Python: Always use print() to output the result
- For JavaScript: Always use console.log() to output the result
- For Bash: Always use echo to output the result
- For API-based problems:
  - Use the requests library for HTTP calls in Python
  - Use correct API endpoints and methods
  - Handle HTTP errors and missing keys with try/except or .get()
  - GITHUB API REFERENCE:
    * Combined status: GET /repos/{owner}/{repo}/commits/{ref}/status
      Response: {"state": "success|failure|pending", "statuses": [...]}
      Use: response.json()["state"] NOT response.json()[0]["status"]
    * Check runs: GET /repos/{owner}/{repo}/commits/{ref}/check-runs
      Response: {"total_count": N, "check_runs": [{"status": "completed", "conclusion": "success"}, ...]}
      Use: response.json()["check_runs"][0]["conclusion"] NOT ["status"]["state"]
    * Pull requests: GET /repos/{owner}/{repo}/pulls/{number}
      Response: {"number": N, "state": "open|closed", "merged": bool, ...}
    * Always check response.ok or response.status_code before parsing JSON
    * Always use .get("key", default) for optional fields
  - Parse JSON responses correctly - always verify structure first
  - Match the EXACT output format specified
- For Bash: use proper shebang, handle all error cases
- For Terraform: use proper resource blocks
- For Jenkins: use declarative pipeline syntax`;

export async function solveProblem(problemText, language = 'auto', fast = true) {
  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  // Use Sonnet 4 (the original working model)
  const model = 'claude-sonnet-4-20250514';

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

export async function fixCode(code, error, language, problem = '') {
  const problemContext = problem
    ? `\nORIGINAL PROBLEM:\n${problem}\n`
    : '';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Fix this ${language} code based on the feedback/error provided.
${problemContext}
CODE:
\`\`\`${language}
${code}
\`\`\`

FEEDBACK/ERROR:
${error}

Return a JSON object with:
{
  "code": "the complete fixed code as a string",
  "explanations": [
    {"line": 1, "code": "first line of code", "explanation": "what this line does"},
    {"line": 2, "code": "second line of code", "explanation": "what this line does"}
  ]
}

IMPORTANT:
- Fix the code based on the feedback
- Do NOT add comments in the code
- Provide line-by-line explanations for the FIXED code
- Keep explanations concise`,
      },
    ],
  });

  const content = response.content[0].text;
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch {
    const codeMatch = content.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    const fixedCode = codeMatch ? codeMatch[1] : content;
    return { code: fixedCode.trim(), explanations: [] };
  }
}

export async function* solveProblemStream(problemText, language = 'auto') {
  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${languageInstruction}\n\nSolve this problem and return the response as JSON:\n\n${problemText}`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.text) {
      yield event.delta.text;
    }
  }
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
