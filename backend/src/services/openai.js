import OpenAI from 'openai';

// Support for runtime API keys (used by Electron app)
let runtimeApiKey = null;

export function setApiKey(key) {
  runtimeApiKey = key;
}

export function getApiKey() {
  return runtimeApiKey || process.env.OPENAI_API_KEY;
}

function getClient() {
  return new OpenAI({
    apiKey: getApiKey(),
  });
}

const SYSTEM_PROMPT = `You are an expert coding interview assistant.

##############################################################################
# RULE #1: MINIMAL CODE - AS FEW LINES AS POSSIBLE
##############################################################################
Your code must be EXTREMELY CONCISE:
- TARGET: 10-30 lines for most problems, 40 lines MAX for complex problems
- Use one-liners, list comprehensions, lambda functions
- Combine operations: input + process + output in minimal statements
- NO helper functions unless absolutely required for recursion/DP
- NO classes unless explicitly required
- NO unnecessary imports - prefer built-ins
- NO intermediate variables if you can inline
- NO comments, NO debug prints

BAD (45 lines - way too long):
  def read_input():
      return list(map(int, input().split()))
  def process(arr):
      result = []
      for x in arr:
          result.append(x * 2)
      return result
  def main():
      arr = read_input()
      output = process(arr)
      print(' '.join(map(str, output)))
  main()

GOOD (1-3 lines):
  print(' '.join(str(x*2) for x in map(int, input().split())))

##############################################################################
# RULE #2: OUTPUT MUST MATCH EXACTLY
##############################################################################
- Study the expected output format in examples CAREFULLY
- Your output must match EXACTLY: same format, same spacing, same case
- If expected is "5", output "5" not "Answer: 5" or "Result = 5"
- If expected is "YES", output "YES" not "Yes" or "yes" or "True"
- NO extra text, NO labels, NO formatting - just the raw answer

##############################################################################
# RULE #2.5: NEVER FAKE OR HALLUCINATE DATA
##############################################################################
- NEVER hardcode expected outputs just to pass test cases
- NEVER use fake, hallucinated, or made-up data to produce correct-looking output
- NEVER guess what API responses or external data should look like
- If the problem requires real external data (APIs, databases), write genuine code that works
- Your solution must be GENUINELY CORRECT through proper logic, not by cheating
- If you cannot solve it correctly, say so - do not fake the output

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

Supported languages: Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, SQL, Bash, Terraform, Jenkins, YAML

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

const DEFAULT_MODEL = 'gpt-4o';

export async function solveProblem(problemText, language = 'auto', fast = true, model = DEFAULT_MODEL) {
  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  const response = await getClient().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `${languageInstruction}\n\nSolve this problem and return the response as JSON:\n\n${problemText}`,
      },
    ],
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (error) {
    return {
      code: content,
      explanations: [{ line: 1, code: content, explanation: 'Raw response from AI' }],
      complexity: { time: 'Unknown', space: 'Unknown' },
    };
  }
}

const BRIEF_PROMPT = `You are an expert coding interview assistant. Return ONLY the code solution.

##############################################################################
# STRICT CODE LENGTH: TARGET 5-20 LINES MAXIMUM
##############################################################################
- AIM FOR 5-15 LINES of actual code (excluding blank lines)
- NEVER exceed 20 lines unless absolutely impossible to solve otherwise
- Use one-liners, list comprehensions, built-in functions
- Combine operations: read input + process + print in minimal statements
- NO helper functions - solve directly
- NO classes unless the problem explicitly requires OOP
- NO imports unless absolutely necessary (prefer built-ins)

EXAMPLE - BAD (too long):
def solve(arr):
    result = []
    for item in arr:
        if item > 0:
            result.append(item * 2)
    return result
arr = list(map(int, input().split()))
output = solve(arr)
print(' '.join(map(str, output)))

EXAMPLE - GOOD (minimal):
print(' '.join(str(x*2) for x in map(int, input().split()) if x > 0))

OUTPUT FORMAT:
- Output ONLY valid JSON: {"language": "python", "code": "the code"}
- NO comments, NO explanations, NO pitch
- Output MUST match expected format EXACTLY

INTEGRITY:
- NEVER hardcode outputs or fake data
- Solution must be genuinely correct`;

export async function* solveProblemStream(problemText, language = 'auto', detailLevel = 'detailed', model = DEFAULT_MODEL) {
  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  const isBrief = detailLevel === 'brief' || detailLevel === 'high-level';
  const systemPrompt = isBrief ? BRIEF_PROMPT : SYSTEM_PROMPT;

  const stream = await getClient().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `${languageInstruction}\n\nSolve this problem and return the response as JSON:\n\n${problemText}`,
      },
    ],
    max_tokens: isBrief ? 1024 : 4096,
    response_format: { type: 'json_object' },
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export async function extractText(base64Image, mimeType, model = DEFAULT_MODEL) {
  const response = await getClient().chat.completions.create({
    model,
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
            text: `Extract the coding problem from this image and format it clearly.

Format the output as follows:
- Start with the problem title/description
- Use "Input:" and "Output:" headings for I/O format
- Use "Example:" or "Examples:" for test cases
- Use "Constraints:" for any constraints
- Use bullet points (•) for lists
- Remove any extra blank lines
- Keep it concise and readable

Return ONLY the formatted problem text, nothing else.`,
          },
        ],
      },
    ],
    max_completion_tokens: 4096,
  });

  return { text: response.choices[0].message.content };
}

export async function fixCode(code, error, language, problem = '', model = DEFAULT_MODEL) {
  const problemContext = problem
    ? `\nORIGINAL PROBLEM:\n${problem}\n`
    : '';

  const response = await getClient().chat.completions.create({
    model,
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
    max_completion_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch {
    const codeMatch = content.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    const fixedCode = codeMatch ? codeMatch[1] : content;
    return { code: fixedCode.trim(), explanations: [] };
  }
}

export async function analyzeImage(base64Image, mimeType, model = DEFAULT_MODEL) {
  const response = await getClient().chat.completions.create({
    model,
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
    max_completion_tokens: 4096,
  });

  const content = response.choices[0].message.content;

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
