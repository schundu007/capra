/**
 * Structured Logging Utility
 * Provides consistent, structured logging across the application
 */

import { config } from './config.js';

/**
 * Log levels
 * @readonly
 * @enum {number}
 */
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Log level names
 */
const LogLevelNames = ['error', 'warn', 'info', 'debug'];

/**
 * Get numeric log level from string
 * @param {string} level
 * @returns {number}
 */
function getLogLevelValue(level) {
  const index = LogLevelNames.indexOf(level.toLowerCase());
  return index >= 0 ? index : LogLevel.INFO;
}

/**
 * Current log level
 */
const currentLogLevel = getLogLevelValue(config.logging.level);

/**
 * Format log entry as JSON or text
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [meta] - Additional metadata
 * @returns {string}
 */
function formatLogEntry(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...meta,
  };

  if (!config.logging.includeTimestamp) {
    delete entry.timestamp;
  }

  if (config.logging.format === 'json') {
    return JSON.stringify(entry);
  }

  // Text format for development
  const timestamp = entry.timestamp ? `[${entry.timestamp}] ` : '';
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp}${level.toUpperCase()}: ${message}${metaStr}`;
}

/**
 * Logger class with structured logging methods
 */
class Logger {
  /**
   * @param {string} [context] - Logger context (e.g., module name)
   */
  constructor(context = '') {
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   * @param {string} childContext
   * @returns {Logger}
   */
  child(childContext) {
    const newContext = this.context ? `${this.context}:${childContext}` : childContext;
    return new Logger(newContext);
  }

  /**
   * Log at error level
   * @param {string} message
   * @param {Object} [meta]
   */
  error(message, meta = {}) {
    if (currentLogLevel >= LogLevel.ERROR) {
      const logMeta = this.context ? { context: this.context, ...meta } : meta;
      console.error(formatLogEntry('error', message, logMeta));
    }
  }

  /**
   * Log at warn level
   * @param {string} message
   * @param {Object} [meta]
   */
  warn(message, meta = {}) {
    if (currentLogLevel >= LogLevel.WARN) {
      const logMeta = this.context ? { context: this.context, ...meta } : meta;
      console.warn(formatLogEntry('warn', message, logMeta));
    }
  }

  /**
   * Log at info level
   * @param {string} message
   * @param {Object} [meta]
   */
  info(message, meta = {}) {
    if (currentLogLevel >= LogLevel.INFO) {
      const logMeta = this.context ? { context: this.context, ...meta } : meta;
      console.info(formatLogEntry('info', message, logMeta));
    }
  }

  /**
   * Log at debug level
   * @param {string} message
   * @param {Object} [meta]
   */
  debug(message, meta = {}) {
    if (currentLogLevel >= LogLevel.DEBUG) {
      const logMeta = this.context ? { context: this.context, ...meta } : meta;
      console.debug(formatLogEntry('debug', message, logMeta));
    }
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} [extra] - Additional metadata
   */
  logRequest(req, extra = {}) {
    this.info('Incoming request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      ...extra,
    });
  }

  /**
   * Log HTTP response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  logResponse(req, res, duration) {
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    this[level]('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  }

  /**
   * Log error with stack trace
   * @param {string} message
   * @param {Error} error
   * @param {Object} [meta]
   */
  logError(message, error, meta = {}) {
    this.error(message, {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      stack: config.env.isDevelopment ? error.stack : undefined,
      ...meta,
    });
  }
}

/**
 * Create a logger instance
 * @param {string} [context] - Logger context
 * @returns {Logger}
 */
export function createLogger(context = '') {
  return new Logger(context);
}

/**
 * Default application logger
 */
export const logger = createLogger('app');

export default logger;
