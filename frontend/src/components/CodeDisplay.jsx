import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

const RUNNABLE = ['python', 'bash', 'javascript', 'typescript', 'sql', 'c', 'cpp', 'java', 'go', 'rust'];

const API_URL = getApiUrl();

function getAuthHeaders() {
  const token = localStorage.getItem('capra_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Capra dark green theme
const hackerRankTheme = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: '#0f2518',
    margin: 0,
    padding: '12px',
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    color: '#e0e0e0',
    background: 'transparent',
  },
};

export default function CodeDisplay({ code: initialCode, language, onLineHover, examples, onCodeUpdate, onExplanationsUpdate, isStreaming }) {
  const normalizedLanguage = language?.toLowerCase() || 'python';
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [output, setOutput] = useState(null);
  const [input, setInput] = useState('');
  const [selectedExample, setSelectedExample] = useState(0);
  const [fixAttempts, setFixAttempts] = useState(0);
  const [showTestInput, setShowTestInput] = useState(false);
  const [outputHeight, setOutputHeight] = useState(160);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setFixAttempts(0);
    setOutput(null);
  }, [initialCode]);

  useEffect(() => {
    if (examples && examples.length > 0 && code) {
      setInput(examples[0]?.input || '');
      setSelectedExample(0);
    }
  }, [examples, initialCode]);

  const handleRun = async () => {
    if (!code || !RUNNABLE.includes(normalizedLanguage)) return;
    setRunning(true);
    setOutput(null);
    try {
      const response = await fetch(API_URL + '/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code, language: normalizedLanguage, input }),
      });
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleFix = async () => {
    if (!output || output.success) return;

    setFixing(true);
    try {
      const response = await fetch(API_URL + '/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          code,
          error: output.error || 'Unknown error',
          language: normalizedLanguage,
          provider: 'openai'
        }),
      });
      const data = await response.json();
      if (data.code) {
        setCode(data.code);
        setFixAttempts(prev => prev + 1);
        setOutput(null);
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
    } catch (err) {}
  };

  const handleExampleSelect = (idx) => {
    setSelectedExample(idx);
    if (examples?.[idx]) {
      setInput(examples[idx].input || '');
    }
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = outputHeight;

    const handleMouseMove = (e) => {
      const delta = startY - e.clientY;
      const newHeight = Math.max(80, Math.min(400, startHeight + delta));
      setOutputHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const syntaxLanguage = LANGUAGE_MAP[normalizedLanguage] || 'python';
  const canRun = RUNNABLE.includes(normalizedLanguage);

  // Empty state
  if (!code && !isStreaming) {
    return (
      <div className="h-full flex flex-col bg-[#1e1e1e]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1ba94c]" />
          <span className="text-xs font-medium text-gray-400">Code</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming && !code) {
    return (
      <div className="h-full flex flex-col bg-[#1e1e1e]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1ba94c]" />
          <span className="text-xs font-medium text-gray-400">Code</span>
          <div className="flex gap-1 ml-2">
            <span className="w-1 h-1 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">Generating...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1ba94c]" />
          <span className="text-xs font-medium text-gray-400">Code</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">{normalizedLanguage}</span>
        </div>
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs font-medium rounded transition-colors text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-auto scrollbar-dark">
        <SyntaxHighlighter
          language={syntaxLanguage}
          style={hackerRankTheme}
          showLineNumbers
          wrapLines
          lineProps={(lineNumber) => ({
            style: { cursor: 'pointer' },
            onMouseEnter: () => onLineHover?.(lineNumber),
            onMouseLeave: () => onLineHover?.(null),
          })}
          customStyle={{
            margin: 0,
            padding: '12px',
            background: '#1e1e1e',
            fontSize: '13px',
            lineHeight: '1.6',
            minHeight: '100%',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#6e7681',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Footer - Run/Submit buttons */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#0a1a10', borderTop: '1px solid #1a3a25' }}>
        <div className="flex items-center gap-3">
          {/* Test input toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#b0b0b0' }}>
            <input
              type="checkbox"
              checked={showTestInput}
              onChange={(e) => setShowTestInput(e.target.checked)}
              className="rounded"
              style={{ borderColor: '#1a3a25' }}
            />
            Test against custom input
          </label>
        </div>

        <div className="flex items-center gap-2">
          {/* Fix button (only show on error) */}
          {output && !output.success && (
            <button
              onClick={handleFix}
              disabled={fixing}
              className="px-4 py-2 text-sm font-medium rounded transition-colors"
              style={{
                background: 'transparent',
                border: '1px solid #1ba94c',
                color: '#1ba94c'
              }}
            >
              {fixing ? 'Fixing...' : 'Auto Fix'}
            </button>
          )}

          {/* Run Code (green) */}
          <button
            onClick={handleRun}
            disabled={running || !canRun}
            className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
            style={{ background: '#1ba94c', color: 'white' }}
          >
            {running ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Test Input Panel */}
      {showTestInput && (
        <div className="px-4 py-3" style={{ background: '#0a1a10', borderTop: '1px solid #1a3a25' }}>
          <div className="flex items-center gap-2 mb-2">
            {examples?.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleSelect(idx)}
                className="px-3 py-1 text-xs font-medium rounded transition-colors"
                style={{
                  background: selectedExample === idx ? '#1ba94c' : '#15322a',
                  color: selectedExample === idx ? 'white' : '#b0b0b0'
                }}
              >
                Example {idx + 1}
              </button>
            ))}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter custom input..."
            className="w-full h-20 px-3 py-2 rounded font-mono text-sm resize-none"
            style={{
              background: '#15322a',
              border: '1px solid #1a3a25',
              color: '#e0e0e0'
            }}
          />
        </div>
      )}

      {/* Output Panel */}
      {output && (
        <div style={{ background: '#0a1a10', borderTop: '1px solid #1a3a25' }}>
          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="h-2 cursor-ns-resize flex items-center justify-center hover:bg-white/5 transition-colors"
            style={{ borderBottom: '1px solid #1a3a25' }}
          >
            <div className="w-8 h-0.5 rounded-full bg-slate-600" />
          </div>
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: output.success ? '#1ba94c' : '#ff6b6b' }}>
              {output.success ? 'Output' : 'Error'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output.success ? output.output : output.error);
                }}
                className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                style={{ color: '#b0b0b0' }}
                title="Copy output"
              >
                Copy
              </button>
              <button
                onClick={() => setOutput(null)}
                style={{ color: '#7a7a7a' }}
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <pre
            className="px-4 py-3 text-sm font-mono overflow-auto select-text"
            style={{
              color: output.success ? '#1ba94c' : '#ff6b6b',
              height: `${outputHeight}px`,
              minHeight: '80px',
              maxHeight: '400px',
              userSelect: isResizing ? 'none' : 'text'
            }}
          >
            {output.success ? output.output : output.error}
          </pre>
        </div>
      )}
    </div>
  );
}
