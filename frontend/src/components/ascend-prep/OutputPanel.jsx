import { useState, useCallback } from 'react';

// Color palette using explicit dark text for light backgrounds
const colors = {
  bg: 'var(--content-bg)',
  paper: 'var(--content-bg-secondary)',
  accent: 'var(--accent-green)',
  accentLight: 'var(--accent-green-bg)',
  text: '#1a1a1a',  // Dark text for light backgrounds
  textMuted: '#666666',  // Medium gray for secondary text
  textLight: '#888888',  // Light gray for captions
  border: 'var(--border-default)',
};

export default function OutputPanel({ section, content, streamingContent, isGenerating, onRegenerate, onGenerate, hasInputs }) {
  const [copied, setCopied] = useState(false);
  const [failedDiagrams, setFailedDiagrams] = useState({});

  // Handle diagram image load error - fall back to ASCII
  const handleDiagramError = useCallback((questionIndex) => {
    setFailedDiagrams(prev => ({ ...prev, [questionIndex]: true }));
  }, []);

  const handleCopy = async () => {
    try {
      let text = typeof content === 'string' ? content : content?.rawContent || JSON.stringify(content, null, 2);
      // Clean up: trim and remove excessive newlines
      text = text.trim().replace(/\n{3,}/g, '\n\n');
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
          <div className="rounded-lg p-5" style={{ background: colors.paper, border: `1px solid ${colors.border}` }}>
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

                {/* Pitch Sections with Bullet Points */}
                {displayContent.pitchSections?.length > 0 && (
                  <div className="space-y-4">
                    {displayContent.pitchSections.map((section, i) => (
                      <div key={i} className="p-3 rounded-lg" style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', border: `1px solid ${colors.border}` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm" style={{ color: '#1e40af' }}>{section.title}</span>
                          {section.duration && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: colors.accentLight, color: colors.accent }}>{section.duration}</span>
                          )}
                        </div>
                        {section.context && (
                          <p className="text-xs mb-2 italic" style={{ color: colors.textMuted }}>{section.context}</p>
                        )}
                        {section.bullets?.length > 0 && (
                          <ul className="space-y-1.5">
                            {section.bullets.map((bullet, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm">
                                <span style={{ color: colors.accent }}>•</span>
                                <span style={{ color: colors.text }}>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Legacy: Pitch Paragraphs fallback */}
                {displayContent.pitchParagraphs?.length > 0 && !displayContent.pitchSections && (
                  <div className="pl-3 space-y-3" style={{ borderLeft: `3px solid ${colors.accent}` }}>
                    {displayContent.pitchParagraphs.filter(p => p?.trim()).map((p, i) => (
                      <p key={i}>{p.trim()}</p>
                    ))}
                  </div>
                )}

                {/* Old pitch fallback */}
                {displayContent.pitch && !displayContent.pitchParagraphs && !displayContent.pitchSections && (
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

                {/* Questions - handles both simple and complex (coding/system-design) formats */}
                {displayContent.questions?.length > 0 && (
                  <div className="space-y-6">
                    {displayContent.questions.filter(q => q.question?.trim() || q.title?.trim()).map((q, i) => (
                      <div key={i} className="pb-4" style={{ borderBottom: i < displayContent.questions.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                        {/* Question/Title */}
                        <p className="font-semibold mb-1 text-base" style={{ color: '#1e40af' }}>
                          {i + 1}. {(q.title || q.question).trim()}
                        </p>

                        {/* Difficulty & Frequency */}
                        {(q.difficulty || q.frequency) && (
                          <p className="text-xs mb-2" style={{ color: colors.textMuted }}>
                            {q.difficulty && <span className="px-1.5 py-0.5 rounded mr-2" style={{ background: q.difficulty === 'Hard' ? '#FEE2E2' : q.difficulty === 'Medium' ? '#FEF3C7' : '#D1FAE5' }}>{q.difficulty}</span>}
                            {q.frequency}
                          </p>
                        )}

                        {/* Problem Statement */}
                        {q.problemStatement && (
                          <p className="mb-3 p-2 rounded" style={{ background: '#f8fafc', color: colors.text }}>{q.problemStatement}</p>
                        )}

                        {/* Examples */}
                        {q.examples?.length > 0 && (
                          <div className="mb-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: colors.textLight }}>Examples</p>
                            {q.examples.map((ex, j) => (
                              <div key={j} className="text-xs font-mono p-2 rounded mb-1" style={{ background: '#f1f5f9' }}>
                                <span style={{ color: '#0369a1' }}>Input:</span> {ex.input}<br/>
                                <span style={{ color: '#047857' }}>Output:</span> {ex.output}
                                {ex.explanation && <><br/><span style={{ color: colors.textMuted }}>→ {ex.explanation}</span></>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Approaches (for coding) */}
                        {q.approaches?.length > 0 && (
                          <div className="space-y-4">
                            {q.approaches.map((approach, j) => (
                              <div key={j} className="pl-3" style={{ borderLeft: '3px solid #10b981' }}>
                                <p className="font-semibold" style={{ color: '#047857' }}>{approach.name}</p>
                                <p className="text-xs mb-2" style={{ color: colors.textMuted }}>
                                  Time: {approach.timeComplexity} | Space: {approach.spaceComplexity}
                                </p>
                                {approach.description && <p className="mb-2 text-sm">{approach.description}</p>}

                                {/* Code */}
                                {approach.code && (
                                  <pre className="text-xs p-3 rounded overflow-x-auto mb-2" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: 'Monaco, monospace' }}>
                                    {approach.code.replace(/\\n/g, '\n')}
                                  </pre>
                                )}

                                {/* Line by Line */}
                                {approach.lineByLine?.length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: colors.accent }}>Line-by-Line Explanation</p>
                                    <div className="space-y-1">
                                      {approach.lineByLine.map((line, k) => (
                                        <div key={k} className="text-xs">
                                          <code className="font-mono px-1 rounded" style={{ background: '#e2e8f0', color: '#1e40af' }}>{line.line}</code>
                                          <p className="ml-2 mt-0.5" style={{ color: colors.textMuted }}>→ {line.explanation}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Edge Cases */}
                        {q.edgeCases?.length > 0 && (
                          <div className="mt-3 p-3 rounded" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#B91C1C' }}>⚠ Edge Cases</p>
                            {q.edgeCases.map((edge, j) => (
                              <div key={j} className="text-xs mb-2">
                                <span className="font-semibold">{edge.case}:</span> {edge.explanation}
                                <div className="font-mono mt-0.5 pl-2" style={{ color: '#6B7280' }}>
                                  Input: {edge.input} → Output: {edge.expectedOutput}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Common Mistakes */}
                        {q.commonMistakes?.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold text-xs" style={{ color: '#DC2626' }}>Common Mistakes:</p>
                            {q.commonMistakes.map((m, j) => (
                              <p key={j} className="text-xs ml-2" style={{ color: colors.textMuted }}>• {m}</p>
                            ))}
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {q.followUpQuestions?.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold text-xs" style={{ color: colors.accent }}>Follow-ups:</p>
                            {q.followUpQuestions.map((f, j) => (
                              <p key={j} className="text-xs ml-2" style={{ color: colors.textMuted }}>• {f}</p>
                            ))}
                          </div>
                        )}

                        {/* Requirements (System Design) */}
                        {q.requirements && (
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            {q.requirements.functional?.length > 0 && (
                              <div>
                                <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: '#047857' }}>Functional</p>
                                {q.requirements.functional.map((r, j) => (
                                  <p key={j} className="text-xs" style={{ color: colors.text }}>✓ {r}</p>
                                ))}
                              </div>
                            )}
                            {q.requirements.nonFunctional?.length > 0 && (
                              <div>
                                <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: '#7C3AED' }}>Non-Functional</p>
                                {q.requirements.nonFunctional.map((r, j) => (
                                  <p key={j} className="text-xs" style={{ color: colors.text }}>✓ {r}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Capacity Estimation */}
                        {q.capacityEstimation && (
                          <div className="mt-3 p-3 rounded" style={{ background: '#F0FDF4' }}>
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#047857' }}>Capacity Estimation</p>
                            {q.capacityEstimation.calculations?.map((calc, j) => (
                              <p key={j} className="text-xs font-mono">{calc.metric}: {calc.result}</p>
                            ))}
                          </div>
                        )}

                        {/* Architecture Diagram - Image or Description */}
                        {(q.diagramUrl || q.architecture?.diagramDescription || q.architecture?.asciiDiagram) && (
                          <div className="mt-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.accent }}>Architecture Diagram</p>
                            {q.diagramUrl && !failedDiagrams[i] ? (
                              <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                                <img
                                  src={q.diagramUrl}
                                  alt={`Architecture diagram for ${q.title || 'system design'}`}
                                  className="w-full"
                                  style={{ background: '#ffffff' }}
                                  onError={() => handleDiagramError(i)}
                                />
                                {q.diagramDescription && (
                                  <p className="text-xs p-2" style={{ background: '#f8fafc', color: colors.textMuted }}>{q.diagramDescription}</p>
                                )}
                              </div>
                            ) : q.architecture?.asciiDiagram ? (
                              <pre className="text-xs p-3 rounded overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: 'Monaco, monospace', lineHeight: '1.3' }}>
                                {q.architecture.asciiDiagram.replace(/\\n/g, '\n')}
                              </pre>
                            ) : q.architecture?.diagramDescription ? (
                              <div className="p-3 rounded" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                <p className="text-sm italic" style={{ color: '#1D4ED8' }}>
                                  📊 {q.architecture.diagramDescription}
                                </p>
                                {failedDiagrams[i] && (
                                  <p className="text-xs mt-1" style={{ color: '#DC2626' }}>(Diagram expired - regenerate section to create new diagram)</p>
                                )}
                              </div>
                            ) : failedDiagrams[i] ? (
                              <div className="p-3 rounded" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                <p className="text-xs" style={{ color: '#DC2626' }}>Diagram expired - regenerate this section to create a new diagram</p>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Components */}
                        {q.architecture?.components?.length > 0 && (
                          <div className="mt-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.accent }}>Components</p>
                            <div className="space-y-2">
                              {q.architecture.components.map((comp, j) => (
                                <div key={j} className="text-xs p-2 rounded" style={{ background: '#f8fafc' }}>
                                  <span className="font-semibold" style={{ color: '#1e40af' }}>{comp.name}</span>
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: '#E0E7FF', color: '#3730A3' }}>{comp.technology}</span>
                                  <p className="mt-1" style={{ color: colors.textMuted }}>{comp.responsibility}</p>
                                  {comp.whyThisChoice && <p className="mt-0.5 italic" style={{ color: colors.textLight }}>Why: {comp.whyThisChoice}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trade-offs */}
                        {q.tradeOffs?.length > 0 && (
                          <div className="mt-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#DC2626' }}>Trade-offs</p>
                            {q.tradeOffs.map((t, j) => (
                              <div key={j} className="text-xs mb-2 pl-2" style={{ borderLeft: '2px solid #FECACA' }}>
                                <p><b>Decision:</b> {t.decision}</p>
                                <p><b>Chose:</b> {t.chose} — {t.reason}</p>
                                {t.alternative && <p style={{ color: colors.textMuted }}>Alt: {t.alternative}</p>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Simple answer/approach for basic questions */}
                        {(q.answer || q.suggestedAnswer) && !q.approaches && (
                          <p className="mt-1" style={{ color: colors.textMuted }}>{(q.answer || q.suggestedAnswer).trim()}</p>
                        )}
                        {q.approach && !q.approaches && (
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

                {/* Key Topics - handles both string array and object array */}
                {displayContent.keyTopics?.length > 0 && (
                  <div className="mb-3">
                    <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.textLight }}>Key Topics to Focus On</p>
                    {typeof displayContent.keyTopics[0] === 'string' ? (
                      <p>{displayContent.keyTopics.filter(t => t?.trim()).join(' • ')}</p>
                    ) : (
                      <div className="space-y-2">
                        {displayContent.keyTopics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="font-semibold" style={{ color: colors.accent }}>{topic.topic}</span>
                            {topic.frequency && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: topic.frequency === 'Very High' ? '#FEE2E2' : '#E0E7FF', color: topic.frequency === 'Very High' ? '#B91C1C' : '#3730A3' }}>{topic.frequency}</span>}
                            {topic.whyImportant && <span className="text-xs" style={{ color: colors.textMuted }}>— {topic.whyImportant}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Technologies (TechStack section) */}
                {displayContent.technologies?.length > 0 && (
                  <div className="space-y-6">
                    {displayContent.technologies.map((tech, i) => (
                      <div key={i} className="p-4 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-base" style={{ color: '#1e40af' }}>{tech.name}</span>
                          {tech.importance && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              background: tech.importance === 'high' ? '#FEE2E2' : tech.importance === 'medium' ? '#FEF3C7' : '#E0E7FF',
                              color: tech.importance === 'high' ? '#B91C1C' : tech.importance === 'medium' ? '#92400E' : '#3730A3'
                            }}>{tech.importance}</span>
                          )}
                        </div>
                        {tech.whyImportant && <p className="text-sm mb-3" style={{ color: colors.textMuted }}>{tech.whyImportant}</p>}

                        {/* Concepts to Know */}
                        {tech.conceptsToKnow?.length > 0 && (
                          <div className="mb-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.accent }}>Core Concepts</p>
                            {tech.conceptsToKnow.map((c, j) => (
                              <div key={j} className="mb-2 pl-2" style={{ borderLeft: '2px solid #10b981' }}>
                                <p className="font-semibold text-sm">{c.concept}</p>
                                <p className="text-xs" style={{ color: colors.textMuted }}>{c.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Questions */}
                        {tech.questions?.length > 0 && (
                          <div className="mb-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#DC2626' }}>Interview Questions</p>
                            {tech.questions.map((q, j) => (
                              <div key={j} className="mb-3 p-3 rounded" style={{ background: '#ffffff' }}>
                                <p className="font-semibold text-sm mb-1">{q.question}</p>
                                {q.difficulty && <span className="text-xs px-1.5 py-0.5 rounded mr-2" style={{ background: '#E0E7FF', color: '#3730A3' }}>{q.difficulty}</span>}
                                {q.answer && <p className="text-xs mt-2" style={{ color: colors.text }}>{q.answer}</p>}
                                {q.codeExample && (
                                  <pre className="text-xs p-2 rounded mt-2 overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: 'Monaco, monospace' }}>
                                    {q.codeExample.replace(/\\n/g, '\n')}
                                  </pre>
                                )}
                                {q.followUps?.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold" style={{ color: colors.accent }}>Follow-ups:</p>
                                    {q.followUps.map((f, k) => <p key={k} className="text-xs ml-2" style={{ color: colors.textMuted }}>• {f}</p>)}
                                  </div>
                                )}
                                {q.commonMistakes?.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>Avoid:</p>
                                    {q.commonMistakes.map((m, k) => <p key={k} className="text-xs ml-2" style={{ color: colors.textMuted }}>• {m}</p>)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Best Practices */}
                        {tech.bestPractices?.length > 0 && (
                          <div className="mb-3">
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#047857' }}>Best Practices</p>
                            {tech.bestPractices.map((bp, j) => (
                              <div key={j} className="text-xs mb-2">
                                <span className="font-semibold">{bp.practice}</span>
                                {bp.when && <span style={{ color: colors.textMuted }}> — {bp.when}</span>}
                                {bp.codeExample && (
                                  <pre className="text-xs p-2 rounded mt-1 overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: 'Monaco, monospace' }}>
                                    {bp.codeExample.replace(/\\n/g, '\n')}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Anti-patterns */}
                        {tech.antiPatterns?.length > 0 && (
                          <div className="p-2 rounded" style={{ background: '#FEF2F2' }}>
                            <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#B91C1C' }}>Anti-Patterns to Avoid</p>
                            {tech.antiPatterns.map((ap, j) => (
                              <div key={j} className="text-xs mb-2">
                                <span className="font-semibold">{ap.pattern}</span>
                                <p style={{ color: colors.textMuted }}>Problem: {ap.problem}</p>
                                <p style={{ color: '#047857' }}>Solution: {ap.solution}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Performance Topics */}
                        {tech.performanceTopics?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs"><span className="font-semibold" style={{ color: colors.textLight }}>Performance: </span>{tech.performanceTopics.join(' • ')}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Company Context/Insights */}
                {(displayContent.companyContext || displayContent.companyInsights) && (
                  <div className="mb-3 p-3 rounded" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <p className="font-semibold text-xs uppercase tracking-wide mb-1" style={{ color: '#1D4ED8' }}>Company Insights</p>
                    <p className="text-sm">{displayContent.companyContext || displayContent.companyInsights}</p>
                  </div>
                )}

                {/* Architecture Topics - handles both string array and object array */}
                {displayContent.architectureTopics?.length > 0 && (
                  <div className="mb-3">
                    <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.textLight }}>Architecture Topics</p>
                    {typeof displayContent.architectureTopics[0] === 'string' ? (
                      <p>{displayContent.architectureTopics.filter(t => t?.trim()).join(' • ')}</p>
                    ) : (
                      <div className="space-y-2">
                        {displayContent.architectureTopics.map((topic, i) => (
                          <div key={i} className="p-2 rounded" style={{ background: '#f8fafc' }}>
                            <span className="font-semibold" style={{ color: colors.accent }}>{topic.topic}</span>
                            {topic.relevance && <p className="text-xs" style={{ color: colors.textMuted }}>{topic.relevance}</p>}
                            {topic.keyPoints?.length > 0 && (
                              <p className="text-xs mt-1">{topic.keyPoints.join(' • ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* System Integrations (TechStack section) */}
                {displayContent.systemIntegrations?.length > 0 && (
                  <div className="mb-3">
                    <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.textLight }}>System Integrations</p>
                    <div className="space-y-2">
                      {displayContent.systemIntegrations.map((int, i) => (
                        <div key={i} className="p-2 rounded" style={{ background: '#f8fafc' }}>
                          <span className="font-semibold" style={{ color: colors.accent }}>{int.integration}</span>
                          {int.patterns?.length > 0 && (
                            <p className="text-xs mt-1">{int.patterns.join(' • ')}</p>
                          )}
                          {int.codeExample && (
                            <pre className="text-xs p-2 rounded mt-1 overflow-x-auto" style={{ background: '#1e293b', color: '#e2e8f0', fontFamily: 'Monaco, monospace' }}>
                              {int.codeExample.replace(/\\n/g, '\n')}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Recommendations - handles both string array and object array */}
                {displayContent.practiceRecommendations?.length > 0 && (
                  <div className="mb-3">
                    <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: colors.textLight }}>Practice Recommendations</p>
                    {typeof displayContent.practiceRecommendations[0] === 'string' ? (
                      <p>{displayContent.practiceRecommendations.filter(r => r?.trim()).join(' • ')}</p>
                    ) : (
                      <div className="space-y-2">
                        {displayContent.practiceRecommendations.map((rec, i) => (
                          <div key={i} className="p-2 rounded" style={{ background: '#F0FDF4' }}>
                            <span className="font-semibold" style={{ color: '#047857' }}>{rec.platform}</span>
                            {rec.problems?.length > 0 && (
                              <p className="text-xs mt-1">{rec.problems.join(', ')}</p>
                            )}
                            {rec.reason && <p className="text-xs italic" style={{ color: colors.textMuted }}>{rec.reason}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Tips */}
                {displayContent.interviewTips?.length > 0 && (
                  <div className="p-3 rounded" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#047857' }}>Interview Tips</p>
                    {displayContent.interviewTips.map((tip, i) => (
                      <p key={i} className="text-sm">• {tip}</p>
                    ))}
                  </div>
                )}

                {/* General Tips (system design) */}
                {displayContent.generalTips?.length > 0 && (
                  <div className="p-3 rounded" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#047857' }}>Tips</p>
                    {displayContent.generalTips.map((tip, i) => (
                      <p key={i} className="text-sm">• {tip}</p>
                    ))}
                  </div>
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
                 !displayContent.pitch && !displayContent.pitchParagraphs && !displayContent.pitchSections && !displayContent.rawContent &&
                 !displayContent.technologies && !displayContent.keyTopics && !displayContent.keyThemes &&
                 !displayContent.questionsToAsk && !displayContent.tips && !displayContent.abbreviations &&
                 !displayContent.techStack && !displayContent.companyTechContext && !displayContent.systemIntegrations && (
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
