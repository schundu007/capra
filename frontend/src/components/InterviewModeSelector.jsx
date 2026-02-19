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
      {/* Interview Mode Toggle - Premium look */}
      <div
        className="flex rounded-xl overflow-hidden p-0.5"
        style={{
          background: 'linear-gradient(135deg, #f0f0f0 0%, #e5e7eb 100%)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <button
          type="button"
          onClick={() => onModeChange('coding')}
          className="px-3 py-1.5 text-[10px] font-semibold transition-all flex items-center gap-1.5 rounded-lg"
          style={{
            background: interviewMode === 'coding'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'transparent',
            color: interviewMode === 'coding' ? 'white' : '#6b7280',
            boxShadow: interviewMode === 'coding'
              ? '0 2px 8px rgba(16, 185, 129, 0.35)'
              : 'none',
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
          className="px-3 py-1.5 text-[10px] font-semibold transition-all flex items-center gap-1.5 rounded-lg"
          style={{
            background: interviewMode === 'system-design'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'transparent',
            color: interviewMode === 'system-design' ? 'white' : '#6b7280',
            boxShadow: interviewMode === 'system-design'
              ? '0 2px 8px rgba(59, 130, 246, 0.35)'
              : 'none',
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
          className="flex rounded-lg overflow-hidden p-0.5 animate-fadeIn"
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          }}
        >
          <button
            type="button"
            onClick={() => onDetailLevelChange('basic')}
            className="px-2.5 py-1 text-[10px] font-semibold transition-all rounded-md"
            style={{
              background: designDetailLevel === 'basic' ? '#3b82f6' : 'transparent',
              color: designDetailLevel === 'basic' ? 'white' : '#3b82f6',
              boxShadow: designDetailLevel === 'basic' ? '0 1px 4px rgba(59, 130, 246, 0.3)' : 'none',
            }}
            title="Single-region, minimal architecture"
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => onDetailLevelChange('full')}
            className="px-2.5 py-1 text-[10px] font-semibold transition-all rounded-md"
            style={{
              background: designDetailLevel === 'full' ? '#3b82f6' : 'transparent',
              color: designDetailLevel === 'full' ? 'white' : '#3b82f6',
              boxShadow: designDetailLevel === 'full' ? '0 1px 4px rgba(59, 130, 246, 0.3)' : 'none',
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all animate-fadeIn"
          style={{
            background: autoGenerateEraser
              ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            color: autoGenerateEraser ? 'white' : '#6b7280',
            boxShadow: autoGenerateEraser
              ? '0 2px 8px rgba(139, 92, 246, 0.35)'
              : 'inset 0 1px 2px rgba(0,0,0,0.05)',
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
