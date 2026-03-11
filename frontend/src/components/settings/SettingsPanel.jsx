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

const TABS = [
  { id: 'ai', label: 'AI', icon: 'sparkles' },
  { id: 'editor', label: 'Editor', icon: 'code' },
  { id: 'keys', label: 'Keys', icon: 'key' },
];

export default function SettingsPanel({ onClose, provider, model, onProviderChange, onModelChange, onOpenPlatforms, autoSwitch, onAutoSwitchChange, editorSettings, onEditorSettingsChange }) {
  const [activeTab, setActiveTab] = useState('ai');
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
  const isElectron = window.electronAPI?.isElectron;

  useEffect(() => {
    async function loadSettings() {
      if (window.electronAPI) {
        const keys = await window.electronAPI.getApiKeys();
        setApiKeys(keys);
      } else {
        const anthropic = localStorage.getItem('anthropic_api_key') || '';
        const openai = localStorage.getItem('openai_api_key') || '';
        const eraser = localStorage.getItem('eraser_api_key') || '';
        setApiKeys({
          anthropic,
          openai,
          eraser,
          hasAnthropic: !!anthropic,
          hasOpenai: !!openai,
          hasEraser: !!eraser,
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSaveKey = async (providerName, key) => {
    if (window.electronAPI) {
      const updated = await window.electronAPI.setApiKeys({ [providerName]: key });
      setApiKeys(updated);
    } else {
      localStorage.setItem(`${providerName}_api_key`, key);
      setApiKeys(prev => ({
        ...prev,
        [providerName]: key,
        [`has${providerName.charAt(0).toUpperCase() + providerName.slice(1)}`]: true,
      }));
    }
  };

  const handleDeleteKey = async (providerName) => {
    if (window.electronAPI) {
      const updated = await window.electronAPI.setApiKeys({ [providerName]: null });
      setApiKeys(updated);
    } else {
      localStorage.removeItem(`${providerName}_api_key`);
      setApiKeys(prev => ({
        ...prev,
        [providerName]: '',
        [`has${providerName.charAt(0).toUpperCase() + providerName.slice(1)}`]: false,
      }));
    }
  };

  const handleProviderSwitch = (newProvider) => {
    if (onProviderChange) {
      onProviderChange(newProvider);
      const defaultModel = newProvider === 'openai' ? OPENAI_MODELS[0].id : CLAUDE_MODELS[0].id;
      if (onModelChange) {
        onModelChange(defaultModel);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="p-8 w-72 bg-neutral-850 rounded-2xl border border-neutral-700/50">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 rounded-full animate-spin border-brand-400 border-t-transparent" style={{ borderWidth: '3px' }} />
            <span className="text-sm font-medium text-neutral-400">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  const TabIcon = ({ name }) => {
    const icons = {
      sparkles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
      code: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
      key: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
    };
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[name]}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-850 rounded-2xl border border-neutral-700/50 shadow-2xl overflow-hidden" style={{ width: '520px', maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700/50 bg-neutral-800/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-brand-400/15">
              <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-neutral-200">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-3 py-2 gap-2 bg-neutral-800 border-b border-neutral-700/50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-400 to-brand-500 text-white shadow-lg shadow-brand-400/30'
                  : 'bg-neutral-700/50 text-neutral-400 border border-neutral-600/50 hover:text-neutral-200 hover:bg-neutral-700'
              }`}
            >
              <TabIcon name={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {/* Provider Toggle */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-neutral-400">Provider</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProviderSwitch('claude')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      provider === 'claude'
                        ? 'bg-gradient-to-r from-brand-400 to-brand-500 text-white shadow-lg shadow-brand-400/30'
                        : 'bg-neutral-700/50 text-neutral-400 border border-neutral-600/50 hover:text-neutral-200'
                    }`}
                  >
                    Claude
                  </button>
                  <button
                    onClick={() => handleProviderSwitch('openai')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      provider === 'openai'
                        ? 'bg-gradient-to-r from-brand-400 to-brand-500 text-white shadow-lg shadow-brand-400/30'
                        : 'bg-neutral-700/50 text-neutral-400 border border-neutral-600/50 hover:text-neutral-200'
                    }`}
                  >
                    OpenAI
                  </button>
                </div>
              </div>

              {/* Models Grid */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-neutral-400">Model</p>
                <div className="grid grid-cols-2 gap-2">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onModelChange && onModelChange(m.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                        m.id === model
                          ? 'bg-brand-400/10 border border-brand-400/30'
                          : 'bg-neutral-700/30 border border-neutral-600/50 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-medium ${m.id === model ? 'text-brand-400' : 'text-neutral-200'}`}>{m.name}</div>
                        <div className="text-xs text-neutral-500">{m.description}</div>
                      </div>
                      {m.id === model && (
                        <svg className="w-4 h-4 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/50">
                <div>
                  <div className="text-sm font-medium text-neutral-200">Auto-switch on failure</div>
                  <div className="text-xs text-neutral-500">Fallback to other provider</div>
                </div>
                <button
                  onClick={() => onAutoSwitchChange && onAutoSwitchChange(!autoSwitch)}
                  className={`relative w-10 h-5 rounded-full transition-all ${autoSwitch ? 'bg-brand-400' : 'bg-neutral-600'}`}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: autoSwitch ? '22px' : '2px' }}
                  />
                </button>
              </div>

              {/* Platforms */}
              {isElectron && onOpenPlatforms && (
                <button
                  onClick={() => { onClose(); onOpenPlatforms(); }}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-all bg-neutral-700/30 border border-neutral-600/50 hover:bg-neutral-700/50"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-200">Coding Platforms</span>
                  </div>
                  <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Editor Tab */}
          {activeTab === 'editor' && editorSettings && onEditorSettingsChange && (
            <div className="space-y-3">
              {/* Row 1: Theme & Key Bindings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/50">
                  <p className="text-xs font-semibold mb-2 text-neutral-400">Theme</p>
                  <div className="flex gap-1">
                    {['dark', 'light'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => onEditorSettingsChange({ theme })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded transition-all capitalize ${
                          editorSettings.theme === theme
                            ? 'bg-brand-400 text-white'
                            : 'bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/50">
                  <p className="text-xs font-semibold mb-2 text-neutral-400">Key Bindings</p>
                  <div className="flex gap-1">
                    {['standard', 'vim', 'emacs'].map(kb => (
                      <button
                        key={kb}
                        onClick={() => onEditorSettingsChange({ keyBindings: kb })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded transition-all capitalize ${
                          editorSettings.keyBindings === kb
                            ? 'bg-brand-400 text-white'
                            : 'bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {kb === 'standard' ? 'Std' : kb}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Font Size & Tab Spacing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/50">
                  <span className="text-sm text-neutral-200">Font Size</span>
                  <select
                    value={editorSettings.fontSize}
                    onChange={(e) => onEditorSettingsChange({ fontSize: parseInt(e.target.value) })}
                    className="px-2 py-1 text-xs rounded cursor-pointer bg-neutral-600 text-neutral-200 border-none focus:ring-2 focus:ring-brand-400/30"
                  >
                    {[10, 11, 12, 13, 14, 16, 18, 20].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/50">
                  <span className="text-sm text-neutral-200">Tab Size</span>
                  <select
                    value={editorSettings.tabSpacing}
                    onChange={(e) => onEditorSettingsChange({ tabSpacing: parseInt(e.target.value) })}
                    className="px-2 py-1 text-xs rounded cursor-pointer bg-neutral-600 text-neutral-200 border-none focus:ring-2 focus:ring-brand-400/30"
                  >
                    {[2, 4, 8].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/50">
                  <span className="text-sm text-neutral-200">IntelliSense</span>
                  <button
                    onClick={() => onEditorSettingsChange({ intelliSense: !editorSettings.intelliSense })}
                    className={`relative w-9 h-5 rounded-full transition-all ${editorSettings.intelliSense ? 'bg-brand-400' : 'bg-neutral-600'}`}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: editorSettings.intelliSense ? '18px' : '2px' }}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/50">
                  <span className="text-sm text-neutral-200">Auto Brackets</span>
                  <button
                    onClick={() => onEditorSettingsChange({ autoCloseBrackets: !editorSettings.autoCloseBrackets })}
                    className={`relative w-9 h-5 rounded-full transition-all ${editorSettings.autoCloseBrackets ? 'bg-brand-400' : 'bg-neutral-600'}`}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: editorSettings.autoCloseBrackets ? '18px' : '2px' }}
                    />
                  </button>
                </div>
              </div>

              {/* Shortcuts Button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z" />
                </svg>
                View Keyboard Shortcuts
              </button>
            </div>
          )}

          {/* Keys Tab */}
          {activeTab === 'keys' && (
            <div className="space-y-3">
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
          )}
        </div>
      </div>

      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
