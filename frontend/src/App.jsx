import { useState, useRef, useCallback } from 'react';
import ProblemInput from './components/ProblemInput';
import CodeDisplay from './components/CodeDisplay';
import ExplanationPanel from './components/ExplanationPanel';
import ProviderToggle from './components/ProviderToggle';
import LoadingProgress from './components/LoadingProgress';
import ErrorDisplay from './components/ErrorDisplay';
import PlatformStatus from './components/PlatformStatus';

const API_URL = import.meta.env.VITE_API_URL || '';

// Stream solve request using SSE
async function solveWithStream(problem, provider, language, onChunk) {
  const response = await fetch(API_URL + '/api/solve/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem, provider, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to solve problem');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.chunk) {
            onChunk(data.chunk);
          }
          if (data.done && data.result) {
            result = data.result;
          }
          if (data.error) {
            throw new Error(data.error);
          }
        } catch (e) {
          if (e.message !== 'Unexpected end of JSON input') {
            console.error('SSE parse error:', e);
          }
        }
      }
    }
  }

  return result;
}

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

  // Resizable panel width (percentage for left panel)
  const [leftPanelWidth, setLeftPanelWidth] = useState(55);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalWidth = rect.width;
    const percentX = (x / totalWidth) * 100;

    // Constrain between 30% and 70%
    const newWidth = Math.max(30, Math.min(70, percentX));
    setLeftPanelWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const resetState = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
  };

  const handleClearAll = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setExtractedText('');
    setStreamingText('');
    setClearScreenshot(c => c + 1);
  };

  const [streamingText, setStreamingText] = useState('');

  const handleSolve = async (problem, language) => {
    resetState();
    setStreamingText('');
    setIsLoading(true);
    setLoadingType('solve');
    try {
      const result = await solveWithStream(problem, provider, language, (chunk) => {
        setStreamingText(prev => prev + chunk);
      });
      if (result) {
        setSolution(result);
      }
    } catch (err) {
      setError(err.message);
      setErrorType('solve');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      setStreamingText('');
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

      const result = await solveWithStream(fetchData.problemText, provider, language, (chunk) => {
        setStreamingText(prev => prev + chunk);
      });
      if (result) {
        setSolution(result);
      }
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
        const result = await solveWithStream(extractedProblem, provider, language, (chunk) => {
          setStreamingText(prev => prev + chunk);
        });
        if (result) {
          setSolution(result);
        }
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
    <div className="h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-neutral-900">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-neutral-900 tracking-tight">
            Capra
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <PlatformStatus />
          <ProviderToggle provider={provider} onChange={setProvider} />
        </div>
      </header>

      {/* Main content - 2 panel layout */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Left panel: Input + Code stacked */}
        <div className="flex flex-col bg-white border-r border-neutral-200" style={{width: `${leftPanelWidth}%`}}>
          {/* Input section */}
          <div className="p-3 border-b border-neutral-200">
            <ProblemInput
              onSubmit={handleSolve}
              onFetchUrl={handleFetchUrl}
              onScreenshot={handleScreenshot}
              onClear={handleClearAll}
              isLoading={isLoading}
              extractedText={extractedText}
              onExtractedTextClear={() => setExtractedText('')}
              shouldClear={clearScreenshot}
              hasSolution={!!solution}
            />

            {/* Loading Progress */}
            {isLoading && (
              <div className="mt-3">
                <LoadingProgress type={loadingType} isActive={isLoading} />
              </div>
            )}

            {error && (
              <div className="mt-3">
                <ErrorDisplay
                  error={error}
                  type={errorType}
                  onDismiss={() => setError(null)}
                />
              </div>
            )}
          </div>

          {/* Code section */}
          <div className="flex-1 overflow-hidden">
            <CodeDisplay
              code={solution?.code}
              language={solution?.language}
              complexity={solution?.complexity}
              onLineHover={setHighlightedLine}
              examples={solution?.examples}
              streamingText={isLoading && loadingType === 'solve' ? streamingText : null}
            />
          </div>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 bg-neutral-200 hover:bg-neutral-400 cursor-col-resize transition-colors flex-shrink-0 group"
        >
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-0.5 h-8 bg-neutral-300 group-hover:bg-neutral-500 rounded-full transition-colors" />
          </div>
        </div>

        {/* Right panel: Explanation */}
        <div className="flex flex-col bg-white" style={{width: `${100 - leftPanelWidth}%`}}>
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
