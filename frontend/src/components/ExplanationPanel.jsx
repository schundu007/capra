export default function ExplanationPanel({ explanations, highlightedLine, pitch }) {
  if ((!explanations || explanations.length === 0) && !pitch) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-2 py-1.5 bg-slate-800 border-b border-slate-700">
          <span className="text-xs font-medium text-slate-300">Explanation</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          <p>Submit a problem to see explanation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="px-2 py-1.5 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-300">Explanation</span>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-2">
        {pitch && (
          <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded">
            <div className="text-xs font-medium text-blue-400 mb-2">Solution Pitch (1-2 min)</div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{pitch}</p>
          </div>
        )}

        {explanations && explanations.length > 0 && (
          <div className="text-xs font-medium text-slate-400 mt-2 mb-1">Line-by-Line</div>
        )}
        {explanations.map((item, index) => {
          const isHighlighted = highlightedLine === item.line;
          const bgClass = isHighlighted ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-800 border-slate-700';

          return (
            <div
              key={index}
              className={'p-2 rounded border transition-colors ' + bgClass}
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-xs text-slate-300 font-mono">
                  {item.line}
                </span>
                <div className="flex-1 min-w-0">
                  <code className="block text-xs text-slate-400 font-mono truncate">
                    {item.code}
                  </code>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
