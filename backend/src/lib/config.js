/**
 * Centralized Configuration Management
 * All configuration values should be accessed through this module
 */

/**
 * Environment type
 * @typedef {'development' | 'production' | 'test'} Environment
 */

/**
 * Get environment with fallback
 * @param {string} key - Environment variable key
 * @param {string} [defaultValue] - Default value if not set
 * @returns {string}
 */
function getEnv(key, defaultValue = '') {
  return process.env[key] || defaultValue;
}

/**
 * Get required environment variable
 * @param {string} key - Environment variable key
 * @returns {string}
 * @throws {Error} If environment variable is not set
 */
function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value) {
    console.warn(`Warning: Required environment variable ${key} is not set`);
  }
  return value || '';
}

/**
 * Get numeric environment variable
 * @param {string} key - Environment variable key
 * @param {number} defaultValue - Default value
 * @returns {number}
 */
function getNumericEnv(key, defaultValue) {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} defaultValue - Default value
 * @returns {boolean}
 */
function getBooleanEnv(key, defaultValue) {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Application configuration
 */
export const config = {
  /**
   * Environment
   */
  env: {
    /** @type {Environment} */
    nodeEnv: getEnv('NODE_ENV', 'development'),
    isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
    isProduction: getEnv('NODE_ENV') === 'production',
    isTest: getEnv('NODE_ENV') === 'test',
  },

  /**
   * Server configuration
   */
  server: {
    port: getNumericEnv('PORT', 3001),
    host: getEnv('HOST', '0.0.0.0'),
    corsOrigins: getEnv('CORS_ORIGINS', '*'),
  },

  /**
   * API Keys
   */
  apiKeys: {
    anthropic: getRequiredEnv('ANTHROPIC_API_KEY'),
    openai: getRequiredEnv('OPENAI_API_KEY'),
  },

  /**
   * AI Provider configuration
   */
  ai: {
    defaultProvider: getEnv('DEFAULT_AI_PROVIDER', 'claude'),
    claude: {
      model: getEnv('CLAUDE_MODEL', 'claude-sonnet-4-20250514'),
      maxTokens: getNumericEnv('CLAUDE_MAX_TOKENS', 4096),
    },
    openai: {
      model: getEnv('OPENAI_MODEL', 'gpt-4o'),
      maxTokens: getNumericEnv('OPENAI_MAX_TOKENS', 4096),
    },
  },

  /**
   * Code execution configuration
   */
  execution: {
    timeout: getNumericEnv('EXECUTION_TIMEOUT_MS', 10000),
    maxRetries: getNumericEnv('EXECUTION_MAX_RETRIES', 3),
    pythonPath: getEnv('PYTHON_PATH', '/usr/bin/python3'),
    allowPackageInstall: getBooleanEnv('ALLOW_PACKAGE_INSTALL', true),
  },

  /**
   * File upload configuration
   */
  upload: {
    maxFileSize: getNumericEnv('MAX_FILE_SIZE_MB', 10) * 1024 * 1024,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },

  /**
   * Rate limiting (placeholder for future implementation)
   */
  rateLimit: {
    enabled: getBooleanEnv('RATE_LIMIT_ENABLED', false),
    windowMs: getNumericEnv('RATE_LIMIT_WINDOW_MS', 60000),
    maxRequests: getNumericEnv('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  /**
   * Logging configuration
   */
  logging: {
    level: getEnv('LOG_LEVEL', 'info'),
    format: getEnv('LOG_FORMAT', 'json'),
    includeTimestamp: getBooleanEnv('LOG_TIMESTAMP', true),
  },

  /**
   * Scraping configuration
   */
  scraping: {
    timeout: getNumericEnv('SCRAPING_TIMEOUT_MS', 10000),
    maxContentLength: getNumericEnv('SCRAPING_MAX_CONTENT_LENGTH', 8000),
    userAgent: getEnv(
      'SCRAPING_USER_AGENT',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ),
  },
};

/**
 * Validate critical configuration on startup
 * @returns {{ valid: boolean, warnings: string[] }}
 */
export function validateConfig() {
  const warnings = [];

  if (!config.apiKeys.anthropic) {
    warnings.push('ANTHROPIC_API_KEY is not set - Claude provider will not work');
  }

  if (!config.apiKeys.openai) {
    warnings.push('OPENAI_API_KEY is not set - OpenAI provider will not work');
  }

  if (config.env.isProduction && config.server.corsOrigins === '*') {
    warnings.push('CORS is set to allow all origins in production - consider restricting');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

export default config;
