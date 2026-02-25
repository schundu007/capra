import { Router } from 'express';
import * as ascendPrepService from '../services/ascendPrep.js';
import { generatePDF, generateDOCX } from '../services/exportPrep.js';
import * as pythonDiagrams from '../services/pythonDiagrams.js';

const router = Router();

/**
 * Generate diagrams for system design questions
 */
async function generateDiagramsForQuestions(result) {
  console.log('[InterviewPrep] generateDiagramsForQuestions called');
  console.log('[InterviewPrep] result?.questions:', !!result?.questions, 'count:', result?.questions?.length);
  console.log('[InterviewPrep] pythonDiagrams.isConfigured():', pythonDiagrams.isConfigured());

  if (!result?.questions || !pythonDiagrams.isConfigured()) {
    console.log('[InterviewPrep] Skipping diagram generation - no questions or not configured');
    return result;
  }

  console.log('[InterviewPrep] Generating diagrams for system design questions...');

  // Generate diagrams for each question in parallel
  const diagramPromises = result.questions.map(async (question, idx) => {
    try {
      const diagramResult = await pythonDiagrams.generateDiagram({
        question: question.title || question.question || `System Design ${idx + 1}`,
        cloudProvider: 'auto',
        difficulty: 'medium',
        category: 'System Design',
        format: 'png',
        detailLevel: 'detailed'
      });

      if (diagramResult.success && diagramResult.image_url) {
        // Use full URL for Electron (frontend runs on different port than backend)
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        question.diagramUrl = `${backendUrl}${diagramResult.image_url}`;
        question.diagramDescription = diagramResult.description || '';
        console.log(`[InterviewPrep] Diagram generated for: ${question.title}`, question.diagramUrl);
      }
    } catch (err) {
      console.error(`[InterviewPrep] Failed to generate diagram for question ${idx}:`, err.message);
      // Keep ASCII as fallback if it exists
    }
    return question;
  });

  await Promise.all(diagramPromises);
  return result;
}

// Stream all sections
router.post('/stream', async (req, res) => {
  const { jobDescription, resume, coverLetter, prepMaterials, documentation, sections, provider = 'claude', model } = req.body;

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

  const inputs = { jobDescription, resume, coverLetter, prepMaterials, documentation };

  try {
    for await (const event of ascendPrepService.generateAllSections(inputs, sections, provider, model)) {
      // Generate diagrams for system-design section when completed
      if (event.section === 'system-design' && event.status === 'completed' && event.result?.questions) {
        res.write(`data: ${JSON.stringify({ section: 'system-design', status: 'generating_diagrams' })}\n\n`);
        event.result = await generateDiagramsForQuestions(event.result);
      }
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
  const { jobDescription, resume, coverLetter, prepMaterials, documentation, section, customDocumentContent, customDocumentName, provider = 'claude', model } = req.body;

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

  const inputs = { jobDescription, resume, coverLetter, prepMaterials, documentation, customDocumentContent, customDocumentName };

  try {
    let finalResult = null;

    for await (const event of ascendPrepService.generateSection(section, inputs, provider, model)) {
      if (event.done && event.result) {
        finalResult = event.result;

        // Generate diagrams for system-design section
        if (section === 'system-design' && finalResult.questions) {
          res.write(`data: ${JSON.stringify({ status: 'generating_diagrams' })}\n\n`);
          finalResult = await generateDiagramsForQuestions(finalResult);
        }

        res.write(`data: ${JSON.stringify({ done: true, result: finalResult })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    }
  } catch (err) {
    console.error('[InterviewPrep] Section error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

// Export to PDF
router.post('/export/pdf', async (req, res) => {
  const { sections, companyName } = req.body;

  if (!sections || Object.keys(sections).length === 0) {
    return res.status(400).json({ error: 'No sections to export' });
  }

  try {
    const pdfBuffer = await generatePDF(sections, companyName || 'Interview');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="interview-prep-${companyName || 'document'}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[InterviewPrep] PDF export error:', err);
    res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
  }
});

// Export to DOCX
router.post('/export/docx', async (req, res) => {
  const { sections, companyName } = req.body;

  if (!sections || Object.keys(sections).length === 0) {
    return res.status(400).json({ error: 'No sections to export' });
  }

  try {
    const docxBuffer = await generateDOCX(sections, companyName || 'Interview');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="interview-prep-${companyName || 'document'}.docx"`);
    res.send(docxBuffer);
  } catch (err) {
    console.error('[InterviewPrep] DOCX export error:', err);
    res.status(500).json({ error: 'Failed to generate DOCX: ' + err.message });
  }
});

export default router;
