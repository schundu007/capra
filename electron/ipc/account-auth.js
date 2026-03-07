/**
 * Account Auth IPC Handlers
 * Handles Ascend account OAuth login for desktop app cloud sync
 */

import { ipcMain, BrowserWindow } from 'electron';
import * as deviceLicense from '../store/device-license.js';

// OAuth configuration
const CARIARA_OAUTH_URL = 'https://cariara-backend.up.railway.app';
const WEBAPP_URL = 'https://chundu.vercel.app';

// Safe logging
function safeLog(...args) {
  try {
    console.log(...args);
  } catch {
    // Ignore EPIPE errors
  }
}

/**
 * Setup account auth IPC handlers
 */
export function setupAccountAuthHandlers(mainWindow) {
  // Open OAuth login window
  ipcMain.handle('account-login', async (event, provider = 'google') => {
    return new Promise((resolve) => {
      const authWindow = new BrowserWindow({
        width: 500,
        height: 700,
        parent: mainWindow,
        modal: false,
        title: 'Sign in to Ascend',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Remove menu bar
      authWindow.setMenuBarVisibility(false);

      // Track login success
      let loginSuccess = false;
      let authData = null;

      // Check URL for OAuth callback tokens
      const checkForTokens = (url) => {
        safeLog('[AccountAuth] Checking URL:', url);

        // Check if we're back on the webapp with tokens in hash
        if (url.includes('#access_token=') || url.includes('access_token=')) {
          safeLog('[AccountAuth] Found tokens in URL');

          // Parse tokens from URL hash or query
          const hashIndex = url.indexOf('#');
          const queryIndex = url.indexOf('?');
          const paramsString = hashIndex !== -1 ? url.substring(hashIndex + 1) :
                              queryIndex !== -1 ? url.substring(queryIndex + 1) : '';

          const params = new URLSearchParams(paramsString);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const userId = params.get('user_id');
          const userEmail = params.get('user_email');
          const userName = params.get('user_name');

          if (accessToken) {
            loginSuccess = true;
            authData = {
              accessToken,
              refreshToken,
              userId: userId ? parseInt(userId, 10) : null,
              userEmail: userEmail ? decodeURIComponent(userEmail) : null,
              userName: userName ? decodeURIComponent(userName) : null,
            };

            // Store credentials
            deviceLicense.storeCredentials({
              accessToken,
              refreshToken,
              userId: authData.userId,
            });

            safeLog('[AccountAuth] Login successful, tokens stored');

            // Close window after short delay
            setTimeout(() => {
              if (!authWindow.isDestroyed()) {
                authWindow.close();
              }
            }, 500);
          }
        }
      };

      // Listen for navigation
      authWindow.webContents.on('did-navigate', (event, url) => checkForTokens(url));
      authWindow.webContents.on('did-navigate-in-page', (event, url) => checkForTokens(url));
      authWindow.webContents.on('did-finish-load', () => {
        const url = authWindow.webContents.getURL();
        checkForTokens(url);
      });

      // Handle window close
      authWindow.on('closed', () => {
        if (loginSuccess && authData) {
          resolve({ success: true, ...authData });
        } else {
          resolve({ success: false, reason: 'Window closed before login' });
        }
      });

      // Allow ESC key to close
      authWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape') {
          authWindow.close();
        }
      });

      // Build OAuth URL with redirect to webapp (which will show tokens in URL)
      const loginUrl = `${CARIARA_OAUTH_URL}/auth/${provider}/login?redirect=ascend`;
      safeLog('[AccountAuth] Opening OAuth URL:', loginUrl);
      authWindow.loadURL(loginUrl);
    });
  });

  // Check if account is linked
  ipcMain.handle('account-status', async () => {
    const credentials = deviceLicense.getStoredCredentials();
    return {
      linked: !!credentials.accessToken,
      userId: credentials.userId,
    };
  });

  // Unlink account (logout)
  ipcMain.handle('account-logout', async () => {
    deviceLicense.clearCredentials();
    safeLog('[AccountAuth] Account unlinked');
    return { success: true };
  });
}
