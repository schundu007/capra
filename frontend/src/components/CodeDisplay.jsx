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

const RUNNABLE = ['python', 'bash', 'javascript', 'typescript', 'sql'];

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

  const syntaxLanguage = LANGUAGE_MAP[normalizedLanguage] || 'python';
  const canRun = RUNNABLE.includes(normalizedLanguage);

  // Empty state
  if (!code && !isStreaming) {
    return (
      <div className="h-full flex flex-col" style={{ background: '#0f2518' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#0a1a10', borderBottom: '1px solid #1a3a25' }}>
          <span className="text-sm font-medium" style={{ color: '#b0b0b0' }}>Code</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ color: '#7a7a7a' }}>
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-sm">Submit a problem to generate code</p>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming && !code) {
    return (
      <div className="h-full flex flex-col" style={{ background: '#0f2518' }}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#0a1a10', borderBottom: '1px solid #1a3a25' }}>
          <span className="text-sm font-medium" style={{ color: '#b0b0b0' }}>Generating...</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1ba94c', animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1ba94c', animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1ba94c', animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm" style={{ color: '#b0b0b0' }}>Analyzing problem...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#0f2518' }}>
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#0a1a10', borderBottom: '1px solid #1a3a25' }}>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium" style={{ color: '#b0b0b0' }}>
            Language: <span className="text-white">{normalizedLanguage}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
            style={{ color: '#b0b0b0' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
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
            background: '#0f2518',
            fontSize: '14px',
            lineHeight: '1.6',
            minHeight: '100%',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#5a7a65',
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
          <pre className="px-4 py-3 text-sm font-mono overflow-auto max-h-40 select-text" style={{ color: output.success ? '#1ba94c' : '#ff6b6b' }}>
            {output.success ? output.output : output.error}
          </pre>
        </div>
      )}
    </div>
  );
}
