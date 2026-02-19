import { useState } from 'react';

// Claude-inspired warm color palette
const colors = {
  bg: '#FAF9F7',
  paper: '#FFFFFF',
  accent: '#D4714C',
  accentLight: '#FDF4F0',
  text: '#2D2D2D',
  textMuted: '#555555',
  textLight: '#777777',
  border: '#E5E1DC',
};

export default function OutputPanel({ section, content, streamingContent, isGenerating, onRegenerate, onGenerate, hasInputs }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const text = typeof content === 'string' ? content : content?.rawContent || JSON.stringify(content, null, 2);
      if (window.electronAPI?.copyToClipboard) {
        window.electronAPI.copyToClipboard(text);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayContent = isGenerating ? streamingContent : content;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Minimal Header */}
      <div className="px-5 py-2.5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: colors.text }}>{section?.name}</span>
          {isGenerating && (
            <div className="flex items-center gap-2" style={{ color: colors.accent }}>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Generating...</span>
            </div>
          )}
        </div>
        {content && !isGenerating && (
          <div className="flex items-center gap-3">
            <button onClick={handleCopy} className="text-xs px-2 py-1 rounded hover:bg-black/5" style={{ color: colors.textLight }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onRegenerate} className="text-xs px-2 py-1 rounded hover:bg-black/5" style={{ color: colors.accent }}>
              Regenerate
            </button>
          </div>
        )}
      </div>

      {/* Content Area - Fit to Page */}
      <div className="flex-1 overflow-auto p-4">
        {!displayContent && !isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: colors.textLight }}>{section?.description}</p>
              {hasInputs ? (
                <button onClick={onGenerate} className="px-5 py-2 rounded text-sm font-medium text-white" style={{ background: colors.accent }}>
                  Generate
                </button>
              ) : (
                <p className="text-xs" style={{ color: colors.textLight }}>Add JD & Resume first</p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto rounded-lg p-5" style={{ background: colors.paper, border: `1px solid ${colors.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {typeof displayContent === 'string' ? (
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: colors.text }}>
                {displayContent}
                {isGenerating && <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: colors.accent }} />}
              </div>
            ) : displayContent && typeof displayContent === 'object' ? (
              <div className="space-y-4 text-[13px]" style={{ color: colors.text, lineHeight: '1.6' }}>
                {/* Summary */}
                {displayContent.summary?.trim() && (
                  <p className="pb-3" style={{ borderBottom: `1px solid ${colors.border}` }}>{displayContent.summary.trim()}</p>
                )}

                {/* Pitch Paragraphs */}
                {displayContent.pitchParagraphs?.length > 0 && (
                  <div className="pl-3 space-y-3" style={{ borderLeft: `3px solid ${colors.accent}` }}>
                    {displayContent.pitchParagraphs.filter(p => p?.trim()).map((p, i) => (
                      <p key={i}>{p.trim()}</p>
                    ))}
                  </div>
                )}

                {/* Old pitch fallback */}
                {displayContent.pitch && !displayContent.pitchParagraphs && (
                  <div className="pl-3" style={{ borderLeft: `3px solid ${colors.accent}` }}>
                    <p>{displayContent.pitch.trim()}</p>
                  </div>
                )}

                {/* Key Talking Points - inline */}
                {displayContent.talkingPoints?.length > 0 && (
                  <p>
                    <span className="font-semibold" style={{ color: colors.accent }}>Key Points: </span>
                    {displayContent.talkingPoints.filter(p => p?.trim()).join(' • ')}
                  </p>
                )}

                {/* Tips */}
                {displayContent.tips?.trim() && (
                  <div className="px-3 py-2 rounded" style={{ background: colors.accentLight }}>
                    <span className="font-semibold" style={{ color: colors.accent }}>Tip: </span>
                    {displayContent.tips.trim()}
                  </div>
                )}

                {/* Tech Stack - compact grid */}
                {displayContent.techStack?.length > 0 && (
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.textLight }}>Tech Stack (HR Report)</p>
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <span className="font-semibold" style={{ color: colors.textMuted }}>Tech</span>
                      <span className="font-semibold" style={{ color: colors.textMuted }}>Category</span>
                      <span className="font-semibold" style={{ color: colors.textMuted }}>Exp</span>
                      <span className="font-semibold" style={{ color: colors.textMuted }}>Relevance</span>
                      {displayContent.techStack.map((t, i) => (
                        <div key={i} className="contents">
                          <span className="font-medium" style={{ color: colors.accent }}>{t.technology}</span>
                          <span>{t.category}</span>
                          <span>{t.experience}</span>
                          <span style={{ color: colors.textMuted }}>{t.relevance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions */}
                {displayContent.questions?.length > 0 && (
                  <div className="space-y-3">
                    {displayContent.questions.filter(q => q.question?.trim()).map((q, i) => (
                      <div key={i} className="pb-3" style={{ borderBottom: i < displayContent.questions.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                        <p className="font-semibold mb-1">{q.question.trim()}</p>
                        {(q.answer || q.suggestedAnswer) && (
                          <p style={{ color: colors.textMuted }}>{(q.answer || q.suggestedAnswer).trim()}</p>
                        )}
                        {q.approach && (
                          <p className="mt-1"><span className="font-semibold" style={{ color: colors.accent }}>Approach: </span>{q.approach.trim()}</p>
                        )}
                        {q.keyConsiderations?.length > 0 && (
                          <p className="mt-1"><span className="font-semibold" style={{ color: colors.accent }}>Consider: </span>{q.keyConsiderations.join(' | ')}</p>
                        )}
                        {/* STAR inline */}
                        {(q.situation || q.task || q.action || q.result) && (
                          <div className="mt-2 pl-3 text-xs" style={{ borderLeft: `2px solid ${colors.border}` }}>
                            {q.situation && <><b style={{ color: colors.accent }}>S:</b> {q.situation.trim()} </>}
                            {q.task && <><b style={{ color: colors.accent }}>T:</b> {q.task.trim()} </>}
                            {q.action && <><b style={{ color: colors.accent }}>A:</b> {q.action.trim()} </>}
                            {q.result && <><b style={{ color: colors.accent }}>R:</b> {q.result.trim()}</>}
                          </div>
                        )}
                        {q.tips && <p className="mt-1 italic text-xs" style={{ color: colors.accent }}>{q.tips.trim()}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Topics */}
                {displayContent.keyTopics?.length > 0 && (
                  <p><span className="font-semibold" style={{ color: colors.textLight }}>Focus: </span>{displayContent.keyTopics.filter(t => t?.trim()).join(' • ')}</p>
                )}

                {/* Technologies */}
                {displayContent.technologies?.length > 0 && (
                  <div className="space-y-2">
                    {displayContent.technologies.map((tech, i) => (
                      <div key={i}>
                        <span className="font-semibold" style={{ color: colors.accent }}>{tech.name}</span>
                        {tech.importance && <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: tech.importance === 'high' ? '#FEE2E2' : colors.bg, color: tech.importance === 'high' ? '#B91C1C' : colors.textMuted }}>{tech.importance}</span>}
                        {tech.questions?.map((q, j) => (
                          <div key={j} className="ml-3 mt-1 text-xs">
                            <span className="font-medium">{q.question}</span>
                            {q.answer && <span style={{ color: colors.textMuted }}> — {q.answer}</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Architecture Topics */}
                {displayContent.architectureTopics?.length > 0 && (
                  <p><span className="font-semibold" style={{ color: colors.textLight }}>Architecture: </span>{displayContent.architectureTopics.filter(t => t?.trim()).join(' • ')}</p>
                )}

                {/* Practice */}
                {displayContent.practiceRecommendations?.length > 0 && (
                  <p><span className="font-semibold" style={{ color: colors.textLight }}>Practice: </span>{displayContent.practiceRecommendations.filter(r => r?.trim()).join(' • ')}</p>
                )}

                {/* Questions to Ask */}
                {displayContent.questionsToAsk?.length > 0 && (
                  <p><span className="font-semibold" style={{ color: colors.textLight }}>Ask Them: </span>{displayContent.questionsToAsk.filter(q => q?.trim()).join(' • ')}</p>
                )}

                {/* Framework Tips */}
                {displayContent.frameworkTips?.trim() && (
                  <div className="px-3 py-2 rounded" style={{ background: colors.bg }}>
                    <span className="font-semibold" style={{ color: colors.accent }}>Framework: </span>
                    {displayContent.frameworkTips.trim()}
                  </div>
                )}

                {/* Key Themes */}
                {displayContent.keyThemes?.length > 0 && (
                  <p><span className="font-semibold" style={{ color: colors.textLight }}>Themes: </span>{displayContent.keyThemes.filter(t => t?.trim()).join(' • ')}</p>
                )}

                {/* Raw Content */}
                {displayContent.rawContent?.trim() && (
                  <p>{displayContent.rawContent.trim()}</p>
                )}

                {/* Abbreviations - compact 2 column */}
                {displayContent.abbreviations?.length > 0 && (
                  <div className="pt-3 mt-3 text-xs" style={{ borderTop: `1px solid ${colors.border}` }}>
                    <p className="font-semibold mb-2" style={{ color: colors.textLight }}>Terms</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {displayContent.abbreviations.map((item, i) => (
                        <p key={i}>
                          <span className="font-mono font-semibold" style={{ color: colors.accent }}>{item.abbr}</span>
                          <span style={{ color: colors.textMuted }}> — {item.full}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback */}
                {!displayContent.summary && !displayContent.questions && !displayContent.talkingPoints &&
                 !displayContent.pitch && !displayContent.pitchParagraphs && !displayContent.rawContent &&
                 !displayContent.technologies && !displayContent.keyTopics && !displayContent.keyThemes &&
                 !displayContent.questionsToAsk && !displayContent.tips && !displayContent.abbreviations &&
                 !displayContent.techStack && (
                  <pre className="text-xs overflow-x-auto" style={{ color: colors.textMuted }}>
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
