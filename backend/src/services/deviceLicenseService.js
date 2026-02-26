import { query } from '../config/database.js';

/**
 * Check if a device is registered and active for a user
 * @param {number} userId - User ID
 * @param {string} deviceId - Unique device identifier
 * @returns {Promise<Object>} - Device registration status
 */
export async function isDeviceRegistered(userId, deviceId) {
  try {
    const result = await query(
      'SELECT ascend_is_device_registered($1, $2) as result',
      [userId, deviceId]
    );

    return result.rows[0]?.result || { registered: false };
  } catch (error) {
    console.error('Error checking device registration:', error);
    return { registered: false, error: error.message };
  }
}

/**
 * Register a device for a user
 * @param {number} userId - User ID
 * @param {string} deviceId - Unique device identifier
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<Object>} - Registration result
 */
export async function registerDevice(userId, deviceId, deviceInfo = {}) {
  try {
    const { deviceName, devicePlatform, appVersion } = deviceInfo;

    const result = await query(
      'SELECT ascend_register_device($1, $2, $3, $4, $5) as result',
      [userId, deviceId, deviceName || null, devicePlatform || null, appVersion || null]
    );

    return result.rows[0]?.result || { success: false, error: 'Unknown error' };
  } catch (error) {
    console.error('Error registering device:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deactivate a device
 * @param {number} userId - User ID
 * @param {string} deviceId - Device to deactivate
 * @param {string} reason - Reason for deactivation
 * @returns {Promise<boolean>} - Whether deactivation was successful
 */
export async function deactivateDevice(userId, deviceId, reason = 'User requested') {
  try {
    const result = await query(
      'SELECT ascend_deactivate_device($1, $2, $3) as success',
      [userId, deviceId, reason]
    );

    return result.rows[0]?.success || false;
  } catch (error) {
    console.error('Error deactivating device:', error);
    return false;
  }
}

/**
 * Get all devices for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - List of devices
 */
export async function getUserDevices(userId) {
  try {
    const result = await query(
      `SELECT
        device_id,
        device_name,
        device_platform,
        app_version,
        is_active,
        registered_at,
        last_seen_at
       FROM ascend_device_licenses
       WHERE user_id = $1
       ORDER BY last_seen_at DESC`,
      [userId]
    );

    return result.rows || [];
  } catch (error) {
    console.error('Error getting user devices:', error);
    return [];
  }
}

/**
 * Deactivate all devices for a user (e.g., when subscription cancelled)
 * @param {number} userId - User ID
 * @param {string} reason - Reason for deactivation
 * @returns {Promise<number>} - Number of devices deactivated
 */
export async function deactivateAllDevices(userId, reason = 'Subscription cancelled') {
  try {
    const result = await query(
      'SELECT ascend_deactivate_all_devices($1, $2) as count',
      [userId, reason]
    );

    return result.rows[0]?.count || 0;
  } catch (error) {
    console.error('Error deactivating all devices:', error);
    return 0;
  }
}

/**
 * Verify device has valid license (subscription check + device check)
 * @param {number} userId - User ID
 * @param {string} deviceId - Device identifier
 * @returns {Promise<Object>} - License verification result
 */
export async function verifyDeviceLicense(userId, deviceId) {
  try {
    // Check subscription status
    const subResult = await query(
      'SELECT plan_type, status FROM ascend_subscriptions WHERE user_id = $1',
      [userId]
    );

    const subscription = subResult.rows[0];

    // Check for desktop_lifetime plan
    const hasDesktopLicense = subscription?.plan_type === 'desktop_lifetime';
    const hasPaidPlan = subscription?.plan_type === 'monthly' ||
                        subscription?.plan_type === 'quarterly_pro';
    const isActive = subscription?.status === 'active';

    if (!hasDesktopLicense && (!hasPaidPlan || !isActive)) {
      return {
        valid: false,
        reason: 'no_subscription',
        message: 'No active subscription found. Please subscribe to use the desktop app.',
        planType: subscription?.plan_type || 'free',
        status: subscription?.status || 'none'
      };
    }

    // Check device registration
    const deviceStatus = await isDeviceRegistered(userId, deviceId);

    if (!deviceStatus.registered) {
      // Try to register the device
      const registerResult = await registerDevice(userId, deviceId, {
        deviceName: 'Auto-registered',
        devicePlatform: process.platform,
        appVersion: process.env.npm_package_version
      });

      if (!registerResult.success) {
        return {
          valid: false,
          reason: registerResult.error,
          message: registerResult.message || 'Unable to register this device.',
          activeDevices: registerResult.activeDevices,
          deviceLimit: registerResult.deviceLimit
        };
      }

      return {
        valid: true,
        newDevice: true,
        deviceId,
        planType: subscription.plan_type
      };
    }

    if (!deviceStatus.active) {
      return {
        valid: false,
        reason: 'device_deactivated',
        message: 'This device has been deactivated.',
        deactivatedAt: deviceStatus.deactivatedAt,
        deactivationReason: deviceStatus.reason
      };
    }

    return {
      valid: true,
      deviceId,
      deviceName: deviceStatus.deviceName,
      registeredAt: deviceStatus.registeredAt,
      planType: subscription.plan_type
    };
  } catch (error) {
    console.error('Error verifying device license:', error);
    return {
      valid: false,
      reason: 'error',
      message: 'Error verifying device license: ' + error.message
    };
  }
}
