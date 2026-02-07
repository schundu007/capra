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
function getFileExtension(mimetype, originalFilename) {
  // First, try to get extension from original filename if provided
  if (originalFilename) {
    const ext = path.extname(originalFilename).toLowerCase().replace('.', '');
    const validExtensions = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];
    if (validExtensions.includes(ext)) {
      return ext;
    }
  }

  const mimeMap = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/m4a': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/ogg;codecs=opus': 'ogg',
    'audio/oga': 'oga',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
    'video/webm': 'webm',  // Some browsers report video/webm for audio-only webm
    'video/mp4': 'm4a',
  };

  // Normalize mimetype (remove spaces, lowercase)
  const normalizedMime = (mimetype || '').toLowerCase().trim();

  // Check for exact match first
  if (mimeMap[normalizedMime]) {
    return mimeMap[normalizedMime];
  }

  // Check for partial match (e.g., 'audio/webm;codecs=opus')
  for (const [mime, ext] of Object.entries(mimeMap)) {
    const baseMime = mime.split(';')[0];
    if (normalizedMime.startsWith(baseMime)) {
      return ext;
    }
  }

  // Check if mimetype contains a known format hint
  if (normalizedMime.includes('webm')) return 'webm';
  if (normalizedMime.includes('ogg') || normalizedMime.includes('opus')) return 'ogg';
  if (normalizedMime.includes('mp4') || normalizedMime.includes('m4a')) return 'm4a';
  if (normalizedMime.includes('mp3') || normalizedMime.includes('mpeg')) return 'mp3';
  if (normalizedMime.includes('wav')) return 'wav';
  if (normalizedMime.includes('flac')) return 'flac';

  return 'webm'; // default - widely supported
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

    // Get proper file extension based on mimetype and original filename
    const extension = getFileExtension(req.file.mimetype, req.file.originalname);
    const filename = `audio_${Date.now()}.${extension}`;

    console.log('[Transcribe] Detected extension:', extension, 'from mimetype:', req.file.mimetype, 'originalname:', req.file.originalname);

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
