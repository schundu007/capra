import { useState } from 'react';

// Claude-inspired warm color palette
const colors = {
  bg: '#FAF9F7',
  paper: '#FFFFFF',
  accent: '#D4714C',
  accentLight: '#FDF4F0',
  accentDark: '#B85A3B',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  textLight: '#8B8B8B',
  border: '#E8E4DF',
  borderLight: '#F0EDE8',
};

export default function OutputPanel({ section, content, streamingContent, isGenerating, onRegenerate, onGenerate, hasInputs }) {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, field) => {
    try {
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

  const displayContent = isGenerating ? streamingContent : content;

  // Copy button component
  const CopyBtn = ({ text, field, small = false }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className={`rounded transition-all ${small ? 'p-1 hover:bg-black/5' : 'px-2.5 py-1 hover:bg-black/5'}`}
      style={{ color: copiedField === field ? colors.accent : colors.textLight }}
    >
      {copiedField === field ? (
        <svg className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="h-full flex flex-col" style={{ background: colors.bg }}>
      {/* Minimal Header */}
      <div className="px-8 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold" style={{ color: colors.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {section?.name}
          </h2>
          {isGenerating && (
            <div className="flex items-center gap-2" style={{ color: colors.accent }}>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Generating...</span>
            </div>
          )}
        </div>
        {content && !isGenerating && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCopy(
                typeof content === 'string' ? content : content?.rawContent || JSON.stringify(content, null, 2),
                'all'
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-black/5"
              style={{ color: colors.textMuted }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copiedField === 'all' ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-black/5"
              style={{ color: colors.accent }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>
        )}
      </div>

      {/* A4-style Content Area */}
      <div className="flex-1 overflow-y-auto py-8 px-6">
        <div
          className="mx-auto"
          style={{
            maxWidth: '680px', // A4-ish readable width
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          {!displayContent && !isGenerating ? (
            <div className="py-20 text-center">
              <p className="text-sm mb-4" style={{ color: colors.textLight }}>{section?.description}</p>
              {hasInputs ? (
                <button
                  onClick={onGenerate}
                  className="px-5 py-2 rounded text-sm font-medium text-white transition-colors"
                  style={{ background: colors.accent }}
                >
                  Generate
                </button>
              ) : (
                <p className="text-xs" style={{ color: colors.textLight }}>Add Job Description and Resume first</p>
              )}
            </div>
          ) : (
            <div
              className="rounded-lg shadow-sm p-8"
              style={{
                background: colors.paper,
                border: `1px solid ${colors.borderLight}`,
              }}
            >
              {typeof displayContent === 'string' ? (
                <div className="whitespace-pre-wrap leading-relaxed text-sm" style={{ color: colors.text }}>
                  {displayContent}
                  {isGenerating && <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: colors.accent }} />}
                </div>
              ) : displayContent && typeof displayContent === 'object' ? (
                <div className="space-y-6">
                  {/* Summary */}
                  {displayContent.summary?.trim() && (
                    <div className="pb-5" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{displayContent.summary.trim()}</p>
                    </div>
                  )}

                  {/* Elevator Pitch Paragraphs */}
                  {displayContent.pitchParagraphs?.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textLight }}>Your Pitch</h3>
                        <CopyBtn text={displayContent.pitchParagraphs.join('\n\n')} field="pitch" small />
                      </div>
                      <div className="space-y-4 pl-4" style={{ borderLeft: `2px solid ${colors.accent}` }}>
                        {displayContent.pitchParagraphs.filter(p => p?.trim()).map((p, i) => (
                          <p key={i} className="text-sm leading-relaxed" style={{ color: colors.text }}>{p.trim()}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Old pitch format fallback */}
                  {displayContent.pitch && !displayContent.pitchParagraphs && displayContent.pitch.trim() && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textLight }}>Your Pitch</h3>
                        <CopyBtn text={displayContent.pitch.trim()} field="pitch" small />
                      </div>
                      <div className="pl-4" style={{ borderLeft: `2px solid ${colors.accent}` }}>
                        <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{displayContent.pitch.trim()}</p>
                      </div>
                    </div>
                  )}

                  {/* Talking Points */}
                  {displayContent.talkingPoints?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>Key Points</h3>
                      <ul className="space-y-2">
                        {displayContent.talkingPoints.filter(p => p?.trim()).map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm" style={{ color: colors.text }}>
                            <span className="font-medium" style={{ color: colors.accent }}>{i + 1}.</span>
                            <span className="leading-relaxed">{point.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Delivery Tips */}
                  {displayContent.tips?.trim() && (
                    <div className="p-4 rounded" style={{ background: colors.accentLight }}>
                      <p className="text-xs font-medium mb-1" style={{ color: colors.accent }}>Delivery Tip</p>
                      <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{displayContent.tips.trim()}</p>
                    </div>
                  )}

                  {/* Tech Stack Table */}
                  {displayContent.techStack?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>
                        Tech Stack <span className="font-normal">(HR Report)</span>
                      </h3>
                      <div className="overflow-hidden rounded" style={{ border: `1px solid ${colors.border}` }}>
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ background: colors.bg }}>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: colors.textMuted }}>Technology</th>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: colors.textMuted }}>Category</th>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: colors.textMuted }}>Experience</th>
                              <th className="px-3 py-2 text-left font-medium" style={{ color: colors.textMuted }}>Relevance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayContent.techStack.map((tech, i) => (
                              <tr key={i} style={{ borderTop: `1px solid ${colors.borderLight}` }}>
                                <td className="px-3 py-2 font-medium" style={{ color: colors.accent }}>{tech.technology}</td>
                                <td className="px-3 py-2" style={{ color: colors.textMuted }}>{tech.category}</td>
                                <td className="px-3 py-2" style={{ color: colors.text }}>{tech.experience}</td>
                                <td className="px-3 py-2" style={{ color: colors.text }}>{tech.relevance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  {displayContent.questions?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textLight }}>Questions</h3>
                      <div className="space-y-4">
                        {displayContent.questions.filter(q => q.question?.trim()).map((q, i) => (
                          <div key={i} className="pb-4" style={{ borderBottom: i < displayContent.questions.length - 1 ? `1px solid ${colors.borderLight}` : 'none' }}>
                            <div className="flex justify-between gap-2 mb-2">
                              <p className="text-sm font-medium leading-snug" style={{ color: colors.text }}>{q.question.trim()}</p>
                              <CopyBtn text={q.answer || q.suggestedAnswer || q.approach || ''} field={`q-${i}`} small />
                            </div>

                            {(q.answer || q.suggestedAnswer) && (
                              <p className="text-sm leading-relaxed mb-2" style={{ color: colors.textMuted }}>{(q.answer || q.suggestedAnswer).trim()}</p>
                            )}

                            {q.approach && (
                              <div className="mb-2">
                                <span className="text-xs font-medium" style={{ color: colors.accent }}>Approach: </span>
                                <span className="text-sm" style={{ color: colors.textMuted }}>{q.approach.trim()}</span>
                              </div>
                            )}

                            {q.keyConsiderations?.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs font-medium" style={{ color: colors.accent }}>Consider: </span>
                                <span className="text-sm" style={{ color: colors.textMuted }}>{q.keyConsiderations.join(' | ')}</span>
                              </div>
                            )}

                            {/* STAR Format */}
                            {(q.situation || q.task || q.action || q.result) && (
                              <div className="mt-3 pl-3 space-y-1.5" style={{ borderLeft: `2px solid ${colors.border}` }}>
                                {q.situation && <p className="text-xs"><span className="font-semibold" style={{ color: colors.accent }}>S</span> <span style={{ color: colors.textMuted }}>{q.situation.trim()}</span></p>}
                                {q.task && <p className="text-xs"><span className="font-semibold" style={{ color: colors.accent }}>T</span> <span style={{ color: colors.textMuted }}>{q.task.trim()}</span></p>}
                                {q.action && <p className="text-xs"><span className="font-semibold" style={{ color: colors.accent }}>A</span> <span style={{ color: colors.textMuted }}>{q.action.trim()}</span></p>}
                                {q.result && <p className="text-xs"><span className="font-semibold" style={{ color: colors.accent }}>R</span> <span style={{ color: colors.textMuted }}>{q.result.trim()}</span></p>}
                              </div>
                            )}

                            {q.tips && (
                              <p className="mt-2 text-xs italic" style={{ color: colors.accent }}>{q.tips.trim()}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Topics */}
                  {displayContent.keyTopics?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>Focus Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {displayContent.keyTopics.filter(t => t?.trim()).map((topic, i) => (
                          <span key={i} className="px-2.5 py-1 rounded text-xs" style={{ background: colors.bg, color: colors.text }}>{topic.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies (Tech Stack section) */}
                  {displayContent.technologies?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: colors.textLight }}>Technologies</h3>
                      <div className="space-y-4">
                        {displayContent.technologies.map((tech, i) => (
                          <div key={i} className="pb-4" style={{ borderBottom: i < displayContent.technologies.length - 1 ? `1px solid ${colors.borderLight}` : 'none' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium" style={{ color: colors.text }}>{tech.name}</span>
                              {tech.importance && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                                  background: tech.importance === 'high' ? '#FEE2E2' : tech.importance === 'medium' ? '#FEF3C7' : colors.bg,
                                  color: tech.importance === 'high' ? '#B91C1C' : tech.importance === 'medium' ? '#B45309' : colors.textMuted
                                }}>
                                  {tech.importance}
                                </span>
                              )}
                            </div>
                            {tech.questions?.map((q, j) => (
                              <div key={j} className="mt-2 pl-3" style={{ borderLeft: `1px solid ${colors.border}` }}>
                                <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>{q.question}</p>
                                {q.answer && <p className="text-xs" style={{ color: colors.text }}>{q.answer}</p>}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Architecture Topics */}
                  {displayContent.architectureTopics?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>Architecture</h3>
                      <ul className="space-y-1.5">
                        {displayContent.architectureTopics.filter(t => t?.trim()).map((topic, i) => (
                          <li key={i} className="text-sm flex gap-2" style={{ color: colors.text }}>
                            <span style={{ color: colors.accent }}>-</span>
                            {topic.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practice Recommendations */}
                  {displayContent.practiceRecommendations?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>Practice</h3>
                      <ul className="space-y-1.5">
                        {displayContent.practiceRecommendations.filter(r => r?.trim()).map((rec, i) => (
                          <li key={i} className="text-sm flex gap-2" style={{ color: colors.text }}>
                            <span style={{ color: colors.accent }}>-</span>
                            {rec.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Questions to Ask */}
                  {displayContent.questionsToAsk?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>Ask Them</h3>
                      <ul className="space-y-1.5">
                        {displayContent.questionsToAsk.filter(q => q?.trim()).map((q, i) => (
                          <li key={i} className="text-sm flex gap-2" style={{ color: colors.text }}>
                            <span style={{ color: colors.accent }}>-</span>
                            {q.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Framework Tips */}
                  {displayContent.frameworkTips?.trim() && (
                    <div className="p-4 rounded" style={{ background: colors.bg }}>
                      <p className="text-xs font-medium mb-1" style={{ color: colors.accent }}>Framework</p>
                      <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{displayContent.frameworkTips.trim()}</p>
                    </div>
                  )}

                  {/* Key Themes */}
                  {displayContent.keyThemes?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {displayContent.keyThemes.filter(t => t?.trim()).map((theme, i) => (
                          <span key={i} className="px-2.5 py-1 rounded text-xs" style={{ background: colors.bg, color: colors.text }}>{theme.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Content */}
                  {displayContent.rawContent?.trim() && (
                    <div className="text-sm leading-relaxed" style={{ color: colors.text }}>
                      {displayContent.rawContent.trim()}
                    </div>
                  )}

                  {/* Abbreviations */}
                  {displayContent.abbreviations?.length > 0 && (
                    <div className="pt-5 mt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>Terms</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {displayContent.abbreviations.map((item, i) => (
                          <div key={i} className="text-xs flex gap-2">
                            <span className="font-mono font-medium" style={{ color: colors.accent }}>{item.abbr}</span>
                            <span style={{ color: colors.textMuted }}>{item.full}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback */}
                  {!displayContent.summary && !displayContent.keyPoints && !displayContent.questions &&
                   !displayContent.talkingPoints && !displayContent.pitch && !displayContent.pitchParagraphs &&
                   !displayContent.rawContent && !displayContent.technologies && !displayContent.keyTopics &&
                   !displayContent.keyThemes && !displayContent.questionsToAsk && !displayContent.tips &&
                   !displayContent.abbreviations && !displayContent.techStack && (
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
    </div>
  );
}
