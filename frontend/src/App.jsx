import { useState } from 'react';
import ProblemInput from './components/ProblemInput';
import ScreenshotUpload from './components/ScreenshotUpload';
import CodeDisplay from './components/CodeDisplay';
import ExplanationPanel from './components/ExplanationPanel';
import ProviderToggle from './components/ProviderToggle';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorDisplay from './components/ErrorDisplay';
import PlatformStatus from './components/PlatformStatus';

const API_URL = import.meta.env.VITE_API_URL || '';

const LOADING_MESSAGES = {
  solve: 'Analyzing problem and generating solution...',
  fetch: 'Fetching problem from URL...',
  screenshot: 'Extracting text from screenshot...',
};

export default function App() {
  const [provider, setProvider] = useState('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('default');
  const [solution, setSolution] = useState(null);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [clearScreenshot, setClearScreenshot] = useState(0);

  const resetState = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setClearScreenshot(c => c + 1);
  };

  const handleSolve = async (problem, language) => {
    resetState();
    setIsLoading(true);
    setLoadingType('solve');
    try {
      const response = await fetch(API_URL + '/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, provider, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to solve problem');
      }

      const data = await response.json();
      setSolution(data);
    } catch (err) {
      setError(err.message);
      setErrorType('solve');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleFetchUrl = async (url, language) => {
    resetState();
    setIsLoading(true);
    setLoadingType('fetch');
    try {
      const fetchResponse = await fetch(API_URL + '/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch problem from URL');
      }

      const fetchData = await fetchResponse.json();
      setLoadingType('solve');

      const solveResponse = await fetch(API_URL + '/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: fetchData.problemText, provider, language }),
      });

      if (!solveResponse.ok) {
        throw new Error('Failed to solve problem');
      }

      const data = await solveResponse.json();
      setSolution(data);
    } catch (err) {
      setError(err.message);
      setErrorType('fetch');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleScreenshot = async (file, language = 'auto') => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setClearScreenshot(c => c + 1);
    setIsLoading(true);
    setLoadingType('screenshot');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('provider', provider);
      formData.append('mode', 'extract');

      const response = await fetch(API_URL + '/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to extract text');
      }

      const data = await response.json();
      const extractedProblem = data.text || '';
      setExtractedText(extractedProblem);

      if (extractedProblem.trim()) {
        setLoadingType('solve');
        const solveResponse = await fetch(API_URL + '/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem: extractedProblem, provider, language }),
        });

        if (!solveResponse.ok) {
          throw new Error('Failed to solve problem');
        }

        const solveData = await solveResponse.json();
        setSolution(solveData);
      }
    } catch (err) {
      setError(err.message);
      setErrorType('screenshot');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Loading overlay */}
      {isLoading && (
        <LoadingOverlay message={LOADING_MESSAGES[loadingType] || 'Processing...'} />
      )}

      {/* Header */}
      <header className="gradient-border flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-base font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Capra
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <PlatformStatus />
          <ProviderToggle provider={provider} onChange={setProvider} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input panel */}
        <div className="flex flex-col bg-slate-900/50 border-r border-slate-700/50" style={{width: '25%'}}>
          <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-slate-200">Input</span>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto scrollbar-thin space-y-3">
            <ProblemInput
              onSubmit={handleSolve}
              onFetchUrl={handleFetchUrl}
              isLoading={isLoading}
              extractedText={extractedText}
              onExtractedTextClear={() => setExtractedText('')}
              shouldClear={clearScreenshot}
            />
            <ScreenshotUpload
              onUpload={handleScreenshot}
              isLoading={isLoading}
              shouldClear={clearScreenshot}
            />

            {error && (
              <ErrorDisplay
                error={error}
                type={errorType}
                onDismiss={() => setError(null)}
              />
            )}
          </div>
        </div>

        {/* Code panel */}
        <div className="flex flex-col bg-slate-900/50 border-r border-slate-700/50" style={{width: '35%'}}>
          <CodeDisplay
            code={solution?.code}
            language={solution?.language}
            complexity={solution?.complexity}
            onLineHover={setHighlightedLine}
            examples={solution?.examples}
          />
        </div>

        {/* Explanation panel */}
        <div className="flex flex-col bg-slate-900/50" style={{width: '40%'}}>
          <ExplanationPanel
            explanations={solution?.explanations}
            highlightedLine={highlightedLine}
            pitch={solution?.pitch}
          />
        </div>
      </div>
    </div>
  );
}
