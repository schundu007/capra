import { useState, useEffect, useRef, useCallback } from 'react';

// Format text with basic markdown-like styling (light theme)
function FormattedText({ text }) {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => {
        if (para.trim().startsWith('```') || para.match(/^[\s]{4,}/m)) {
          const code = para.replace(/^```\w*\n?|```$/g, '').trim();
          return (
            <pre key={i} className="p-1.5 rounded text-[11px] font-mono overflow-x-auto bg-gray-100 text-gray-700">
              {code}
            </pre>
          );
        }

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
  const hasSolution = pitch || (explanations && explanations.length > 0) || hasSystemDesign;

  // Q&A state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const silenceTimeoutRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const [qaHistory, setQaHistory] = useState([]);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // Track listening state without causing re-renders

  // Initialize speech recognition once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        const newTranscript = (lastTranscriptRef.current + ' ' + finalTranscript).trim();
        lastTranscriptRef.current = newTranscript;
        setTranscript(newTranscript);

        // Clear any existing silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Auto-submit after 2 seconds of silence
        silenceTimeoutRef.current = setTimeout(() => {
          if (lastTranscriptRef.current && isListeningRef.current) {
            // Stop listening and submit
            isListeningRef.current = false;
            try { recognition.stop(); } catch (e) {}
            setIsListening(false);
          }
        }, 2000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already started or other error
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []); // Empty deps - only run once

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }
    setTranscript('');
    lastTranscriptRef.current = '';
    setIsListening(true);
    isListeningRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Failed to start:', e);
    }
  }, []);

  // Auto-submit when listening stops and there's a transcript
  useEffect(() => {
    if (!isListening && transcript && !isProcessingFollowUp) {
      handleSubmitQuestion(transcript);
    }
  }, [isListening]);

  const stopListening = useCallback((autoSubmit = false) => {
    setIsListening(false);
    isListeningRef.current = false;
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  const handleSubmitQuestion = async (inputQuestion = null) => {
    const q = inputQuestion || transcript.trim() || textInput.trim();
    if (!q || !onFollowUpQuestion || isProcessingFollowUp) return;

    stopListening();
    const currentQ = q;
    setTranscript('');
    setTextInput('');

    // Add to history with pending state
    setQaHistory(prev => [...prev, { question: currentQ, answer: null, pending: true }]);

    try {
      const result = await onFollowUpQuestion(currentQ);
      setQaHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            question: currentQ,
            answer: result?.answer || 'No answer received',
            pending: false
          };
        }
        return updated;
      });
    } catch (err) {
      setQaHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            question: currentQ,
            answer: 'Error: ' + err.message,
            pending: false
          };
        }
        return updated;
      });
    }
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
          <p className="text-[10px] text-gray-400">Solve a problem to see explanations</p>
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

        {/* Interviewer Q&A Section - voice-based with auto-answer */}
        {hasSolution && onFollowUpQuestion && speechSupported && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-[12px] font-bold uppercase tracking-wide text-blue-600">
                  Interviewer Q&A
                </span>
              </div>

              {/* Listen Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessingFollowUp}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                    : isProcessingFollowUp
                      ? 'bg-gray-400 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                }`}
              >
                {isProcessingFollowUp ? 'Answering...' : isListening ? 'Listening...' : 'Start Listening'}
              </button>
            </div>

            {/* Live Transcript */}
            {(isListening || transcript) && (
              <div className="mb-3 p-3 rounded-lg bg-white border-2 border-blue-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-blue-600 uppercase">
                    {isListening ? 'Listening... (auto-submits after pause)' : 'Question'}
                  </span>
                  {transcript && (
                    <button
                      onClick={() => setTranscript('')}
                      className="text-[9px] text-gray-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[14px] text-gray-800 min-h-[20px]">
                  {transcript || 'Speak now...'}
                </p>
              </div>
            )}

            {/* Q&A History */}
            {qaHistory.length > 0 && (
              <div className="space-y-3">
                {qaHistory.map((qa, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white border border-gray-200">
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Q:</span>
                      <p className="text-[13px] text-gray-800 font-medium">{qa.question}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">A:</span>
                      {qa.pending ? (
                        <p className="text-[13px] text-gray-400 italic animate-pulse">Generating answer...</p>
                      ) : (
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{qa.answer}</p>
                      )}
                    </div>
                  </div>
                ))}
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
