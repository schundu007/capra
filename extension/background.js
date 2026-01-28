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

  for (const domain of platform.domains) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      for (const cookie of cookies) {
        allCookies[cookie.name] = cookie.value;
      }
    } catch (err) {
      console.error(`Error getting cookies for ${domain}:`, err);
    }
  }

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

  return {
    authenticated: hasAuthCookie,
    cookies: hasAuthCookie ? cookies : null,
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
      body: JSON.stringify({
        platform: platformKey,
        cookies: buildCookieHeader(cookies),
        timestamp: Date.now(),
      }),
    });

    return response.ok;
  } catch (err) {
    console.error('Failed to sync auth to backend:', err);
    return false;
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
