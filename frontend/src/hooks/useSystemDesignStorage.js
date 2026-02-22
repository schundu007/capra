import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'capra_system_design_sessions';
const MAX_SESSIONS = 50; // Limit to prevent localStorage bloat

/**
 * Custom hook for persisting system design sessions
 * Stores questions, answers, and Q&A history in localStorage
 */
export function useSystemDesignStorage() {
  const [sessions, setSessions] = useState({});
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load system design sessions:', error);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  const persistSessions = useCallback((updatedSessions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Failed to save system design sessions:', error);
      // If storage is full, try removing oldest sessions
      if (error.name === 'QuotaExceededError') {
        const sortedIds = Object.keys(updatedSessions).sort(
          (a, b) => updatedSessions[a].timestamp - updatedSessions[b].timestamp
        );
        // Remove oldest 10 sessions
        const idsToRemove = sortedIds.slice(0, 10);
        idsToRemove.forEach(id => delete updatedSessions[id]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
        setSessions(updatedSessions);
      }
    }
  }, []);

  /**
   * Save a new system design session
   * @param {Object} params - Session data
   * @param {string} params.problem - The problem text/URL
   * @param {string} params.source - Source type: 'text', 'url', 'image'
   * @param {Object} params.systemDesign - The generated system design object
   * @param {string} params.detailLevel - 'basic' or 'full'
   * @returns {string} The session ID
   */
  const saveSession = useCallback(({ problem, source, systemDesign, detailLevel }) => {
    const sessionId = `sd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newSession = {
      id: sessionId,
      timestamp: Date.now(),
      problem: problem?.substring(0, 500), // Limit problem text size
      source: source || 'text',
      detailLevel: detailLevel || 'full',
      systemDesign,
      qaHistory: [],
      eraserDiagram: null,
      title: extractTitle(problem, systemDesign)
    };

    const updatedSessions = { ...sessions, [sessionId]: newSession };

    // Enforce max sessions limit
    const sessionIds = Object.keys(updatedSessions);
    if (sessionIds.length > MAX_SESSIONS) {
      const sortedIds = sessionIds.sort(
        (a, b) => updatedSessions[a].timestamp - updatedSessions[b].timestamp
      );
      const idsToRemove = sortedIds.slice(0, sessionIds.length - MAX_SESSIONS);
      idsToRemove.forEach(id => delete updatedSessions[id]);
    }

    persistSessions(updatedSessions);
    setCurrentSessionId(sessionId);
    return sessionId;
  }, [sessions, persistSessions]);

  /**
   * Update an existing session (e.g., add Q&A, update diagram)
   * @param {string} sessionId - The session to update
   * @param {Object} updates - Partial session data to merge
   */
  const updateSession = useCallback((sessionId, updates) => {
    if (!sessionId || !sessions[sessionId]) {
      console.warn('Session not found:', sessionId);
      return;
    }

    const updatedSessions = {
      ...sessions,
      [sessionId]: {
        ...sessions[sessionId],
        ...updates,
        lastUpdated: Date.now()
      }
    };

    persistSessions(updatedSessions);
  }, [sessions, persistSessions]);

  /**
   * Add a Q&A entry to a session
   * @param {string} sessionId - The session ID
   * @param {string} question - The follow-up question
   * @param {string} answer - The AI's answer
   */
  const addQAToSession = useCallback((sessionId, question, answer) => {
    if (!sessionId || !sessions[sessionId]) {
      console.warn('Session not found for Q&A:', sessionId);
      return;
    }

    const existingQA = sessions[sessionId].qaHistory || [];
    const newQA = {
      id: `qa_${Date.now()}`,
      question,
      answer,
      timestamp: Date.now()
    };

    updateSession(sessionId, {
      qaHistory: [...existingQA, newQA]
    });
  }, [sessions, updateSession]);

  /**
   * Update the Eraser diagram for a session
   * @param {string} sessionId - The session ID
   * @param {Object} diagram - { imageUrl, editUrl }
   */
  const updateEraserDiagram = useCallback((sessionId, diagram) => {
    updateSession(sessionId, { eraserDiagram: diagram });
  }, [updateSession]);

  /**
   * Delete a session
   * @param {string} sessionId - The session to delete
   */
  const deleteSession = useCallback((sessionId) => {
    setSessions(prevSessions => {
      const updatedSessions = { ...prevSessions };
      delete updatedSessions[sessionId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      } catch (error) {
        console.error('Failed to save sessions after delete:', error);
      }
      return updatedSessions;
    });

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId]);

  /**
   * Get a session by ID
   * @param {string} sessionId - The session ID
   * @returns {Object|null} The session data
   */
  const getSession = useCallback((sessionId) => {
    return sessions[sessionId] || null;
  }, [sessions]);

  /**
   * Get all sessions sorted by timestamp (newest first)
   * @returns {Array} Sorted array of sessions
   */
  const getAllSessions = useCallback(() => {
    return Object.values(sessions).sort((a, b) => b.timestamp - a.timestamp);
  }, [sessions]);

  /**
   * Clear all sessions
   */
  const clearAllSessions = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessions({});
    setCurrentSessionId(null);
  }, []);

  /**
   * Load a saved session back into the app
   * @param {string} sessionId - The session to load
   * @returns {Object|null} The session data for loading
   */
  const loadSession = useCallback((sessionId) => {
    const session = sessions[sessionId];
    if (session) {
      setCurrentSessionId(sessionId);
      return session;
    }
    return null;
  }, [sessions]);

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    saveSession,
    updateSession,
    addQAToSession,
    updateEraserDiagram,
    deleteSession,
    getSession,
    getAllSessions,
    loadSession,
    clearAllSessions
  };
}

/**
 * Extract a title from the problem or system design overview
 */
function extractTitle(problem, systemDesign) {
  // Try to get title from system design overview
  if (systemDesign?.overview) {
    const overview = systemDesign.overview;
    // Take first sentence or first 60 chars
    const firstSentence = overview.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length <= 80) {
      return firstSentence.trim();
    }
    return overview.substring(0, 60).trim() + '...';
  }

  // Fall back to problem text
  if (problem) {
    // Check if it's a URL
    if (problem.startsWith('http')) {
      try {
        const url = new URL(problem);
        return url.hostname + url.pathname.substring(0, 30);
      } catch {
        return problem.substring(0, 60);
      }
    }
    // Take first line or first 60 chars
    const firstLine = problem.split('\n')[0];
    if (firstLine && firstLine.length <= 80) {
      return firstLine.trim();
    }
    return problem.substring(0, 60).trim() + '...';
  }

  return 'Untitled System Design';
}

export default useSystemDesignStorage;
