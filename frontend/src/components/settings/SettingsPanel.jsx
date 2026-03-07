import { useState, useEffect } from 'react';
import ApiKeyInput from './ApiKeyInput';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

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

export default function SettingsPanel({ onClose, provider, model, onProviderChange, onModelChange, onOpenPlatforms, autoSwitch, onAutoSwitchChange, editorSettings, onEditorSettingsChange }) {
  const [showShortcuts, setShowShortcuts] = useState(false);
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
      <div className="modal-backdrop">
        <div className="modal-container p-8 w-72">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent', borderWidth: '3px' }} />
            <span className="text-sm font-medium text-gray-500">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-container w-96 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="modal-title">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-body overflow-y-auto px-5 py-4 space-y-5">
          {/* LLM Selection Section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#666666' }}>AI Provider</p>

            {/* Provider Toggle */}
            <div
              className="flex items-center gap-1 p-1.5 rounded-xl mb-4"
              style={{ background: 'linear-gradient(180deg, #f5f5f5 0%, #efefef 100%)', border: '1px solid #e5e5e5', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <button
                onClick={() => handleProviderSwitch('claude')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: provider === 'claude' ? 'var(--gradient-primary)' : 'transparent',
                  color: provider === 'claude' ? '#ffffff' : '#666666',
                  boxShadow: provider === 'claude' ? 'var(--shadow-button)' : 'none'
                }}
              >
                Claude
              </button>
              <button
                onClick={() => handleProviderSwitch('openai')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: provider === 'openai' ? 'var(--gradient-primary)' : 'transparent',
                  color: provider === 'openai' ? '#ffffff' : '#666666',
                  boxShadow: provider === 'openai' ? 'var(--shadow-button)' : 'none'
                }}
              >
                GPT
              </button>
            </div>

            {/* Model Selector */}
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#666666' }}>Model</p>
            <div className="space-y-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onModelChange && onModelChange(m.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: m.id === model ? 'rgba(16, 185, 129, 0.08)' : 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
                    border: m.id === model ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #e8e8e8',
                    boxShadow: m.id === model ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (m.id !== model) {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #fcfcfc 0%, #f7f7f7 100%)';
                      e.currentTarget.style.borderColor = '#d5d5d5';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (m.id !== model) {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)';
                      e.currentTarget.style.borderColor = '#e8e8e8';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: m.id === model ? '#059669' : '#333333' }}>{m.name}</div>
                    <div className="text-xs" style={{ color: '#999999' }}>{m.description}</div>
                  </div>
                  {m.id === model && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                      <svg className="w-3.5 h-3.5" style={{ color: '#ffffff' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Auto-Switch Toggle */}
            <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)', border: '1px solid #e8e8e8', boxShadow: 'var(--shadow-sm)' }}>
              <div>
                <div className="text-sm font-semibold" style={{ color: '#333333' }}>Auto-switch on failure</div>
                <div className="text-xs" style={{ color: '#999999' }}>Fallback to other provider if API fails</div>
              </div>
              <button
                onClick={() => onAutoSwitchChange && onAutoSwitchChange(!autoSwitch)}
                className="relative inline-flex h-7 w-12 items-center rounded-full transition-all"
                style={{
                  background: autoSwitch ? 'var(--gradient-primary)' : '#d1d5db',
                  boxShadow: autoSwitch ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <span
                  className="inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md"
                  style={{
                    transform: autoSwitch ? 'translateX(24px)' : 'translateX(4px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}
                />
              </button>
            </div>
          </div>

          {/* API Keys Section - Desktop only (webapp users don't manage keys) */}
          {window.electronAPI?.isElectron && (
            <>
              <div className="my-1" style={{ borderTop: '1px solid #f0f0f0' }} />
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
            </>
          )}

          {/* Platforms Section - Desktop only */}
          {window.electronAPI?.isElectron && onOpenPlatforms && (
            <>
              <div className="my-1" style={{ borderTop: '1px solid #f0f0f0' }} />
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

          {/* Editor Settings Section */}
          {editorSettings && onEditorSettingsChange && (
            <>
              <div className="my-1" style={{ borderTop: '1px solid #f0f0f0' }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#666666' }}>Editor Settings</p>

                {/* Theme */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#333333' }}>Theme</span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#2d2d2d' }}>
                    <button
                      onClick={() => onEditorSettingsChange({ theme: 'dark' })}
                      className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: editorSettings.theme === 'dark' ? '#8b5cf6' : 'transparent',
                        color: editorSettings.theme === 'dark' ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => onEditorSettingsChange({ theme: 'light' })}
                      className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: editorSettings.theme === 'light' ? '#8b5cf6' : 'transparent',
                        color: editorSettings.theme === 'light' ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Light
                    </button>
                  </div>
                </div>

                {/* Key Bindings */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#333333' }}>Key Bindings</span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#2d2d2d' }}>
                    <button
                      onClick={() => onEditorSettingsChange({ keyBindings: 'standard' })}
                      className="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: editorSettings.keyBindings === 'standard' ? '#8b5cf6' : 'transparent',
                        color: editorSettings.keyBindings === 'standard' ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => onEditorSettingsChange({ keyBindings: 'vim' })}
                      className="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: editorSettings.keyBindings === 'vim' ? '#8b5cf6' : 'transparent',
                        color: editorSettings.keyBindings === 'vim' ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Vim
                    </button>
                    <button
                      onClick={() => onEditorSettingsChange({ keyBindings: 'emacs' })}
                      className="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: editorSettings.keyBindings === 'emacs' ? '#8b5cf6' : 'transparent',
                        color: editorSettings.keyBindings === 'emacs' ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Emacs
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#333333' }}>Font Size</span>
                  <select
                    value={editorSettings.fontSize}
                    onChange={(e) => onEditorSettingsChange({ fontSize: parseInt(e.target.value) })}
                    className="px-3 py-1 text-xs rounded-lg cursor-pointer"
                    style={{ background: '#2d2d2d', color: '#ffffff', border: 'none' }}
                  >
                    {[10, 11, 12, 13, 14, 16, 18, 20].map(size => (
                      <option key={size} value={size}>{size} px</option>
                    ))}
                  </select>
                </div>

                {/* Tab Spacing */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#333333' }}>Tab Spacing</span>
                  <select
                    value={editorSettings.tabSpacing}
                    onChange={(e) => onEditorSettingsChange({ tabSpacing: parseInt(e.target.value) })}
                    className="px-3 py-1 text-xs rounded-lg cursor-pointer"
                    style={{ background: '#2d2d2d', color: '#ffffff', border: 'none' }}
                  >
                    {[2, 4, 8].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* IntelliSense */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm" style={{ color: '#333333' }}>IntelliSense</span>
                    <svg className="w-3.5 h-3.5" style={{ color: '#999999' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#2d2d2d' }}>
                    <button
                      onClick={() => onEditorSettingsChange({ intelliSense: true })}
                      className="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: editorSettings.intelliSense ? '#8b5cf6' : 'transparent',
                        color: editorSettings.intelliSense ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Enabled
                    </button>
                    <button
                      onClick={() => onEditorSettingsChange({ intelliSense: false })}
                      className="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: !editorSettings.intelliSense ? '#8b5cf6' : 'transparent',
                        color: !editorSettings.intelliSense ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Disabled
                    </button>
                  </div>
                </div>

                {/* Auto-Close Brackets */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#333333' }}>Auto-Close Brackets</span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#2d2d2d' }}>
                    <button
                      onClick={() => onEditorSettingsChange({ autoCloseBrackets: true })}
                      className="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: editorSettings.autoCloseBrackets ? '#8b5cf6' : 'transparent',
                        color: editorSettings.autoCloseBrackets ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Enabled
                    </button>
                    <button
                      onClick={() => onEditorSettingsChange({ autoCloseBrackets: false })}
                      className="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: !editorSettings.autoCloseBrackets ? '#8b5cf6' : 'transparent',
                        color: !editorSettings.autoCloseBrackets ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      Disabled
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(180deg, #4d4d4d 0%, #3d3d3d 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z" />
                  </svg>
                  View Shortcuts
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
