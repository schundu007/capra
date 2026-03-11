/**
 * Request Signing Utility
 *
 * Provides HMAC-SHA256 request signing for Electron app requests.
 * This adds an extra layer of security beyond device ID validation.
 */

import crypto from 'crypto';

// Request signing parameters
const SIGNATURE_HEADER = 'x-request-signature';
const TIMESTAMP_HEADER = 'x-request-timestamp';
const NONCE_HEADER = 'x-request-nonce';
const SIGNATURE_VERSION = 'v1';

// Max age for signed requests (5 minutes)
const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;

// Set of recently used nonces to prevent replay attacks
const usedNonces = new Set();
const NONCE_CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

// Clean up old nonces periodically
setInterval(() => {
  usedNonces.clear();
}, NONCE_CLEANUP_INTERVAL);

/**
 * Generate a signing key from device ID and a secret
 * In production, this should use a more secure key derivation
 */
export function deriveSigningKey(deviceId, secret = process.env.ELECTRON_SIGNING_SECRET || 'chundu-default-secret') {
  return crypto
    .createHmac('sha256', secret)
    .update(deviceId)
    .digest('hex');
}

/**
 * Create a signature for a request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {string} body - Request body (stringified JSON)
 * @param {string} timestamp - ISO timestamp
 * @param {string} nonce - Unique nonce
 * @param {string} signingKey - Derived signing key
 * @returns {string} HMAC signature
 */
export function createSignature(method, path, body, timestamp, nonce, signingKey) {
  const payload = `${SIGNATURE_VERSION}:${method}:${path}:${timestamp}:${nonce}:${body}`;
  return crypto
    .createHmac('sha256', signingKey)
    .update(payload)
    .digest('hex');
}

/**
 * Verify a request signature
 * @param {Object} req - Express request object
 * @param {string} signingKey - Derived signing key
 * @returns {Object} Verification result
 */
export function verifyRequestSignature(req, signingKey) {
  const signature = req.headers[SIGNATURE_HEADER];
  const timestamp = req.headers[TIMESTAMP_HEADER];
  const nonce = req.headers[NONCE_HEADER];

  // Check if all required headers are present
  if (!signature || !timestamp || !nonce) {
    return {
      valid: false,
      error: 'Missing signature headers',
    };
  }

  // Verify timestamp is not too old
  const requestTime = new Date(timestamp).getTime();
  const now = Date.now();

  if (isNaN(requestTime)) {
    return {
      valid: false,
      error: 'Invalid timestamp format',
    };
  }

  if (now - requestTime > MAX_REQUEST_AGE_MS) {
    return {
      valid: false,
      error: 'Request too old',
    };
  }

  if (requestTime > now + 60000) { // Allow 1 minute clock skew
    return {
      valid: false,
      error: 'Request timestamp in future',
    };
  }

  // Check for replay attacks
  if (usedNonces.has(nonce)) {
    return {
      valid: false,
      error: 'Nonce already used (replay attack)',
    };
  }

  // Generate expected signature
  const body = JSON.stringify(req.body) || '';
  const expectedSignature = createSignature(
    req.method,
    req.path,
    body,
    timestamp,
    nonce,
    signingKey
  );

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return {
      valid: false,
      error: 'Invalid signature length',
    };
  }

  const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (isValid) {
    // Mark nonce as used
    usedNonces.add(nonce);
  }

  return {
    valid: isValid,
    error: isValid ? null : 'Invalid signature',
  };
}

/**
 * Generate a nonce for request signing
 * @returns {string} Random nonce
 */
export function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Middleware to verify signed requests from Electron
 * Only applied to routes that require signed requests
 */
export function requireSignedRequest(req, res, next) {
  const deviceId = req.headers['x-device-id'];

  if (!deviceId) {
    return res.status(401).json({
      error: 'Device ID required',
      code: 'MISSING_DEVICE_ID',
    });
  }

  const signingKey = deriveSigningKey(deviceId);
  const result = verifyRequestSignature(req, signingKey);

  if (!result.valid) {
    return res.status(401).json({
      error: result.error,
      code: 'INVALID_SIGNATURE',
    });
  }

  next();
}

export default {
  deriveSigningKey,
  createSignature,
  verifyRequestSignature,
  generateNonce,
  requireSignedRequest,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  NONCE_HEADER,
};
