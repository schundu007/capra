import * as cheerio from 'cheerio';

export async function fetchProblemFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) {
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
