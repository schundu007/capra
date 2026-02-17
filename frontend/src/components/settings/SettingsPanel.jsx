import { useState, useEffect } from 'react';
import ApiKeyInput from './ApiKeyInput';

export default function SettingsPanel({ onClose }) {
  const [apiKeys, setApiKeys] = useState({
    anthropic: null,
    openai: null,
    eraser: null,
    hasAnthropic: false,
    hasOpenai: false,
    hasEraser: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (window.electronAPI) {
        const keys = await window.electronAPI.getApiKeys();
        setApiKeys(keys);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSaveKey = async (provider, key) => {
    if (!window.electronAPI) return;
    const updated = await window.electronAPI.setApiKeys({ [provider]: key });
    setApiKeys(updated);
    window.electronAPI.setApiKeys({ [provider]: key });
  };

  const handleDeleteKey = async (provider) => {
    if (!window.electronAPI) return;
    const updated = await window.electronAPI.setApiKeys({ [provider]: null });
    setApiKeys(updated);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg p-6 w-72">
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-80 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-800">Settings</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500 mb-2">API Keys</p>

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

          <ApiKeyInput
            provider="eraser"
            currentKey={apiKeys.eraser}
            hasKey={apiKeys.hasEraser}
            onSave={(key) => handleSaveKey('eraser', key)}
            onDelete={() => handleDeleteKey('eraser')}
          />
        </div>
      </div>
    </div>
  );
}
