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
import { authenticate } from './middleware/authenticate.js';

const app = express();
const PORT = config.PORT;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - allow all origins including chrome extensions
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    // Allow chrome extensions
    // Allow localhost and deployed frontend
    if (!origin ||
        origin.startsWith('chrome-extension://') ||
        origin.startsWith('moz-extension://') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('railway.app') ||
        origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Request ID tracking
app.use(requestId);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Auth routes (no authentication required)
app.use('/api/auth', authRouter);

// Protected routes (require authentication)
app.use('/api/solve', authenticate, solveRouter);
app.use('/api/analyze', authenticate, analyzeRouter);
app.use('/api/fetch', authenticate, fetchRouter);
app.use('/api/run', authenticate, runRouter);
app.use('/api/fix', authenticate, fixRouter);

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
