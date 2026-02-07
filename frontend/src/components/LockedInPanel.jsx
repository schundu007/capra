import { useRef, useEffect, useState } from 'react';

export default function LockedInPanel({ onClose }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create webview element programmatically (React doesn't handle webview well)
    const webview = document.createElement('webview');
    webview.src = 'https://app.lockedinai.com/app/dashboard';
    webview.style.width = '100%';
    webview.style.height = '100%';
    webview.style.border = 'none';
    webview.setAttribute('allowpopups', 'true');
    webview.setAttribute('partition', 'persist:lockedin'); // Separate session

    // Clear container and append webview
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(webview);

    // Handle webview events
    webview.addEventListener('did-fail-load', (e) => {
      console.log('Webview failed to load:', e.errorCode, e.errorDescription);
      setLoading(false);
      if (e.errorCode !== -3) { // -3 is aborted, ignore it
        setError(`Failed to load: ${e.errorDescription || 'Unknown error'}`);
      }
    });

    webview.addEventListener('did-finish-load', () => {
      console.log('Webview loaded successfully');
      setLoading(false);
      setError(null);
    });

    webview.addEventListener('did-start-loading', () => {
      setLoading(true);
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

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
          title="Close LockedIn AI"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Webview Container */}
      <div ref={containerRef} className="flex-1 bg-white" />
    </div>
  );
}
