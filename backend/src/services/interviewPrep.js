import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getApiKey as getClaudeApiKey } from './claude.js';
import { getApiKey as getOpenAIApiKey } from './openai.js';

function getClaudeClient() {
  const apiKey = getClaudeApiKey();
  console.log('[InterviewPrep] Getting Claude API key:', !!apiKey);
  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Please add your API key in Settings.');
  }
  return new Anthropic({ apiKey });
}

function getOpenAIClient() {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
  }
  return new OpenAI({ apiKey });
}

const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_OPENAI_MODEL = 'gpt-4o';
const MAX_TOKENS_PER_SECTION = 1500; // Reduced for faster response

// Section-specific prompts
const SECTION_PROMPTS = {
  pitch: `Generate a compelling 2-3 minute elevator pitch for this candidate based on their resume and the job description.

The pitch MUST be structured as 5 SEPARATE paragraphs:
1. Opening Hook - A memorable introduction that grabs attention
2. Key Achievement #1 - Your most impressive relevant accomplishment
3. Key Achievement #2 - Another strong example demonstrating your skills
4. Why This Company - Show genuine enthusiasm and company research
5. Closing - Clear value statement and call to action

CRITICAL: Return the pitch as an ARRAY of strings called "pitchParagraphs", NOT as a single "pitch" string.

Return JSON:
{
  "pitchParagraphs": [
    "Paragraph 1: Opening hook...",
    "Paragraph 2: First key achievement...",
    "Paragraph 3: Second key achievement...",
    "Paragraph 4: Why I'm excited about this company...",
    "Paragraph 5: Closing value statement..."
  ],
  "talkingPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "tips": "Delivery tips",
  "abbreviations": [{"abbr": "ABBR", "full": "Full term"}]
}

IMPORTANT:
- DO NOT use "pitch" key - use "pitchParagraphs" array
- Each paragraph must be a separate string in the array
- Include abbreviations for all technical terms`,

  hr: `Generate HR screening interview preparation based on the job description and candidate's background.

Cover these common HR questions:
- Salary expectations and negotiation points
- Availability and start date
- Why this company/role
- Career goals alignment
- Work style and culture fit

Return JSON:
{
  "summary": "Brief overview of how to approach HR screening",
  "questions": [
    {
      "question": "What are your salary expectations?",
      "suggestedAnswer": "A thoughtful answer based on the role level",
      "tips": "Negotiation tips"
    }
  ],
  "abbreviations": [{"abbr": "PTO", "full": "Paid Time Off"}]
}

IMPORTANT: Include an "abbreviations" array with ALL technical terms, acronyms, and abbreviations used in your response.`,

  'hiring-manager': `Generate hiring manager interview preparation tailored to this specific role.

Focus on:
- Role-specific technical expectations
- Team dynamics and collaboration style
- Growth and development opportunities
- Project/team vision alignment
- Leadership style preferences

Return JSON:
{
  "summary": "Key themes for the hiring manager conversation",
  "questions": [
    {
      "question": "Likely question from hiring manager",
      "suggestedAnswer": "Tailored answer based on resume and JD",
      "tips": "What they're really looking for"
    }
  ],
  "questionsToAsk": ["Smart questions to ask the hiring manager"],
  "abbreviations": [{"abbr": "KPI", "full": "Key Performance Indicator"}]
}

IMPORTANT: Include an "abbreviations" array with ALL technical terms, acronyms, and abbreviations used in your response.`,

  coding: `Generate coding interview preparation based on the job requirements.

Analyze the tech stack and role level to identify:
- Most likely algorithm topics
- Data structure focus areas
- System design elements for coding rounds
- Language-specific considerations

Return JSON:
{
  "summary": "Overview of what to expect in coding interviews",
  "keyTopics": ["Topic 1 to focus on", "Topic 2"],
  "questions": [
    {
      "question": "Sample coding question type",
      "approach": "How to approach this type of problem",
      "tips": "What interviewers look for"
    }
  ],
  "practiceRecommendations": ["Specific areas to practice"],
  "abbreviations": [{"abbr": "DSA", "full": "Data Structures and Algorithms"}]
}

IMPORTANT: Include an "abbreviations" array with ALL technical terms, acronyms, and abbreviations used in your response.`,

  'system-design': `Generate system design interview preparation based on the role requirements.

Consider the role level and company type to cover:
- Relevant system design topics
- Scale expectations
- Technology choices relevant to their stack
- Trade-off discussions

Return JSON:
{
  "summary": "System design interview expectations for this role",
  "keyTopics": ["Relevant design topic 1", "Topic 2"],
  "questions": [
    {
      "question": "Likely system design question",
      "approach": "Structured approach to answer",
      "keyConsiderations": ["Scale", "Availability", "etc"]
    }
  ],
  "frameworkTips": "How to structure system design answers",
  "abbreviations": [{"abbr": "CAP", "full": "Consistency, Availability, Partition tolerance"}]
}

IMPORTANT: Include an "abbreviations" array with ALL technical terms, acronyms, and abbreviations used in your response.`,

  behavioral: `Generate behavioral interview preparation using the STAR method.

Based on the resume, identify experiences that demonstrate:
- Leadership and initiative
- Problem-solving and challenges overcome
- Teamwork and collaboration
- Conflict resolution
- Growth mindset and learning

Return JSON:
{
  "summary": "Behavioral interview strategy",
  "questions": [
    {
      "question": "Tell me about a time when...",
      "suggestedAnswer": "STAR-formatted answer using their actual experience",
      "situation": "Brief situation",
      "task": "The task/challenge",
      "action": "Actions taken",
      "result": "Quantified results"
    }
  ],
  "keyThemes": ["Themes from their experience to emphasize"],
  "abbreviations": [{"abbr": "STAR", "full": "Situation, Task, Action, Result"}]
}

IMPORTANT: Include an "abbreviations" array with ALL technical terms, acronyms, and abbreviations used in your response.`,

  techstack: `Generate technology-specific interview preparation based on the job requirements.

Analyze the tech stack mentioned in the JD and prepare:
- Deep-dive questions on primary technologies
- Architecture and best practices
- Common pitfalls and how to avoid them
- Recent developments in these technologies

Return JSON:
{
  "summary": "Tech stack analysis and preparation focus",
  "technologies": [
    {
      "name": "Technology name",
      "importance": "high/medium/low for this role",
      "questions": [
        {
          "question": "Technical question",
          "answer": "Expected answer with depth",
          "followUps": ["Potential follow-up questions"]
        }
      ]
    }
  ],
  "architectureTopics": ["Relevant architecture patterns to know"],
  "abbreviations": [{"abbr": "API", "full": "Application Programming Interface"}]
}

IMPORTANT: Include an "abbreviations" array with ALL technical terms, acronyms, and abbreviations used in your response.`
};

// Clean up text content - remove extra whitespace and empty lines
function cleanupText(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/[ \t]+/g, ' ')           // Multiple spaces to single
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // 3+ newlines to 2
    .replace(/^\s+$/gm, '')            // Remove whitespace-only lines
    .replace(/\n{3,}/g, '\n\n')        // Max 2 consecutive newlines
    .trim();
}

// Recursively clean all string values in an object
function cleanupResult(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') return cleanupText(item);
      if (typeof item === 'object') return cleanupResult(item);
      return item;
    }).filter(item => item !== ''); // Remove empty strings
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const cleanedValue = cleanupText(value);
      if (cleanedValue) cleaned[key] = cleanedValue;
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = cleanupResult(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Build the context from inputs
function buildContext(inputs) {
  let context = '';

  if (inputs.jobDescription) {
    context += `## JOB DESCRIPTION\n${inputs.jobDescription}\n\n`;
  }

  if (inputs.resume) {
    context += `## CANDIDATE RESUME\n${inputs.resume}\n\n`;
  }

  if (inputs.coverLetter) {
    context += `## COVER LETTER\n${inputs.coverLetter}\n\n`;
  }

  if (inputs.prepMaterials) {
    context += `## ADDITIONAL PREP MATERIALS\n${inputs.prepMaterials}\n\n`;
  }

  return context;
}

// Generate a single section using Claude
export async function* generateSectionClaude(section, inputs, model = DEFAULT_CLAUDE_MODEL) {
  const context = buildContext(inputs);
  const sectionPrompt = SECTION_PROMPTS[section];

  if (!sectionPrompt) {
    throw new Error(`Unknown section: ${section}`);
  }

  const systemPrompt = `You are a concise interview coach. Give specific, actionable advice based on the resume and job description. Be direct and practical. Keep responses focused - quality over quantity.`;

  const userMessage = `${context}\n\n${sectionPrompt}\n\nIMPORTANT: Be concise. Focus on the 3-5 most important points only.`;

  const stream = await getClaudeClient().messages.stream({
    model,
    max_tokens: MAX_TOKENS_PER_SECTION,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  let fullText = '';

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.text) {
      fullText += event.delta.text;
      yield { chunk: event.delta.text };
    }
  }

  // Parse final result
  try {
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      fullText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : fullText;
    const result = JSON.parse(jsonStr);
    // Clean up all text content in the result
    yield { done: true, result: cleanupResult(result) };
  } catch (err) {
    // Return raw text if JSON parsing fails
    yield { done: true, result: { rawContent: cleanupText(fullText) } };
  }
}

// Generate a single section using OpenAI
export async function* generateSectionOpenAI(section, inputs, model = DEFAULT_OPENAI_MODEL) {
  const context = buildContext(inputs);
  const sectionPrompt = SECTION_PROMPTS[section];

  if (!sectionPrompt) {
    throw new Error(`Unknown section: ${section}`);
  }

  const systemPrompt = `You are a concise interview coach. Give specific, actionable advice based on the resume and job description. Be direct and practical. Return valid JSON.`;

  const userMessage = `${context}\n\n${sectionPrompt}\n\nIMPORTANT: Be concise. Focus on the 3-5 most important points only.`;

  const stream = await getOpenAIClient().chat.completions.create({
    model,
    max_tokens: MAX_TOKENS_PER_SECTION,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
  });

  let fullText = '';

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) {
      fullText += text;
      yield { chunk: text };
    }
  }

  // Parse final result
  try {
    const result = JSON.parse(fullText);
    // Clean up all text content in the result
    yield { done: true, result: cleanupResult(result) };
  } catch (err) {
    // Return raw text if JSON parsing fails
    yield { done: true, result: { rawContent: cleanupText(fullText) } };
  }
}

// Main generator function that handles provider selection
export async function* generateSection(section, inputs, provider = 'claude', model) {
  if (provider === 'openai') {
    yield* generateSectionOpenAI(section, inputs, model || DEFAULT_OPENAI_MODEL);
  } else {
    yield* generateSectionClaude(section, inputs, model || DEFAULT_CLAUDE_MODEL);
  }
}

// Generate all sections sequentially
export async function* generateAllSections(inputs, sections, provider = 'claude', model) {
  for (const section of sections) {
    yield { section, status: 'started' };

    try {
      for await (const event of generateSection(section, inputs, provider, model)) {
        if (event.chunk) {
          yield { section, chunk: event.chunk };
        }
        if (event.done) {
          yield { section, status: 'completed', result: event.result };
        }
      }
    } catch (err) {
      yield { section, status: 'error', error: err.message };
    }
  }

  yield { done: true };
}
