export default function InterviewModeSelector({
  interviewMode,
  onModeChange,
  designDetailLevel,
  onDetailLevelChange,
  autoGenerateEraser,
  onAutoGenerateEraserChange
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Interview Mode Toggle */}
      <div
        className="flex rounded overflow-hidden p-0.5"
        style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}
      >
        <button
          type="button"
          onClick={() => onModeChange('coding')}
          className="px-3 py-1.5 text-[10px] font-semibold transition-all flex items-center gap-1.5 rounded"
          style={{
            background: interviewMode === 'coding' ? '#10b981' : 'transparent',
            color: interviewMode === 'coding' ? '#ffffff' : '#666666',
          }}
          title="Coding Interview"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Coding
        </button>
        <button
          type="button"
          onClick={() => onModeChange('system-design')}
          className="px-3 py-1.5 text-[10px] font-semibold transition-all flex items-center gap-1.5 rounded"
          style={{
            background: interviewMode === 'system-design' ? '#3b82f6' : 'transparent',
            color: interviewMode === 'system-design' ? '#ffffff' : '#666666',
          }}
          title="System Design Interview"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Design
        </button>
      </div>

      {/* Design Detail Level - Only show when in system-design mode */}
      {interviewMode === 'system-design' && (
        <div
          className="flex rounded overflow-hidden p-0.5 animate-fadeIn"
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
      )}

      {/* Auto Pro Diagram Toggle - Only show when in system-design mode */}
      {interviewMode === 'system-design' && (
        <button
          type="button"
          onClick={() => onAutoGenerateEraserChange(!autoGenerateEraser)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-semibold transition-all animate-fadeIn"
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
      )}
    </div>
  );
}
