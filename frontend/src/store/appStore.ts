import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, DifficultyLevel, ExecutionMode, SolutionData, ResponseMetadata } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Problem input
      problemText: '',
      sampleInput: '',
      sampleOutput: '',
      testCases: [],
      difficulty: null,

      // Execution
      mode: 'fast',
      isLoading: false,
      error: null,

      // Result
      result: null,
      metadata: null,
      warnings: [],

      // Streaming
      streamingText: '',
      isStreaming: false,

      // UI state
      theme: 'dark',
      highlightedLine: null,

      // Actions
      setProblemText: (text: string) => set({ problemText: text }),
      setSampleInput: (text: string) => set({ sampleInput: text }),
      setSampleOutput: (text: string) => set({ sampleOutput: text }),
      setDifficulty: (level: DifficultyLevel | null) => set({ difficulty: level }),
      setMode: (mode: ExecutionMode) => set({ mode }),
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      setHighlightedLine: (line: number | null) => set({ highlightedLine: line }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      setResult: (result: SolutionData | null, metadata: ResponseMetadata | null, warnings: string[]) =>
        set({ result, metadata, warnings, isStreaming: false, streamingText: '' }),
      setStreaming: (isStreaming: boolean) => set({ isStreaming }),
      appendStreamingText: (text: string) => set((state) => ({ streamingText: state.streamingText + text })),
      clearStreaming: () => set({ streamingText: '', isStreaming: false }),
      addTestCase: () =>
        set((state) => ({
          testCases: [...state.testCases, { id: generateId(), input: '', output: '' }],
        })),
      removeTestCase: (id: string) =>
        set((state) => ({
          testCases: state.testCases.filter((tc) => tc.id !== id),
        })),
      updateTestCase: (id: string, field: 'input' | 'output', value: string) =>
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === id ? { ...tc, [field]: value } : tc
          ),
        })),
      clearAll: () =>
        set({
          problemText: '',
          sampleInput: '',
          sampleOutput: '',
          testCases: [],
          difficulty: null,
          result: null,
          metadata: null,
          warnings: [],
          error: null,
          highlightedLine: null,
        }),
    }),
    {
      name: 'interview-coder-storage',
      partialize: (state) => ({
        theme: state.theme,
        mode: state.mode,
      }),
    }
  )
);
