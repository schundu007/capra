import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const PLATFORM_NAMES = {
  glider: 'Glider',
  lark: 'Lark',
  hackerrank: 'HackerRank',
  leetcode: 'LeetCode',
  codesignal: 'CodeSignal',
  codility: 'Codility',
};

export default function PlatformStatus() {
  const [status, setStatus] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(API_URL + '/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      // Silently fail - backend might not be running
    } finally {
      setLoading(false);
    }
  };

  const connectedCount = Object.values(status).filter(s => s.authenticated).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors"
      >
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${connectedCount > 0 ? 'bg-white' : 'bg-neutral-500'}`} />
          <span className="text-xs text-neutral-300">
            {loading ? '...' : `${connectedCount} connected`}
          </span>
        </div>
        <svg
          className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-800 border border-neutral-700 rounded-md p-3 z-50 animate-fade-in">
          <div className="text-xs font-medium text-neutral-300 mb-2">Platform Connections</div>

          <div className="space-y-2 mb-3">
            {Object.entries(PLATFORM_NAMES).map(([key, name]) => {
              const platformStatus = status[key];
              const isConnected = platformStatus?.authenticated;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-2 py-1.5 bg-neutral-900 rounded"
                >
                  <span className="text-xs text-neutral-300">{name}</span>
                  <span className={`text-xs ${isConnected ? 'text-white' : 'text-neutral-500'}`}>
                    {isConnected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-neutral-700">
            <p className="text-xs text-neutral-400 mb-2">
              Install the browser extension to connect platforms that require login.
            </p>
            <a
              href="chrome://extensions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white hover:text-neutral-300 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Load unpacked extension
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
