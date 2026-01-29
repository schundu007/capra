import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const API_URL = import.meta.env.VITE_API_URL || '';

// Custom dark theme (similar to the screenshot - colorful on dark bg)
const darkTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#1a1a1a',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: '#e5e5e5',
  },
};

// Custom light theme
const lightTheme = {
  ...oneLight,
  'pre[class*="language-"]': {
    ...oneLight['pre[class*="language-"]'],
    background: 'transparent',
  },
  'code[class*="language-"]': {
    ...oneLight['code[class*="language-"]'],
    color: '#1a1a1a',
  },
};

export default function CodeDisplay({ code: initialCode, language, complexity, onLineHover, examples, onCodeUpdate, streamingText, theme = 'dark' }) {
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

  const isDark = theme === 'dark';

  useEffect(() => {
    setCode(initialCode);
    setFixAttempts(0);
    setIsEditing(false);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
  const currentTheme = isDark ? darkTheme : lightTheme;

  if (!code && !streamingText) {
    return (
      <div className="h-full flex flex-col">
        <div className={`px-4 py-2.5 border-b ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Code</span>
          </div>
        </div>
        <div className={`flex-1 flex flex-col items-center justify-center p-8 ${isDark ? 'bg-neutral-900 text-neutral-500' : 'bg-white text-neutral-400'}`}>
          <div className={`p-4 rounded-md mb-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
            <svg className={`w-8 h-8 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <p className="text-sm">Submit a problem to see solution</p>
        </div>
      </div>
    );
  }

  // Show streaming text while generating
  if (streamingText && !code) {
    return (
      <div className="h-full flex flex-col">
        <div className={`px-4 py-2.5 border-b ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 animate-pulse ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Generating...</span>
            <div className="flex gap-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-neutral-400' : 'bg-neutral-900'}`} style={{ animationDelay: '0ms' }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-neutral-400' : 'bg-neutral-900'}`} style={{ animationDelay: '150ms' }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-neutral-400' : 'bg-neutral-900'}`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
        <div className={`flex-1 overflow-auto scrollbar-thin p-4 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
          <pre className={`text-sm font-mono whitespace-pre-wrap ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{streamingText}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Code</span>
          </div>
          {language && (
            <span className={`px-2 py-0.5 text-xs rounded uppercase font-medium ${isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-700'}`}>
              {language}
            </span>
          )}
          {complexity && (
            <div className="flex gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                {complexity.time}
              </span>
              <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                {complexity.space}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Edit toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2 py-1 text-xs rounded transition-all duration-200 flex items-center gap-1 ${
              isEditing
                ? isDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
                : isDark ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
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
            className={`px-2 py-1 text-xs rounded transition-all duration-200 flex items-center gap-1 ${
              showFixPrompt
                ? isDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
                : isDark ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
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
            className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
              showInput
                ? isDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
                : isDark ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            Input
          </button>
          {/* Run button - always visible, disabled for non-runnable languages */}
          <button
            onClick={handleRun}
            disabled={running || !canRun}
            title={!canRun ? `${language || 'This language'} cannot be run locally` : 'Run code'}
            className={`px-3 py-1 text-xs rounded font-medium transition-all duration-200 flex items-center gap-1.5 ${
              isDark
                ? 'bg-green-600 hover:bg-green-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white'
            }`}
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
          <button
            onClick={handleCopy}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${isDark ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}
          >
            {copied ? (
              <>
                <svg className={`w-3.5 h-3.5 ${isDark ? 'text-green-400' : 'text-neutral-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Fix prompt panel */}
      {showFixPrompt && (
        <div className={`px-4 py-3 border-b animate-fade-in ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
          <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Describe what to fix or improve:</label>
          <div className="flex gap-2">
            <input
              value={fixPrompt}
              onChange={(e) => setFixPrompt(e.target.value)}
              placeholder="e.g., Handle edge case when input is empty, Add error handling..."
              className={`flex-1 px-3 py-2 border rounded text-sm focus:outline-none ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500'
                  : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleManualFix()}
            />
            <button
              onClick={handleManualFix}
              disabled={fixing || !fixPrompt.trim()}
              className={`px-4 py-2 text-xs rounded font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isDark
                  ? 'bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 text-neutral-900'
                  : 'bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white'
              }`}
            >
              {fixing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fixing...
                </>
              ) : (
                'Apply Fix'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Input panel */}
      {showInput && (
        <div className={`px-4 py-3 border-b space-y-3 animate-fade-in ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
          {examples && examples.length > 0 && (
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Test Case</label>
              <div className="flex gap-1.5 flex-wrap">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleChange(idx)}
                    className={`px-2.5 py-1 text-xs rounded transition-all duration-200 ${
                      selectedExample === idx
                        ? isDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
                        : isDark ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    }`}
                  >
                    Example {idx + 1}
                  </button>
                ))}
              </div>
              {examples[selectedExample]?.expected && (
                <div className={`mt-2 px-3 py-2 border rounded ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                  <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Expected: </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>{examples[selectedExample].expected}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Input (stdin)</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for the program..."
              className={`w-full h-16 px-3 py-2 border rounded text-sm resize-none focus:outline-none font-mono ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500'
                  : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'
              }`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Arguments (command line)</label>
            <input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="e.g. arg1 arg2"
              className={`w-full px-3 py-2 border rounded text-sm focus:outline-none font-mono ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500'
                  : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'
              }`}
            />
          </div>
        </div>
      )}

      {/* Code area - editable or syntax highlighted */}
      <div className={`flex-1 overflow-auto scrollbar-thin ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
        {isEditing ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`w-full h-full font-mono text-sm p-4 resize-none focus:outline-none ${isDark ? 'bg-[#1a1a1a] text-neutral-100' : 'bg-transparent text-neutral-900'}`}
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter
            language={syntaxLanguage}
            style={currentTheme}
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
              background: isDark ? '#1a1a1a' : 'transparent',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
            lineNumberStyle={{
              minWidth: '2.5em',
              paddingRight: '1em',
              color: isDark ? '#525252' : '#a3a3a3',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Output panel */}
      {(output || fixing) && (
        <div className={`border-t animate-fade-in ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className={`px-4 py-2 flex items-center justify-between ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>Output</span>
              {fixing && (
                <span className={`px-2 py-0.5 text-xs rounded border animate-pulse ${isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-200 text-neutral-600 border-neutral-300'}`}>
                  Fixing...
                </span>
              )}
              {fixAttempts > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded border ${isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-200 text-neutral-600 border-neutral-300'}`}>
                  Fix #{fixAttempts}
                </span>
              )}
            </div>
            <button
              onClick={() => { setOutput(null); }}
              className={`p-1 rounded transition-colors ${isDark ? 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {output && (
            <pre className={`p-4 text-sm font-mono overflow-auto max-h-[40vh] scrollbar-thin ${
              isDark ? 'bg-[#1a1a1a]' : 'bg-white'
            } ${output.success ? (isDark ? 'text-green-400' : 'text-neutral-900') : 'text-red-500'}`}>
              {output.success ? output.output : output.error}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
