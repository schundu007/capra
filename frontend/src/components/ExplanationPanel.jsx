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
            <pre key={i} className="p-1.5 rounded text-[10px] font-mono overflow-x-auto bg-gray-100 text-gray-800">
              {code}
            </pre>
          );
        }

        // Bullet list
        if (para.match(/^[\s]*[-•*]\s/m)) {
          const items = para.split(/\n/).filter(line => line.trim());
          return (
            <ul key={i} className="space-y-0.5 ml-3 list-disc text-gray-900">
              {items.map((item, j) => (
                <li key={j} className="text-[11px] leading-snug font-medium">
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
            <ol key={i} className="space-y-0.5 ml-3 list-decimal text-gray-900">
              {items.map((item, j) => (
                <li key={j} className="text-[11px] leading-snug font-medium">
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
          .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong class="text-black font-bold">$1$2</strong>')
          .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-[10px] text-gray-800 font-semibold">$1</code>')
          .replace(/\*(.+?)\*|_(.+?)_/g, '<em>$1$2</em>');

        return (
          <p
            key={i}
            className="text-[11px] leading-snug text-gray-900 font-medium"
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
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-200 flex-shrink-0">
          <div className="w-1 h-1 rounded-full bg-[#1ba94c]" />
          <span className="text-[10px] font-medium text-gray-600">Explanation</span>
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
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-200 flex-shrink-0">
          <div className="w-1 h-1 rounded-full bg-[#1ba94c]" />
          <span className="text-[10px] font-medium text-gray-600">Explanation</span>
          <div className="flex gap-0.5 ml-1.5">
            <span className="w-0.5 h-0.5 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-0.5 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-0.5 rounded-full bg-[#1ba94c] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[11px] text-gray-400">Generating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-200 flex-shrink-0">
        <div className="w-1 h-1 rounded-full bg-[#1ba94c]" />
        <span className="text-[10px] font-medium text-gray-600">Explanation</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2 space-y-2">
        {/* Solution Pitch */}
        {pitch && (
          <div className="p-2 rounded-lg bg-[#1ba94c]/5 border-l-2 border-[#1ba94c]">
            <span className="text-[9px] font-semibold uppercase tracking-wide mb-1 block text-[#1ba94c]">
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
                className="mt-1.5 w-full px-2 py-1.5 text-[10px] font-medium rounded-lg bg-[#1ba94c]/10 text-[#1ba94c] border border-[#1ba94c]/20 hover:bg-[#1ba94c]/20 transition-colors"
              >
                Expand System Design
              </button>
            )}
          </div>
        )}

        {/* Line-by-line Explanations */}
        {explanations && explanations.length > 0 && (
          <div>
            <div className="mb-1">
              <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                Line Breakdown
              </span>
            </div>

            <div className="space-y-1">
              {explanations.map((item, index) => {
                const isHighlighted = highlightedLine === item.line;

                return (
                  <div
                    key={index}
                    className={`px-1.5 py-1 rounded transition-all duration-200 ${
                      isHighlighted
                        ? 'bg-[#1ba94c]/10'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Line number + Code */}
                    <div className="flex items-start gap-1.5 mb-0.5">
                      <span
                        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold ${
                          isHighlighted
                            ? 'bg-[#1ba94c] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.line}
                      </span>
                      <code className="flex-1 text-[11px] font-mono text-gray-900 font-semibold select-text cursor-text whitespace-pre-wrap break-words">
                        {item.code}
                      </code>
                    </div>
                    {/* Explanation */}
                    <div className="pl-6">
                      <p className="text-[10px] text-gray-800 font-medium select-text leading-tight">
                        {item.explanation}
                      </p>
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
