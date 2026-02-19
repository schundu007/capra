import { useState } from 'react';

export default function OutputPanel({ section, content, streamingContent, isGenerating, onRegenerate, onGenerate, hasInputs }) {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, field) => {
    try {
      // Use Electron clipboard API if available, otherwise fallback to navigator.clipboard
      if (window.electronAPI?.copyToClipboard) {
        const success = window.electronAPI.copyToClipboard(text);
        if (success) {
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        }
      } else {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Show streaming content while generating
  const displayContent = isGenerating ? streamingContent : content;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{section?.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{section?.name}</h3>
              <p className="text-sm text-gray-500">{section?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {content && !isGenerating && (
              <>
                <button
                  onClick={() => handleCopy(
                    typeof content === 'string'
                      ? content
                      : content?.rawContent || JSON.stringify(content, null, 2),
                    'all'
                  )}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  {copiedField === 'all' ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy All
                    </>
                  )}
                </button>
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {!displayContent && !isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-4 block opacity-50">{section?.icon}</span>
              <p className="text-lg font-medium text-gray-700 mb-2">{section?.name}</p>
              <p className="text-sm text-gray-500 mb-6">{section?.description}</p>
              {hasInputs ? (
                <button
                  onClick={onGenerate}
                  className="px-6 py-3 rounded-lg font-medium text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  Generate {section?.name}
                </button>
              ) : (
                <p className="text-sm text-amber-600">Add Job Description and Resume first</p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-none">
            {isGenerating && (
              <div className="flex items-center gap-2 mb-3 text-emerald-600">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Generating {section?.name}...</span>
              </div>
            )}

            {typeof displayContent === 'string' ? (
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {displayContent}
                {isGenerating && (
                  <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-0.5" />
                )}
              </div>
            ) : displayContent && typeof displayContent === 'object' ? (
              <div className="space-y-4">
                {/* Structured content display */}
                {displayContent.summary && displayContent.summary.trim() && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-1 text-sm">Summary</h4>
                    <p className="text-emerald-700 text-sm">{displayContent.summary.trim()}</p>
                  </div>
                )}

                {displayContent.keyPoints && displayContent.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Points</h4>
                    <ul className="space-y-1">
                      {displayContent.keyPoints.filter(p => p?.trim()).map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5 text-sm">•</span>
                          <span className="text-gray-700 text-sm">{point?.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {displayContent.questions && displayContent.questions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Likely Questions</h4>
                    <div className="space-y-2">
                      {displayContent.questions.filter(q => q.question?.trim()).map((q, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-gray-800 text-sm">{q.question?.trim()}</p>
                            <button
                              onClick={() => handleCopy(q.answer || q.suggestedAnswer, `q-${i}`)}
                              className="flex-shrink-0 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                            >
                              {copiedField === `q-${i}` ? (
                                <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {(q.answer || q.suggestedAnswer) && (
                            <p className="mt-1.5 text-gray-600 text-xs">{(q.answer || q.suggestedAnswer)?.trim()}</p>
                          )}
                          {q.tips && (
                            <p className="mt-1 text-xs text-emerald-600 italic">Tip: {q.tips?.trim()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {displayContent.talkingPoints && displayContent.talkingPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Talking Points</h4>
                    <ul className="space-y-1">
                      {displayContent.talkingPoints.filter(p => p?.trim()).map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold text-sm">{i + 1}.</span>
                          <span className="text-gray-700 text-sm">{point?.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {displayContent.pitch && displayContent.pitch.trim() && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-1 text-sm flex items-center justify-between">
                      <span>Your Elevator Pitch</span>
                      <button
                        onClick={() => handleCopy(displayContent.pitch.trim(), 'pitch')}
                        className="p-1 rounded hover:bg-blue-100 text-blue-400 hover:text-blue-600"
                      >
                        {copiedField === 'pitch' ? (
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </h4>
                    <p className="text-blue-700 text-sm leading-relaxed">{displayContent.pitch.trim()}</p>
                  </div>
                )}

                {/* Handle rawContent from AI when JSON parsing failed */}
                {displayContent.rawContent && displayContent.rawContent.trim() && (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {displayContent.rawContent.trim().replace(/\n{3,}/g, '\n\n')}
                  </div>
                )}

                {/* Fallback for other unstructured content */}
                {!displayContent.summary && !displayContent.keyPoints && !displayContent.questions &&
                 !displayContent.talkingPoints && !displayContent.pitch && !displayContent.rawContent && (
                  <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                    {JSON.stringify(displayContent, null, 2)}
                  </pre>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
