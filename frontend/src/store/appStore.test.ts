import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore, type AppStore } from './appStore';
import type { StoreApi, UseBoundStore } from 'zustand';

describe('appStore', () => {
  let useStore: UseBoundStore<StoreApi<AppStore>>;

  beforeEach(() => {
    // Create a fresh store for each test (no persistence issues)
    useStore = createTestStore();
  });

  describe('Problem Slice', () => {
    it('should set extracted text', () => {
      const { setExtractedText } = useStore.getState();

      setExtractedText('Test problem text');

      expect(useStore.getState().extractedText).toBe('Test problem text');
    });

    it('should set current problem', () => {
      const { setCurrentProblem } = useStore.getState();

      setCurrentProblem('Find the maximum value');

      expect(useStore.getState().currentProblem).toBe('Find the maximum value');
    });

    it('should toggle problem expanded state', () => {
      const { toggleProblemExpanded } = useStore.getState();

      expect(useStore.getState().problemExpanded).toBe(true);

      toggleProblemExpanded();
      expect(useStore.getState().problemExpanded).toBe(false);

      toggleProblemExpanded();
      expect(useStore.getState().problemExpanded).toBe(true);
    });

    it('should clear problem state', () => {
      const { setExtractedText, setCurrentProblem, clearProblem } = useStore.getState();

      setExtractedText('Some text');
      setCurrentProblem('Some problem');

      clearProblem();

      expect(useStore.getState().extractedText).toBe('');
      expect(useStore.getState().currentProblem).toBe('');
      expect(useStore.getState().problemExpanded).toBe(true);
    });
  });

  describe('Solution Slice', () => {
    it('should set solution', () => {
      const { setSolution } = useStore.getState();

      const solution = {
        code: 'def solve(): pass',
        language: 'python',
        pitch: 'Use dynamic programming',
        explanations: [],
        complexity: { time: 'O(n)', space: 'O(1)' },
        systemDesign: null,
      };

      setSolution(solution);

      expect(useStore.getState().solution).toEqual(solution);
    });

    it('should update solution partially', () => {
      const { setSolution, updateSolution } = useStore.getState();

      setSolution({
        code: 'def solve(): pass',
        language: 'python',
        pitch: null,
        explanations: null,
        complexity: null,
        systemDesign: null,
      });

      updateSolution({ code: 'def solve(): return 42' });

      expect(useStore.getState().solution?.code).toBe('def solve(): return 42');
      expect(useStore.getState().solution?.language).toBe('python');
    });

    it('should append streaming text', () => {
      const { appendStreamingText } = useStore.getState();

      appendStreamingText('Hello ');
      appendStreamingText('World');

      expect(useStore.getState().streamingText).toBe('Hello World');
    });

    it('should clear solution state', () => {
      const { setSolution, setStreamingText, clearSolution } = useStore.getState();

      setSolution({
        code: 'test code',
        language: 'python',
        pitch: null,
        explanations: null,
        complexity: null,
        systemDesign: null,
      });
      setStreamingText('streaming...');

      clearSolution();

      expect(useStore.getState().solution).toBeNull();
      expect(useStore.getState().streamingText).toBe('');
    });
  });

  describe('UI Slice', () => {
    it('should set loading state', () => {
      const { setIsLoading, setLoadingType } = useStore.getState();

      setIsLoading(true);
      setLoadingType('solve');

      expect(useStore.getState().isLoading).toBe(true);
      expect(useStore.getState().loadingType).toBe('solve');
    });

    it('should set error with type', () => {
      const { setError } = useStore.getState();

      setError('Something went wrong', 'solve');

      expect(useStore.getState().error).toBe('Something went wrong');
      expect(useStore.getState().errorType).toBe('solve');
    });

    it('should clear error', () => {
      const { setError, clearError } = useStore.getState();

      setError('Error message', 'credits');
      clearError();

      expect(useStore.getState().error).toBeNull();
      expect(useStore.getState().errorType).toBe('default');
    });

    it('should detect when modal is open', () => {
      const { setShowSettings, isModalOpen } = useStore.getState();

      expect(isModalOpen()).toBe(false);

      setShowSettings(true);

      expect(isModalOpen()).toBe(true);
    });
  });

  describe('Mode Slice', () => {
    it('should set ascend mode', () => {
      const { setAscendMode } = useStore.getState();

      setAscendMode('system-design');

      expect(useStore.getState().ascendMode).toBe('system-design');
    });

    it('should set coding language', () => {
      const { setCodingLanguage } = useStore.getState();

      setCodingLanguage('javascript');

      expect(useStore.getState().codingLanguage).toBe('javascript');
    });

    it('should set detail levels', () => {
      const { setCodingDetailLevel, setDesignDetailLevel } = useStore.getState();

      setCodingDetailLevel('detailed');
      setDesignDetailLevel('full');

      expect(useStore.getState().codingDetailLevel).toBe('detailed');
      expect(useStore.getState().designDetailLevel).toBe('full');
    });
  });

  describe('Provider Slice', () => {
    it('should set provider', () => {
      const { setProvider } = useStore.getState();

      setProvider('openai');

      expect(useStore.getState().provider).toBe('openai');
    });

    it('should set model', () => {
      const { setModel } = useStore.getState();

      setModel('gpt-4');

      expect(useStore.getState().model).toBe('gpt-4');
    });

    it('should set auto switch', () => {
      const { setAutoSwitch } = useStore.getState();

      setAutoSwitch(true);

      expect(useStore.getState().autoSwitch).toBe(true);
    });
  });

  describe('Global Actions', () => {
    it('should reset state', () => {
      const { setSolution, setError, setAutoRunOutput, resetState } = useStore.getState();

      setSolution({
        code: 'test',
        language: 'python',
        pitch: null,
        explanations: null,
        complexity: null,
        systemDesign: null,
      });
      setError('Error');
      setAutoRunOutput({ success: true, output: 'test', input: '' });

      resetState();

      expect(useStore.getState().solution).toBeNull();
      expect(useStore.getState().error).toBeNull();
      expect(useStore.getState().autoRunOutput).toBeNull();
    });

    it('should clear all state', () => {
      const { setExtractedText, setSolution, setError, clearAll } = useStore.getState();

      setExtractedText('Some problem');
      setSolution({
        code: 'test',
        language: 'python',
        pitch: null,
        explanations: null,
        complexity: null,
        systemDesign: null,
      });
      setError('Error');

      clearAll();

      expect(useStore.getState().extractedText).toBe('');
      expect(useStore.getState().solution).toBeNull();
      expect(useStore.getState().error).toBeNull();
      expect(useStore.getState().problemExpanded).toBe(true);
    });
  });
});
