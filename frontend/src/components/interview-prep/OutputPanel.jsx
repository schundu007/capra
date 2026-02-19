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
                              onClick={() => handleCopy(q.answer || q.suggestedAnswer || q.approach, `q-${i}`)}
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
                          {/* Answer or Suggested Answer */}
                          {(q.answer || q.suggestedAnswer) && (
                            <p className="mt-1.5 text-gray-600 text-xs">{(q.answer || q.suggestedAnswer)?.trim()}</p>
                          )}
                          {/* Approach - for Coding/System Design */}
                          {q.approach && (
                            <div className="mt-1.5">
                              <span className="text-xs font-medium text-blue-700">Approach: </span>
                              <span className="text-gray-600 text-xs">{q.approach?.trim()}</span>
                            </div>
                          )}
                          {/* Key Considerations - for System Design */}
                          {q.keyConsiderations && q.keyConsiderations.length > 0 && (
                            <div className="mt-1.5">
                              <span className="text-xs font-medium text-indigo-700">Key Considerations: </span>
                              <span className="text-gray-600 text-xs">{q.keyConsiderations.join(', ')}</span>
                            </div>
                          )}
                          {/* STAR Format - for Behavioral */}
                          {(q.situation || q.task || q.action || q.result) && (
                            <div className="mt-2 space-y-1 pl-2 border-l-2 border-teal-300">
                              {q.situation && (
                                <p className="text-xs"><span className="font-semibold text-teal-700">S:</span> <span className="text-gray-600">{q.situation?.trim()}</span></p>
                              )}
                              {q.task && (
                                <p className="text-xs"><span className="font-semibold text-teal-700">T:</span> <span className="text-gray-600">{q.task?.trim()}</span></p>
                              )}
                              {q.action && (
                                <p className="text-xs"><span className="font-semibold text-teal-700">A:</span> <span className="text-gray-600">{q.action?.trim()}</span></p>
                              )}
                              {q.result && (
                                <p className="text-xs"><span className="font-semibold text-teal-700">R:</span> <span className="text-gray-600">{q.result?.trim()}</span></p>
                              )}
                            </div>
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

                {/* Elevator Pitch - multiple paragraphs */}
                {displayContent.pitchParagraphs && displayContent.pitchParagraphs.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 text-sm flex items-center justify-between">
                      <span>Your Elevator Pitch</span>
                      <button
                        onClick={() => handleCopy(displayContent.pitchParagraphs.join('\n\n'), 'pitch')}
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
                    <div className="space-y-3">
                      {displayContent.pitchParagraphs.filter(p => p?.trim()).map((paragraph, i) => (
                        <p key={i} className="text-blue-700 text-sm leading-relaxed">{paragraph.trim()}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback for old pitch format (single string) */}
                {displayContent.pitch && !displayContent.pitchParagraphs && displayContent.pitch.trim() && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 text-sm flex items-center justify-between">
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

                {/* Delivery Tips - for Pitch section */}
                {displayContent.tips && displayContent.tips.trim() && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-1 text-sm">Delivery Tips</h4>
                    <p className="text-amber-700 text-sm">{displayContent.tips.trim()}</p>
                  </div>
                )}

                {/* Tech Stack Table - for Pitch section (HR screening report) */}
                {displayContent.techStack && displayContent.techStack.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
                      Tech Stack Summary
                      <span className="text-xs font-normal text-gray-500">(For HR Discussion Report)</span>
                    </h4>
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Technology</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Category</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Experience</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Relevance to JD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayContent.techStack.map((tech, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2 font-semibold text-indigo-700">{tech.technology}</td>
                              <td className="px-3 py-2 text-gray-600">{tech.category}</td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                                  {tech.experience}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-700">{tech.relevance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Technologies - for Tech Stack section */}
                {displayContent.technologies && displayContent.technologies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Technologies</h4>
                    <div className="space-y-3">
                      {displayContent.technologies.map((tech, i) => (
                        <div key={i} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-purple-800 text-sm">{tech.name}</span>
                            {tech.importance && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                tech.importance === 'high' ? 'bg-red-100 text-red-700' :
                                tech.importance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {tech.importance}
                              </span>
                            )}
                          </div>
                          {tech.questions && tech.questions.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {tech.questions.map((q, j) => (
                                <div key={j} className="bg-white p-2 rounded border border-purple-100">
                                  <p className="font-medium text-gray-800 text-xs">{q.question}</p>
                                  {q.answer && (
                                    <p className="mt-1 text-gray-600 text-xs">{q.answer}</p>
                                  )}
                                  {q.followUps && q.followUps.length > 0 && (
                                    <div className="mt-1">
                                      <span className="text-xs text-purple-600">Follow-ups: </span>
                                      <span className="text-xs text-gray-500">{q.followUps.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Architecture Topics - for Tech Stack section */}
                {displayContent.architectureTopics && displayContent.architectureTopics.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Architecture Topics</h4>
                    <ul className="space-y-1">
                      {displayContent.architectureTopics.filter(t => t?.trim()).map((topic, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5 text-sm">•</span>
                          <span className="text-gray-700 text-sm">{topic?.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Topics - for Coding/System Design sections */}
                {displayContent.keyTopics && displayContent.keyTopics.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Topics</h4>
                    <ul className="space-y-1">
                      {displayContent.keyTopics.filter(t => t?.trim()).map((topic, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5 text-sm">•</span>
                          <span className="text-gray-700 text-sm">{topic?.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practice Recommendations - for Coding section */}
                {displayContent.practiceRecommendations && displayContent.practiceRecommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Practice Recommendations</h4>
                    <ul className="space-y-1">
                      {displayContent.practiceRecommendations.filter(r => r?.trim()).map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5 text-sm">•</span>
                          <span className="text-gray-700 text-sm">{rec?.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions to Ask - for Hiring Manager section */}
                {displayContent.questionsToAsk && displayContent.questionsToAsk.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Questions to Ask</h4>
                    <ul className="space-y-1">
                      {displayContent.questionsToAsk.filter(q => q?.trim()).map((question, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-500 mt-0.5 text-sm">•</span>
                          <span className="text-gray-700 text-sm">{question?.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Framework Tips - for System Design section */}
                {displayContent.frameworkTips && displayContent.frameworkTips.trim() && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-1 text-sm">Framework Tips</h4>
                    <p className="text-indigo-700 text-sm">{displayContent.frameworkTips.trim()}</p>
                  </div>
                )}

                {/* Key Themes - for Behavioral section */}
                {displayContent.keyThemes && displayContent.keyThemes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Themes</h4>
                    <ul className="space-y-1">
                      {displayContent.keyThemes.filter(t => t?.trim()).map((theme, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-teal-500 mt-0.5 text-sm">•</span>
                          <span className="text-gray-700 text-sm">{theme?.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Handle rawContent from AI when JSON parsing failed */}
                {displayContent.rawContent && displayContent.rawContent.trim() && (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {displayContent.rawContent.trim().replace(/\n{3,}/g, '\n\n')}
                  </div>
                )}

                {/* Abbreviations Table - displayed at the end of each section */}
                {displayContent.abbreviations && displayContent.abbreviations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Abbreviations & Terms</h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 w-1/4">Abbreviation</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Full Term</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayContent.abbreviations.map((item, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2 font-mono font-semibold text-indigo-600">{item.abbr}</td>
                              <td className="px-3 py-2 text-gray-700">{item.full}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Fallback for other unstructured content */}
                {!displayContent.summary && !displayContent.keyPoints && !displayContent.questions &&
                 !displayContent.talkingPoints && !displayContent.pitch && !displayContent.pitchParagraphs && !displayContent.rawContent &&
                 !displayContent.technologies && !displayContent.keyTopics && !displayContent.keyThemes &&
                 !displayContent.questionsToAsk && !displayContent.tips && !displayContent.abbreviations && (
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
