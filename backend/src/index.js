import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import requestId from './middleware/requestId.js';
import { requestLogger, logger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupGracefulShutdown, trackConnection } from './utils/shutdown.js';
import solveRouter from './routes/solve.js';
import analyzeRouter from './routes/analyze.js';
import fetchRouter from './routes/fetch.js';
import runRouter from './routes/run.js';
import fixRouter from './routes/fix.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = config.PORT;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: config.CORS_ORIGIN,
}));

// Request ID tracking
app.use(requestId);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/solve', solveRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/fetch', fetchRouter);
app.use('/api/run', runRouter);
app.use('/api/fix', fixRouter);
app.use('/api/auth', authRouter);

// Enhanced health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    version: process.env.npm_package_version || '1.0.0',
    environment: config.NODE_ENV,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: config.NODE_ENV }, 'Capra API server started');
});

// Track connections for graceful shutdown
server.on('connection', (socket) => {
  trackConnection(socket);
});

// Setup graceful shutdown handlers
setupGracefulShutdown(server);
