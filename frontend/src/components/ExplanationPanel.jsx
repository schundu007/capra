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
            <pre
              key={i}
              className="p-1.5 rounded text-[10px] font-mono overflow-x-auto"
              style={{ background: 'rgba(255,255,255,0.03)', color: '#a1a1aa' }}
            >
              {code}
            </pre>
          );
        }

        // Bullet list
        if (para.match(/^[\s]*[-•*]\s/m)) {
          const items = para.split(/\n/).filter(line => line.trim());
          return (
            <ul key={i} className="space-y-0.5 ml-3 list-disc" style={{ color: '#fafafa' }}>
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
            <ol key={i} className="space-y-0.5 ml-3 list-decimal" style={{ color: '#fafafa' }}>
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
          .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong class="font-semibold" style="color:#fafafa">$1$2</strong>')
          .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.06);padding:1px 4px;border-radius:3px;font-size:10px;color:#a1a1aa">$1</code>')
          .replace(/\*(.+?)\*|_(.+?)_/g, '<em>$1$2</em>');

        return (
          <p
            key={i}
            className="text-[11px] leading-snug font-medium"
            style={{ color: '#e4e4e7' }}
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
      <div className="h-full flex flex-col overflow-hidden" style={{ background: '#111113' }}>
        <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-1 h-1 rounded-full" style={{ background: '#52525b' }} />
          <span className="text-[10px] font-medium" style={{ color: '#52525b' }}>Explanation</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <svg className="w-6 h-6 mx-auto mb-1" style={{ color: '#3f3f46' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-[10px]" style={{ color: '#52525b' }}>Solve a problem to see explanations</p>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming && !pitch && (!explanations || explanations.length === 0)) {
    return (
      <div className="h-full flex flex-col overflow-hidden" style={{ background: '#111113' }}>
        <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-1 h-1 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span className="text-[10px] font-semibold" style={{ color: '#fafafa' }}>Explanation</span>
          <div className="flex gap-0.5 ml-1.5">
            <span className="w-0.5 h-0.5 rounded-full animate-bounce" style={{ background: '#10b981', animationDelay: '0ms' }} />
            <span className="w-0.5 h-0.5 rounded-full animate-bounce" style={{ background: '#10b981', animationDelay: '150ms' }} />
            <span className="w-0.5 h-0.5 rounded-full animate-bounce" style={{ background: '#10b981', animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[11px]" style={{ color: '#71717a' }}>Generating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#111113' }}>
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-1 h-1 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
        <span className="text-[10px] font-semibold" style={{ color: '#fafafa' }}>Explanation</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2 space-y-2">
        {/* Solution Pitch */}
        {pitch && (
          <div
            className="p-2 rounded-lg"
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              borderLeft: '2px solid #10b981'
            }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide mb-1 block" style={{ color: '#10b981' }}>
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
                className="mt-1.5 w-full px-2 py-1.5 text-[10px] font-medium rounded-lg transition-colors"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(16, 185, 129, 0.15)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(16, 185, 129, 0.1)'; }}
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
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#a1a1aa' }}>
                Line Breakdown
              </span>
            </div>

            <div className="space-y-1">
              {explanations.map((item, index) => {
                const isHighlighted = highlightedLine === item.line;

                return (
                  <div
                    key={index}
                    className="px-1.5 py-1 rounded transition-all duration-200"
                    style={{
                      background: isHighlighted ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => { if (!isHighlighted) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(e) => { if (!isHighlighted) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Line number + Code */}
                    <div className="flex items-start gap-1.5 mb-0.5">
                      <span
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold"
                        style={{
                          background: isHighlighted ? '#10b981' : 'rgba(255,255,255,0.06)',
                          color: isHighlighted ? 'white' : '#a1a1aa'
                        }}
                      >
                        {item.line}
                      </span>
                      <code
                        className="flex-1 text-[11px] font-mono font-medium select-text cursor-text whitespace-pre-wrap break-words"
                        style={{ color: '#e4e4e7' }}
                      >
                        {item.code}
                      </code>
                    </div>
                    {/* Explanation */}
                    <div className="pl-6">
                      <p className="text-[10px] font-medium select-text leading-tight" style={{ color: '#a1a1aa' }}>
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
