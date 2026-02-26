import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth.js';
import * as deviceLicenseService from '../services/deviceLicenseService.js';
import { logger } from '../middleware/requestLogger.js';

const router = Router();

/**
 * Verify device license
 * POST /api/device/verify
 * Checks if the device is registered and has a valid subscription
 */
router.post('/verify', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId, deviceName, devicePlatform, appVersion } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    logger.info({ userId, deviceId, devicePlatform }, 'Device license verification request');

    const result = await deviceLicenseService.verifyDeviceLicense(userId, deviceId);

    if (!result.valid) {
      logger.warn({ userId, deviceId, reason: result.reason }, 'Device license verification failed');
      return res.status(403).json(result);
    }

    logger.info({ userId, deviceId, newDevice: result.newDevice }, 'Device license verified');
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Device verification error');
    res.status(500).json({ error: 'Failed to verify device license' });
  }
});

/**
 * Register a new device
 * POST /api/device/register
 */
router.post('/register', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId, deviceName, devicePlatform, appVersion } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    logger.info({ userId, deviceId, deviceName, devicePlatform }, 'Device registration request');

    const result = await deviceLicenseService.registerDevice(userId, deviceId, {
      deviceName,
      devicePlatform,
      appVersion
    });

    if (!result.success) {
      logger.warn({ userId, deviceId, error: result.error }, 'Device registration failed');
      return res.status(403).json(result);
    }

    logger.info({ userId, deviceId, isNewDevice: result.isNewDevice }, 'Device registered');
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Device registration error');
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * Deactivate a device
 * POST /api/device/deactivate
 */
router.post('/deactivate', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId, reason } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    logger.info({ userId, deviceId, reason }, 'Device deactivation request');

    const success = await deviceLicenseService.deactivateDevice(userId, deviceId, reason);

    if (!success) {
      return res.status(404).json({ error: 'Device not found or already deactivated' });
    }

    logger.info({ userId, deviceId }, 'Device deactivated');
    res.json({ success: true });
  } catch (error) {
    logger.error({ error: error.message }, 'Device deactivation error');
    res.status(500).json({ error: 'Failed to deactivate device' });
  }
});

/**
 * Get all devices for user
 * GET /api/device/list
 */
router.get('/list', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const devices = await deviceLicenseService.getUserDevices(userId);

    res.json({ devices });
  } catch (error) {
    logger.error({ error: error.message }, 'Device list error');
    res.status(500).json({ error: 'Failed to get device list' });
  }
});

export default router;
