import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getApiUrl } from '../hooks/useElectron';
import SystemDesignPanel from './SystemDesignPanel';
import LanguageSelectorModal from './LanguageSelectorModal';

const LANGUAGE_MAP = {
  python: 'python',
  python2: 'python',
  python3: 'python',
  bash: 'bash',
  terraform: 'hcl',
  jenkins: 'groovy',
  yaml: 'yaml',
  sql: 'sql',
  mysql: 'sql',
  postgresql: 'sql',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  scala: 'scala',
  r: 'r',
  perl: 'perl',
  lua: 'lua',
  haskell: 'haskell',
  clojure: 'clojure',
  elixir: 'elixir',
  erlang: 'erlang',
  fsharp: 'fsharp',
  ocaml: 'ocaml',
  dart: 'dart',
  julia: 'julia',
  objectivec: 'objectivec',
  coffeescript: 'coffeescript',
  solidity: 'solidity',
  verilog: 'verilog',
  vb: 'vbnet',
  tcl: 'tcl',
  html: 'html',
  markdown: 'markdown',
  react: 'jsx',
  vue: 'javascript',
  angular: 'typescript',
  svelte: 'javascript',
  nextjs: 'javascript',
  nodejs: 'javascript',
  django: 'python',
  rails: 'ruby',
  spring: 'java',
  pyspark: 'python',
  pytorch: 'python',
  tensorflow: 'python',
  scipy: 'python',
};

const RUNNABLE = ['python', 'python2', 'python3', 'bash', 'javascript', 'typescript', 'sql', 'mysql', 'postgresql', 'c', 'cpp', 'java', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'perl', 'lua', 'haskell', 'clojure', 'elixir', 'erlang', 'fsharp', 'ocaml', 'dart', 'julia', 'csharp'];

// All available languages for the selector
// Language labels for display in button
const LANGUAGE_LABELS = {
  auto: 'Auto',
  python3: 'Python 3',
  python2: 'Python 2',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift 5',
  kotlin: 'Kotlin',
  scala: 'Scala',
  bash: 'Bash',
  perl: 'Perl',
  lua: 'Lua',
  r: 'R',
  tcl: 'Tcl',
  haskell: 'Haskell',
  clojure: 'Clojure',
  elixir: 'Elixir',
  erlang: 'Erlang',
  fsharp: 'F#',
  ocaml: 'OCaml',
  dart: 'Dart',
  julia: 'Julia',
  objectivec: 'Objective-C',
  coffeescript: 'CoffeeScript',
  vb: 'Visual Basic',
  sql: 'SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
  svelte: 'Svelte',
  nextjs: 'Next.js',
  html: 'HTML',
  nodejs: 'NodeJS',
  django: 'Django',
  rails: 'Rails',
  spring: 'Spring',
  terraform: 'Terraform',
  kubernetes: 'Kubernetes',
  pyspark: 'PySpark',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  scipy: 'SciPy',
  solidity: 'Solidity',
  verilog: 'Verilog',
  markdown: 'Markdown',
};

const API_URL = getApiUrl();

function getAuthHeaders() {
  const headers = {};
  const token = localStorage.getItem('chundu_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Add Electron header for backend to skip webapp authentication
  if (window.electronAPI?.isElectron) {
    headers['X-Electron-App'] = 'true';
  }
  return headers;
}

// Dark theme (default)
const darkTheme = {
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

// Light theme
const lightTheme = {
  ...vs,
  'pre[class*="language-"]': {
    ...vs['pre[class*="language-"]'],
    background: '#ffffff',
    margin: 0,
    padding: '12px',
  },
  'code[class*="language-"]': {
    ...vs['code[class*="language-"]'],
    color: '#1a1a1a',
    background: 'transparent',
  },
};

const CodeDisplay = forwardRef(function CodeDisplay({ code: initialCode, language, onLineHover, examples, onCodeUpdate, onExplanationsUpdate, isStreaming, autoRunOutput, ascendMode, systemDesign, eraserDiagram, autoGenerateEraser, onGenerateEraserDiagram, question, cloudProvider, codingLanguage, onLanguageChange, detailLevel, onDetailLevelChange, editorSettings }, ref) {
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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
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
      <div className="h-full flex flex-col panel-container">
        {/* Header for Design Mode */}
        <div className="panel-header">
          <div className="panel-header-left">
            <div className="panel-indicator" />
            <span className="panel-title">System Design</span>
          </div>
        </div>

        {/* Design Content */}
        <div className="flex-1 overflow-auto p-4 panel-content-light">
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
            <div className="flex flex-col items-center justify-center h-full" style={{ color: '#000000' }}>
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
      <div className="h-full flex flex-col panel-container">
        <div className="panel-header" style={{ height: '44px', minHeight: '44px' }}>
          <div className="panel-header-left">
            <div className="panel-indicator panel-indicator-idle" />
            <span className="panel-title">Code</span>
            {/* Language and detail controls moved to Problem panel header */}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center panel-content-light">
          <div className="text-center text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-sm">Submit a problem to see code</p>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state for coding mode
  if (isStreaming && !code) {
    return (
      <div className="h-full flex flex-col panel-container">
        <div className="panel-header">
          <div className="panel-header-left">
            <div className="panel-indicator" />
            <span className="panel-title">Code</span>
            <div className="flex gap-0.5 ml-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center panel-content-light">
          <div className="text-[11px] text-gray-500">Generating code...</div>
        </div>
      </div>
    );
  }

  // CODING MODE: Full code display with all features
  return (
    <div className="h-full flex flex-col panel-container">
      {/* Header - CoderPad style with Run button */}
      <div className="panel-header" style={{ height: '44px', minHeight: '44px' }}>
        <div className="panel-header-left">
          {/* Run Button - Modern gradient with glow */}
          <button
            onClick={handleRun}
            disabled={running || !canRun}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${running ? 'running' : ''}`}
            style={{
              background: running ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              boxShadow: running ? 'none' : '0 2px 6px rgba(16, 185, 129, 0.25)',
              cursor: running || !canRun ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!running && canRun) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = running ? 'none' : '0 2px 6px rgba(16, 185, 129, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {running ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running...
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

          {/* Language and detail controls moved to Problem panel header */}
        </div>

        <div className="panel-header-right">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
            {normalizedLanguage}
          </span>
          <button
            onClick={handleCopy}
            className="btn-premium-ghost px-3 py-1 text-[10px] font-medium rounded-md transition-all"
            style={{
              color: copied ? '#10b981' : '#666666',
              background: copied ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
            }}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </span>
            ) : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className={`flex-1 overflow-auto ${editorSettings?.theme === 'light' ? 'scrollbar-light' : 'scrollbar-dark'}`}>
        <SyntaxHighlighter
          language={syntaxLanguage}
          style={editorSettings?.theme === 'light' ? lightTheme : darkTheme}
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
            background: editorSettings?.theme === 'light' ? '#ffffff' : '#0a0a0b',
            fontSize: `${editorSettings?.fontSize || 12}px`,
            lineHeight: '1.6',
            minHeight: '100%',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: editorSettings?.theme === 'light' ? '#999999' : '#52525b',
            userSelect: 'none',
            fontSize: `${editorSettings?.fontSize || 12}px`,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Footer - Test input & Fix buttons (only for code tab) */}
      { code && (
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: '#fafafa', borderTop: '1px solid #e8e8e8' }}>
        <div className="flex items-center gap-2">
          {/* Test input toggle */}
          <label className="flex items-center gap-1.5 text-[10px] cursor-pointer" style={{ color: '#666666' }}>
            <input
              type="checkbox"
              checked={showTestInput}
              onChange={(e) => setShowTestInput(e.target.checked)}
              className="rounded w-3 h-3"
              style={{ borderColor: '#d1d5db' }}
            />
            Custom input
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fix button (only show on error) */}
          {output && !output.success && (
            <button
              onClick={handleFix}
              disabled={fixing}
              className="px-3 py-1 text-[10px] font-semibold rounded-md transition-all"
              style={{
                background: fixing ? 'rgba(16, 185, 129, 0.1)' : '#ffffff',
                border: '1px solid #10b981',
                color: '#10b981',
                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!fixing) {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!fixing) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {fixing ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fixing...
                </span>
              ) : 'Auto Fix'}
            </button>
          )}

          {/* Keyboard shortcuts hint */}
          <span className="text-[9px] text-gray-400">
            ^1 solve · ^2 run · ^3 copy
          </span>
        </div>
      </div>
      )}

      {/* Test Input Panel - only for code tab */}
      { code && showTestInput && (
        <div className="px-3 py-2" style={{ background: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {examples?.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleSelect(idx)}
                className="px-2 py-0.5 text-[9px] font-medium rounded transition-colors"
                style={{
                  background: selectedExample === idx ? '#10b981' : '#ffffff',
                  color: selectedExample === idx ? 'white' : '#666666',
                  border: selectedExample === idx ? 'none' : '1px solid #e8e8e8'
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
              background: '#ffffff',
              border: '1px solid #e8e8e8',
              color: '#333333'
            }}
          />
        </div>
      )}

      {/* Output Panel - only for code tab */}
      {output && !outputExpanded && (
        <div style={{ background: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}>
          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="h-1.5 cursor-ns-resize flex items-center justify-center hover:bg-gray-200 transition-colors"
            style={{ borderBottom: '1px solid #e8e8e8' }}
          >
            <div className="w-6 h-0.5 rounded-full" style={{ background: '#d1d5db' }} />
          </div>
          <div className="px-3 py-1 flex items-center justify-between">
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
              <span className="text-[8px]" style={{ color: '#888888' }}>
                {(output.success ? output.output : output.error)?.split('\n').length || 0} lines
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setOutputExpanded(true)}
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                style={{ color: '#000000' }}
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
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors"
                style={{ color: '#000000' }}
                title="Copy output"
              >
                Copy
              </button>
              <button
                onClick={() => setOutput(null)}
                style={{ color: '#888888' }}
                className="hover:text-gray-900 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <pre
            className="px-3 py-1.5 text-[10px] font-mono overflow-auto select-text scrollbar-thin cursor-pointer"
            style={{
              color: output.success ? '#10b981' : '#ef4444',
              background: '#ffffff',
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
          className="modal-backdrop"
          onClick={() => setOutputExpanded(false)}
        >
          <div
            className="modal-container w-full max-w-4xl max-h-[80vh] animate-modalSlideIn"
            style={{ background: '#18181b' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${output.success ? 'bg-green-500 animate-glowPulse' : 'bg-red-500'}`}
                     style={{ boxShadow: output.success ? '0 0 8px rgba(34, 197, 94, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)' }} />
                <span className="modal-title">
                  {output.success ? 'Program Output' : 'Error Output'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: '#a1a1aa' }}>
                  {(output.success ? output.output : output.error)?.split('\n').length || 0} lines
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output.success ? output.output : output.error);
                  }}
                  className="btn-premium-ghost text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5"
                  style={{ color: '#a1a1aa' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy All
                </button>
                <button
                  onClick={() => setOutputExpanded(false)}
                  className="modal-close"
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

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        selectedLanguage={codingLanguage || 'auto'}
        onSelect={(lang) => onLanguageChange && onLanguageChange(lang)}
      />
    </div>
  );
});

export default CodeDisplay;
