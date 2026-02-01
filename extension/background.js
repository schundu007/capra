// Platform configurations
const PLATFORMS = {
  glider: {
    name: 'Glider',
    domains: ['glider.ai', 'gliderassessment.com'],
    cookieNames: ['session', 'auth_token', 'JSESSIONID', '_glider_session'],
  },
  lark: {
    name: 'Lark',
    domains: ['lark.com', 'larksuite.com', 'feishu.cn'],
    cookieNames: ['session', 'biz_token', 'passport_auth_token', 'lark_oapi_csrf_token'],
  },
  hackerrank: {
    name: 'HackerRank',
    domains: ['hackerrank.com'],
    cookieNames: ['_hrank_session', 'hackerrank_mixpanel_token', 'remember_hrank_token'],
  },
  coderpad: {
    name: 'CoderPad',
    domains: ['coderpad.io', '.coderpad.io', 'app.coderpad.io', 'www.coderpad.io'],
    urls: ['https://coderpad.io', 'https://app.coderpad.io', 'https://www.coderpad.io'],
    cookieNames: ['_coderpad_session', 'session', 'auth_token', 'remember_token', 'user_id', 'access_token', '_session_id', 'logged_in', 'token', 'jwt', 'sid', 'ajs_user_id', 'ajs_anonymous_id'],
    // If no specific auth cookie found, consider authenticated if ANY cookies exist
    anyAuthenticates: true,
  },
  codesignal: {
    name: 'CodeSignal',
    domains: ['codesignal.com', 'app.codesignal.com'],
    cookieNames: ['session', 'auth_token', '_codesignal_session', 'connect.sid', 'token', 'jwt'],
    anyAuthenticates: true,
  },
  codility: {
    name: 'Codility',
    domains: ['codility.com', 'app.codility.com'],
    cookieNames: ['sessionid', 'csrftoken', '_codility_session', 'token', 'jwt'],
    anyAuthenticates: true,
  },
  leetcode: {
    name: 'LeetCode',
    domains: ['leetcode.com'],
    cookieNames: ['LEETCODE_SESSION', 'csrftoken', '__cfduid', 'token'],
  },
};

// Get API URL from storage or use default
async function getApiUrl() {
  const result = await chrome.storage.local.get(['apiUrl']);
  return result.apiUrl || 'https://capra-backend-production.up.railway.app';
}

// Capture cookies for a platform
async function captureCookies(platformKey) {
  const platform = PLATFORMS[platformKey];
  if (!platform) return null;

  const allCookies = {};

  // Try URL-based queries first (more reliable)
  const urls = platform.urls || platform.domains.map(d => `https://${d}`);
  for (const url of urls) {
    try {
      const cookies = await chrome.cookies.getAll({ url });
      for (const cookie of cookies) {
        allCookies[cookie.name] = cookie.value;
      }
    } catch (err) {
      // Ignore errors, try next
    }
  }

  // Also try domain-based queries
  for (const domain of platform.domains) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      for (const cookie of cookies) {
        allCookies[cookie.name] = cookie.value;
      }
    } catch (err) {
      // Ignore errors
    }
  }

  console.log(`[Capra] Cookies for ${platformKey}:`, Object.keys(allCookies));
  return Object.keys(allCookies).length > 0 ? allCookies : null;
}

// Build cookie header string
function buildCookieHeader(cookies) {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

// Check if user is authenticated on a platform
async function checkPlatformAuth(platformKey) {
  const cookies = await captureCookies(platformKey);
  if (!cookies) return { authenticated: false };

  const platform = PLATFORMS[platformKey];
  const hasAuthCookie = platform.cookieNames.some(name => cookies[name]);

  // Some platforms: if we have ANY cookies, consider it authenticated
  const hasCookies = Object.keys(cookies).length > 0;
  const isAuthenticated = hasAuthCookie || (platform.anyAuthenticates && hasCookies);

  return {
    authenticated: isAuthenticated,
    cookies: isAuthenticated ? cookies : null,
  };
}

// Send auth tokens to backend
async function syncAuthToBackend(platformKey, cookies) {
  const apiUrl = await getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/auth/platform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        platform: platformKey,
        cookies: buildCookieHeader(cookies),
        timestamp: Date.now(),
      }),
    });

    return response.ok;
  } catch (err) {
    console.error('Failed to sync auth to backend:', err);
    // Store locally as fallback
    await chrome.storage.local.set({
      [`cookies_${platformKey}`]: {
        cookies: buildCookieHeader(cookies),
        timestamp: Date.now(),
      }
    });
    console.log(`Stored ${platformKey} cookies locally as fallback`);
    return true; // Consider it a success if stored locally
  }
}

// Get status of all platforms
async function getAllPlatformStatus() {
  const status = {};

  for (const platformKey of Object.keys(PLATFORMS)) {
    const auth = await checkPlatformAuth(platformKey);
    status[platformKey] = {
      name: PLATFORMS[platformKey].name,
      authenticated: auth.authenticated,
    };
  }

  return status;
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    getAllPlatformStatus().then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (request.action === 'syncPlatform') {
    (async () => {
      const auth = await checkPlatformAuth(request.platform);
      if (auth.authenticated && auth.cookies) {
        const synced = await syncAuthToBackend(request.platform, auth.cookies);
        sendResponse({ success: synced, authenticated: true });
      } else {
        sendResponse({ success: false, authenticated: false });
      }
    })();
    return true;
  }

  if (request.action === 'syncAll') {
    (async () => {
      const results = {};
      for (const platformKey of Object.keys(PLATFORMS)) {
        const auth = await checkPlatformAuth(platformKey);
        if (auth.authenticated && auth.cookies) {
          results[platformKey] = await syncAuthToBackend(platformKey, auth.cookies);
        } else {
          results[platformKey] = false;
        }
      }
      sendResponse(results);
    })();
    return true;
  }

  if (request.action === 'setApiUrl') {
    chrome.storage.local.set({ apiUrl: request.url }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getApiUrl') {
    getApiUrl().then(url => sendResponse({ url }));
    return true;
  }
});

// Listen for cookie changes and auto-sync
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const { cookie, removed } = changeInfo;
  if (removed) return;

  // Check if this cookie belongs to any of our platforms
  for (const [platformKey, platform] of Object.entries(PLATFORMS)) {
    const matchesDomain = platform.domains.some(d => cookie.domain.includes(d));
    const isAuthCookie = platform.cookieNames.includes(cookie.name);

    if (matchesDomain && isAuthCookie) {
      // Auto-sync this platform
      const auth = await checkPlatformAuth(platformKey);
      if (auth.authenticated && auth.cookies) {
        await syncAuthToBackend(platformKey, auth.cookies);
        console.log(`Auto-synced ${platform.name} auth`);
      }
      break;
    }
  }
});
