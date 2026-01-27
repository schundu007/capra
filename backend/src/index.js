/**
 * Capra Backend API Server
 * Enterprise-grade Express application
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Configuration
import { config, validateConfig } from './lib/config.js';
import { createLogger } from './lib/logger.js';

// Middleware
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityHeaders, sanitizeBody } from './middleware/security.js';

// Routes
import solveRouter from './routes/solve.js';
import analyzeRouter from './routes/analyze.js';
import fetchRouter from './routes/fetch.js';
import runRouter from './routes/run.js';
import fixRouter from './routes/fix.js';

// Initialize logger
const logger = createLogger('server');

// Validate configuration on startup
const configValidation = validateConfig();
if (configValidation.warnings.length > 0) {
  configValidation.warnings.forEach((warning) => {
    logger.warn(warning);
  });
}

// Create Express application
const app = express();

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Disable x-powered-by header
app.disable('x-powered-by');

// Security middleware
app.use(securityHeaders);

// Request ID middleware (must be early in chain)
app.use(requestIdMiddleware);

// CORS configuration
app.use(
  cors({
    origin: config.server.corsOrigins === '*' ? true : config.server.corsOrigins.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request body
app.use(sanitizeBody);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();

  // Log request
  logger.logRequest(req);

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logResponse(req, res, duration);
  });

  next();
});

// API Routes
app.use('/api/solve', solveRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/fetch', fetchRouter);
app.use('/api/run', runRouter);
app.use('/api/fix', fixRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.env.nodeEnv,
      uptime: process.uptime(),
    },
  });
});

// Readiness check (for container orchestration)
app.get('/api/ready', (req, res) => {
  // Check if critical services are available
  const isReady =
    (config.apiKeys.anthropic || config.apiKeys.openai);

  if (isReady) {
    res.json({
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  } else {
    res.status(503).json({
      success: false,
      error: {
        code: 'NOT_READY',
        message: 'Service is not ready - missing required configuration',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handler
function gracefulShutdown(signal) {
  logger.info(`${signal} received, starting graceful shutdown`);

  server.close((err) => {
    if (err) {
      logger.error('Error during shutdown', { error: err.message });
      process.exit(1);
    }

    logger.info('Server closed successfully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.warn('Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
}

// Start server
const server = app.listen(config.server.port, () => {
  logger.info('Server started', {
    port: config.server.port,
    environment: config.env.nodeEnv,
    nodeVersion: process.version,
  });
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

export default app;
