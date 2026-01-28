import { useState } from 'react';
import ProviderToggle from './components/ProviderToggle';
import CodeEditor from './components/CodeEditor';

const API_URL = import.meta.env.VITE_API_URL || '';

async function solveWithStream(problem, provider, language, onChunk) {
  const response = await fetch(API_URL + '/api/solve/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem, provider, language }),
  });

  if (!response.ok) throw new Error('Failed to solve problem');

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
          if (data.chunk) onChunk(data.chunk);
          if (data.done && data.result) result = data.result;
          if (data.error) throw new Error(data.error);
        } catch (e) {
          if (e.message !== 'Unexpected end of JSON input') console.error('SSE error:', e);
        }
      }
    }
  }
  return result;
}

export default function App() {
  const [provider, setProvider] = useState('claude');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solution, setSolution] = useState(null);
  const [streamText, setStreamText] = useState('');

  // Input state
  const [inputMode, setInputMode] = useState('text'); // text, url, screenshot
  const [problemText, setProblemText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [language, setLanguage] = useState('auto');

  const handleSolve = async () => {
    if (!problemText.trim()) return;
    setError(null);
    setSolution(null);
    setStreamText('');
    setLoading(true);

    try {
      const result = await solveWithStream(problemText, provider, language, (chunk) => {
        setStreamText(prev => prev + chunk);
      });
      if (result) setSolution(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStreamText('');
    }
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setError(null);
    setSolution(null);
    setStreamText('');
    setLoading(true);

    try {
      const fetchRes = await fetch(API_URL + '/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!fetchRes.ok) throw new Error('Failed to fetch URL');
      const fetchData = await fetchRes.json();
      setProblemText(fetchData.problemText || '');

      const result = await solveWithStream(fetchData.problemText, provider, language, (chunk) => {
        setStreamText(prev => prev + chunk);
      });
      if (result) setSolution(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStreamText('');
    }
  };

  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSolution(null);
    setStreamText('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('provider', provider);
      formData.append('mode', 'extract');

      const response = await fetch(API_URL + '/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract text');
      const data = await response.json();
      const extracted = data.text || '';
      setProblemText(extracted);

      if (extracted.trim()) {
        const result = await solveWithStream(extracted, provider, language, (chunk) => {
          setStreamText(prev => prev + chunk);
        });
        if (result) setSolution(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStreamText('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Minimal Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">C</div>
          <span className="text-sm font-semibold text-slate-300">Capra</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300"
          >
            <option value="auto">Auto</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="bash">Bash</option>
            <option value="sql">SQL</option>
          </select>
          <ProviderToggle provider={provider} onChange={setProvider} />
        </div>
      </header>

      {/* Main Content - Two Column */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input */}
        <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900/30">
          {/* Input Mode Tabs */}
          <div className="flex border-b border-slate-800">
            {['text', 'url', 'screenshot'].map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  inputMode === mode
                    ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Input Content */}
          <div className="flex-1 flex flex-col p-3">
            {inputMode === 'text' && (
              <>
                <textarea
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="Paste problem statement here..."
                  className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSolve}
                  disabled={loading || !problemText.trim()}
                  className="mt-3 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  {loading ? 'Solving...' : 'Solve'}
                </button>
              </>
            )}

            {inputMode === 'url' && (
              <>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={loading || !urlInput.trim()}
                  className="mt-3 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  {loading ? 'Fetching...' : 'Fetch & Solve'}
                </button>
                {problemText && (
                  <div className="mt-3 flex-1 overflow-auto">
                    <div className="text-xs text-slate-500 mb-1">Extracted:</div>
                    <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-2 max-h-40 overflow-auto">
                      {problemText.slice(0, 500)}...
                    </div>
                  </div>
                )}
              </>
            )}

            {inputMode === 'screenshot' && (
              <>
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshot}
                    className="hidden"
                  />
                  <svg className="w-10 h-10 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-slate-500">Click to upload screenshot</span>
                </label>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeEditor
            code={solution?.code}
            language={solution?.language}
            complexity={solution?.complexity}
            examples={solution?.examples}
            streamingText={loading ? streamText : null}
            pitch={solution?.pitch}
          />
        </div>
      </div>
    </div>
  );
}
