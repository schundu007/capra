/**
 * Device License Module
 * Handles device identification and license verification for desktop app
 */

import crypto from 'crypto';
import os from 'os';
import Store from 'electron-store';

const store = new Store({ name: 'device-license' });

/**
 * Generate a unique device ID based on hardware characteristics
 * This creates a persistent identifier for the machine
 */
export function generateDeviceId() {
  // Check if we already have a stored device ID
  const storedId = store.get('deviceId');
  if (storedId) {
    return storedId;
  }

  // Generate new device ID from hardware characteristics
  const components = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.cpus()[0]?.model || 'unknown',
    getNetworkId(),
    os.totalmem().toString(),
  ];

  const hash = crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex');

  // Take first 32 characters for a shorter ID
  const deviceId = `${os.platform()}-${hash.substring(0, 24)}`;

  // Store the device ID persistently
  store.set('deviceId', deviceId);

  return deviceId;
}

/**
 * Get a network-based identifier (first non-internal MAC address)
 */
function getNetworkId() {
  const interfaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      // Skip internal/loopback interfaces
      if (!addr.internal && addr.mac && addr.mac !== '00:00:00:00:00:00') {
        return addr.mac;
      }
    }
  }
  return 'no-mac';
}

/**
 * Get device information for registration
 */
export function getDeviceInfo() {
  return {
    deviceId: generateDeviceId(),
    deviceName: os.hostname(),
    devicePlatform: `${os.platform()}-${os.arch()}`,
    appVersion: process.env.npm_package_version || 'unknown',
  };
}

/**
 * Get license status from local cache
 */
export function getCachedLicense() {
  return store.get('licenseStatus', null);
}

/**
 * Cache license status locally
 * @param {Object} status - License status from server
 */
export function cacheLicenseStatus(status) {
  store.set('licenseStatus', {
    ...status,
    cachedAt: Date.now(),
  });
}

/**
 * Check if cached license is still valid (within 24 hours)
 */
export function isCachedLicenseValid() {
  const cached = getCachedLicense();
  if (!cached || !cached.cachedAt) {
    return false;
  }

  // Cache valid for 24 hours
  const cacheAge = Date.now() - cached.cachedAt;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  return cacheAge < maxAge && cached.valid;
}

/**
 * Clear cached license (e.g., on logout)
 */
export function clearCachedLicense() {
  store.delete('licenseStatus');
}

/**
 * Get stored user credentials for license verification
 */
export function getStoredCredentials() {
  return {
    accessToken: store.get('accessToken'),
    refreshToken: store.get('refreshToken'),
    userId: store.get('userId'),
  };
}

/**
 * Store user credentials after login
 */
export function storeCredentials(credentials) {
  if (credentials.accessToken) {
    store.set('accessToken', credentials.accessToken);
  }
  if (credentials.refreshToken) {
    store.set('refreshToken', credentials.refreshToken);
  }
  if (credentials.userId) {
    store.set('userId', credentials.userId);
  }
}

/**
 * Clear all stored credentials on logout
 */
export function clearCredentials() {
  store.delete('accessToken');
  store.delete('refreshToken');
  store.delete('userId');
  clearCachedLicense();
}
