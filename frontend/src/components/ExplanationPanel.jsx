import { useState, useEffect, useRef } from 'react';

// Format text with basic markdown-like styling (light theme)
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
            <pre key={i} className="p-1.5 rounded text-[11px] font-mono overflow-x-auto bg-gray-100 text-gray-700">
              {code}
            </pre>
          );
        }

        // Bullet list
        if (para.match(/^[\s]*[-•*]\s/m)) {
          const items = para.split(/\n/).filter(line => line.trim());
          return (
            <ul key={i} className="space-y-0.5 ml-3 list-disc text-gray-800">
              {items.map((item, j) => (
                <li key={j} className="text-[15px] leading-snug font-medium">
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
            <ol key={i} className="space-y-0.5 ml-3 list-decimal text-gray-800">
              {items.map((item, j) => (
                <li key={j} className="text-[15px] leading-snug font-medium">
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
          .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong class="font-semibold text-gray-900">$1$2</strong>')
          .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-[11px] text-gray-700">$1</code>')
          .replace(/\*(.+?)\*|_(.+?)_/g, '<em>$1$2</em>');

        return (
          <p
            key={i}
            className="text-[15px] leading-relaxed font-medium text-gray-700"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
}

export default function ExplanationPanel({ explanations, highlightedLine, pitch, systemDesign, isStreaming, onExpandSystemDesign, canExpandSystemDesign, onFollowUpQuestion, isProcessingFollowUp }) {
  const hasSystemDesign = systemDesign && systemDesign.included;

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState(null);
  const [qaHistory, setQaHistory] = useState([]);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + ' ' + final);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
          try {
            recognitionRef.current.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmitQuestion = async () => {
    const question = transcript.trim();
    if (!question || !onFollowUpQuestion || isProcessingFollowUp) return;

    // Stop listening while processing
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    try {
      const result = await onFollowUpQuestion(question);
      if (result) {
        setFollowUpAnswer(result.answer);
        setQaHistory(prev => [...prev, { question, answer: result.answer }]);
        setTranscript('');
      }
    } catch (err) {
      console.error('Follow-up question failed:', err);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  // Empty state
  if ((!explanations || explanations.length === 0) && !pitch && !hasSystemDesign && !isStreaming) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-gray-50/50">
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-200 flex-shrink-0">
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-[10px] font-medium text-gray-400">Explanation</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <svg className="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-[10px] text-gray-400">Solve a problem to see explanations</p>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming && !pitch && (!explanations || explanations.length === 0)) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-white">
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-200 flex-shrink-0">
          <div className="w-1 h-1 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-semibold text-gray-800">Explanation</span>
          <div className="flex gap-0.5 ml-1.5">
            <span className="w-0.5 h-0.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-0.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-0.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }} />
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
        <div className="w-1 h-1 rounded-full bg-[#10b981]" />
        <span className="text-[10px] font-semibold text-gray-800">Explanation</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2 space-y-2">
        {/* Solution Pitch */}
        {pitch && (
          <div className="p-3 rounded-lg bg-[#10b981]/5 border-l-2 border-[#10b981]">
            <span className="text-[14px] font-bold uppercase tracking-wide mb-2 block text-[#10b981]">
              Approach
            </span>
            <FormattedText text={pitch} />
          </div>
        )}

        {/* Interviewer Q&A Section - Only shown for system design */}
        {hasSystemDesign && onFollowUpQuestion && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold uppercase tracking-wide text-blue-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Interviewer Q&A
              </span>
              <button
                onClick={toggleListening}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isListening ? (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                    Listening...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                    Start Listening
                  </>
                )}
              </button>
            </div>

            {/* Transcript Display */}
            <div className="mb-3">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Interviewer's Question
              </label>
              <div className="relative">
                <textarea
                  value={transcript + interimTranscript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={isListening ? "Listening to interviewer..." : "Click 'Start Listening' or type the question..."}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
                  rows={2}
                  disabled={isProcessingFollowUp}
                />
                {interimTranscript && (
                  <span className="absolute bottom-2 right-2 text-[9px] text-gray-400">
                    (listening...)
                  </span>
                )}
              </div>
              {transcript && (
                <button
                  onClick={clearTranscript}
                  className="mt-1 text-[9px] text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitQuestion}
              disabled={isProcessingFollowUp || !transcript.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-medium rounded-lg transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isProcessingFollowUp ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Answer...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Answer Question
                </>
              )}
            </button>

            {/* Latest Answer */}
            {followUpAnswer && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <label className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your Answer
                </label>
                <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  {followUpAnswer}
                </div>
              </div>
            )}

            {/* Q&A History */}
            {qaHistory.length > 1 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Previous Q&A ({qaHistory.length - 1})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {qaHistory.slice(0, -1).reverse().map((qa, i) => (
                    <div key={i} className="text-[10px] p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="font-semibold text-gray-600 mb-1">Q: {qa.question}</p>
                      <p className="text-gray-500 line-clamp-2">A: {qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Line-by-line Explanations */}
        {explanations && explanations.length > 0 && (
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
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
                      isHighlighted ? 'bg-[#10b981]/10' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Line number + Code */}
                    <div className="flex items-start gap-1.5 mb-0.5">
                      <span
                        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold ${
                          isHighlighted ? 'bg-[#10b981] text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.line}
                      </span>
                      <code className="flex-1 text-[12px] font-mono text-gray-800 font-medium select-text cursor-text whitespace-pre-wrap break-words">
                        {item.code}
                      </code>
                    </div>
                    {/* Explanation */}
                    <div className="pl-6">
                      <p className="text-[11px] text-gray-600 font-medium select-text leading-tight">
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
