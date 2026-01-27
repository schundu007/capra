import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

export default function CodeDisplay({ code: initialCode, language, complexity, onLineHover, examples, onCodeUpdate }) {
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

  useEffect(() => {
    setCode(initialCode);
    setFixAttempts(0);
  }, [initialCode]);

  useEffect(() => {
    if (examples && examples.length > 0 && code) {
      const firstInput = examples[0].input || '';
      setInput(firstInput);
      setSelectedExample(0);
      setShowInput(true);
      runWithInput(firstInput);
    }
  }, [examples, code]);

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
      if (!data.success && data.error && fixAttempts < 3) {
        handleAutoFix(data.error);
      }
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
      runWithInput(newInput);
    }
  };

  const handleAutoFix = async (errorMessage) => {
    if (fixAttempts >= 3) {
      return;
    }
    setFixing(true);
    try {
      const response = await fetch(API_URL + '/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, error: errorMessage, language, provider: 'openai' }),
      });
      const data = await response.json();
      if (data.code) {
        setCode(data.code);
        setFixAttempts(prev => prev + 1);
        setOutput({ success: true, output: `Fixed (attempt ${fixAttempts + 1}). Click Run to test.` });
        if (onCodeUpdate) onCodeUpdate(data.code);
      }
    } catch (err) {
      console.error('Auto-fix failed:', err);
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
      if (!data.success && data.error && fixAttempts < 3) {
        handleAutoFix(data.error);
      }
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const syntaxLanguage = LANGUAGE_MAP[language] || 'python';
  const canRun = RUNNABLE.includes(language);

  if (!code) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-2 py-1.5 bg-slate-800 border-b border-slate-700">
          <span className="text-xs font-medium text-slate-300">Code</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          <p>Submit a problem to see solution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">Code</span>
          {language && (
            <span className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 rounded uppercase">{language}</span>
          )}
          {complexity && (
            <div className="flex gap-2 text-xs">
              <span className="text-green-400">{complexity.time}</span>
              <span className="text-blue-400">{complexity.space}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canRun && (
            <>
              <button
                onClick={() => setShowInput(!showInput)}
                className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
              >
                Input
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded transition-colors"
              >
                {running ? '...' : 'Run'}
              </button>
            </>
          )}
          <button
            onClick={handleCopy}
            className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {showInput && (
        <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 space-y-2">
          {examples && examples.length > 0 && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Test Case</label>
              <div className="flex gap-1">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleChange(idx)}
                    className={`px-2 py-1 text-xs rounded ${selectedExample === idx ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    Example {idx + 1}
                  </button>
                ))}
              </div>
              {examples[selectedExample]?.expected && (
                <div className="mt-1 text-xs text-slate-400">
                  Expected: <span className="text-green-400">{examples[selectedExample].expected}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Input (stdin)</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for the program..."
              className="w-full h-16 p-2 bg-slate-900 text-slate-100 rounded border border-slate-700 focus:border-blue-500 focus:outline-none resize-none text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Arguments (command line)</label>
            <input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="e.g. arg1 arg2"
              className="w-full p-2 bg-slate-900 text-slate-100 rounded border border-slate-700 focus:border-blue-500 focus:outline-none text-sm font-mono"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={syntaxLanguage}
          style={vscDarkPlus}
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
      </div>

      {(output || fixing) && (
        <div className="border-t border-slate-700">
          <div className="px-4 py-2 bg-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300">Output</span>
              {fixing && <span className="text-xs text-yellow-400">Auto-fixing...</span>}
              {fixAttempts > 0 && <span className="text-xs text-blue-400">Fix #{fixAttempts}</span>}
            </div>
            <button
              onClick={() => { setOutput(null); setFixAttempts(0); }}
              className="text-slate-400 hover:text-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {output && (
            <pre className={'p-4 text-sm font-mono overflow-auto min-h-32 max-h-[50vh] ' + (output.success ? 'text-green-400' : 'text-red-400')}>
              {output.success ? output.output : output.error}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
