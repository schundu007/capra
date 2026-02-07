import SystemDesignPanel from './SystemDesignPanel';

// Format text with basic markdown-like styling
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
            <pre key={i} className="p-3 rounded text-xs font-mono overflow-x-auto" style={{ background: '#f5f9f7', color: '#111111' }}>
              {code}
            </pre>
          );
        }

        // Bullet list
        if (para.match(/^[\s]*[-•*]\s/m)) {
          const items = para.split(/\n/).filter(line => line.trim());
          return (
            <ul key={i} className="space-y-1 ml-4 list-disc" style={{ color: '#111111' }}>
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
            <ol key={i} className="space-y-1 ml-4 list-decimal" style={{ color: '#111111' }}>
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
          .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong style="color:#111111;font-weight:600">$1$2</strong>')
          .replace(/`([^`]+)`/g, '<code style="background:#f5f9f7;padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
          .replace(/\*(.+?)\*|_(.+?)_/g, '<em>$1$2</em>');

        return (
          <p
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: '#111111' }}
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
      <div className="h-full flex flex-col overflow-hidden" style={{ background: '#ffffff' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #d4e0d8' }}>
          <span className="text-sm font-semibold" style={{ color: '#111111' }}>Explanation</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ color: '#7a7a7a' }}>
            <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm">Submit a problem to see explanation</p>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming && !pitch && (!explanations || explanations.length === 0)) {
    return (
      <div className="h-full flex flex-col overflow-hidden" style={{ background: '#ffffff' }}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #d4e0d8' }}>
          <span className="text-sm font-semibold" style={{ color: '#111111' }}>Explanation</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1ba94c', animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1ba94c', animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1ba94c', animationDelay: '300ms' }} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: '#7a7a7a' }}>Generating explanation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: '1px solid #d4e0d8' }}>
        <span className="text-sm font-semibold" style={{ color: '#111111' }}>Explanation</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {/* Solution Pitch */}
        {pitch && (
          <div className="p-4 rounded" style={{ background: '#f5f9f7', borderLeft: '3px solid #1ba94c' }}>
            <span className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: '#1ba94c' }}>
              Solution Approach
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
                className="mt-2 w-full px-4 py-2 text-sm font-medium rounded transition-colors"
                style={{ background: 'rgba(27, 169, 76, 0.1)', color: '#1ba94c', border: '1px solid rgba(27, 169, 76, 0.2)' }}
              >
                Get Detailed System Design
              </button>
            )}
          </div>
        )}

        {/* Line-by-line Explanations */}
        {explanations && explanations.length > 0 && (
          <div>
            <div className="mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#4a4a4a' }}>
                Line-by-Line Breakdown
              </span>
            </div>

            <div className="space-y-3">
              {explanations.map((item, index) => {
                const isHighlighted = highlightedLine === item.line;

                return (
                  <div
                    key={index}
                    className="p-3 rounded transition-all duration-200"
                    style={{
                      background: isHighlighted ? 'rgba(27, 169, 76, 0.05)' : '#f5f9f7',
                      border: `1px solid ${isHighlighted ? '#1ba94c' : '#d4e0d8'}`
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded text-xs font-mono font-semibold"
                        style={{
                          background: isHighlighted ? '#1ba94c' : '#e8f0ec',
                          color: isHighlighted ? 'white' : '#4a4a4a'
                        }}
                      >
                        {item.line}
                      </span>
                      <div className="flex-1 min-w-0">
                        <code
                          className="block text-xs font-mono truncate mb-2 p-2 rounded"
                          style={{ background: '#ffffff', color: '#111111', border: '1px solid #d4e0d8' }}
                        >
                          {item.code}
                        </code>
                        <div className="text-sm" style={{ color: '#4a4a4a' }}>
                          <FormattedText text={item.explanation} />
                        </div>
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
