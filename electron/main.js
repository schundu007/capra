// IMPORTANT: Import EPIPE handler first before any other imports
import './epipe-handler.js';

import { app, BrowserWindow, ipcMain, Menu, shell, safeStorage, nativeTheme, session, desktopCapturer } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startBackendServer } from './backend-server.js';
import { setupApiKeyHandlers } from './ipc/api-keys.js';
import { setupSettingsHandlers } from './ipc/settings.js';
import { configStore } from './store/config-store.js';
import { secureStore } from './store/secure-store.js';
import { initAutoUpdater, checkForUpdates } from './updater/auto-updater.js';
import { openAuthWindow, getPlatformCookies, getAllPlatformStatus, clearPlatformAuth } from './auth-window.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safe logging helpers (use console methods which are now EPIPE-safe from epipe-handler.js)
function safeLog(...args) {
  console.log(...args);
}

function safeError(...args) {
  console.error(...args);
}

// Disable hardware acceleration if needed (helps with some GPU issues)
// app.disableHardwareAcceleration();

let mainWindow = null;
let backendServer = null;
const isDev = !app.isPackaged;

// Get backend port
const BACKEND_PORT = 3001;

async function createWindow() {
  // Start the embedded backend server
  const apiKeys = await secureStore.getApiKeys();
  backendServer = await startBackendServer({
    port: BACKEND_PORT,
    apiKeys,
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Capra',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0a1a10', // dark green
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for webview
      webviewTag: true, // Enable webview tag for embedding external sites
    },
  });

  // Set up CSP headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';" +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
          `connect-src 'self' http://localhost:${BACKEND_PORT} http://127.0.0.1:${BACKEND_PORT} ws://localhost:${BACKEND_PORT} ws://127.0.0.1:${BACKEND_PORT} https://*.lockedinai.com;` +
          "img-src 'self' data: blob: https://*.lockedinai.com;" +
          "font-src 'self' data: https://fonts.gstatic.com;" +
          "frame-src 'self' https://*.lockedinai.com https://app.lockedinai.com;"
        ]
      }
    });
  });

  // Grant media permissions for audio/video capture (Interview Assistant)
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'audioCapture', 'desktopCapture', 'mediaKeySystem'];
    if (allowedPermissions.includes(permission)) {
      safeLog('[Electron] Granting permission:', permission);
      callback(true);
    } else {
      safeLog('[Electron] Denying permission:', permission);
      callback(false);
    }
  });

  // Handle media access for desktopCapturer
  mainWindow.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
    safeLog('[Electron] Display media request');
    // Allow all display media requests (for system audio capture)
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      if (sources.length > 0) {
        callback({ video: sources[0] });
      } else {
        callback({});
      }
    });
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    await mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built frontend
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    safeLog('[Electron] Loading frontend from:', indexPath);

    // Log any renderer errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      safeError('[Electron] Failed to load:', errorCode, errorDescription);
    });

    mainWindow.webContents.on('did-finish-load', () => {
      safeLog('[Electron] Frontend loaded successfully');
    });

    mainWindow.webContents.on('console-message', (event, level, message) => {
      safeLog('[Renderer]', message);
    });

    await mainWindow.loadFile(indexPath);
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up header modification for LockedIn AI webview to bypass X-Frame-Options
  const lockedInSession = session.fromPartition('persist:lockedin');

  lockedInSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    // Remove frame-blocking headers
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];

    callback({ responseHeaders });
  });
}

// Create the application menu
function createAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Problem',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('new-problem');
          }
        },
        { type: 'separator' },
        ...(!isMac ? [
          {
            label: 'Settings...',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              mainWindow?.webContents.send('open-settings');
            }
          },
          { type: 'separator' }
        ] : []),
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
        ] : [
          { role: 'close' }
        ])
      ]
    },

    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/your-repo/capra#readme');
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/your-repo/capra/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Check if this is first run
async function isFirstRun() {
  const hasCompletedSetup = configStore.get('hasCompletedSetup', false);
  if (hasCompletedSetup) return false;

  // Also check if any API keys are stored
  const apiKeys = await secureStore.getApiKeys();
  return !apiKeys.anthropic && !apiKeys.openai;
}

// App lifecycle
app.whenReady().then(async () => {
  // Set up IPC handlers
  setupApiKeyHandlers();
  setupSettingsHandlers();

  // Check for first run
  const firstRun = await isFirstRun();

  // Create window and menu
  createAppMenu();
  await createWindow();

  // Send first-run event if needed
  if (firstRun) {
    mainWindow?.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.send('first-run');
    });
  }

  // Initialize auto-updater (only in packaged app)
  if (app.isPackaged) {
    initAutoUpdater(mainWindow);
  }

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up on quit
app.on('before-quit', async () => {
  if (backendServer) {
    await backendServer.close();
  }
});

// Handle API key updates from renderer
ipcMain.handle('update-api-keys', async (event, keys) => {
  await secureStore.setApiKeys(keys);
  // Notify backend server of key updates
  if (backendServer) {
    backendServer.updateApiKeys(keys);
  }
  return true;
});

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Get platform info
ipcMain.handle('get-platform-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    isPackaged: app.isPackaged,
    backendPort: BACKEND_PORT,
  };
});

// Check for updates
ipcMain.handle('check-for-updates', async () => {
  return checkForUpdates();
});

// Platform authentication handlers
ipcMain.handle('platform-login', async (event, platform) => {
  try {
    const result = await openAuthWindow(platform, mainWindow);
    // If login successful, update backend server with cookies
    if (result.success && backendServer) {
      const cookies = getPlatformCookies(platform);
      if (cookies) {
        backendServer.setPlatformCookies(platform, cookies);
      }
    }
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('platform-status', async () => {
  return getAllPlatformStatus();
});

ipcMain.handle('platform-logout', async (event, platform) => {
  await clearPlatformAuth(platform);
  if (backendServer) {
    backendServer.setPlatformCookies(platform, null);
  }
  return { success: true };
});

ipcMain.handle('get-platform-cookies', (event, platform) => {
  return getPlatformCookies(platform);
});

// LockedIn AI is now embedded via webview in the frontend - no separate window needed
