/**
 * VoiceAssistantPanel - System Design Interview Assistant
 *
 * Frontend handles: audio capture, VAD, sending complete audio segments.
 * Backend handles: transcription (Deepgram), answer generation, SSE streaming.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { getApiUrl } from '../hooks/useElectron';
import { getAuthHeaders } from '../utils/authHeaders.js';

const API_URL = getApiUrl();

// VAD Configuration
const VAD_CONFIG = {
  THRESHOLD: 0.015,
  SILENCE_DURATION_MS: 1200,
  MIN_SPEECH_DURATION_MS: 400,
  MAX_SPEECH_DURATION_MS: 45000,
};

// Parse structured system design answer into sections
function parseSystemDesignAnswer(text) {
  if (!text) return null;

  const sections = {
    approach: '',
    functional: [],
    nonFunctional: [],
    scaleMath: [],
    architecture: '',
    layerDesign: [],
    edgeCases: [],
    tradeOffs: [],
  };

  // Extract sections using regex
  const approachMatch = text.match(/## APPROACH\n([\s\S]*?)(?=\n## |$)/i);
  if (approachMatch) sections.approach = approachMatch[1].trim();

  const functionalMatch = text.match(/## FUNCTIONAL\n([\s\S]*?)(?=\n## |$)/i);
  if (functionalMatch) {
    sections.functional = functionalMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim());
  }

  const nonFuncMatch = text.match(/## NON-FUNCTIONAL\n([\s\S]*?)(?=\n## |$)/i);
  if (nonFuncMatch) {
    sections.nonFunctional = nonFuncMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim());
  }

  const scaleMatch = text.match(/## SCALE_MATH\n([\s\S]*?)(?=\n## |$)/i);
  if (scaleMatch) {
    sections.scaleMath = scaleMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => {
      const parts = l.replace(/^-\s*/, '').split(':');
      return { label: parts[0]?.trim() || '', value: parts.slice(1).join(':').trim() };
    });
  }

  const archMatch = text.match(/## ARCHITECTURE\n```[\s\S]*?```/i) || text.match(/## ARCHITECTURE\n([\s\S]*?)(?=\n## |$)/i);
  if (archMatch) {
    sections.architecture = archMatch[0].replace(/## ARCHITECTURE\n/, '').replace(/```/g, '').trim();
  }

  const layerMatch = text.match(/## LAYER_DESIGN\n([\s\S]*?)(?=\n## |$)/i);
  if (layerMatch) {
    sections.layerDesign = layerMatch[1].split('\n').filter(l => l.trim().match(/^\d+\./)).map(l => {
      const match = l.match(/^\d+\.\s*([^:]+):\s*(.*)/);
      return match ? { name: match[1].trim(), desc: match[2].trim() } : { name: l.trim(), desc: '' };
    });
  }

  const edgeMatch = text.match(/## EDGE_CASES\n([\s\S]*?)(?=\n## |$)/i);
  if (edgeMatch) {
    sections.edgeCases = edgeMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => {
      const parts = l.replace(/^-\s*/, '').split(':');
      return { name: parts[0]?.trim() || '', desc: parts.slice(1).join(':').trim() };
    });
  }

  const tradeMatch = text.match(/## TRADE_OFFS\n([\s\S]*?)(?=\n## |$)/i);
  if (tradeMatch) {
    sections.tradeOffs = tradeMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => {
      const content = l.replace(/^-\s*/, '');
      const vsMatch = content.match(/(.+?)\s+vs\.\s+(.+?):\s*(.*)/i);
      if (vsMatch) {
        const becauseMatch = vsMatch[3].match(/because:?\s*(.*)/i);
        return {
          optionA: vsMatch[1].trim(),
          optionB: vsMatch[2].trim(),
          reason: becauseMatch ? becauseMatch[1].trim() : vsMatch[3].trim(),
        };
      }
      return { optionA: content, optionB: '', reason: '' };
    });
  }

  return sections;
}

// Render the structured system design answer
function SystemDesignAnswer({ text, isStreaming }) {
  const sections = parseSystemDesignAnswer(text);

  if (!sections || (!sections.approach && !sections.functional.length)) {
    // Fallback to raw text if not structured
    return (
      <div className="p-4 text-xs text-neutral-200 whitespace-pre-wrap font-mono">
        {text}
        {isStreaming && <span className="animate-pulse ml-1">▊</span>}
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 text-xs">
      {/* Approach Banner */}
      {sections.approach && (
        <div className="bg-gradient-to-r from-brand-500/20 to-brand-400/5 border border-brand-400/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-brand-400 text-neutral-900">Approach</span>
          </div>
          <p className="text-neutral-100 leading-relaxed">{sections.approach}</p>
        </div>
      )}

      {/* Three Column Layout: Functional, Non-Functional, Scale Math */}
      <div className="grid grid-cols-3 gap-2">
        {/* Functional */}
        {sections.functional.length > 0 && (
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Functional</h3>
            <ul className="space-y-1">
              {sections.functional.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-neutral-300">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Non-Functional */}
        {sections.nonFunctional.length > 0 && (
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Non-Functional</h3>
            <ul className="space-y-1">
              {sections.nonFunctional.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-neutral-300">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Scale Math */}
        {sections.scaleMath.length > 0 && (
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Scale Math</h3>
            <div className="space-y-1">
              {sections.scaleMath.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <span className="text-neutral-500 shrink-0">{item.label}</span>
                  <span className="text-amber-300 text-right font-mono text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column: Architecture and Layer Design */}
      <div className="grid grid-cols-2 gap-2">
        {/* Architecture Diagram */}
        {sections.architecture && (
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2">Architecture</h3>
            <pre className="text-xs text-green-300 font-mono whitespace-pre overflow-x-auto leading-tight">
              {sections.architecture}
            </pre>
          </div>
        )}

        {/* Layer Design */}
        {sections.layerDesign.length > 0 && (
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Layer Design</h3>
            <ol className="space-y-1">
              {sections.layerDesign.map((item, i) => (
                <li key={i} className="text-neutral-300">
                  <span className="text-blue-400 font-bold mr-1">{i + 1}.</span>
                  <span className="text-blue-300">{item.name}:</span>{' '}
                  <span className="text-neutral-400">{item.desc}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Two Column: Edge Cases and Trade-offs */}
      <div className="grid grid-cols-2 gap-2">
        {/* Edge Cases */}
        {sections.edgeCases.length > 0 && (
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">Edge Cases</h3>
            <div className="space-y-2">
              {sections.edgeCases.map((item, i) => (
                <div key={i}>
                  <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30 mr-2">
                    {item.name}
                  </span>
                  <span className="text-neutral-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trade-offs */}
        {sections.tradeOffs.length > 0 && (
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">Trade-Offs</h3>
            <div className="space-y-2">
              {sections.tradeOffs.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-orange-300 font-medium">{item.optionA}</span>
                    <span className="text-neutral-500">vs.</span>
                    <span className="text-orange-300">{item.optionB}</span>
                  </div>
                  <p className="text-neutral-500 text-xs pl-2 border-l border-orange-500/30">
                    because: {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isStreaming && <span className="animate-pulse text-brand-400">▊</span>}
    </div>
  );
}

export default function VoiceAssistantPanel({ onClose, provider = 'claude', model, isDedicatedWindow = false }) {
  // Session management
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [isConnected, setIsConnected] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Audio state
  const [audioLevel, setAudioLevel] = useState(0);
  const [vadThreshold, setVadThreshold] = useState(VAD_CONFIG.THRESHOLD);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Status
  const [status, setStatus] = useState({ state: 'idle', msg: 'Connecting...' });

  // Q&A content
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Context documents
  const [expandedContext, setExpandedContext] = useState(null);
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem('voice_jd') || '');
  const [resume, setResume] = useState(() => localStorage.getItem('voice_resume') || '');
  const [prepMaterial, setPrepMaterial] = useState(() => localStorage.getItem('voice_prep') || '');

  // Audio source selection
  const [audioSource, setAudioSource] = useState('mic');
  const [audioDevices, setAudioDevices] = useState({ inputs: [] });
  const [selectedMic, setSelectedMic] = useState('');

  // Transcription provider - Deepgram only
  const transcriptionProvider = 'deepgram';

  // Error state
  const [error, setError] = useState(null);

  // Refs
  const eventSourceRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // VAD state refs
  const chunksRef = useRef([]);
  const inSpeechRef = useRef(false);
  const speechStartTimeRef = useRef(null);
  const silenceStartTimeRef = useRef(null);
  const processingRef = useRef(false);

  // Save context to localStorage
  useEffect(() => { localStorage.setItem('voice_jd', jobDescription); }, [jobDescription]);
  useEffect(() => { localStorage.setItem('voice_resume', resume); }, [resume]);
  useEffect(() => { localStorage.setItem('voice_prep', prepMaterial); }, [prepMaterial]);

  // Load audio devices
  useEffect(() => {
    async function loadDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === 'audioinput');
        setAudioDevices({ inputs });
        const savedMic = localStorage.getItem('interview_mic');
        if (savedMic && inputs.find(d => d.deviceId === savedMic)) {
          setSelectedMic(savedMic);
        } else if (inputs.length > 0) {
          setSelectedMic(inputs[0].deviceId);
        }
      } catch (err) {
        console.error('Device enumeration failed:', err);
      }
    }
    loadDevices();
  }, []);

  useEffect(() => {
    if (selectedMic) localStorage.setItem('interview_mic', selectedMic);
  }, [selectedMic]);

  // Initialize SSE connection
  useEffect(() => {
    let mounted = true;
    let eventSource = null;

    const initSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/voice/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            sessionId, provider, model, jobDescription, resume, prepMaterial, transcriptionProvider,
          }),
        });

        if (!mounted || !res.ok) return;

        eventSource = new EventSource(`${API_URL}/api/voice/events?sessionId=${sessionId}`);
        eventSourceRef.current = eventSource;

        let hasConnected = false;

        eventSource.onopen = () => {
          if (!mounted) return;
          hasConnected = true;
          setIsConnected(true);
          setError(null);
          setStatus({ state: 'ready', msg: 'Ready' });
        };

        eventSource.onerror = () => {
          if (!mounted) return;
          if (hasConnected) {
            setIsConnected(false);
            setStatus({ state: 'error', msg: 'Reconnecting...' });
          }
        };

        eventSource.addEventListener('connected', () => {
          if (!mounted) return;
          hasConnected = true;
          setIsConnected(true);
          setStatus({ state: 'ready', msg: 'Ready' });
        });

        eventSource.addEventListener('status', (e) => {
          if (!mounted) return;
          const data = JSON.parse(e.data);
          setStatus({ state: data.state, msg: data.msg });
          if (data.state === 'write') setIsGenerating(true);
        });

        eventSource.addEventListener('question', (e) => {
          if (!mounted) return;
          const data = JSON.parse(e.data);
          setCurrentQuestion(data.text);
          setStreamingAnswer('');
          setAnswer('');
        });

        eventSource.addEventListener('token', (e) => {
          if (!mounted) return;
          const data = JSON.parse(e.data);
          setStreamingAnswer(prev => prev + data.t);
        });

        eventSource.addEventListener('answer', (e) => {
          if (!mounted) return;
          const data = JSON.parse(e.data);
          setAnswer(data.raw);
          setStreamingAnswer('');
          setIsGenerating(false);
        });

        eventSource.addEventListener('error', (e) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(e.data);
            setError(data.msg);
            setIsGenerating(false);
          } catch {}
        });

      } catch (err) {
        if (!mounted) return;
        setError(`Connection failed: ${err.message}`);
      }
    };

    initSession();

    return () => {
      mounted = false;
      eventSource?.close();
      eventSourceRef.current?.close();
    };
  }, [sessionId]);

  // Send audio for transcription
  const sendAudioForTranscription = useCallback(async (audioBlob) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      setStatus({ state: 'transcribe', msg: 'Transcribing...' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'speech.webm');
      formData.append('sessionId', sessionId);

      const res = await fetch(`${API_URL}/api/voice/transcribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      setError(`Transcription failed: ${err.message}`);
      setStatus({ state: 'ready', msg: 'Listening...' });
    } finally {
      processingRef.current = false;
    }
  }, [sessionId]);

  // VAD processing
  const processVAD = useCallback((rms) => {
    if (isPaused || processingRef.current) return;
    const now = Date.now();

    if (rms > vadThreshold) {
      if (!inSpeechRef.current) {
        inSpeechRef.current = true;
        speechStartTimeRef.current = now;
        silenceStartTimeRef.current = null;
        setIsSpeaking(true);
        setStatus({ state: 'listen', msg: 'Listening...' });
      }
      if (now - speechStartTimeRef.current >= VAD_CONFIG.MAX_SPEECH_DURATION_MS) {
        finishSpeechSegment();
      }
    } else {
      if (inSpeechRef.current) {
        if (!silenceStartTimeRef.current) silenceStartTimeRef.current = now;
        if (now - silenceStartTimeRef.current >= VAD_CONFIG.SILENCE_DURATION_MS) {
          if (now - speechStartTimeRef.current >= VAD_CONFIG.MIN_SPEECH_DURATION_MS) {
            finishSpeechSegment();
          } else {
            resetVADState();
            setStatus({ state: 'ready', msg: 'Listening...' });
          }
        }
      }
    }
  }, [vadThreshold, isPaused]);

  const finishSpeechSegment = useCallback(() => {
    if (!mediaRecorderRef.current || chunksRef.current.length === 0) {
      resetVADState();
      return;
    }
    mediaRecorderRef.current.stop();
  }, []);

  const resetVADState = useCallback(() => {
    inSpeechRef.current = false;
    speechStartTimeRef.current = null;
    silenceStartTimeRef.current = null;
    chunksRef.current = [];
    setIsSpeaking(false);
  }, []);

  const startNewRecordingSegment = useCallback(() => {
    if (!streamRef.current) return;
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm'].find(MediaRecorder.isTypeSupported) || 'audio/webm';
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      if (chunksRef.current.length > 0 && inSpeechRef.current) {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        sendAudioForTranscription(audioBlob);
      }
      resetVADState();
      if (isRecording && streamRef.current) {
        setTimeout(() => {
          if (isRecording && streamRef.current) startNewRecordingSegment();
        }, 100);
      }
    };

    mediaRecorder.start(100);
  }, [isRecording, sendAudioForTranscription, resetVADState]);

  const monitorAudio = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const rms = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    setAudioLevel(rms);
    processVAD(rms);
    animationFrameRef.current = requestAnimationFrame(monitorAudio);
  }, [processVAD]);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingDuration(0);
      resetVADState();

      let stream;
      if (audioSource === 'system') {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const virtualDevice = devices.find(d => d.kind === 'audioinput' && (d.label.toLowerCase().includes('blackhole') || d.label.toLowerCase().includes('loopback')));
        if (virtualDevice) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: virtualDevice.deviceId }, echoCancellation: false, noiseSuppression: false } });
        } else {
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          stream.getVideoTracks().forEach(t => t.stop());
        }
      } else {
        const constraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
        if (selectedMic) constraints.deviceId = { exact: selectedMic };
        stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
      }

      streamRef.current = stream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      startNewRecordingSegment();
      durationIntervalRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
      setIsRecording(true);
      setIsPaused(false);
      setStatus({ state: 'ready', msg: 'Listening...' });
      monitorAudio();
    } catch (err) {
      setError('Recording error: ' + err.message);
    }
  };

  const stopRecording = async () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    resetVADState();
    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
    setStatus({ state: 'idle', msg: 'Stopped' });
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      monitorAudio();
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const calibrate = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const samples = [];
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setStatus({ state: 'calibrate', msg: 'Calibrating...' });

      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 50));
        analyser.getByteFrequencyData(dataArray);
        samples.push(dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255);
      }

      stream.getTracks().forEach(t => t.stop());
      audioContext.close();

      const sorted = [...samples].sort((a, b) => a - b);
      const p85 = sorted[Math.floor(sorted.length * 0.85)] || VAD_CONFIG.THRESHOLD;
      setVadThreshold(Math.max(p85 * 2.5, VAD_CONFIG.THRESHOLD));
      setStatus({ state: 'ready', msg: 'Calibrated' });
    } catch (err) {
      setError('Calibration failed');
    }
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getStatusColor = () => {
    switch (status.state) {
      case 'ready': case 'listen': return '#2dd4bf';
      case 'transcribe': return '#f59e0b';
      case 'write': return '#6366f1';
      case 'error': return '#ef4444';
      default: return '#64748b';
    }
  };

  useEffect(() => () => stopRecording(), []);

  const displayAnswer = streamingAnswer || answer;

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-850" style={isDedicatedWindow ? { WebkitAppRegion: 'drag', paddingTop: '1.5rem' } : {}}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center bg-brand-400/20">
              <span className="text-brand-400 text-xs font-bold">IA</span>
            </div>
            <span className="text-sm font-semibold text-neutral-200">Interview Assistant</span>
          </div>

          {/* Audio Source Toggle */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700/50">
            <span className="text-xs text-neutral-500 uppercase mr-1">Audio</span>
            <button onClick={() => !isRecording && setAudioSource('system')} disabled={isRecording} className={`px-2 py-0.5 text-xs font-medium rounded ${audioSource === 'system' ? 'bg-brand-400 text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'}`}>
              Capture
            </button>
            <button onClick={() => !isRecording && setAudioSource('mic')} disabled={isRecording} className={`px-2 py-0.5 text-xs font-medium rounded ${audioSource === 'mic' ? 'bg-brand-400 text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'}`}>
              Mic
            </button>
          </div>

          {/* Mic Selector */}
          {audioSource === 'mic' && audioDevices.inputs.length > 1 && (
            <select value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)} disabled={isRecording} className="px-2 py-1 text-xs rounded bg-neutral-800 border border-neutral-700/50 text-neutral-300 max-w-[150px]">
              {audioDevices.inputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Mic'}</option>)}
            </select>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          {/* Audio Level */}
          {isRecording && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-neutral-800">
              <span className="text-xs text-neutral-500">rms</span>
              <span className="text-xs font-mono text-neutral-300 w-12">{audioLevel.toFixed(4)}</span>
              <span className="text-xs text-neutral-500">thr</span>
              <span className="text-xs font-mono text-neutral-300 w-12">{vadThreshold.toFixed(4)}</span>
            </div>
          )}

          {/* Record/Stop */}
          {!isRecording ? (
            <button onClick={startRecording} disabled={!isConnected} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50">
              <div className="w-2 h-2 rounded-full bg-white" />
              Record
            </button>
          ) : (
            <>
              <button onClick={togglePause} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isPaused ? 'bg-brand-400 text-neutral-900' : 'bg-amber-500 text-white'}`}>
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={stopRecording} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-700 text-white hover:bg-neutral-600">
                <div className="w-2 h-2 rounded bg-rose-500" />
                Stop
              </button>
            </>
          )}

          <button onClick={calibrate} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" title="Calibrate">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>

          {/* Status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-800">
            <div className="w-2 h-2 rounded-full" style={{ background: getStatusColor() }} />
            <span className="text-xs text-neutral-400">{status.msg}</span>
            {isRecording && <span className="text-xs font-mono text-rose-400">{formatDuration(recordingDuration)}</span>}
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 text-xs flex items-center justify-between bg-rose-500/10 border-b border-rose-500/30 text-rose-400">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">✕</button>
        </div>
      )}

      {/* Question Banner */}
      {currentQuestion && (
        <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-850">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Question</span>
          </div>
          <p className="text-sm text-neutral-200">{currentQuestion}</p>
        </div>
      )}

      {/* Answer Area */}
      <div className="flex-1 overflow-y-auto">
        {displayAnswer ? (
          <SystemDesignAnswer text={displayAnswer} isStreaming={!!streamingAnswer} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Ready for System Design</p>
            <p className="text-xs text-neutral-500">Click Record and ask a question like "Design a URL shortener"</p>
          </div>
        )}
      </div>

      {/* Context Footer */}
      <div className="px-3 py-2 border-t border-neutral-800 bg-neutral-850">
        <div className="flex gap-2">
          {['jd', 'resume', 'prep'].map((type) => {
            const value = type === 'jd' ? jobDescription : type === 'resume' ? resume : prepMaterial;
            const label = type === 'jd' ? 'Job Description' : type === 'resume' ? 'Resume' : 'Prep Notes';
            return (
              <button key={type} onClick={() => setExpandedContext(expandedContext === type ? null : type)} className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${expandedContext === type ? 'bg-brand-400 text-neutral-900' : value ? 'bg-brand-400/20 text-brand-400 border border-brand-400/30' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                {label} {value && '✓'}
              </button>
            );
          })}
        </div>
        {expandedContext && (
          <textarea
            value={expandedContext === 'jd' ? jobDescription : expandedContext === 'resume' ? resume : prepMaterial}
            onChange={(e) => {
              if (expandedContext === 'jd') setJobDescription(e.target.value);
              else if (expandedContext === 'resume') setResume(e.target.value);
              else setPrepMaterial(e.target.value);
            }}
            placeholder={`Paste ${expandedContext === 'jd' ? 'job description' : expandedContext === 'resume' ? 'resume' : 'prep notes'}...`}
            className="mt-2 w-full h-24 px-3 py-2 text-xs bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none focus:border-brand-400"
          />
        )}
      </div>
    </div>
  );
}
