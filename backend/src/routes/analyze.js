/**
 * Analyze Route
 * Handles image analysis and text extraction
 */

import { Router } from 'express';
import multer from 'multer';
import * as claude from '../services/claude.js';
import * as openai from '../services/openai.js';
import { ValidationError } from '../lib/errors.js';
import { asyncHandler, sendSuccess } from '../lib/response.js';
import { validateAnalyzeRequest, validateFile, ALLOWED_IMAGE_TYPES } from '../lib/validators.js';
import { config } from '../lib/config.js';
import { createLogger } from '../lib/logger.js';

const router = Router();
const logger = createLogger('routes:analyze');

/**
 * Multer configuration for image uploads
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          { allowedTypes: ALLOWED_IMAGE_TYPES, receivedType: file.mimetype }
        )
      );
    }
  },
});

/**
 * Multer error handling middleware
 */
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      logger.warn('Upload error', {
        requestId: req.id,
        error: err.message,
        code: err.code,
      });

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ValidationError(
              `File too large. Maximum size: ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB`,
              { maxSize: config.upload.maxFileSize }
            )
          );
        }
        return next(new ValidationError(err.message));
      }

      return next(err);
    }
    next();
  });
};

/**
 * POST /api/analyze
 * Analyze an image (extract text or solve problem)
 *
 * @body {File} image - Image file to analyze
 * @body {string} [provider='claude'] - AI provider (claude/openai)
 * @body {string} [mode='extract'] - Analysis mode (extract/analyze)
 */
router.post(
  '/',
  handleUpload,
  asyncHandler(async (req, res) => {
    // Validate file was provided
    const fileValidation = validateFile(req.file, {
      maxSize: config.upload.maxFileSize,
      allowedTypes: ALLOWED_IMAGE_TYPES,
    });

    if (!fileValidation.valid) {
      throw new ValidationError(fileValidation.error, fileValidation.details);
    }

    // Validate request body
    const bodyValidation = validateAnalyzeRequest(req.body);
    if (!bodyValidation.valid) {
      throw new ValidationError(bodyValidation.error, bodyValidation.details);
    }

    const { provider = 'claude', mode = 'extract' } = req.body;
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    logger.info('Analyzing image', {
      requestId: req.id,
      provider,
      mode,
      mimeType,
      fileSize: req.file.size,
    });

    // Select AI service
    const service = provider === 'openai' ? openai : claude;

    // Process based on mode
    const result =
      mode === 'extract'
        ? await service.extractText(base64Image, mimeType)
        : await service.analyzeImage(base64Image, mimeType);

    logger.info('Image analyzed', {
      requestId: req.id,
      provider,
      mode,
      hasResult: !!result,
    });

    sendSuccess(res, result, {
      metadata: {
        provider,
        mode,
        requestId: req.id,
        timestamp: new Date().toISOString(),
      },
    });
  })
);

export default router;
