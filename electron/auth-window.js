import { BrowserWindow, session } from 'electron';
import Store from 'electron-store';
import { safeStorage } from 'electron';

// Safe logging that ignores EPIPE errors
function safeLog(...args) {
  try {
    console.log(...args);
  } catch {
    // Ignore EPIPE and other write errors
  }
}

// Persistent storage for platform auth (encrypted)
const authStore = new Store({
  name: 'platform-auth',
  encryptionKey: 'capra-platform-auth',
});

// Encrypt/decrypt helpers
function encrypt(text) {
  if (!text) return null;
  if (!safeStorage.isEncryptionAvailable()) {
    return text;
  }
  const buffer = safeStorage.encryptString(text);
  return buffer.toString('base64');
}

function decrypt(encryptedBase64) {
  if (!encryptedBase64) return null;
  if (!safeStorage.isEncryptionAvailable()) {
    return encryptedBase64;
  }
  try {
    const buffer = Buffer.from(encryptedBase64, 'base64');
    return safeStorage.decryptString(buffer);
  } catch {
    return null;
  }
}

// Platform login URLs (use homepage if no direct login page, user clicks Sign in)
const PLATFORM_URLS = {
  // Coding platforms
  coderpad: 'https://coderpad.io/login',
  hackerrank: 'https://www.hackerrank.com/auth/login',
  leetcode: 'https://leetcode.com/accounts/login/',
  codesignal: 'https://app.codesignal.com/login',
  codility: 'https://app.codility.com/accounts/login/',
  glider: 'https://glider.ai/login',
  // Interview prep platforms (many use OAuth popups, so use homepage)
  techprep: 'https://www.techprep.app/',
  algomaster: 'https://www.algomaster.io/',
  neetcode: 'https://neetcode.io/',
  interviewbit: 'https://www.interviewbit.com/',
  educative: 'https://www.educative.io/login',
  designgurus: 'https://www.designgurus.io/',
};

// Platform dashboard URLs (to detect successful login)
// Using broad patterns - will match any URL containing these strings after login
const PLATFORM_DASHBOARDS = {
  coderpad: ['coderpad.io/dashboard', 'coderpad.io/pad', 'coderpad.io/sandbox'],
  hackerrank: ['hackerrank.com/dashboard', 'hackerrank.com/domains', 'hackerrank.com/challenges', 'hackerrank.com/contests', 'hackerrank.com/interview'],
  leetcode: ['leetcode.com/problemset', 'leetcode.com/problems', 'leetcode.com/explore', 'leetcode.com/contest', 'leetcode.com/discuss', 'leetcode.com/profile', 'leetcode.com/submissions', 'leetcode.com/progress'],
  codesignal: ['codesignal.com/profile', 'codesignal.com/tasks', 'codesignal.com/coding-report', 'codesignal.com/test', 'codesignal.com/client-dashboard', 'codesignal.com/home', 'codesignal.com/company', 'codesignal.com/public-test', 'codesignal.com/interview', 'codesignal.com/learn/', 'codesignal.com/course', 'codesignal.com/path', 'codesignal.com/arcade'],
  codility: ['codility.com/programmers', 'codility.com/c/', 'codility.com/demo', 'codility.com/test'],
  glider: ['glider.ai/dashboard', 'gliderassessment.com', 'glider.ai/assessment', 'glider.ai/test'],
  // Interview prep platforms (broader patterns - detect logged-in state)
  techprep: ['techprep.app/full-stack', 'techprep.app/system-design', 'techprep.app/data-structures', 'techprep.app/dashboard', 'techprep.app/profile', 'techprep.app/topics'],
  algomaster: ['algomaster.io/dashboard', 'algomaster.io/problems', 'algomaster.io/roadmap', 'algomaster.io/practice', 'algomaster.io/courses'],
  neetcode: ['neetcode.io/practice', 'neetcode.io/roadmap', 'neetcode.io/problems', 'neetcode.io/courses'],
  interviewbit: ['interviewbit.com/courses', 'interviewbit.com/practice', 'interviewbit.com/dashboard', 'interviewbit.com/problems'],
  educative: ['educative.io/learn', 'educative.io/courses', 'educative.io/profile', 'educative.io/explore'],
  designgurus: ['designgurus.io/course', 'designgurus.io/path', 'designgurus.io/dashboard', 'designgurus.io/learn'],
};

// Login page patterns to exclude
const LOGIN_PATTERNS = ['/login', '/signin', '/auth', '/accounts/login', '/register', '/signup'];

// In-memory cache of platform cookies (loaded from persistent storage on init)
let platformCookies = {};
let initialized = false;

/**
 * Initialize platform cookies from persistent storage
 */
function initializePlatformCookies() {
  if (initialized) return;

  try {
    const stored = authStore.get('platformCookies', {});
    for (const [platform, data] of Object.entries(stored)) {
      if (data && data.encryptedCookies && data.timestamp) {
        const cookies = decrypt(data.encryptedCookies);
        if (cookies) {
          platformCookies[platform] = {
            cookies,
            timestamp: data.timestamp,
          };
        }
      }
    }
    safeLog(`[Auth] Loaded ${Object.keys(platformCookies).length} persisted platform sessions`);
  } catch (err) {
    safeLog('[Auth] Error loading persisted sessions:', err.message);
  }
  initialized = true;
}

/**
 * Save platform cookies to persistent storage
 */
function savePlatformCookies() {
  try {
    const toStore = {};
    for (const [platform, data] of Object.entries(platformCookies)) {
      if (data && data.cookies && data.timestamp) {
        toStore[platform] = {
          encryptedCookies: encrypt(data.cookies),
          timestamp: data.timestamp,
        };
      }
    }
    authStore.set('platformCookies', toStore);
    safeLog('[Auth] Saved platform sessions to disk');
  } catch (err) {
    safeLog('[Auth] Error saving sessions:', err.message);
  }
}

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
      modal: false,  // Not modal so user can close it easily
      closable: true,
      title: `Login to ${platform.charAt(0).toUpperCase() + platform.slice(1)} - Press ESC or click X to close`,
      webPreferences: {
        session: authSession,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Remove menu bar
    authWindow.setMenuBarVisibility(false);

    // Allow ESC key to close window
    authWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        authWindow.close();
      }
    });

    // Track if login was successful
    let loginSuccess = false;

    // Check URL changes to detect successful login
    authWindow.webContents.on('did-navigate', async (event, url) => {
      safeLog(`[Auth] Navigated to: ${url}`);

      // Check if we've reached a dashboard/success page
      const dashboardUrls = PLATFORM_DASHBOARDS[platform] || [];
      let isLoggedIn = dashboardUrls.some(d => url.includes(d));

      // Fallback: if not on a login page and we have cookies, consider logged in
      if (!isLoggedIn) {
        const isOnLoginPage = LOGIN_PATTERNS.some(p => url.toLowerCase().includes(p));
        if (!isOnLoginPage) {
          const cookies = await authSession.cookies.get({});
          // If we have several cookies, likely logged in
          if (cookies.length >= 3) {
            safeLog(`[Auth] Fallback: Not on login page and have ${cookies.length} cookies`);
            isLoggedIn = true;
          }
        }
      }

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

        // Persist to disk
        savePlatformCookies();

        safeLog(`[Auth] Login successful for ${platform}, captured ${cookies.length} cookies`);

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
  // Ensure cookies are loaded from disk
  initializePlatformCookies();

  const stored = platformCookies[platform];
  if (!stored) return null;

  // Check if cookies are still fresh (24 hours for persistence)
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - stored.timestamp > maxAge) {
    delete platformCookies[platform];
    savePlatformCookies();
    return null;
  }

  return stored.cookies;
}

/**
 * Get all platform auth status
 */
export function getAllPlatformStatus() {
  // Ensure cookies are loaded from disk
  initializePlatformCookies();

  const maxAge = 24 * 60 * 60 * 1000; // 24 hours for persistence
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

  // Persist the deletion
  savePlatformCookies();

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
