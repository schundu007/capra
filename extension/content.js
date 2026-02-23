// Content script - runs on HackerRank, LeetCode, CoderPad pages
// Detects problem pages and sends them to Capra desktop app

(function() {
  // Avoid running multiple times
  if (window.__capraContentLoaded) return;
  window.__capraContentLoaded = true;

  // Problem page patterns
  const PROBLEM_PATTERNS = {
    hackerrank: {
      // HackerRank problem URLs: /challenges/xxx, /contests/xxx/challenges/xxx, /tests/xxx
      patterns: [
        /hackerrank\.com\/challenges\/[^\/]+/,
        /hackerrank\.com\/contests\/[^\/]+\/challenges\/[^\/]+/,
        /hackerrank\.com\/tests\/[^\/]+\/questions/,
        /hackerrank\.com\/work\/tests\/[^\/]+/,
      ],
      // Detect problem type from page content
      detectType: () => {
        const pageText = document.body?.innerText?.toLowerCase() || '';
        const url = window.location.href.toLowerCase();

        // System design indicators
        if (pageText.includes('system design') ||
            pageText.includes('design a system') ||
            pageText.includes('architecture') ||
            pageText.includes('scalability') ||
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
      ],
      detectType: () => 'coding'
    },
    codesignal: {
      patterns: [
        /codesignal\.com\/test/,
        /codesignal\.com\/public-test/,
        /codesignal\.com\/interview/,
      ],
      detectType: () => 'coding'
    }
  };

  // Check if current URL is a problem page
  function isProblemPage() {
    const url = window.location.href;

    for (const [platform, config] of Object.entries(PROBLEM_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(url)) {
          return { platform, type: config.detectType() };
        }
      }
    }
    return null;
  }

  // Send problem URL to desktop app
  async function sendToDesktopApp(url, platform, problemType) {
    console.log(`[Capra] Detected ${platform} ${problemType} problem:`, url);

    // Send to background script which will forward to desktop app
    chrome.runtime.sendMessage({
      action: 'problemDetected',
      url: url,
      platform: platform,
      problemType: problemType,
      timestamp: Date.now()
    }, (response) => {
      // Silently log - no popup notification (too intrusive)
      if (response?.success) {
        console.log('[Capra] Problem sent successfully');
      } else if (response?.error) {
        console.log('[Capra] Failed to send:', response.error);
      }
    });
  }

  // Track last URL to detect navigation
  let lastUrl = window.location.href;
  let lastSentUrl = null;

  // Check for problem and send
  function checkAndSend() {
    const problem = isProblemPage();
    const currentUrl = window.location.href;

    if (problem && currentUrl !== lastSentUrl) {
      lastSentUrl = currentUrl;
      sendToDesktopApp(currentUrl, problem.platform, problem.type);
    }
  }

  // Initial check after page loads
  function init() {
    // Wait a bit for SPA content to load
    setTimeout(checkAndSend, 1500);
  }

  // Run on page load
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // Watch for URL changes (SPA navigation)
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(checkAndSend, 1500);
    }
  });

  // Start observing when body is available
  if (document.body) {
    observer.observe(document.body, { subtree: true, childList: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { subtree: true, childList: true });
    });
  }

  // Also listen for popstate (back/forward navigation)
  window.addEventListener('popstate', () => {
    setTimeout(checkAndSend, 1000);
  });

  console.log('[Capra] Content script loaded - auto-detecting problems');
})();
