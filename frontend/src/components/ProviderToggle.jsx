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

export default function ProviderToggle({ provider, model, onChange, onModelChange, compact = false }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
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
      if (compact) {
        // For compact/sidebar mode, position to the right of the button
        setDropdownPosition({
          top: rect.top,
          left: rect.right + 4
        });
      } else {
        // For header mode, position below
        setDropdownPosition({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right
        });
      }
    }
    setShowDropdown(!showDropdown);
  };

  // Compact sidebar layout
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Provider Toggle - Full width */}
        <div
          className="flex items-center gap-1 p-0.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #e0e0e0' }}
        >
          <button
            onClick={() => handleProviderChange('claude')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              background: provider === 'claude' ? '#10b981' : 'transparent',
              color: provider === 'claude' ? '#ffffff' : '#666666'
            }}
          >
            Claude
          </button>
          <button
            onClick={() => handleProviderChange('openai')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              background: provider === 'openai' ? '#10b981' : 'transparent',
              color: provider === 'openai' ? '#ffffff' : '#666666'
            }}
          >
            GPT
          </button>
        </div>

        {/* Model Selector - Full width */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={handleToggleDropdown}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#059669'
            }}
          >
            <span className="truncate">{currentModel.name}</span>
            <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="fixed w-48 rounded-lg shadow-lg py-1"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
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
                  className="w-full px-3 py-2 text-left text-xs transition-colors"
                  style={{
                    background: m.id === model ? '#f5f5f5' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (m.id !== model) e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { if (m.id !== model) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="font-medium" style={{ color: '#333333' }}>{m.name}</div>
                  <div className="text-xs" style={{ color: '#999999' }}>{m.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default header layout
  return (
    <div className="flex items-center gap-2">
      {/* Provider Toggle */}
      <div
        className="flex items-center gap-1 p-0.5 rounded"
        style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}
      >
        <button
          onClick={() => handleProviderChange('claude')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors"
          style={{
            background: provider === 'claude' ? '#10b981' : 'transparent',
            color: provider === 'claude' ? '#ffffff' : '#666666'
          }}
        >
          Claude
        </button>
        <button
          onClick={() => handleProviderChange('openai')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors"
          style={{
            background: provider === 'openai' ? '#10b981' : 'transparent',
            color: provider === 'openai' ? '#ffffff' : '#666666'
          }}
        >
          GPT
        </button>
      </div>

      {/* Model Selector */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggleDropdown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#10b981'
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
            className="fixed w-48 rounded shadow-lg py-1"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e5e5',
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
                className="w-full px-3 py-2 text-left text-xs transition-colors"
                style={{
                  background: m.id === model ? '#f5f5f5' : 'transparent',
                }}
              >
                <div className="font-medium" style={{ color: '#333333' }}>{m.name}</div>
                <div className="text-xs" style={{ color: '#999999' }}>{m.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
