import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import solveRouter from './routes/solve.js';
import analyzeRouter from './routes/analyze.js';
import fetchRouter from './routes/fetch.js';
import runRouter from './routes/run.js';
import fixRouter from './routes/fix.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/solve', solveRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/fetch', fetchRouter);
app.use('/api/run', runRouter);
app.use('/api/fix', fixRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Capra API running on port ${PORT}`);
});
