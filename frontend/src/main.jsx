/**
 * Application Entry Point
 * Initializes React with error boundary and strict mode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import './index.css';

/**
 * Global error handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Global error handler for uncaught errors
 */
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

/**
 * Error handler for ErrorBoundary
 */
const handleError = (error, errorInfo) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  // In production, you could send to an error tracking service
  // e.g., Sentry, LogRocket, etc.
};

/**
 * Render the application
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary onError={handleError}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
