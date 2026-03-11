import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  deriveSigningKey,
  createSignature,
  verifyRequestSignature,
  generateNonce,
} from './requestSigning.js';

describe('requestSigning', () => {
  describe('deriveSigningKey', () => {
    it('should generate consistent keys for the same device ID', () => {
      const deviceId = 'darwin-abc123def456789012345678';
      const key1 = deriveSigningKey(deviceId, 'test-secret');
      const key2 = deriveSigningKey(deviceId, 'test-secret');

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different device IDs', () => {
      const key1 = deriveSigningKey('darwin-abc123def456789012345678', 'test-secret');
      const key2 = deriveSigningKey('darwin-xyz123def456789012345678', 'test-secret');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different secrets', () => {
      const deviceId = 'darwin-abc123def456789012345678';
      const key1 = deriveSigningKey(deviceId, 'secret1');
      const key2 = deriveSigningKey(deviceId, 'secret2');

      expect(key1).not.toBe(key2);
    });

    it('should return a hex string', () => {
      const key = deriveSigningKey('darwin-abc123def456789012345678');
      expect(key).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('createSignature', () => {
    const signingKey = deriveSigningKey('darwin-abc123def456789012345678', 'test-secret');

    it('should create consistent signatures for the same input', () => {
      const timestamp = '2024-01-01T00:00:00.000Z';
      const nonce = 'test-nonce';

      const sig1 = createSignature('POST', '/api/solve', '{"test":true}', timestamp, nonce, signingKey);
      const sig2 = createSignature('POST', '/api/solve', '{"test":true}', timestamp, nonce, signingKey);

      expect(sig1).toBe(sig2);
    });

    it('should create different signatures for different methods', () => {
      const timestamp = '2024-01-01T00:00:00.000Z';
      const nonce = 'test-nonce';

      const sigPost = createSignature('POST', '/api/solve', '{}', timestamp, nonce, signingKey);
      const sigGet = createSignature('GET', '/api/solve', '{}', timestamp, nonce, signingKey);

      expect(sigPost).not.toBe(sigGet);
    });

    it('should create different signatures for different paths', () => {
      const timestamp = '2024-01-01T00:00:00.000Z';
      const nonce = 'test-nonce';

      const sig1 = createSignature('POST', '/api/solve', '{}', timestamp, nonce, signingKey);
      const sig2 = createSignature('POST', '/api/fetch', '{}', timestamp, nonce, signingKey);

      expect(sig1).not.toBe(sig2);
    });

    it('should create different signatures for different bodies', () => {
      const timestamp = '2024-01-01T00:00:00.000Z';
      const nonce = 'test-nonce';

      const sig1 = createSignature('POST', '/api/solve', '{"a":1}', timestamp, nonce, signingKey);
      const sig2 = createSignature('POST', '/api/solve', '{"b":2}', timestamp, nonce, signingKey);

      expect(sig1).not.toBe(sig2);
    });

    it('should return a hex string', () => {
      const sig = createSignature('POST', '/api/test', '{}', new Date().toISOString(), 'nonce', signingKey);
      expect(sig).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('generateNonce', () => {
    it('should generate unique nonces', () => {
      const nonces = new Set();
      for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce());
      }
      expect(nonces.size).toBe(100);
    });

    it('should return a hex string', () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[a-f0-9]+$/);
    });

    it('should have sufficient length (32 chars = 16 bytes)', () => {
      const nonce = generateNonce();
      expect(nonce.length).toBe(32);
    });
  });

  describe('verifyRequestSignature', () => {
    const deviceId = 'darwin-abc123def456789012345678';
    const signingKey = deriveSigningKey(deviceId, 'test-secret');

    const createMockRequest = (method, path, body, timestamp, nonce, signature) => ({
      method,
      path,
      body,
      headers: {
        'x-request-signature': signature,
        'x-request-timestamp': timestamp,
        'x-request-nonce': nonce,
      },
    });

    it('should verify valid signature', () => {
      const timestamp = new Date().toISOString();
      const nonce = generateNonce();
      const body = { test: true };
      const bodyStr = JSON.stringify(body);

      const signature = createSignature('POST', '/api/test', bodyStr, timestamp, nonce, signingKey);

      const req = createMockRequest('POST', '/api/test', body, timestamp, nonce, signature);
      const result = verifyRequestSignature(req, signingKey);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject missing signature header', () => {
      const req = {
        method: 'POST',
        path: '/api/test',
        body: {},
        headers: {
          'x-request-timestamp': new Date().toISOString(),
          'x-request-nonce': 'test-nonce',
        },
      };

      const result = verifyRequestSignature(req, signingKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing signature headers');
    });

    it('should reject missing timestamp header', () => {
      const req = {
        method: 'POST',
        path: '/api/test',
        body: {},
        headers: {
          'x-request-signature': 'fake-signature',
          'x-request-nonce': 'test-nonce',
        },
      };

      const result = verifyRequestSignature(req, signingKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing signature headers');
    });

    it('should reject requests that are too old', () => {
      const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      const nonce = generateNonce();
      const body = {};
      const bodyStr = JSON.stringify(body);

      const signature = createSignature('POST', '/api/test', bodyStr, oldTimestamp, nonce, signingKey);

      const req = createMockRequest('POST', '/api/test', body, oldTimestamp, nonce, signature);
      const result = verifyRequestSignature(req, signingKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request too old');
    });

    it('should reject requests with future timestamps', () => {
      const futureTimestamp = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes in future
      const nonce = generateNonce();
      const body = {};
      const bodyStr = JSON.stringify(body);

      const signature = createSignature('POST', '/api/test', bodyStr, futureTimestamp, nonce, signingKey);

      const req = createMockRequest('POST', '/api/test', body, futureTimestamp, nonce, signature);
      const result = verifyRequestSignature(req, signingKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request timestamp in future');
    });

    it('should reject invalid timestamp format', () => {
      const req = createMockRequest('POST', '/api/test', {}, 'not-a-date', 'nonce', 'signature');
      const result = verifyRequestSignature(req, signingKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid timestamp format');
    });

    it('should reject tampered body', () => {
      const timestamp = new Date().toISOString();
      const nonce = generateNonce();
      const originalBody = { original: true };
      const tamperedBody = { tampered: true };

      const signature = createSignature('POST', '/api/test', JSON.stringify(originalBody), timestamp, nonce, signingKey);

      const req = createMockRequest('POST', '/api/test', tamperedBody, timestamp, nonce, signature);
      const result = verifyRequestSignature(req, signingKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('should reject replay attacks (same nonce used twice)', () => {
      const timestamp = new Date().toISOString();
      const nonce = generateNonce();
      const body = {};
      const bodyStr = JSON.stringify(body);

      const signature = createSignature('POST', '/api/test', bodyStr, timestamp, nonce, signingKey);

      const req = createMockRequest('POST', '/api/test', body, timestamp, nonce, signature);

      // First request should succeed
      const result1 = verifyRequestSignature(req, signingKey);
      expect(result1.valid).toBe(true);

      // Same nonce used again should fail
      const result2 = verifyRequestSignature(req, signingKey);
      expect(result2.valid).toBe(false);
      expect(result2.error).toBe('Nonce already used (replay attack)');
    });
  });
});
