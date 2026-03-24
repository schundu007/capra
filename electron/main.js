// IMPORTANT: Import EPIPE handler first before any other imports
import './epipe-handler.js';

import { app, BrowserWindow, ipcMain, Menu, shell, safeStorage, nativeTheme, session, desktopCapturer, screen, globalShortcut, systemPreferences } from 'electron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { startBackendServer } from './backend-server.js';
import { setupApiKeyHandlers } from './ipc/api-keys.js';
import { setupSettingsHandlers } from './ipc/settings.js';
import { setupDeviceLicenseHandlers } from './ipc/device-license.js';
import { setupAccountAuthHandlers } from './ipc/account-auth.js';
import { configStore } from './store/config-store.js';
import { secureStore } from './store/secure-store.js';
import * as systemDesignsStore from './store/system-designs-store.js';
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
let interviewPrepWindow = null;
let voiceAssistantWindow = null;
let backendServer = null;
const isDev = !app.isPackaged;

// Stealth mode state
let stealthModeEnabled = false; // Default OFF (toggle with Cmd+Shift+S)
let windowVisible = true;
let autoHideEnabled = false; // Auto-destroy disabled - use second monitor for stealth
let wasAutoHidden = false; // Track if we auto-hid (vs manual hide)
let savedBoundsGlobal = null; // Store bounds globally for auto-hide restore

// Detect if video conferencing apps are running (fast process check)
function checkScreenSharing(callback) {
  if (process.platform !== 'darwin') {
    callback(false);
    return;
  }

  // Fast check using pgrep - detects if any video call app is running
  // Checks for: Zoom, Microsoft Teams, Google Meet (via Chrome), Webex, Slack Huddle
  const checkCmd = `pgrep -i "zoom|teams|webex|slack" || true`;

  exec(checkCmd, { timeout: 2000 }, (error, stdout) => {
    if (error) {
      callback(false);
      return;
    }
    // If any process ID returned, video app is running
    const hasVideoApp = stdout.trim().length > 0;
    callback(hasVideoApp);
  });
}

// Start monitoring for screen sharing
let screenShareMonitorInterval = null;
let windowDestroyed = false; // Track if we destroyed the window

function startScreenShareMonitor() {
  // This now runs globally, not tied to mainWindow lifecycle
  if (screenShareMonitorInterval) return;

  screenShareMonitorInterval = setInterval(() => {
    if (!autoHideEnabled) return;

    checkScreenSharing((isSharing) => {
      // Re-check autoHideEnabled in callback (might have changed during async check)
      if (!autoHideEnabled) return;

      if (isSharing && mainWindow && !windowDestroyed) {
        // DESTROY window completely when video call detected
        savedBoundsGlobal = mainWindow.getBounds();
        mainWindow.destroy();
        mainWindow = null;
        windowVisible = false;
        windowDestroyed = true;
        wasAutoHidden = true;
        safeLog('[Stealth] Window DESTROYED: video call detected - press Cmd+Shift+W to restore');
      } else if (!isSharing && windowDestroyed && wasAutoHidden) {
        // Auto-recreate when video call ends
        safeLog('[Stealth] Video call ended - recreating window...');
        createWindowOnly().then(() => {
          windowDestroyed = false;
          wasAutoHidden = false;
          safeLog('[Stealth] Window restored after video call');
        });
      }
    });
  }, 2000); // Check every 2 seconds
}

// Create window only (without starting backend - for recreation)
async function createWindowOnly() {
  const { BrowserWindow } = await import('electron');

  // Use saved bounds or default to secondary display
  const defaultBounds = getSecondaryDisplayBounds(1400, 900);
  const bounds = savedBoundsGlobal || defaultBounds;

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 900,
    minHeight: 600,
    title: 'Ascend',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0a1a10',
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
    },
  });

  // Re-apply stealth settings
  if (stealthModeEnabled) {
    mainWindow.setContentProtection(true);
  }
  if (process.platform === 'darwin') {
    mainWindow.setHiddenInMissionControl(true);
  }

  // Load the app
  const FRONTEND_PORT = 5173;
  if (isDev) {
    await mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
  } else {
    await mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
  }

  windowVisible = true;
  mainWindow.focus();
}

// Get the secondary (non-primary) display for stealth positioning
function getSecondaryDisplay() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  // Find a display that's not the primary
  const secondaryDisplay = displays.find(d => d.id !== primaryDisplay.id);

  return secondaryDisplay || primaryDisplay; // Fallback to primary if only one monitor
}

// Calculate window position centered on secondary display
function getSecondaryDisplayBounds(width, height) {
  const display = getSecondaryDisplay();
  const { x, y, width: displayWidth, height: displayHeight } = display.workArea;

  return {
    x: x + Math.floor((displayWidth - width) / 2),
    y: y + Math.floor((displayHeight - height) / 2),
    width,
    height
  };
}

// Get backend port
const BACKEND_PORT = 3001;

async function createWindow() {
  // Start the embedded backend server
  const apiKeys = await secureStore.getApiKeys();
  backendServer = await startBackendServer({
    port: BACKEND_PORT,
    apiKeys,
  });

  // Create the browser window on SECONDARY monitor (for stealth during screen share)
  // User shares primary monitor, Ascend stays on secondary
  // Use 80% of screen dimensions
  const display = getSecondaryDisplay();
  const screenWidth = Math.floor(display.workArea.width * 0.8);
  const screenHeight = Math.floor(display.workArea.height * 0.8);
  const windowBounds = getSecondaryDisplayBounds(screenWidth, screenHeight);
  safeLog('[Stealth] Opening on secondary display at:', windowBounds.x, windowBounds.y);

  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    x: windowBounds.x,
    y: windowBounds.y,
    minWidth: 900,
    minHeight: 600,
    title: 'Ascend',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0a1a10',
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
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
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://donorbox.org https://cdnjs.cloudflare.com;" +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
          `connect-src 'self' http://localhost:${BACKEND_PORT} http://127.0.0.1:${BACKEND_PORT} ws://localhost:${BACKEND_PORT} ws://127.0.0.1:${BACKEND_PORT} https://*.lockedinai.com https://donorbox.org https://*.donorbox.org https://cdnjs.cloudflare.com;` +
          `img-src 'self' data: blob: http://localhost:${BACKEND_PORT} http://127.0.0.1:${BACKEND_PORT} https://*.lockedinai.com https://storage.googleapis.com https://*.appspot.com https://*.googleusercontent.com https://donorbox.org https://*.donorbox.org;` +
          "font-src 'self' data: https://fonts.gstatic.com;" +
          `frame-src 'self' http://localhost:${BACKEND_PORT} https://*.lockedinai.com https://app.lockedinai.com https://donorbox.org https://*.donorbox.org;`
        ]
      }
    });
  });

  // Grant media permissions for audio/video capture (Ascend Assistant)
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

  // Handle display media requests - show screen picker
  mainWindow.webContents.session.setDisplayMediaRequestHandler(async (request, callback) => {
    safeLog('[Electron] Display media request received');

    // Get available sources
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window']
    });

    safeLog('[Electron] Found sources:', sources.length);

    // For now, auto-select the entire screen (first source)
    // This captures everything including system audio on supported platforms
    if (sources.length > 0) {
      safeLog('[Electron] Selecting source:', sources[0].name);
      callback({ video: sources[0] });
    } else {
      safeLog('[Electron] No sources found');
      callback({});
    }
  });

  // Load the app
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

  // Load the app - use port 5173 to maintain localStorage origin consistency
  const FRONTEND_PORT = 5173;
  if (isDev) {
    // In development, load from Vite dev server
    safeLog('[Electron] Loading frontend from Vite dev server (http://localhost:' + FRONTEND_PORT + ')');
    await mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, start a static file server on the same port as dev
    // This ensures localStorage origin (localhost:5173) stays consistent
    const frontendDistPath = path.join(__dirname, '../frontend/dist');
    safeLog('[Electron] Starting frontend server from:', frontendDistPath);

    const express = (await import('express')).default;
    const frontendApp = express();

    // Serve static files
    frontendApp.use(express.static(frontendDistPath));

    // SPA fallback
    frontendApp.get('*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });

    // Start server
    const frontendServer = frontendApp.listen(FRONTEND_PORT, '127.0.0.1', () => {
      safeLog('[Electron] Frontend server running on http://localhost:' + FRONTEND_PORT);
    });

    // Store reference for cleanup
    mainWindow.frontendServer = frontendServer;

    await mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
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
    // Close the frontend server if it exists (production mode)
    if (mainWindow && mainWindow.frontendServer) {
      mainWindow.frontendServer.close();
    }
    mainWindow = null;
  });

  // STEALTH MODE: Enable content protection (hides from screen capture/recording)
  // This makes the window appear black in Zoom, Teams, screen recordings
  if (stealthModeEnabled) {
    mainWindow.setContentProtection(true);
    safeLog('[Stealth] Content protection enabled - window hidden from screen capture');
  }

  // Additional stealth: Hide from Mission Control and App Exposé on macOS
  if (process.platform === 'darwin') {
    mainWindow.setHiddenInMissionControl(true);
    safeLog('[Stealth] Hidden from Mission Control');
  }

  // Enable right-click context menu with copy/paste
  mainWindow.webContents.on('context-menu', (event, params) => {
    const { editFlags, isEditable, selectionText } = params;

    const menuTemplate = [];

    // Add cut/copy/paste based on context
    if (isEditable) {
      menuTemplate.push(
        { role: 'undo', enabled: editFlags.canUndo },
        { role: 'redo', enabled: editFlags.canRedo },
        { type: 'separator' },
        { role: 'cut', enabled: editFlags.canCut },
        { role: 'copy', enabled: editFlags.canCopy },
        { role: 'paste', enabled: editFlags.canPaste },
        { type: 'separator' },
        { role: 'selectAll', enabled: editFlags.canSelectAll }
      );
    } else if (selectionText) {
      // Text is selected but not in an editable field
      menuTemplate.push(
        { role: 'copy', enabled: editFlags.canCopy },
        { type: 'separator' },
        { role: 'selectAll' }
      );
    } else {
      // No selection, no editable - still show basic menu
      menuTemplate.push(
        { role: 'selectAll' },
        { type: 'separator' },
        { role: 'paste', enabled: editFlags.canPaste }
      );
    }

    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    contextMenu.popup({ window: mainWindow });
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
            shell.openExternal('https://github.com/your-repo/chundu#readme');
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/your-repo/chundu/issues');
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
  setupDeviceLicenseHandlers();

  // Check for first run
  const firstRun = await isFirstRun();

  // Create window and menu
  createAppMenu();
  await createWindow();

  // Start screen share monitor globally (runs even when window is destroyed)
  startScreenShareMonitor();
  safeLog('[Stealth] Screen share monitor started globally');

  // Set up account auth handlers (needs mainWindow)
  setupAccountAuthHandlers(mainWindow);

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

  // STEALTH MODE: Global hotkey to toggle window visibility (Cmd+Shift+H)
  // Stores window bounds before hiding for restoration
  let savedBounds = null;
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (mainWindow) {
      if (windowVisible) {
        // Save current position/size before hiding
        savedBounds = mainWindow.getBounds();
        // Move off-screen AND hide (belt and suspenders)
        mainWindow.setBounds({ x: -10000, y: -10000, width: 100, height: 100 });
        mainWindow.hide();
        windowVisible = false;
        safeLog('[Stealth] Window hidden and moved off-screen');
      } else {
        mainWindow.show();
        // Restore original position/size
        if (savedBounds) {
          mainWindow.setBounds(savedBounds);
        }
        mainWindow.focus();
        windowVisible = true;
        safeLog('[Stealth] Window restored');
      }
    }
  });

  // Register Cmd+Shift+S to toggle stealth mode (content protection)
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow) {
      stealthModeEnabled = !stealthModeEnabled;
      mainWindow.setContentProtection(stealthModeEnabled);
      safeLog('[Stealth] Content protection:', stealthModeEnabled ? 'ON' : 'OFF');
      // Notify renderer
      mainWindow.webContents.send('stealth-mode-changed', stealthModeEnabled);
    }
  });

  // Register Cmd+Shift+W for "work mode" - disable auto-hide for 60 seconds
  let workModeTimeout = null;
  globalShortcut.register('CommandOrControl+Shift+W', async () => {
    // Disable auto-hide
    autoHideEnabled = false;
    wasAutoHidden = false;

    // If window was destroyed, recreate it
    if (!mainWindow || windowDestroyed) {
      safeLog('[Stealth] WORK MODE: Recreating destroyed window...');
      await createWindowOnly();
      windowDestroyed = false;
    } else if (!windowVisible) {
      // Show window if just hidden
      mainWindow.show();
      if (savedBoundsGlobal) {
        mainWindow.setBounds(savedBoundsGlobal);
      }
      mainWindow.focus();
      windowVisible = true;
    }

    safeLog('[Stealth] WORK MODE: Auto-hide disabled for 60 seconds');

    // Clear any existing timeout
    if (workModeTimeout) {
      clearTimeout(workModeTimeout);
    }

    // Re-enable auto-hide after 60 seconds
    workModeTimeout = setTimeout(() => {
      autoHideEnabled = true;
      safeLog('[Stealth] Work mode ended - auto-hide re-enabled');
    }, 60000);
  });

  // macOS: Re-create window when dock icon is clicked, or show existing window
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // If backend server is already running (window was closed but app still running),
      // just create the window without restarting backend
      if (backendServer) {
        safeLog('[Electron] Recreating window (backend already running)');
        await createWindowOnly();
      } else {
        safeLog('[Electron] Creating new window and backend');
        await createWindow();
      }
    } else if (mainWindow) {
      // Show and focus the existing window
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
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
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();

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

// Open Ascend Prep in dedicated window
ipcMain.handle('open-ascend-prep', async () => {
  // If window already exists, focus it
  if (interviewPrepWindow && !interviewPrepWindow.isDestroyed()) {
    interviewPrepWindow.focus();
    return { success: true };
  }

  // Get screen dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Calculate window dimensions: 90% width, 90% height, centered
  const windowWidth = Math.floor(screenWidth * 0.9);
  const windowHeight = Math.floor(screenHeight * 0.9);
  const windowX = Math.floor((screenWidth - windowWidth) / 2);
  const windowY = Math.floor((screenHeight - windowHeight) / 2);

  // Create new window for Ascend Prep
  interviewPrepWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: windowX,
    y: windowY,
    minWidth: 800,
    minHeight: 300,
    title: 'Ascend Prep - Chundu',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#1f2937', // Dark background to match sidebar
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load the app with ascend-prep hash
  if (isDev) {
    await interviewPrepWindow.loadURL('http://localhost:5173/#ascend-prep');
  } else {
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    await interviewPrepWindow.loadFile(indexPath, { hash: 'ascend-prep' });
  }

  // Enable right-click context menu with copy/paste for Ascend Prep window
  interviewPrepWindow.webContents.on('context-menu', (event, params) => {
    const { editFlags, isEditable, selectionText } = params;

    const menuTemplate = [];

    if (isEditable) {
      menuTemplate.push(
        { role: 'undo', enabled: editFlags.canUndo },
        { role: 'redo', enabled: editFlags.canRedo },
        { type: 'separator' },
        { role: 'cut', enabled: editFlags.canCut },
        { role: 'copy', enabled: editFlags.canCopy },
        { role: 'paste', enabled: editFlags.canPaste },
        { type: 'separator' },
        { role: 'selectAll', enabled: editFlags.canSelectAll }
      );
    } else if (selectionText) {
      menuTemplate.push(
        { role: 'copy', enabled: editFlags.canCopy },
        { type: 'separator' },
        { role: 'selectAll' }
      );
    } else {
      // No selection, no editable - still show basic menu
      menuTemplate.push(
        { role: 'selectAll' },
        { type: 'separator' },
        { role: 'paste', enabled: editFlags.canPaste }
      );
    }

    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    contextMenu.popup({ window: interviewPrepWindow });
  });

  interviewPrepWindow.on('closed', () => {
    interviewPrepWindow = null;
  });

  return { success: true };
});

// Open Voice Assistant in dedicated window
ipcMain.handle('open-voice-assistant', async () => {
  // If window already exists, focus it
  if (voiceAssistantWindow && !voiceAssistantWindow.isDestroyed()) {
    voiceAssistantWindow.focus();
    return { success: true };
  }

  // Position next to main window on the SAME monitor
  const mainBounds = mainWindow ? mainWindow.getBounds() : { x: 100, y: 100, width: 1200, height: 800 };

  // Voice assistant window: 450px wide, same height as main window
  const windowWidth = 450;
  const windowHeight = mainBounds.height;
  const windowX = mainBounds.x + mainBounds.width + 10; // 10px gap to the right of main window
  const windowY = mainBounds.y;

  // Create new window for Voice Assistant
  voiceAssistantWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: windowX,
    y: windowY,
    minWidth: 400,
    minHeight: 500,
    title: 'Voice Assistant - Ascend',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0a1a10',
    alwaysOnTop: false, // Allow normal window management
    skipTaskbar: false, // Show in taskbar so both windows can be managed
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Grant media permissions for voice assistant window
  voiceAssistantWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'audioCapture', 'desktopCapture', 'mediaKeySystem'];
    if (allowedPermissions.includes(permission)) {
      safeLog('[VoiceAssistant] Granting permission:', permission);
      callback(true);
    } else {
      callback(false);
    }
  });

  // Handle display media requests for voice assistant window
  voiceAssistantWindow.webContents.session.setDisplayMediaRequestHandler(async (request, callback) => {
    safeLog('[VoiceAssistant] Display media request received');

    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window']
    });

    if (sources.length > 0) {
      safeLog('[VoiceAssistant] Selecting source:', sources[0].name);
      callback({ video: sources[0] });
    } else {
      callback({});
    }
  });

  // Apply stealth mode to voice assistant window too
  if (stealthModeEnabled) {
    voiceAssistantWindow.setContentProtection(true);
  }
  if (process.platform === 'darwin') {
    voiceAssistantWindow.setHiddenInMissionControl(true);
  }

  // Load the app with voice-assistant hash
  if (isDev) {
    await voiceAssistantWindow.loadURL('http://localhost:5173/#voice-assistant');
  } else {
    await voiceAssistantWindow.loadURL('http://localhost:5173/#voice-assistant');
  }

  // Enable right-click context menu
  voiceAssistantWindow.webContents.on('context-menu', (event, params) => {
    const { editFlags, isEditable, selectionText } = params;
    const menuTemplate = [];

    if (isEditable) {
      menuTemplate.push(
        { role: 'undo', enabled: editFlags.canUndo },
        { role: 'redo', enabled: editFlags.canRedo },
        { type: 'separator' },
        { role: 'cut', enabled: editFlags.canCut },
        { role: 'copy', enabled: editFlags.canCopy },
        { role: 'paste', enabled: editFlags.canPaste },
        { type: 'separator' },
        { role: 'selectAll', enabled: editFlags.canSelectAll }
      );
    } else if (selectionText) {
      menuTemplate.push(
        { role: 'copy', enabled: editFlags.canCopy },
        { type: 'separator' },
        { role: 'selectAll' }
      );
    } else {
      menuTemplate.push(
        { role: 'selectAll' },
        { type: 'separator' },
        { role: 'paste', enabled: editFlags.canPaste }
      );
    }

    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    contextMenu.popup({ window: voiceAssistantWindow });
  });

  voiceAssistantWindow.on('closed', () => {
    voiceAssistantWindow = null;
  });

  return { success: true };
});

// Stealth mode IPC handlers
ipcMain.handle('get-stealth-mode', () => {
  return stealthModeEnabled;
});

ipcMain.handle('set-stealth-mode', (event, enabled) => {
  stealthModeEnabled = enabled;
  if (mainWindow) {
    mainWindow.setContentProtection(enabled);
    safeLog('[Stealth] Content protection set to:', enabled);
    // Notify renderer of the change
    mainWindow.webContents.send('stealth-mode-changed', stealthModeEnabled);
  }
  return stealthModeEnabled;
});

ipcMain.handle('toggle-window-visibility', () => {
  if (mainWindow) {
    if (windowVisible) {
      mainWindow.hide();
      windowVisible = false;
    } else {
      mainWindow.show();
      mainWindow.focus();
      windowVisible = true;
    }
  }
  return windowVisible;
});

// System Design Sessions - stored in app data folder
ipcMain.handle('get-system-designs', () => {
  const sessions = systemDesignsStore.getAllSessions();
  safeLog('[SystemDesigns] Getting all sessions:', Object.keys(sessions).length, 'sessions');
  return sessions;
});

ipcMain.handle('save-system-design', (event, sessionId, sessionData) => {
  safeLog('[SystemDesigns] Saving session:', sessionId);
  return systemDesignsStore.saveSession(sessionId, sessionData);
});

ipcMain.handle('update-system-design', (event, sessionId, updates) => {
  return systemDesignsStore.updateSession(sessionId, updates);
});

ipcMain.handle('delete-system-design', (event, sessionId) => {
  return systemDesignsStore.deleteSession(sessionId);
});

ipcMain.handle('clear-all-system-designs', () => {
  return systemDesignsStore.clearAllSessions();
});

// Open HTML document viewer - loads document directly in Electron window
ipcMain.handle('open-document-viewer', async (event, documents) => {
  safeLog('[DocViewer] Opening with documents:', documents?.length || 0);

  if (documents && documents.length > 0) {
    const docsDir = path.join(app.getPath('userData'), 'documents');
    const filePath = path.join(docsDir, documents[0].name);

    if (fs.existsSync(filePath)) {
      const docWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        title: 'GCP Interview Guide',
        backgroundColor: '#0c0f14',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      safeLog('[DocViewer] Loading file:', filePath);
      await docWindow.loadFile(filePath);
    }
  }

  return true;
});

// LockedIn AI is now embedded via webview in the frontend - no separate window needed
