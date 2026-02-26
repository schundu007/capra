/**
 * Device License IPC Handlers
 * Handles device license verification and management
 */

import { ipcMain } from 'electron';
import fetch from 'node-fetch';
import * as deviceLicense from '../store/device-license.js';

// API URL for license verification (Railway backend)
const API_BASE_URL = process.env.VITE_API_URL || 'https://capra-backend.up.railway.app';

/**
 * Setup device license IPC handlers
 */
export function setupDeviceLicenseHandlers() {
  // Get device information
  ipcMain.handle('get-device-info', async () => {
    return deviceLicense.getDeviceInfo();
  });

  // Verify device license with backend
  ipcMain.handle('verify-device-license', async (event, token) => {
    try {
      const deviceInfo = deviceLicense.getDeviceInfo();

      // Check if we have a valid cached license (for offline use)
      if (deviceLicense.isCachedLicenseValid()) {
        console.log('[DeviceLicense] Using cached license');
        return {
          valid: true,
          cached: true,
          ...deviceLicense.getCachedLicense(),
        };
      }

      // Verify with backend
      const response = await fetch(`${API_BASE_URL}/api/device/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Electron-App': 'true',
        },
        body: JSON.stringify(deviceInfo),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        // Cache the valid license
        deviceLicense.cacheLicenseStatus(result);
        console.log('[DeviceLicense] License verified and cached');
        return result;
      }

      // Clear cached license if verification fails
      deviceLicense.clearCachedLicense();
      console.log('[DeviceLicense] License verification failed:', result);
      return result;
    } catch (error) {
      console.error('[DeviceLicense] Verification error:', error);

      // If offline, allow using cached license
      if (deviceLicense.isCachedLicenseValid()) {
        console.log('[DeviceLicense] Offline - using cached license');
        return {
          valid: true,
          cached: true,
          offline: true,
          ...deviceLicense.getCachedLicense(),
        };
      }

      return {
        valid: false,
        reason: 'error',
        message: 'Unable to verify license. Please check your internet connection.',
        error: error.message,
      };
    }
  });

  // Get cached license status
  ipcMain.handle('get-license-status', async () => {
    const cached = deviceLicense.getCachedLicense();
    const isValid = deviceLicense.isCachedLicenseValid();

    return {
      cached: !!cached,
      valid: isValid,
      status: cached,
    };
  });

  // Clear license cache (e.g., on logout)
  ipcMain.handle('clear-license-cache', async () => {
    deviceLicense.clearCachedLicense();
    console.log('[DeviceLicense] Cache cleared');
    return true;
  });
}

/**
 * Verify license on app startup
 * @param {BrowserWindow} mainWindow - Main browser window
 * @param {string} token - JWT access token
 */
export async function verifyOnStartup(mainWindow, token) {
  if (!token) {
    console.log('[DeviceLicense] No token provided, skipping startup verification');
    return;
  }

  try {
    const deviceInfo = deviceLicense.getDeviceInfo();
    console.log('[DeviceLicense] Verifying on startup:', deviceInfo.deviceId);

    const response = await fetch(`${API_BASE_URL}/api/device/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Electron-App': 'true',
      },
      body: JSON.stringify(deviceInfo),
    });

    const result = await response.json();

    if (response.ok && result.valid) {
      deviceLicense.cacheLicenseStatus(result);
      mainWindow.webContents.send('license-status-changed', { valid: true, ...result });
    } else {
      deviceLicense.clearCachedLicense();
      mainWindow.webContents.send('license-status-changed', {
        valid: false,
        ...result,
      });
    }
  } catch (error) {
    console.error('[DeviceLicense] Startup verification error:', error);
    // Don't block app if offline but have valid cache
    if (deviceLicense.isCachedLicenseValid()) {
      mainWindow.webContents.send('license-status-changed', {
        valid: true,
        cached: true,
        offline: true,
      });
    }
  }
}
