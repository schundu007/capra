/**
 * Application Constants
 * Centralized configuration and magic values
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  VERSION: 'v1',
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Supported programming languages
 */
export const SUPPORTED_LANGUAGES = [
  'python',
  'bash',
  'javascript',
  'typescript',
  'sql',
  'terraform',
  'jenkins',
  'yaml',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * AI Providers
 */
export const AI_PROVIDERS = {
  CLAUDE: 'claude',
  OPENAI: 'openai',
} as const;

export type AIProvider = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS];

/**
 * Execution modes
 */
export const EXECUTION_MODES = {
  FAST: 'fast',
  VERIFIED: 'verified',
  COMPREHENSIVE: 'comprehensive',
} as const;

export type ExecutionMode = typeof EXECUTION_MODES[keyof typeof EXECUTION_MODES];

/**
 * Difficulty levels
 */
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
  },
  MIN_PROBLEM_LENGTH: 10,
  MAX_PROBLEM_LENGTH: 50000,
  DEBOUNCE_DELAY_MS: 300,
  ANIMATION_DURATION_MS: 200,
  PANE_MIN_SIZE: 280,
  CODE_PANE_MIN_SIZE: 300,
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  ANALYZE: {
    key: 'Enter',
    modifiers: ['ctrlKey', 'metaKey'],
    description: 'Analyze problem',
  },
  CLEAR: {
    key: 'Escape',
    modifiers: [],
    description: 'Clear all',
  },
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  EXECUTION_ERROR: 'EXECUTION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Error messages
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.NETWORK_ERROR]: 'Unable to connect to the server. Please check your connection.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.AI_SERVICE_ERROR]: 'AI service is temporarily unavailable. Please try again.',
  [ERROR_CODES.EXECUTION_ERROR]: 'Code execution failed. Check the error details below.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'capra-theme',
  MODE: 'capra-mode',
  PROVIDER: 'capra-provider',
  SETTINGS: 'capra-settings',
} as const;

/**
 * Application metadata
 */
export const APP_META = {
  NAME: 'Capra',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered coding interview assistant',
} as const;
