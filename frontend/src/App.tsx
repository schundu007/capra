import { useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import { Header } from './components/layout/Header';
import { ProblemPane } from './components/problem/ProblemPane';
import { CodePane } from './components/code/CodePane';
import { ExplanationPane } from './components/explanation/ExplanationPane';
import { useAppStore } from './store/appStore';
import { analyzeStream } from './services/api';

export default function App() {
  const { theme, clearAll, problemText, mode, setLoading, setError, setResult, sampleInput, sampleOutput, difficulty, setStreaming, appendStreamingText, clearStreaming, isStreaming, error } = useAppStore();

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to analyze with streaming
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (problemText.trim().length >= 10) {
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
        }
      }

      // Escape to clear
      if (e.key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearAll, problemText, mode, setLoading, setError, setResult, sampleInput, sampleOutput, difficulty, setStreaming, appendStreamingText, clearStreaming]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <Header />

      {/* Error Banner */}
      {error && (
        <div className="relative z-10 mx-4 mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm animate-slideDown">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {isStreaming && (
        <div className="relative z-10 mx-4 mt-2">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>
      )}

      {/* Main Three-Pane Layout */}
      <main className="flex-1 overflow-hidden p-4 relative z-10">
        <div className="h-full rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <Allotment defaultSizes={[1, 1, 1]}>
            {/* Left Pane - Problem Input */}
            <Allotment.Pane minSize={280}>
              <div className="h-full border-r border-slate-700/50">
                <ProblemPane />
              </div>
            </Allotment.Pane>

            {/* Center Pane - Code Editor */}
            <Allotment.Pane minSize={300}>
              <div className="h-full border-r border-slate-700/50">
                <CodePane />
              </div>
            </Allotment.Pane>

            {/* Right Pane - Explanations */}
            <Allotment.Pane minSize={280}>
              <ExplanationPane />
            </Allotment.Pane>
          </Allotment>
        </div>
      </main>

      {/* Footer Status */}
      <footer className="relative z-10 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
          <span>Copra v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ctrl+Enter to analyze</span>
          <span>Esc to clear</span>
        </div>
      </footer>
    </div>
  );
}
