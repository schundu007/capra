import { useState, useEffect } from 'react';
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
  const token = localStorage.getItem('capra_token');
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

export default function CodeDisplay({ code: initialCode, language, onLineHover, examples, onCodeUpdate, onExplanationsUpdate, isStreaming, autoRunOutput, interviewMode, systemDesign, eraserDiagram, onGenerateEraserDiagram }) {
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
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'design'

  useEffect(() => {
    setCode(initialCode);
    setFixAttempts(0);
    setOutput(null);
  }, [initialCode]);

  // Auto-switch tabs based on interview mode
  useEffect(() => {
    console.log('[CodeDisplay] interviewMode changed to:', interviewMode, 'systemDesign?.included:', systemDesign?.included);
    if (interviewMode === 'system-design') {
      // Always show design tab in system-design mode
      setActiveTab('design');
    } else if (interviewMode === 'coding') {
      // Always show code tab in coding mode
      setActiveTab('code');
    }
  }, [interviewMode]);

  // Also switch to design tab when design content arrives
  useEffect(() => {
    if (systemDesign?.included) {
      setActiveTab('design');
    }
  }, [systemDesign?.included]);

  // Display auto-run output when it arrives
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

  // Check if we have system design content
  const hasSystemDesign = systemDesign?.included;
  // Show tabs when in system-design mode OR when we have system design content
  const showTabs = interviewMode === 'system-design' || hasSystemDesign;

  // Empty state - but show tabs if in system-design mode
  if (!code && !isStreaming && !hasSystemDesign && interviewMode !== 'system-design') {
    return (
      <div className="h-full flex flex-col bg-[#1e1e1e]">
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-700 flex-shrink-0">
          <div className="w-1 h-1 rounded-full bg-gray-500" />
          <span className="text-[10px] font-medium text-gray-500">Code</span>
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
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-700 flex-shrink-0">
          <div className="w-1 h-1 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-medium text-gray-400">Code</span>
          <div className="flex gap-0.5 ml-1.5">
            <span className="w-0.5 h-0.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-0.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-0.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[11px] text-gray-500">Generating...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: activeTab === 'design' ? '#ffffff' : '#0a0a0b' }}>
      {/* Header with Tabs */}
      <div className="flex items-center justify-between px-2 py-1.5 flex-shrink-0" style={{ borderBottom: activeTab === 'design' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          {showTabs ? (
            <>
              {/* Code Tab */}
              <button
                onClick={() => setActiveTab('code')}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors"
                style={{
                  background: activeTab === 'code' ? (activeTab === 'design' ? '#f3f4f6' : 'rgba(255,255,255,0.1)') : 'transparent',
                  color: activeTab === 'code' ? (activeTab === 'design' ? '#111827' : '#fafafa') : (activeTab === 'design' ? '#6b7280' : '#71717a'),
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-[10px] font-medium">Code</span>
                {code && (
                  <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: activeTab === 'design' ? '#e5e7eb' : 'rgba(255,255,255,0.1)', color: activeTab === 'design' ? '#6b7280' : '#a1a1aa' }}>
                    {normalizedLanguage}
                  </span>
                )}
              </button>
              {/* Design Tab */}
              <button
                onClick={() => setActiveTab('design')}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors"
                style={{
                  background: activeTab === 'design' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'design' ? 'white' : (activeTab === 'design' ? '#6b7280' : '#71717a'),
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-[10px] font-medium">Design</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-1 h-1 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span className="text-[10px] font-medium" style={{ color: '#a1a1aa' }}>Code</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
              >
                {normalizedLanguage}
              </span>
            </>
          )}
        </div>
        {activeTab === 'code' && (
          <button
            onClick={handleCopy}
            className="px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors"
            style={{ color: '#71717a' }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#fafafa'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#71717a'; }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>

      {/* Design Tab Content */}
      {activeTab === 'design' && (
        <div className="flex-1 overflow-auto p-4 bg-white">
          {hasSystemDesign ? (
            <SystemDesignPanel
              systemDesign={systemDesign}
              eraserDiagram={eraserDiagram}
              onGenerateEraserDiagram={onGenerateEraserDiagram}
            />
          ) : isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="flex gap-1 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Generating system design...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm">Submit a problem to see system design</span>
            </div>
          )}
        </div>
      )}

      {/* Code Editor - Only show when code tab is active */}
      {activeTab === 'code' && (
        <>
          <div className="flex-1 overflow-auto scrollbar-dark">
            {code ? (
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
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="text-[11px]">No code generated</p>
                  <p className="text-[10px] text-gray-600 mt-1">System design problems focus on architecture</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer - Run/Submit buttons (only for code tab) */}
      {activeTab === 'code' && code && (
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
            className="px-2 py-1 text-[10px] font-semibold rounded transition-colors disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            {running ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>
      )}

      {/* Test Input Panel - only for code tab */}
      {activeTab === 'code' && code && showTestInput && (
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
      {activeTab === 'code' && output && (
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
            </div>
            <div className="flex items-center gap-1.5">
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
            className="px-2 py-1.5 text-[10px] font-mono overflow-auto select-text scrollbar-dark"
            style={{
              color: output.success ? '#10b981' : '#ef4444',
              height: `${outputHeight}px`,
              minHeight: '50px',
              maxHeight: '200px',
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
