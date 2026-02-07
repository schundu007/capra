import { useState, useRef, useEffect } from 'react';

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

export default function ProviderToggle({ provider, model, onChange, onModelChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const models = provider === 'openai' ? OPENAI_MODELS : CLAUDE_MODELS;
  const currentModel = models.find(m => m.id === model) || models[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProviderChange = (newProvider) => {
    onChange(newProvider);
    const defaultModel = newProvider === 'openai' ? OPENAI_MODELS[0].id : CLAUDE_MODELS[0].id;
    onModelChange(defaultModel);
  };

  const handleToggleDropdown = () => {
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
    }
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 p-0.5 rounded" style={{ background: '#15322a' }}>
        <button
          onClick={() => handleProviderChange('claude')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors"
          style={{
            background: provider === 'claude' ? '#1ba94c' : 'transparent',
            color: provider === 'claude' ? 'white' : '#b0b0b0'
          }}
        >
          Claude
        </button>
        <button
          onClick={() => handleProviderChange('openai')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors"
          style={{
            background: provider === 'openai' ? '#1ba94c' : 'transparent',
            color: provider === 'openai' ? 'white' : '#b0b0b0'
          }}
        >
          GPT
        </button>
      </div>

      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggleDropdown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border"
          style={{
            background: 'rgba(27, 169, 76, 0.1)',
            borderColor: 'rgba(27, 169, 76, 0.3)',
            color: '#1ba94c'
          }}
        >
          {currentModel.name}
          <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="fixed w-48 rounded-lg shadow-xl py-1 border"
            style={{
              background: '#1a1a2e',
              borderColor: '#2a2a4e',
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              zIndex: 9999
            }}
          >
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onModelChange(m.id);
                  setShowDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-slate-700/50 ${
                  m.id === model ? 'bg-slate-700/30' : ''
                }`}
              >
                <div className="font-medium text-white">{m.name}</div>
                <div className="text-slate-400 text-[10px]">{m.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
