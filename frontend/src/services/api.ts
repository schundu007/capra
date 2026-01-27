/**
 * API Service
 * Centralized API client with enterprise-grade error handling
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  OCRRequest,
  OCRResponse,
  OptimizeRequest,
  ExplainSimpleRequest,
  ExplainSimpleResponse,
  ErrorResponse,
} from '../types';
import { API_CONFIG, ERROR_CODES, ERROR_MESSAGES, type ErrorCode } from '../config/constants';

/**
 * Custom API Error class with structured error information
 */
export class ApiError extends Error {
  code: ErrorCode;
  status?: number;
  details?: unknown;
  requestId?: string;

  constructor(message: string, code: ErrorCode, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return ERROR_MESSAGES[this.code] || this.message;
  }
}

/**
 * Map HTTP status codes to error codes
 */
function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 429:
      return ERROR_CODES.RATE_LIMITED;
    case 502:
    case 503:
      return ERROR_CODES.AI_SERVICE_ERROR;
    case 408:
      return ERROR_CODES.TIMEOUT_ERROR;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

/**
 * Create configured axios instance
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
    timeout: API_CONFIG.TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for logging and request ID
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add request ID for tracing
      const requestId = crypto.randomUUID().split('-')[0];
      config.headers.set('X-Request-ID', requestId);

      if (import.meta.env.DEV) {
        console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
          requestId,
          data: config.data,
        });
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.debug(`[API] Response ${response.status}`, {
          url: response.config.url,
          data: response.data,
        });
      }
      return response;
    },
    (error: AxiosError<ErrorResponse>) => {
      const status = error.response?.status;
      const errorData = error.response?.data?.error;
      const requestId = error.response?.headers?.['x-request-id'];

      // Network error
      if (!error.response) {
        throw new ApiError(
          'Unable to connect to the server',
          ERROR_CODES.NETWORK_ERROR
        );
      }

      // Server returned error
      const errorCode = getErrorCodeFromStatus(status || 500);
      const message = errorData?.message || error.message || 'An unexpected error occurred';

      const apiError = new ApiError(message, errorCode, status, errorData?.details);
      apiError.requestId = requestId;

      if (import.meta.env.DEV) {
        console.error(`[API] Error ${status}`, {
          url: error.config?.url,
          error: message,
          requestId,
        });
      }

      throw apiError;
    }
  );

  return client;
}

/**
 * API client instance
 */
const api = createApiClient();

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries?: number;
  delayMs?: number;
}

/**
 * Execute request with retry logic
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries = 0, delayMs = API_CONFIG.RETRY_DELAY_MS } = config;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry for validation errors
      if (error instanceof ApiError && error.code === ERROR_CODES.VALIDATION_ERROR) {
        throw error;
      }

      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Analyze a coding problem
 */
export async function analyzeProblem(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await api.post<AnalyzeResponse>('/analyze', request);
  return response.data;
}

/**
 * Extract text from an image using OCR
 */
export async function extractTextFromImage(request: OCRRequest): Promise<OCRResponse> {
  const response = await api.post<OCRResponse>('/ocr', request);
  return response.data;
}

/**
 * Analyze an image containing a coding problem
 */
export async function analyzeImage(request: OCRRequest): Promise<AnalyzeResponse> {
  const response = await api.post<AnalyzeResponse>('/analyze-image', request);
  return response.data;
}

/**
 * Optimize an existing solution
 */
export async function optimizeSolution(request: OptimizeRequest): Promise<AnalyzeResponse> {
  const response = await api.post<AnalyzeResponse>('/optimize', request);
  return response.data;
}

/**
 * Get simplified explanation of a solution
 */
export async function explainSimple(request: ExplainSimpleRequest): Promise<ExplainSimpleResponse> {
  const response = await api.post<ExplainSimpleResponse>('/explain-simple', request);
  return response.data;
}

/**
 * Health check response type
 */
export interface HealthCheckResponse {
  success: boolean;
  data: {
    status: string;
    version: string;
    timestamp: string;
    uptime?: number;
  };
}

/**
 * Check API health status
 */
export async function checkHealth(): Promise<HealthCheckResponse> {
  const response = await api.get<HealthCheckResponse>('/health');
  return response.data;
}

/**
 * Code execution request
 */
export interface ExecuteRequest {
  code: string;
  language: string;
  input?: string;
  args?: string[];
  timeout?: number;
}

/**
 * Code execution response
 */
export interface ExecuteResponse {
  success: boolean;
  data: {
    success: boolean;
    output?: string;
    error?: string;
    duration?: number;
  };
}

/**
 * Execute code
 */
export async function executeCode(request: ExecuteRequest): Promise<ExecuteResponse> {
  const response = await api.post<ExecuteResponse>('/run', request);
  return response.data;
}

/**
 * Code explanation response
 */
export interface ExplainResponse {
  thought_process: string;
  lines: Array<{
    line: number;
    code: string;
    explanation: string;
  }>;
}

/**
 * Get explanation for code
 */
export async function explainCode(problemText: string, code: string): Promise<ExplainResponse> {
  const response = await api.post<ExplainResponse>('/explain-code', {
    problem_text: problemText,
    code,
  });
  return response.data;
}

/**
 * Solve problem request
 */
export interface SolveRequest {
  problem: string;
  provider?: 'claude' | 'openai';
  language?: string;
}

/**
 * Solve problem response
 */
export interface SolveResponse {
  success: boolean;
  data: {
    code: string;
    language: string;
    pitch?: string;
    examples?: Array<{ input: string; expected: string }>;
    explanations?: Array<{ line: number; code: string; explanation: string }>;
    complexity?: { time: string; space: string };
  };
  metadata?: {
    provider: string;
    requestId: string;
    timestamp: string;
  };
}

/**
 * Solve a coding problem
 */
export async function solveProblem(request: SolveRequest): Promise<SolveResponse> {
  const response = await api.post<SolveResponse>('/solve', request);
  return response.data;
}

/**
 * Fix code request
 */
export interface FixCodeRequest {
  code: string;
  error: string;
  language?: string;
  provider?: 'claude' | 'openai';
}

/**
 * Fix code response
 */
export interface FixCodeResponse {
  success: boolean;
  data: {
    code: string;
  };
}

/**
 * Fix broken code
 */
export async function fixCode(request: FixCodeRequest): Promise<FixCodeResponse> {
  const response = await api.post<FixCodeResponse>('/fix', request);
  return response.data;
}

/**
 * Stream analysis with Server-Sent Events
 */
export async function analyzeStream(
  request: AnalyzeRequest,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/analyze-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID().split('-')[0],
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ApiError(
        `HTTP error: ${response.status}`,
        getErrorCodeFromStatus(response.status),
        response.status,
        errorText
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError('No response body', ERROR_CODES.NETWORK_ERROR);
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            onComplete();
          } else if (data.startsWith('[ERROR]')) {
            onError(data.slice(8));
          } else {
            // Restore escaped sequences
            let unescaped = data.replace(/<<SLASHN>>/g, '\\n');
            unescaped = unescaped.replace(/<<NEWLINE>>/g, '\n');
            // Strip markdown code blocks
            unescaped = unescaped.replace(/```python\n?/g, '').replace(/```\n?/g, '');
            onChunk(unescaped);
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', ERROR_CODES.TIMEOUT_ERROR);
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      ERROR_CODES.NETWORK_ERROR
    );
  }
}

/**
 * Default export for the API client
 */
export default api;
