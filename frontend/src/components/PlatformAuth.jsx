import { useState, useEffect } from 'react';

const PLATFORMS = {
  coderpad: { name: 'CoderPad', icon: 'C', color: '#6366f1' },
  hackerrank: { name: 'HackerRank', icon: 'H', color: '#1ba94c' },
  leetcode: { name: 'LeetCode', icon: 'L', color: '#f97316' },
  codesignal: { name: 'CodeSignal', icon: 'S', color: '#3b82f6' },
  codility: { name: 'Codility', icon: 'Y', color: '#eab308' },
  glider: { name: 'Glider', icon: 'G', color: '#ec4899' },
};

export default function PlatformAuth({ onClose }) {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    if (!window.electronAPI?.getPlatformStatus) {
      setLoading(false);
      return;
    }

    try {
      const platformStatus = await window.electronAPI.getPlatformStatus();
      setStatus(platformStatus);
    } catch (err) {
      console.error('Failed to load platform status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (platform) => {
    if (!window.electronAPI?.platformLogin) return;

    setLoggingIn(platform);
    try {
      const result = await window.electronAPI.platformLogin(platform);
      if (result.success) {
        await loadStatus();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoggingIn(null);
    }
  };

  const handleLogout = async (platform) => {
    if (!window.electronAPI?.platformLogout) return;

    try {
      await window.electronAPI.platformLogout(platform);
      await loadStatus();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md mx-4 rounded-lg overflow-hidden" style={{ background: '#ffffff' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#1b2631' }}>
          <span className="text-sm font-semibold text-white">Platform Login</span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: '#ced4da' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid #e7e8eb', borderTopColor: '#1ba94c' }} />
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(PLATFORMS).map(([key, platform]) => {
                const isAuthenticated = status[key]?.authenticated;
                const isLoggingIn = loggingIn === key;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded"
                    style={{ background: '#f7f8fa', border: '1px solid #e7e8eb' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: platform.color }}
                      >
                        {platform.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#39424e' }}>{platform.name}</div>
                        <div className="text-xs" style={{ color: isAuthenticated ? '#1ba94c' : '#8c9bab' }}>
                          {isAuthenticated ? 'Connected' : 'Not connected'}
                        </div>
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => handleLogout(key)}
                        className="px-3 py-1 text-xs font-medium rounded transition-colors"
                        style={{ color: '#dc2626' }}
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLogin(key)}
                        disabled={isLoggingIn}
                        className="px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50"
                        style={{ background: '#1ba94c', color: 'white' }}
                      >
                        {isLoggingIn ? 'Logging in...' : 'Login'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
