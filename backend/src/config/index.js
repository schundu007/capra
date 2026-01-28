/**
 * Configuration module - validates environment variables at startup
 */

const requiredEnvVars = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
];

const optionalEnvVars = {
  PORT: '3001',
  LOG_LEVEL: 'info',
  CORS_ORIGIN: '*',
  NODE_ENV: 'development',
};

function validateConfig() {
  const missing = [];
  const config = {};

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    } else {
      config[envVar] = process.env[envVar];
    }
  }

  // Set optional environment variables with defaults
  for (const [envVar, defaultValue] of Object.entries(optionalEnvVars)) {
    config[envVar] = process.env[envVar] || defaultValue;
  }

  // Convert PORT to number
  config.PORT = parseInt(config.PORT, 10);

  // Warn about missing optional vars in development
  if (missing.length > 0 && config.NODE_ENV === 'development') {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work correctly.');
  }

  // In production, fail if required vars are missing
  if (missing.length > 0 && config.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return config;
}

export const config = validateConfig();

export default config;
