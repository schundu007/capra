export default function ExplanationPanel({ explanations, highlightedLine, pitch }) {
  if ((!explanations || explanations.length === 0) && !pitch) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-slate-200">Explanation</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
          <div className="p-4 rounded-full bg-slate-800/50 mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm">Submit a problem to see explanation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/30">
      <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium text-slate-200">Explanation</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-4">
        {/* Solution pitch */}
        {pitch && (
          <div className="animate-slide-up">
            <div className="glass-panel p-4 border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-900/20 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-medium text-indigo-300 uppercase tracking-wide">Solution Pitch (1-2 min)</span>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{pitch}</p>
            </div>
          </div>
        )}

        {/* Line-by-line explanations */}
        {explanations && explanations.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Line-by-Line</span>
              <div className="h-px flex-1 bg-gradient-to-l from-slate-700 to-transparent" />
            </div>

            <div className="space-y-2">
              {explanations.map((item, index) => {
                const isHighlighted = highlightedLine === item.line;

                return (
                  <div
                    key={index}
                    className={
                      'glass-panel p-3 transition-all duration-200 animate-slide-up ' +
                      (isHighlighted
                        ? 'border-indigo-500/50 bg-indigo-900/20 scale-[1.01] shadow-glow'
                        : '')
                    }
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={
                        'flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-xs font-mono font-medium transition-colors ' +
                        (isHighlighted
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300')
                      }>
                        {item.line}
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="block text-xs text-slate-400 font-mono truncate mb-1">
                          {item.code}
                        </code>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
