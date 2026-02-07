import Anthropic from '@anthropic-ai/sdk';

// Safe logging that ignores EPIPE errors (happens in Electron when pipe closes)
function safeLog(...args) {
  try {
    console.log(...args);
  } catch {
    // Ignore EPIPE and other write errors
  }
}

// Support for runtime API keys (used by Electron app)
let runtimeApiKey = null;

export function setApiKey(key) {
  runtimeApiKey = key;
}

export function getApiKey() {
  return runtimeApiKey || process.env.ANTHROPIC_API_KEY;
}

function getClient() {
  const apiKey = getApiKey();
  safeLog('[Claude] Creating client, has API key:', !!apiKey);
  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Please add your API key in Settings (Cmd+,)');
  }
  return new Anthropic({
    apiKey: apiKey,
  });
}

const SYSTEM_PROMPT = `You are an expert coding interview assistant.

##############################################################################
# RULE #1: INTERVIEW-READY CODE - MINIMAL, CLEAN, WORKING
##############################################################################
Your code must be what a candidate would write in a real coding interview:
- MINIMAL: Only the code needed to solve the problem. No extra functions, no unnecessary variables.
- CLEAN: No comments, no debug prints, no explanatory output - just the solution.
- WORKING: Must run and produce EXACTLY the expected output format.

BAD (too verbose):
  # This function calculates...
  def solve(n):
      print(f"Processing input: {n}")
      result = n * 2
      print(f"The answer is: {result}")
      return result

GOOD (interview-ready):
  def solve(n):
      return n * 2
  print(solve(5))

##############################################################################
# RULE #2: OUTPUT MUST MATCH EXACTLY
##############################################################################
- Study the expected output format in examples CAREFULLY
- Your output must match EXACTLY: same format, same spacing, same case
- If expected is "5", output "5" not "Answer: 5" or "Result = 5"
- If expected is "YES", output "YES" not "Yes" or "yes" or "True"
- NO extra text, NO labels, NO formatting - just the raw answer

##############################################################################
# RULE #3: ALWAYS PRINT THE RESULT
##############################################################################
- Python: end with print()
- JavaScript: end with console.log()
- Bash: end with echo
- Code without output = broken code

##############################################################################

CODE STYLE REQUIREMENTS:
1. NO comments in code
2. NO debug/verbose print statements
3. NO unnecessary variables or functions
4. Read input → Process → Print output (that's it)
5. Handle edge cases silently (no error messages unless required)
6. Match the EXACT output format from examples

Supported languages: Python, Bash, Terraform, Jenkins, YAML, SQL, JavaScript

IMPORTANT: Respond with valid JSON in exactly this format:
{
  "language": "python|bash|terraform|jenkins|yaml|sql|javascript",
  "code": "the complete code as a string with \\n for newlines - MUST include print statements",
  "pitch": "A 1-2 minute verbal explanation of your thought process and solution approach.",
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
  },
  "systemDesign": {
    "included": false
  }
}

SYSTEM DESIGN - INCLUDE FULL SYSTEM DESIGN when the problem involves ANY of these:
- Designing a system (URL shortener, chat app, rate limiter, cache, Twitter, Instagram, etc.)
- Keywords: "design", "architect", "scale", "distributed", "high availability", "microservices"
- Infrastructure: databases, caching, load balancing, message queues, APIs at scale
- System architecture questions in interviews

ALWAYS include systemDesign for these types of problems:
{
  "systemDesign": {
    "included": true,
    "overview": "Brief problem overview and scale considerations",
    "requirements": {
      "functional": ["List of functional requirements"],
      "nonFunctional": ["List of non-functional requirements like latency, availability, scalability"]
    },
    "apiDesign": [
      {"method": "POST", "endpoint": "/api/shorten", "description": "Create short URL", "request": "{ url: string }", "response": "{ shortUrl: string }"}
    ],
    "dataModel": [
      {"table": "urls", "fields": [{"name": "id", "type": "string", "description": "Short code"}, {"name": "original_url", "type": "string", "description": "Original URL"}]}
    ],
    "architecture": {
      "components": ["Load Balancer", "Web Servers", "Redis Cache", "PostgreSQL Database"],
      "description": "How components interact and data flows"
    },
    "diagram": "flowchart LR\n  A[Client] --> B[Load Balancer]\n  B --> C[Web Servers]\n  C --> D[(Redis Cache)]\n  C --> E[(PostgreSQL)]",
    "scalability": ["Horizontal scaling of web servers", "Database read replicas", "Cache for hot URLs", "Database sharding by URL hash"]
  }
}

ONLY for pure coding problems (algorithms, data structures, leetcode-style problems), use: "systemDesign": {"included": false}

Rules:
- Do NOT add any comments in the code
- Match the EXACT output format from examples
- The pitch should be conversational, suitable for verbal delivery in an interview
- CRITICAL: Always generate COMPLETE, RUNNABLE code that includes:
  - All necessary imports
  - Input reading code (using input() for Python, stdin for others) OR hardcoded test data
  - Main execution logic
  - MUST MUST MUST include print()/console.log()/echo to OUTPUT THE RESULT
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

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function solveProblem(problemText, language = 'auto', fast = true, model = DEFAULT_MODEL) {
  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  const response = await getClient().messages.create({
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

export async function extractText(base64Image, mimeType, model = DEFAULT_MODEL) {
  const response = await getClient().messages.create({
    model,
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

export async function fixCode(code, error, language, problem = '', model = DEFAULT_MODEL) {
  const problemContext = problem
    ? `\nORIGINAL PROBLEM:\n${problem}\n`
    : '';

  const response = await getClient().messages.create({
    model,
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

const BRIEF_PROMPT = `You are an expert coding interview assistant. Return ONLY the code solution.

RULES:
1. Output ONLY valid JSON: {"language": "python", "code": "the code"}
2. Code must be minimal and interview-ready
3. NO comments, NO explanations, NO pitch
4. Code MUST print the output
5. Match expected output format exactly`;

export async function* solveProblemStream(problemText, language = 'auto', detailLevel = 'detailed', model = DEFAULT_MODEL) {
  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  const isBrief = detailLevel === 'brief' || detailLevel === 'high-level';
  const systemPrompt = isBrief ? BRIEF_PROMPT : SYSTEM_PROMPT;

  const stream = await getClient().messages.stream({
    model,
    max_tokens: isBrief ? 1024 : 4096,
    messages: [
      {
        role: 'user',
        content: `${languageInstruction}\n\nSolve this problem and return the response as JSON:\n\n${problemText}`,
      },
    ],
    system: systemPrompt,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.text) {
      yield event.delta.text;
    }
  }
}

export async function analyzeImage(base64Image, mimeType, model = DEFAULT_MODEL) {
  const response = await getClient().messages.create({
    model,
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
