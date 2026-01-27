import * as cheerio from 'cheerio';

export async function fetchProblemFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
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
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Site blocks automated access. Use screenshot or copy-paste the problem text instead.');
      }
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, header, footer').remove();

    // Try to extract problem content based on common patterns
    let problemText = '';

    // LeetCode patterns
    const leetcodeContent = $('[data-track-load="description_content"]').text() ||
                           $('.content__u3I1').text() ||
                           $('[class*="question-content"]').text();

    // HackerRank patterns
    const hackerrankContent = $('.challenge-body-html').text() ||
                              $('.problem-statement').text() ||
                              $('.challenge_problem_statement').text();

    // Generic patterns
    const genericContent = $('article').text() ||
                          $('main').text() ||
                          $('.problem').text() ||
                          $('.description').text();

    problemText = leetcodeContent || hackerrankContent || genericContent;

    // Clean up the text
    problemText = problemText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // If we couldn't extract much, get all body text
    if (problemText.length < 100) {
      problemText = $('body').text()
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim()
        .substring(0, 5000); // Limit to 5000 chars
    }

    if (!problemText || problemText.length < 20) {
      throw new Error('Could not extract problem content from the page');
    }

    return {
      success: true,
      problemText: problemText.substring(0, 8000), // Limit size
      sourceUrl: url,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      sourceUrl: url,
    };
  }
}
