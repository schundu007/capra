import { useState } from 'react';

const providerConfig = {
  anthropic: {
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
  },
};

export default function ApiKeyInput({
  provider,
  currentKey,
  hasKey,
  onSave,
  onDelete,
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
      if (window.electronAPI) {
        const result = await window.electronAPI.validateApiKey(provider, key);
        if (result.valid) {
          await onSave(key);
          setKey('');
          setIsEditing(false);
        } else {
          setValidationStatus({ type: 'error', message: result.error || 'Invalid API key' });
        }
      } else {
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
    <div className="py-3 border-b border-slate-200 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{config.name}</span>
        {hasKey && !isEditing && (
          <span className="w-2 h-2 rounded-full bg-green-500" title="Configured" />
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setValidationStatus(null);
              }}
              placeholder={config.placeholder}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showKey ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {validationStatus && (
            <p className="text-xs text-red-500">{validationStatus.message}</p>
          )}

          <div className="flex items-center justify-between">
            <a
              href={config.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:text-emerald-700"
            >
              Get key →
            </a>

            <div className="flex items-center gap-2">
              {hasKey && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleValidateAndSave}
                disabled={!key.trim() || validating}
                className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? '...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <code className="text-xs text-slate-500 font-mono">{currentKey}</code>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
