import { Router } from 'express';
import * as eraser from '../services/eraser.js';
import { AppError, ErrorCode } from '../middleware/errorHandler.js';

const router = Router();

/**
 * POST /api/diagram/eraser
 * Generate an architecture diagram using Eraser.io
 */
router.post('/eraser', async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description) {
      throw new AppError(
        'Description is required',
        ErrorCode.VALIDATION_ERROR,
        'Please provide a system design description'
      );
    }

    // Check if Eraser is configured
    if (!eraser.isConfigured()) {
      throw new AppError(
        'Eraser API not configured',
        ErrorCode.EXTERNAL_API_ERROR,
        'ERASER_API_KEY environment variable is not set'
      );
    }

    const result = await eraser.generateDiagram(description);

    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(
        'Failed to generate diagram',
        ErrorCode.EXTERNAL_API_ERROR,
        error.message
      ));
    }
  }
});

/**
 * GET /api/diagram/status
 * Check if Eraser API is configured
 */
router.get('/status', (req, res) => {
  res.json({
    configured: eraser.isConfigured()
  });
});

export default router;
