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
        className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors"
        style={{ color: '#666666' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: connectedCount > 0 ? '#10b981' : '#999999' }}
        />
        <span className="text-xs font-medium">
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
        <div
          className="absolute left-0 top-full mt-2 w-56 rounded shadow-lg z-50 animate-fade-in"
          style={{ background: '#ffffff', border: '1px solid #e5e5e5' }}
        >
          <div className="px-3 py-2" style={{ borderBottom: '1px solid #e5e5e5' }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#666666' }}>
              Data Sources
            </span>
          </div>

          <div className="p-2 space-y-1">
            {Object.entries(PLATFORM_NAMES).map(([key, name]) => {
              const platformStatus = status[key];
              const isConnected = platformStatus?.authenticated;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ background: '#f5f5f5' }}
                >
                  <span className="text-xs font-medium" style={{ color: '#333333' }}>{name}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: isConnected ? '#10b981' : '#999999' }}
                  >
                    {isConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-2" style={{ borderTop: '1px solid #e5e5e5' }}>
            <p className="text-xs" style={{ color: '#999999' }}>
              Install extension for additional sources
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
