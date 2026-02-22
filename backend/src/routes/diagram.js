import { Router } from 'express';
import * as eraser from '../services/eraser.js';
import * as pythonDiagrams from '../services/pythonDiagrams.js';
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
 * POST /api/diagram/generate
 * Generate a cloud architecture diagram using Python diagrams library
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { question, cloudProvider, difficulty, category, format } = req.body;

    if (!question) {
      throw new AppError(
        'Question is required',
        ErrorCode.VALIDATION_ERROR,
        'Please provide a system design question'
      );
    }

    // Check if Python diagrams is configured
    if (!pythonDiagrams.isConfigured()) {
      throw new AppError(
        'Diagram generation not configured',
        ErrorCode.EXTERNAL_API_ERROR,
        'ANTHROPIC_API_KEY is not set'
      );
    }

    const result = await pythonDiagrams.generateDiagram({
      question,
      cloudProvider: cloudProvider || 'auto',
      difficulty: difficulty || 'medium',
      category: category || 'System Design',
      format: format || 'png'
    });

    if (!result.success) {
      throw new AppError(
        'Diagram generation failed',
        ErrorCode.EXTERNAL_API_ERROR,
        result.error
      );
    }

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
 * Check if diagram services are configured
 */
router.get('/status', (req, res) => {
  res.json({
    eraser: eraser.isConfigured(),
    pythonDiagrams: pythonDiagrams.isConfigured()
  });
});

export default router;
