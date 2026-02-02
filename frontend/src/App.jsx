import { useState, useRef, useCallback, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SettingsPanel from './components/settings/SettingsPanel';
import SetupWizard from './components/settings/SetupWizard';
import { getApiUrl } from './hooks/useElectron';

const isElectron = window.electronAPI?.isElectron || false;
const API_URL = getApiUrl();

const LANGUAGE_MAP = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  bash: 'bash',
  sql: 'sql',
};

function getToken() {
  return localStorage.getItem('capra_token');
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function* solveWithStream(problem, provider, language, detailLevel) {
  const response = await fetch(API_URL + '/api/solve/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ problem, provider, language, detailLevel }),
  });

  if (!response.ok) throw new Error('Failed to solve problem');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield data;
        } catch {}
      }
    }
  }
}

export default function App() {
  // State
  const [provider, setProvider] = useState('claude');
  const [detailLevel, setDetailLevel] = useState('detailed');
  const [language, setLanguage] = useState('python');
  const [problemText, setProblemText] = useState('');
  const [code, setCode] = useState('');
  const [pitch, setPitch] = useState('');
  const [examples, setExamples] = useState([]);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [selectedExample, setSelectedExample] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [leftWidth, setLeftWidth] = useState(45);

  // Refs
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // Listen for Electron events
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;
    const removeFirstRun = window.electronAPI.onFirstRun(() => setShowSetupWizard(true));
    const removeOpenSettings = window.electronAPI.onOpenSettings(() => setShowSettings(true));
    return () => { removeFirstRun?.(); removeOpenSettings?.(); };
  }, []);

  // Resize handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; // Account for sidebar
    const totalWidth = rect.width - 40;
    const percent = (x / totalWidth) * 100;
    setLeftWidth(Math.max(25, Math.min(75, percent)));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Solve problem
  const handleSolve = async () => {
    if (!problemText.trim()) return;

    setIsLoading(true);
    setCode('');
    setPitch('');
    setExamples([]);
    setOutput(null);

    try {
      let fullText = '';
      for await (const data of solveWithStream(problemText, provider, language, detailLevel)) {
        if (data.chunk) fullText += data.chunk;
        if (data.done && data.result) {
          setCode(data.result.code || '');
          setPitch(data.result.pitch || '');
          setExamples(data.result.examples || []);
          if (data.result.examples?.length > 0) {
            setInput(data.result.examples[0].input || '');
            setShowInput(true);
          }
        }
      }
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Run code
  const handleRun = async () => {
    if (!code) return;
    setOutput(null);

    try {
      const response = await fetch(API_URL + '/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code, language, input }),
      });
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      setOutput({ success: false, error: err.message });
    }
  };

  // Fix code
  const handleFix = async () => {
    if (!code || !output) return;

    const errorMsg = output.success
      ? `Output: ${output.output}\nExpected: ${examples[selectedExample]?.expected || 'unknown'}`
      : output.error;

    setIsLoading(true);
    try {
      const response = await fetch(API_URL + '/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code, error: errorMsg, language, provider }),
      });
      const data = await response.json();
      if (data.code) {
        setCode(data.code);
        setOutput(null);
      }
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy code
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  };

  // Example change
  const handleExampleChange = (idx) => {
    setSelectedExample(idx);
    if (examples[idx]) setInput(examples[idx].input || '');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Bar */}
      <header className="header-bar">
        <div className="flex items-center gap-6">
          <div className="logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Capra
          </div>
          <nav className="nav-items hidden md:flex">
            <span className="nav-item cursor-pointer">Solve</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Provider Toggle */}
          <div className="provider-toggle">
            <button
              className={`provider-btn ${provider === 'claude' ? 'active' : ''}`}
              onClick={() => setProvider('claude')}
            >
              Claude
            </button>
            <button
              className={`provider-btn ${provider === 'openai' ? 'active' : ''}`}
              onClick={() => setProvider('openai')}
            >
              GPT-4
            </button>
          </div>

          {/* Detail Toggle */}
          <div className="detail-toggle">
            <button
              className={`detail-btn ${detailLevel === 'brief' ? 'active' : ''}`}
              onClick={() => setDetailLevel('brief')}
            >
              Brief
            </button>
            <button
              className={`detail-btn ${detailLevel === 'detailed' ? 'active' : ''}`}
              onClick={() => setDetailLevel('detailed')}
            >
              Detailed
            </button>
          </div>

          {/* Settings */}
          {isElectron && (
            <button className="btn-icon" onClick={() => setShowSettings(true)} title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="main-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Sidebar */}
        <div className="sidebar">
          <div
            className={`sidebar-tab ${activeTab === 'problem' ? 'active' : ''}`}
            onClick={() => setActiveTab('problem')}
          >
            Problem
          </div>
          <div
            className={`sidebar-tab ${activeTab === 'explanation' ? 'active' : ''}`}
            onClick={() => setActiveTab('explanation')}
          >
            Explanation
          </div>
        </div>

        {/* Problem Panel (Light) */}
        <div className="problem-panel" style={{ width: `${leftWidth}%` }}>
          {activeTab === 'problem' ? (
            <div className="problem-content">
              <div className="section-title">Problem</div>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Paste your coding problem here..."
                className="w-full h-64 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-green-500 text-sm"
                style={{ background: '#f8f9fa' }}
              />

              <div className="flex items-center gap-4 mt-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="bash">Bash</option>
                  <option value="sql">SQL</option>
                </select>

                <button
                  onClick={handleSolve}
                  disabled={isLoading || !problemText.trim()}
                  className="btn-submit flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner" />
                      Solving...
                    </>
                  ) : (
                    'Solve Problem'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="problem-content">
              {pitch ? (
                <div className="pitch-section">
                  <div className="pitch-label">Solution Pitch</div>
                  <div className="pitch-text">{pitch}</div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Solve a problem to see the explanation</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resize Handle */}
        <div className="resize-handle" onMouseDown={handleMouseDown} />

        {/* Code Panel (Dark) */}
        <div className="code-panel" style={{ width: `${100 - leftWidth}%` }}>
          {/* Code Header */}
          <div className="code-header">
            <div className="code-header-left">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="bash">Bash</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            <div className="code-header-right">
              <button className="header-btn" onClick={() => setShowInput(!showInput)}>
                {showInput ? 'Hide Input' : 'Show Input'}
              </button>
              <button className="header-btn" onClick={handleCopy}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </button>
            </div>
          </div>

          {/* Input Panel */}
          {showInput && (
            <div className="input-panel fade-in">
              {examples.length > 0 && (
                <div className="example-pills">
                  {examples.map((ex, idx) => (
                    <button
                      key={idx}
                      className={`example-pill ${selectedExample === idx ? 'active' : ''}`}
                      onClick={() => handleExampleChange(idx)}
                    >
                      Example {idx + 1}
                    </button>
                  ))}
                </div>
              )}
              <div className="input-label">Input</div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input..."
                className="input-field h-16"
              />
              {examples[selectedExample]?.expected && (
                <div className="expected-output">
                  Expected: {examples[selectedExample].expected}
                </div>
              )}
            </div>
          )}

          {/* Code Editor */}
          <div className="code-editor">
            {code ? (
              <SyntaxHighlighter
                language={LANGUAGE_MAP[language] || 'python'}
                style={vscDarkPlus}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: '12px 0',
                  background: 'transparent',
                  fontSize: '13px',
                  lineHeight: '1.5',
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="spinner" />
                    <span>Generating solution...</span>
                  </div>
                ) : (
                  'Submit a problem to see the solution'
                )}
              </div>
            )}
          </div>

          {/* Output Panel */}
          {output && (
            <div className="output-panel fade-in">
              <div className="output-header">
                <span>Output</span>
                <button className="btn-icon" onClick={() => setOutput(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className={`output-content ${output.success ? 'output-success' : 'output-error'}`}>
                {output.success ? output.output : output.error}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="action-bar">
            <div className="action-bar-left">
              <label className="checkbox-label">
                <input type="checkbox" checked={showInput} onChange={(e) => setShowInput(e.target.checked)} />
                Test with input
              </label>
            </div>
            <div className="action-bar-right">
              {output && (
                <button className="btn-run" onClick={handleFix} disabled={isLoading}>
                  Fix Code
                </button>
              )}
              <button className="btn-run" onClick={handleRun} disabled={!code || isLoading}>
                Run Code
              </button>
              <button className="btn-submit" onClick={handleSolve} disabled={isLoading || !problemText.trim()}>
                {isLoading ? 'Solving...' : 'Solve'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showSetupWizard && <SetupWizard onComplete={() => setShowSetupWizard(false)} />}
    </div>
  );
}
