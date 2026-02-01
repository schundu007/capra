import { ipcMain } from 'electron';
import { secureStore } from '../store/secure-store.js';
import { updateRuntimeApiKeys } from '../backend-server.js';

/**
 * Validate an API key by making a test request
 */
async function validateAnthropicKey(key) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    // 401 = invalid key, 429 = rate limited (valid key)
    // 200 = valid, but we'll get a response
    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function validateOpenAIKey(key) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Set up IPC handlers for API key management
 */
export function setupApiKeyHandlers() {
  // Get stored API keys (masked for display)
  ipcMain.handle('get-api-keys', async () => {
    const keys = await secureStore.getApiKeys();
    return {
      anthropic: keys.anthropic ? maskKey(keys.anthropic) : null,
      openai: keys.openai ? maskKey(keys.openai) : null,
      hasAnthropic: !!keys.anthropic,
      hasOpenai: !!keys.openai,
    };
  });

  // Store API keys
  ipcMain.handle('set-api-keys', async (event, keys) => {
    // Only store non-null values
    const toStore = {};
    if (keys.anthropic !== undefined) {
      toStore.anthropic = keys.anthropic;
    }
    if (keys.openai !== undefined) {
      toStore.openai = keys.openai;
    }

    await secureStore.setApiKeys(toStore);

    // Update runtime keys in backend server
    const stored = await secureStore.getApiKeys();
    updateRuntimeApiKeys(stored);

    // Return the current state
    return {
      anthropic: stored.anthropic ? maskKey(stored.anthropic) : null,
      openai: stored.openai ? maskKey(stored.openai) : null,
      hasAnthropic: !!stored.anthropic,
      hasOpenai: !!stored.openai,
    };
  });

  // Validate a specific API key
  ipcMain.handle('validate-api-key', async (event, provider, key) => {
    if (provider === 'anthropic' || provider === 'claude') {
      return validateAnthropicKey(key);
    }
    if (provider === 'openai' || provider === 'gpt') {
      return validateOpenAIKey(key);
    }
    return { valid: false, error: 'Unknown provider' };
  });

  // Delete a specific API key
  ipcMain.handle('delete-api-key', async (event, provider) => {
    await secureStore.deleteApiKey(provider);
    return true;
  });
}

/**
 * Mask an API key for display (show first and last 4 chars)
 */
function maskKey(key) {
  if (!key || key.length < 12) return '****';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}
