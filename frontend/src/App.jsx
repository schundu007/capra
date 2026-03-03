import { useState, useEffect, useRef } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import ProblemInput from './components/ProblemInput';
import CodeDisplay from './components/CodeDisplay';
import ExplanationPanel from './components/ExplanationPanel';
import ProviderToggle from './components/ProviderToggle';
import ErrorDisplay from './components/ErrorDisplay';
import PlatformStatus from './components/PlatformStatus';
import OAuthLogin from './components/auth/OAuthLogin';
import PricingPlans from './components/billing/PricingPlans';
import CreditBalance from './components/billing/CreditBalance';
import DownloadPage from './components/billing/DownloadPage';
import DocsPage from './components/DocsPage';
import OnboardingModal, { hasCompletedOnboarding, markOnboardingComplete } from './components/onboarding/OnboardingModal';
import { useAuth } from './contexts/AuthContext';
import AdminPanel from './components/AdminPanel';
import ChunduLogo from './components/ChunduLogo';
import SettingsPanel from './components/settings/SettingsPanel';
import SetupWizard from './components/settings/SetupWizard';
import PlatformAuth from './components/PlatformAuth';
import AscendAssistantPanel from './components/AscendAssistantPanel';
import AscendModeSelector from './components/AscendModeSelector';
import PrepTab from './components/PrepTab';
import AscendPrepModal from './components/AscendPrepModal';
import SavedSystemDesignsModal from './components/SavedSystemDesignsModal';
import { getApiUrl } from './hooks/useElectron';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { useSystemDesignStorage } from './hooks/useSystemDesignStorage';
import { useCodingHistory } from './hooks/useCodingHistory';
import Sidebar from './components/Sidebar';

// Detect Electron environment
const isElectron = window.electronAPI?.isElectron || false;

// Check if this is the dedicated Interview Prep window
const isAscendPrepWindow = window.location.hash === '#ascend-prep';

// Get API URL - uses dynamic resolution for Electron
const API_URL = getApiUrl();

// Coding Platforms
const PLATFORMS = {
  hackerrank: { name: 'HackerRank', icon: 'H', color: '#1ba94c' },
  coderpad: { name: 'CoderPad', icon: 'C', color: '#6366f1' },
  leetcode: { name: 'LeetCode', icon: 'L', color: '#f97316' },
  codesignal: { name: 'CodeSignal', icon: 'S', color: '#3b82f6' },
};

// Migrate old storage keys from ascend_* to chundu_*
function migrateStorageKeys() {
  const migrations = [
    ['ascend_token', 'chundu_token'],
    ['ascend_coding_history', 'chundu_coding_history'],
    ['ascend_system_design_sessions', 'chundu_system_design_sessions'],
    ['ascend_auto_switch', 'chundu_auto_switch'],
    ['ascend_sidebar_collapsed', 'chundu_sidebar_collapsed'],
  ];

  let migrated = false;
  for (const [oldKey, newKey] of migrations) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldValue);
      console.log(`[Migration] Migrated ${oldKey} -> ${newKey}`);
      migrated = true;
    }
  }
  if (migrated) {
    console.log('[Migration] Storage keys migrated successfully');
  }
}

// Run migration on load
migrateStorageKeys();

// Get auth token from localStorage (supports both old and new auth formats)
function getToken() {
  // Try new OAuth format first (ascend_auth)
  try {
    const authData = localStorage.getItem('ascend_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.accessToken) {
        return parsed.accessToken;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  // Fall back to old format
  return localStorage.getItem('chundu_token');
}

// Get auth headers (includes Electron detection)
function getAuthHeaders() {
  const headers = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Add Electron header for backend to skip webapp authentication
  if (window.electronAPI?.isElectron) {
    headers['X-Electron-App'] = 'true';
  }
  return headers;
}

// Clean up text - remove double spaces, extra empty lines
function cleanupText(text) {
  if (!text) return text;
  // Only process strings, return objects/arrays as-is
  if (typeof text !== 'string') return text;
  return text
    .replace(/[ \t]+/g, ' ')           // Replace multiple spaces/tabs with single space
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // Replace 3+ newlines with 2
    .replace(/^\s+$/gm, '')            // Remove whitespace-only lines
    .replace(/\n{3,}/g, '\n\n')        // Ensure max 2 consecutive newlines
    .trim();
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

  // Try to extract top-level code field (not the "code" inside explanations array)
  // Look for "code" that comes after "language" or at the start of the JSON object
  // First, try to find "language" followed by "code" pattern
  let codeMatch = text.match(/"language"\s*:\s*"[^"]*"\s*,\s*"code"\s*:\s*"((?:[^"\\]|\\.)*)"/s);

  // If that doesn't work, look for "code" that is NOT inside an explanations object
  // (explanations objects have {"line": before "code")
  if (!codeMatch) {
    // Find all "code": "..." matches and filter out ones inside explanations
    const allCodeMatches = [...text.matchAll(/"code"\s*:\s*"((?:[^"\\]|\\.)*)"/gs)];
    for (const match of allCodeMatches) {
      // Check if this "code" is preceded by {"line": (which means it's in explanations)
      const beforeMatch = text.substring(0, match.index);
      const lastBrace = beforeMatch.lastIndexOf('{');
      const contextBefore = beforeMatch.substring(lastBrace);
      // If the context before doesn't contain "line", this is likely the top-level code
      if (!contextBefore.match(/"line"\s*:/)) {
        codeMatch = match;
        break;
      }
    }
  }

  if (codeMatch) {
    const codeValue = codeMatch[1] || codeMatch[1];
    result.code = codeValue
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

  // Extract pitch - can be either a string or an object
  // First try to match pitch as an object (new format)
  const pitchObjectMatch = text.match(/"pitch"\s*:\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/s);
  if (pitchObjectMatch) {
    try {
      result.pitch = JSON.parse(pitchObjectMatch[1]);
    } catch {
      // If parsing fails, try as string
    }
  }
  // Fallback: try to match pitch as a string (old format)
  if (!result.pitch) {
    const pitchStringMatch = text.match(/"pitch"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
    if (pitchStringMatch) {
      result.pitch = cleanupText(pitchStringMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\'));
    }
  }

  // Try to extract complexity
  const complexityMatch = text.match(/"complexity"\s*:\s*\{[^}]*"time"\s*:\s*"([^"]+)"[^}]*"space"\s*:\s*"([^"]+)"[^}]*\}/s);
  if (complexityMatch) {
    result.complexity = { time: complexityMatch[1], space: complexityMatch[2] };
  }

  // Try to extract systemDesign
  const systemDesignMatch = text.match(/"systemDesign"\s*:\s*(\{[\s\S]*?\})\s*(?:,|\})/);
  if (systemDesignMatch) {
    try {
      // Try to parse the systemDesign object
      const sdText = systemDesignMatch[1];
      // Check if it's a complete object (has "included")
      const includedMatch = sdText.match(/"included"\s*:\s*(true|false)/);
      if (includedMatch) {
        result.systemDesign = { included: includedMatch[1] === 'true' };
        // Try to parse full systemDesign if it seems complete
        if (includedMatch[1] === 'true') {
          try {
            // Look for the full systemDesign block
            const fullMatch = text.match(/"systemDesign"\s*:\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/s);
            if (fullMatch) {
              result.systemDesign = JSON.parse(fullMatch[1]);
            }
          } catch {
            // Keep partial result
          }
        }
      }
    } catch {
      // Ignore parse errors during streaming
    }
  }

  return result;
}

// Stream solve request using SSE
async function solveWithStream(problem, provider, language, detailLevel, model, onChunk, ascendMode = 'coding', designDetailLevel = 'basic', signal = null, autoSwitch = false, onSwitch = null) {
  const response = await fetch(API_URL + '/api/solve/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ problem, provider, language, detailLevel, model, ascendMode, designDetailLevel, autoSwitch }),
    signal,
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
          if (data.switching) {
            console.log(`[Solve Stream] Provider switching from ${data.from} to ${data.to}: ${data.reason}`);
            if (onSwitch) {
              onSwitch(data.from, data.to, data.reason);
            }
          }
          if (data.chunk) {
            onChunk(data.chunk);
          }
          if (data.done && data.result) {
            result = data.result;
            // Clean up text fields in the result (only if pitch is a string)
            if (result.pitch && typeof result.pitch === 'string') {
              result.pitch = cleanupText(result.pitch);
            }
            if (result.systemDesign?.overview) {
              result.systemDesign.overview = cleanupText(result.systemDesign.overview);
            }
            if (result.systemDesign?.architecture?.description) {
              result.systemDesign.architecture.description = cleanupText(result.systemDesign.architecture.description);
            }
          }
          if (data.error) {
            const error = new Error(data.error);
            if (data.needCredits) {
              error.needCredits = true;
            }
            throw error;
          }
        } catch (e) {
          if (e.message !== 'Unexpected end of JSON input') {
            console.error('SSE parse error:', e);
            if (e.needCredits) throw e;
          }
        }
      }
    }
  }

  return result;
}

export default function App() {
  const [provider, setProvider] = useState('claude');
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const [autoSwitch, setAutoSwitch] = useState(() => {
    try {
      return localStorage.getItem('chundu_auto_switch') === 'true';
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // AbortController ref for cancelling ongoing operations
  const abortControllerRef = useRef(null);

  // Auth from context (webapp)
  const auth = useAuth();

  // Auth state for Electron (local) mode
  const [authChecked, setAuthChecked] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Unified auth state - webapp uses context, Electron skips auth
  const isAuthenticated = isElectron ? true : auth.isAuthenticated;
  const user = isElectron ? null : auth.user;
  const authRequired = !isElectron && auth.isWebApp;

  // URL-based routing for webapp
  const currentPath = !isElectron ? window.location.pathname : '';
  const isLandingPage = !isElectron && (currentPath === '/' || currentPath === '/login');
  const isDownloadPage = !isElectron && currentPath === '/download';
  const isDocsPage = !isElectron && currentPath.startsWith('/docs');
  const isAppPage = !isElectron && currentPath === '/app';

  // Electron-specific state
  const [showSettings, setShowSettings] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showPlatformAuth, setShowPlatformAuth] = useState(false);
  const [showAscendAssistant, setShowAscendAssistant] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [platformStatus, setPlatformStatus] = useState({});
  const [showPrepTab, setShowPrepTab] = useState(false);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);

  // Coding mode controls (lifted from ProblemInput)
  const [codingDetailLevel, setCodingDetailLevel] = useState('basic');
  const [codingLanguage, setCodingLanguage] = useState('auto');

  // System design storage hook
  const systemDesignStorage = useSystemDesignStorage();

  // Coding history hook
  const codingHistory = useCodingHistory();

  // Sidebar state (persisted)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (!isElectron) return true;
    try {
      return localStorage.getItem('chundu_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Toggle sidebar and persist state
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    try {
      localStorage.setItem('chundu_sidebar_collapsed', String(newState));
    } catch {
      // Ignore storage errors
    }
  };

  // Check if user is admin
  // Check if user is admin (supports both old roles array and new role string)
  const isAdmin = user?.role === 'admin' || user?.roles?.includes?.('admin');

  // Check auth status on mount
  useEffect(() => {
    // In Electron mode, auth is always ready
    if (isElectron) {
      setAuthChecked(true);
      return;
    }

    // For webapp, auth status comes from context
    // Wait for auth context to finish loading
    if (!auth.loading) {
      setAuthChecked(true);
    }
  }, [auth.loading]);

  // Show onboarding for new webapp users
  useEffect(() => {
    if (!isElectron && isAuthenticated && authChecked && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, authChecked]);

  // URL-based routing for webapp
  useEffect(() => {
    if (isElectron || !authChecked) return;

    const path = window.location.pathname;

    // If authenticated and on /login or root, redirect to main app at /app
    if (isAuthenticated && (path === '/login' || path === '/')) {
      window.history.replaceState({}, '', '/app');
    }
    // Unauthenticated users can stay on / (landing) or /login
    // No automatic redirect - let them see the landing page
  }, [isAuthenticated, authChecked]);

  // Listen for Electron events
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    // Get initial stealth mode state
    window.electronAPI.getStealthMode?.().then(enabled => {
      setStealthMode(enabled);
    });

    // Listen for stealth mode changes
    const removeStealthListener = window.electronAPI.onStealthModeChanged?.((enabled) => {
      setStealthMode(enabled);
    });

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
      removeStealthListener?.();
      removeFirstRun?.();
      removeOpenSettings?.();
      removeNewProblem?.();
    };
  }, []);

  // Listen for problems from Chrome extension (SSE)
  useEffect(() => {
    if (!isElectron) return;

    let eventSource = null;
    let reconnectTimeout = null;

    function connect() {
      eventSource = new EventSource(`${API_URL}/api/extension/events`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Extension] Received event:', data);

          if (data.type === 'problem' && data.url) {
            // Auto-solve the problem
            console.log('[Extension] Auto-solving problem:', data.url, 'type:', data.problemType);

            // Show notification
            setError(null);
            setSwitchNotification({ from: 'Extension', to: data.platform, reason: 'Problem detected' });
            setTimeout(() => setSwitchNotification(null), 3000);

            // Set the interview mode based on problem type
            if (data.problemType === 'system_design') {
              setAscendMode('system-design');
            } else {
              setAscendMode('coding');
            }

            // Store URL for display
            setExtractedText(`[Auto-detected from ${data.platform}]\n${data.url}`);

            // Trigger URL fetch and solve (use default language and detail level)
            handleFetchUrl(data.url, 'auto', 'detailed');
          }
        } catch (err) {
          console.error('[Extension] Failed to parse event:', err);
        }
      };

      eventSource.onerror = () => {
        console.log('[Extension] SSE connection error, reconnecting...');
        eventSource?.close();
        reconnectTimeout = setTimeout(connect, 3000);
      };

      eventSource.onopen = () => {
        console.log('[Extension] SSE connected - listening for problems');
      };
    }

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  // Load platform status
  useEffect(() => {
    async function loadPlatformStatus() {
      if (!isElectron || !window.electronAPI?.getPlatformStatus) return;
      try {
        const status = await window.electronAPI.getPlatformStatus();
        setPlatformStatus(status || {});
      } catch (err) {
        console.error('Failed to load platform status:', err);
      }
    }
    loadPlatformStatus();
  }, []);

  const handleLogout = () => {
    if (!isElectron) {
      auth.signOut();
    }
  };

  const [loadingType, setLoadingType] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('default');
  const [switchNotification, setSwitchNotification] = useState(null);
  const [solution, setSolution] = useState(null);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [clearScreenshot, setClearScreenshot] = useState(0);
  const [problemExpanded, setProblemExpanded] = useState(true); // Controls problem area expand/collapse
  const [copyToast, setCopyToast] = useState(false); // Toast notification for copy

  const resetState = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setAutoRunOutput(null);
  };

  const handleClearAll = () => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setExtractedText('');
    setLoadedProblem(''); // Clear loaded problem from history
    setStreamingText('');
    setAutoRunOutput(null);
    setProblemExpanded(true);
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
  const [loadedProblem, setLoadedProblem] = useState(''); // Problem loaded from history
  const [autoFixAttempts, setAutoFixAttempts] = useState(0);
  const [autoRunOutput, setAutoRunOutput] = useState(null); // Store auto-run output
  const MAX_AUTO_FIX_ATTEMPTS = 1; // Only 1 attempt to keep it fast

  // Interview mode state
  const [ascendMode, setAscendMode] = useState('coding'); // 'coding' | 'system-design'
  const [designDetailLevel, setDesignDetailLevel] = useState('basic'); // 'basic' | 'full'
  const [eraserDiagram, setEraserDiagram] = useState(null); // { imageUrl, editUrl }
  const [autoGenerateEraser, setAutoGenerateEraser] = useState(false); // Auto-generate pro diagram
  const [isProcessingFollowUp, setIsProcessingFollowUp] = useState(false); // Follow-up question state

  // Ref for CodeDisplay run function
  const codeDisplayRef = useRef(null);

  // Handle mode change with state reset
  const handleModeChange = (newMode) => {
    if (newMode !== ascendMode) {
      // Abort any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Reset loading states immediately
      setIsLoading(false);
      setLoadingType(null);

      // Reset all state when switching modes
      setSolution(null);
      setError(null);
      setErrorType('default');
      setStreamingText('');
      setStreamingContent({
        code: null,
        language: null,
        pitch: null,
        explanations: null,
        complexity: null,
        systemDesign: null,
      });
      setAutoRunOutput(null);
      setEraserDiagram(null);
      setExtractedText('');
      setCurrentProblem('');
      setProblemExpanded(true);
      setClearScreenshot(c => c + 1);
      setAscendMode(newMode);
    }
  };

  // Load a saved system design session
  const handleLoadSavedSession = (sessionId) => {
    const session = systemDesignStorage.loadSession(sessionId);
    if (session) {
      // Switch to system design mode if not already
      if (ascendMode !== 'system-design') {
        setAscendMode('system-design');
      }

      // Set the detail level
      setDesignDetailLevel(session.detailLevel || 'full');

      // Load the problem and solution
      setCurrentProblem(session.problem || '');
      setExtractedText(session.problem || '');
      setProblemExpanded(true);

      // Set the solution with system design
      setSolution({
        systemDesign: session.systemDesign,
        code: null,
        language: null,
        pitch: null,
        explanations: null,
        complexity: null
      });

      // Load Eraser diagram if saved
      if (session.eraserDiagram) {
        setEraserDiagram(session.eraserDiagram);
      }

      // Clear any errors
      setError(null);
      setErrorType('default');
    }
  };

  // Load a coding history entry
  const handleLoadHistoryEntry = (entryId) => {
    const entry = codingHistory.getEntry(entryId);
    if (entry) {
      // Switch to coding mode if not already
      if (ascendMode !== 'coding') {
        setAscendMode('coding');
      }

      // Load the problem and solution
      setCurrentProblem(entry.problem || '');
      setLoadedProblem(entry.problem || ''); // Use dedicated prop for loaded problems
      setProblemExpanded(true);
      setCurrentLanguage(entry.language || 'auto');

      // Set the solution (including pitch and explanations from history)
      setSolution({
        code: entry.code,
        language: entry.language,
        complexity: entry.complexity,
        pitch: entry.pitch || null,
        explanations: entry.explanations || null,
        systemDesign: null
      });

      // Clear any errors
      setError(null);
      setErrorType('default');
    }
  };

  // Keyboard shortcut callbacks
  const handleKeyboardSolve = () => {
    console.log('[App] handleKeyboardSolve called, problem:', !!(currentProblem || extractedText));
    if (currentProblem || extractedText) {
      handleSolve(currentProblem || extractedText, currentLanguage, 'detailed');
    }
  };

  const handleKeyboardRun = () => {
    console.log('[App] handleKeyboardRun called');
    if (codeDisplayRef.current?.runCode) {
      codeDisplayRef.current.runCode();
    }
  };

  const handleKeyboardCopy = async () => {
    const code = solution?.code || streamingContent.code;
    if (!code) return;

    let success = false;
    try {
      // Try Electron clipboard first (most reliable in Electron)
      if (window.electronAPI?.copyToClipboard) {
        success = await window.electronAPI.copyToClipboard(code);
      } else {
        // Fallback to web clipboard API
        await navigator.clipboard.writeText(code);
        success = true;
      }
    } catch (err) {
      // Final fallback using execCommand
      try {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (e) {
        success = false;
      }
    }

    // Show toast feedback
    if (success) {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 1500);
    }
  };

  // Check if any modal is open (disable shortcuts when modals are open)
  const isModalOpen = showSettings || showSetupWizard || showPlatformAuth ||
                      showPrepTab || showAdminPanel || showSavedDesigns;

  // Global keyboard shortcuts
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

  // Auto-test, fix, and run code - returns code and final output
  const autoTestAndFix = async (code, language, examples, problem, currentModel) => {
    const RUNNABLE = ['python', 'bash', 'javascript', 'typescript', 'sql'];
    const normalizedLang = language?.toLowerCase() || 'python';

    // Skip auto-fix if language not runnable or no examples
    if (!RUNNABLE.includes(normalizedLang) || !examples || examples.length === 0) {
      return { code, fixed: false, attempts: 0, output: null };
    }

    // Skip auto-run for code with network calls (sandbox doesn't support)
    if (/requests\.|fetch\(|http\.|urllib|axios|aiohttp/.test(code)) {
      return {
        code,
        fixed: false,
        attempts: 0,
        output: { success: true, output: '⚠️ Code makes API calls - run locally to test', input: '' }
      };
    }

    let currentCode = code;
    let attempts = 0;
    let finalOutput = null;

    // Only try once to keep it fast
    const testInput = examples[0]?.input || '';

    setLoadingType('testing');

    try {
      const runResponse = await fetch(API_URL + '/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code: currentCode, language: normalizedLang, input: testInput }),
      });
      const runResult = await runResponse.json();

      // If successful, store the output
      if (runResult.success) {
        finalOutput = { success: true, output: runResult.output, input: testInput };
        return { code: currentCode, fixed: false, attempts: 0, output: finalOutput };
      }

      // Runtime error - try one fix
      const errorMsg = runResult.error || 'Unknown error';
      attempts = 1;
      setAutoFixAttempts(attempts);
      setLoadingType('fixing');

      const fixResponse = await fetch(API_URL + '/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          code: currentCode,
          error: errorMsg,
          language: normalizedLang,
          problem: problem,
          provider: provider,
          model: currentModel
        }),
      });
      const fixResult = await fixResponse.json();

      if (fixResult.code) {
        currentCode = fixResult.code;

        // Run the fixed code to get output
        setLoadingType('running');
        const finalRunResponse = await fetch(API_URL + '/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ code: currentCode, language: normalizedLang, input: testInput }),
        });
        const finalRunResult = await finalRunResponse.json();
        finalOutput = {
          success: finalRunResult.success,
          output: finalRunResult.success ? finalRunResult.output : finalRunResult.error,
          input: testInput
        };

        return { code: currentCode, fixed: true, attempts: 1, output: finalOutput };
      }
    } catch (err) {
      console.error('Auto-fix error:', err);
    }

    return { code: currentCode, fixed: attempts > 0, attempts, output: finalOutput };
  };

  const handleSolve = async (problem, language, detailLevel = 'detailed') => {
    // Abort any previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    resetState();
    setCurrentProblem(problem);
    setCurrentLanguage(language);
    setStreamingText('');
    setAutoFixAttempts(0);
    setEraserDiagram(null);
    setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    setIsLoading(true);
    setLoadingType('solve');
    try {
      let fullText = '';
      console.log('[App] Starting solveWithStream with provider:', provider, 'model:', model);
      const result = await solveWithStream(problem, provider, language, detailLevel, model, (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
        // Parse and extract content progressively
        const parsed = parseStreamingContent(fullText);
        setStreamingContent(parsed);
        console.log('[App] Received chunk, parsed code length:', parsed.code?.length || 0);
      }, ascendMode, designDetailLevel, signal, autoSwitch, (from, to, reason) => {
        setSwitchNotification({ from, to, reason });
        setTimeout(() => setSwitchNotification(null), 5000);
      });
      console.log('[App] solveWithStream completed, result:', result ? 'has result' : 'no result');

      if (result) {
        // Auto-test, fix, and run the code (skip for system design mode)
        if (ascendMode !== 'system-design' && result.code) {
          const { code: fixedCode, fixed, attempts, output } = await autoTestAndFix(
            result.code,
            result.language,
            result.examples,
            problem,
            model
          );

          // Store auto-run output for CodeDisplay
          setAutoRunOutput(output);

          // Update solution with fixed code
          setSolution({
            ...result,
            code: fixedCode,
            autoFixed: fixed,
            fixAttempts: attempts
          });

          // Save to coding history (only for coding mode)
          if (ascendMode === 'coding' && fixedCode) {
            codingHistory.addEntry({
              problem,
              language: result.language || language,
              code: fixedCode,
              complexity: result.complexity,
              source: 'text',
              pitch: result.pitch,
              explanations: result.explanations
            });
          }
        } else {
          setSolution(result);

          // Auto-save system design session
          console.log('[App] Checking save condition:', { ascendMode, hasSystemDesign: !!result?.systemDesign, included: result?.systemDesign?.included });
          if (ascendMode === 'system-design' && result?.systemDesign?.included) {
            console.log('[App] Saving system design session');
            systemDesignStorage.saveSession({
              problem,
              source: 'text',
              systemDesign: result.systemDesign,
              detailLevel: designDetailLevel
            });
          }

          // Auto-generate Eraser diagram if enabled and in system design mode
          if (autoGenerateEraser && ascendMode === 'system-design' && result?.systemDesign?.included) {
            const sd = result.systemDesign;
            // Build comprehensive description for detailed diagram
            const techStack = sd.techJustifications?.map(t => `${t.tech}: ${t.why}`).join('\n') || '';
            const scalability = sd.scalability?.join(', ') || '';
            const funcReqs = sd.requirements?.functional?.join(', ') || '';
            const nonFuncReqs = sd.requirements?.nonFunctional?.join(', ') || '';
            const description = `DETAILED CLOUD ARCHITECTURE DIAGRAM for interview deep-dive:

SYSTEM: ${sd.overview || ''}

COMPONENTS (show ALL with connections): ${sd.architecture?.components?.join(', ') || ''}

ARCHITECTURE: ${sd.architecture?.description || ''}

TECHNOLOGY STACK (include each as labeled component):
${techStack}

SCALABILITY REQUIREMENTS: ${scalability}

FUNCTIONAL REQUIREMENTS: ${funcReqs}
NON-FUNCTIONAL REQUIREMENTS: ${nonFuncReqs}

MUST INCLUDE IN DIAGRAM:
- VPC/VNet with public and private subnets
- DNS (Route53/Cloud DNS) at the entry point
- Internet Gateway, NAT Gateway for traffic flow
- WAF, Firewalls, Security Groups for security
- Load Balancers (external and internal), CDN, API Gateway at ingress
- Application servers/containers with auto-scaling groups
- Caches (Redis/Memcached) with cache-aside pattern
- Primary database with read replicas in different AZs
- SNS topics for fan-out pub/sub (labeled with event types: OrderCreated, UserSignedUp, etc.)
- SQS queues for async processing with Dead Letter Queues (DLQ) for failures
- EventBridge/CloudWatch Events for event routing
- Kafka/Kinesis for high-throughput streaming
- Show pattern: Producer → SNS → SQS → Consumer/Worker
- Worker services for background jobs
- Object storage for files/media
- Search service (Elasticsearch) if relevant
- Monitoring and logging stack (CloudWatch/Prometheus/Grafana)
- Show ALL data flow paths with labeled arrows (HTTPS, gRPC, TCP, Events)
- Show network boundaries and security zones

SECURITY (CRITICAL):
- IAM roles/policies for service-to-service authentication
- KMS for encryption (data at rest and in transit)
- Secrets Manager/Parameter Store for credentials
- Certificate Manager for TLS certificates
- WAF rules, Shield for DDoS protection
- VPC endpoints/PrivateLink for private connectivity
- Security boundaries between tiers (DMZ, trusted zones)
- Label auth flows: IAM Role, JWT, mTLS, API Key

MONITORING & OBSERVABILITY:
- CloudWatch/Prometheus/Stackdriver for metrics
- X-Ray/Jaeger for distributed tracing
- Centralized logging (CloudWatch Logs, ELK, Splunk)
- Alerting integration (PagerDuty, OpsGenie, SNS)
- Dashboards (Grafana, CloudWatch Dashboards)
- Health checks and synthetic monitoring

MULTI-CLOUD & ON-PREM CONNECTIVITY:
- VPN tunnels between clouds (AWS-GCP, AWS-Azure)
- Direct Connect/ExpressRoute/Cloud Interconnect
- Transit Gateway for multi-VPC routing
- On-premises data center with hybrid connectivity
- Cross-cloud service integration patterns

EDGE CASES & RESILIENCE:
- Circuit breakers for fault tolerance
- Retry queues with exponential backoff
- Disaster Recovery (DR) region with replication
- Failover paths (active-passive or active-active)
- Rate limiting and throttling at API Gateway
- Graceful degradation paths`;
            fetch(API_URL + '/api/diagram/eraser', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({ description }),
            })
              .then(res => res.ok ? res.json() : null)
              .then(data => {
                if (data) {
                  setEraserDiagram(data);
                  // Auto-save Eraser diagram to current session
                  if (systemDesignStorage.currentSessionId) {
                    systemDesignStorage.updateEraserDiagram(systemDesignStorage.currentSessionId, data);
                  }
                }
              })
              .catch(err => console.error('Auto Eraser diagram failed:', err));
          }
        }
      }
    } catch (err) {
      // Ignore abort errors (user switched modes or cancelled)
      if (err.name === 'AbortError') {
        return;
      }
      // Handle needCredits error - show pricing modal
      if (err.needCredits) {
        setShowPricingPlans(true);
        setError('You need more credits to continue. Please purchase a plan or add-on.');
        setErrorType('credits');
      } else {
        setError(err.message);
        setErrorType('solve');
      }
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      setAutoFixAttempts(0);
      setStreamingText('');
      setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    }
  };

  const handleExpandSystemDesign = async () => {
    if (!currentProblem) return;
    handleSolve(currentProblem + '\n\nProvide a DETAILED system design with all components, data models, API design, scalability considerations, and architecture diagram.', currentLanguage, 'detailed');
  };

  // Handle follow-up questions for any interview problem
  const handleFollowUpQuestion = async (question) => {
    console.log('[App Q&A] handleFollowUpQuestion called with:', question);

    // Get current context - works for both coding and system design
    const currentCode = solution?.code || streamingContent.code;
    const currentPitch = solution?.pitch || streamingContent.pitch;
    const currentDesign = solution?.systemDesign || streamingContent.systemDesign;

    if (!currentCode && !currentPitch && !currentDesign?.included) {
      console.log('[App Q&A] No solution context, returning null');
      return { answer: 'Please solve a problem first before asking follow-up questions.' };
    }

    setIsProcessingFollowUp(true);
    console.log('[App Q&A] Making API call to /api/solve/followup');

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
          model
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process follow-up question');
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

      // Update the system design with the new data
      if (result?.updatedDesign) {
        setSolution(prev => ({
          ...prev,
          systemDesign: result.updatedDesign
        }));
      }

      // Auto-save Q&A to current session (for system design mode)
      if (ascendMode === 'system-design' && systemDesignStorage.currentSessionId && result?.answer) {
        systemDesignStorage.addQAToSession(
          systemDesignStorage.currentSessionId,
          question,
          result.answer
        );

        // Also update system design if it was modified
        if (result?.updatedDesign) {
          systemDesignStorage.updateSession(systemDesignStorage.currentSessionId, {
            systemDesign: result.updatedDesign
          });
        }
      }

      return result;
    } catch (err) {
      console.error('Follow-up question error:', err);
      return null;
    } finally {
      setIsProcessingFollowUp(false);
    }
  };

  const handleFetchUrl = async (url, language, detailLevel = 'detailed') => {
    resetState();
    setStreamingText('');
    setAutoFixAttempts(0);
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
      setExtractedText(fetchData.problemText); // Show fetched problem in input
      setProblemExpanded(true); // Auto-expand to show full problem
      setCurrentLanguage(language);
      setLoadingType('solve');

      let fullText = '';
      const result = await solveWithStream(fetchData.problemText, provider, language, detailLevel, model, (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
        const parsed = parseStreamingContent(fullText);
        setStreamingContent(parsed);
      }, ascendMode, designDetailLevel, null, autoSwitch, (from, to, reason) => {
        setSwitchNotification({ from, to, reason });
        setTimeout(() => setSwitchNotification(null), 5000);
      });
      if (result) {
        // Auto-test, fix, and run the code (skip for system design mode)
        if (ascendMode !== 'system-design' && result.code) {
          const { code: fixedCode, fixed, attempts, output } = await autoTestAndFix(
            result.code,
            result.language,
            result.examples,
            fetchData.problemText,
            model
          );

          // Store auto-run output for CodeDisplay
          setAutoRunOutput(output);

          setSolution({
            ...result,
            code: fixedCode,
            autoFixed: fixed,
            fixAttempts: attempts
          });

          // Save to coding history for URL-fetched problems
          if (ascendMode === 'coding' && fixedCode) {
            codingHistory.addEntry({
              problem: fetchData.problemText,
              language: result.language || language,
              code: fixedCode,
              complexity: result.complexity,
              source: 'url',
              pitch: result.pitch,
              explanations: result.explanations
            });
          }
        } else {
          setSolution(result);

          // Auto-save system design session for URL-fetched problems
          if (ascendMode === 'system-design' && result?.systemDesign?.included) {
            systemDesignStorage.saveSession({
              problem: fetchData.problemText,
              source: 'url',
              systemDesign: result.systemDesign,
              detailLevel: designDetailLevel
            });
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setErrorType('fetch');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      setAutoFixAttempts(0);
      setStreamingText('');
      setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    }
  };

  const handleScreenshot = async (file, language = 'auto', detailLevel = 'basic') => {
    setSolution(null);
    setError(null);
    setErrorType('default');
    setStreamingText('');
    setAutoFixAttempts(0);
    setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    setIsLoading(true);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to extract text');
      }

      const data = await response.json();
      const extractedProblem = data.text || '';
      setExtractedText(extractedProblem);
      setProblemExpanded(true); // Auto-expand to show full problem

      if (extractedProblem.trim()) {
        setCurrentProblem(extractedProblem);
        setCurrentLanguage(language);
        setLoadingType('solve');
        let fullText = '';
        const result = await solveWithStream(extractedProblem, provider, language, detailLevel, model, (chunk) => {
          fullText += chunk;
          setStreamingText(fullText);
          const parsed = parseStreamingContent(fullText);
          setStreamingContent(parsed);
        }, ascendMode, designDetailLevel, null, autoSwitch, (from, to, reason) => {
          setSwitchNotification({ from, to, reason });
          setTimeout(() => setSwitchNotification(null), 5000);
        });
        if (result) {
          // Auto-test, fix, and run the code (skip for system design mode)
          if (ascendMode !== 'system-design' && result.code) {
            const { code: fixedCode, fixed, attempts, output } = await autoTestAndFix(
              result.code,
              result.language,
              result.examples,
              extractedProblem,
              model
            );

            // Store auto-run output for CodeDisplay
            setAutoRunOutput(output);

            setSolution({
              ...result,
              code: fixedCode,
              autoFixed: fixed,
              fixAttempts: attempts
            });

            // Save to coding history for screenshot problems
            if (ascendMode === 'coding' && fixedCode) {
              codingHistory.addEntry({
                problem: extractedProblem,
                language: result.language || language,
                code: fixedCode,
                complexity: result.complexity,
                source: 'image',
                pitch: result.pitch,
                explanations: result.explanations
              });
            }
          } else {
            setSolution(result);

            // Auto-save system design session for screenshot problems
            if (ascendMode === 'system-design' && result?.systemDesign?.included) {
              systemDesignStorage.saveSession({
                problem: extractedProblem,
                source: 'image',
                systemDesign: result.systemDesign,
                detailLevel: designDetailLevel
              });
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setErrorType('screenshot');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      setAutoFixAttempts(0);
      setStreamingText('');
      setStreamingContent({ code: null, language: null, pitch: null, explanations: null, complexity: null, systemDesign: null });
    }
  };

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
            }}
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

  // Show docs page (publicly accessible, check before auth)
  if (isDocsPage) {
    return <DocsPage />;
  }

  // Show landing page for unauthenticated users at / or /login
  if (authRequired && !isAuthenticated) {
    // Allow landing page at root /, redirect /login to /
    if (window.location.pathname === '/login') {
      window.history.replaceState({}, '', '/');
    }
    return <OAuthLogin />;
  }

  // If authenticated but on landing page, redirect to /app
  if (authRequired && isAuthenticated && (window.location.pathname === '/login' || window.location.pathname === '/')) {
    window.history.replaceState({}, '', '/app');
  }

  // Show download page if authenticated and on /download path
  if (isDownloadPage && isAuthenticated) {
    return <DownloadPage />;
  }

  // If this is the dedicated Interview Prep window, render only that
  if (isAscendPrepWindow) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-white">
        <AscendPrepModal
          isOpen={true}
          onClose={() => window.close()}
          provider={provider}
          model={model}
          isDedicatedWindow={true}
        />
      </div>
    );
  }

  // Check if running on macOS in Electron (needs extra padding for traffic lights)
  const isMacElectron = isElectron && navigator.platform.toLowerCase().includes('mac');

  // Determine if sidebar should be shown (both Electron and webapp)
  // Hide sidebar completely in Preparation mode and Behavioral mode for full-page experience
  const showSidebar = !sidebarCollapsed && ascendMode !== 'ascend-prep' && ascendMode !== 'behavioral';

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
          onViewAllHistory={() => {/* Could add a history modal later */}}
          onOpenSettings={() => setShowSettings(true)}
          isLoading={isLoading}
          showAscendAssistant={showAscendAssistant}
          onToggleAscendAssistant={() => setShowAscendAssistant(!showAscendAssistant)}
          user={user}
          isAdmin={isAdmin}
          authRequired={authRequired}
          onLogout={handleLogout}
          onOpenAdminPanel={() => setShowAdminPanel(true)}
          stealthMode={stealthMode}
          onToggleStealth={() => window.electronAPI?.setStealthMode?.(!stealthMode)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - Slack Style */}
      <header
        className="slack-channel-header"
        style={{
          paddingLeft: (isMacElectron && !showSidebar) ? '80px' : '20px',
          WebkitAppRegion: 'drag',
          height: '49px',
        }}
      >
        {/* Left: Logo & Tabs */}
        <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
          {/* Sidebar Toggle - hidden in Preparation and Behavioral modes */}
          {sidebarCollapsed && ascendMode !== 'ascend-prep' && ascendMode !== 'behavioral' && (
            <button
              onClick={toggleSidebar}
              className="slack-btn-icon"
              title="Show sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Logo when sidebar hidden */}
          {!showSidebar && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{ background: 'var(--accent-green)' }}
              >
                <img
                  src="/ascend-logo.png"
                  alt="Ascend"
                  className="h-4 w-auto object-contain filter brightness-0 invert"
                />
              </div>
              <span className="text-title">Ascend</span>
              {isLoading && (
                <div className="slack-spinner" style={{ width: '16px', height: '16px' }} />
              )}
            </div>
          )}

          {/* Mode Tabs - Slack style */}
          <div className="slack-tabs">
            {[
              { id: 'coding', label: 'Coding', icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              )},
              { id: 'system-design', label: 'Design', icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )},
              { id: 'behavioral', label: 'Prep', icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )},
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`slack-tab ${ascendMode === mode.id ? 'active' : ''}`}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Credits */}
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
          <CreditBalance
            onUpgrade={() => setShowPricingPlans(true)}
            compact={true}
          />
        </div>
      </header>

      {/* Error Banner - Slack style */}
      {error && (
        <div
          className="mx-5 mt-3 p-3 rounded-lg animate-slide-up slack-card"
          style={{ background: 'rgba(224, 30, 90, 0.1)', borderColor: 'var(--accent-red)' }}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-red)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-body" style={{ color: 'var(--accent-red)' }}>{error}</span>
            <button onClick={() => setError(null)} className="slack-btn-icon ml-auto">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Provider Switch Notification */}
      {switchNotification && (
        <div
          className="mx-5 mt-3 p-3 rounded-lg animate-slide-up slack-card"
          style={{ background: 'rgba(236, 178, 46, 0.1)', borderColor: 'var(--accent-yellow)' }}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-yellow)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-body" style={{ color: 'var(--accent-yellow)' }}>
              Switched from <strong>{switchNotification.from}</strong> to <strong>{switchNotification.to}</strong>
              {switchNotification.reason && <span className="text-muted ml-1">({switchNotification.reason})</span>}
            </span>
            <button onClick={() => setSwitchNotification(null)} className="slack-btn-icon ml-auto">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="h-0.5 overflow-hidden" style={{ background: 'var(--border-default)' }}>
            <div
              className="h-full"
              style={{
                width: '30%',
                background: 'var(--accent-blue)',
                animation: 'slack-shimmer 1s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden relative z-10">
        {/* Behavioral Mode - Show embedded Interview Prep */}
        {ascendMode === 'behavioral' ? (
          <div className="h-full" style={{ background: 'var(--content-bg)' }}>
            <AscendPrepModal
              isOpen={true}
              onClose={() => {}}
              provider={provider}
              model={model}
              embedded={true}
            />
          </div>
        ) : (
        <div className="h-full" style={{ background: '#f5f5f5' }}>
          <Allotment defaultSizes={showAscendAssistant ? [30, 40, 30] : [30, 70]}>
            {/* Left Pane - Problem + Explanation */}
            <Allotment.Pane minSize={300}>
              <div className="h-full flex flex-col overflow-hidden" style={{ background: '#ffffff', borderRight: '1px solid #e8e8e8' }}>
                {/* Problem Section Header */}
                <div className="flex-shrink-0">
                  <div className="panel-header">
                    <div className="panel-header-left">
                      <div className="panel-indicator" />
                      <span className="panel-title">Problem</span>
                      {/* Saved System Designs Button - only show in system-design mode */}
                      {ascendMode === 'system-design' && (
                        <button
                          onClick={() => setShowSavedDesigns(true)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors"
                          style={{
                            background: systemDesignStorage.getAllSessions().length > 0 ? '#f3f4f6' : 'transparent',
                            color: '#6b7280',
                          }}
                          onMouseEnter={(e) => { e.target.style.background = '#e5e7eb'; e.target.style.color = '#374151'; }}
                          onMouseLeave={(e) => { e.target.style.background = systemDesignStorage.getAllSessions().length > 0 ? '#f3f4f6' : 'transparent'; e.target.style.color = '#6b7280'; }}
                          title="View saved system designs"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          Saved ({systemDesignStorage.getAllSessions().length})
                        </button>
                      )}
                    </div>
                    {/* Controls - different for each mode */}
                    <div className="panel-header-right">
                      {/* Coding mode controls */}
                      {ascendMode === 'coding' && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-full p-0.5" style={{ background: '#f0f0f0', border: '1px solid #e0e0e0' }}>
                            <button
                              type="button"
                              onClick={() => setCodingDetailLevel('basic')}
                              className="px-3 py-1 text-[10px] font-semibold transition-all rounded-full"
                              style={{
                                background: codingDetailLevel === 'basic' ? '#10b981' : 'transparent',
                                color: codingDetailLevel === 'basic' ? '#ffffff' : '#000000',
                              }}
                            >
                              Basic
                            </button>
                            <button
                              type="button"
                              onClick={() => setCodingDetailLevel('detailed')}
                              className="px-3 py-1 text-[10px] font-semibold transition-all rounded-full"
                              style={{
                                background: codingDetailLevel === 'detailed' ? '#10b981' : 'transparent',
                                color: codingDetailLevel === 'detailed' ? '#ffffff' : '#000000',
                              }}
                            >
                              Full
                            </button>
                          </div>
                          <select
                            value={codingLanguage}
                            onChange={(e) => setCodingLanguage(e.target.value)}
                            className="px-2 py-1 text-[10px] rounded-full bg-white border border-gray-200 text-black"
                          >
                            <option value="auto">Auto</option>
                            <option value="python">Python</option>
                            <option value="javascript">JS</option>
                            <option value="typescript">TS</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="go">Go</option>
                          </select>
                        </div>
                      )}
                      {/* System Design mode controls */}
                      <AscendModeSelector
                        ascendMode={ascendMode}
                        designDetailLevel={designDetailLevel}
                        onDetailLevelChange={setDesignDetailLevel}
                        autoGenerateEraser={autoGenerateEraser}
                        onAutoGenerateEraserChange={setAutoGenerateEraser}
                      />
                    </div>
                  </div>

                  {/* Problem Input Content - compact, no flex grow */}
                  <div className="p-2">
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
                      expanded={problemExpanded}
                      onToggleExpand={() => setProblemExpanded(prev => !prev)}
                      ascendMode={ascendMode}
                      loadedProblem={loadedProblem}
                      detailLevel={codingDetailLevel}
                      language={codingLanguage}
                    />
                  </div>
                </div>

                {/* Bottom: Explanations - takes remaining space */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ExplanationPanel
                    explanations={solution?.explanations}
                    highlightedLine={highlightedLine}
                    pitch={solution?.pitch || streamingContent.pitch}
                    systemDesign={solution?.systemDesign || streamingContent.systemDesign}
                    isStreaming={isLoading && loadingType === 'solve' && !solution}
                    onExpandSystemDesign={handleExpandSystemDesign}
                    canExpandSystemDesign={!!currentProblem && !isLoading}
                    onFollowUpQuestion={handleFollowUpQuestion}
                    isProcessingFollowUp={isProcessingFollowUp}
                  />
                </div>
              </div>
            </Allotment.Pane>

            {/* Center Pane - Code Editor (full height) */}
            <Allotment.Pane minSize={400}>
              <div className="h-full border-l border-gray-200">
                <CodeDisplay
                  ref={codeDisplayRef}
                  code={solution?.code || streamingContent.code}
                  language={solution?.language || streamingContent.language}
                  complexity={solution?.complexity || streamingContent.complexity}
                  onLineHover={setHighlightedLine}
                  examples={solution?.examples}
                  isStreaming={isLoading && loadingType === 'solve' && !solution}
                  autoRunOutput={autoRunOutput}
                  onExplanationsUpdate={(explanations) => {
                    setSolution(prev => prev ? { ...prev, explanations } : null);
                  }}
                  ascendMode={ascendMode}
                  systemDesign={solution?.systemDesign || streamingContent.systemDesign}
                  eraserDiagram={eraserDiagram}
                  autoGenerateEraser={autoGenerateEraser}
                  question={currentProblem || loadedProblem}
                  cloudProvider="auto"
                  onGenerateEraserDiagram={async () => {
                    const sd = solution?.systemDesign || streamingContent.systemDesign;
                    if (!sd?.included) return;
                    try {
                      // Build comprehensive description for detailed diagram
                      const techStack = sd.techJustifications?.map(t => `${t.tech}: ${t.why}`).join('\n') || '';
                      const scalability = sd.scalability?.join(', ') || '';
                      const funcReqs = sd.requirements?.functional?.join(', ') || '';
                      const nonFuncReqs = sd.requirements?.nonFunctional?.join(', ') || '';
                      const description = `DETAILED CLOUD ARCHITECTURE DIAGRAM for interview deep-dive:

SYSTEM: ${sd.overview || ''}

COMPONENTS (show ALL with connections): ${sd.architecture?.components?.join(', ') || ''}

ARCHITECTURE: ${sd.architecture?.description || ''}

TECHNOLOGY STACK (include each as labeled component):
${techStack}

SCALABILITY REQUIREMENTS: ${scalability}

FUNCTIONAL REQUIREMENTS: ${funcReqs}
NON-FUNCTIONAL REQUIREMENTS: ${nonFuncReqs}

MUST INCLUDE IN DIAGRAM:
- VPC/VNet with public and private subnets
- DNS (Route53/Cloud DNS) at the entry point
- Internet Gateway, NAT Gateway for traffic flow
- WAF, Firewalls, Security Groups for security
- Load Balancers (external and internal), CDN, API Gateway at ingress
- Application servers/containers with auto-scaling groups
- Caches (Redis/Memcached) with cache-aside pattern
- Primary database with read replicas in different AZs
- SNS topics for fan-out pub/sub (labeled with event types: OrderCreated, UserSignedUp, etc.)
- SQS queues for async processing with Dead Letter Queues (DLQ) for failures
- EventBridge/CloudWatch Events for event routing
- Kafka/Kinesis for high-throughput streaming
- Show pattern: Producer → SNS → SQS → Consumer/Worker
- Worker services for background jobs
- Object storage for files/media
- Search service (Elasticsearch) if relevant
- Monitoring and logging stack (CloudWatch/Prometheus/Grafana)
- Show ALL data flow paths with labeled arrows (HTTPS, gRPC, TCP, Events)
- Show network boundaries and security zones

SECURITY (CRITICAL):
- IAM roles/policies for service-to-service authentication
- KMS for encryption (data at rest and in transit)
- Secrets Manager/Parameter Store for credentials
- Certificate Manager for TLS certificates
- WAF rules, Shield for DDoS protection
- VPC endpoints/PrivateLink for private connectivity
- Security boundaries between tiers (DMZ, trusted zones)
- Label auth flows: IAM Role, JWT, mTLS, API Key

MONITORING & OBSERVABILITY:
- CloudWatch/Prometheus/Stackdriver for metrics
- X-Ray/Jaeger for distributed tracing
- Centralized logging (CloudWatch Logs, ELK, Splunk)
- Alerting integration (PagerDuty, OpsGenie, SNS)
- Dashboards (Grafana, CloudWatch Dashboards)
- Health checks and synthetic monitoring

MULTI-CLOUD & ON-PREM CONNECTIVITY:
- VPN tunnels between clouds (AWS-GCP, AWS-Azure)
- Direct Connect/ExpressRoute/Cloud Interconnect
- Transit Gateway for multi-VPC routing
- On-premises data center with hybrid connectivity
- Cross-cloud service integration patterns

EDGE CASES & RESILIENCE:
- Circuit breakers for fault tolerance
- Retry queues with exponential backoff
- Disaster Recovery (DR) region with replication
- Failover paths (active-passive or active-active)
- Rate limiting and throttling at API Gateway
- Graceful degradation paths`;
                      const response = await fetch(API_URL + '/api/diagram/eraser', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                        body: JSON.stringify({ description }),
                      });
                      if (response.ok) {
                        const data = await response.json();
                        setEraserDiagram(data);

                        // Auto-save Eraser diagram to current session
                        if (systemDesignStorage.currentSessionId) {
                          systemDesignStorage.updateEraserDiagram(systemDesignStorage.currentSessionId, data);
                        }
                      }
                    } catch (err) {
                      console.error('Failed to generate Eraser diagram:', err);
                    }
                  }}
                />
              </div>
            </Allotment.Pane>

            {/* Right Pane - Interview Assistant (conditional) */}
            {showAscendAssistant && (
              <Allotment.Pane minSize={400}>
                <AscendAssistantPanel
                  onClose={() => setShowAscendAssistant(false)}
                  provider={provider}
                  model={model}
                />
              </Allotment.Pane>
            )}
          </Allotment>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 px-5 py-2.5 flex items-center justify-between text-xs border-t"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isLoading ? 'animate-pulse' : ''}`}
              style={{
                background: isLoading ? 'var(--accent-success)' : 'var(--accent-success)',
                boxShadow: isLoading ? '0 0 8px var(--accent-success)' : 'none'
              }}
            />
            <span style={{ color: isLoading ? 'var(--accent-success-light)' : 'var(--text-muted)' }}>
              {isLoading ? 'Processing' : 'Ready'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: 'var(--text-subtle)' }}>
          <span className="flex items-center gap-1.5" title="Solve problem">
            <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>^1</kbd>
            solve
          </span>
          <span className="flex items-center gap-1.5" title="Run code">
            <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>^2</kbd>
            run
          </span>
          <span className="flex items-center gap-1.5" title="Copy code">
            <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>^3</kbd>
            copy
          </span>
          <span className="flex items-center gap-1.5" title="Clear all">
            <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>Esc</kbd>
            clear
          </span>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          token={getToken()}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Pricing Plans Modal */}
      <PricingPlans
        isOpen={showPricingPlans}
        onClose={() => setShowPricingPlans(false)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onOpenPricing={() => setShowPricingPlans(true)}
      />

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          provider={provider}
          model={model}
          onProviderChange={setProvider}
          onModelChange={setModel}
          onOpenPlatforms={() => setShowPrepTab(true)}
          autoSwitch={autoSwitch}
          onAutoSwitchChange={(value) => {
            setAutoSwitch(value);
            try {
              localStorage.setItem('chundu_auto_switch', value.toString());
            } catch (e) {
              console.error('Failed to save auto-switch setting:', e);
            }
          }}
        />
      )}

      {/* Setup Wizard (Electron first-run) */}
      {showSetupWizard && (
        <SetupWizard onComplete={() => setShowSetupWizard(false)} />
      )}

      {/* Platform Auth (Electron) */}
      {showPlatformAuth && (
        <PlatformAuth onClose={() => setShowPlatformAuth(false)} />
      )}

      {/* Platform Prep Hub (Electron) */}
      {showPrepTab && (
        <PrepTab isOpen={showPrepTab} onClose={() => setShowPrepTab(false)} />
      )}

      {/* Saved System Designs Modal */}
      <SavedSystemDesignsModal
        isOpen={showSavedDesigns}
        onClose={() => setShowSavedDesigns(false)}
        sessions={systemDesignStorage.getAllSessions()}
        onLoadSession={handleLoadSavedSession}
        onDeleteSession={systemDesignStorage.deleteSession}
        onClearAll={systemDesignStorage.clearAllSessions}
      />

      {/* Copy Toast Notification */}
      {copyToast && (
        <div
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-scale-in"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg"
            style={{
              background: 'var(--brand-gradient)',
              boxShadow: 'var(--shadow-glow-purple)'
            }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Code copied!</span>
          </div>
        </div>
      )}
      </div>{/* End Main Content wrapper */}

    </div>
  );
}
