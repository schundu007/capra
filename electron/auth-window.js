import { BrowserWindow, session } from 'electron';

// Platform login URLs
const PLATFORM_URLS = {
  coderpad: 'https://coderpad.io/login',
  hackerrank: 'https://www.hackerrank.com/auth/login',
  leetcode: 'https://leetcode.com/accounts/login/',
  codesignal: 'https://app.codesignal.com/login',
  codility: 'https://app.codility.com/accounts/login/',
  glider: 'https://glider.ai/login',
};

// Platform dashboard URLs (to detect successful login)
const PLATFORM_DASHBOARDS = {
  coderpad: ['coderpad.io/dashboard', 'app.coderpad.io'],
  hackerrank: ['hackerrank.com/dashboard', 'hackerrank.com/domains'],
  leetcode: ['leetcode.com/problemset', 'leetcode.com/problems'],
  codesignal: ['app.codesignal.com/profile', 'app.codesignal.com/tasks'],
  codility: ['app.codility.com/programmers', 'codility.com/c/'],
  glider: ['glider.ai/dashboard', 'gliderassessment.com'],
};

// Store cookies for each platform
const platformCookies = {};

/**
 * Open authentication window for a platform
 */
export async function openAuthWindow(platform, parentWindow) {
  const loginUrl = PLATFORM_URLS[platform];
  if (!loginUrl) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  return new Promise((resolve, reject) => {
    // Create a separate session for this auth window
    const authSession = session.fromPartition(`persist:auth-${platform}`);

    const authWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      parent: parentWindow,
      modal: true,
      title: `Login to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      webPreferences: {
        session: authSession,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Remove menu bar
    authWindow.setMenuBarVisibility(false);

    // Track if login was successful
    let loginSuccess = false;

    // Check URL changes to detect successful login
    authWindow.webContents.on('did-navigate', async (event, url) => {
      console.log(`[Auth] Navigated to: ${url}`);

      // Check if we've reached a dashboard/success page
      const dashboardUrls = PLATFORM_DASHBOARDS[platform] || [];
      const isLoggedIn = dashboardUrls.some(d => url.includes(d));

      if (isLoggedIn) {
        loginSuccess = true;
        // Capture cookies
        const cookies = await authSession.cookies.get({});
        const cookieString = cookies
          .map(c => `${c.name}=${c.value}`)
          .join('; ');

        platformCookies[platform] = {
          cookies: cookieString,
          timestamp: Date.now(),
        };

        console.log(`[Auth] Login successful for ${platform}, captured ${cookies.length} cookies`);

        // Close the window after a short delay
        setTimeout(() => {
          if (!authWindow.isDestroyed()) {
            authWindow.close();
          }
        }, 1000);
      }
    });

    // Handle window close
    authWindow.on('closed', () => {
      if (loginSuccess) {
        resolve({ success: true, platform });
      } else {
        resolve({ success: false, platform, reason: 'Window closed before login' });
      }
    });

    // Load the login page
    authWindow.loadURL(loginUrl);
  });
}

/**
 * Get stored cookies for a platform
 */
export function getPlatformCookies(platform) {
  const stored = platformCookies[platform];
  if (!stored) return null;

  // Check if cookies are still fresh (4 hours)
  const maxAge = 4 * 60 * 60 * 1000;
  if (Date.now() - stored.timestamp > maxAge) {
    delete platformCookies[platform];
    return null;
  }

  return stored.cookies;
}

/**
 * Get all platform auth status
 */
export function getAllPlatformStatus() {
  const maxAge = 4 * 60 * 60 * 1000;
  const status = {};

  for (const platform of Object.keys(PLATFORM_URLS)) {
    const stored = platformCookies[platform];
    status[platform] = {
      authenticated: !!(stored && (Date.now() - stored.timestamp < maxAge)),
      timestamp: stored?.timestamp,
    };
  }

  return status;
}

/**
 * Clear auth for a platform
 */
export async function clearPlatformAuth(platform) {
  delete platformCookies[platform];

  // Also clear the session cookies
  const authSession = session.fromPartition(`persist:auth-${platform}`);
  await authSession.clearStorageData();

  return true;
}

export default {
  openAuthWindow,
  getPlatformCookies,
  getAllPlatformStatus,
  clearPlatformAuth,
  PLATFORM_URLS,
};
