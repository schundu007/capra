import { useState, useEffect } from 'react';

const PLATFORMS = {
  coderpad: { name: 'CoderPad', icon: 'C', color: 'bg-purple-500' },
  hackerrank: { name: 'HackerRank', icon: 'H', color: 'bg-green-500' },
  leetcode: { name: 'LeetCode', icon: 'L', color: 'bg-orange-500' },
  codesignal: { name: 'CodeSignal', icon: 'S', color: 'bg-blue-500' },
  codility: { name: 'Codility', icon: 'Y', color: 'bg-yellow-500' },
  glider: { name: 'Glider', icon: 'G', color: 'bg-pink-500' },
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
        // Refresh status after successful login
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full mx-4 border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Platform Login</h2>
              <p className="text-sm text-slate-400">Connect to coding platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(PLATFORMS).map(([key, platform]) => {
                const isAuthenticated = status[key]?.authenticated;
                const isLoggingIn = loggingIn === key;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {platform.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{platform.name}</div>
                        <div className={`text-xs ${isAuthenticated ? 'text-green-400' : 'text-slate-500'}`}>
                          {isAuthenticated ? 'Connected' : 'Not connected'}
                        </div>
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => handleLogout(key)}
                        className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLogin(key)}
                        disabled={isLoggingIn}
                        className="px-4 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoggingIn ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Logging in...
                          </span>
                        ) : (
                          'Login'
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">How it works</p>
                <p>Click "Login" to open a secure login window. After you log in, Capra will capture your session to fetch problems from that platform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
