import { Router } from 'express';
import * as interviewPrepService from '../services/interviewPrep.js';

const router = Router();

// Stream all sections
router.post('/stream', async (req, res) => {
  const { jobDescription, resume, coverLetter, prepMaterials, sections, provider = 'claude', model } = req.body;

  if (!jobDescription || !resume) {
    return res.status(400).json({ error: 'Job description and resume are required' });
  }

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ error: 'At least one section must be specified' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const inputs = { jobDescription, resume, coverLetter, prepMaterials };

  try {
    for await (const event of interviewPrepService.generateAllSections(inputs, sections, provider, model)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (err) {
    console.error('[InterviewPrep] Stream error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

// Regenerate a single section
router.post('/section', async (req, res) => {
  const { jobDescription, resume, coverLetter, prepMaterials, section, provider = 'claude', model } = req.body;

  if (!jobDescription || !resume) {
    return res.status(400).json({ error: 'Job description and resume are required' });
  }

  if (!section) {
    return res.status(400).json({ error: 'Section is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const inputs = { jobDescription, resume, coverLetter, prepMaterials };

  try {
    for await (const event of interviewPrepService.generateSection(section, inputs, provider, model)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (err) {
    console.error('[InterviewPrep] Section error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;
