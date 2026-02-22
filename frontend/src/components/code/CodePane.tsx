import { useState, useEffect, useRef } from 'react';
import { CodeEditor } from './CodeEditor';
import { CopyButton } from './CopyButton';
import { useAppStore } from '../../store/appStore';
import { executeCode } from '../../services/api';

export function CodePane() {
  const { result, isLoading, metadata, setHighlightedLine, isStreaming, streamingText } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<{ text: string; isError: boolean; time?: number } | null>(null);
  const streamRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (streamRef.current && isStreaming) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamingText, isStreaming]);

  const handleRunCode = async () => {
    const codeToRun = streamingText || result?.code;
    if (!codeToRun) return;

    setIsRunning(true);
    setOutput(null);

    try {
      const response = await executeCode({ code: codeToRun, timeout: 15 });
      setOutput({
        text: response.success ? response.output : response.error,
        isError: !response.success,
        time: response.execution_time_ms,
      });
    } catch (error) {
      setOutput({
        text: error instanceof Error ? error.message : 'Execution failed',
        isError: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Streaming view
  if (isStreaming || (streamingText && !result)) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 pane-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h2 className="text-sm font-semibold text-white">Solution</h2>
            </div>
            {isStreaming && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live</span>
              </div>
            )}
            {!isStreaming && streamingText && (
              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                Complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {streamingText && !isStreaming && (
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="run-button flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 transition-all"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Run Code
                  </>
                )}
              </button>
            )}
            {streamingText && <CopyButton text={streamingText} />}
          </div>
        </div>

        {/* Code Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`overflow-hidden ${output ? 'h-3/5' : 'flex-1'}`}>
            <pre
              ref={streamRef}
              className="h-full overflow-auto p-4 text-sm font-mono text-slate-100 leading-relaxed whitespace-pre bg-slate-950/50"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
            >
              {streamingText || (
                <span className="text-slate-500">Generating solution...</span>
              )}
              {isStreaming && <span className="inline-block w-2 h-5 ml-0.5 bg-emerald-400 animate-pulse" />}
            </pre>
          </div>

          {/* Output Panel */}
          {output && (
            <div className="h-2/5 border-t border-slate-700/50 flex flex-col animate-slideUp">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-2 text-xs font-medium ${output.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                    {output.isError ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {output.isError ? 'Error' : 'Output'}
                  </span>
                  {output.time && (
                    <span className="text-xs text-slate-500">
                      {output.time}ms
                    </span>
                  )}
                </div>
                <button onClick={() => setOutput(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <pre className={`flex-1 overflow-auto p-4 text-sm font-mono terminal-output ${
                output.isError ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {output.text}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (!result && !isLoading) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="flex items-center px-4 py-3 pane-header">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Solution</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-2">No solution yet</p>
            <p className="text-sm text-slate-600">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">⌘</kbd>
              <span className="mx-1">+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">Enter</kbd>
              <span className="ml-1">to analyze</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && !isStreaming) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="flex items-center px-4 py-3 pane-header">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Solution</h2>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
          <div className="h-4 skeleton rounded w-5/6" />
          <div className="h-4 skeleton rounded w-2/3" />
        </div>
      </div>
    );
  }

  // Result view
  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pane-header">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Solution</h2>
          </div>
          {result && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-slate-400">Time:</span>
                <span className="text-xs text-emerald-400 font-mono font-medium">{result.complexity.time.notation}</span>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs text-slate-400">Space:</span>
                <span className="text-xs text-blue-400 font-mono font-medium">{result.complexity.space.notation}</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {metadata && (
            <span className="text-xs text-slate-500">
              {metadata.latency_ms}ms
              {metadata.cached && (
                <span className="ml-1 text-amber-400">(cached)</span>
              )}
            </span>
          )}
          {result && (
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="run-button flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 transition-all"
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Run
                </>
              )}
            </button>
          )}
          {result && <CopyButton text={result.code} />}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden" style={{ height: output ? '60%' : '100%' }}>
        <CodeEditor onLineHover={setHighlightedLine} />
      </div>

      {/* Output Panel */}
      {output && (
        <div className="border-t border-slate-700/50 animate-slideUp" style={{ height: '40%' }}>
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 text-xs font-medium ${output.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                {output.isError ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {output.isError ? 'Error' : 'Output'}
              </span>
              {output.time && (
                <span className="text-xs text-slate-500">{output.time}ms</span>
              )}
            </div>
            <button onClick={() => setOutput(null)} className="text-slate-500 hover:text-white transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <pre className={`h-full overflow-auto p-4 text-sm font-mono terminal-output ${
            output.isError ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {output.text}
          </pre>
        </div>
      )}
    </div>
  );
}
