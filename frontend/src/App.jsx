import { useState, useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import ProblemInput from './components/ProblemInput';
import CodeDisplay from './components/CodeDisplay';
import ExplanationPanel from './components/ExplanationPanel';
import ProviderToggle from './components/ProviderToggle';
import ErrorDisplay from './components/ErrorDisplay';
import PlatformStatus from './components/PlatformStatus';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import CapraLogo from './components/CapraLogo';
import SettingsPanel from './components/settings/SettingsPanel';
import SetupWizard from './components/settings/SetupWizard';
import PlatformAuth from './components/PlatformAuth';
import InterviewAssistantPanel from './components/InterviewAssistantPanel';
import InterviewModeSelector from './components/InterviewModeSelector';
import PrepTab from './components/PrepTab';
import { getApiUrl } from './hooks/useElectron';

// Detect Electron environment
const isElectron = window.electronAPI?.isElectron || false;

// Get API URL - uses dynamic resolution for Electron
const API_URL = getApiUrl();

// Coding Platforms
const PLATFORMS = {
  hackerrank: { name: 'HackerRank', icon: 'H', color: '#1ba94c' },
  coderpad: { name: 'CoderPad', icon: 'C', color: '#6366f1' },
  leetcode: { name: 'LeetCode', icon: 'L', color: '#f97316' },
  codesignal: { name: 'CodeSignal', icon: 'S', color: '#3b82f6' },
  codility: { name: 'Codility', icon: 'Y', color: '#eab308' },
  glider: { name: 'Glider', icon: 'G', color: '#ec4899' },
};

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
async function solveWithStream(problem, provider, language, detailLevel, model, onChunk, interviewMode = 'coding', designDetailLevel = 'basic') {
  console.log('[Frontend] solveWithStream called with interviewMode:', interviewMode, 'designDetailLevel:', designDetailLevel);
  const requestBody = { problem, provider, language, detailLevel, model, interviewMode, designDetailLevel };
  console.log('[Frontend] Request body:', JSON.stringify(requestBody, null, 2));
  const response = await fetch(API_URL + '/api/solve/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(requestBody),
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
  const [model, setModel] = useState('claude-sonnet-4-20250514');
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
  const [showInterviewAssistant, setShowInterviewAssistant] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [platformStatus, setPlatformStatus] = useState({});
  const [showPrepTab, setShowPrepTab] = useState(false);

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
  const [problemExpanded, setProblemExpanded] = useState(true); // Controls problem area expand/collapse

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
  const [autoFixAttempts, setAutoFixAttempts] = useState(0);
  const [autoRunOutput, setAutoRunOutput] = useState(null); // Store auto-run output
  const MAX_AUTO_FIX_ATTEMPTS = 1; // Only 1 attempt to keep it fast

  // Interview mode state
  const [interviewMode, setInterviewMode] = useState('coding'); // 'coding' | 'system-design'
  const [designDetailLevel, setDesignDetailLevel] = useState('basic'); // 'basic' | 'full'
  const [eraserDiagram, setEraserDiagram] = useState(null); // { imageUrl, editUrl }
  const [isProcessingFollowUp, setIsProcessingFollowUp] = useState(false); // Follow-up question state

  // Auto-test, fix, and run code - returns code and final output
  const autoTestAndFix = async (code, language, examples, problem, currentModel) => {
    const RUNNABLE = ['python', 'bash', 'javascript', 'typescript', 'sql'];
    const normalizedLang = language?.toLowerCase() || 'python';

    // Skip auto-fix if language not runnable or no examples
    if (!RUNNABLE.includes(normalizedLang) || !examples || examples.length === 0) {
      return { code, fixed: false, attempts: 0, output: null };
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
    console.log('[handleSolve] Called with interviewMode from state:', interviewMode, 'designDetailLevel:', designDetailLevel);
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
      console.log('[handleSolve] About to call solveWithStream with interviewMode:', interviewMode);
      const result = await solveWithStream(problem, provider, language, detailLevel, model, (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
        // Parse and extract content progressively
        const parsed = parseStreamingContent(fullText);
        setStreamingContent(parsed);
      }, interviewMode, designDetailLevel);

      if (result) {
        // Auto-test, fix, and run the code (skip for system design mode)
        if (interviewMode !== 'system-design' && result.code) {
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
        } else {
          setSolution(result);
        }
      }
    } catch (err) {
      setError(err.message);
      setErrorType('solve');
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

      const processLine = (line) => {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            console.log('[App Q&A] SSE data:', data);
            if (data.done && data.result) {
              result = data.result;
              console.log('[App Q&A] Got result:', result);
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
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          processLine(line);
        }
      }

      // Process any remaining content in the buffer after stream ends
      if (buffer.trim()) {
        const remainingLines = buffer.split('\n');
        for (const line of remainingLines) {
          processLine(line);
        }
      }

      console.log('[App Q&A] Final result:', result);

      // Update the system design with the new data
      if (result?.updatedDesign) {
        setSolution(prev => ({
          ...prev,
          systemDesign: result.updatedDesign
        }));
      }

      // If no result was captured, return an error message
      if (!result || !result.answer) {
        console.log('[App Q&A] No result captured, buffer was:', buffer);
        return { answer: 'Failed to get answer. Please try again.' };
      }

      return result;
    } catch (err) {
      console.error('Follow-up question error:', err);
      return { answer: 'Error: ' + err.message };
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
      }, interviewMode, designDetailLevel);
      if (result) {
        // Auto-test, fix, and run the code (skip for system design mode)
        if (interviewMode !== 'system-design' && result.code) {
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
        } else {
          setSolution(result);
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
        }, interviewMode, designDetailLevel);
        if (result) {
          // Auto-test, fix, and run the code (skip for system design mode)
          if (interviewMode !== 'system-design' && result.code) {
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
          } else {
            setSolution(result);
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
            <span className="text-gray-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show login if auth required
  if (authRequired && !isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Check if running on macOS in Electron (needs extra padding for traffic lights)
  const isMacElectron = isElectron && navigator.platform.toLowerCase().includes('mac');

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#ffffff', color: '#111827' }}>
      {/* Header - draggable on macOS Electron */}
      <header
        className="relative z-20 flex items-center justify-between px-4 py-3"
        style={{
          paddingLeft: isMacElectron ? '80px' : '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          WebkitAppRegion: isMacElectron ? 'drag' : 'no-drag',
        }}
      >
        {/* Left: Logo & Status - no-drag so elements remain clickable */}
        <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
          <div className="relative group flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            {isLoading && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            )}
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: '#111827' }}>
              Capra
            </h1>
          </div>

          {/* Status Pill */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: isLoading ? 'rgba(16, 185, 129, 0.1)' : '#f3f4f6',
              border: isLoading ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(0,0,0,0.06)',
              color: isLoading ? '#10b981' : '#6b7280'
            }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'animate-pulse' : ''}`}
              style={{
                background: isLoading ? '#10b981' : '#9ca3af',
                boxShadow: isLoading ? '0 0 8px #10b981' : 'none'
              }}
            />
            {isLoading ? 'Processing' : 'Ready'}
          </div>

          {/* Prep Hub Button - Highlighted */}
          <button
            onClick={() => setShowPrepTab(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
            title="Interview Prep Hub"
          >
            Prep Hub
          </button>
        </div>

        {/* Spacer - draggable area in the middle */}
        <div className="flex-1 h-full" style={{ WebkitAppRegion: isMacElectron ? 'drag' : 'no-drag', minHeight: '32px' }} />

        {/* Right: Controls - no-drag so they're clickable */}
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <ProviderToggle provider={provider} model={model} onChange={setProvider} onModelChange={setModel} />

          {/* Clear Button */}
          <button
            onClick={handleClearAll}
            className="p-2 rounded-lg transition-all"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#111827'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#6b7280'; }}
            title="Clear all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Platforms Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
              className="p-2 rounded-lg transition-all"
              style={{ color: '#6b7280' }}
              onMouseEnter={(e) => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#111827'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#6b7280'; }}
              title="Coding Platforms"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showPlatformDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPlatformDropdown(false)} />
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl z-50 py-1 animate-slideDown"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                  }}
                >
                  <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>Platforms</span>
                  </div>
                  {Object.entries(PLATFORMS).map(([key, platform]) => {
                    const isConnected = platformStatus[key]?.authenticated;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setShowPlatformDropdown(false);
                          setShowPlatformAuth(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors"
                        style={{ color: '#4b5563' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563'; }}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ background: platform.color }}
                        >
                          {platform.icon}
                        </div>
                        <span className="flex-1 text-xs text-left">{platform.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full`} style={{ background: isConnected ? '#10b981' : '#d1d5db', boxShadow: isConnected ? '0 0 6px #10b981' : 'none' }} />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Interview Assistant Toggle */}
          <button
            onClick={() => setShowInterviewAssistant(!showInterviewAssistant)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
            style={{
              background: showInterviewAssistant ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: showInterviewAssistant ? '#10b981' : 'white',
              border: showInterviewAssistant ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
              boxShadow: showInterviewAssistant ? 'none' : '0 0 20px rgba(16, 185, 129, 0.3)'
            }}
            title="Toggle Interview Assistant"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Interview
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg transition-all"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#111827'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#6b7280'; }}
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* User menu */}
          {authRequired && user && (
            <div className="flex items-center gap-2 ml-2 pl-3" style={{ borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: '#f3f4f6', color: '#6b7280' }}
                  onMouseEnter={(e) => { e.target.style.background = '#e5e7eb'; e.target.style.color = '#111827'; }}
                  onMouseLeave={(e) => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#6b7280'; }}
                  title="User management"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-all"
                style={{ background: '#f3f4f6', color: '#6b7280' }}
                onMouseEnter={(e) => { e.target.style.background = '#e5e7eb'; e.target.style.color = '#111827'; }}
                onMouseLeave={(e) => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#6b7280'; }}
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="relative z-10 mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Smart Loading Progress - Top Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-[#10b981]"
              style={{
                width: '100%',
                animation: 'progressSlide 1.5s ease-in-out infinite',
              }}
            />
          </div>
          {/* Status pill */}
          <div className="absolute top-2 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 shadow-lg border border-gray-200 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs font-medium text-gray-700">
              {loadingType === 'fetch' && 'Fetching...'}
              {loadingType === 'screenshot' && 'Extracting...'}
              {loadingType === 'solve' && 'Solving...'}
              {loadingType === 'testing' && 'Testing...'}
              {loadingType === 'fixing' && 'Fixing...'}
              {loadingType === 'running' && 'Running...'}
              {!loadingType && 'Processing...'}
            </span>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden p-1 relative z-10">
        <div className="h-full rounded-lg overflow-hidden border border-gray-200 bg-white">
          <Allotment defaultSizes={showInterviewAssistant ? [1, 1, 1] : [1, 1]}>
            {/* Left Pane - Problem + Explanation (stacked vertically) */}
            <Allotment.Pane minSize={300}>
              <div className="h-full flex flex-col bg-white overflow-hidden">
                {/* Top: Problem Input - auto height based on content */}
                <div className="flex-shrink-0 border-b border-gray-200">
                  {/* Pane Header */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      <span className="text-xs font-medium text-gray-600">Problem</span>
                    </div>
                    <InterviewModeSelector
                      interviewMode={interviewMode}
                      onModeChange={setInterviewMode}
                      designDetailLevel={designDetailLevel}
                      onDetailLevelChange={setDesignDetailLevel}
                    />
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
                      interviewMode={interviewMode}
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
                  interviewMode={interviewMode}
                  systemDesign={solution?.systemDesign || streamingContent.systemDesign}
                  eraserDiagram={eraserDiagram}
                  onGenerateEraserDiagram={async () => {
                    const sd = solution?.systemDesign || streamingContent.systemDesign;
                    if (!sd?.included) return;
                    try {
                      const description = `${sd.overview || ''}\n\nComponents: ${sd.architecture?.components?.join(', ') || ''}\n\n${sd.architecture?.description || ''}`;
                      const response = await fetch(API_URL + '/api/diagram/eraser', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                        body: JSON.stringify({ description }),
                      });
                      if (response.ok) {
                        const data = await response.json();
                        setEraserDiagram(data);
                      }
                    } catch (err) {
                      console.error('Failed to generate Eraser diagram:', err);
                    }
                  }}
                />
              </div>
            </Allotment.Pane>

            {/* Right Pane - Interview Assistant (conditional) */}
            {showInterviewAssistant && (
              <Allotment.Pane minSize={400}>
                <InterviewAssistantPanel
                  onClose={() => setShowInterviewAssistant(false)}
                  provider={provider}
                  model={model}
                />
              </Allotment.Pane>
            )}
          </Allotment>
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="relative z-10 px-3 py-1.5 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-[#10b981] animate-pulse' : 'bg-[#10b981]'}`} />
            {isLoading ? 'Processing' : 'Ready'}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>⌘ Enter</span>
          <span>·</span>
          <span>Esc clear</span>
        </div>
      </footer>

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

      {/* Interview Prep Hub (Electron) */}
      {showPrepTab && (
        <PrepTab isOpen={showPrepTab} onClose={() => setShowPrepTab(false)} />
      )}
    </div>
  );
}
