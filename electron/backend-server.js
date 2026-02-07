import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';

// Import services to set API keys
import * as claudeService from '../backend/src/services/claude.js';
import * as openaiService from '../backend/src/services/openai.js';

// Safe logging that ignores EPIPE errors (happens when pipe closes during shutdown)
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

/**
 * Update runtime API keys in the services
 */
export function updateRuntimeApiKeys(keys) {
  safeLog('[Electron] Updating runtime API keys:', {
    hasAnthropic: !!keys.anthropic,
    hasOpenai: !!keys.openai,
  });
  if (keys.anthropic !== undefined) {
    claudeService.setApiKey(keys.anthropic);
    safeLog('[Electron] Anthropic key set, current:', !!claudeService.getApiKey());
  }
  if (keys.openai !== undefined) {
    openaiService.setApiKey(keys.openai);
    safeLog('[Electron] OpenAI key set, current:', !!openaiService.getApiKey());
  }
}

/**
 * Get API key for a provider
 */
export function getApiKey(provider) {
  if (provider === 'claude' || provider === 'anthropic') {
    return claudeService.getApiKey();
  }
  if (provider === 'openai' || provider === 'gpt') {
    return openaiService.getApiKey();
  }
  return null;
}

// Store platform cookies for authenticated scraping
const platformCookies = {};

/**
 * Set cookies for a platform
 */
export function setPlatformCookies(platform, cookies) {
  if (cookies) {
    platformCookies[platform] = cookies;
    safeLog(`[Electron] Set cookies for ${platform}`);
  } else {
    delete platformCookies[platform];
    safeLog(`[Electron] Cleared cookies for ${platform}`);
  }
}

/**
 * Get cookies for a platform
 */
export function getElectronPlatformCookies(platform) {
  return platformCookies[platform] || null;
}

/**
 * Create and configure the Express app
 */
function createApp() {
  const app = express();

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // We handle CSP in Electron
  }));

  // CORS - allow localhost origins for Electron
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mode: 'electron',
      hasAnthropicKey: !!getApiKey('anthropic'),
      hasOpenAIKey: !!getApiKey('openai'),
    });
  });

  // Middleware to inject platform cookies for fetch requests
  app.use('/api/fetch', (req, res, next) => {
    // Make platform cookies available to the fetch route
    req.electronPlatformCookies = platformCookies;
    next();
  });

  return app;
}

/**
 * Dynamically import and register routes
 * This allows us to use the existing route handlers from backend/src/routes
 */
async function registerRoutes(app) {
  // Import routes
  const { default: solveRouter } = await import('../backend/src/routes/solve.js');
  const { default: analyzeRouter } = await import('../backend/src/routes/analyze.js');
  const { default: fetchRouter } = await import('../backend/src/routes/fetch.js');
  const { default: runRouter } = await import('../backend/src/routes/run.js');
  const { default: fixRouter } = await import('../backend/src/routes/fix.js');
  const { default: transcribeRouter } = await import('../backend/src/routes/transcribe.js');
  const { default: interviewRouter } = await import('../backend/src/routes/interview.js');
  const { errorHandler } = await import('../backend/src/middleware/errorHandler.js');

  // In Electron mode, we skip authentication (user provides their own keys)
  // The routes will use getApiKey() to get keys from secure storage
  app.use('/api/solve', solveRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use('/api/fetch', fetchRouter);
  app.use('/api/run', runRouter);
  app.use('/api/fix', fixRouter);
  app.use('/api/transcribe', transcribeRouter);
  app.use('/api/interview', interviewRouter);

  // Auth endpoints return Electron-specific responses
  app.get('/api/auth/check', (req, res) => {
    res.json({ authEnabled: false, mode: 'electron' });
  });

  // Error handler (must be last)
  app.use(errorHandler);
}

/**
 * Start the embedded backend server
 * @param {Object} options
 * @param {number} options.port - Port to listen on
 * @param {Object} options.apiKeys - Initial API keys
 * @returns {Promise<Object>} Server instance with control methods
 */
export async function startBackendServer(options = {}) {
  const { port = 3001, apiKeys = {} } = options;

  // Set initial API keys
  if (apiKeys.anthropic) {
    claudeService.setApiKey(apiKeys.anthropic);
  }
  if (apiKeys.openai) {
    openaiService.setApiKey(apiKeys.openai);
  }

  const app = createApp();
  await registerRoutes(app);

  const server = createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => {
      safeLog(`[Electron] Backend server running on http://127.0.0.1:${port}`);

      resolve({
        port,
        server,

        // Update API keys at runtime
        updateApiKeys: (keys) => {
          updateRuntimeApiKeys(keys);
          safeLog('[Electron] API keys updated');
        },

        // Set platform cookies for authenticated scraping
        setPlatformCookies: (platform, cookies) => {
          setPlatformCookies(platform, cookies);
        },

        // Close the server
        close: () => {
          return new Promise((resolveClose) => {
            server.close(() => {
              safeLog('[Electron] Backend server closed');
              resolveClose();
            });
          });
        },
      });
    });

    server.on('error', (err) => {
      safeError('[Electron] Backend server error:', err);
      reject(err);
    });
  });
}
