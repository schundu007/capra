/**
 * Web Scraper Service
 * Handles fetching and extracting problem content from URLs
 */

import * as cheerio from 'cheerio';
import { config } from '../lib/config.js';
import { createLogger } from '../lib/logger.js';

const logger = createLogger('services:scraper');

/**
 * HTTP headers to mimic a real browser
 */
const BROWSER_HEADERS = {
  'User-Agent': config.scraping.userAgent,
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

/**
 * Content selectors for different coding problem sites
 */
const SITE_SELECTORS = {
  leetcode: [
    '[data-track-load="description_content"]',
    '.content__u3I1',
    '[class*="question-content"]',
  ],
  hackerrank: [
    '.challenge-body-html',
    '.problem-statement',
    '.challenge_problem_statement',
  ],
  generic: [
    'article',
    'main',
    '.problem',
    '.description',
    '.content',
    '.question',
  ],
};

/**
 * Extract text using a list of selectors
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string[]} selectors - CSS selectors to try
 * @returns {string} - Extracted text or empty string
 */
function extractWithSelectors($, selectors) {
  for (const selector of selectors) {
    const text = $(selector).text().trim();
    if (text && text.length > 50) {
      return text;
    }
  }
  return '';
}

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Fetch and extract problem content from a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<{success: boolean, problemText?: string, error?: string, sourceUrl: string}>}
 */
export async function fetchProblemFromUrl(url) {
  const startTime = Date.now();

  logger.debug('Fetching URL', { url: url.substring(0, 100) });

  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(config.scraping.timeout),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      logger.warn('HTTP error while fetching URL', {
        url: url.substring(0, 100),
        status: response.status,
        duration,
      });

      if (response.status === 403) {
        return {
          success: false,
          error: 'Site blocks automated access. Use screenshot or copy-paste the problem text instead.',
          sourceUrl: url,
        };
      }

      return {
        success: false,
        error: `Failed to fetch URL: HTTP ${response.status}`,
        sourceUrl: url,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .ads, .advertisement, .sidebar').remove();

    // Try site-specific selectors first
    let problemText = '';

    // Detect site and use appropriate selectors
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('leetcode')) {
      problemText = extractWithSelectors($, SITE_SELECTORS.leetcode);
    } else if (hostname.includes('hackerrank')) {
      problemText = extractWithSelectors($, SITE_SELECTORS.hackerrank);
    }

    // Fall back to generic selectors
    if (!problemText) {
      problemText = extractWithSelectors($, SITE_SELECTORS.generic);
    }

    // Clean up the text
    problemText = cleanText(problemText);

    // If we couldn't extract much, get all body text
    if (problemText.length < 100) {
      logger.debug('Using fallback body text extraction', { url: url.substring(0, 100) });
      problemText = cleanText($('body').text()).substring(0, 5000);
    }

    // Validate we got meaningful content
    if (!problemText || problemText.length < 20) {
      logger.warn('Could not extract meaningful content', {
        url: url.substring(0, 100),
        extractedLength: problemText?.length || 0,
      });
      return {
        success: false,
        error: 'Could not extract problem content from the page. Try using a screenshot or copy-paste instead.',
        sourceUrl: url,
      };
    }

    // Limit content size
    const finalText = problemText.substring(0, config.scraping.maxContentLength);

    logger.info('Successfully extracted problem content', {
      url: url.substring(0, 100),
      contentLength: finalText.length,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      problemText: finalText,
      sourceUrl: url,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Error fetching URL', {
      url: url.substring(0, 100),
      error: error.message,
      errorName: error.name,
      duration,
    });

    // Handle specific error types
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. The site may be slow or blocking automated access.',
        sourceUrl: url,
      };
    }

    return {
      success: false,
      error: error.message,
      sourceUrl: url,
    };
  }
}
