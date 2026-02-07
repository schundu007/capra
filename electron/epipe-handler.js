/**
 * EPIPE Error Handler - Must be imported first in the application
 *
 * EPIPE errors occur when writing to stdout/stderr after the pipe has been closed.
 * This commonly happens in Electron apps during shutdown or when the main window closes.
 */

// Suppress Node.js deprecation and other warnings that write to stderr
process.noDeprecation = true;
process.env.NODE_NO_WARNINGS = '1';

// Handle EPIPE errors on stdout/stderr
if (process.stdout) {
  process.stdout.on('error', (err) => {
    if (err.code === 'EPIPE') return;
  });
  // Make stdout writes non-blocking and ignore errors
  if (process.stdout._handle) {
    process.stdout._handle.setBlocking?.(false);
  }
}

if (process.stderr) {
  process.stderr.on('error', (err) => {
    if (err.code === 'EPIPE') return;
  });
  // Make stderr writes non-blocking and ignore errors
  if (process.stderr._handle) {
    process.stderr._handle.setBlocking?.(false);
  }
}

// Suppress Node.js warnings that can cause EPIPE
process.on('warning', () => {
  // Silently ignore to prevent EPIPE errors
});

// Handle uncaught exceptions related to EPIPE
process.on('uncaughtException', (err) => {
  if (err.code === 'EPIPE' || err.message?.includes('EPIPE')) {
    return; // Silently ignore EPIPE errors
  }
  // For non-EPIPE errors in production, we don't want to crash
  // but we also can't reliably log them
});

// Override console methods to be EPIPE-safe
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;
const originalConsoleDebug = console.debug;

console.log = (...args) => {
  try {
    originalConsoleLog.apply(console, args);
  } catch {
    // Ignore EPIPE errors
  }
};

console.error = (...args) => {
  try {
    originalConsoleError.apply(console, args);
  } catch {
    // Ignore EPIPE errors
  }
};

console.warn = (...args) => {
  try {
    originalConsoleWarn.apply(console, args);
  } catch {
    // Ignore EPIPE errors
  }
};

console.info = (...args) => {
  try {
    originalConsoleInfo.apply(console, args);
  } catch {
    // Ignore EPIPE errors
  }
};

console.debug = (...args) => {
  try {
    originalConsoleDebug.apply(console, args);
  } catch {
    // Ignore EPIPE errors
  }
};

export default {
  initialized: true
};
