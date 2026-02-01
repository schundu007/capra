import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getApiUrl } from '../hooks/useElectron';

const LANGUAGE_MAP = {
  python: 'python',
  bash: 'bash',
  terraform: 'hcl',
  jenkins: 'groovy',
  yaml: 'yaml',
  sql: 'sql',
  javascript: 'javascript',
  typescript: 'typescript',
};

const RUNNABLE = ['python', 'bash', 'javascript', 'typescript', 'sql'];

const API_URL = getApiUrl();

function getAuthHeaders() {
  const token = localStorage.getItem('capra_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Premium dark theme
const premiumDarkTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: 'transparent',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: '#e4e4e7',
  },
};

export default function CodeDisplay({ code: initialCode, language, complexity, onLineHover, examples, onCodeUpdate, onExplanationsUpdate, isStreaming }) {
  const normalizedLanguage = language?.toLowerCase() || 'python';
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [output, setOutput] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [args, setArgs] = useState('');
  const [selectedExample, setSelectedExample] = useState(0);
  const [fixAttempts, setFixAttempts] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [fixPrompt, setFixPrompt] = useState('');
  const [showFixPrompt, setShowFixPrompt] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setFixAttempts(0);
    setIsEditing(false);
    setOutput(null); // Clear output when code changes
  }, [initialCode]);

  useEffect(() => {
    if (examples && examples.length > 0 && code && !isEditing) {
      const firstInput = examples[0].input || '';
      setInput(firstInput);
      setSelectedExample(0);
      setShowInput(true);
    }
  }, [examples, initialCode]);

  const runWithInput = async (inputValue) => {
    if (!code || !RUNNABLE.includes(language)) return;
    setRunning(true);
    setOutput(null);
    try {
      const response = await fetch(API_URL + '/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code, language: normalizedLanguage, input: inputValue, args }),
      });
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleExampleChange = (index) => {
    setSelectedExample(index);
    if (examples && examples[index]) {
      const newInput = examples[index].input || '';
      setInput(newInput);
    }
  };

  const handleManualFix = async () => {
    if (!fixPrompt.trim()) return;
    setFixing(true);
    try {
      const response = await fetch(API_URL + '/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          code,
          error: fixPrompt,
          language: normalizedLanguage,
          provider: 'openai'
        }),
      });
      const data = await response.json();
      if (data.code) {
        setCode(data.code);
        setFixAttempts(prev => prev + 1);
        setOutput({ success: true, output: `Fixed based on: "${fixPrompt}"` });
        setFixPrompt('');
        setShowFixPrompt(false);
        if (onCodeUpdate) onCodeUpdate(data.code);
        if (onExplanationsUpdate && data.explanations) {
          onExplanationsUpdate(data.explanations);
        }
      }
    } catch (err) {
      setOutput({ success: false, error: 'Fix failed: ' + err.message });
    } finally {
      setFixing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const response = await fetch(API_URL + '/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code, language: normalizedLanguage, input, args }),
      });
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const syntaxLanguage = LANGUAGE_MAP[normalizedLanguage] || 'python';
  const canRun = RUNNABLE.includes(normalizedLanguage);

  // Empty state - no code and not streaming
  if (!code && !isStreaming) {
    return (
      <div className="h-full flex flex-col panel-left">
        <div className="px-5 py-3 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-transparent">
          <span className="text-sm font-semibold text-white">Code</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
            <div className="relative glass-card p-8 rounded-3xl">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-base font-medium text-slate-400 text-center">Submit a problem to see solution</p>
              <p className="text-sm text-slate-500 text-center mt-2">Paste a problem, URL, or upload a screenshot</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state - waiting for code to appear
  if (isStreaming && !code) {
    return (
      <div className="h-full flex flex-col panel-left">
        <div className="px-5 py-3 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">Generating Code</span>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">Analyzing problem and generating solution...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col panel-left h-full">
      {/* Header - sticky */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">Code</span>
        </div>

        <div className="flex items-center gap-2">
            {/* Edit toggle */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isEditing
                  ? 'bg-white text-zinc-900'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {isEditing ? 'Editing' : 'Edit'}
            </button>

            {/* Fix with prompt */}
            <button
              onClick={() => setShowFixPrompt(!showFixPrompt)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
                showFixPrompt
                  ? 'bg-white text-zinc-900'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fix
            </button>

            {/* Input toggle */}
            <button
              onClick={() => setShowInput(!showInput)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                showInput
                  ? 'bg-white text-zinc-900'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              Input
            </button>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={running || !canRun}
              title={!canRun ? `${language || 'This language'} cannot be run locally` : 'Run code'}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {running ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Run
                </>
              )}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {/* Fix prompt panel */}
        {showFixPrompt && (
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] animate-fade-in">
              <label className="block text-xs mb-2 font-medium text-zinc-400">Describe what to fix or improve:</label>
              <div className="flex gap-2">
                <input
                  value={fixPrompt}
                  onChange={(e) => setFixPrompt(e.target.value)}
                  placeholder="e.g., Handle edge case when input is empty, Add error handling..."
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleManualFix()}
                />
                <button
                  onClick={handleManualFix}
                  disabled={fixing || !fixPrompt.trim()}
                  className="btn-primary px-4 py-2 text-xs disabled:opacity-40"
                >
                  {fixing ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Fixing...
                    </span>
                  ) : (
                    'Apply Fix'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Input panel */}
          {showInput && (
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] space-y-3 animate-fade-in">
              {examples && examples.length > 0 && (
                <div>
                  <label className="block text-xs mb-2 font-medium text-zinc-400">Test Case</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {examples.map((ex, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleChange(idx)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                          selectedExample === idx
                            ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/20'
                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        Example {idx + 1}
                      </button>
                    ))}
                  </div>
                  {examples[selectedExample]?.expected && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-xs text-emerald-400/70">Expected: </span>
                      <span className="text-xs font-mono text-emerald-400">{examples[selectedExample].expected}</span>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs mb-2 font-medium text-zinc-400">Input (stdin)</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input for the program..."
                  className="input-field h-16 resize-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs mb-2 font-medium text-zinc-400">Arguments (command line)</label>
                <input
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder="e.g. arg1 arg2"
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Code area - no scroll, shows all code */}
          <div className="bg-zinc-900/50">
            {isEditing ? (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed bg-transparent text-zinc-100"
                style={{ minHeight: '200px', height: `${Math.max(200, (code?.split('\n').length || 1) * 20 + 40)}px` }}
                spellCheck={false}
              />
            ) : (
              <SyntaxHighlighter
                language={syntaxLanguage}
                style={premiumDarkTheme}
                showLineNumbers
                wrapLines
                lineProps={(lineNumber) => ({
                  style: { cursor: 'pointer' },
                  onMouseEnter: () => onLineHover && onLineHover(lineNumber),
                  onMouseLeave: () => onLineHover && onLineHover(null),
                })}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '12px',
                  lineHeight: '1.7',
                }}
                lineNumberStyle={{
                  minWidth: '2.5em',
                  paddingRight: '1em',
                  color: '#3f3f46',
                  userSelect: 'none',
                }}
              >
                {code}
              </SyntaxHighlighter>
            )}
          </div>

          {/* Output panel */}
          {(output || fixing) && (
            <div className="border-t border-white/5 animate-fade-in">
              <div className="px-4 py-2.5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">Output</span>
                  {fixing && (
                    <span className="px-2 py-0.5 text-xs rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                      Fixing...
                    </span>
                  )}
                  {fixAttempts > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-lg bg-white/5 text-zinc-400 border border-white/5">
                      Fix #{fixAttempts}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setOutput(null); }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {output && (
                <pre className={`p-4 text-sm font-mono overflow-auto max-h-[40vh] scrollbar-thin bg-zinc-900/50 ${
                  output.success ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {output.success ? output.output : output.error}
                </pre>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
