import { useState } from 'react';

const providerConfig = {
  anthropic: {
    name: 'Anthropic (Claude)',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Powers Claude AI models for code generation',
  },
  openai: {
    name: 'OpenAI (GPT)',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    description: 'Powers GPT models for code generation',
  },
};

export default function ApiKeyInput({
  provider,
  currentKey,
  hasKey,
  onSave,
  onDelete,
  isValidating = false,
}) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(!hasKey);
  const [validationStatus, setValidationStatus] = useState(null);
  const [validating, setValidating] = useState(false);

  const config = providerConfig[provider] || {
    name: provider,
    placeholder: 'Enter API key',
  };

  const handleValidateAndSave = async () => {
    if (!key.trim()) return;

    setValidating(true);
    setValidationStatus(null);

    try {
      // Validate via Electron IPC
      if (window.electronAPI) {
        const result = await window.electronAPI.validateApiKey(provider, key);
        if (result.valid) {
          setValidationStatus({ type: 'success', message: 'API key validated successfully!' });
          await onSave(key);
          setKey('');
          setIsEditing(false);
        } else {
          setValidationStatus({ type: 'error', message: result.error || 'Invalid API key' });
        }
      } else {
        // Fallback: just save without validation
        await onSave(key);
        setKey('');
        setIsEditing(false);
      }
    } catch (err) {
      setValidationStatus({ type: 'error', message: err.message });
    } finally {
      setValidating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Remove ${config.name} API key?`)) {
      await onDelete();
      setIsEditing(true);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{config.name}</h3>
          <p className="text-slate-400 text-sm mt-0.5">{config.description}</p>
        </div>
        {hasKey && !isEditing && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            Configured
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setValidationStatus(null);
              }}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKey ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {validationStatus && (
            <div className={`px-3 py-2 rounded-lg text-sm ${
              validationStatus.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {validationStatus.message}
            </div>
          )}

          <div className="flex items-center justify-between">
            <a
              href={config.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
            >
              Get an API key
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <div className="flex items-center gap-2">
              {hasKey && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleValidateAndSave}
                disabled={!key.trim() || validating}
                className="px-4 py-2 text-sm font-medium text-slate-900 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {validating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating...
                  </>
                ) : (
                  'Save Key'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <code className="text-slate-400 font-mono text-sm bg-slate-900/50 px-3 py-1.5 rounded">
            {currentKey}
          </code>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-600 rounded-lg hover:border-slate-500 transition-all"
            >
              Change
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
