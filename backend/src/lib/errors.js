/**
 * Enterprise Error Classes
 * Provides structured error handling with error codes and HTTP status mapping
 */

/**
 * Error codes for the application
 * @readonly
 * @enum {string}
 */
export const ErrorCode = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_URL_FORMAT: 'INVALID_URL_FORMAT',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_LANGUAGE: 'UNSUPPORTED_LANGUAGE',

  // Authentication/Authorization (401/403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_API_KEY: 'INVALID_API_KEY',

  // Not found (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Rate limiting (429)
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // External service errors (502/503)
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SCRAPING_ERROR: 'SCRAPING_ERROR',
  SCRAPING_BLOCKED: 'SCRAPING_BLOCKED',

  // Execution errors (500)
  EXECUTION_ERROR: 'EXECUTION_ERROR',
  EXECUTION_TIMEOUT: 'EXECUTION_TIMEOUT',
  PACKAGE_INSTALL_FAILED: 'PACKAGE_INSTALL_FAILED',

  // Internal errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
};

/**
 * Maps error codes to HTTP status codes
 */
const ERROR_STATUS_MAP = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_URL_FORMAT]: 400,
  [ErrorCode.INVALID_FILE_TYPE]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 400,
  [ErrorCode.UNSUPPORTED_LANGUAGE]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_API_KEY]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.AI_SERVICE_ERROR]: 502,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.SCRAPING_ERROR]: 502,
  [ErrorCode.SCRAPING_BLOCKED]: 403,
  [ErrorCode.EXECUTION_ERROR]: 500,
  [ErrorCode.EXECUTION_TIMEOUT]: 408,
  [ErrorCode.PACKAGE_INSTALL_FAILED]: 500,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.CONFIGURATION_ERROR]: 500,
};

/**
 * Base application error class
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {string} code - Error code from ErrorCode enum
   * @param {Object} [details] - Additional error details
   */
  constructor(message, code = ErrorCode.INTERNAL_ERROR, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = ERROR_STATUS_MAP[code] || 500;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   * @returns {Object}
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }
}

/**
 * Validation error for request validation failures
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Validation error message
   * @param {Object} [details] - Validation failure details
   */
  constructor(message, details = null) {
    super(message, ErrorCode.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} [resource='Resource'] - Name of the resource
   */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, ErrorCode.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * External service error for AI/scraping failures
 */
export class ExternalServiceError extends AppError {
  /**
   * @param {string} service - Name of the external service
   * @param {string} message - Error message
   * @param {Object} [details] - Additional details
   */
  constructor(service, message, details = null) {
    super(`${service} error: ${message}`, ErrorCode.EXTERNAL_SERVICE_ERROR, details);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

/**
 * AI service error for Claude/OpenAI failures
 */
export class AIServiceError extends AppError {
  /**
   * @param {string} provider - AI provider name (claude/openai)
   * @param {string} message - Error message
   * @param {Object} [details] - Additional details
   */
  constructor(provider, message, details = null) {
    super(`AI service (${provider}) error: ${message}`, ErrorCode.AI_SERVICE_ERROR, details);
    this.name = 'AIServiceError';
    this.provider = provider;
  }
}

/**
 * Execution error for code execution failures
 */
export class ExecutionError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {string} [code] - Specific error code
   * @param {Object} [details] - Execution details
   */
  constructor(message, code = ErrorCode.EXECUTION_ERROR, details = null) {
    super(message, code, details);
    this.name = 'ExecutionError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  /**
   * @param {number} [retryAfter] - Seconds until retry is allowed
   */
  constructor(retryAfter = null) {
    super('Too many requests. Please try again later.', ErrorCode.RATE_LIMITED, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Check if an error is an AppError instance
 * @param {Error} error
 * @returns {boolean}
 */
export function isAppError(error) {
  return error instanceof AppError;
}

/**
 * Wrap unknown errors into AppError
 * @param {Error} error - Original error
 * @param {string} [context] - Context where error occurred
 * @returns {AppError}
 */
export function wrapError(error, context = '') {
  if (isAppError(error)) {
    return error;
  }

  const message = context
    ? `${context}: ${error.message}`
    : error.message || 'An unexpected error occurred';

  return new AppError(message, ErrorCode.INTERNAL_ERROR, {
    originalError: error.name,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
}
