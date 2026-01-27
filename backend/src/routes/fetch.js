import { Router } from 'express';
import { fetchProblemFromUrl } from '../services/scraper.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL is required',
      });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        error: 'Invalid URL format',
      });
    }

    const result = await fetchProblemFromUrl(url);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        sourceUrl: result.sourceUrl,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({
      error: 'Failed to fetch URL',
      details: error.message,
    });
  }
});

export default router;
