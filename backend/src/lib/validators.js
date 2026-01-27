/**
 * Request Validation Utilities
 * Provides validation functions for API request data
 */

import { ValidationError, ErrorCode } from './errors.js';

/**
 * Supported programming languages for code execution
 */
export const SUPPORTED_LANGUAGES = ['python', 'bash', 'javascript', 'typescript', 'sql'];

/**
 * Supported AI providers
 */
export const SUPPORTED_PROVIDERS = ['claude', 'openai'];

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Validation result type
 * @typedef {{ valid: boolean, error?: string, details?: Object }} ValidationResult
 */

/**
 * Validate that a value is a non-empty string
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} [options] - Validation options
 * @param {number} [options.minLength] - Minimum length
 * @param {number} [options.maxLength] - Maximum length
 * @returns {ValidationResult}
 */
export function validateString(value, fieldName, options = {}) {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  if (options.minLength && trimmed.length < options.minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${options.minLength} characters`,
    };
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed ${options.maxLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a value is a valid URL
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {ValidationResult}
 */
export function validateUrl(value, fieldName) {
  const stringResult = validateString(value, fieldName);
  if (!stringResult.valid) {
    return stringResult;
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: `${fieldName} must use HTTP or HTTPS protocol` };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: `${fieldName} is not a valid URL` };
  }
}

/**
 * Validate that a value is one of the allowed values
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Array} allowedValues - Array of allowed values
 * @returns {ValidationResult}
 */
export function validateEnum(value, fieldName, allowedValues) {
  if (value === undefined || value === null) {
    return { valid: true }; // Optional field
  }

  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      details: { allowedValues },
    };
  }

  return { valid: true };
}

/**
 * Validate file upload
 * @param {Object} file - Multer file object
 * @param {Object} [options] - Validation options
 * @param {number} [options.maxSize] - Maximum file size in bytes
 * @param {Array<string>} [options.allowedTypes] - Allowed MIME types
 * @returns {ValidationResult}
 */
export function validateFile(file, options = {}) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (options.maxSize && file.size > options.maxSize) {
    const maxSizeMB = Math.round(options.maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxSizeMB}MB)`,
      details: { maxSize: options.maxSize, actualSize: file.size },
    };
  }

  if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
      details: { allowedTypes: options.allowedTypes, actualType: file.mimetype },
    };
  }

  return { valid: true };
}

/**
 * Validate solve request
 * @param {Object} body - Request body
 * @returns {ValidationResult}
 */
export function validateSolveRequest(body) {
  const problemResult = validateString(body.problem, 'problem', { minLength: 10 });
  if (!problemResult.valid) {
    return problemResult;
  }

  const providerResult = validateEnum(body.provider, 'provider', SUPPORTED_PROVIDERS);
  if (!providerResult.valid) {
    return providerResult;
  }

  return { valid: true };
}

/**
 * Validate code execution request
 * @param {Object} body - Request body
 * @returns {ValidationResult}
 */
export function validateRunRequest(body) {
  const codeResult = validateString(body.code, 'code');
  if (!codeResult.valid) {
    return codeResult;
  }

  const languageResult = validateEnum(body.language, 'language', SUPPORTED_LANGUAGES);
  if (!languageResult.valid) {
    return languageResult;
  }

  if (!body.language) {
    return { valid: false, error: 'language is required' };
  }

  return { valid: true };
}

/**
 * Validate fix request
 * @param {Object} body - Request body
 * @returns {ValidationResult}
 */
export function validateFixRequest(body) {
  const codeResult = validateString(body.code, 'code');
  if (!codeResult.valid) {
    return codeResult;
  }

  const errorResult = validateString(body.error, 'error');
  if (!errorResult.valid) {
    return errorResult;
  }

  const providerResult = validateEnum(body.provider, 'provider', SUPPORTED_PROVIDERS);
  if (!providerResult.valid) {
    return providerResult;
  }

  return { valid: true };
}

/**
 * Validate fetch request
 * @param {Object} body - Request body
 * @returns {ValidationResult}
 */
export function validateFetchRequest(body) {
  return validateUrl(body.url, 'url');
}

/**
 * Validate analyze (image) request
 * @param {Object} body - Request body
 * @returns {ValidationResult}
 */
export function validateAnalyzeRequest(body) {
  const providerResult = validateEnum(body.provider, 'provider', SUPPORTED_PROVIDERS);
  if (!providerResult.valid) {
    return providerResult;
  }

  const modeResult = validateEnum(body.mode, 'mode', ['extract', 'analyze']);
  if (!modeResult.valid) {
    return modeResult;
  }

  return { valid: true };
}

/**
 * Create validation middleware
 * @param {Function} validationFn - Validation function to use
 * @returns {Function} Express middleware
 */
export function validate(validationFn) {
  return (req, res, next) => {
    const result = validationFn(req.body);
    if (!result.valid) {
      return next(new ValidationError(result.error, result.details));
    }
    next();
  };
}

/**
 * Sanitize string input (basic XSS prevention)
 * @param {string} input - Input to sanitize
 * @returns {string}
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
