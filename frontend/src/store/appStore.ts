import { useState, useCallback } from 'react';
import type {
  AppState,
  DifficultyLevel,
  ExecutionMode,
  SolutionData,
  ResponseMetadata,
  TestCase,
} from '../types';

// Simple React hooks-based store implementation
// This provides the same interface as a Zustand store but uses React state

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useAppStore(): AppState {
  // Problem input
  const [problemText, setProblemText] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);

  // Execution
  const [mode, setMode] = useState<ExecutionMode>('fast');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result
  const [result, setResultState] = useState<SolutionData | null>(null);
  const [metadata, setMetadata] = useState<ResponseMetadata | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Streaming
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setStreaming] = useState(false);

  // UI state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  // Actions
  const setResult = useCallback((
    newResult: SolutionData | null,
    newMetadata: ResponseMetadata | null,
    newWarnings: string[]
  ) => {
    setResultState(newResult);
    setMetadata(newMetadata);
    setWarnings(newWarnings);
  }, []);

  const appendStreamingText = useCallback((text: string) => {
    setStreamingText(prev => prev + text);
  }, []);

  const clearStreaming = useCallback(() => {
    setStreamingText('');
    setStreaming(false);
  }, []);

  const addTestCase = useCallback(() => {
    setTestCases(prev => [...prev, { id: generateId(), input: '', output: '' }]);
  }, []);

  const removeTestCase = useCallback((id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  }, []);

  const updateTestCase = useCallback((id: string, field: 'input' | 'output', value: string) => {
    setTestCases(prev => prev.map(tc =>
      tc.id === id ? { ...tc, [field]: value } : tc
    ));
  }, []);

  const clearAll = useCallback(() => {
    setProblemText('');
    setSampleInput('');
    setSampleOutput('');
    setTestCases([]);
    setDifficulty(null);
    setResultState(null);
    setMetadata(null);
    setWarnings([]);
    setStreamingText('');
    setStreaming(false);
    setError(null);
  }, []);

  return {
    // State
    problemText,
    sampleInput,
    sampleOutput,
    testCases,
    difficulty,
    mode,
    isLoading,
    error,
    result,
    metadata,
    warnings,
    streamingText,
    isStreaming,
    theme,
    highlightedLine,

    // Actions
    setProblemText,
    setSampleInput,
    setSampleOutput,
    setDifficulty,
    setMode,
    setTheme,
    setHighlightedLine,
    setLoading,
    setError,
    setResult,
    setStreaming,
    appendStreamingText,
    clearStreaming,
    addTestCase,
    removeTestCase,
    updateTestCase,
    clearAll,
  };
}
