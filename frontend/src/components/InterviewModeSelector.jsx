/**
 * System Design controls - only shown when in system-design mode
 * Mode selection is now in the header tabs
 */
export default function InterviewModeSelector({
  interviewMode,
  designDetailLevel,
  onDetailLevelChange,
  autoGenerateEraser,
  onAutoGenerateEraserChange
}) {
  // Only render in system-design mode
  if (interviewMode !== 'system-design') {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Design Detail Level */}
      <div
        className="flex rounded overflow-hidden p-0.5"
        style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
      >
        <button
          type="button"
          onClick={() => onDetailLevelChange('basic')}
          className="px-2.5 py-1 text-[10px] font-semibold transition-all rounded"
          style={{
            background: designDetailLevel === 'basic' ? '#3b82f6' : 'transparent',
            color: designDetailLevel === 'basic' ? '#ffffff' : '#3b82f6',
          }}
          title="Single-region, minimal architecture"
        >
          Basic
        </button>
        <button
          type="button"
          onClick={() => onDetailLevelChange('full')}
          className="px-2.5 py-1 text-[10px] font-semibold transition-all rounded"
          style={{
            background: designDetailLevel === 'full' ? '#3b82f6' : 'transparent',
            color: designDetailLevel === 'full' ? '#ffffff' : '#3b82f6',
          }}
          title="Multi-region, HA, detailed scalability"
        >
          Full
        </button>
      </div>

      {/* Auto Pro Diagram Toggle */}
      <button
        type="button"
        onClick={() => onAutoGenerateEraserChange(!autoGenerateEraser)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-semibold transition-all"
        style={{
          background: autoGenerateEraser ? '#8b5cf6' : '#f5f5f5',
          color: autoGenerateEraser ? '#ffffff' : '#666666',
          border: autoGenerateEraser ? '1px solid #8b5cf6' : '1px solid #e5e5e5',
        }}
        title={autoGenerateEraser ? 'Pro diagram will auto-generate (uses Eraser API credits)' : 'Pro diagram disabled - click Generate manually'}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Auto Pro
        {autoGenerateEraser && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}
