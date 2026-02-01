import * as cheerio from 'cheerio';
import { getPlatformCookies } from '../routes/auth.js';

// Platform-specific selectors for extracting problem content
const PLATFORM_SELECTORS = {
  leetcode: [
    '[data-track-load="description_content"]',
    '.content__u3I1',
    '[class*="question-content"]',
    '[class*="elfjS"]', // LeetCode's newer class pattern
    '.question-content__JfgR',
    '[data-key="description-content"]',
  ],
  hackerrank: [
    '.challenge-body-html',
    '.problem-statement',
    '.challenge_problem_statement',
    '.challenge-text',
    '.hr-challenge-description',
  ],
  glider: [
    '.question-description',
    '.problem-description',
    '.coding-question',
    '.question-content',
    '.problem-content',
    '[class*="question-desc"]',
    '[class*="problem-desc"]',
    '.ql-editor', // Glider uses Quill editor
    '.question-body',
  ],
  lark: [
    '.coding-problem',
    '.problem-description',
    '.question-content',
    '[class*="problem-content"]',
    '[class*="question-body"]',
    '.code-problem-desc',
    '.problem-statement',
  ],
  codesignal: [
    '.task-description',
    '.markdown-body',
    '[class*="task-content"]',
  ],
  coderpad: [
    '.question-prompt',
    '.question-description',
    '.problem-statement',
    '.instructions',
    '[class*="question-content"]',
    '[class*="problem-description"]',
    '.markdown-body',
    '.challenge-description',
    '[data-testid="question-prompt"]',
    '.ql-editor',  // CoderPad may use Quill editor
  ],
  codility: [
    '.task-description',
    '[class*="task-description"]',
    '.brinza-task-description',
  ],
  generic: [
    'article',
    'main',
    '.problem',
    '.description',
    '.content',
    '.question',
    '[role="main"]',
  ],
};

/**
 * Detect platform from URL
 */
function detectPlatform(url) {
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes('leetcode')) return 'leetcode';
  if (hostname.includes('hackerrank')) return 'hackerrank';
  if (hostname.includes('glider')) return 'glider';
  if (hostname.includes('lark') || hostname.includes('larksuite')) return 'lark';
  if (hostname.includes('codesignal')) return 'codesignal';
  if (hostname.includes('coderpad')) return 'coderpad';
  if (hostname.includes('codility')) return 'codility';

  return 'generic';
}

/**
 * Extract content using platform-specific selectors
 */
function extractContent($, platform) {
  const selectors = [
    ...(PLATFORM_SELECTORS[platform] || []),
    ...PLATFORM_SELECTORS.generic,
  ];

  for (const selector of selectors) {
    const content = $(selector).first().text();
    if (content && content.trim().length > 50) {
      return content;
    }
  }

  return null;
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text) {
  return text
    .replace(/\t/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ ]+/g, ' ')
    .replace(/\n[ ]+/g, '\n')
    .replace(/[ ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract examples/test cases from the page
 */
function extractExamples($) {
  const examples = [];

  // Common example patterns
  const exampleSelectors = [
    '.example',
    '[class*="example"]',
    'pre',
    '.sample-input',
    '.sample-output',
    '[class*="testcase"]',
  ];

  for (const selector of exampleSelectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5 && text.length < 500) {
        examples.push(text);
      }
    });

    if (examples.length >= 3) break;
  }

  return examples.slice(0, 3);
}

export async function fetchProblemFromUrl(url) {
  try {
    const platform = detectPlatform(url);

    // Build headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    // Add auth cookies if available for this platform
    const cookies = getPlatformCookies(platform);
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        const authMsg = cookies
          ? 'Session may have expired. Try syncing again from the extension.'
          : 'Authentication required. Install the Capra extension and login to the platform.';
        throw new Error(authMsg);
      }
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove non-content elements
    $('script, style, nav, header, footer, aside, .ads, [class*="sidebar"], [class*="comment"]').remove();

    // Try platform-specific extraction first
    let problemText = extractContent($, platform);

    // Fallback to body text if extraction failed
    if (!problemText || problemText.length < 100) {
      problemText = $('body').text();
    }

    // Clean up the text
    problemText = cleanText(problemText);

    // Extract examples if available
    const examples = extractExamples($);

    if (!problemText || problemText.length < 20) {
      // Platform-specific error messages
      const platformMessages = {
        coderpad: 'CoderPad interviews are private sessions. Use screenshot or copy-paste the problem text instead.',
        glider: 'Glider requires login. Use screenshot or copy-paste instead.',
        lark: 'Lark requires login. Use screenshot or copy-paste instead.',
      };
      const hint = platformMessages[platform] || 'Try using screenshot or copy-paste instead.';
      throw new Error(`Could not extract problem from ${platform}. ${hint}`);
    }

    // Limit size
    problemText = problemText.substring(0, 8000);

    return {
      success: true,
      problemText,
      sourceUrl: url,
      platform,
      authenticated: !!cookies,
      examples: examples.length > 0 ? examples : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      sourceUrl: url,
    };
  }
}
