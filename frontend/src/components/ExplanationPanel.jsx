import SystemDesignPanel from './SystemDesignPanel';

export default function ExplanationPanel({ explanations, highlightedLine, pitch, systemDesign, isStreaming, onExpandSystemDesign, canExpandSystemDesign }) {
  const hasSystemDesign = systemDesign && systemDesign.included;

  // Empty state - only show if not streaming and no content
  if ((!explanations || explanations.length === 0) && !pitch && !hasSystemDesign && !isStreaming) {
    return (
      <div className="h-full flex flex-col panel-right">
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10">
          <span className="text-sm font-semibold text-white">Explanation</span>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
            <div className="relative glass-card p-8 rounded-3xl">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-base font-medium text-slate-400 text-center">Submit a problem to see explanation</p>
              <p className="text-sm text-slate-500 text-center mt-2">Your solution pitch and line-by-line breakdown will appear here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state without content yet
  if (isStreaming && !pitch && (!explanations || explanations.length === 0)) {
    return (
      <div className="h-full flex flex-col panel-right">
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">Explanation</span>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">Generating explanation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col panel-right">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-transparent">
        <span className="text-sm font-semibold text-white">Explanation</span>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-5 space-y-5">
        {/* Solution pitch */}
        {pitch && (
          <div className="animate-fade-in">
            <div className="highlight-card">
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3 block">Solution Pitch</span>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{pitch}</p>
            </div>
          </div>
        )}

        {/* System Design Section */}
        {hasSystemDesign && (
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <SystemDesignPanel systemDesign={systemDesign} />
            {/* Expand to detailed design button */}
            {canExpandSystemDesign && onExpandSystemDesign && (
              <button
                onClick={onExpandSystemDesign}
                className="mt-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 hover:from-amber-500/20 hover:to-orange-500/20 hover:border-amber-500/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Get Detailed System Design
              </button>
            )}
          </div>
        )}

        {/* Line-by-line explanations */}
        {explanations && explanations.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Section header */}
            <div className="mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line-by-Line</span>
            </div>

            <div className="space-y-3">
              {explanations.map((item, index) => {
                const isHighlighted = highlightedLine === item.line;

                return (
                  <div
                    key={index}
                    className={`glass-card p-4 transition-all duration-300 ${
                      isHighlighted
                        ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20 scale-[1.02]'
                        : 'hover:border-slate-600/50'
                    }`}
                    style={{ animationDelay: `${(index + 3) * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-sm font-mono font-bold transition-all duration-300 ${
                        isHighlighted
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-slate-900 shadow-lg shadow-yellow-500/30'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}>
                        {item.line}
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="block text-sm text-slate-300 font-mono truncate mb-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/30">
                          {item.code}
                        </code>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
