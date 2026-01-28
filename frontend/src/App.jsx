import { useState, useRef, useCallback } from 'react';
import ProblemInput from './components/ProblemInput';
import ScreenshotUpload from './components/ScreenshotUpload';
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

  // Resizable panel widths (percentages)
  const [panelWidths, setPanelWidths] = useState({ input: 25, code: 35, explanation: 40 });
  const containerRef = useRef(null);
  const isDragging = useRef(null);

  const handleMouseDown = useCallback((divider) => (e) => {
    e.preventDefault();
    isDragging.current = divider;
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

    setPanelWidths(prev => {
      if (isDragging.current === 'first') {
        // Dragging between input and code
        const newInput = Math.max(15, Math.min(40, percentX));
        const diff = newInput - prev.input;
        return {
          input: newInput,
          code: Math.max(20, prev.code - diff),
          explanation: prev.explanation
        };
      } else if (isDragging.current === 'second') {
        // Dragging between code and explanation
        const inputCodeWidth = prev.input + prev.code;
        const newCodeEnd = Math.max(prev.input + 20, Math.min(80, percentX));
        const newCode = newCodeEnd - prev.input;
        return {
          input: prev.input,
          code: newCode,
          explanation: Math.max(20, 100 - prev.input - newCode)
        };
      }
      return prev;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const resetState = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
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
    <div className="h-screen flex flex-col bg-neutral-950 text-white font-sans">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-white">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-white tracking-tight">
            Capra
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <PlatformStatus />
          <ProviderToggle provider={provider} onChange={setProvider} />
        </div>
      </header>

      {/* Main content */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Input panel */}
        <div className="flex flex-col bg-neutral-900 border-r border-neutral-800" style={{width: `${panelWidths.input}%`}}>
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

            {/* Loading Progress */}
            <LoadingProgress type={loadingType} isActive={isLoading} />

            {error && (
              <ErrorDisplay
                error={error}
                type={errorType}
                onDismiss={() => setError(null)}
              />
            )}
          </div>
        </div>

        {/* Resize handle 1 */}
        <div
          onMouseDown={handleMouseDown('first')}
          className="w-1 bg-neutral-800 hover:bg-neutral-600 cursor-col-resize transition-colors flex-shrink-0 group"
        >
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-0.5 h-8 bg-neutral-700 group-hover:bg-neutral-500 rounded-full transition-colors" />
          </div>
        </div>

        {/* Code panel */}
        <div className="flex flex-col bg-neutral-900 border-r border-neutral-800" style={{width: `${panelWidths.code}%`}}>
          <CodeDisplay
            code={solution?.code}
            language={solution?.language}
            complexity={solution?.complexity}
            onLineHover={setHighlightedLine}
            examples={solution?.examples}
            streamingText={isLoading && loadingType === 'solve' ? streamingText : null}
          />
        </div>

        {/* Resize handle 2 */}
        <div
          onMouseDown={handleMouseDown('second')}
          className="w-1 bg-neutral-800 hover:bg-neutral-600 cursor-col-resize transition-colors flex-shrink-0 group"
        >
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-0.5 h-8 bg-neutral-700 group-hover:bg-neutral-500 rounded-full transition-colors" />
          </div>
        </div>

        {/* Explanation panel */}
        <div className="flex flex-col bg-neutral-900" style={{width: `${panelWidths.explanation}%`}}>
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
