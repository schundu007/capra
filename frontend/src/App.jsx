import { useState, useEffect, useRef, useCallback } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

// Components
import ProblemInput from './components/ProblemInput';
import CodeDisplay from './components/CodeDisplay';
import ExplanationPanel from './components/ExplanationPanel';
import OAuthLogin from './components/auth/OAuthLogin';
import PricingPlans from './components/billing/PricingPlans';
import CreditBalance from './components/billing/CreditBalance';
import DownloadPage from './components/billing/DownloadPage';
import PremiumPage from './components/billing/PremiumPage';
import DocsPage from './components/DocsPage';
import ProblemPage from './components/ProblemPage';
import OnboardingModal, { hasCompletedOnboarding } from './components/onboarding/OnboardingModal';
import AdminPanel from './components/AdminPanel';
import SettingsPanel from './components/settings/SettingsPanel';
import SetupWizard from './components/settings/SetupWizard';
import PlatformAuth from './components/PlatformAuth';
import AscendAssistantPanel from './components/AscendAssistantPanel';
import VoiceAssistantPanel from './components/VoiceAssistantPanel';
import AscendModeSelector from './components/AscendModeSelector';
import SystemDesignPanel from './components/SystemDesignPanel';
import PrepTab from './components/PrepTab';
import AscendPrepModal from './components/AscendPrepModal';
import SavedSystemDesignsModal from './components/SavedSystemDesignsModal';
import Sidebar from './components/Sidebar';

// Hooks
import { getApiUrl } from './hooks/useElectron';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { useSystemDesignStorage } from './hooks/useSystemDesignStorage';
import { useCodingHistory } from './hooks/useCodingHistory';
import { useSolve, useAutoTestFix } from './hooks/useSolve';
import { parseStreamingContent } from './hooks/useStreamingParser';

// Context & Utils
import { useAuth } from './contexts/AuthContext';
import { getAuthHeaders, initDeviceId } from './utils/authHeaders.js';

// Constants
import { isElectron, isAscendPrepWindow, isVoiceAssistantWindow, STORAGE_KEYS } from './constants';

// Re-export for backward compatibility
export { getAuthHeaders };

// Get API URL
const API_URL = getApiUrl();

// ============================================================================
// Storage Migration (runs once on load)
// ============================================================================
function migrateStorageKeys() {
  const migrations = [
    ['ascend_token', 'chundu_token'],
    ['ascend_coding_history', 'chundu_coding_history'],
    ['ascend_system_design_sessions', 'chundu_system_design_sessions'],
    ['ascend_auto_switch', 'chundu_auto_switch'],
    ['ascend_sidebar_collapsed', 'chundu_sidebar_collapsed'],
  ];

  for (const [oldKey, newKey] of migrations) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldValue);
    }
  }
}
migrateStorageKeys();

// ============================================================================
// Auth Helpers
// ============================================================================
function getToken() {
  try {
    const authData = localStorage.getItem('ascend_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.accessToken) return parsed.accessToken;
    }
  } catch {}
  return localStorage.getItem('chundu_token');
}

// ============================================================================
// Main App Component
// ============================================================================
export default function App() {
  // ---------------------------------------------------------------------------
  // Auth (webapp uses context, Electron skips auth)
  // ---------------------------------------------------------------------------
  const auth = useAuth();
  const isAuthenticated = isElectron ? true : auth.isAuthenticated;
  const user = isElectron ? null : auth.user;
  const authRequired = !isElectron && auth.isWebApp;
  const isAdmin = user?.role === 'admin' || user?.roles?.includes?.('admin');

  // ---------------------------------------------------------------------------
  // URL-based routing for webapp + Electron docs support
  // ---------------------------------------------------------------------------
  const currentPath = window.location.pathname;
  const isLandingPage = !isElectron && (currentPath === '/' || currentPath === '/login');
  const isDownloadPage = !isElectron && currentPath === '/download';
  const isPremiumPage = !isElectron && currentPath === '/premium';
  const isDocsPage = currentPath.startsWith('/docs');
  const isProblemPage = currentPath.startsWith('/problems/');
  const problemSlug = isProblemPage ? currentPath.replace('/problems/', '').split('?')[0] : null;

  // App mode from URL path: /app/coding, /app/design, /app/prep
  const appModeFromPath = currentPath === '/app/design' ? 'system-design'
    : currentPath === '/app/prep' ? 'behavioral'
    : currentPath.startsWith('/app') ? 'coding' : null;

  // State for Electron docs page navigation
  const [showDocs, setShowDocs] = useState(isElectron && currentPath.startsWith('/docs'));
  const [showProblem, setShowProblem] = useState(isProblemPage ? problemSlug : null);

  // ---------------------------------------------------------------------------
  // Provider State
  // ---------------------------------------------------------------------------
  const [provider, setProvider] = useLocalStorage('chundu_provider', 'claude');
  const [model, setModel] = useLocalStorage('chundu_model', 'claude-sonnet-4-20250514');
  const [autoSwitch, setAutoSwitch] = useLocalStorage('chundu_auto_switch', false);

  // ---------------------------------------------------------------------------
  // Mode State
  // ---------------------------------------------------------------------------
  const [ascendMode, setAscendMode] = useLocalStorage('ascend_mode', appModeFromPath || 'coding');
  const [designDetailLevel, setDesignDetailLevel] = useLocalState('basic');
  const [codingDetailLevel, setCodingDetailLevel] = useLocalState('basic');
  const [codingLanguage, setCodingLanguage] = useLocalState('auto');
  const [autoGenerateEraser, setAutoGenerateEraser] = useLocalState(false);

  // ---------------------------------------------------------------------------
  // Problem State
  // ---------------------------------------------------------------------------
  const [extractedText, setExtractedText] = useLocalState('');
  const [currentProblem, setCurrentProblem] = useLocalState('');
  const [loadedProblem, setLoadedProblem] = useLocalState('');
  const [currentLanguage, setCurrentLanguage] = useLocalState('auto');
  const [problemExpanded, setProblemExpanded] = useLocalState(true);
  const [clearScreenshot, setClearScreenshot] = useLocalState(0);

  // ---------------------------------------------------------------------------
  // Solution State
  // ---------------------------------------------------------------------------
  const [solution, setSolution] = useLocalState(null);
  const [autoRunOutput, setAutoRunOutput] = useLocalState(null);
  const [eraserDiagram, setEraserDiagram] = useLocalState(null);
  const [highlightedLine, setHighlightedLine] = useLocalState(null);

  // ---------------------------------------------------------------------------
  // UI State
  // ---------------------------------------------------------------------------
  const [authChecked, setAuthChecked] = useLocalState(false);
  const [error, setError] = useLocalState(null);
  const [errorType, setErrorType] = useLocalState('default');
  const [switchNotification, setSwitchNotification] = useLocalState(null);
  const [copyToast, setCopyToast] = useLocalState(false);
  const [isProcessingFollowUp, setIsProcessingFollowUp] = useLocalState(false);
  const [platformStatus, setPlatformStatus] = useLocalState({});
  const [stealthMode, setStealthMode] = useLocalState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useLocalState(false);

  // ---------------------------------------------------------------------------
  // Modal State
  // ---------------------------------------------------------------------------
  const [showSettings, setShowSettings] = useLocalState(false);
  const [showSetupWizard, setShowSetupWizard] = useLocalState(false);
  const [showPlatformAuth, setShowPlatformAuth] = useLocalState(false);
  const [showAscendAssistant, setShowAscendAssistant] = useLocalState(false);
  const [showPrepTab, setShowPrepTab] = useLocalState(false);
  const [showSavedDesigns, setShowSavedDesigns] = useLocalState(false);
  const [showAdminPanel, setShowAdminPanel] = useLocalState(false);
  const [showPricingPlans, setShowPricingPlans] = useLocalState(false);
  const [showOnboarding, setShowOnboarding] = useLocalState(false);

  // ---------------------------------------------------------------------------
  // Sidebar State
  // ---------------------------------------------------------------------------
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
    STORAGE_KEYS.sidebarCollapsed,
    !isElectron
  );

  // ---------------------------------------------------------------------------
  // Editor Settings
  // ---------------------------------------------------------------------------
  const [editorSettings, setEditorSettings] = useLocalStorage(STORAGE_KEYS.editorSettings, {
    theme: 'dark',
    keyBindings: 'standard',
    fontSize: 12,
    tabSpacing: 4,
    intelliSense: true,
    autoCloseBrackets: true,
  });

  const updateEditorSettings = useCallback((updates) => {
    setEditorSettings(prev => ({ ...prev, ...updates }));
  }, [setEditorSettings]);

  // ---------------------------------------------------------------------------
  // Storage Hooks
  // ---------------------------------------------------------------------------
  const systemDesignStorage = useSystemDesignStorage();
  const codingHistory = useCodingHistory();

  // ---------------------------------------------------------------------------
  // Solve Hook
  // ---------------------------------------------------------------------------
  const {
    isLoading,
    loadingType,
    streamingContent,
    solve,
    reset: resetSolve,
    abort: abortSolve,
    setLoadingType,
  } = useSolve({ provider, model, autoSwitch, ascendMode, designDetailLevel });

  const { autoTestAndFix } = useAutoTestFix({ provider, model });

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const codeDisplayRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Apply theme to document
  // ---------------------------------------------------------------------------
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', editorSettings.theme || 'dark');
  }, [editorSettings.theme]);

  // ---------------------------------------------------------------------------
  // Auth check on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isElectron) {
      setAuthChecked(true);
      initDeviceId();
      return;
    }
    if (!auth.loading) {
      setAuthChecked(true);
    }
  }, [auth.loading]);

  // ---------------------------------------------------------------------------
  // Show onboarding for new webapp users
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isElectron && isAuthenticated && authChecked && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, authChecked]);

  // ---------------------------------------------------------------------------
  // Handle incoming problem from docs page (Practice Problems click)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const problemParam = urlParams.get('problem');
    const fetchUrlParam = urlParams.get('fetchUrl');
    const autosolve = urlParams.get('autosolve') === 'true';
    const modeParam = urlParams.get('mode');

    // Handle direct problem text
    if (problemParam) {
      const decodedProblem = decodeURIComponent(problemParam);

      // Set the mode if specified (coding or system-design)
      if (modeParam === 'system-design') {
        setAscendMode('system-design');
      } else {
        setAscendMode('coding');
      }

      // Set the problem text - use extractedText which ProblemInput listens to
      setExtractedText(decodedProblem);

      // Clear URL params to avoid re-triggering on refresh
      window.history.replaceState({}, '', window.location.pathname);

      // Auto-solve if requested
      if (autosolve) {
        // Small delay to ensure state is updated and text is populated
        setTimeout(() => {
          handleSolve(decodedProblem, 'auto', 'detailed');
        }, 300);
      }
    }

    // Handle LeetCode URL fetch - fetch problem and populate text area (no auto-solve)
    if (fetchUrlParam) {
      const decodedUrl = decodeURIComponent(fetchUrlParam);

      // Clear URL params immediately
      window.history.replaceState({}, '', window.location.pathname);

      // Set mode to coding for LeetCode problems
      setAscendMode('coding');

      // Fetch the problem from LeetCode (without auto-solving)
      (async () => {
        setLoadingType('fetch');
        try {
          const response = await fetch(API_URL + '/api/fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ url: decodedUrl }),
          });

          if (!response.ok) throw new Error('Failed to fetch problem from LeetCode');

          const data = await response.json();
          setCurrentProblem(data.problemText);
          setExtractedText(data.problemText);
          setProblemExpanded(true);
          setLoadingType(null);
        } catch (err) {
          setError(err.message);
          setErrorType('fetch');
          setLoadingType(null);
        }
      })();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Electron Event Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    window.electronAPI.getStealthMode?.().then(setStealthMode);

    const listeners = [
      window.electronAPI.onStealthModeChanged?.(setStealthMode),
      window.electronAPI.onFirstRun(() => setShowSetupWizard(true)),
      window.electronAPI.onOpenSettings(() => setShowSettings(true)),
      window.electronAPI.onNewProblem(handleClearAll),
    ];

    return () => listeners.forEach(remove => remove?.());
  }, []);

  // ---------------------------------------------------------------------------
  // Extension SSE Listener
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isElectron && !isAuthenticated) return;

    let eventSource = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;

    function connect() {
      eventSource = new EventSource(`${API_URL}/api/extension/events`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'problem' && data.url) {
            setError(null);
            setSwitchNotification({ from: 'Extension', to: data.platform, reason: 'Problem detected' });
            setTimeout(() => setSwitchNotification(null), 3000);

            setAscendMode(data.problemType === 'system_design' ? 'system-design' : 'coding');

            if (data.problemText && data.problemText.length > 50) {
              setExtractedText(data.problemText);
              handleSolve(data.problemText, 'auto', 'detailed');
            } else {
              setExtractedText('');
              handleFetchUrl(data.url, 'auto', 'detailed');
            }
          }
        } catch {}
      };

      eventSource.onerror = () => {
        reconnectAttempts++;
        eventSource?.close();
        if (reconnectAttempts < 5) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      eventSource.onopen = () => {
        reconnectAttempts = 0;
      };
    }

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [isAuthenticated]);

  // ---------------------------------------------------------------------------
  // Load Platform Status
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isElectron || !window.electronAPI?.getPlatformStatus) return;
    window.electronAPI.getPlatformStatus().then(status => setPlatformStatus(status || {})).catch(() => {});
  }, []);

  // ---------------------------------------------------------------------------
  // Reset Functions
  // ---------------------------------------------------------------------------
  const resetState = useCallback(() => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setAutoRunOutput(null);
  }, []);

  const handleClearAll = useCallback(() => {
    abortSolve();
    resetSolve();
    setSolution(null);
    setError(null);
    setErrorType('default');
    setExtractedText('');
    setLoadedProblem('');
    setAutoRunOutput(null);
    setProblemExpanded(true);
    setClearScreenshot(c => c + 1);
    setEraserDiagram(null);
  }, [abortSolve, resetSolve]);

  // ---------------------------------------------------------------------------
  // Mode Change Handler
  // ---------------------------------------------------------------------------
  const handleModeChange = useCallback((newMode) => {
    if (newMode !== ascendMode) {
      abortSolve();
      handleClearAll();
      setAscendMode(newMode);
      // Update URL to reflect mode (webapp only)
      if (!isElectron) {
        const modePath = newMode === 'system-design' ? '/app/design' : newMode === 'behavioral' ? '/app/prep' : '/app/coding';
        window.history.replaceState({}, '', modePath);
      }
    }
  }, [ascendMode, abortSolve, handleClearAll]);

  // Sync mode from URL path on mount
  useEffect(() => {
    if (appModeFromPath && appModeFromPath !== ascendMode) {
      setAscendMode(appModeFromPath);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Main Solve Handler
  // ---------------------------------------------------------------------------
  const handleSolve = useCallback(async (problem, language, detailLevel = 'detailed') => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    resetState();
    setProblemExpanded(false); // Collapse text area when solve starts
    setCurrentProblem(problem);
    setCurrentLanguage(language);
    setEraserDiagram(null);

    try {
      const result = await solve(problem, language, detailLevel);

      if (result) {
        // Auto-test and fix for coding mode
        if (ascendMode !== 'system-design' && result.code) {
          const { code: fixedCode, fixed, attempts, output } = await autoTestAndFix(
            result.code,
            result.language,
            result.examples,
            problem,
            setLoadingType
          );

          setAutoRunOutput(output);
          setSolution({ ...result, code: fixedCode, autoFixed: fixed, fixAttempts: attempts });

          if (ascendMode === 'coding' && fixedCode) {
            codingHistory.addEntry({
              problem,
              language: result.language || language,
              code: fixedCode,
              complexity: result.complexity,
              source: 'text',
              pitch: result.pitch,
              explanations: result.explanations,
            });
          }
        } else {
          setSolution(result);

          if (ascendMode === 'system-design' && result?.systemDesign?.included) {
            systemDesignStorage.saveSession({
              problem,
              source: 'text',
              systemDesign: result.systemDesign,
              detailLevel: designDetailLevel,
            });

            if (autoGenerateEraser) {
              generateEraserDiagram(result.systemDesign);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.needCredits) {
        setShowPricingPlans(true);
        setError('You need more credits to continue.');
        setErrorType('credits');
      } else {
        setError(err.message);
        setErrorType('solve');
      }
    }
  }, [solve, ascendMode, designDetailLevel, autoGenerateEraser, autoTestAndFix, codingHistory, systemDesignStorage]);

  // ---------------------------------------------------------------------------
  // URL Fetch Handler
  // ---------------------------------------------------------------------------
  const handleFetchUrl = useCallback(async (url, language, detailLevel = 'detailed') => {
    resetState();
    setLoadingType('fetch');

    try {
      const fetchResponse = await fetch(API_URL + '/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ url }),
      });

      if (!fetchResponse.ok) throw new Error('Failed to fetch problem');

      const fetchData = await fetchResponse.json();
      setCurrentProblem(fetchData.problemText);
      setExtractedText(fetchData.problemText);
      setProblemExpanded(true);

      await handleSolve(fetchData.problemText, language, detailLevel);
    } catch (err) {
      setError(err.message);
      setErrorType('fetch');
    }
  }, [handleSolve]);

  // ---------------------------------------------------------------------------
  // Screenshot Handler
  // ---------------------------------------------------------------------------
  const handleScreenshot = useCallback(async (file, language = 'auto', detailLevel = 'basic') => {
    resetState();
    setLoadingType('screenshot');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('provider', provider);
      formData.append('mode', 'extract');
      formData.append('model', model);

      const response = await fetch(API_URL + '/api/analyze', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract text');

      const data = await response.json();
      const extractedProblem = data.text || '';
      setExtractedText(extractedProblem);
      setProblemExpanded(true);

      if (extractedProblem.trim()) {
        await handleSolve(extractedProblem, language, detailLevel);
      }
    } catch (err) {
      setError(err.message);
      setErrorType('screenshot');
    }
  }, [provider, model, handleSolve]);

  // ---------------------------------------------------------------------------
  // Follow-up Question Handler
  // ---------------------------------------------------------------------------
  const handleFollowUpQuestion = useCallback(async (question) => {
    const currentCode = solution?.code || streamingContent.code;
    const currentPitch = solution?.pitch || streamingContent.pitch;
    const currentDesign = solution?.systemDesign || streamingContent.systemDesign;

    if (!currentCode && !currentPitch && !currentDesign?.included) {
      return { answer: 'Please solve a problem first.' };
    }

    setIsProcessingFollowUp(true);

    try {
      const response = await fetch(API_URL + '/api/solve/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          question,
          problem: currentProblem,
          code: currentCode,
          pitch: currentPitch,
          currentDesign: currentDesign?.included ? currentDesign : null,
          provider,
          model,
        }),
      });

      if (!response.ok) throw new Error('Failed to process follow-up');

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
              if (data.done && data.result) result = data.result;
              if (data.error) throw new Error(data.error);
            } catch {}
          }
        }
      }

      if (result?.updatedDesign) {
        setSolution(prev => ({ ...prev, systemDesign: result.updatedDesign }));
      }

      return result;
    } catch (err) {
      console.error('Follow-up error:', err);
      return null;
    } finally {
      setIsProcessingFollowUp(false);
    }
  }, [solution, streamingContent, currentProblem, provider, model]);

  // ---------------------------------------------------------------------------
  // Eraser Diagram Generation
  // ---------------------------------------------------------------------------
  const generateEraserDiagram = useCallback(async (sd) => {
    if (!sd?.included) return;

    const description = buildEraserDescription(sd);

    try {
      const response = await fetch(API_URL + '/api/diagram/eraser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        const data = await response.json();
        setEraserDiagram(data);
        if (systemDesignStorage.currentSessionId) {
          systemDesignStorage.updateEraserDiagram(systemDesignStorage.currentSessionId, data);
        }
      }
    } catch (err) {
      console.error('Eraser diagram failed:', err);
    }
  }, [systemDesignStorage]);

  // ---------------------------------------------------------------------------
  // Load Saved Session Handlers
  // ---------------------------------------------------------------------------
  const handleLoadSavedSession = useCallback((sessionId) => {
    const session = systemDesignStorage.loadSession(sessionId);
    if (!session) return;

    if (ascendMode !== 'system-design') setAscendMode('system-design');
    setDesignDetailLevel(session.detailLevel || 'full');
    setCurrentProblem(session.problem || '');
    setExtractedText(session.problem || '');
    setProblemExpanded(true);
    setSolution({
      systemDesign: session.systemDesign,
      code: null,
      language: null,
      pitch: null,
      explanations: null,
      complexity: null,
    });
    if (session.eraserDiagram) setEraserDiagram(session.eraserDiagram);
    setError(null);
  }, [ascendMode, systemDesignStorage]);

  const handleLoadHistoryEntry = useCallback((entryId) => {
    const entry = codingHistory.getEntry(entryId);
    if (!entry) return;

    if (ascendMode !== 'coding') setAscendMode('coding');
    setCurrentProblem(entry.problem || '');
    setLoadedProblem(entry.problem || '');
    setProblemExpanded(true);
    setCurrentLanguage(entry.language || 'auto');
    setSolution({
      code: entry.code,
      language: entry.language,
      complexity: entry.complexity,
      pitch: entry.pitch || null,
      explanations: entry.explanations || null,
      systemDesign: null,
    });
    setError(null);
  }, [ascendMode, codingHistory]);

  // ---------------------------------------------------------------------------
  // Keyboard Shortcuts
  // ---------------------------------------------------------------------------
  const handleKeyboardSolve = useCallback(() => {
    if (currentProblem || extractedText) {
      handleSolve(currentProblem || extractedText, currentLanguage, 'detailed');
    }
  }, [currentProblem, extractedText, currentLanguage, handleSolve]);

  const handleKeyboardRun = useCallback(() => {
    codeDisplayRef.current?.runCode?.();
  }, []);

  const handleKeyboardCopy = useCallback(async () => {
    const code = solution?.code || streamingContent.code;
    if (!code) return;

    try {
      if (window.electronAPI?.copyToClipboard) {
        await window.electronAPI.copyToClipboard(code);
      } else {
        await navigator.clipboard.writeText(code);
      }
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 1500);
    } catch {}
  }, [solution, streamingContent]);

  const isModalOpen = showSettings || showSetupWizard || showPlatformAuth ||
                      showPrepTab || showAdminPanel || showSavedDesigns;

  useKeyboardShortcuts({
    onSolve: handleKeyboardSolve,
    onRun: handleKeyboardRun,
    onClear: handleClearAll,
    onCopyCode: handleKeyboardCopy,
    onToggleProblem: () => setProblemExpanded(prev => !prev),
    onToggleAscend: () => setShowAscendAssistant(prev => !prev),
    isLoading,
    hasProblem: !!(currentProblem || extractedText),
    hasCode: !!(solution?.code || streamingContent.code),
    disabled: isModalOpen,
  });

  // ---------------------------------------------------------------------------
  // Utility Handlers
  // ---------------------------------------------------------------------------
  const handleLogout = useCallback(() => {
    if (!isElectron) auth.signOut();
  }, [auth]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // ---------------------------------------------------------------------------
  // Render: Loading State
  // ---------------------------------------------------------------------------
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-black">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Problem Page (LeetCode-style problem viewer)
  // ---------------------------------------------------------------------------
  if (isProblemPage || showProblem) {
    const currentSlug = showProblem || problemSlug;
    return (
      <ProblemPage
        slug={currentSlug}
        onBack={() => {
          if (isElectron) {
            setShowProblem(null);
            setShowDocs(true);
          } else {
            window.history.back();
          }
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Docs Page (webapp + Electron)
  // ---------------------------------------------------------------------------
  if (isDocsPage || showDocs) return <DocsPage onBack={isElectron ? () => setShowDocs(false) : null} />;

  // ---------------------------------------------------------------------------
  // Render: Landing / Auth
  // ---------------------------------------------------------------------------
  // Show landing page at / and /login
  if (!isElectron && (currentPath === '/' || currentPath === '/login')) {
    return <OAuthLogin />;
  }

  // ---------------------------------------------------------------------------
  // Render: Premium / Pricing Page (public — before auth check)
  // ---------------------------------------------------------------------------
  if (isPremiumPage) return <PremiumPage />;

  // Protected routes require auth — show login prompt and save intended URL
  if (authRequired && !isAuthenticated) {
    const intended = window.location.pathname + window.location.search;
    if (intended !== '/' && intended !== '/login') {
      sessionStorage.setItem('postLoginRedirect', intended);
    }
    return <OAuthLogin loginOnly />;
  }

  // ---------------------------------------------------------------------------
  // Render: Download Page
  // ---------------------------------------------------------------------------
  if (isDownloadPage && isAuthenticated) return <DownloadPage />;

  // ---------------------------------------------------------------------------
  // Render: Ascend Prep Window
  // ---------------------------------------------------------------------------
  if (isAscendPrepWindow) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-white">
        <AscendPrepModal isOpen={true} onClose={() => window.close()} provider={provider} model={model} isDedicatedWindow={true} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Voice Assistant Window (Dedicated)
  // ---------------------------------------------------------------------------
  if (isVoiceAssistantWindow) {
    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a1a10' }}>
        <VoiceAssistantPanel
          onClose={() => window.close()}
          provider={provider}
          model={model}
          isDedicatedWindow={true}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main App Render
  // ---------------------------------------------------------------------------
  const isMacElectron = isElectron && navigator.platform.toLowerCase().includes('mac');
  const showSidebar = !sidebarCollapsed && ascendMode !== 'ascend-prep';

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--content-bg)', color: '#1a1a1a' }}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          savedDesigns={systemDesignStorage.getAllSessions()}
          codingHistory={codingHistory.getAllEntries()}
          onLoadDesign={handleLoadSavedSession}
          onLoadHistory={handleLoadHistoryEntry}
          onDeleteDesign={systemDesignStorage.deleteSession}
          onDeleteHistory={codingHistory.deleteEntry}
          onCollapse={toggleSidebar}
          onViewAllDesigns={() => setShowSavedDesigns(true)}
          onViewAllHistory={() => {}}
          isLoading={isLoading}
          showAscendAssistant={showAscendAssistant}
          onToggleAscendAssistant={() => setShowAscendAssistant(!showAscendAssistant)}
          user={user}
          isAdmin={isAdmin}
          authRequired={authRequired}
          onLogout={handleLogout}
          onOpenAdminPanel={() => setShowAdminPanel(true)}
          theme={editorSettings.theme}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          ascendMode={ascendMode}
          onModeChange={handleModeChange}
          stealthMode={stealthMode}
          onStealthModeToggle={() => window.electronAPI?.setStealthMode?.(!stealthMode)}
          showSidebar={showSidebar}
          onToggleSidebar={toggleSidebar}
          isLoading={isLoading}
          isMacElectron={isMacElectron}
          onSettingsClick={() => setShowSettings(true)}
          onPricingClick={() => setShowPricingPlans(true)}
          onVoiceAssistantClick={() => setShowAscendAssistant(!showAscendAssistant)}
          showAscendAssistant={showAscendAssistant}
          onDocsClick={() => setShowDocs(true)}
        />

        {/* Error Banner */}
        {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}

        {/* Switch Notification */}
        {switchNotification && (
          <SwitchNotificationBanner notification={switchNotification} onDismiss={() => setSwitchNotification(null)} />
        )}

        {/* Loading Progress */}
        {isLoading && <LoadingProgress />}

        {/* Main Layout */}
        <main className="flex-1 overflow-hidden relative z-10">
          {ascendMode === 'behavioral' ? (
            <div className="h-full" style={{ background: 'var(--content-bg)' }}>
              <AscendPrepModal isOpen={true} onClose={() => {}} provider={provider} model={model} embedded={true} />
            </div>
          ) : (
            <CodingLayout
              // Problem props
              extractedText={extractedText}
              onExtractedTextClear={() => setExtractedText('')}
              clearScreenshot={clearScreenshot}
              problemExpanded={problemExpanded}
              onToggleExpand={() => setProblemExpanded(prev => !prev)}
              loadedProblem={loadedProblem}
              // Mode props
              ascendMode={ascendMode}
              designDetailLevel={designDetailLevel}
              onDetailLevelChange={setDesignDetailLevel}
              codingDetailLevel={codingDetailLevel}
              onCodingDetailLevelChange={setCodingDetailLevel}
              codingLanguage={codingLanguage}
              onLanguageChange={setCodingLanguage}
              autoGenerateEraser={autoGenerateEraser}
              onAutoGenerateEraserChange={setAutoGenerateEraser}
              // Solution props
              solution={solution}
              streamingContent={streamingContent}
              highlightedLine={highlightedLine}
              onLineHover={setHighlightedLine}
              autoRunOutput={autoRunOutput}
              eraserDiagram={eraserDiagram}
              // Loading props
              isLoading={isLoading}
              loadingType={loadingType}
              hasSolution={!!solution}
              // System design props
              savedDesignsCount={systemDesignStorage.getAllSessions().length}
              onSavedDesignsClick={() => setShowSavedDesigns(true)}
              currentProblem={currentProblem}
              // Handlers
              onSolve={handleSolve}
              onFetchUrl={handleFetchUrl}
              onScreenshot={handleScreenshot}
              onClear={handleClearAll}
              onFollowUpQuestion={handleFollowUpQuestion}
              isProcessingFollowUp={isProcessingFollowUp}
              onExpandSystemDesign={() => handleSolve(currentProblem + '\n\nProvide a DETAILED system design.', currentLanguage, 'detailed')}
              onGenerateEraserDiagram={() => generateEraserDiagram(solution?.systemDesign || streamingContent.systemDesign)}
              onExplanationsUpdate={(explanations) => setSolution(prev => prev ? { ...prev, explanations } : null)}
              // Refs
              codeDisplayRef={codeDisplayRef}
              editorSettings={editorSettings}
              // Assistant
              showAscendAssistant={showAscendAssistant}
              onCloseAscendAssistant={() => setShowAscendAssistant(false)}
              provider={provider}
              model={model}
            />
          )}
        </main>

        {/* Footer */}
        <Footer isLoading={isLoading} ascendMode={ascendMode} />
      </div>

      {/* Modals */}
      {showAdminPanel && <AdminPanel token={getToken()} onClose={() => setShowAdminPanel(false)} />}
      <PricingPlans isOpen={showPricingPlans} onClose={() => setShowPricingPlans(false)} />
      <OnboardingModal isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} onOpenPricing={() => setShowPricingPlans(true)} />
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          provider={provider}
          model={model}
          onProviderChange={setProvider}
          onModelChange={setModel}
          onOpenPlatforms={() => setShowPrepTab(true)}
          autoSwitch={autoSwitch}
          onAutoSwitchChange={setAutoSwitch}
          editorSettings={editorSettings}
          onEditorSettingsChange={updateEditorSettings}
        />
      )}
      {showSetupWizard && <SetupWizard onComplete={() => setShowSetupWizard(false)} />}
      {showPlatformAuth && <PlatformAuth onClose={() => setShowPlatformAuth(false)} />}
      {showPrepTab && <PrepTab isOpen={showPrepTab} onClose={() => setShowPrepTab(false)} />}
      <SavedSystemDesignsModal
        isOpen={showSavedDesigns}
        onClose={() => setShowSavedDesigns(false)}
        sessions={systemDesignStorage.getAllSessions()}
        onLoadSession={handleLoadSavedSession}
        onDeleteSession={systemDesignStorage.deleteSession}
        onClearAll={systemDesignStorage.clearAllSessions}
      />

      {/* Copy Toast */}
      {copyToast && <CopyToast />}
    </div>
  );
}

// ============================================================================
// Helper Hooks
// ============================================================================

function useLocalState(initialValue) {
  const [state, setState] = useState(initialValue);
  return [state, setState];
}

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch {}
    return initialValue;
  });

  const setStateAndStorage = useCallback((value) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch {}
      return newValue;
    });
  }, [key]);

  return [state, setStateAndStorage];
}

// ============================================================================
// Sub-Components
// ============================================================================

function Header({ ascendMode, onModeChange, stealthMode, onStealthModeToggle, showSidebar, onToggleSidebar, isLoading, isMacElectron, onSettingsClick, onPricingClick, onVoiceAssistantClick, showAscendAssistant, onDocsClick }) {
  return (
    <header
      className="flex items-center justify-between gap-4 px-5 border-b backdrop-blur-md bg-neutral-800/95 border-neutral-700/50"
      style={{
        paddingLeft: (isMacElectron && !showSidebar) ? '80px' : '20px',
        WebkitAppRegion: 'drag',
        height: '56px',
      }}
    >
      {/* Left: Logo & Tabs */}
      <div className="flex items-center gap-6" style={{ WebkitAppRegion: 'no-drag' }}>
        {!showSidebar && (
          <button onClick={onToggleSidebar} className="flex items-center gap-3 group transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition-transform">
              <img src="/ascend-logo.png" alt="Ascend" className="h-5 w-auto object-contain filter brightness-0 invert" />
            </div>
            <span className="text-base font-semibold text-brand-400 tracking-tight">Ascend</span>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        )}

        {/* Mode Tabs - Modern pill design */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-700/50 border border-neutral-600/50">
          {[
            { id: 'coding', label: 'Coding', icon: <CodeIcon /> },
            { id: 'system-design', label: 'Design', icon: <DesignIcon /> },
            { id: 'behavioral', label: 'Prep', icon: <PrepIcon /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${ascendMode === mode.id
                  ? 'bg-brand-400 text-white shadow-md shadow-brand-400/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-600/50'
                }
              `}
            >
              <span className="w-4 h-4">{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Stealth Mode (Electron) or Download Button (Webapp) */}
      {isElectron ? (
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={onStealthModeToggle}
            className={`
              flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-200
              ${stealthMode
                ? 'bg-brand-400/15 border-brand-400/40 text-brand-400'
                : 'bg-neutral-700/50 border-neutral-600/50 text-neutral-400 hover:text-white hover:bg-neutral-600/50'
              }
              border
            `}
          >
            <StealthIcon stealthMode={stealthMode} />
            <span className="text-sm font-medium">Stealth</span>
            <div className={`
              w-9 h-5 rounded-full relative transition-all duration-300
              ${stealthMode ? 'bg-brand-400' : 'bg-neutral-600'}
            `}>
              <div className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300
                ${stealthMode ? 'left-[18px]' : 'left-0.5'}
              `} />
            </div>
          </button>
        </div>
      ) : (
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={onPricingClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-400/30 hover:shadow-brand-400/40 transition-all duration-200 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Desktop App
          </button>
        </div>
      )}

      {/* Right: Docs, Voice Assistant, Settings & Credits */}
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Docs Button */}
        {isElectron && onDocsClick ? (
          <button
            onClick={onDocsClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600/50 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Docs
          </button>
        ) : !isElectron && (
          <a
            href="/docs"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600/50 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Prep
          </a>
        )}
        {/* Voice Assistant Button */}
        <button
          onClick={onVoiceAssistantClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
            showAscendAssistant
              ? 'text-brand-400 bg-brand-400/10 border-brand-400/50'
              : 'text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-600/50 border-neutral-600/50'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          Voice
        </button>
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600/50 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
        <CreditBalance onUpgrade={onPricingClick} compact={true} />
      </div>
    </header>
  );
}

function ErrorBanner({ error, onDismiss }) {
  return (
    <div className="mx-5 mt-3 p-4 rounded-xl animate-fade-in-down bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-error-700 dark:text-error-300 flex-1">{error}</span>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-error-100 dark:hover:bg-error-900/30 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SwitchNotificationBanner({ notification, onDismiss }) {
  return (
    <div className="mx-5 mt-3 p-4 rounded-xl animate-fade-in-down bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-warning-700 dark:text-warning-300 flex-1">
          Switched from <strong className="font-semibold">{notification.from}</strong> to <strong className="font-semibold">{notification.to}</strong>
          {notification.reason && <span className="text-warning-500 ml-1.5">({notification.reason})</span>}
        </span>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-warning-100 dark:hover:bg-warning-900/30 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function LoadingProgress() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full w-1/3 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-400 rounded-full"
          style={{
            animation: 'progress-indeterminate 1.5s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}

function Footer({ isLoading, ascendMode }) {
  return (
    <footer className="relative z-10 px-5 py-3 flex items-center justify-between text-xs border-t border-neutral-700/50 bg-neutral-800">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'animate-pulse bg-brand-400' : 'bg-brand-400'}`} />
          <span className={`text-sm font-medium ${isLoading ? 'text-brand-400' : 'text-neutral-400'}`}>
            {isLoading ? 'Processing...' : 'Ready'}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-5 font-mono text-[11px] text-neutral-500">
        {[
          { key: '^1', label: ascendMode === 'system-design' ? 'design' : 'code' },
          { key: '^2', label: 'run' },
          { key: '^3', label: 'copy' },
          { key: 'Esc', label: 'clear' },
        ].map(({ key, label }) => (
          <span key={key} className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded-md text-[10px] font-semibold bg-neutral-700 border border-neutral-600 text-neutral-300">
              {key}
            </kbd>
            <span className="text-neutral-400">{label}</span>
          </span>
        ))}
      </div>
    </footer>
  );
}

function CopyToast() {
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-scale-in">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 shadow-xl shadow-brand-500/30">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">Code copied to clipboard!</span>
      </div>
    </div>
  );
}

function CodingLayout({
  extractedText, onExtractedTextClear, clearScreenshot, problemExpanded, onToggleExpand, loadedProblem,
  ascendMode, designDetailLevel, onDetailLevelChange, codingDetailLevel, onCodingDetailLevelChange,
  codingLanguage, onLanguageChange, autoGenerateEraser, onAutoGenerateEraserChange,
  solution, streamingContent, highlightedLine, onLineHover, autoRunOutput, eraserDiagram,
  isLoading, loadingType, hasSolution, savedDesignsCount, onSavedDesignsClick, currentProblem,
  onSolve, onFetchUrl, onScreenshot, onClear, onFollowUpQuestion, isProcessingFollowUp,
  onExpandSystemDesign, onGenerateEraserDiagram, onExplanationsUpdate,
  codeDisplayRef, editorSettings, showAscendAssistant, onCloseAscendAssistant, provider, model,
  qaHistory,
}) {
  const systemDesign = solution?.systemDesign || streamingContent.systemDesign;
  const hasSystemDesign = systemDesign && systemDesign.included;

  // System Design Mode - Vertical Layout: Problem on top, SystemDesignPanel below
  if (ascendMode === 'system-design') {
    return (
      <div className="h-full bg-neutral-800">
        <Allotment defaultSizes={showAscendAssistant ? [70, 30] : [100]}>
          {/* Main Content - Vertical Stack */}
          <Allotment.Pane minSize={600}>
            <div className="h-full flex flex-col overflow-hidden bg-neutral-750">
              {/* Top Section: Problem Input (compact, auto-height) */}
              <div className="flex-shrink-0 border-b border-neutral-700/50">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-400 to-brand-500" />
                    <h2 className="text-sm font-semibold text-white">System Design</h2>
                    <button
                      onClick={onSavedDesignsClick}
                      className={`
                        flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-lg transition-all duration-200
                        ${savedDesignsCount > 0
                          ? 'bg-brand-400/10 text-brand-400 border border-brand-400/30'
                          : 'bg-neutral-700 text-neutral-400 hover:text-neutral-300'
                        }
                      `}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Saved ({savedDesignsCount})
                    </button>
                  </div>
                  <div className="flex items-center">
                    <AscendModeSelector
                      ascendMode={ascendMode}
                      designDetailLevel={designDetailLevel}
                      onDetailLevelChange={onDetailLevelChange}
                      autoGenerateEraser={autoGenerateEraser}
                      onAutoGenerateEraserChange={onAutoGenerateEraserChange}
                      codingLanguage={codingLanguage}
                      onLanguageChange={onLanguageChange}
                      codingDetailLevel={codingDetailLevel}
                      onCodingDetailLevelChange={onCodingDetailLevelChange}
                    />
                  </div>
                </div>

                <div className="px-3 py-2">
                  <ProblemInput
                    onSubmit={onSolve}
                    onFetchUrl={onFetchUrl}
                    onScreenshot={onScreenshot}
                    onClear={onClear}
                    isLoading={isLoading}
                    extractedText={extractedText}
                    onExtractedTextClear={onExtractedTextClear}
                    shouldClear={clearScreenshot}
                    hasSolution={hasSolution}
                    expanded={problemExpanded}
                    onToggleExpand={onToggleExpand}
                    ascendMode={ascendMode}
                    loadedProblem={loadedProblem}
                    detailLevel={codingDetailLevel}
                    language={codingLanguage}
                  />
                </div>
              </div>

              {/* Bottom Section: System Design Panel (fills remaining space) */}
              <div className="flex-1 min-h-0 overflow-auto p-3">
                {hasSystemDesign ? (
                  <SystemDesignPanel
                    systemDesign={systemDesign}
                    eraserDiagram={eraserDiagram}
                    autoGenerateEraser={autoGenerateEraser}
                    onGenerateEraserDiagram={onGenerateEraserDiagram}
                    question={currentProblem || loadedProblem}
                    cloudProvider="auto"
                    qaHistory={qaHistory || []}
                    onFollowUpQuestion={onFollowUpQuestion}
                    isProcessingFollowUp={isProcessingFollowUp}
                  />
                ) : isLoading && loadingType === 'solve' ? (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-300">
                    <div className="flex gap-1 mb-2">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">Generating system design...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm">Enter a system design question to get started</span>
                  </div>
                )}
              </div>
            </div>
          </Allotment.Pane>

          {/* Right Pane - Interview Assistant (optional) */}
          {showAscendAssistant && (
            <Allotment.Pane minSize={400}>
              <VoiceAssistantPanel onClose={onCloseAscendAssistant} provider={provider} model={model} />
            </Allotment.Pane>
          )}
        </Allotment>
      </div>
    );
  }

  // Coding/Behavioral Mode - Original horizontal split layout
  return (
    <div className="h-full bg-neutral-800">
      <Allotment defaultSizes={showAscendAssistant ? [30, 40, 30] : [30, 70]}>
        {/* Left Pane - Problem + Explanation */}
        <Allotment.Pane minSize={300}>
          <div className="h-full flex flex-col overflow-hidden bg-neutral-750 border-r border-neutral-700/50">
            <div className="flex-shrink-0">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700/50 bg-neutral-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-400 to-brand-500" />
                  <h2 className="text-sm font-semibold text-white">Problem</h2>
                </div>
                <div className="flex items-center">
                  <AscendModeSelector
                    ascendMode={ascendMode}
                    designDetailLevel={designDetailLevel}
                    onDetailLevelChange={onDetailLevelChange}
                    autoGenerateEraser={autoGenerateEraser}
                    onAutoGenerateEraserChange={onAutoGenerateEraserChange}
                    codingLanguage={codingLanguage}
                    onLanguageChange={onLanguageChange}
                    codingDetailLevel={codingDetailLevel}
                    onCodingDetailLevelChange={onCodingDetailLevelChange}
                  />
                </div>
              </div>

              <div className="p-3">
                <ProblemInput
                  onSubmit={onSolve}
                  onFetchUrl={onFetchUrl}
                  onScreenshot={onScreenshot}
                  onClear={onClear}
                  isLoading={isLoading}
                  extractedText={extractedText}
                  onExtractedTextClear={onExtractedTextClear}
                  shouldClear={clearScreenshot}
                  hasSolution={hasSolution}
                  expanded={problemExpanded}
                  onToggleExpand={onToggleExpand}
                  ascendMode={ascendMode}
                  loadedProblem={loadedProblem}
                  detailLevel={codingDetailLevel}
                  language={codingLanguage}
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <ExplanationPanel
                explanations={solution?.explanations}
                highlightedLine={highlightedLine}
                pitch={solution?.pitch || streamingContent.pitch}
                systemDesign={solution?.systemDesign || streamingContent.systemDesign}
                isStreaming={isLoading && loadingType === 'solve' && !solution}
                onExpandSystemDesign={onExpandSystemDesign}
                canExpandSystemDesign={!!currentProblem && !isLoading}
                onFollowUpQuestion={onFollowUpQuestion}
                isProcessingFollowUp={isProcessingFollowUp}
              />
            </div>
          </div>
        </Allotment.Pane>

        {/* Center Pane - Code Editor */}
        <Allotment.Pane minSize={400}>
          <div className="h-full bg-neutral-800 border-l border-neutral-700/50">
            <CodeDisplay
              ref={codeDisplayRef}
              code={solution?.code || streamingContent.code}
              language={solution?.language || streamingContent.language}
              complexity={solution?.complexity || streamingContent.complexity}
              onLineHover={onLineHover}
              examples={solution?.examples}
              isStreaming={isLoading && loadingType === 'solve' && !solution}
              autoRunOutput={autoRunOutput}
              onExplanationsUpdate={onExplanationsUpdate}
              ascendMode={ascendMode}
              codingLanguage={codingLanguage}
              onLanguageChange={ascendMode === 'coding' ? onLanguageChange : undefined}
              detailLevel={codingDetailLevel}
              onDetailLevelChange={ascendMode === 'coding' ? onCodingDetailLevelChange : undefined}
              editorSettings={editorSettings}
              systemDesign={solution?.systemDesign || streamingContent.systemDesign}
              eraserDiagram={eraserDiagram}
              autoGenerateEraser={autoGenerateEraser}
              question={currentProblem || loadedProblem}
              cloudProvider="auto"
              onGenerateEraserDiagram={onGenerateEraserDiagram}
            />
          </div>
        </Allotment.Pane>

        {/* Right Pane - Interview Assistant */}
        {showAscendAssistant && (
          <Allotment.Pane minSize={400}>
            <VoiceAssistantPanel onClose={onCloseAscendAssistant} provider={provider} model={model} />
          </Allotment.Pane>
        )}
      </Allotment>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function DesignIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function PrepIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function StealthIcon({ stealthMode }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {stealthMode ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      )}
    </svg>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function buildEraserDescription(sd) {
  const techStack = sd.techJustifications?.map(t => `${t.tech}: ${t.why}`).join('\n') || '';
  const scalability = sd.scalability?.join(', ') || '';
  const funcReqs = sd.requirements?.functional?.join(', ') || '';
  const nonFuncReqs = sd.requirements?.nonFunctional?.join(', ') || '';

  return `DETAILED CLOUD ARCHITECTURE DIAGRAM:

SYSTEM: ${sd.overview || ''}

COMPONENTS: ${sd.architecture?.components?.join(', ') || ''}

ARCHITECTURE: ${sd.architecture?.description || ''}

TECHNOLOGY STACK:
${techStack}

SCALABILITY: ${scalability}

FUNCTIONAL REQUIREMENTS: ${funcReqs}
NON-FUNCTIONAL REQUIREMENTS: ${nonFuncReqs}

INCLUDE: VPC, DNS, Load Balancers, CDN, API Gateway, Application servers, Caches, Database with replicas, Message queues, Worker services, Object storage, Monitoring stack.

SECURITY: IAM, KMS, Secrets Manager, WAF, Security Groups, VPC endpoints.

MONITORING: CloudWatch, X-Ray, Centralized logging, Alerting.`;
}
// Deploy Fri Mar 13 01:49:05 PDT 2026
