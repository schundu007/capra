import SystemDesignPanel from './SystemDesignPanel';

// Format text with basic markdown-like styling (dark theme)
function FormattedText({ text }) {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => {
        // Code block
        if (para.trim().startsWith('```') || para.match(/^[\s]{4,}/m)) {
          const code = para.replace(/^```\w*\n?|```$/g, '').trim();
          return (
            <pre key={i} className="p-2 rounded text-xs font-mono overflow-x-auto bg-black/30 text-slate-300">
              {code}
            </pre>
          );
        }

        // Bullet list
        if (para.match(/^[\s]*[-•*]\s/m)) {
          const items = para.split(/\n/).filter(line => line.trim());
          return (
            <ul key={i} className="space-y-1 ml-4 list-disc text-slate-300">
              {items.map((item, j) => (
                <li key={j} className="text-sm leading-relaxed">
                  {item.replace(/^[\s]*[-•*]\s*/, '')}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (para.match(/^[\s]*\d+[.)]\s/m)) {
          const items = para.split(/\n/).filter(line => line.trim());
          return (
            <ol key={i} className="space-y-1 ml-4 list-decimal text-slate-300">
              {items.map((item, j) => (
                <li key={j} className="text-sm leading-relaxed">
                  {item.replace(/^[\s]*\d+[.)]\s*/, '')}
                </li>
              ))}
            </ol>
          );
        }

        // Regular paragraph
        const formatted = para
          .split(/\n/)
          .join(' ')
          .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong class="text-white font-semibold">$1$2</strong>')
          .replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded text-xs text-violet-300">$1</code>')
          .replace(/\*(.+?)\*|_(.+?)_/g, '<em>$1$2</em>');

        return (
          <p
            key={i}
            className="text-sm leading-relaxed text-slate-300"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
}

export default function ExplanationPanel({ explanations, highlightedLine, pitch, systemDesign, isStreaming, onExpandSystemDesign, canExpandSystemDesign }) {
  const hasSystemDesign = systemDesign && systemDesign.included;

  // Empty state
  if ((!explanations || explanations.length === 0) && !pitch && !hasSystemDesign && !isStreaming) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1ba94c]" />
          <span className="text-xs font-medium text-gray-600">Explanation</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming && !pitch && (!explanations || explanations.length === 0)) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1ba94c]" />
          <span className="text-xs font-medium text-gray-600">Explanation</span>
          <div className="flex gap-1 ml-2">
            <span className="w-1 h-1 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Generating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1ba94c]" />
        <span className="text-xs font-medium text-gray-600">Explanation</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {/* Solution Pitch */}
        {pitch && (
          <div className="p-3 rounded-lg bg-[#1ba94c]/5 border-l-2 border-[#1ba94c]">
            <span className="text-xs font-semibold uppercase tracking-wide mb-2 block text-[#1ba94c]">
              Approach
            </span>
            <FormattedText text={pitch} />
          </div>
        )}

        {/* System Design */}
        {hasSystemDesign && (
          <div>
            <SystemDesignPanel systemDesign={systemDesign} />
            {canExpandSystemDesign && onExpandSystemDesign && (
              <button
                onClick={onExpandSystemDesign}
                className="mt-2 w-full px-3 py-2 text-xs font-medium rounded-lg bg-[#1ba94c]/10 text-[#1ba94c] border border-[#1ba94c]/20 hover:bg-[#1ba94c]/20 transition-colors"
              >
                Expand System Design
              </button>
            )}
          </div>
        )}

        {/* Line-by-line Explanations */}
        {explanations && explanations.length > 0 && (
          <div>
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Line Breakdown
              </span>
            </div>

            <div className="space-y-1">
              {explanations.map((item, index) => {
                const isHighlighted = highlightedLine === item.line;

                return (
                  <div
                    key={index}
                    className={`px-2 py-1.5 rounded transition-all duration-200 ${
                      isHighlighted
                        ? 'bg-[#1ba94c]/10'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Line number */}
                      <span
                        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-xs font-mono font-medium ${
                          isHighlighted
                            ? 'bg-[#1ba94c] text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.line}
                      </span>
                      {/* Code and explanation */}
                      <div className="flex-1 min-w-0 select-text">
                        <code className="text-xs font-mono text-gray-700 break-all select-text cursor-text">
                          {item.code}
                        </code>
                        <span className="text-xs text-gray-500 ml-2 select-text">
                          — {item.explanation}
                        </span>
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
