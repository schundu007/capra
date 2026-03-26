import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../Icons';
import { getApiUrl } from '../../hooks/useElectron';

const API_URL = getApiUrl();

/**
 * DownloadPage - Desktop app download page after purchase
 * Shows platform-specific download links for users who purchased desktop_lifetime
 */
export default function DownloadPage() {
  const { user, accessToken } = useAuth();
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectedPlatform, setDetectedPlatform] = useState(null);

  useEffect(() => {
    // Detect user's platform
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) {
      // Check for Apple Silicon
      const isArmMac = ua.includes('arm') ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setDetectedPlatform(isArmMac ? 'mac-arm64' : 'mac-x64');
    } else if (ua.includes('win')) {
      setDetectedPlatform('windows-x64');
    } else {
      setDetectedPlatform('unknown');
    }

    checkDownloadAccess();
  }, []);

  const checkDownloadAccess = async () => {
    try {
      // Get token from auth context or localStorage
      const token = accessToken || localStorage.getItem('ascend_auth') && JSON.parse(localStorage.getItem('ascend_auth'))?.accessToken;
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/billing/download-access`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to check download access');
      }

      const data = await response.json();
      setDownloadInfo(data);
    } catch (err) {
      console.error('Failed to check download access:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <div className="text-center">
          <Icon name="loader" size={48} className="animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-gray-400">Checking download access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <div className="text-center max-w-md p-8 rounded-2xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <Icon name="alertTriangle" size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/app'}
            className="px-6 py-2 rounded-lg font-medium"
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!downloadInfo?.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <div className="text-center max-w-md p-8 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Icon name="lock" size={48} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Purchase Required</h2>
          <p className="text-gray-400 mb-6">
            You need to purchase the Desktop Lifetime plan to download the app.
          </p>
          <button
            onClick={() => window.location.href = '/?pricing=true'}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}
          >
            View Pricing
          </button>
        </div>
      </div>
    );
  }

  const { downloads, version, purchaseDate } = downloadInfo;

  // Get recommended download based on detected platform
  const getRecommendedDownload = () => {
    if (detectedPlatform === 'mac-arm64') return { ...downloads.mac.arm64, key: 'mac-arm64' };
    if (detectedPlatform === 'mac-x64') return { ...downloads.mac.x64, key: 'mac-x64' };
    if (detectedPlatform === 'windows-x64') return { ...downloads.windows.x64, key: 'windows-x64' };
    return null;
  };

  const recommended = getRecommendedDownload();

  return (
    <div className="min-h-screen" style={{ background: '#030712', fontFamily: "'Inter', sans-serif" }}>
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', top: '-200px', right: '-100px' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Icon name="check" size={16} className="text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">Purchase Complete</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Download Ascend Desktop</h1>
          <p className="text-gray-400 text-lg">
            Thank you for your purchase! Download the app for your platform below.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Version {version} • Purchased {new Date(purchaseDate).toLocaleDateString()}
          </p>
        </div>

        {/* Recommended Download */}
        {recommended && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">Recommended for your system</h2>
            <div
              className="p-8 rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))', border: '2px solid #8b5cf6' }}
              onClick={() => handleDownload(recommended.url)}
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                <Icon name={detectedPlatform?.includes('mac') ? 'apple' : 'terminal'} size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{recommended.label}</h3>
              <p className="text-gray-400 text-sm mb-4">{recommended.size}</p>
              <button
                className="px-8 py-3 rounded-xl font-semibold text-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}
              >
                <span className="flex items-center gap-2">
                  <Icon name="download" size={20} />
                  Download Now
                </span>
              </button>
            </div>
          </div>
        )}

        {/* All Downloads */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4">All Platforms</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Mac Apple Silicon */}
            <div
              className="p-6 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              onClick={() => handleDownload(downloads.mac.arm64.url)}
            >
              <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Icon name="apple" size={24} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{downloads.mac.arm64.label}</h3>
              <p className="text-gray-500 text-sm mb-3">M1, M2, M3 chips • {downloads.mac.arm64.size}</p>
              <button className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                <Icon name="download" size={16} />
                Download .dmg
              </button>
            </div>

            {/* Mac Intel */}
            <div
              className="p-6 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              onClick={() => handleDownload(downloads.mac.x64.url)}
            >
              <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Icon name="apple" size={24} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{downloads.mac.x64.label}</h3>
              <p className="text-gray-500 text-sm mb-3">Intel processors • {downloads.mac.x64.size}</p>
              <button className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                <Icon name="download" size={16} />
                Download .dmg
              </button>
            </div>

            {/* Windows */}
            <div
              className="p-6 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              onClick={() => handleDownload(downloads.windows.x64.url)}
            >
              <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Icon name="terminal" size={24} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{downloads.windows.x64.label}</h3>
              <p className="text-gray-500 text-sm mb-3">Windows 10/11 • {downloads.windows.x64.size}</p>
              <button className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                <Icon name="download" size={16} />
                Download .exe
              </button>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon name="book" size={20} className="text-purple-400" />
            Installation Instructions
          </h2>

          <div className="space-y-4 text-gray-400">
            <div>
              <h3 className="font-medium text-white mb-2">macOS</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open the downloaded .dmg file</li>
                <li>Drag Ascend to your Applications folder</li>
                <li>Right-click and select "Open" the first time (to bypass Gatekeeper)</li>
                <li>Enter your API keys in Settings when prompted</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Windows</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Run the downloaded .exe installer</li>
                <li>Follow the installation wizard</li>
                <li>Launch Ascend from the Start Menu or Desktop</li>
                <li>Enter your API keys in Settings when prompted</li>
              </ol>
            </div>
          </div>
        </div>

        {/* API Keys Notice */}
        <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div className="flex items-start gap-3">
            <Icon name="info" size={20} className="text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-white mb-1">You'll need your own API keys</h3>
              <p className="text-gray-400 text-sm">
                The desktop app uses your own API keys for unlimited usage. You can get keys from{' '}
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Anthropic</a>
                {' '}and{' '}
                <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenAI</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/app'}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
