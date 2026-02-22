import { useState, useEffect } from 'react';

const PLATFORMS = {
  coderpad: { name: 'CoderPad', color: '#6366f1' },
  hackerrank: { name: 'HackerRank', color: '#1ba94c' },
  leetcode: { name: 'LeetCode', color: '#f97316' },
  codesignal: { name: 'CodeSignal', color: '#3b82f6' },
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

  // Generate initials from platform name
  const getInitials = (name) => {
    return name.split(/(?=[A-Z])/).map(w => w[0]).join('').slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md mx-4 rounded-lg overflow-hidden shadow-xl" style={{ background: '#ffffff', border: '1px solid #e5e5e5' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#1a1a1a' }}>
          <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>Platform Login</span>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors hover:bg-white/10"
            style={{ color: '#ffffff' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto" style={{ background: '#f5f5f5' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid #e5e5e5', borderTopColor: '#10b981' }} />
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(PLATFORMS).map(([key, platform]) => {
                const isAuthenticated = status[key]?.authenticated;
                const isLoggingIn = loggingIn === key;
                const initials = getInitials(platform.name);

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded"
                    style={{ background: '#ffffff', border: '1px solid #e5e5e5' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: platform.color }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#333333' }}>{platform.name}</div>
                        <div className="text-xs" style={{ color: isAuthenticated ? '#10b981' : '#999999' }}>
                          {isAuthenticated ? 'Connected' : 'Not connected'}
                        </div>
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => handleLogout(key)}
                        className="px-3 py-1 text-xs font-medium rounded transition-colors"
                        style={{ color: '#ef4444' }}
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLogin(key)}
                        disabled={isLoggingIn}
                        className="px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50"
                        style={{ background: '#10b981', color: '#ffffff' }}
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
