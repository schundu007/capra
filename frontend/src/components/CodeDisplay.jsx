import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getApiUrl } from '../hooks/useElectron';
import SystemDesignPanel from './SystemDesignPanel';

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
  const token = localStorage.getItem('chundu_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// AI-inspired dark theme
const hackerRankTheme = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: '#0a0a0b',
    margin: 0,
    padding: '12px',
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    color: '#e4e4e7',
    background: 'transparent',
  },
};

const CodeDisplay = forwardRef(function CodeDisplay({ code: initialCode, language, onLineHover, examples, onCodeUpdate, onExplanationsUpdate, isStreaming, autoRunOutput, ascendMode, systemDesign, eraserDiagram, autoGenerateEraser, onGenerateEraserDiagram, question, cloudProvider }, ref) {
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
  const [outputHeight, setOutputHeight] = useState(120);
  const [isResizing, setIsResizing] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);

  // Handle Escape key to close expanded output modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && outputExpanded) {
        setOutputExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [outputExpanded]);

  useEffect(() => {
    setCode(initialCode);
    setFixAttempts(0);
    // Don't reset output if we have auto-run output - it arrives at the same time as code
    if (!autoRunOutput) {
      setOutput(null);
    }
  }, [initialCode]);

  // Display auto-run output when it arrives - this takes priority
  useEffect(() => {
    if (autoRunOutput) {
      setOutput(autoRunOutput);
    }
  }, [autoRunOutput]);

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

  // Expose runCode to parent via ref for keyboard shortcuts
  useImperativeHandle(ref, () => ({
    runCode: handleRun,
  }), [code, normalizedLanguage, input]);

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

  // Determine which mode we're in - completely isolated
  const isDesignMode = ascendMode === 'system-design';
  const hasSystemDesign = systemDesign?.included;

  // DESIGN MODE: Show only system design content
  if (isDesignMode) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header for Design Mode */}
        <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #e5e5e5' }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#333333' }}>System Design</span>
          </div>
        </div>

        {/* Design Content */}
        <div className="flex-1 overflow-auto p-4">
          {hasSystemDesign ? (
            <SystemDesignPanel
              systemDesign={systemDesign}
              eraserDiagram={eraserDiagram}
              autoGenerateEraser={autoGenerateEraser}
              onGenerateEraserDiagram={onGenerateEraserDiagram}
              question={question}
              cloudProvider={cloudProvider}
            />
          ) : isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: '#999999' }}>
              <div className="flex gap-1 mb-2">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#10b981', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#10b981', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#10b981', animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Generating system design...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: '#b3b3b3' }}>
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm">Submit a problem to see system design</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CODING MODE: Show only code content
  // Empty state for coding mode
  if (!code && !isStreaming) {
    return (
      <div className="h-full flex flex-col bg-[#1e1e1e]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Code</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      </div>
    );
  }

  // Streaming state for coding mode
  if (isStreaming && !code) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a0b]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" style={{ boxShadow: '0 0 6px #10b981' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Code</span>
          <div className="flex gap-0.5 ml-1.5">
            <span className="w-1 h-1 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[11px] text-gray-500">Generating code...</div>
        </div>
      </div>
    );
  }

  // CODING MODE: Full code display with all features
  return (
    <div className="h-full flex flex-col bg-[#0a0a0b]">
      {/* Header - Coding mode (no tabs) */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#a1a1aa' }}>Code</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
          >
            {normalizedLanguage}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors"
          style={{ color: '#71717a' }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#fafafa'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#71717a'; }}
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
            padding: '8px',
            background: '#0a0a0b',
            fontSize: '11px',
            lineHeight: '1.5',
            minHeight: '100%',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#52525b',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Footer - Run/Submit buttons (only for code tab) */}
      { code && (
      <div className="px-2 py-2 flex items-center justify-between" style={{ background: '#111113', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          {/* Test input toggle */}
          <label className="flex items-center gap-1.5 text-[10px] cursor-pointer" style={{ color: '#71717a' }}>
            <input
              type="checkbox"
              checked={showTestInput}
              onChange={(e) => setShowTestInput(e.target.checked)}
              className="rounded w-3 h-3"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            />
            Test custom input
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fix button (only show on error) */}
          {output && !output.success && (
            <button
              onClick={handleFix}
              disabled={fixing}
              className="px-2 py-1 text-[10px] font-medium rounded transition-colors"
              style={{
                background: 'transparent',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981'
              }}
            >
              {fixing ? 'Fixing...' : 'Auto Fix'}
            </button>
          )}

          {/* Run Code (green) */}
          <button
            onClick={handleRun}
            disabled={running || !canRun}
            className="px-2.5 py-1 text-[10px] font-semibold rounded transition-colors disabled:opacity-50 hover:opacity-90"
            style={{
              background: '#10b981',
              color: 'white',
            }}
          >
            {running ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>
      )}

      {/* Test Input Panel - only for code tab */}
      { code && showTestInput && (
        <div className="px-2 py-2" style={{ background: '#111113', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {examples?.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleSelect(idx)}
                className="px-2 py-0.5 text-[9px] font-medium rounded transition-colors"
                style={{
                  background: selectedExample === idx ? '#10b981' : 'rgba(255,255,255,0.03)',
                  color: selectedExample === idx ? 'white' : '#71717a'
                }}
              >
                Ex {idx + 1}
              </button>
            ))}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter custom input..."
            className="w-full h-16 px-2 py-1.5 rounded font-mono text-[10px] resize-none"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e4e4e7'
            }}
          />
        </div>
      )}

      {/* Output Panel - only for code tab */}
      {output && !outputExpanded && (
        <div style={{ background: '#111113', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="h-1.5 cursor-ns-resize flex items-center justify-center hover:bg-white/5 transition-colors"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="w-6 h-0.5 rounded-full" style={{ background: '#3f3f46' }} />
          </div>
          <div className="px-2 py-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium" style={{ color: output.success ? '#10b981' : '#ef4444' }}>
                {output.success ? 'Output' : 'Error'}
              </span>
              {autoRunOutput && output === autoRunOutput && (
                <span
                  className="text-[8px] px-1 py-0.5 rounded font-medium"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
                >
                  Auto
                </span>
              )}
              <span className="text-[8px]" style={{ color: '#52525b' }}>
                {(output.success ? output.output : output.error)?.split('\n').length || 0} lines
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setOutputExpanded(true)}
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
                style={{ color: '#71717a' }}
                title="Expand output"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Expand
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output.success ? output.output : output.error);
                }}
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
                style={{ color: '#71717a' }}
                title="Copy output"
              >
                Copy
              </button>
              <button
                onClick={() => setOutput(null)}
                style={{ color: '#52525b' }}
                className="hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <pre
            className="px-2 py-1.5 text-[10px] font-mono overflow-auto select-text scrollbar-dark cursor-pointer"
            style={{
              color: output.success ? '#10b981' : '#ef4444',
              height: `${outputHeight}px`,
              minHeight: '50px',
              maxHeight: '200px',
              userSelect: isResizing ? 'none' : 'text'
            }}
            onClick={() => setOutputExpanded(true)}
          >
            {output.success ? output.output : output.error}
          </pre>
        </div>
      )}

      {/* Expanded Output Modal */}
      {output && outputExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setOutputExpanded(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[80vh] rounded-lg overflow-hidden flex flex-col"
            style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${output.success ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-white">
                  {output.success ? 'Program Output' : 'Error Output'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)', color: '#a1a1aa' }}>
                  {(output.success ? output.output : output.error)?.split('\n').length || 0} lines
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output.success ? output.output : output.error);
                  }}
                  className="text-xs px-3 py-1.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1.5"
                  style={{ color: '#a1a1aa' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy All
                </button>
                <button
                  onClick={() => setOutputExpanded(false)}
                  className="text-xs px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                  style={{ color: '#a1a1aa' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body with Line Numbers */}
            <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
              <div className="flex text-xs font-mono">
                {/* Line Numbers */}
                <div className="py-3 px-2 text-right select-none" style={{ background: '#1f1f23', color: '#52525b', minWidth: '40px' }}>
                  {(output.success ? output.output : output.error)?.split('\n').map((_, i) => (
                    <div key={i} className="leading-5">{i + 1}</div>
                  ))}
                </div>
                {/* Output Content */}
                <pre
                  className="flex-1 py-3 px-4 select-text leading-5"
                  style={{ color: output.success ? '#4ade80' : '#f87171' }}
                >
                  {output.success ? output.output : output.error}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: '#71717a' }}>
              <span>Press Escape or click outside to close</span>
              <span>{output.success ? '✓ Execution successful' : '✗ Execution failed'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default CodeDisplay;
