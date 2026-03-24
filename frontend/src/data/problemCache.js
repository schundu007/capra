/**
 * Problem Description Cache (Frontend)
 *
 * Strategy:
 * 1. Backend handles persistent Redis cache
 * 2. This module provides utilities for accessing cached problems
 * 3. Local storage used as secondary cache for offline access
 */

import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();
const LOCAL_CACHE_KEY = 'ascend_problem_cache';

/**
 * Normalize problem name to slug format
 */
function toSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Get local cache from localStorage (secondary cache for offline)
 */
function getLocalCache() {
  try {
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Save to local cache
 */
function saveLocalCache(problems) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(problems));
  } catch (e) {
    console.warn('Failed to save local cache:', e);
  }
}

/**
 * Get cached problem from backend (Redis) or local cache
 * @param {string} problemSlug - The problem slug (e.g., "two-sum")
 * @returns {Promise<object|null>} - Cached problem data or null
 */
export async function getCachedProblem(problemSlug) {
  const slug = toSlug(problemSlug);

  try {
    // Try backend cache first
    const response = await fetch(`${API_URL}/api/fetch/cache/${slug}`);
    const data = await response.json();

    if (data.success) {
      // Also save to local cache for offline access
      const localCache = getLocalCache();
      localCache[slug] = data;
      saveLocalCache(localCache);
      return data;
    }
  } catch (e) {
    console.warn('Backend cache lookup failed:', e);
  }

  // Fallback to local cache
  const localCache = getLocalCache();
  return localCache[slug] || null;
}

/**
 * Cache a problem locally (backup cache)
 */
export function cacheProblemLocally(problemName, problemData) {
  const slug = toSlug(problemName);
  const localCache = getLocalCache();
  localCache[slug] = {
    ...problemData,
    cachedAt: Date.now()
  };
  saveLocalCache(localCache);
}

/**
 * Get cache stats from backend
 */
export async function getCacheStats() {
  try {
    const response = await fetch(`${API_URL}/api/fetch/cache/stats`);
    return await response.json();
  } catch (e) {
    // Fallback to local stats
    const localCache = getLocalCache();
    return {
      count: Object.keys(localCache).length,
      problems: Object.keys(localCache),
      source: 'local'
    };
  }
}

/**
 * Clear local problem cache
 */
export function clearLocalCache() {
  localStorage.removeItem(LOCAL_CACHE_KEY);
}

/**
 * Format problem text for display in Ascend
 * @param {object} problemData - Cached problem data
 * @returns {string} - Formatted problem text
 */
export function formatProblemText(problemData) {
  if (!problemData) return '';

  // If we have problemText from fetch, use it directly
  if (problemData.problemText) {
    return problemData.problemText;
  }

  // Otherwise, construct from parts
  let text = '';

  if (problemData.title) {
    text += `${problemData.title}\n\n`;
  }

  if (problemData.description) {
    text += `${problemData.description}\n\n`;
  }

  if (problemData.examples && problemData.examples.length > 0) {
    problemData.examples.forEach((example, i) => {
      text += `Example ${i + 1}:\n`;
      if (example.input) text += `Input: ${example.input}\n`;
      if (example.output) text += `Output: ${example.output}\n`;
      if (example.explanation) text += `Explanation: ${example.explanation}\n`;
      text += '\n';
    });
  }

  if (problemData.constraints) {
    text += `Constraints:\n${problemData.constraints}\n`;
  }

  return text.trim();
}
