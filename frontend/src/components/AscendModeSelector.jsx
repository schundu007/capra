/**
 * System Design controls - only shown when in system-design mode
 * Mode selection is now in the header tabs
 */
export default function AscendModeSelector({
  ascendMode,
  designDetailLevel,
  onDetailLevelChange,
  autoGenerateEraser,
  onAutoGenerateEraserChange
}) {
  // Only render in system-design mode
  if (ascendMode !== 'system-design') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Design Detail Level - Pill Toggle */}
      <div
        className="flex items-center rounded-full p-0.5"
        style={{ background: '#f0f0f0', border: '1px solid #e0e0e0' }}
      >
        <button
          type="button"
          onClick={() => onDetailLevelChange('basic')}
          className="px-3 py-1 text-[10px] font-semibold transition-all rounded-full"
          style={{
            background: designDetailLevel === 'basic' ? '#10b981' : 'transparent',
            color: designDetailLevel === 'basic' ? '#ffffff' : '#666666',
            boxShadow: designDetailLevel === 'basic' ? '0 1px 3px rgba(16, 185, 129, 0.3)' : 'none',
          }}
          title="Single-region, minimal architecture"
        >
          Basic
        </button>
        <button
          type="button"
          onClick={() => onDetailLevelChange('full')}
          className="px-3 py-1 text-[10px] font-semibold transition-all rounded-full"
          style={{
            background: designDetailLevel === 'full' ? '#10b981' : 'transparent',
            color: designDetailLevel === 'full' ? '#ffffff' : '#666666',
            boxShadow: designDetailLevel === 'full' ? '0 1px 3px rgba(16, 185, 129, 0.3)' : 'none',
          }}
          title="Multi-region, HA, detailed scalability"
        >
          Full
        </button>
      </div>

      {/* Auto Pro Diagram Toggle - Compact Pill */}
      <button
        type="button"
        onClick={() => onAutoGenerateEraserChange(!autoGenerateEraser)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
        style={{
          background: autoGenerateEraser ? '#8b5cf6' : 'transparent',
          color: autoGenerateEraser ? '#ffffff' : '#8b5cf6',
          border: '1px solid #8b5cf6',
        }}
        title={autoGenerateEraser ? 'Pro diagram will auto-generate (uses Eraser API credits)' : 'Pro diagram disabled - click Generate manually'}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Auto Pro
        {autoGenerateEraser && (
          <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}
