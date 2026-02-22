import { useState, useEffect } from 'react';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();
const isElectron = window.electronAPI?.isElectron || false;

// Platform categories - using initials instead of generic icons
const CODING_PLATFORMS = {
  hackerrank: { name: 'HackerRank', color: '#1ba94c', url: 'hackerrank.com' },
  leetcode: { name: 'LeetCode', color: '#f97316', url: 'leetcode.com' },
  coderpad: { name: 'CoderPad', color: '#6366f1', url: 'coderpad.io' },
  codesignal: { name: 'CodeSignal', color: '#3b82f6', url: 'codesignal.com' },
};

const PREP_PLATFORMS = {
  techprep: { name: 'TechPrep', color: '#8b5cf6', url: 'techprep.app' },
  algomaster: { name: 'AlgoMaster', color: '#14b8a6', url: 'algomaster.io' },
  neetcode: { name: 'NeetCode', color: '#f43f5e', url: 'neetcode.io' },
  designgurus: { name: 'DesignGurus', color: '#0ea5e9', url: 'designgurus.io' },
  educative: { name: 'Educative', color: '#22c55e', url: 'educative.io' },
  interviewbit: { name: 'InterviewBit', color: '#a855f7', url: 'interviewbit.com' },
  interviewingio: { name: 'Interviewing.io', color: '#4a90d9', url: 'interviewing.io', googleAuth: true },
  exponent: { name: 'Exponent', color: '#1a1a2e', url: 'tryexponent.com', googleAuth: true },
};

export default function PrepTab({ isOpen, onClose }) {
  const [platformStatus, setPlatformStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(null);
  const [activeTab, setActiveTab] = useState('coding'); // 'coding' | 'prep'
  const [fetchUrl, setFetchUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchedContent, setFetchedContent] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPlatformStatus();
    }
  }, [isOpen]);

  const loadPlatformStatus = async () => {
    if (!isElectron || !window.electronAPI?.getPlatformStatus) {
      setLoading(false);
      return;
    }

    try {
      const status = await window.electronAPI.getPlatformStatus();
      setPlatformStatus(status);
    } catch (err) {
      console.error('Failed to load platform status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (platform) => {
    if (!isElectron || !window.electronAPI?.platformLogin) return;

    setLoggingIn(platform);
    try {
      const result = await window.electronAPI.platformLogin(platform);
      if (result.success) {
        await loadPlatformStatus();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoggingIn(null);
    }
  };

  const handleLogout = async (platform) => {
    if (!isElectron || !window.electronAPI?.platformLogout) return;

    try {
      await window.electronAPI.platformLogout(platform);
      await loadPlatformStatus();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleFetchContent = async () => {
    if (!fetchUrl.trim()) return;

    setFetching(true);
    setFetchedContent(null);

    try {
      const response = await fetch(API_URL + '/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fetchUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setFetchedContent(data);
      } else {
        setFetchedContent({ error: 'Failed to fetch content' });
      }
    } catch (err) {
      setFetchedContent({ error: err.message });
    } finally {
      setFetching(false);
    }
  };

  const connectedCount = Object.values(platformStatus).filter(s => s?.authenticated).length;

  if (!isOpen) return null;

  const platforms = activeTab === 'coding' ? CODING_PLATFORMS : PREP_PLATFORMS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl mx-4 rounded-lg overflow-hidden shadow-2xl" style={{ background: '#ffffff' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#1a1a1a' }}>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold" style={{ color: '#ffffff' }}>Interview Prep Hub</span>
            <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ background: '#10b981', color: '#ffffff' }}>
              {connectedCount} connected
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#ffffff' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid #e5e5e5' }}>
          <button
            onClick={() => setActiveTab('coding')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === 'coding' ? '#10b981' : '#666666',
              borderBottom: activeTab === 'coding' ? '2px solid #10b981' : '2px solid transparent',
              background: activeTab === 'coding' ? '#ecfdf5' : 'transparent',
            }}
          >
            Coding Platforms
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === 'prep' ? '#10b981' : '#666666',
              borderBottom: activeTab === 'prep' ? '2px solid #10b981' : '2px solid transparent',
              background: activeTab === 'prep' ? '#ecfdf5' : 'transparent',
            }}
          >
            Interview Prep Sites
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto" style={{ background: '#f5f5f5' }}>
          {!isElectron ? (
            <div className="text-center py-8">
              <p className="mb-2" style={{ color: '#666666' }}>Platform login requires the desktop app</p>
              <p className="text-sm" style={{ color: '#999999' }}>Use the Electron app to connect to platforms</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              {/* Platform Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(platforms).map(([key, platform]) => {
                  const isAuthenticated = platformStatus[key]?.authenticated;
                  const isLoggingIn = loggingIn === key;
                  // Get initials from platform name
                  const initials = platform.name.split(/(?=[A-Z])/).map(w => w[0]).join('').slice(0, 2);

                  return (
                    <div
                      key={key}
                      className="p-3 rounded transition-all"
                      style={{
                        border: isAuthenticated ? '1px solid #10b981' : '1px solid #e5e5e5',
                        background: '#ffffff',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: platform.color }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: '#333333' }}>{platform.name}</div>
                            <div className="text-xs" style={{ color: isAuthenticated ? '#10b981' : '#999999' }}>
                              {isAuthenticated ? 'Connected' : 'Not connected'}
                            </div>
                          </div>
                        </div>

                        {isAuthenticated ? (
                          <button
                            onClick={() => handleLogout(key)}
                            className="px-2 py-1 text-xs font-medium rounded transition-colors"
                            style={{ color: '#ef4444', background: 'transparent' }}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLogin(key)}
                            disabled={isLoggingIn}
                            className="px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50"
                            style={{ background: platform.color, color: '#ffffff' }}
                          >
                            {isLoggingIn ? '...' : 'Login'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pre-fetch Content Section */}
              <div className="p-4 rounded" style={{ background: '#ffffff', border: '1px solid #e5e5e5' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#666666' }}>
                  Pre-fetch Interview Content
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={fetchUrl}
                    onChange={(e) => setFetchUrl(e.target.value)}
                    placeholder="Paste URL from any connected platform..."
                    className="flex-1 px-3 py-2 text-sm rounded focus:outline-none"
                    style={{ border: '1px solid #e5e5e5', color: '#333333' }}
                  />
                  <button
                    onClick={handleFetchContent}
                    disabled={fetching || !fetchUrl.trim()}
                    className="px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50"
                    style={{ background: '#10b981', color: '#ffffff' }}
                  >
                    {fetching ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>

                {fetchedContent && (
                  <div className="p-3 rounded text-sm" style={{ background: fetchedContent.error ? '#fef2f2' : '#ffffff', border: '1px solid #e5e5e5', color: fetchedContent.error ? '#ef4444' : '#333333' }}>
                    {fetchedContent.error ? (
                      <p>{fetchedContent.error}</p>
                    ) : (
                      <div>
                        <p className="font-medium mb-2" style={{ color: '#10b981' }}>Content fetched successfully!</p>
                        <p className="text-xs line-clamp-3" style={{ color: '#666666' }}>{fetchedContent.problemText?.slice(0, 200)}...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3" style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
          <p className="text-xs text-center" style={{ color: '#666666' }}>
            Connect to platforms to auto-fetch problems • Sessions persist across restarts
          </p>
        </div>
      </div>
    </div>
  );
}
