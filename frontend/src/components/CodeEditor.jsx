import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LANG_MAP = { python: 'python', bash: 'bash', javascript: 'javascript', typescript: 'typescript', sql: 'sql' };
const RUNNABLE = ['python', 'bash', 'javascript', 'typescript', 'sql'];
const API_URL = import.meta.env.VITE_API_URL || '';

export default function CodeEditor({ code: initialCode, language, complexity, examples, streamingText, pitch }) {
  const [code, setCode] = useState(initialCode || '');
  const [editing, setEditing] = useState(false);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [input, setInput] = useState('');
  const [fixPrompt, setFixPrompt] = useState('');
  const [showFix, setShowFix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPitch, setShowPitch] = useState(false);

  useEffect(() => {
    setCode(initialCode || '');
    setEditing(false);
    setOutput(null);
    if (examples?.[0]?.input) setInput(examples[0].input);
  }, [initialCode, examples]);

  const canRun = RUNNABLE.includes(language);

  const handleRun = async () => {
    if (!code || !canRun) return;
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch(API_URL + '/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input, args: '' }),
      });
      setOutput(await res.json());
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleFix = async () => {
    if (!fixPrompt.trim() || !code) return;
    setFixing(true);
    try {
      const res = await fetch(API_URL + '/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, error: fixPrompt, language, provider: 'openai' }),
      });
      const data = await res.json();
      if (data.code) {
        setCode(data.code);
        setFixPrompt('');
        setShowFix(false);
        setOutput({ success: true, output: 'Code updated' });
      }
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setFixing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Empty state
  if (!code && !streamingText) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <p className="text-sm">Submit a problem to generate code</p>
        </div>
      </div>
    );
  }

  // Streaming state
  if (streamingText && !code) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-400">Generating...</span>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-sm font-mono text-slate-400 whitespace-pre-wrap">{streamingText}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          {language && <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded">{language}</span>}
          {complexity && (
            <>
              <span className="text-xs text-slate-500">{complexity.time}</span>
              <span className="text-xs text-slate-600">|</span>
              <span className="text-xs text-slate-500">{complexity.space}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {pitch && (
            <button onClick={() => setShowPitch(!showPitch)} className={`px-2 py-1 text-xs rounded ${showPitch ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
              Pitch
            </button>
          )}
          <button onClick={() => setEditing(!editing)} className={`px-2 py-1 text-xs rounded ${editing ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
            {editing ? 'Done' : 'Edit'}
          </button>
          <button onClick={() => setShowFix(!showFix)} className={`px-2 py-1 text-xs rounded ${showFix ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
            Fix
          </button>
          {canRun && (
            <button onClick={handleRun} disabled={running} className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded font-medium">
              {running ? '...' : 'Run'}
            </button>
          )}
          <button onClick={handleCopy} className="px-2 py-1 text-xs bg-slate-800 text-slate-400 hover:text-slate-200 rounded">
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Pitch Panel */}
      {showPitch && pitch && (
        <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/20 text-sm text-amber-200/80 max-h-32 overflow-auto">
          {pitch}
        </div>
      )}

      {/* Fix Panel */}
      {showFix && (
        <div className="px-3 py-2 bg-purple-500/5 border-b border-purple-500/20 flex gap-2">
          <input
            value={fixPrompt}
            onChange={(e) => setFixPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFix()}
            placeholder="Describe fix..."
            className="flex-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <button onClick={handleFix} disabled={fixing || !fixPrompt.trim()} className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white rounded">
            {fixing ? '...' : 'Apply'}
          </button>
        </div>
      )}

      {/* Code Area */}
      <div className="flex-1 overflow-auto">
        {editing ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent text-slate-200 font-mono text-sm p-4 resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter
            language={LANG_MAP[language] || 'python'}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '13px' }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Input & Output Panel */}
      <div className="border-t border-slate-800">
        {/* Input Row */}
        {canRun && (
          <div className="px-3 py-2 bg-slate-900/50 flex items-center gap-2 border-b border-slate-800">
            <span className="text-xs text-slate-500 w-12">Input:</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="stdin input..."
              className="flex-1 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono focus:outline-none"
            />
            {examples?.length > 0 && (
              <div className="flex gap-1">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(ex.input || '')}
                    className="px-2 py-1 text-xs bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    Ex{i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className={`px-4 py-3 text-sm font-mono max-h-40 overflow-auto ${output.success ? 'text-emerald-400' : 'text-red-400'}`}>
            <pre className="whitespace-pre-wrap">{output.success ? output.output : output.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
