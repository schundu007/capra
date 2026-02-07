import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { app, dialog, BrowserWindow } from 'electron';

// Safe logging that ignores EPIPE errors
function safeLog(...args) {
  try {
    console.log(...args);
  } catch {
    // Ignore EPIPE and other write errors
  }
}

function safeError(...args) {
  try {
    console.error(...args);
  } catch {
    // Ignore EPIPE and other write errors
  }
}

// Create a safe logger object for electron-updater
const safeLogger = {
  info: safeLog,
  warn: safeLog,
  error: safeError,
  debug: safeLog,
};

// Configure logging
autoUpdater.logger = safeLogger;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let updateAvailable = false;

/**
 * Initialize auto-updater
 * @param {BrowserWindow} mainWindow - The main application window
 */
export function initAutoUpdater(mainWindow) {
  // Only check for updates in packaged app
  if (!app.isPackaged) {
    safeLog('[AutoUpdater] Skipping update check in development mode');
    return;
  }

  // Check for updates on startup
  autoUpdater.checkForUpdates().catch((err) => {
    safeError('[AutoUpdater] Error checking for updates:', err.message);
  });

  // Update available
  autoUpdater.on('update-available', (info) => {
    safeLog('[AutoUpdater] Update available:', info.version);
    updateAvailable = true;

    // Notify renderer
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
    });

    // Show dialog
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available.`,
      detail: 'Would you like to download it now?',
      buttons: ['Download', 'Later'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  // No update available
  autoUpdater.on('update-not-available', () => {
    safeLog('[AutoUpdater] No update available');
  });

  // Download progress
  autoUpdater.on('download-progress', (progress) => {
    safeLog(`[AutoUpdater] Download progress: ${progress.percent.toFixed(1)}%`);
    mainWindow?.webContents.send('update-download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    safeLog('[AutoUpdater] Update downloaded:', info.version);

    // Notify renderer
    mainWindow?.webContents.send('update-downloaded', {
      version: info.version,
    });

    // Show dialog
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully.',
      detail: 'The update will be installed when you restart Capra.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Error
  autoUpdater.on('error', (err) => {
    safeError('[AutoUpdater] Error:', err.message);
    mainWindow?.webContents.send('update-error', {
      error: err.message,
    });
  });
}

/**
 * Manually check for updates
 */
export async function checkForUpdates() {
  if (!app.isPackaged) {
    return { updateAvailable: false, message: 'Updates disabled in development' };
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      updateAvailable: !!result?.updateInfo,
      version: result?.updateInfo?.version,
    };
  } catch (err) {
    return { updateAvailable: false, error: err.message };
  }
}

/**
 * Download the available update
 */
export function downloadUpdate() {
  if (updateAvailable) {
    autoUpdater.downloadUpdate();
  }
}

/**
 * Install the downloaded update
 */
export function installUpdate() {
  autoUpdater.quitAndInstall();
}

export default {
  initAutoUpdater,
  checkForUpdates,
  downloadUpdate,
  installUpdate,
};
