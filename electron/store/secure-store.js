import { safeStorage } from 'electron';
import Store from 'electron-store';

// Safe logging that ignores EPIPE errors
function safeWarn(...args) {
  try {
    console.warn(...args);
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

// Encrypted storage for sensitive data (API keys)
// Uses Electron's safeStorage which leverages the OS keychain
const encryptedStore = new Store({
  name: 'secure',
  encryptionKey: 'capra-secure-store', // This is just for obfuscation, actual security comes from safeStorage
});

/**
 * Encrypt a string using OS-level encryption
 */
function encrypt(text) {
  if (!text) return null;
  if (!safeStorage.isEncryptionAvailable()) {
    safeWarn('[SecureStore] Encryption not available, storing as plain text');
    return text;
  }
  const buffer = safeStorage.encryptString(text);
  return buffer.toString('base64');
}

/**
 * Decrypt a string using OS-level encryption
 */
function decrypt(encryptedBase64) {
  if (!encryptedBase64) return null;
  if (!safeStorage.isEncryptionAvailable()) {
    safeWarn('[SecureStore] Encryption not available, reading as plain text');
    return encryptedBase64;
  }
  try {
    const buffer = Buffer.from(encryptedBase64, 'base64');
    return safeStorage.decryptString(buffer);
  } catch (err) {
    safeError('[SecureStore] Failed to decrypt:', err.message);
    return null;
  }
}

export const secureStore = {
  /**
   * Get all stored API keys (decrypted)
   */
  async getApiKeys() {
    const encrypted = encryptedStore.get('apiKeys', {});
    return {
      anthropic: decrypt(encrypted.anthropic),
      openai: decrypt(encrypted.openai),
    };
  },

  /**
   * Store API keys (encrypted)
   */
  async setApiKeys(keys) {
    const encrypted = {};
    if (keys.anthropic !== undefined) {
      encrypted.anthropic = encrypt(keys.anthropic);
    }
    if (keys.openai !== undefined) {
      encrypted.openai = encrypt(keys.openai);
    }

    // Merge with existing keys
    const existing = encryptedStore.get('apiKeys', {});
    encryptedStore.set('apiKeys', { ...existing, ...encrypted });
  },

  /**
   * Delete a specific API key
   */
  async deleteApiKey(provider) {
    const existing = encryptedStore.get('apiKeys', {});
    delete existing[provider];
    encryptedStore.set('apiKeys', existing);
  },

  /**
   * Clear all stored API keys
   */
  async clearApiKeys() {
    encryptedStore.delete('apiKeys');
  },

  /**
   * Check if encryption is available
   */
  isEncryptionAvailable() {
    return safeStorage.isEncryptionAvailable();
  },
};

export default secureStore;
