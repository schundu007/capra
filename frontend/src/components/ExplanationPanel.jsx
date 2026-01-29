export default function ExplanationPanel({ explanations, highlightedLine, pitch }) {
  if ((!explanations || explanations.length === 0) && !pitch) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-neutral-900">Explanation</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
          <div className="p-4 rounded-md bg-neutral-100 mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm">Submit a problem to see explanation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium text-neutral-900">Explanation</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-4">
        {/* Solution pitch */}
        {pitch && (
          <div className="animate-fade-in">
            <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 border-l-4 border-l-neutral-900">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Solution Pitch (1-2 min)</span>
              </div>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{pitch}</p>
            </div>
          </div>
        )}

        {/* Line-by-line explanations */}
        {explanations && explanations.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Line-by-Line</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="space-y-2">
              {explanations.map((item, index) => {
                const isHighlighted = highlightedLine === item.line;

                return (
                  <div
                    key={index}
                    className={
                      'bg-neutral-50 border border-neutral-200 rounded-md p-3 transition-all duration-200 animate-fade-in ' +
                      (isHighlighted
                        ? 'border-neutral-900 bg-neutral-100 scale-[1.01]'
                        : '')
                    }
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={
                        'flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-xs font-mono font-medium transition-colors ' +
                        (isHighlighted
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-200 text-neutral-600')
                      }>
                        {item.line}
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="block text-xs text-neutral-500 font-mono truncate mb-1">
                          {item.code}
                        </code>
                        <p className="text-xs text-neutral-700 leading-relaxed">
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
