import { useState, useRef, useCallback, useEffect } from 'react';
import ProblemInput from './components/ProblemInput';
import CodeDisplay from './components/CodeDisplay';
import ExplanationPanel from './components/ExplanationPanel';
import ProviderToggle from './components/ProviderToggle';
import LoadingProgress from './components/LoadingProgress';
import ErrorDisplay from './components/ErrorDisplay';
import PlatformStatus from './components/PlatformStatus';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import CapraLogo from './components/CapraLogo';
import SettingsPanel from './components/settings/SettingsPanel';
import SetupWizard from './components/settings/SetupWizard';
import PlatformAuth from './components/PlatformAuth';
import { getApiUrl } from './hooks/useElectron';

// Detect Electron environment
const isElectron = window.electronAPI?.isElectron || false;

// Get API URL - uses dynamic resolution for Electron
const API_URL = getApiUrl();

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('capra_token');
}

// Get auth headers
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Parse partial JSON to extract fields as they stream in
function parseStreamingContent(text) {
  const result = {
    code: null,
    language: null,
    pitch: null,
    explanations: null,
    complexity: null,
    systemDesign: null,
  };

  if (!text) return result;

  // Try to extract code - look for "code": "..." pattern
  const codeMatch = text.match(/"code"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if (codeMatch) {
    result.code = codeMatch[1]
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  // Extract language
  const langMatch = text.match(/"language"\s*:\s*"([^"]+)"/);
  if (langMatch) {
    result.language = langMatch[1];
  }

  // Extract pitch
  const pitchMatch = text.match(/"pitch"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if (pitchMatch) {
    result.pitch = pitchMatch[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  // Try to extract complexity
  const complexityMatch = text.match(/"complexity"\s*:\s*\{[^}]*"time"\s*:\s*"([^"]+)"[^}]*"space"\s*:\s*"([^"]+)"[^}]*\}/s);
  if (complexityMatch) {
    result.complexity = { time: complexityMatch[1], space: complexityMatch[2] };
  }

  return result;
}

// Stream solve request using SSE
async function solveWithStream(problem, provider, language, detailLevel, onChunk) {
  const response = await fetch(API_URL + '/api/solve/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ problem, provider, language, detailLevel }),
  });

  if (!response.ok) {
    throw new Error('Failed to solve problem');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;

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
          if (data.chunk) {
            onChunk(data.chunk);
          }
          if (data.done && data.result) {
            result = data.result;
          }
          if (data.error) {
            throw new Error(data.error);
          }
        } catch (e) {
          if (e.message !== 'Unexpected end of JSON input') {
            console.error('SSE parse error:', e);
          }
        }
      }
    }
  }

  return result;
}

export default function App() {
  const [provider, setProvider] = useState('claude');
  const [isLoading, setIsLoading] = useState(false);

  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Electron-specific state
  const [showSettings, setShowSettings] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showPlatformAuth, setShowPlatformAuth] = useState(false);

  // Check if user is admin
  const isAdmin = user?.roles?.includes('admin');

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      // In Electron mode, skip auth and go straight to the app
      if (isElectron) {
        setAuthRequired(false);
        setIsAuthenticated(true);
        setAuthChecked(true);
        return;
      }

      try {
        const checkResponse = await fetch(API_URL + '/api/auth/check');
        const checkData = await checkResponse.json();

        if (!checkData.authEnabled) {
          setAuthRequired(false);
          setIsAuthenticated(true);
          setAuthChecked(true);
          return;
        }

        setAuthRequired(true);

        const token = getToken();
        if (!token) {
          setIsAuthenticated(false);
          setAuthChecked(true);
          return;
        }

        const meResponse = await fetch(API_URL + '/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          setIsAuthenticated(true);
          setUser(meData.user);
        } else {
          localStorage.removeItem('capra_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthRequired(false);
        setIsAuthenticated(true);
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuth();
  }, []);

  // Listen for Electron events
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    // Listen for first-run event
    const removeFirstRun = window.electronAPI.onFirstRun(() => {
      setShowSetupWizard(true);
    });

    // Listen for open-settings event (from menu)
    const removeOpenSettings = window.electronAPI.onOpenSettings(() => {
      setShowSettings(true);
    });

    // Listen for new-problem event (from menu)
    const removeNewProblem = window.electronAPI.onNewProblem(() => {
      handleClearAll();
    });

    return () => {
      removeFirstRun?.();
      removeOpenSettings?.();
      removeNewProblem?.();
    };
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('capra_token', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('capra_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const [loadingType, setLoadingType] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('default');
  const [solution, setSolution] = useState(null);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [clearScreenshot, setClearScreenshot] = useState(0);

  // Resizable panel width (left panel has input+explanations, right has code)
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalWidth = rect.width;
    const percentX = (x / totalWidth) * 100;

    const newWidth = Math.max(30, Math.min(70, percentX));
    setLeftPanelWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const resetState = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
  };

  const handleClearAll = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setExtractedText('');
    setStreamingText('');
    setClearScreenshot(c => c + 1);
  };

  const [streamingText, setStreamingText] = useState('');
  const [streamingContent, setStreamingContent] = useState({
    code: null,
    language: null,
    pitch: null,
    explanations: null,
    complexity: null,
    systemDesign: null,
  });

  const [currentProblem, setCurrentProblem] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('auto');

  const handleSolve = async (problem, language, detailLevel = 'detailed') => {
    resetState();
    setCurrentProblem(problem);
    setCurrentLanguage(language);
    setStreamingText('');
    setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    setIsLoading(true);
    setLoadingType('solve');
    try {
      let fullText = '';
      const result = await solveWithStream(problem, provider, language, detailLevel, (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
        // Parse and extract content progressively
        const parsed = parseStreamingContent(fullText);
        setStreamingContent(parsed);
      });
      if (result) {
        setSolution(result);
      }
    } catch (err) {
      setError(err.message);
      setErrorType('solve');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      setStreamingText('');
      setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    }
  };

  const handleExpandSystemDesign = async () => {
    if (!currentProblem) return;
    handleSolve(currentProblem + '\n\nProvide a DETAILED system design with all components, data models, API design, scalability considerations, and architecture diagram.', currentLanguage, 'detailed');
  };

  const handleFetchUrl = async (url, language, detailLevel = 'detailed') => {
    resetState();
    setStreamingText('');
    setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    setIsLoading(true);
    setLoadingType('fetch');
    try {
      const fetchResponse = await fetch(API_URL + '/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ url }),
      });

      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch problem from URL');
      }

      const fetchData = await fetchResponse.json();
      setCurrentProblem(fetchData.problemText);
      setCurrentLanguage(language);
      setLoadingType('solve');

      let fullText = '';
      const result = await solveWithStream(fetchData.problemText, provider, language, detailLevel, (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
        const parsed = parseStreamingContent(fullText);
        setStreamingContent(parsed);
      });
      if (result) {
        setSolution(result);
      }
    } catch (err) {
      setError(err.message);
      setErrorType('fetch');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      setStreamingText('');
      setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    }
  };

  const handleScreenshot = async (file, language = 'auto') => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setStreamingText('');
    setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    setIsLoading(true);
    setLoadingType('screenshot');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('provider', provider);
      formData.append('mode', 'extract');

      const response = await fetch(API_URL + '/api/analyze', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to extract text');
      }

      const data = await response.json();
      const extractedProblem = data.text || '';
      setExtractedText(extractedProblem);

      if (extractedProblem.trim()) {
        setCurrentProblem(extractedProblem);
        setCurrentLanguage(language);
        setLoadingType('solve');
        let fullText = '';
        const result = await solveWithStream(extractedProblem, provider, language, 'detailed', (chunk) => {
          fullText += chunk;
          setStreamingText(fullText);
          const parsed = parseStreamingContent(fullText);
          setStreamingContent(parsed);
        });
        if (result) {
          setSolution(result);
        }
      }
    } catch (err) {
      setError(err.message);
      setErrorType('screenshot');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      setStreamingText('');
      setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    }
  };

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center gradient-hero">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-pulse-glow rounded-2xl p-4">
            <CapraLogo size="xl" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse" />
            <span className="text-slate-400 text-base font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show login if auth required
  if (authRequired && !isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Premium Header */}
      <header className="relative z-10 flex items-center justify-between px-6 h-16 header-premium">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <CapraLogo size="sm" />
          <div className="hidden lg:block">
            <PlatformStatus />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          <ProviderToggle provider={provider} onChange={setProvider} />

          {/* Platform Login button (Electron only) */}
          {isElectron && (
            <button
              onClick={() => setShowPlatformAuth(true)}
              className="p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-700/50"
              title="Platform Login"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          )}

          {/* Settings button (Electron only) */}
          {isElectron && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-700/50"
              title="Settings (⌘,)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {/* User menu */}
          {authRequired && user && (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-700/50">
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-700/50"
                  title="User management"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-700/50"
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-bold text-slate-900 shadow-lg shadow-yellow-500/20 border border-yellow-400/30">
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden gradient-mesh"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Left Panel - Input & Explanations */}
        <div
          className="flex flex-col h-full"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Input Section */}
          <div className="p-5 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <ProblemInput
              onSubmit={handleSolve}
              onFetchUrl={handleFetchUrl}
              onScreenshot={handleScreenshot}
              onClear={handleClearAll}
              isLoading={isLoading}
              extractedText={extractedText}
              onExtractedTextClear={() => setExtractedText('')}
              shouldClear={clearScreenshot}
              hasSolution={!!solution}
            />

            {isLoading && (
              <div className="mt-4">
                <LoadingProgress type={loadingType} isActive={isLoading} />
              </div>
            )}

            {error && (
              <div className="mt-4">
                <ErrorDisplay
                  error={error}
                  type={errorType}
                  onDismiss={() => setError(null)}
                />
              </div>
            )}
          </div>

          {/* Explanations Section */}
          <ExplanationPanel
            explanations={solution?.explanations}
            highlightedLine={highlightedLine}
            pitch={solution?.pitch || streamingContent.pitch}
            systemDesign={solution?.systemDesign}
            isStreaming={isLoading && loadingType === 'solve' && !solution}
            onExpandSystemDesign={handleExpandSystemDesign}
            canExpandSystemDesign={!!currentProblem && !isLoading}
          />
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="resize-handle flex-shrink-0"
        />

        {/* Right Panel - Code */}
        <div
          className="flex flex-col h-full border-l border-white/10 overflow-auto scrollbar-thin"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <CodeDisplay
            code={solution?.code || streamingContent.code}
            language={solution?.language || streamingContent.language}
            complexity={solution?.complexity || streamingContent.complexity}
            onLineHover={setHighlightedLine}
            examples={solution?.examples}
            isStreaming={isLoading && loadingType === 'solve' && !solution}
            onExplanationsUpdate={(explanations) => {
              setSolution(prev => prev ? { ...prev, explanations } : null);
            }}
          />
        </div>
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          token={getToken()}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Settings Panel (Electron) */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Setup Wizard (Electron first-run) */}
      {showSetupWizard && (
        <SetupWizard onComplete={() => setShowSetupWizard(false)} />
      )}

      {/* Platform Auth (Electron) */}
      {showPlatformAuth && (
        <PlatformAuth onClose={() => setShowPlatformAuth(false)} />
      )}
    </div>
  );
}
