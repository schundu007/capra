import { useState } from 'react';
import ProblemInput from './components/ProblemInput';
import ScreenshotUpload from './components/ScreenshotUpload';
import CodeDisplay from './components/CodeDisplay';
import ExplanationPanel from './components/ExplanationPanel';
import ProviderToggle from './components/ProviderToggle';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [provider, setProvider] = useState('claude');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solution, setSolution] = useState(null);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [clearScreenshot, setClearScreenshot] = useState(0);

  const resetState = () => {
    setSolution(null);
    setError(null);
    setClearScreenshot(c => c + 1);
  };

  const handleSolve = async (problem, language) => {
    resetState();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchUrl = async (url, language) => {
    resetState();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshot = async (file, language = 'auto') => {
    setSolution(null);
    setError(null);
    setClearScreenshot(c => c + 1);
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <h1 className="text-sm font-bold">Interview Coder</h1>
        <ProviderToggle provider={provider} onChange={setProvider} />
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col bg-slate-900 border-r-2 border-slate-700" style={{width: '25%'}}>
          <div className="px-2 py-1.5 bg-slate-800 border-b border-slate-700">
            <span className="text-xs font-medium text-slate-300">Input</span>
          </div>
          <div className="flex-1 p-2 overflow-y-auto space-y-2">
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
              <div className="p-2 bg-red-900/50 border border-red-700 rounded text-red-200 text-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-slate-900 border-r-2 border-slate-700" style={{width: '35%'}}>
          <CodeDisplay
            code={solution?.code}
            language={solution?.language}
            complexity={solution?.complexity}
            onLineHover={setHighlightedLine}
          />
        </div>

        <div className="flex flex-col bg-slate-900" style={{width: '40%'}}>
          <ExplanationPanel
            explanations={solution?.explanations}
            highlightedLine={highlightedLine}
          />
        </div>
      </div>
    </div>
  );
}
