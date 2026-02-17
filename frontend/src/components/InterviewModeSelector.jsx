export default function InterviewModeSelector({
  interviewMode,
  onModeChange,
  designDetailLevel,
  onDetailLevelChange
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Interview Mode Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => onModeChange('coding')}
          className="px-2.5 py-1 text-[10px] font-medium transition-all flex items-center gap-1"
          style={{
            background: interviewMode === 'coding' ? '#10b981' : 'transparent',
            color: interviewMode === 'coding' ? 'white' : '#6b7280',
          }}
          title="Coding Interview"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Coding
        </button>
        <button
          type="button"
          onClick={() => onModeChange('system-design')}
          className="px-2.5 py-1 text-[10px] font-medium transition-all flex items-center gap-1"
          style={{
            background: interviewMode === 'system-design' ? '#10b981' : 'transparent',
            color: interviewMode === 'system-design' ? 'white' : '#6b7280',
          }}
          title="System Design Interview"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Design
        </button>
      </div>

      {/* Design Detail Level - Only show when in system-design mode */}
      {interviewMode === 'system-design' && (
        <div className="flex rounded-lg overflow-hidden border border-blue-200 bg-blue-50">
          <button
            type="button"
            onClick={() => onDetailLevelChange('basic')}
            className="px-2 py-1 text-[10px] font-medium transition-all"
            style={{
              background: designDetailLevel === 'basic' ? '#3b82f6' : 'transparent',
              color: designDetailLevel === 'basic' ? 'white' : '#3b82f6',
            }}
            title="Single-region, minimal architecture"
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => onDetailLevelChange('full')}
            className="px-2 py-1 text-[10px] font-medium transition-all"
            style={{
              background: designDetailLevel === 'full' ? '#3b82f6' : 'transparent',
              color: designDetailLevel === 'full' ? 'white' : '#3b82f6',
            }}
            title="Multi-region, HA, detailed scalability"
          >
            Full
          </button>
        </div>
      )}
    </div>
  );
}
