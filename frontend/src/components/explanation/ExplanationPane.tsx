import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { explainCode, ExplainResponse } from '../../services/api';

export function ExplanationPane() {
  const { isLoading, isStreaming, streamingText, problemText } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Auto-fetch explanation when streaming completes
  useEffect(() => {
    if (!isStreaming && streamingText && !explanation && !isExplaining) {
      setIsExplaining(true);
      setExplainError(null);

      explainCode(problemText, streamingText)
        .then((data) => {
          setExplanation(data);
        })
        .catch((err) => {
          setExplainError(err.message || 'Failed to generate explanation');
        })
        .finally(() => {
          setIsExplaining(false);
        });
    }
  }, [isStreaming, streamingText, explanation, isExplaining, problemText]);

  // Reset explanation when new streaming starts
  useEffect(() => {
    if (isStreaming) {
      setExplanation(null);
      setExplainError(null);
    }
  }, [isStreaming]);

  if (isLoading && !isStreaming) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="px-4 py-3 pane-header">
          <h2 className="text-sm font-semibold text-white">Explanation</h2>
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
          <div className="h-4 skeleton rounded w-5/6" />
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="px-4 py-3 pane-header">
          <h2 className="text-sm font-semibold text-white">Explanation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm">Generating code...</span>
            </div>
            <p className="text-slate-500 text-sm">Explanation will appear after code generation</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading explanation
  if (isExplaining) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="px-4 py-3 pane-header">
          <h2 className="text-sm font-semibold text-white">Explanation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Generating explanation...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show explanation
  if (explanation) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="px-4 py-3 pane-header">
          <h2 className="text-sm font-semibold text-white">Code Walkthrough</h2>
        </div>
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Thought Process */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Approach</h3>
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {explanation.thought_process}
              </p>
            </div>
          </div>

          {/* Line by Line */}
          {explanation.lines.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Line by Line</h3>
              <div className="space-y-2">
                {explanation.lines.map((line, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-700 text-slate-400 text-xs font-mono rounded">
                        {line.line}
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="block text-xs font-mono text-emerald-400 mb-1 truncate">
                          {line.code}
                        </code>
                        <p className="text-xs text-slate-400">
                          {line.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (explainError) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="px-4 py-3 pane-header">
          <h2 className="text-sm font-semibold text-white">Explanation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-2">{explainError}</p>
            <button
              onClick={() => {
                setExplainError(null);
                setIsExplaining(true);
                explainCode(problemText, streamingText)
                  .then(setExplanation)
                  .catch((e) => setExplainError(e.message))
                  .finally(() => setIsExplaining(false));
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="px-4 py-3 pane-header">
        <h2 className="text-sm font-semibold text-white">Explanation</h2>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium mb-2">No explanation yet</p>
          <p className="text-sm text-slate-600">Generate a solution first</p>
        </div>
      </div>
    </div>
  );
}
