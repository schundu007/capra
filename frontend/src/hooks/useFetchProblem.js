import { useState, useCallback } from 'react';
import { getApiUrl } from './useElectron';
import { getAuthHeaders } from '../utils/authHeaders';

const API_URL = getApiUrl();

/**
 * Hook for fetching problems from URLs (HackerRank, LeetCode, etc.)
 */
export function useFetchProblem() {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchProblem = useCallback(async (url) => {
    setIsFetching(true);
    setFetchError(null);

    try {
      const response = await fetch(API_URL + '/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch problem');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return {
        problem: result.problem,
        codeTemplate: result.codeTemplate || null,
        language: result.language || 'auto',
        platform: result.platform || 'unknown',
      };
    } catch (err) {
      setFetchError(err.message);
      throw err;
    } finally {
      setIsFetching(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFetchError(null);
    setIsFetching(false);
  }, []);

  return {
    isFetching,
    fetchError,
    fetchProblem,
    reset,
  };
}

/**
 * Hook for analyzing screenshots
 */
export function useScreenshotAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const analyzeScreenshot = useCallback(async (imageData, provider = 'claude') => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch(API_URL + '/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ image: imageData, provider }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze screenshot');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.text || result.problem || '';
    } catch (err) {
      setAnalysisError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysisError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    isAnalyzing,
    analysisError,
    analyzeScreenshot,
    reset,
  };
}

export default useFetchProblem;
