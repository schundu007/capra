import { Router } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { getApiKey as getOpenAIKey } from '../services/openai.js';
import { AppError, ErrorCode } from '../middleware/errorHandler.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const router = Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit (Whisper API limit)
});

// Map mimetypes to file extensions that Whisper accepts
function getFileExtension(mimetype) {
  const mimeMap = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/ogg': 'ogg',
    'audio/flac': 'flac',
  };

  // Check for exact match first
  if (mimeMap[mimetype]) {
    return mimeMap[mimetype];
  }

  // Check for partial match (e.g., 'audio/webm;codecs=opus')
  for (const [mime, ext] of Object.entries(mimeMap)) {
    if (mimetype?.startsWith(mime.split(';')[0])) {
      return ext;
    }
  }

  return 'webm'; // default
}

// POST /api/transcribe - Transcribe audio using Whisper API
router.post('/', upload.single('audio'), async (req, res, next) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      throw new AppError('No audio file provided', ErrorCode.VALIDATION_ERROR);
    }

    console.log('[Transcribe] Received file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const apiKey = getOpenAIKey();
    if (!apiKey) {
      throw new AppError('OpenAI API key not configured', ErrorCode.UNAUTHORIZED);
    }

    // Get proper file extension based on mimetype
    const extension = getFileExtension(req.file.mimetype);
    const filename = `audio_${Date.now()}.${extension}`;

    // Write to a temp file - this is the most reliable approach for Whisper
    tempFilePath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    console.log('[Transcribe] Wrote temp file:', tempFilePath, 'size:', req.file.buffer.length);

    const openai = new OpenAI({ apiKey });

    // Use fs.createReadStream which OpenAI SDK handles well
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    console.log('[Transcribe] Success, text length:', transcription?.length);

    res.json({
      success: true,
      text: transcription,
    });
  } catch (error) {
    console.error('[Transcribe] Error:', error.message, error.status, error.code);
    next(new AppError(
      'Failed to transcribe audio',
      ErrorCode.INTERNAL_ERROR,
      error.message
    ));
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
});

export default router;
