import { useRef, useEffect, useState } from 'react';

const LOCKEDIN_URL = 'https://app.lockedinai.com/app/dashboard';
const isElectron = window.electronAPI?.isElectron || false;

export default function LockedInPanel({ onClose }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isElectron) {
      // Electron: use webview
      const webview = document.createElement('webview');
      webview.src = LOCKEDIN_URL;
      webview.style.width = '100%';
      webview.style.height = '100%';
      webview.style.border = 'none';
      webview.setAttribute('allowpopups', 'true');
      webview.setAttribute('partition', 'persist:lockedin');

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(webview);

      webview.addEventListener('did-fail-load', (e) => {
        setLoading(false);
        if (e.errorCode !== -3) {
          setError(`Failed to load: ${e.errorDescription || 'Unknown error'}`);
        }
      });

      webview.addEventListener('did-finish-load', () => {
        setLoading(false);
        setError(null);
      });

      webview.addEventListener('did-start-loading', () => {
        setLoading(true);
      });
    }

    return () => {
      if (containerRef.current && isElectron) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // For web browser: show link to open in new tab (iframe likely blocked by X-Frame-Options)
  if (!isElectron) {
    return (
      <div className="h-full flex flex-col border-l border-slate-700/50 bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-sm font-semibold text-white">LockedIn AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Web browser fallback */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">LockedIn AI</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">
            LockedIn AI works best in the desktop app. Click below to open in a new tab.
          </p>
          <a
            href={LOCKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open LockedIn AI
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-l border-slate-700/50 bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-sm font-semibold text-white">LockedIn AI</h2>
          {loading && (
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          title="Close LockedIn AI"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Webview Container (Electron only) */}
      <div ref={containerRef} className="flex-1 bg-white" />
    </div>
  );
}
