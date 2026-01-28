/**
 * Graceful shutdown utility - handles SIGTERM/SIGINT signals
 */

import { logger } from '../middleware/requestLogger.js';

const FORCE_SHUTDOWN_TIMEOUT = 10000; // 10 seconds

// Track active connections
const connections = new Set();

/**
 * Track a new connection
 */
export function trackConnection(socket) {
  connections.add(socket);
  socket.on('close', () => {
    connections.delete(socket);
  });
}

/**
 * Setup graceful shutdown handlers
 * @param {http.Server} server - HTTP server instance
 */
export function setupGracefulShutdown(server) {
  let isShuttingDown = false;

  const shutdown = async (signal) => {
    if (isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    isShuttingDown = true;
    logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown');

    // Stop accepting new connections
    server.close((err) => {
      if (err) {
        logger.error({ error: err.message }, 'Error closing server');
      } else {
        logger.info('Server closed, no longer accepting connections');
      }
    });

    // Close existing connections gracefully
    logger.info({ activeConnections: connections.size }, 'Closing active connections');

    for (const socket of connections) {
      socket.end();
    }

    // Force close after timeout
    const forceShutdown = setTimeout(() => {
      logger.warn('Force closing remaining connections after timeout');

      for (const socket of connections) {
        socket.destroy();
      }

      process.exit(1);
    }, FORCE_SHUTDOWN_TIMEOUT);

    // Clear timeout if all connections closed
    const checkConnections = setInterval(() => {
      if (connections.size === 0) {
        clearInterval(checkConnections);
        clearTimeout(forceShutdown);
        logger.info('All connections closed, exiting gracefully');
        process.exit(0);
      }
    }, 100);
  };

  // Register signal handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.fatal({ error: err.message, stack: err.stack }, 'Uncaught exception');
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'Unhandled promise rejection');
    shutdown('unhandledRejection');
  });
}

export default setupGracefulShutdown;
