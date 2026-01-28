import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

// Custom monochrome theme based on oneDark
const monochromeTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: 'transparent',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: '#e5e5e5',
  },
};

export default function CodeDisplay({ code: initialCode, language, complexity, onLineHover, examples, onCodeUpdate, streamingText }) {
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
        body: JSON.stringify({ code, language, input: inputValue, args }),
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
          language,
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
        body: JSON.stringify({ code, language, input, args }),
      });
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const syntaxLanguage = LANGUAGE_MAP[language] || 'python';
  const canRun = RUNNABLE.includes(language);

  if (!code && !streamingText) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2.5 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm font-medium text-white">Code</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8">
          <div className="p-4 rounded-md bg-neutral-800 mb-4">
            <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="px-4 py-2.5 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm font-medium text-white">Generating...</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin p-4">
          <pre className="text-sm font-mono text-neutral-300 whitespace-pre-wrap">{streamingText}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm font-medium text-white">Code</span>
          </div>
          {language && (
            <span className="px-2 py-0.5 text-xs bg-neutral-700 text-neutral-300 rounded uppercase font-medium">
              {language}
            </span>
          )}
          {complexity && (
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300 border border-neutral-600">
                {complexity.time}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300 border border-neutral-600">
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
                ? 'bg-white text-black'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
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
                ? 'bg-white text-black'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
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
                ? 'bg-white text-black'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Input
          </button>
          {/* Run button - always visible for runnable languages */}
          {canRun && (
            <button
              onClick={handleRun}
              disabled={running}
              className="px-3 py-1 text-xs bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 text-black rounded font-medium transition-all duration-200 flex items-center gap-1.5"
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
          )}
          <button
            onClick={handleCopy}
            className="px-2 py-1 text-xs bg-neutral-700 text-neutral-300 hover:bg-neutral-600 rounded flex items-center gap-1"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="px-4 py-3 bg-neutral-800 border-b border-neutral-700 animate-fade-in">
          <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Describe what to fix or improve:</label>
          <div className="flex gap-2">
            <input
              value={fixPrompt}
              onChange={(e) => setFixPrompt(e.target.value)}
              placeholder="e.g., Handle edge case when input is empty, Add error handling..."
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              onKeyDown={(e) => e.key === 'Enter' && handleManualFix()}
            />
            <button
              onClick={handleManualFix}
              disabled={fixing || !fixPrompt.trim()}
              className="px-4 py-2 text-xs bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 text-black rounded font-medium transition-all duration-200 flex items-center gap-1.5"
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
        <div className="px-4 py-3 bg-neutral-850 border-b border-neutral-700 space-y-3 animate-fade-in">
          {examples && examples.length > 0 && (
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Test Case</label>
              <div className="flex gap-1.5 flex-wrap">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleChange(idx)}
                    className={`px-2.5 py-1 text-xs rounded transition-all duration-200 ${
                      selectedExample === idx
                        ? 'bg-white text-black'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                  >
                    Example {idx + 1}
                  </button>
                ))}
              </div>
              {examples[selectedExample]?.expected && (
                <div className="mt-2 px-3 py-2 bg-neutral-900 rounded">
                  <span className="text-xs text-neutral-400">Expected: </span>
                  <span className="text-xs text-white font-mono">{examples[selectedExample].expected}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Input (stdin)</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for the program..."
              className="w-full h-16 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Arguments (command line)</label>
            <input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="e.g. arg1 arg2"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Code area - editable or syntax highlighted */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {isEditing ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent text-white font-mono text-sm p-4 resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter
            language={syntaxLanguage}
            style={monochromeTheme}
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
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Output panel */}
      {(output || fixing) && (
        <div className="border-t border-neutral-700 animate-fade-in">
          <div className="px-4 py-2 bg-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Output</span>
              {fixing && (
                <span className="px-2 py-0.5 text-xs bg-neutral-700 text-neutral-300 rounded border border-neutral-600 animate-pulse">
                  Fixing...
                </span>
              )}
              {fixAttempts > 0 && (
                <span className="px-2 py-0.5 text-xs bg-neutral-700 text-neutral-300 rounded border border-neutral-600">
                  Fix #{fixAttempts}
                </span>
              )}
            </div>
            <button
              onClick={() => { setOutput(null); }}
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {output && (
            <pre className={'p-4 text-sm font-mono overflow-auto max-h-[40vh] scrollbar-thin ' + (output.success ? 'text-white' : 'text-neutral-400')}>
              {output.success ? output.output : output.error}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
