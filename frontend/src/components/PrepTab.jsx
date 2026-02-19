import { useState, useEffect } from 'react';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();
const isElectron = window.electronAPI?.isElectron || false;

// Platform categories
const CODING_PLATFORMS = {
  hackerrank: { name: 'HackerRank', icon: '✨', color: '#1ba94c', url: 'hackerrank.com' },
  leetcode: { name: 'LeetCode', icon: '✨', color: '#f97316', url: 'leetcode.com' },
  coderpad: { name: 'CoderPad', icon: '✨', color: '#6366f1', url: 'coderpad.io' },
  codesignal: { name: 'CodeSignal', icon: '✨', color: '#3b82f6', url: 'codesignal.com' },
};

const PREP_PLATFORMS = {
  techprep: { name: 'TechPrep', icon: '✨', color: '#8b5cf6', url: 'techprep.app' },
  algomaster: { name: 'AlgoMaster', icon: '✨', color: '#14b8a6', url: 'algomaster.io' },
  neetcode: { name: 'NeetCode', icon: '✨', color: '#f43f5e', url: 'neetcode.io' },
  designgurus: { name: 'DesignGurus', icon: '✨', color: '#0ea5e9', url: 'designgurus.io' },
  educative: { name: 'Educative', icon: '✨', color: '#22c55e', url: 'educative.io' },
  interviewbit: { name: 'InterviewBit', icon: '✨', color: '#a855f7', url: 'interviewbit.com' },
  interviewingio: { name: 'Interviewing.io', icon: '✨', color: '#4a90d9', url: 'interviewing.io', googleAuth: true },
  exponent: { name: 'Exponent', icon: '✨', color: '#1a1a2e', url: 'tryexponent.com', googleAuth: true },
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
      <div className="w-full max-w-2xl mx-4 rounded-xl overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Interview Prep Hub</span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white">
              {connectedCount} connected
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('coding')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'coding'
                ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Coding Platforms
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'prep'
                ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Interview Prep Sites
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {!isElectron ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Platform login requires the desktop app</p>
              <p className="text-sm text-gray-400">Use the Electron app to connect to platforms</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Platform Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(platforms).map(([key, platform]) => {
                  const isAuthenticated = platformStatus[key]?.authenticated;
                  const isLoggingIn = loggingIn === key;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isAuthenticated
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                            style={{ background: platform.color }}
                          >
                            {platform.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{platform.name}</div>
                            <div className={`text-xs ${isAuthenticated ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {isAuthenticated ? 'Connected' : 'Not connected'}
                            </div>
                          </div>
                        </div>

                        {isAuthenticated ? (
                          <button
                            onClick={() => handleLogout(key)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLogin(key)}
                            disabled={isLoggingIn}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                            style={{ background: platform.color }}
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
              <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  Pre-fetch Interview Content
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={fetchUrl}
                    onChange={(e) => setFetchUrl(e.target.value)}
                    placeholder="Paste URL from any connected platform..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleFetchContent}
                    disabled={fetching || !fetchUrl.trim()}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {fetching ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>

                {fetchedContent && (
                  <div className={`p-3 rounded-lg text-sm ${fetchedContent.error ? 'bg-red-50 text-red-600' : 'bg-white border border-gray-200'}`}>
                    {fetchedContent.error ? (
                      <p>{fetchedContent.error}</p>
                    ) : (
                      <div>
                        <p className="text-emerald-600 font-medium mb-2">Content fetched successfully!</p>
                        <p className="text-gray-600 text-xs line-clamp-3">{fetchedContent.problemText?.slice(0, 200)}...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Connect to platforms to auto-fetch problems • Sessions persist across restarts
          </p>
        </div>
      </div>
    </div>
  );
}
