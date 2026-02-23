import { useState, useEffect } from 'react';
import ApiKeyInput from './ApiKeyInput';

const CLAUDE_MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Fast & capable' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most intelligent' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Previous gen' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fastest' },
];

const OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Fast & capable' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fastest' },
  { id: 'o1', name: 'o1', description: 'Reasoning model' },
  { id: 'o1-mini', name: 'o1-mini', description: 'Fast reasoning' },
  { id: 'o3-mini', name: 'o3-mini', description: 'Latest reasoning' },
];

export default function SettingsPanel({ onClose, provider, model, onProviderChange, onModelChange, onOpenPlatforms, autoSwitch, onAutoSwitchChange }) {
  const [apiKeys, setApiKeys] = useState({
    anthropic: null,
    openai: null,
    eraser: null,
    hasAnthropic: false,
    hasOpenai: false,
    hasEraser: false,
  });
  const [loading, setLoading] = useState(true);

  const models = provider === 'openai' ? OPENAI_MODELS : CLAUDE_MODELS;
  const currentModel = models.find(m => m.id === model) || models[0];

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

  const handleSaveKey = async (providerName, key) => {
    if (!window.electronAPI) return;
    const updated = await window.electronAPI.setApiKeys({ [providerName]: key });
    setApiKeys(updated);
    window.electronAPI.setApiKeys({ [providerName]: key });
  };

  const handleDeleteKey = async (providerName) => {
    if (!window.electronAPI) return;
    const updated = await window.electronAPI.setApiKeys({ [providerName]: null });
    setApiKeys(updated);
  };

  const handleProviderSwitch = (newProvider) => {
    if (onProviderChange) {
      onProviderChange(newProvider);
      // Set default model for the new provider
      const defaultModel = newProvider === 'openai' ? OPENAI_MODELS[0].id : CLAUDE_MODELS[0].id;
      if (onModelChange) {
        onModelChange(defaultModel);
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg p-6 w-72" style={{ background: '#ffffff' }}>
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg w-96 overflow-hidden shadow-xl" style={{ background: '#ffffff' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#1a1a1a' }}>
          <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>Settings</span>
          <button
            onClick={onClose}
            style={{ color: '#ffffff' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {/* LLM Selection Section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#666666' }}>AI Provider</p>

            {/* Provider Toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-lg mb-3"
              style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}
            >
              <button
                onClick={() => handleProviderSwitch('claude')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all"
                style={{
                  background: provider === 'claude' ? '#10b981' : 'transparent',
                  color: provider === 'claude' ? '#ffffff' : '#666666'
                }}
              >
                Claude
              </button>
              <button
                onClick={() => handleProviderSwitch('openai')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all"
                style={{
                  background: provider === 'openai' ? '#10b981' : 'transparent',
                  color: provider === 'openai' ? '#ffffff' : '#666666'
                }}
              >
                GPT
              </button>
            </div>

            {/* Model Selector */}
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#666666' }}>Model</p>
            <div className="space-y-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onModelChange && onModelChange(m.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all"
                  style={{
                    background: m.id === model ? 'rgba(16, 185, 129, 0.1)' : '#f9f9f9',
                    border: m.id === model ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #e5e5e5',
                  }}
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: m.id === model ? '#059669' : '#333333' }}>{m.name}</div>
                    <div className="text-xs" style={{ color: '#999999' }}>{m.description}</div>
                  </div>
                  {m.id === model && (
                    <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Auto-Switch Toggle */}
            <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: '#f9f9f9', border: '1px solid #e5e5e5' }}>
              <div>
                <div className="text-sm font-medium" style={{ color: '#333333' }}>Auto-switch on failure</div>
                <div className="text-xs" style={{ color: '#999999' }}>Fallback to other provider if API fails</div>
              </div>
              <button
                onClick={() => onAutoSwitchChange && onAutoSwitchChange(!autoSwitch)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ background: autoSwitch ? '#10b981' : '#d1d5db' }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ transform: autoSwitch ? 'translateX(24px)' : 'translateX(4px)' }}
                />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e5e5e5' }} />

          {/* API Keys Section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#666666' }}>API Keys</p>

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

          {/* Platforms Section - Desktop only */}
          {window.electronAPI?.isElectron && onOpenPlatforms && (
            <>
              <div style={{ borderTop: '1px solid #e5e5e5' }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#666666' }}>Integrations</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenPlatforms();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all"
                  style={{ background: '#f9f9f9', border: '1px solid #e5e5e5' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = '#d5d5d5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f9f9f9'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" style={{ color: '#666666' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#333333' }}>Coding Platforms</div>
                      <div className="text-xs" style={{ color: '#999999' }}>HackerRank, LeetCode, etc.</div>
                    </div>
                  </div>
                  <svg className="w-4 h-4" style={{ color: '#999999' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
