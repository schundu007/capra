import { useState, useEffect } from 'react';
import ApiKeyInput from './ApiKeyInput';

export default function SettingsPanel({ onClose }) {
  const [apiKeys, setApiKeys] = useState({
    anthropic: null,
    openai: null,
    hasAnthropic: false,
    hasOpenai: false,
  });
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      if (window.electronAPI) {
        const [keys, version] = await Promise.all([
          window.electronAPI.getApiKeys(),
          window.electronAPI.getAppVersion(),
        ]);
        setApiKeys(keys);
        setAppVersion(version);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSaveKey = async (provider, key) => {
    if (!window.electronAPI) return;

    const updated = await window.electronAPI.setApiKeys({ [provider]: key });
    setApiKeys(updated);

    // Notify main process to update backend server
    window.electronAPI.setApiKeys({ [provider]: key });
  };

  const handleDeleteKey = async (provider) => {
    if (!window.electronAPI) return;

    // Set to null to delete
    const updated = await window.electronAPI.setApiKeys({ [provider]: null });
    setApiKeys(updated);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-lg w-full mx-4 border border-slate-700/50">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full mx-4 border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              {appVersion && (
                <p className="text-sm text-slate-400">Capra v{appVersion}</p>
              )}
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
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-3">
                API Keys
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Configure your AI provider API keys. Keys are stored securely in your system's keychain.
              </p>
            </div>

            <ApiKeyInput
              provider="anthropic"
              currentKey={apiKeys.anthropic}
              hasKey={apiKeys.hasAnthropic}
              onSave={(key) => handleSaveKey('anthropic', key)}
              onDelete={() => handleDeleteKey('anthropic')}
            />

            <ApiKeyInput
              provider="openai"
              currentKey={apiKeys.openai}
              hasKey={apiKeys.hasOpenai}
              onSave={(key) => handleSaveKey('openai', key)}
              onDelete={() => handleDeleteKey('openai')}
            />
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Secure Storage</p>
                <p>Your API keys are encrypted using your operating system's secure storage (Keychain on macOS, Credential Manager on Windows).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
