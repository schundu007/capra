/**
 * Auth Headers Utility
 *
 * Centralized function for generating authentication headers
 * Works for both Electron and webapp environments
 */

// Cached device ID for Electron
let cachedDeviceId = null;
let deviceIdPromise = null;

/**
 * Initialize device ID (call once on app startup)
 */
export async function initDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;

  if (window.electronAPI?.isElectron && window.electronAPI.getDeviceInfo) {
    if (deviceIdPromise) return deviceIdPromise;

    deviceIdPromise = window.electronAPI.getDeviceInfo()
      .then(deviceInfo => {
        if (deviceInfo?.deviceId) {
          cachedDeviceId = deviceInfo.deviceId;
          // Also store in sessionStorage for cross-component access
          try {
            sessionStorage.setItem('chundu_device_id', cachedDeviceId);
          } catch (e) {
            // Ignore storage errors
          }
          console.log('[Auth] Device ID initialized:', cachedDeviceId?.substring(0, 15) + '...');
        }
        return cachedDeviceId;
      })
      .catch(err => {
        console.error('[Auth] Failed to get device ID:', err);
        return null;
      });

    return deviceIdPromise;
  }
  return null;
}

/**
 * Get device ID (sync version - returns cached or stored value)
 */
export function getDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;

  // Try to get from sessionStorage (set by init)
  try {
    const stored = sessionStorage.getItem('chundu_device_id');
    if (stored) {
      cachedDeviceId = stored;
      return stored;
    }
  } catch (e) {
    // Ignore storage errors
  }

  return null;
}

/**
 * Get auth token from storage
 * Supports both old format (chundu_token) and new OAuth format (ascend_auth)
 */
export function getToken() {
  // For Electron, try to get auth token from Electron API
  if (window.electronAPI?.isElectron && window.electronAPI.getAuthToken) {
    // Note: This is async, prefer using the cached token
    return localStorage.getItem('chundu_token');
  }

  // Try new OAuth format first (ascend_auth)
  try {
    const authData = localStorage.getItem('ascend_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.accessToken) {
        return parsed.accessToken;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  // Fall back to old format
  return localStorage.getItem('chundu_token');
}

/**
 * Get authentication headers for API requests
 * Includes authorization token and Electron device identification
 */
export function getAuthHeaders() {
  const headers = {};

  // Add auth token if available
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add Electron headers
  if (window.electronAPI?.isElectron) {
    headers['X-Electron-App'] = 'true';

    // Add device ID for security
    const deviceId = getDeviceId();
    if (deviceId) {
      headers['X-Device-Id'] = deviceId;
    }
  }

  return headers;
}

export default getAuthHeaders;
