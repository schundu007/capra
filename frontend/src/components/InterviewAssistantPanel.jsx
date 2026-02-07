import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getApiUrl } from '../hooks/useElectron';

const isElectron = window.electronAPI?.isElectron || false;

// Simple markdown renderer for interview answers
function renderMarkdown(text) {
  if (!text) return null;

  // Process line by line
  const lines = text.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const processInline = (str) => {
    // Bold: **text** or __text__
    str = str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    str = str.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Italic: *text* or _text_
    str = str.replace(/\*(.+?)\*/g, '<em>$1</em>');
    str = str.replace(/_(.+?)_/g, '<em>$1</em>');
    // Code: `text`
    str = str.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-700 rounded text-emerald-300 text-[11px]">$1</code>');
    return str;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i} className="text-slate-200" dangerouslySetInnerHTML={{ __html: processInline(item) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // List item
    if (trimmed.match(/^[-*•]\s+/)) {
      inList = true;
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }

    // Numbered list
    if (trimmed.match(/^\d+\.\s+/)) {
      inList = true;
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      return;
    }

    // If we were in a list, flush it
    if (inList) {
      flushList();
    }

    // Header
    if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={idx} className="font-semibold text-white mt-3 mb-1">{trimmed.slice(4)}</h4>);
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={idx} className="font-semibold text-white mt-3 mb-1">{trimmed.slice(3)}</h3>);
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={idx} className="font-bold text-white mt-3 mb-1">{trimmed.slice(2)}</h2>);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={idx} className="text-slate-200 mb-2" dangerouslySetInnerHTML={{ __html: processInline(trimmed) }} />
    );
  });

  // Flush any remaining list
  flushList();

  return elements;
}

const API_URL = getApiUrl();

function getAuthHeaders() {
  const token = localStorage.getItem('capra_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function InterviewAssistantPanel({ onClose, provider, model }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [answer, setAnswer] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Device selection
  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  const speakerStreamRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const transcriptionRef = useRef('');
  const durationIntervalRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentMimeTypeRef = useRef('audio/webm');

  // Voice Activity Detection (VAD)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const speechStartTimeRef = useRef(null);
  const silenceStartTimeRef = useRef(null);
  const speechChunksRef = useRef([]);
  const lastTranscriptionRef = useRef(''); // Track last transcription to avoid duplicates
  const autoAnswerTimeoutRef = useRef(null); // Debounce auto-answer generation
  const lastAnsweredTextRef = useRef(''); // Track what we've already answered
  const VAD_THRESHOLD = 0.06; // Audio level threshold for speech detection (lowered for sensitivity)
  const SILENCE_DURATION = 2000; // ms of silence to end speech segment (increased for complete sentences)
  const MIN_SPEECH_DURATION = 800; // minimum ms of speech to transcribe

  // Load available audio devices and persist selection
  useEffect(() => {
    async function loadDevices() {
      try {
        // Request permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => stream.getTracks().forEach(track => track.stop()));

        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === 'audioinput');
        const outputs = devices.filter(d => d.kind === 'audiooutput');

        setAudioDevices({ inputs, outputs });

        // Load saved preferences or use defaults
        const savedMic = localStorage.getItem('interview_mic');
        const savedSpeaker = localStorage.getItem('interview_speaker');

        if (savedMic && inputs.find(d => d.deviceId === savedMic)) {
          setSelectedMic(savedMic);
        } else if (!selectedMic && inputs.length > 0) {
          setSelectedMic(inputs[0].deviceId);
        }

        if (savedSpeaker && outputs.find(d => d.deviceId === savedSpeaker)) {
          setSelectedSpeaker(savedSpeaker);
        } else if (!selectedSpeaker && outputs.length > 0) {
          setSelectedSpeaker(outputs[0].deviceId);
        }
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
    }

    loadDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, []);

  // Save device preferences when changed
  useEffect(() => {
    if (selectedMic) localStorage.setItem('interview_mic', selectedMic);
  }, [selectedMic]);

  useEffect(() => {
    if (selectedSpeaker) localStorage.setItem('interview_speaker', selectedSpeaker);
  }, [selectedSpeaker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (autoAnswerTimeoutRef.current) {
        clearTimeout(autoAnswerTimeoutRef.current);
      }
    };
  }, []);

  // Monitor audio levels with Voice Activity Detection
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecordingRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedLevel = average / 255;
    setAudioLevel(normalizedLevel);

    const now = Date.now();

    // Voice Activity Detection
    if (normalizedLevel > VAD_THRESHOLD) {
      // Speech detected
      silenceStartTimeRef.current = null;

      if (!isSpeakingRef.current) {
        // Start of new speech segment
        isSpeakingRef.current = true;
        speechStartTimeRef.current = now;
        setIsSpeaking(true);
        console.log('[VAD] Speech started');
      }
    } else {
      // Silence detected
      if (isSpeakingRef.current) {
        if (!silenceStartTimeRef.current) {
          silenceStartTimeRef.current = now;
        } else if (now - silenceStartTimeRef.current > SILENCE_DURATION) {
          // End of speech segment after sustained silence
          const speechDuration = now - speechStartTimeRef.current;

          if (speechDuration > MIN_SPEECH_DURATION) {
            console.log('[VAD] Speech ended, duration:', speechDuration, 'ms');
            // Trigger transcription of this completed speech segment
            if (speechChunksRef.current.length > 0) {
              const mimeType = currentMimeTypeRef.current;
              const audioBlob = new Blob(speechChunksRef.current, { type: mimeType });
              console.log('[VAD] Transcribing speech segment, size:', audioBlob.size);
              transcribeAudio(audioBlob, true); // true = segment ended, append to transcription
            }
          } else {
            console.log('[VAD] Speech too short, ignoring:', speechDuration, 'ms');
          }

          // Reset for next speech segment
          speechChunksRef.current = [];
          isSpeakingRef.current = false;
          speechStartTimeRef.current = null;
          silenceStartTimeRef.current = null;
          setIsSpeaking(false);
        }
      }
    }

    if (isRecordingRef.current && !isPausedRef.current) {
      animationRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  }, []);

  // Get file extension from mimeType
  const getExtensionFromMime = (mime) => {
    if (mime?.includes('mp4')) return 'm4a';
    if (mime?.includes('ogg')) return 'ogg';
    if (mime?.includes('webm')) return 'webm';
    if (mime?.includes('wav')) return 'wav';
    return 'webm';
  };

  // Transcribe audio blob - this transcribes a complete speech segment
  const transcribeAudio = async (audioBlob, isSegmentEnd = false) => {
    if (!audioBlob || audioBlob.size < 1000) {
      console.log('[Transcribe] Skipping small audio chunk:', audioBlob?.size);
      return;
    }

    const extension = getExtensionFromMime(currentMimeTypeRef.current);
    const filename = `recording.${extension}`;
    console.log('[Transcribe] Sending audio blob, size:', audioBlob.size, 'as:', filename, 'segmentEnd:', isSegmentEnd);
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);

      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      console.log('[Transcribe] Response:', data);

      if (data.text && data.text.trim()) {
        const newText = data.text.trim();
        // Only append if this is a completed speech segment and not a duplicate
        if (isSegmentEnd) {
          // Check for duplicates - don't add if same as last transcription
          if (newText !== lastTranscriptionRef.current &&
              !transcriptionRef.current.endsWith(newText)) {
            lastTranscriptionRef.current = newText;
            transcriptionRef.current += (transcriptionRef.current ? ' ' : '') + newText;
            setTranscription(transcriptionRef.current);
            console.log('[Transcribe] Added to transcription:', newText);

            // Auto-generate answer after transcription
            autoGenerateAnswer(transcriptionRef.current);
          } else {
            console.log('[Transcribe] Skipping duplicate:', newText);
          }
        }
      }
    } catch (err) {
      console.error('[Transcribe] Error:', err);
      setError('Transcription failed: ' + err.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      setRecordingDuration(0);

      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      // Use selected microphone if available
      if (selectedMic) {
        audioConstraints.deviceId = { exact: selectedMic };
      }

      console.log('[Recording] Getting microphone stream with device:', selectedMic || 'default');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });
      streamRef.current = stream;

      console.log('[Recording] Started successfully');

      // Set up audio analyzer (only if not already created for 'both' mode)
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Create MediaRecorder - prefer formats that work better with Whisper
      // OGG with opus is well-supported and works in chunks
      const mimeTypes = [
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/webm;codecs=opus',
        'audio/webm',
      ];

      let mimeType = 'audio/webm'; // fallback
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      console.log('[Recording] Using mimeType:', mimeType);
      currentMimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Reset speech tracking
      speechChunksRef.current = [];
      isSpeakingRef.current = false;
      speechStartTimeRef.current = null;
      silenceStartTimeRef.current = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Always collect chunks - VAD will decide when to transcribe
          speechChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[Recording] Stopped');
        // Transcribe any remaining speech when stopped
        if (speechChunksRef.current.length > 0 && isSpeakingRef.current) {
          const audioBlob = new Blob(speechChunksRef.current, { type: mimeType });
          if (audioBlob.size > 5000) {
            console.log('[Recording] Final transcription, size:', audioBlob.size);
            await transcribeAudio(audioBlob, true); // true = final segment
          }
        }
        speechChunksRef.current = [];
      };

      // Request data frequently for responsive VAD
      mediaRecorder.start(200);

      // No interval-based transcription - VAD handles it

      // Duration timer
      const durationInterval = setInterval(() => {
        if (isRecordingRef.current && !isPausedRef.current) {
          setRecordingDuration(d => d + 1);
        }
      }, 1000);

      durationIntervalRef.current = { duration: durationInterval };

      isRecordingRef.current = true;
      isPausedRef.current = false;
      setIsRecording(true);
      setIsPaused(false);

      // Start level monitoring
      monitorAudioLevel();

      console.log('[Recording] Started successfully');
    } catch (err) {
      console.error('[Recording] Error:', err);
      setError('Microphone access denied: ' + err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log('[Recording] Stopping...');

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current.duration);
      durationIntervalRef.current = null;
    }

    // Reset VAD state
    isSpeakingRef.current = false;
    speechStartTimeRef.current = null;
    silenceStartTimeRef.current = null;
    setIsSpeaking(false);

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (speakerStreamRef.current) {
      speakerStreamRef.current.getTracks().forEach(track => track.stop());
      speakerStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    analyserRef.current = null;
    isRecordingRef.current = false;
    isPausedRef.current = false;
    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
  };

  // Toggle pause
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      isPausedRef.current = false;
      setIsPaused(false);
      monitorAudioLevel();
    } else {
      mediaRecorderRef.current.pause();
      isPausedRef.current = true;
      setIsPaused(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  // Auto-generate answer with debounce
  const autoGenerateAnswer = (text) => {
    // Clear any pending auto-answer
    if (autoAnswerTimeoutRef.current) {
      clearTimeout(autoAnswerTimeoutRef.current);
    }

    // Only auto-generate if we have meaningful new content
    const minWords = 3;
    const wordCount = text.trim().split(/\s+/).length;

    if (wordCount < minWords) {
      console.log('[AutoAnswer] Not enough words yet:', wordCount);
      return;
    }

    // Don't re-generate for the same text
    if (text === lastAnsweredTextRef.current) {
      console.log('[AutoAnswer] Already answered this text');
      return;
    }

    // Debounce - wait 1.5s after last transcription before generating
    autoAnswerTimeoutRef.current = setTimeout(() => {
      console.log('[AutoAnswer] Auto-generating answer for:', text.substring(0, 50) + '...');
      lastAnsweredTextRef.current = text;
      generateAnswerForText(text);
    }, 1500);
  };

  // Generate answer for specific text (used by auto-generate)
  const generateAnswerForText = async (text) => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setAnswer('');
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/interview/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          question: text,
          provider,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate answer');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                setAnswer(prev => prev + data.chunk);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (!e.message.includes('JSON')) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to generate answer: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate answer from transcription (manual button)
  const generateAnswer = async () => {
    if (!transcription.trim()) {
      setError('No transcription to generate answer from');
      return;
    }

    lastAnsweredTextRef.current = transcription;
    setIsGenerating(true);
    setAnswer('');
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/interview/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          question: transcription,
          provider,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate answer');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                setAnswer(prev => prev + data.chunk);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (!e.message.includes('JSON')) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to generate answer: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear all
  const clearAll = () => {
    setTranscription('');
    setAnswer('');
    transcriptionRef.current = '';
    lastTranscriptionRef.current = '';
    lastAnsweredTextRef.current = '';
    if (autoAnswerTimeoutRef.current) {
      clearTimeout(autoAnswerTimeoutRef.current);
    }
    setError(null);
    setRecordingDuration(0);
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col border-l border-slate-700/50 bg-slate-900">
      {/* Header - Compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            isSpeaking ? 'bg-emerald-500 animate-pulse' : isRecording ? 'bg-red-500' : 'bg-slate-600'
          }`}>
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          <h2 className="text-xs font-semibold text-white">Interview</h2>
          {isRecording && (
            <>
              <span className="text-xs text-red-400 font-mono">{formatDuration(recordingDuration)}</span>
              {isSpeaking && <span className="text-xs text-emerald-400">Speaking...</span>}
            </>
          )}
          {isTranscribing && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <div className="w-2.5 h-2.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          title="Close"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Device Settings - Microphone selection with meeting tool setup */}
      {showDeviceSettings && (
        <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-800/40 space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 mb-1 block">Select Microphone</label>
            <div className="flex gap-2">
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                disabled={isRecording}
                className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              >
                {audioDevices.inputs.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded"
              >
                Done
              </button>
            </div>
          </div>

          {/* Meeting Tools Setup Guide */}
          <div className="bg-slate-900/50 rounded p-2 space-y-2">
            <div className="text-[10px] font-medium text-slate-300">Capture Interviewer Audio from:</div>
            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-700/50 rounded">
                <span className="text-blue-400 font-bold">Z</span>
                <span className="text-slate-300">Zoom</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-700/50 rounded">
                <span className="text-purple-400 font-bold">T</span>
                <span className="text-slate-300">Teams</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-700/50 rounded">
                <span className="text-green-400 font-bold">M</span>
                <span className="text-slate-300">Meet</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-700/50 rounded">
                <span className="text-orange-400 font-bold">W</span>
                <span className="text-slate-300">Webex</span>
              </div>
            </div>
            <div className="text-[9px] text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Setup:</strong> Install a virtual audio device to route meeting audio to mic input:
              <br />• <strong>Mac:</strong> BlackHole or Loopback
              <br />• <strong>Windows:</strong> VB-Cable or VoiceMeeter
              <br />• Then select it above as your microphone
            </div>
          </div>
        </div>
      )}

      {/* Controls - Compact */}
      <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center gap-2">

          {/* Device Settings Toggle */}
          <button
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            className={`p-1.5 rounded border transition-colors ${
              showDeviceSettings
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title="Audio devices"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Record Button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="6" />
              </svg>
              Record
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className={`flex items-center gap-1 px-2 py-1.5 ${
                  isPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-yellow-600 hover:bg-yellow-700'
                } text-white rounded text-xs font-medium transition-colors`}
              >
                {isPaused ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                )}
              </button>
              <button
                onClick={stopRecording}
                className="flex items-center gap-1 px-2 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1"/>
                </svg>
              </button>
            </>
          )}

          {/* Audio Level Indicator - Compact */}
          {isRecording && !isPaused && (
            <div className="flex items-center gap-0.5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all duration-75 ${
                    audioLevel > (i + 1) * 0.12 ? (isSpeaking ? 'bg-emerald-500' : 'bg-slate-500') : 'bg-slate-700'
                  }`}
                  style={{ height: `${4 + i * 2}px` }}
                />
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Clear Button */}
          <button
            onClick={clearAll}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Clear"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content - Compact */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Transcription Section */}
        <div className="flex-1 min-h-0 border-b border-slate-700/50">
          <div className="h-full flex flex-col">
            <div className="px-3 py-1 border-b border-slate-700/30 bg-slate-800/20 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Transcription
              </span>
              {transcription && (
                <span className="text-[10px] text-slate-500">
                  {transcription.split(' ').length}w
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-dark">
              {transcription ? (
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{transcription}</p>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  {isRecording ? (
                    isSpeaking ? 'Listening...' : 'Waiting for speech...'
                  ) : (
                    'Click Record to begin'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answer Section */}
        <div className="flex-1 min-h-0">
          <div className="h-full flex flex-col">
            <div className="px-3 py-1 border-b border-slate-700/30 bg-slate-800/20 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Answer
              </span>
              <button
                onClick={generateAnswer}
                disabled={!transcription.trim() || isGenerating}
                className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  !transcription.trim() || isGenerating
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {isGenerating ? 'Wait' : 'Go'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-dark">
              {answer ? (
                <div className="text-xs leading-relaxed">
                  {renderMarkdown(answer)}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {transcription ? 'Auto-generating...' : 'Transcribe first'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
