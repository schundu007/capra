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
  { id: 'ai', label: 'AI Provider', icon: 'sparkles' },
  { id: 'editor', label: 'Editor', icon: 'code' },
  { id: 'keys', label: 'API Keys', icon: 'key' },
];

export default function SettingsPanel({ onClose, provider, model, onProviderChange, onModelChange, onOpenPlatforms, autoSwitch, onAutoSwitchChange, editorSettings, onEditorSettingsChange }) {
  const [activeTab, setActiveTab] = useState('ai');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    anthropic: null, openai: null, eraser: null, deepgram: null,
    hasAnthropic: false, hasOpenai: false, hasEraser: false, hasDeepgram: false,
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
        const deepgram = localStorage.getItem('deepgram_api_key') || '';
        setApiKeys({ anthropic, openai, eraser, deepgram, hasAnthropic: !!anthropic, hasOpenai: !!openai, hasEraser: !!eraser, hasDeepgram: !!deepgram });
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
      setApiKeys(prev => ({ ...prev, [providerName]: key, [`has${providerName.charAt(0).toUpperCase() + providerName.slice(1)}`]: true }));
    }
  };

  const handleDeleteKey = async (providerName) => {
    if (window.electronAPI) {
      const updated = await window.electronAPI.setApiKeys({ [providerName]: null });
      setApiKeys(updated);
    } else {
      localStorage.removeItem(`${providerName}_api_key`);
      setApiKeys(prev => ({ ...prev, [providerName]: '', [`has${providerName.charAt(0).toUpperCase() + providerName.slice(1)}`]: false }));
    }
  };

  const handleProviderSwitch = (newProvider) => {
    if (onProviderChange) {
      onProviderChange(newProvider);
      const defaultModel = newProvider === 'openai' ? OPENAI_MODELS[0].id : CLAUDE_MODELS[0].id;
      if (onModelChange) onModelChange(defaultModel);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="p-10 bg-white rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 rounded-full animate-spin border-emerald-500 border-t-transparent" style={{ borderWidth: '3px' }} />
            <span className="text-sm font-medium text-gray-500">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  const TabIcon = ({ name }) => {
    const icons = {
      sparkles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
      code: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
      key: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
    };
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full mx-6 border border-gray-200/60"
        style={{ maxWidth: '640px', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Settings</h2>
              <p className="text-xs text-gray-400">Configure your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 pt-4 gap-1 border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-emerald-700 border-emerald-500 bg-emerald-50/50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TabIcon name={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Provider */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 block">Provider</label>
                <div className="flex gap-3">
                  {[{ id: 'claude', label: 'Claude', sub: 'Anthropic' }, { id: 'openai', label: 'OpenAI', sub: 'GPT' }].map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleProviderSwitch(p.id)}
                      className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                        provider === p.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>{p.label}</div>
                      <div className={`text-xs font-normal mt-0.5 ${provider === p.id ? 'text-emerald-500' : 'text-gray-400'}`}>{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Models */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 block">Model</label>
                <div className="grid grid-cols-2 gap-3">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onModelChange && onModelChange(m.id)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all border-2 ${
                        m.id === model
                          ? 'bg-emerald-50 border-emerald-500'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-semibold ${m.id === model ? 'text-emerald-700' : 'text-gray-800'}`}>{m.name}</div>
                        <div className={`text-xs mt-0.5 ${m.id === model ? 'text-emerald-500' : 'text-gray-400'}`}>{m.description}</div>
                      </div>
                      {m.id === model && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 ml-2">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Switch */}
              <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Auto-switch on failure</div>
                  <div className="text-xs text-gray-400 mt-0.5">Fallback to other provider if one fails</div>
                </div>
                <Toggle enabled={autoSwitch} onChange={() => onAutoSwitchChange && onAutoSwitchChange(!autoSwitch)} />
              </div>

              {/* Platforms */}
              {isElectron && onOpenPlatforms && (
                <button
                  onClick={() => { onClose(); onOpenPlatforms(); }}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all bg-gray-50 border border-gray-200 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">Coding Platforms</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Editor Tab */}
          {activeTab === 'editor' && editorSettings && onEditorSettingsChange && (
            <div className="space-y-6">
              {/* Theme & Key Bindings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 block">Theme</label>
                  <div className="flex gap-2">
                    {['dark', 'light'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => onEditorSettingsChange({ theme })}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all capitalize border-2 ${
                          editorSettings.theme === theme
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 block">Key Bindings</label>
                  <div className="flex gap-2">
                    {['standard', 'vim', 'emacs'].map(kb => (
                      <button
                        key={kb}
                        onClick={() => onEditorSettingsChange({ keyBindings: kb })}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all capitalize border-2 ${
                          editorSettings.keyBindings === kb
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {kb === 'standard' ? 'Std' : kb}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Size & Tab Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-sm font-semibold text-gray-800">Font Size</span>
                  <select
                    value={editorSettings.fontSize}
                    onChange={(e) => onEditorSettingsChange({ fontSize: parseInt(e.target.value) })}
                    className="px-3 py-1.5 text-sm rounded-lg cursor-pointer bg-white text-gray-700 border border-gray-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {[10, 11, 12, 13, 14, 16, 18, 20].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-sm font-semibold text-gray-800">Tab Size</span>
                  <select
                    value={editorSettings.tabSpacing}
                    onChange={(e) => onEditorSettingsChange({ tabSpacing: parseInt(e.target.value) })}
                    className="px-3 py-1.5 text-sm rounded-lg cursor-pointer bg-white text-gray-700 border border-gray-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {[2, 4, 8].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-sm font-semibold text-gray-800">IntelliSense</span>
                  <Toggle enabled={editorSettings.intelliSense} onChange={() => onEditorSettingsChange({ intelliSense: !editorSettings.intelliSense })} />
                </div>
                <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-sm font-semibold text-gray-800">Auto Brackets</span>
                  <Toggle enabled={editorSettings.autoCloseBrackets} onChange={() => onEditorSettingsChange({ autoCloseBrackets: !editorSettings.autoCloseBrackets })} />
                </div>
              </div>

              {/* Shortcuts */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z" />
                </svg>
                View Keyboard Shortcuts
              </button>
            </div>
          )}

          {/* Keys Tab */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <ApiKeyInput provider="anthropic" currentKey={apiKeys.anthropic} hasKey={apiKeys.hasAnthropic} onSave={(key) => handleSaveKey('anthropic', key)} onDelete={() => handleDeleteKey('anthropic')} />
              <ApiKeyInput provider="openai" currentKey={apiKeys.openai} hasKey={apiKeys.hasOpenai} onSave={(key) => handleSaveKey('openai', key)} onDelete={() => handleDeleteKey('openai')} />
              <ApiKeyInput provider="eraser" currentKey={apiKeys.eraser} hasKey={apiKeys.hasEraser} onSave={(key) => handleSaveKey('eraser', key)} onDelete={() => handleDeleteKey('eraser')} />
              <ApiKeyInput provider="deepgram" currentKey={apiKeys.deepgram} hasKey={apiKeys.hasDeepgram} onSave={(key) => handleSaveKey('deepgram', key)} onDelete={() => handleDeleteKey('deepgram')} />
            </div>
          )}
        </div>
      </div>

      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
