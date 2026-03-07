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
    str = str.replace(/`([^`]+)`/g, '<code style="padding: 2px 4px; background: #f5f5f5; border-radius: 4px; color: #10b981; font-size: 11px;">$1</code>');
    return str;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i} style={{ color: '#333333' }} dangerouslySetInnerHTML={{ __html: processInline(item) }} />
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
      elements.push(<h4 key={idx} className="font-semibold mt-3 mb-1" style={{ color: '#333333' }}>{trimmed.slice(4)}</h4>);
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={idx} className="font-semibold mt-3 mb-1" style={{ color: '#333333' }}>{trimmed.slice(3)}</h3>);
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={idx} className="font-bold mt-3 mb-1" style={{ color: '#333333' }}>{trimmed.slice(2)}</h2>);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={idx} className="mb-2" style={{ color: '#333333' }} dangerouslySetInnerHTML={{ __html: processInline(trimmed) }} />
    );
  });

  // Flush any remaining list
  flushList();

  return elements;
}

const API_URL = getApiUrl();

function getAuthHeaders() {
  const headers = {};
  const token = localStorage.getItem('chundu_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Add Electron header for backend to skip webapp authentication
  if (window.electronAPI?.isElectron) {
    headers['X-Electron-App'] = 'true';
  }
  return headers;
}

export default function AscendAssistantPanel({ onClose, provider, model }) {
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
  const [audioSource, setAudioSource] = useState('system'); // 'mic' or 'system' - default to system for interviewer audio

  const speakerStreamRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentMimeTypeRef = useRef('audio/webm');

  // Voice Activity Detection (VAD)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const speechStartTimeRef = useRef(null);
  const silenceStartTimeRef = useRef(null);
  const allChunksRef = useRef([]); // ALL chunks for complete audio file
  const lastTranscriptionRef = useRef(''); // Track last transcription to avoid duplicates
  const autoAnswerTimeoutRef = useRef(null); // Debounce auto-answer generation
  const lastAnsweredTextRef = useRef(''); // Track what we've already answered
  const lastTranscribedSizeRef = useRef(0); // Track how much audio we've transcribed
  const lastTranscribedChunkIndexRef = useRef(0); // Track which chunk index we've transcribed up to
  const headerChunksRef = useRef([]); // Store the first few chunks that contain file headers
  const VAD_THRESHOLD = 0.06; // Audio level threshold for speech detection
  const SILENCE_DURATION = 1800; // ms of silence to end speech segment
  const MIN_SPEECH_DURATION = 800; // minimum ms of speech to transcribe
  const TRANSCRIPTION_COOLDOWN = 2000; // minimum ms between transcriptions
  const lastTranscriptionTimeRef = useRef(0); // Track when we last transcribed
  const askedQuestionsRef = useRef(new Set()); // Track all asked questions to prevent duplicates

  // Store questions as array for separate lines
  const [questions, setQuestions] = useState([]);

  // Conversation history - persisted to localStorage
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ascend_assistant_history');
    if (saved) {
      try {
        setConversationHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load conversation history:', e);
      }
    }
  }, []);

  // Save conversation history to localStorage
  const saveToHistory = useCallback((question, answerText) => {
    const entry = {
      id: Date.now(),
      question: question.trim(),
      answer: answerText.trim(),
      timestamp: new Date().toISOString()
    };
    setConversationHistory(prev => {
      const updated = [...prev, entry];
      localStorage.setItem('ascend_assistant_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    if (confirm('Clear all conversation history?')) {
      setConversationHistory([]);
      localStorage.removeItem('ascend_assistant_history');
    }
  }, []);

  // Load available audio devices and persist selection
  useEffect(() => {
    async function loadDevices() {
      try {
        // Try to request permission first to get device labels
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (permErr) {
          console.warn('Initial audio permission request failed:', permErr.message);
          // Continue anyway - we'll handle permission errors when recording starts
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === 'audioinput');
        const outputs = devices.filter(d => d.kind === 'audiooutput');

        setAudioDevices({ inputs, outputs });

        // Load saved preferences or use defaults
        const savedMic = localStorage.getItem('interview_mic');
        const savedSpeaker = localStorage.getItem('interview_speaker');

        if (savedMic && inputs.find(d => d.deviceId === savedMic)) {
          setSelectedMic(savedMic);
        } else if (inputs.length > 0) {
          setSelectedMic(inputs[0].deviceId);
        }

        if (savedSpeaker && outputs.find(d => d.deviceId === savedSpeaker)) {
          setSelectedSpeaker(savedSpeaker);
        } else if (outputs.length > 0) {
          setSelectedSpeaker(outputs[0].deviceId);
        }

        // Show warning if no inputs found
        if (inputs.length === 0) {
          setError('No microphone detected. Please connect a microphone.');
        }
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
        setError('Could not detect audio devices. Please check permissions.');
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
            const timeSinceLastTranscription = now - lastTranscriptionTimeRef.current;

            // Only transcribe if enough time has passed (cooldown)
            if (timeSinceLastTranscription < TRANSCRIPTION_COOLDOWN) {
              console.log('[VAD] Cooldown active, skipping. Time since last:', timeSinceLastTranscription, 'ms');
            } else {
              console.log('[VAD] Speech ended, duration:', speechDuration, 'ms');
              // Trigger transcription - include header chunks for valid file format
              const newChunks = allChunksRef.current.slice(lastTranscribedChunkIndexRef.current);
              if (newChunks.length > 0) {
                const mimeType = currentMimeTypeRef.current;
                // Combine header chunks with new chunks for valid audio file
                const chunksToTranscribe = [...headerChunksRef.current, ...newChunks];
                const audioBlob = new Blob(chunksToTranscribe, { type: mimeType });
                // Only transcribe if we have enough new audio
                if (audioBlob.size > 10000) {
                  console.log('[VAD] Transcribing with headers, chunks:', chunksToTranscribe.length, 'size:', audioBlob.size);
                  lastTranscriptionTimeRef.current = now;
                  transcribeAudio(audioBlob, true);
                  lastTranscribedChunkIndexRef.current = allChunksRef.current.length;
                } else {
                  console.log('[VAD] Audio too small, skipping:', audioBlob.size);
                }
              }
            }
          } else {
            console.log('[VAD] Speech too short, ignoring:', speechDuration, 'ms');
          }

          // Reset speech tracking (but keep collecting chunks!)
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
        let newText = data.text.trim();

        // Remove repeated phrases within the text (e.g., "what's her name what's her name" -> "what's her name")
        const words = newText.split(' ');
        if (words.length >= 4) {
          // Check if the text is a repeated phrase
          const halfLen = Math.floor(words.length / 2);
          const firstHalf = words.slice(0, halfLen).join(' ').toLowerCase();
          const secondHalf = words.slice(halfLen, halfLen * 2).join(' ').toLowerCase();
          if (firstHalf === secondHalf) {
            newText = words.slice(0, halfLen).join(' ');
            console.log('[Transcribe] Removed repeated phrase, cleaned:', newText);
          }
        }

        // Only process if this is a completed speech segment with meaningful content
        if (isSegmentEnd && newText.length > 10) {
          console.log('[Transcribe] Got text:', newText);

          // Always show the current transcription
          setTranscription(newText);

          // Normalize text for comparison (lowercase, remove extra spaces)
          const normalizedText = newText.toLowerCase().replace(/\s+/g, ' ').trim();

          // Check if this is a duplicate or very similar to previous questions
          const isDuplicate = askedQuestionsRef.current.has(normalizedText) ||
            [...askedQuestionsRef.current].some(q => {
              // Check for high similarity (one contains the other or very similar)
              return q.includes(normalizedText) || normalizedText.includes(q) ||
                (normalizedText.length > 20 && q.length > 20 &&
                 (normalizedText.substring(0, 20) === q.substring(0, 20)));
            });

          if (!isDuplicate) {
            console.log('[Transcribe] New question detected:', newText);
            askedQuestionsRef.current.add(normalizedText);
            lastTranscriptionRef.current = newText;
            setQuestions(prev => [...prev, newText]);

            // Auto-generate answer for the new question
            autoGenerateAnswer(newText);
          } else {
            console.log('[Transcribe] Duplicate question, skipping:', newText);
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

      let stream;

      if (audioSource === 'system') {
        // Capture system audio (interviewer's voice from video call)
        console.log('[Recording] Capturing system audio...');
        try {
          // Use getDisplayMedia to capture system/tab audio
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true, // Required but we'll ignore it
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            }
          });

          // Stop the video track - we only need audio
          stream.getVideoTracks().forEach(track => track.stop());

          // Check if we got audio
          if (stream.getAudioTracks().length === 0) {
            throw new Error('No audio track available. Make sure to select a tab/window with audio.');
          }

          console.log('[Recording] System audio captured successfully');
        } catch (err) {
          console.error('[Recording] System audio capture failed:', err);
          if (err.name === 'NotAllowedError') {
            setError('Screen share cancelled. Please select a tab/window to capture interviewer audio.');
          } else {
            setError('Failed to capture system audio: ' + err.message);
          }
          return;
        }
      } else {
        // Capture microphone (original behavior)
        // First, refresh device list to ensure we have current info
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === 'audioinput');
        setAudioDevices(prev => ({ ...prev, inputs }));

        // Check if selected mic still exists
        const selectedMicExists = inputs.find(d => d.deviceId === selectedMic);

        const audioConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };

        // Use selected microphone if it exists, otherwise use default
        if (selectedMic && selectedMicExists) {
          audioConstraints.deviceId = { exact: selectedMic };
          console.log('[Recording] Using selected mic:', selectedMic);
        } else if (inputs.length > 0) {
          // Fall back to first available device
          const fallbackDevice = inputs[0].deviceId;
          audioConstraints.deviceId = { ideal: fallbackDevice };
          setSelectedMic(fallbackDevice);
          console.log('[Recording] Selected mic not found, using fallback:', fallbackDevice);
        }

        console.log('[Recording] Getting microphone stream...');

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
          });
        } catch (firstErr) {
          // If exact device fails, try without device constraint
          console.log('[Recording] First attempt failed, trying default mic');
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        }
      }

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

      // Reset speech tracking (but keep questions history for duplicate detection)
      allChunksRef.current = [];
      headerChunksRef.current = [];
      lastTranscribedSizeRef.current = 0;
      lastTranscribedChunkIndexRef.current = 0;
      lastTranscriptionTimeRef.current = 0;
      isSpeakingRef.current = false;
      speechStartTimeRef.current = null;
      silenceStartTimeRef.current = null;
      // Note: We don't reset askedQuestionsRef here to prevent duplicates across recording sessions

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Always collect ALL chunks for complete audio file
          allChunksRef.current.push(event.data);
          // Store first 3 chunks as headers (they contain format info)
          if (headerChunksRef.current.length < 3) {
            headerChunksRef.current.push(event.data);
          }
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[Recording] Stopped');
        // Transcribe any remaining speech when stopped (with headers for valid format)
        const newChunks = allChunksRef.current.slice(lastTranscribedChunkIndexRef.current);
        if (newChunks.length > 0 && isSpeakingRef.current) {
          const chunksToTranscribe = [...headerChunksRef.current, ...newChunks];
          const audioBlob = new Blob(chunksToTranscribe, { type: mimeType });
          if (audioBlob.size > 5000) {
            console.log('[Recording] Final transcription, chunks:', chunksToTranscribe.length, 'size:', audioBlob.size);
            await transcribeAudio(audioBlob, true);
          }
        }
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
      // Provide helpful error messages
      if (err.name === 'NotFoundError' || err.message.includes('not found')) {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotAllowedError' || err.message.includes('denied')) {
        setError('Microphone permission denied. Please allow microphone access in your browser/system settings.');
      } else {
        setError('Microphone error: ' + err.message);
      }
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
    let fullAnswer = ''; // Track full answer for history

    try {
      const response = await fetch(`${API_URL}/api/ascend/answer`, {
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
                fullAnswer += data.chunk;
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

      // Save to conversation history
      if (fullAnswer.trim()) {
        saveToHistory(text, fullAnswer);
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
    let fullAnswer = ''; // Track full answer for history
    const questionText = transcription; // Capture before it might change

    try {
      const response = await fetch(`${API_URL}/api/ascend/answer`, {
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
                fullAnswer += data.chunk;
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

      // Save to conversation history
      if (fullAnswer.trim()) {
        saveToHistory(questionText, fullAnswer);
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
    setQuestions([]);
    lastTranscriptionRef.current = '';
    lastAnsweredTextRef.current = '';
    lastTranscribedSizeRef.current = 0;
    lastTranscribedChunkIndexRef.current = 0;
    lastTranscriptionTimeRef.current = 0;
    askedQuestionsRef.current = new Set();
    allChunksRef.current = [];
    headerChunksRef.current = [];
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
    <div className="h-full flex flex-col panel-container" style={{ borderLeft: '1px solid #e5e5e5' }}>
      {/* Header - Matching other panels */}
      <div className="panel-header">
        <div className="panel-header-left">
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{
            background: isSpeaking ? '#10b981' : isRecording ? '#ef4444' : '#10b981'
          }}>
            <svg className="w-2.5 h-2.5" style={{ color: '#ffffff' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          <span className="panel-title">Interview</span>
          {isRecording && (
            <>
              <span className="text-xs font-mono" style={{ color: '#ef4444' }}>{formatDuration(recordingDuration)}</span>
              {isSpeaking && <span className="text-xs" style={{ color: '#10b981' }}>Speaking...</span>}
            </>
          )}
          {isTranscribing && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
              <div className="w-2.5 h-2.5 border-2 rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
            </div>
          )}
        </div>
        <div className="panel-header-right">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1 rounded transition-colors hover:bg-gray-100"
            style={{ color: showHistory ? '#10b981' : '#666666' }}
            title="Conversation History"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors hover:bg-gray-100"
            style={{ color: '#666666' }}
            title="Close"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversation History Panel */}
      {showHistory && (
        <div className="flex-1 overflow-y-auto p-3" style={{ background: '#f9fafb' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold" style={{ color: '#374151' }}>Conversation History</h3>
            {conversationHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[10px] px-2 py-1 rounded"
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                Clear All
              </button>
            )}
          </div>
          {conversationHistory.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: '#9ca3af' }}>No conversation history yet</p>
          ) : (
            <div className="space-y-3">
              {[...conversationHistory].reverse().map((entry) => (
                <div key={entry.id} className="card-enterprise animate-fadeIn">
                  <div className="card-enterprise-header flex items-center justify-between py-2 px-3">
                    <span className="text-[10px] font-medium" style={{ color: '#6b7280' }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="card-enterprise-body py-3 px-3">
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Q</span>
                        <span className="text-[10px] font-semibold uppercase" style={{ color: '#3b82f6' }}>Question</span>
                      </div>
                      <p className="text-xs pl-6" style={{ color: '#1f2937' }}>{entry.question}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>A</span>
                        <span className="text-[10px] font-semibold uppercase" style={{ color: '#10b981' }}>Answer</span>
                      </div>
                      <div className="text-xs pl-6" style={{ color: '#1f2937' }}>{renderMarkdown(entry.answer)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-sm flex items-center justify-between" style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#ef4444' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ color: '#ef4444' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Content - hidden when showing history */}
      {!showHistory && (
        <>
      {/* Audio Setup Guide */}
      {showDeviceSettings && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid #e5e5e5', background: '#f5f5f5' }}>
          <div className="rounded p-2 space-y-2" style={{ background: '#ffffff', border: '1px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-medium" style={{ color: '#333333' }}>Capture Interviewer Audio</div>
              <button
                onClick={() => setShowDeviceSettings(false)}
                style={{ color: '#666666' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[9px]">
              <div className="flex items-center gap-1 p-1 rounded" style={{ background: '#f5f5f5' }}>
                <span className="font-bold" style={{ color: '#3b82f6' }}>Z</span>
                <span style={{ color: '#333333' }}>Zoom</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded" style={{ background: '#f5f5f5' }}>
                <span className="font-bold" style={{ color: '#8b5cf6' }}>T</span>
                <span style={{ color: '#333333' }}>Teams</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded" style={{ background: '#f5f5f5' }}>
                <span className="font-bold" style={{ color: '#ea4335' }}>G</span>
                <span style={{ color: '#333333' }}>Google Meet</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded" style={{ background: '#f5f5f5' }}>
                <span className="font-bold" style={{ color: '#f97316' }}>W</span>
                <span style={{ color: '#333333' }}>Webex</span>
              </div>
            </div>
            <div className="text-[9px] leading-relaxed" style={{ color: '#666666' }}>
              <strong style={{ color: '#333333' }}>To capture interviewer audio:</strong>
              <br />1. Select "🎧 Interviewer (System)" above
              <br />2. Click Record → Select your meeting tab/window
              <br />3. Audio from that tab will be captured
            </div>
          </div>
        </div>
      )}

      {/* Audio Source Selection */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid #e5e5e5', background: '#f5f5f5' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-medium" style={{ color: '#666666' }}>Audio Source:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setAudioSource('system')}
              disabled={isRecording}
              className="px-2 py-1 rounded text-[10px] font-medium transition-colors disabled:opacity-50"
              style={{
                background: audioSource === 'system' ? '#3b82f6' : '#e5e5e5',
                color: audioSource === 'system' ? '#ffffff' : '#666666'
              }}
            >
              🎧 Interviewer (System)
            </button>
            <button
              onClick={() => setAudioSource('mic')}
              disabled={isRecording}
              className="px-2 py-1 rounded text-[10px] font-medium transition-colors disabled:opacity-50"
              style={{
                background: audioSource === 'mic' ? '#3b82f6' : '#e5e5e5',
                color: audioSource === 'mic' ? '#ffffff' : '#666666'
              }}
            >
              🎤 My Mic
            </button>
          </div>
        </div>

        {/* Microphone Selection - Only show when mic source selected */}
        {audioSource === 'mic' && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#666666' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <select
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              disabled={isRecording}
              className="flex-1 px-2 py-1 rounded text-[10px] focus:outline-none disabled:opacity-50 truncate"
              style={{ background: '#ffffff', border: '1px solid #e5e5e5', color: '#333333' }}
            >
              {audioDevices.inputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* System audio hint */}
        {audioSource === 'system' && (
          <div className="text-[9px] mt-1" style={{ color: '#666666' }}>
            Click Record → Select the video call tab/window to capture interviewer audio
          </div>
        )}
      </div>

      {/* Controls - Compact */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid #e5e5e5', background: '#ffffff' }}>
        <div className="flex items-center gap-2">

          {/* Record Button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="6" />
              </svg>
              Record
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors"
                style={{ background: isPaused ? '#10b981' : '#f59e0b', color: '#ffffff' }}
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
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors"
                style={{ background: '#666666', color: '#ffffff' }}
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
                  className="w-0.5 rounded-full transition-all duration-75"
                  style={{
                    height: `${4 + i * 2}px`,
                    background: audioLevel > (i + 1) * 0.12 ? (isSpeaking ? '#10b981' : '#999999') : '#e5e5e5'
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Clear Button */}
          <button
            onClick={clearAll}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#666666' }}
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
        {/* Questions Section - Each on separate line */}
        <div className="flex-1 min-h-0" style={{ borderBottom: '1px solid #e5e5e5' }}>
          <div className="h-full flex flex-col">
            <div className="px-3 py-1 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e5e5', background: '#f5f5f5' }}>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                Questions
              </span>
              {questions.length > 0 && (
                <span className="text-[10px]" style={{ color: '#999999' }}>
                  {questions.length} question{questions.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col-reverse" style={{ background: '#ffffff' }}>
              {questions.length > 0 ? (
                <div className="space-y-2">
                  {[...questions].reverse().map((q, idx) => {
                    const questionNum = questions.length - idx;
                    return (
                      <div key={questionNum} className="qa-card animate-fadeIn" style={{ borderLeft: '3px solid #3b82f6' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            {questionNum}
                          </span>
                          <span className="text-[9px] font-semibold uppercase" style={{ color: '#3b82f6' }}>Question</span>
                        </div>
                        <p className="text-xs leading-relaxed pl-6" style={{ color: '#333333' }}>{q}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs italic" style={{ color: '#999999' }}>
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
            <div className="px-3 py-1 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e5e5', background: '#f5f5f5' }}>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                Answer
              </span>
              {isGenerating && (
                <div className="flex items-center gap-1 text-[10px]" style={{ color: '#10b981' }}>
                  <div className="w-2.5 h-2.5 border-2 rounded-full animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
                  <span>Generating...</span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2" style={{ background: '#ffffff' }}>
              {answer ? (
                <div className="text-xs leading-relaxed" style={{ color: '#333333' }}>
                  {renderMarkdown(answer)}
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: '#999999' }}>
                  {questions.length > 0 ? (isGenerating ? 'Generating...' : 'Waiting for question...') : 'Start recording to ask questions'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}

    </div>
  );
}
