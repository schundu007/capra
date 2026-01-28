// Content script - runs on Glider, Lark, HackerRank pages
// Detects login state and notifies background script

(function() {
  // Detect which platform we're on
  function detectPlatform() {
    const hostname = window.location.hostname;

    if (hostname.includes('glider')) return 'glider';
    if (hostname.includes('lark') || hostname.includes('feishu')) return 'lark';
    if (hostname.includes('hackerrank')) return 'hackerrank';

    return null;
  }

  // Check for login indicators on the page
  function detectLogin() {
    const platform = detectPlatform();
    if (!platform) return;

    // Platform-specific login detection
    const loginIndicators = {
      glider: [
        () => !!document.querySelector('[class*="user-menu"]'),
        () => !!document.querySelector('[class*="profile"]'),
        () => !!document.querySelector('[class*="logout"]'),
      ],
      lark: [
        () => !!document.querySelector('[class*="avatar"]'),
        () => !!document.querySelector('[class*="user-info"]'),
        () => !!document.querySelector('[class*="profile"]'),
      ],
      hackerrank: [
        () => !!document.querySelector('.profile-panel'),
        () => !!document.querySelector('[class*="logged-in"]'),
        () => !!document.querySelector('.nav-avatar'),
      ],
    };

    const indicators = loginIndicators[platform] || [];
    const isLoggedIn = indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });

    if (isLoggedIn) {
      // Notify background script that user is logged in
      chrome.runtime.sendMessage({
        action: 'userLoggedIn',
        platform,
        url: window.location.href,
      });
    }
  }

  // Run detection after page loads
  if (document.readyState === 'complete') {
    detectLogin();
  } else {
    window.addEventListener('load', detectLogin);
  }

  // Also detect on URL changes (for SPAs)
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(detectLogin, 1000);
    }
  }).observe(document.body, { subtree: true, childList: true });
})();
