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

// CODING ONLY - No system design, pure code generation
const CODING_PROMPT = `You are a practical, senior software engineer in a coding interview.

WRITE SIMPLE, PRACTICAL CODE:
- 25-45 lines maximum
- MINIMAL imports - only what you actually use
- NO fancy features (no dataclass, no typing, no decorators)
- NO comments, NO docstrings
- Simple classes/functions - no over-engineering
- If problem asks for a class, use a basic class with __init__
- Use standard library only

AVOID:
- dataclasses, typing, annotations
- Abstract classes, decorators
- Unnecessary error handling
- Verbose patterns

Respond with JSON:
{
  "language": "python|javascript|bash|etc",
  "code": "simple practical code",
  "pitch": "Brief explanation",
  "examples": [{"input": "...", "expected": "..."}],
  "explanations": [{"line": 1, "code": "...", "explanation": "..."}],
  "complexity": {"time": "O(?)", "space": "O(?)"}
}`;

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
    system: CODING_PROMPT,
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

// System Design Basic Prompt - Single region, minimal architecture
const SYSTEM_DESIGN_BASIC_PROMPT = `You are an expert system design interview assistant.

For this BASIC system design interview:
- Design a SINGLE-REGION, minimal architecture
- Focus on CORE functionality only - get the basics right
- Use SIMPLE database setup (single instance, no replication)
- Basic caching layer (single Redis instance)
- Straightforward API design with essential endpoints only
- NO redundancy complexity - keep it simple
- Skip advanced features like multi-region, sharding, etc.

IMPORTANT: Do NOT generate code. Focus entirely on system design.

DIAGRAM STYLE - Create a CLEAN, WHITEBOARD-STYLE diagram:
- Keep it SIMPLE - only 5-10 boxes maximum
- Use SIMPLE node IDs (single words, no spaces or special chars): User, API, DB, Cache
- Use clear labels in brackets: User[Client], API[API Server], DB[(Database)]
- Show data flow with simple arrows: -->
- NO subgraphs for basic diagrams
- NO special characters in node IDs or labels

DIAGRAM SYNTAX RULES (CRITICAL - must follow exactly):
- Start with: flowchart LR (or TB for vertical)
- Node format: NodeID[Label] or NodeID[(Database Label)] or NodeID((Circle))
- Arrow format: NodeA --> NodeB
- Each connection on its own line
- NO semicolons, NO quotes around labels
- Keep labels short (1-3 words max)

Respond with valid JSON in exactly this format:
{
  "language": "text",
  "code": "",
  "pitch": "A 2-3 minute verbal explanation of your basic system design approach.",
  "examples": [],
  "explanations": [],
  "complexity": {"time": "N/A", "space": "N/A"},
  "systemDesign": {
    "included": true,
    "overview": "Brief problem overview focusing on core requirements",
    "requirements": {
      "functional": ["Core functional requirements only"],
      "nonFunctional": ["Basic performance requirements"]
    },
    "apiDesign": [
      {"method": "POST", "endpoint": "/api/endpoint", "description": "Description", "request": "{}", "response": "{}"}
    ],
    "dataModel": [
      {"table": "tablename", "fields": [{"name": "field", "type": "type", "description": "desc"}]}
    ],
    "architecture": {
      "components": ["Load Balancer", "Web Server", "Database", "Cache"],
      "description": "Simple architecture flow description"
    },
    "diagram": "flowchart LR\\n  User[Client] --> LB[Load Balancer]\\n  LB --> API[API Server]\\n  API --> Cache[(Redis)]\\n  API --> DB[(Database)]",
    "scalability": ["Basic horizontal scaling strategies"]
  }
}`;

// System Design Full Prompt - Multi-region, highly available
const SYSTEM_DESIGN_FULL_PROMPT = `You are an expert system design interview assistant.

For this FULL/DETAILED system design interview:
- Design a MULTI-REGION, highly available architecture
- Include database REPLICATION and SHARDING strategies
- Add CDN, edge caching, global load balancing
- Include FAILURE HANDLING, circuit breakers, retry logic
- Add RATE LIMITING, monitoring, observability
- Provide DETAILED scalability analysis with numbers
- Consider data consistency models (eventual vs strong)
- Include message queues for async processing
- Add backup and disaster recovery strategies

IMPORTANT: Do NOT generate code. Focus entirely on system design.

DIAGRAM STYLE - Create a CLEAN, WHITEBOARD-STYLE diagram:
- Keep it READABLE - maximum 15-20 boxes
- Use SIMPLE node IDs (single words): User, CDN, LB, API, Cache, DB, Queue
- Use clear labels in brackets: CDN[Content Delivery], DB[(Primary Database)]
- Show data flow with arrows: --> for sync, -.-> for async
- Use subgraphs sparingly: subgraph Storage followed by nodes, then end

DIAGRAM SYNTAX RULES (CRITICAL - must follow exactly):
- Start with: flowchart TB (top to bottom) or flowchart LR (left to right)
- Node format: NodeID[Label] or NodeID[(Database)] or NodeID((Circle))
- Arrow format: A --> B or A -.-> B for dashed
- Subgraph format: subgraph Name on its own line, nodes indented, end on its own line
- Each connection on its own line
- NO semicolons, NO quotes, NO special characters in IDs
- Keep labels short (1-3 words)

Respond with valid JSON in exactly this format:
{
  "language": "text",
  "code": "",
  "pitch": "A 5-7 minute comprehensive verbal explanation of your full system design.",
  "examples": [],
  "explanations": [],
  "complexity": {"time": "N/A", "space": "N/A"},
  "systemDesign": {
    "included": true,
    "overview": "Comprehensive problem overview with scale considerations (QPS, storage, bandwidth)",
    "requirements": {
      "functional": ["Detailed functional requirements"],
      "nonFunctional": ["Latency targets", "Availability (99.9%+)", "Scalability goals", "Data consistency requirements"]
    },
    "apiDesign": [
      {"method": "POST", "endpoint": "/api/endpoint", "description": "Full description with rate limits", "request": "{detailed request}", "response": "{detailed response}"}
    ],
    "dataModel": [
      {"table": "tablename", "fields": [{"name": "field", "type": "type", "description": "desc with indexing strategy"}]}
    ],
    "architecture": {
      "components": ["CDN", "Load Balancer", "API Gateway", "App Servers", "Cache", "Database", "Message Queue"],
      "description": "Detailed architecture with clear data flow"
    },
    "diagram": "flowchart TB\\n  User[Client] --> CDN[CDN]\\n  CDN --> LB[Load Balancer]\\n  LB --> API[API Gateway]\\n  API --> App[App Servers]\\n  App --> Cache[(Redis)]\\n  App --> DB[(Primary DB)]\\n  App --> Queue[Kafka]\\n  Queue --> Workers[Workers]\\n  DB -.-> Replica[(Read Replica)]",
    "scalability": ["Horizontal scaling with auto-scaling groups", "Database sharding by user_id/hash", "Cache cluster with consistent hashing", "CDN for static content", "Async processing via message queues", "Read replicas for read-heavy workloads"]
  }
}`;

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

export async function* solveProblemStream(problemText, language = 'auto', detailLevel = 'detailed', model = DEFAULT_MODEL, interviewMode = 'coding', designDetailLevel = 'basic') {
  // DEBUG: Log all parameters
  console.log('[Claude solveProblemStream] PARAMS:', {
    interviewMode,
    designDetailLevel,
    language,
    detailLevel,
    model,
    problemTextLength: problemText?.length
  });

  const languageInstruction = language === 'auto'
    ? 'Detect the appropriate language from the problem context.'
    : `Write the solution in ${language.toUpperCase()}.`;

  const isBrief = detailLevel === 'brief' || detailLevel === 'high-level';

  // Select appropriate prompt based on interview mode
  let systemPrompt;
  let userMessage;

  console.log('[Claude] Checking interviewMode:', interviewMode, '=== "system-design":', interviewMode === 'system-design');

  if (interviewMode === 'system-design') {
    // DESIGN MODE - System design only, no code
    console.log('[Claude] DESIGN MODE SELECTED - using system design prompt');
    systemPrompt = designDetailLevel === 'full' ? SYSTEM_DESIGN_FULL_PROMPT : SYSTEM_DESIGN_BASIC_PROMPT;
    userMessage = `Design the following system and return the response as JSON:\n\n${problemText}`;
    console.log('[Claude] Using prompt:', designDetailLevel === 'full' ? 'FULL' : 'BASIC');
  } else {
    // CODING MODE - Code only, no system design
    console.log('[Claude] CODING MODE SELECTED - using coding prompt');
    systemPrompt = isBrief ? BRIEF_PROMPT : CODING_PROMPT;
    userMessage = `${languageInstruction}\n\nSolve this coding problem and return the response as JSON:\n\n${problemText}`;
  }

  const stream = await getClient().messages.stream({
    model,
    max_tokens: interviewMode === 'system-design' ? 8192 : (isBrief ? 1024 : 4096),
    messages: [
      {
        role: 'user',
        content: userMessage,
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

// Follow-up question prompt for system design interviews
const FOLLOW_UP_PROMPT = `You are an expert system design interviewer assistant. The candidate has presented a system design, and the interviewer is asking a follow-up question.

Your job is to:
1. ANSWER the interviewer's question DIRECTLY and SPECIFICALLY - match your answer exactly to what was asked
2. UPDATE the system design to incorporate any changes implied by the question/answer
3. Be CONCISE but THOROUGH - answer like a senior engineer in an interview

IMPORTANT GUIDELINES:
- Answer the EXACT question asked - don't go off-topic
- If asked about failure handling, focus on failure scenarios
- If asked about scaling, focus on scaling strategies
- If asked about a specific component, deep-dive on that component
- If asked "how would you...", give a specific approach, not generic advice
- Update ONLY the relevant parts of the system design
- Keep the answer conversational - suitable for verbal delivery

Respond with valid JSON:
{
  "answer": "Your direct, specific answer to the interviewer's question. This should be 2-4 paragraphs, conversational, and exactly match what was asked. Include specific technical details.",
  "updatedDesign": {
    // The COMPLETE updated system design object with any modifications
    // Include ALL fields from the original design, updating only what changed
    "included": true,
    "overview": "...",
    "requirements": {...},
    "apiDesign": [...],
    "dataModel": [...],
    "architecture": {...},
    "diagram": "...",
    "scalability": [...]
  },
  "changesApplied": ["List of specific changes made to the design based on this question"]
}`;

export async function* answerFollowUpQuestion(question, context, model = DEFAULT_MODEL) {
  // Build context string based on what's available
  let contextStr = '';

  if (context.problem) {
    contextStr += `PROBLEM:\n${context.problem}\n\n`;
  }
  if (context.pitch) {
    contextStr += `APPROACH:\n${context.pitch}\n\n`;
  }
  if (context.code) {
    contextStr += `CODE SOLUTION:\n${context.code}\n\n`;
  }
  if (context.systemDesign) {
    contextStr += `SYSTEM DESIGN:\n${JSON.stringify(context.systemDesign, null, 2)}\n\n`;
  }

  // Use Haiku for faster responses (Q&A doesn't need the smartest model)
  const fastModel = 'claude-3-haiku-20240307';

  const stream = await getClient().messages.stream({
    model: fastModel,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${contextStr}INTERVIEWER'S QUESTION: "${question}"

Answer this interview follow-up question directly and concisely. Explain your reasoning clearly as if speaking to an interviewer.`,
      },
    ],
    system: `You are helping a candidate answer follow-up questions during a technical interview.
Give clear, concise answers that demonstrate understanding.
Speak naturally as if explaining to an interviewer.
Keep answers focused - typically 2-4 sentences unless more detail is needed.
Do NOT use markdown formatting or code blocks - just plain text.`,
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
    system: CODING_PROMPT,
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
