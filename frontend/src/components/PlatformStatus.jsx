import { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();

const PLATFORM_NAMES = {
  glider: 'Glider',
  lark: 'Lark',
  hackerrank: 'HackerRank',
  leetcode: 'LeetCode',
  codesignal: 'CodeSignal',
  coderpad: 'CoderPad',
  codility: 'Codility',
};

export default function PlatformStatus() {
  const [status, setStatus] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    fetchStatus();
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
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const connectedCount = Object.values(status).filter(s => s.authenticated).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-zinc-500 hover:text-zinc-300"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
        <span className="text-xs">
          {loading ? '...' : `${connectedCount} sources`}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-[#1e1e20] border border-white/[0.08] rounded-lg p-3 z-50 animate-fade-in shadow-2xl shadow-black/50">
          <div className="text-xs font-medium text-zinc-400 mb-2">Data Sources</div>

          <div className="space-y-1.5 mb-3">
            {Object.entries(PLATFORM_NAMES).map(([key, name]) => {
              const platformStatus = status[key];
              const isConnected = platformStatus?.authenticated;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md bg-white/[0.02]"
                >
                  <span className="text-xs text-zinc-400">{name}</span>
                  <span className={`text-xs ${isConnected ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {isConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <p className="text-xs text-zinc-600">
              Install extension for additional sources
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
