import { useCallback } from 'react';
import { analyzeStream } from '../../services/api';
import { useAppStore } from '../../store/appStore';

export function ActionBar() {
  const {
    problemText,
    sampleInput,
    sampleOutput,
    difficulty,
    mode,
    isLoading,
    isStreaming,
    setLoading,
    setError,
    setStreaming,
    appendStreamingText,
    clearStreaming,
  } = useAppStore();

  const canAnalyze = problemText.trim().length >= 10 && !isLoading && !isStreaming;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

    setError(null);
    clearStreaming();
    setStreaming(true);
    setLoading(true);

    try {
      await analyzeStream(
        {
          problem_text: problemText,
          sample_input: sampleInput || undefined,
          sample_output: sampleOutput || undefined,
          difficulty: difficulty || undefined,
          mode,
        },
        (chunk) => appendStreamingText(chunk),
        () => {
          setStreaming(false);
          setLoading(false);
        },
        (error) => {
          setError(error);
          setStreaming(false);
          setLoading(false);
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze problem');
      setStreaming(false);
      setLoading(false);
    }
  }, [
    canAnalyze,
    problemText,
    sampleInput,
    sampleOutput,
    difficulty,
    mode,
    setLoading,
    setError,
    setStreaming,
    appendStreamingText,
    clearStreaming,
  ]);

  return (
    <div className="space-y-3">
      {/* Main Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isLoading || isStreaming ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            {isStreaming ? 'Generating...' : 'Analyzing...'}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate Solution
          </>
        )}
      </button>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-center text-slate-500">
        or press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">Enter</kbd>
      </p>
    </div>
  );
}
