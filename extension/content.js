// Content script for coding platforms

(function() {
  // Avoid running multiple times - use generic variable name
  if (window.__av_ready) return;
  window.__av_ready = true;

  // Platform patterns
  const PATTERNS = {
    hackerrank: {
      patterns: [
        /hackerrank\.com\/challenges\/[^\/]+/,
        /hackerrank\.com\/contests\/[^\/]+\/challenges\/[^\/]+/,
        /hackerrank\.com\/tests\/[^\/]+\/questions/,
        /hackerrank\.com\/work\/tests\/[^\/]+/,
        /hackerrank\.com\/test\/[^\/]+/,                          // singular /test/
        /hackerrank\.com\/x\/tests\/[^\/]+/,                      // /x/tests/ prefix
        /hackerrank\.com\/x\/test\/[^\/]+/,                       // /x/test/ prefix
        /hackerrank\.com\/interview\/[^\/]+/,                     // /interview/ path
        /hackerrank\.com\/.*\/questions\/[^\/]+/,                 // any path with /questions/
        /hackerrank\.com\/.*candidate/i,                          // candidate test URLs
        /hr\.gs\/.+/,                                             // HackerRank short URLs
        /hackerrank\.com\/codepair\/.+/,                          // live codepair interviews
        /hackerrank\.com\/domains\/.+/,                           // domain challenges
        /hackerrank\.com\/skills-verification\/.+/,               // skills verification
        /hackerrank\.com\/.*\/coding_questions\/.+/,              // coding questions
      ],
      detectType: () => {
        const text = document.body?.innerText?.toLowerCase() || '';
        const url = window.location.href.toLowerCase();
        if (text.includes('system design') || text.includes('design a system') ||
            text.includes('architecture') || text.includes('scalability') ||
            url.includes('system-design')) {
          return 'system_design';
        }
        return 'coding';
      }
    },
    leetcode: {
      patterns: [
        /leetcode\.com\/problems\/[^\/]+/,
        /leetcode\.com\/contest\/[^\/]+\/problems\/[^\/]+/,
        /leetcode\.com\/playground\/.+/,                          // playground
        /leetcode\.com\/explore\/[^\/]+\/card\/.+/,               // explore cards
        /leetcode\.com\/company\/[^\/]+\/problems\/.+/,           // company problems
        /leetcode\.com\/assessment\/.+/,                          // assessments
        /leetcode\.com\/interview\/.+/,                           // mock interviews
      ],
      detectType: () => {
        const tags = document.querySelectorAll('[class*="tag"]');
        const tagText = Array.from(tags).map(t => t.textContent?.toLowerCase()).join(' ');
        if (tagText.includes('system design') || tagText.includes('design')) {
          return 'system_design';
        }
        return 'coding';
      }
    },
    coderpad: {
      patterns: [
        /coderpad\.io\/sandbox/,
        /coderpad\.io\/[A-Z0-9]+$/i,
        /app\.coderpad\.io/,
        /coderpad\.io\/interview\/.+/,                            // interview sessions
        /coderpad\.io\/pad\/.+/,                                  // pad sessions
      ],
      detectType: () => 'coding'
    },
    codesignal: {
      patterns: [
        /codesignal\.com\/test/,
        /codesignal\.com\/public-test/,
        /codesignal\.com\/interview/,
        /codesignal\.com\/assessments\/.+/,                       // assessments
        /codesignal\.com\/coding-report\/.+/,                     // coding reports
        /codesignal\.com\/preview\/.+/,                           // preview mode
        /app\.codesignal\.com\/.+/,                               // app subdomain
      ],
      detectType: () => 'coding'
    },
    codility: {
      patterns: [
        /codility\.com\/programmers\/lessons\/.+/,                // lessons
        /codility\.com\/programmers\/trainings\/.+/,              // trainings
        /codility\.com\/c\/run\/.+/,                              // test runs
        /codility\.com\/ce\/.+/,                                  // candidate experience
        /app\.codility\.com\/.+/,                                 // app subdomain
        /codility\.com\/public-link\/.+/,                         // public links
        /codility\.com\/test\/.+/,                                // tests
      ],
      detectType: () => 'coding'
    },
    glider: {
      patterns: [
        /glider\.ai\/assess\/.+/,                                 // assessments
        /glider\.ai\/interview\/.+/,                              // interviews
        /glider\.ai\/test\/.+/,                                   // tests
        /gliderassessment\.com\/.+/,                              // assessment domain
        /app\.glider\.ai\/.+/,                                    // app subdomain
      ],
      detectType: () => 'coding'
    },
    lark: {
      patterns: [
        /lark\.com\/.*interview/i,                                // interviews
        /larksuite\.com\/.*interview/i,                           // larksuite interviews
        /feishu\.cn\/.*interview/i,                               // feishu interviews
      ],
      detectType: () => 'coding'
    }
  };

  function detectPage() {
    const url = window.location.href;
    for (const [platform, config] of Object.entries(PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(url)) {
          return { platform, type: config.detectType() };
        }
      }
    }
    return null;
  }

  // Send via background script with randomized delay
  async function notify(url, platform, type) {
    // Random delay 2-5 seconds to avoid timing fingerprinting
    const delay = 2000 + Math.random() * 3000;
    await new Promise(r => setTimeout(r, delay));

    chrome.runtime.sendMessage({
      action: 'problemDetected',
      url, platform, problemType: type,
      timestamp: Date.now()
    }, () => {});
  }

  let lastUrl = window.location.href;
  let sentUrls = new Set();

  function check() {
    const page = detectPage();
    const url = window.location.href;
    if (page && !sentUrls.has(url)) {
      sentUrls.add(url);
      notify(url, page.platform, page.type);
    }
  }

  // Initial check with random delay
  function init() {
    const delay = 1500 + Math.random() * 1500;
    setTimeout(check, delay);
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // Minimal observer for SPA navigation
  let checkTimeout = null;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      if (checkTimeout) clearTimeout(checkTimeout);
      checkTimeout = setTimeout(check, 2000 + Math.random() * 2000);
    }
  });

  if (document.body) {
    observer.observe(document.body, { subtree: true, childList: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { subtree: true, childList: true });
    });
  }

  window.addEventListener('popstate', () => {
    setTimeout(check, 1500 + Math.random() * 1500);
  });
})();
