import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
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
import transcribeRouter from './routes/transcribe.js';
import interviewRouter from './routes/interview.js';
import diagramRouter from './routes/diagram.js';
import interviewPrepRouter from './routes/interviewPrep.js';
import extractRouter from './routes/extract.js';
import extensionRouter from './routes/extension.js';
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

// Static file serving for generated diagrams
const DIAGRAM_OUTPUT_DIR = process.env.DIAGRAM_OUTPUT_DIR || '/tmp/chundu_diagrams';
app.use('/static/diagrams', express.static(DIAGRAM_OUTPUT_DIR, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // Set appropriate content type for diagram images
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Auth routes (no authentication required)
app.use('/api/auth', authRouter);

// Extension routes (no authentication - comes from browser extension)
app.use('/api/extension', extensionRouter);

// Public diagram debug endpoint (for troubleshooting deployment)
app.get('/api/diagram/debug', async (req, res) => {
  const { spawn } = await import('child_process');
  const results = {
    python: { available: false, version: null, error: null },
    graphviz: { available: false, version: null, error: null },
    diagrams: { available: false, error: null },
    anthropic: { available: false, error: null },
    anthropicKey: !!process.env.ANTHROPIC_API_KEY
  };

  // Check Python
  try {
    const python = spawn('python3', ['--version']);
    let stdout = '', stderr = '';
    python.stdout.on('data', d => stdout += d);
    python.stderr.on('data', d => stderr += d);
    await new Promise((resolve) => {
      python.on('close', (code) => {
        results.python.available = code === 0;
        results.python.version = (stdout || stderr).trim();
        resolve();
      });
      python.on('error', (err) => { results.python.error = err.message; resolve(); });
    });
  } catch (e) { results.python.error = e.message; }

  // Check graphviz
  try {
    const dot = spawn('dot', ['-V']);
    let stderr = '';
    dot.stderr.on('data', d => stderr += d);
    await new Promise((resolve) => {
      dot.on('close', (code) => {
        results.graphviz.available = code === 0;
        results.graphviz.version = stderr.trim();
        resolve();
      });
      dot.on('error', (err) => { results.graphviz.error = err.message; resolve(); });
    });
  } catch (e) { results.graphviz.error = e.message; }

  // Check diagrams library
  try {
    const python = spawn('python3', ['-c', 'import diagrams; print("OK")']);
    let stdout = '', stderr = '';
    python.stdout.on('data', d => stdout += d);
    python.stderr.on('data', d => stderr += d);
    await new Promise((resolve) => {
      python.on('close', (code) => {
        results.diagrams.available = code === 0 && stdout.includes('OK');
        if (stderr) results.diagrams.error = stderr.trim();
        resolve();
      });
      python.on('error', (err) => { results.diagrams.error = err.message; resolve(); });
    });
  } catch (e) { results.diagrams.error = e.message; }

  // Check anthropic library
  try {
    const python = spawn('python3', ['-c', 'import anthropic; print("OK")']);
    let stdout = '', stderr = '';
    python.stdout.on('data', d => stdout += d);
    python.stderr.on('data', d => stderr += d);
    await new Promise((resolve) => {
      python.on('close', (code) => {
        results.anthropic.available = code === 0 && stdout.includes('OK');
        if (stderr) results.anthropic.error = stderr.trim();
        resolve();
      });
      python.on('error', (err) => { results.anthropic.error = err.message; resolve(); });
    });
  } catch (e) { results.anthropic.error = e.message; }

  res.json(results);
});

// Test diagram generation endpoint (public for debugging)
app.get('/api/diagram/test', async (req, res) => {
  const { spawn } = await import('child_process');
  const path = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const enginePath = path.join(__dirname, 'services', 'diagram_engine.py');
  const outputDir = process.env.DIAGRAM_OUTPUT_DIR || '/tmp/chundu_diagrams';

  const fs = await import('fs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = {
    enginePath,
    engineExists: fs.existsSync(enginePath),
    outputDir,
    outputDirExists: fs.existsSync(outputDir),
    apiKeySet: !!process.env.ANTHROPIC_API_KEY,
    testOutput: null,
    testError: null
  };

  // Try running the script with --help to test it works
  try {
    const python = spawn('python3', [enginePath, '--help']);
    let stdout = '', stderr = '';
    python.stdout.on('data', d => stdout += d);
    python.stderr.on('data', d => stderr += d);
    await new Promise((resolve) => {
      python.on('close', (code) => {
        results.testExitCode = code;
        results.testOutput = stdout.substring(0, 500);
        results.testError = stderr.substring(0, 500);
        resolve();
      });
      python.on('error', (err) => {
        results.testError = err.message;
        resolve();
      });
    });
  } catch (e) {
    results.testError = e.message;
  }

  res.json(results);
});

// Protected routes (require authentication)
app.use('/api/solve', authenticate, solveRouter);
app.use('/api/analyze', authenticate, analyzeRouter);
app.use('/api/fetch', authenticate, fetchRouter);
app.use('/api/run', authenticate, runRouter);
app.use('/api/fix', authenticate, fixRouter);
app.use('/api/transcribe', authenticate, transcribeRouter);
app.use('/api/interview/prep', authenticate, interviewPrepRouter);
app.use('/api/interview', authenticate, interviewRouter);
app.use('/api/diagram', authenticate, diagramRouter);
app.use('/api/extract', authenticate, extractRouter);

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
  logger.info({ port: PORT, env: config.NODE_ENV }, 'Chundu API server started');
});

// Track connections for graceful shutdown
server.on('connection', (socket) => {
  trackConnection(socket);
});

// Setup graceful shutdown handlers
setupGracefulShutdown(server);
