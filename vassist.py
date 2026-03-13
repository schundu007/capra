#!/usr/bin/env python3
from __future__ import annotations

import dataclasses
import json
import logging
import os
import re
import signal
import sys
import threading
import time
import webbrowser
import queue
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout
from typing import Optional

for _mod, _fix in [
    ("sounddevice",        "brew install portaudio && pip install sounddevice"),
    ("speech_recognition", "pip install SpeechRecognition"),
    ("anthropic",          "pip install anthropic"),
    ("numpy",              "pip install numpy"),
    ("flask",              "pip install flask"),
]:
    try:
        __import__(_mod)
    except (ImportError, OSError):
        sys.exit(f"\n✗  {_mod} not found\n  Fix: {_fix}\n")

import numpy as np
import sounddevice as sd
import speech_recognition as sr_lib
from anthropic import Anthropic
from flask import Flask, Response, jsonify, request

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ia")


@dataclasses.dataclass(frozen=True)
class AppConfig:
    sample_rate:    int   = 16_000
    block_size:     int   = 512
    silence_secs:   float = 1.2
    min_speech:     float = 0.4
    max_speech:     float = 45.0
    energy_floor:   float = 0.006
    model:          str   = "claude-haiku-4-5-20251001"
    max_tok_quick:  int   = 600
    max_tok_design: int   = 3_000
    context_turns:  int   = 6
    max_history:    int   = 20
    stt_timeout:    float = 8.0
    port:           int   = 7_878
    max_q_len:      int   = 500
    ask_cooldown:   float = 1.5

CFG = AppConfig()

_BLOCK_DUR = CFG.block_size / CFG.sample_rate
SIL_BLOCKS = int(CFG.silence_secs / _BLOCK_DUR)
MIN_BLOCKS  = int(CFG.min_speech   / _BLOCK_DUR)
MAX_BLOCKS  = int(CFG.max_speech   / _BLOCK_DUR)


class AudioState:
    def __init__(self) -> None:
        self._lock      = threading.RLock()
        self.running    = False
        self.busy       = False
        self.threshold  = CFG.energy_floor
        self.stream: Optional[sd.InputStream] = None
        self.frames:    list[np.ndarray] = []
        self.speech_n   = 0
        self.silence_n  = 0
        self.in_speech  = False

    def acquire_busy(self) -> bool:
        with self._lock:
            if self.busy:
                return False
            self.busy = True
            return True

    def release_busy(self) -> None:
        with self._lock:
            self.busy = False

    def update(self, **kwargs) -> None:
        with self._lock:
            for k, v in kwargs.items():
                setattr(self, k, v)

    def lock(self) -> threading.RLock:
        return self._lock

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "running":   self.running,
                "busy":      self.busy,
                "threshold": round(self.threshold, 5),
            }


class ConversationHistory:
    def __init__(self, max_messages: int) -> None:
        self._lock     = threading.Lock()
        self._messages: list[dict] = []
        self._max      = max_messages

    def append(self, role: str, content: str) -> None:
        with self._lock:
            self._messages.append({"role": role, "content": content})
            while len(self._messages) > self._max:
                if self._messages and self._messages[0]["role"] == "user":
                    self._messages.pop(0)
                if self._messages and self._messages[0]["role"] == "assistant":
                    self._messages.pop(0)

    def recent(self, n: int) -> list[dict]:
        with self._lock:
            return list(self._messages[-n:])

    def __len__(self) -> int:
        with self._lock:
            return len(self._messages)


class SSEBroadcaster:
    _SUB_QUEUE_SIZE = 200

    def __init__(self) -> None:
        self._lock  = threading.Lock()
        self._subs: set[queue.Queue] = set()
        self._inbox: queue.Queue     = queue.Queue(maxsize=1_000)

    def push(self, event: str, data: dict) -> None:
        try:
            self._inbox.put_nowait({"event": event, "data": data})
        except queue.Full:
            log.warning("SSE inbox full — event '%s' dropped", event)

    def subscribe(self) -> queue.Queue:
        q: queue.Queue = queue.Queue(maxsize=self._SUB_QUEUE_SIZE)
        with self._lock:
            self._subs.add(q)
        return q

    def unsubscribe(self, q: queue.Queue) -> None:
        with self._lock:
            self._subs.discard(q)

    def subscriber_count(self) -> int:
        with self._lock:
            return len(self._subs)

    def run(self) -> None:
        log.info("SSE broadcaster started")
        while True:
            try:
                evt = self._inbox.get(timeout=1)
                dead: set[queue.Queue] = set()
                with self._lock:
                    snapshot = set(self._subs)
                for q in snapshot:
                    try:
                        q.put_nowait(evt)
                    except queue.Full:
                        dead.add(q)
                if dead:
                    with self._lock:
                        self._subs -= dead
                    log.warning("Evicted %d slow SSE subscriber(s)", len(dead))
            except queue.Empty:
                pass
            except Exception:
                log.exception("SSE broadcaster error")


class _RateLimiter:
    def __init__(self, min_interval: float) -> None:
        self._lock     = threading.Lock()
        self._last     = 0.0
        self._interval = min_interval

    def allowed(self) -> bool:
        with self._lock:
            now = time.monotonic()
            if now - self._last >= self._interval:
                self._last = now
                return True
            return False


API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
if not API_KEY:
    sys.exit("\n✗  ANTHROPIC_API_KEY not set\n  Run: export ANTHROPIC_API_KEY='sk-ant-...'\n")

audio       = AudioState()
history     = ConversationHistory(max_messages=CFG.max_history)
broadcaster = SSEBroadcaster()
client      = Anthropic(api_key=API_KEY)
recognizer  = sr_lib.Recognizer()

_main_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="ia-main")
_stt_executor  = ThreadPoolExecutor(max_workers=2, thread_name_prefix="ia-stt")
_ask_gate      = _RateLimiter(min_interval=CFG.ask_cooldown)
_start_time    = time.monotonic()


def push(event: str, data: dict) -> None:
    broadcaster.push(event, data)


def _handle_shutdown(signum, frame) -> None:
    log.info("Shutdown signal received (%s)", signum)
    with audio.lock():
        audio.running = False
        stream = audio.stream
    if stream:
        try:
            stream.stop(); stream.close()
        except Exception:
            pass
    push("status", {"state": "idle", "msg": "Server shutting down…"})
    time.sleep(0.3)
    _main_executor.shutdown(wait=False)
    _stt_executor.shutdown(wait=False)
    sys.exit(0)

signal.signal(signal.SIGTERM, _handle_shutdown)
signal.signal(signal.SIGINT,  _handle_shutdown)


SYSTEM = """You are an elite interview coach for Sudhakar Chundu, Senior DevOps and Cloud Infrastructure Engineer, 18 plus years experience. Speak in first person as Sudhakar.

PROFILE:
- Trackonomy Systems: leads 6-person team (DevOps/GPU/Network/Security), 30 plus SaaS platforms, AWS/Azure/GCP/Oracle Cloud
- 73% infra cost reduction | 99.97% uptime | 90% fewer production incidents | 60% MTTR improvement
- 87% Azure sprawl eliminated | Zero SOC2/HIPAA/FedRAMP audit findings | Team grew 1 to 6
- CKA and HashiCorp Terraform Associate certified
- Stack: Kubernetes, Terraform, Helm, ArgoCD, Prometheus, Grafana, ELK, Vault, Istio, GitHub Actions
- History: TCS (11yr) -> NTT Data -> Wipro OSDU (Shell/BP/Chevron) -> Trackonomy Systems

SYSTEM DESIGN QUESTIONS — triggered when question contains: "design", "architect", "build a", "scale", "system for", "how would you design", "how would you build"

Output ALL blocks in THIS EXACT ORDER. Concise — renders as dashboard. Max 7 lines per section.

[REQUIREMENTS]
FUNCTIONAL:
- core capability 1
- core capability 2
- core capability 3
- core capability 4
- core capability 5
NON-FUNCTIONAL:
- Scale: X MAU, Y msg/sec
- Latency: less than Xms p99
- Availability: 99.XX% SLA
- Consistency: eventual/strong
- Durability: replication, retention
[/REQUIREMENTS]

[SCALEMATH]
- DAU: X, writes/sec: Y
- Storage/day: X GB, /year: Y TB
- Bandwidth: X Gbps in, Y Gbps out
- Cache hit target: X%
- Peak QPS: X reads, Y writes
[/SCALEMATH]

[HEADLINE]
One sharp sentence. Your architectural philosophy for this system.
[/HEADLINE]

[DIAGRAM]
Compact ASCII. One clean flow. Max 20 lines. Use box-drawing chars and arrows.
[/DIAGRAM]

[DEEPDESIGN]
STRICT: 7 numbered lines ONLY. Format: N. LayerName: tech plus one key decision.
1. Client: tech, protocol
2. API GW: routing, auth, rate-limit
3. Core Svc: pattern, responsibility
4. Queue: tech, partition key
5. DB: tech, sharding
6. Cache: what cached, TTL
7. CDN: media/static delivery
[/DEEPDESIGN]

[EDGECASES]
- crash mid-write: mitigation
- hot partition: mitigation
- split-brain: mitigation
- duplicate delivery: mitigation
- cascade failure: mitigation
[/EDGECASES]

[TRADEOFFS]
Decision: X | vs: Y | because: Z (one line each, max 4)
[/TRADEOFFS]

ALL OTHER QUESTIONS — default output

Auto-detect question type:
- WORKFLOW/PROCESS (how does X work, walk me through, trace the path) -> include [DIAGRAM]
- EXPLAIN/CONCEPT (what is X, define X) -> [ANSWER] only, optional [DIAGRAM]
- BEHAVIORAL (tell me about a time) -> [ANSWER] only
- OPINION/APPROACH (how would you) -> [ANSWER] only

Output in this exact order:

[HEADLINE]
One sentence. Sharp. Your architectural philosophy. No filler.
[/HEADLINE]

[DIAGRAM]
ONLY for workflow/process questions. Compact ASCII flow. Max 18 lines.
[/DIAGRAM]

[ANSWER]
3 bullet points ONLY:
- [key concept]: one sharp sentence
- [personal experience]: At Trackonomy, I ... one sentence with metric
- [outcome]: what this means in practice
[/ANSWER]

[FOLLOWUP]
Q1: most likely follow-up
A1: one sentence answer
Q2: second follow-up
A2: one sentence answer
[/FOLLOWUP]

RULES:
1. [HEADLINE] + [ANSWER] + [FOLLOWUP] are mandatory every time for non-design questions.
2. [ANSWER] = exactly 3 bullets. No prose paragraphs.
3. Never output markdown outside tags: no ##, no ---, no **.
4. Never add meta-commentary.
5. [DIAGRAM] must use ASCII box-drawing chars only."""


_BLOCK_RE     = re.compile(r'\[(\w+)(?:\s+lang=(\w+))?\](.*?)\[/\1\]', re.DOTALL)
_CODE_LANG_RE = re.compile(r'\[CODE\s+(?:lang=)?(\w+)\]', re.IGNORECASE)


def parse_answer(raw: str) -> list[dict]:
    cleaned = re.sub(r'^#{1,4}\s+.*$', '', raw, flags=re.MULTILINE)
    cleaned = re.sub(r'^\s*[-*]{3,}\s*$', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'\*\*', '', cleaned)

    blocks: list[dict] = []
    for match in _BLOCK_RE.finditer(cleaned):
        tag  = match.group(1).upper()
        lang = match.group(2) or ""
        body = match.group(3).strip()
        if tag == "CODE" and not lang:
            lm   = _CODE_LANG_RE.search(raw[match.start():match.end()])
            lang = lm.group(1) if lm else "bash"
        if body:
            blocks.append({"type": tag, "content": body, "lang": lang})
    return blocks


_DESIGN_KWS = frozenset(
    {"design", "architect", "build a", "scale", "system for",
     "how would you design", "how would you build"}
)


def transcribe(audio_np: np.ndarray) -> str:
    pcm  = (np.clip(audio_np, -1.0, 1.0) * 32767).astype(np.int16).tobytes()
    data = sr_lib.AudioData(pcm, CFG.sample_rate, 2)

    def _call() -> str:
        try:
            return recognizer.recognize_google(data)
        except sr_lib.UnknownValueError:
            return ""
        except sr_lib.RequestError as exc:
            log.warning("STT RequestError: %s", exc)
            return f"[STT error: {exc}]"

    future = _stt_executor.submit(_call)
    try:
        return future.result(timeout=CFG.stt_timeout)
    except FuturesTimeout:
        log.warning("STT timed out after %.1fs", CFG.stt_timeout)
        future.cancel()
        return ""
    except Exception as exc:
        log.exception("STT unexpected error: %s", exc)
        return ""


def run_agent(question: str, use_search: bool = False) -> None:
    messages = history.recent(CFG.context_turns) + [{"role": "user", "content": question}]

    if use_search:
        push("status", {"state": "search", "msg": "Running web search…"})
        try:
            search_resp = client.messages.create(
                model=CFG.model,
                max_tokens=1_500,
                system=(
                    "You are a research assistant. Use web_search to find current facts, "
                    "versions, CVEs, and DORA/CNCF metrics relevant to the question. "
                    "Return only a concise JSON summary of findings."
                ),
                messages=messages,
                tools=[{"type": "web_search_20250305", "name": "web_search"}],
            )
            ctx = "".join(
                b.text for b in search_resp.content
                if hasattr(b, "text") and b.text
            )
            if ctx.strip():
                messages = history.recent(CFG.context_turns) + [
                    {"role": "user", "content": f"{question}\n\n[Search context: {ctx[:800]}]"}
                ]
        except Exception:
            log.warning("Web search failed — answering without context")

    q_lower   = question.lower()
    is_design = any(kw in q_lower for kw in _DESIGN_KWS)
    max_tok   = CFG.max_tok_design if is_design else CFG.max_tok_quick

    push("status",       {"state": "write",  "msg": "Generating…"})
    push("stream_start", {"question": question, "is_design": is_design})

    chunks: list[str] = []
    try:
        with client.messages.stream(
            model=CFG.model,
            max_tokens=max_tok,
            system=SYSTEM,
            messages=messages,
        ) as stream:
            for token in stream.text_stream:
                chunks.append(token)
                push("token", {"t": token})
    except Exception as exc:
        log.exception("Anthropic stream error: %s", exc)
        push("error",  {"msg": str(exc)})
        push("status", {"state": "ready", "msg": "Listening…"})
        return

    answer = "".join(chunks)
    if answer.strip():
        history.append("user",      question)
        history.append("assistant", answer)
        push("answer", {
            "question": question,
            "raw":      answer,
            "parsed":   parse_answer(answer),
        })
        log.info("Answer done  design=%s  q='%s…'", is_design, question[:50])
    else:
        log.warning("Empty response for q='%s…'", question[:50])

    push("status", {"state": "ready", "msg": "Listening…"})


def audio_callback(indata: np.ndarray, frames: int, time_info, sd_status) -> None:
    if sd_status:
        log.debug("sounddevice status: %s", sd_status)

    mono = indata[:, 0] if indata.ndim > 1 else indata.flatten()
    rms  = float(np.sqrt(np.mean(mono ** 2)))

    push("level", {"rms": round(rms, 5), "threshold": round(audio.threshold, 5)})

    with audio.lock():
        if not audio.running:
            return

        thr = audio.threshold

        if rms > thr:
            if not audio.in_speech:
                audio.in_speech  = True
                audio.frames     = []
                audio.speech_n   = 0
                audio.silence_n  = 0
                if not audio.busy:
                    push("status", {"state": "listen", "msg": "Capturing speech…"})
            audio.frames.append(mono.copy())
            audio.speech_n  += 1
            audio.silence_n  = 0
            if audio.speech_n >= MAX_BLOCKS:
                _trigger_transcription_locked()
        else:
            if audio.in_speech:
                audio.frames.append(mono.copy())
                audio.silence_n += 1
                if audio.silence_n >= SIL_BLOCKS:
                    if audio.speech_n >= MIN_BLOCKS:
                        _trigger_transcription_locked()
                    else:
                        audio.in_speech = False
                        audio.frames    = []
                        if not audio.busy:
                            push("status", {"state": "ready", "msg": "Listening…"})


def _trigger_transcription_locked() -> None:
    if audio.busy:
        audio.in_speech = False
        audio.frames    = []
        return
    if not audio.frames:
        return
    audio.busy       = True
    captured         = np.concatenate(audio.frames)
    audio.in_speech  = False
    audio.frames     = []
    audio.speech_n   = 0
    audio.silence_n  = 0
    _main_executor.submit(_process_audio, captured)


def _process_audio(audio_np: np.ndarray) -> None:
    try:
        push("status", {"state": "transcribe", "msg": "Transcribing…"})
        question = transcribe(audio_np).strip()
        if not question:
            push("status", {"state": "ready", "msg": "Didn't catch that — listening…"})
            return
        push("question", {"text": question})
        run_agent(question)
    except Exception:
        log.exception("_process_audio unhandled error")
        push("error",  {"msg": "Audio processing error — see server logs"})
        push("status", {"state": "ready", "msg": "Listening…"})
    finally:
        audio.release_busy()


app = Flask(__name__)
app.logger.setLevel(logging.WARNING)


@app.route("/")
def index() -> Response:
    return Response(HTML_PAGE, mimetype="text/html")


@app.route("/health")
def health() -> Response:
    return jsonify({
        "ok":          True,
        "uptime_s":    round(time.monotonic() - _start_time, 1),
        "audio":       audio.snapshot(),
        "subscribers": broadcaster.subscriber_count(),
        "history_len": len(history),
        "model":       CFG.model,
        "version":     "7.0",
    })


@app.route("/reset", methods=["POST"])
def reset() -> Response:
    with history._lock:
        history._messages.clear()
    push("status", {"state": "ready", "msg": "Context reset — fresh session"})
    log.info("Conversation history cleared")
    return jsonify({"ok": True})


@app.route("/devices")
def devices() -> Response:
    try:
        devs = [
            {"index": i, "name": d["name"]}
            for i, d in enumerate(sd.query_devices())
            if d["max_input_channels"] > 0
        ]
    except Exception as exc:
        log.error("Failed to query audio devices: %s", exc)
        return jsonify({"error": str(exc)}), 500
    return jsonify(devs)


@app.route("/start", methods=["POST"])
def start() -> Response:
    with audio.lock():
        if audio.running:
            return jsonify({"ok": False, "msg": "Already running"})
        audio.frames    = []
        audio.speech_n  = 0
        audio.silence_n = 0
        audio.in_speech = False
        audio.busy      = False

    idx = (request.json or {}).get("device_index")

    try:
        stream = sd.InputStream(
            device=idx, channels=1, dtype="float32",
            samplerate=CFG.sample_rate, blocksize=CFG.block_size,
            callback=audio_callback,
        )
        stream.start()
        audio.update(stream=stream, running=True)
        push("status", {"state": "ready", "msg": "Listening…"})
        log.info("Audio started  device=%s", idx)
        return jsonify({"ok": True})
    except Exception as exc:
        log.error("Failed to start audio device %s: %s", idx, exc)
        return jsonify({"ok": False, "msg": str(exc)})


@app.route("/stop", methods=["POST"])
def stop() -> Response:
    audio.update(running=False)
    with audio.lock():
        stream = audio.stream
        audio.stream = None
    if stream:
        try:
            stream.stop()
            stream.close()
        except Exception as exc:
            log.warning("Error stopping stream: %s", exc)
    push("status", {"state": "idle", "msg": "Stopped"})
    log.info("Audio stopped")
    return jsonify({"ok": True})


@app.route("/calibrate", methods=["POST"])
def calibrate() -> Response:
    if audio.running:
        return jsonify({"ok": False, "msg": "Stop audio capture before calibrating"}), 409

    idx = (request.json or {}).get("device_index")

    def _run() -> None:
        push("status", {"state": "calibrate", "msg": "Measuring ambient noise…"})
        samples: list[float] = []

        def _cb(data, *_):
            samples.append(float(np.sqrt(np.mean(data ** 2))))

        try:
            with sd.InputStream(
                device=idx, channels=1, dtype="float32",
                samplerate=CFG.sample_rate, blocksize=CFG.block_size,
                callback=_cb,
            ):
                time.sleep(2.2)

            thr = max(
                float(np.percentile(samples, 85) if samples else CFG.energy_floor) * 2.5,
                CFG.energy_floor,
            )
            audio.update(threshold=thr)
            push("calibrate_done", {"threshold": round(thr, 5)})
            push("status", {"state": "ready", "msg": f"Calibrated — threshold {thr:.4f}"})
            log.info("Calibration done  thr=%.5f", thr)
        except Exception as exc:
            log.error("Calibration failed: %s", exc)
            push("status", {"state": "warn", "msg": f"Calibration failed: {exc}"})

    _main_executor.submit(_run)
    return jsonify({"ok": True})


@app.route("/ask", methods=["POST"])
def ask() -> Response:
    if not _ask_gate.allowed():
        return jsonify({"ok": False, "msg": "Too fast — wait a moment"}), 429

    data       = request.json or {}
    raw_q      = str(data.get("question", ""))
    question   = raw_q.strip()[:CFG.max_q_len]
    use_search = bool(data.get("use_search", False))

    if not question:
        return jsonify({"ok": False, "msg": "Question is empty"}), 400

    if not audio.acquire_busy():
        return jsonify({"ok": False, "msg": "Busy — try again in a moment"}), 409

    push("question", {"text": question})

    def _go() -> None:
        try:
            run_agent(question, use_search=use_search)
        finally:
            audio.release_busy()

    _main_executor.submit(_go)
    return jsonify({"ok": True})


@app.route("/stream")
def stream() -> Response:
    def _generate():
        cq = broadcaster.subscribe()
        try:
            while True:
                try:
                    evt = cq.get(timeout=20)
                    yield f"event: {evt['event']}\ndata: {json.dumps(evt['data'])}\n\n"
                except queue.Empty:
                    yield ": ping\n\n"
        except GeneratorExit:
            pass
        finally:
            broadcaster.unsubscribe(cq)

    return Response(
        _generate(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control":                "no-cache",
            "X-Accel-Buffering":            "no",
            "Connection":                   "keep-alive",
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        },
    )


HTML_PAGE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Interview Assistant · Neural</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#03030c;--bg2:#070714;
  --surface:rgba(255,255,255,0.03);--surface2:rgba(255,255,255,0.055);
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --indigo:#6366f1;--indigo2:#818cf8;--indigo3:rgba(99,102,241,0.15);--indigo4:rgba(99,102,241,0.08);
  --emerald:#10b981;--emerald2:#34d399;
  --amber:#f59e0b;--amber2:#fbbf24;
  --rose:#f43f5e;--rose2:#fb7185;
  --violet:#8b5cf6;--violet2:#a78bfa;
  --cyan:#06b6d4;--cyan2:#22d3ee;
  --text:#f1f1f8;--text2:#b4b4d0;--text3:#7b7ba0;--text4:#4a4a6a;
  --sans:'Plus Jakarta Sans',system-ui,sans-serif;
  --display:'Syne',system-ui,sans-serif;
  --mono:'JetBrains Mono','Fira Mono',monospace;
  --r:12px;--r2:8px;--r3:6px;
}
html,body{height:100%;width:100%;background:var(--bg);color:var(--text);font-family:var(--sans);font-size:14px;line-height:1.6;overflow:hidden;-webkit-font-smoothing:antialiased;}
body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse 600px 400px at 15% 10%,rgba(99,102,241,0.08) 0%,transparent 70%),
             radial-gradient(ellipse 500px 350px at 85% 85%,rgba(16,185,129,0.06) 0%,transparent 70%),
             radial-gradient(ellipse 400px 300px at 50% 50%,rgba(139,92,246,0.03) 0%,transparent 60%);}
::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.18)}

#app{position:relative;z-index:1;display:grid;grid-template-rows:56px 1fr;height:100vh;width:100vw;}

/* ── HEADER ─────────────────────────────────────────────────────────── */
#header{
  display:flex;align-items:center;
  background:rgba(3,3,12,0.92);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  position:relative;z-index:100;overflow:hidden;
  gap:0;
}
.h-logo{display:flex;align-items:center;gap:10px;padding:0 16px;border-right:1px solid var(--border);height:100%;flex-shrink:0;}
.h-logo-mark{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,var(--indigo) 0%,var(--violet) 100%);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:12px;font-weight:800;color:#fff;letter-spacing:-0.03em;flex-shrink:0;box-shadow:0 0 16px rgba(99,102,241,0.4);}
.h-logo-name{font-family:var(--display);font-size:11px;font-weight:700;color:var(--text);letter-spacing:0.01em;line-height:1.1;}
.h-logo-ver{font-family:var(--mono);font-size:8px;font-weight:300;color:var(--text4);letter-spacing:0.04em;}

.h-sep{width:1px;height:22px;background:var(--border);margin:0 8px;flex-shrink:0;}

/* Device */
.h-device{display:flex;align-items:center;gap:7px;padding:0 8px;flex-shrink:0;}
.h-dev-label{display:flex;align-items:center;gap:4px;}
.h-dev-badge{font-family:var(--mono);font-size:7px;font-weight:700;letter-spacing:0.1em;padding:2px 5px;border-radius:3px;background:rgba(16,185,129,0.12);color:var(--emerald);border:1px solid rgba(16,185,129,0.25);}
.h-dev-text{font-family:var(--mono);font-size:8.5px;font-weight:500;letter-spacing:0.08em;color:var(--emerald);text-transform:uppercase;}
select#dev-sel{
  appearance:none;background:var(--surface);color:var(--text2);
  border:1px solid rgba(16,185,129,0.25);border-radius:var(--r3);
  padding:4px 22px 4px 8px;font-family:var(--mono);font-size:9.5px;
  cursor:pointer;outline:none;width:176px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234a4a6a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 6px center;
  transition:border-color 0.2s;
}
select#dev-sel:focus{border-color:var(--emerald);box-shadow:0 0 0 2px rgba(16,185,129,0.12);}

/* Waveform */
.h-wave-wrap{display:flex;align-items:center;gap:8px;padding:0 10px;border-left:1px solid var(--border);border-right:1px solid var(--border);flex-shrink:0;}
#wave-canvas{display:block;border-radius:4px;background:rgba(255,255,255,0.02);border:1px solid var(--border);}
.h-levels{display:flex;flex-direction:column;gap:2px;}
.h-level-row{font-family:var(--mono);font-size:8px;color:var(--text4);white-space:nowrap;}
.h-level-row span{color:var(--text3);}

/* Ask input */
.h-ask{display:flex;align-items:center;gap:6px;padding:0 10px;flex:1;min-width:140px;}
#ask-input{
  flex:1;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r3);padding:6px 10px;
  font-family:var(--sans);font-size:11.5px;font-weight:400;color:var(--text);
  outline:none;transition:border-color 0.2s,box-shadow 0.2s;min-width:0;
}
#ask-input::placeholder{color:var(--text4);}
#ask-input:focus{border-color:var(--indigo);box-shadow:0 0 0 2px rgba(99,102,241,0.1);}
.h-send{width:30px;height:30px;border-radius:var(--r3);background:var(--indigo4);border:1px solid rgba(99,102,241,0.25);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;color:var(--indigo2);transition:all 0.18s;}
.h-send:hover{background:var(--indigo3);border-color:rgba(99,102,241,0.5);}
.h-send svg{width:13px;height:13px;stroke:currentColor;}

/* Buttons */
.h-btns{display:flex;align-items:center;gap:5px;padding:0 8px;flex-shrink:0;border-left:1px solid var(--border);}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:5px 11px;font-family:var(--display);font-size:10px;font-weight:600;border-radius:var(--r3);cursor:pointer;transition:all 0.18s cubic-bezier(0.4,0,0.2,1);white-space:nowrap;border:1px solid transparent;letter-spacing:0.01em;}
.btn-primary{background:linear-gradient(135deg,var(--indigo) 0%,var(--violet) 100%);color:#fff;}
.btn-primary:hover{box-shadow:0 0 16px rgba(99,102,241,0.4);transform:translateY(-1px);}
.btn-primary:active{transform:translateY(0);}
.btn-danger{background:rgba(244,63,94,0.1);color:var(--rose2);border-color:rgba(244,63,94,0.25);}
.btn-danger:hover{background:rgba(244,63,94,0.18);border-color:rgba(244,63,94,0.4);}
.btn-ghost{background:transparent;color:var(--text3);border-color:var(--border);}
.btn-ghost:hover{background:var(--surface);color:var(--text2);border-color:var(--border2);}
.btn-hist{position:relative;}
#hist-badge{position:absolute;top:-5px;right:-6px;min-width:15px;height:15px;padding:0 3px;border-radius:8px;background:var(--indigo);color:#fff;font-size:8px;font-weight:700;display:none;align-items:center;justify-content:center;font-family:var(--mono);}

/* Status */
.h-status{display:flex;align-items:center;gap:8px;padding:0 12px;border-left:1px solid var(--border);flex-shrink:0;}
.s-dot{width:7px;height:7px;border-radius:50%;background:var(--text4);flex-shrink:0;transition:background 0.3s;}
.s-dot.s-ready{background:var(--emerald);box-shadow:0 0 6px rgba(16,185,129,0.5);}
.s-dot.s-listen{background:var(--emerald);animation:pdot 1s ease-in-out infinite;}
.s-dot.s-transcribe{background:var(--amber);}
.s-dot.s-write,.s-dot.s-search{background:var(--indigo);animation:pdot 1.2s ease-in-out infinite;}
.s-dot.s-error{background:var(--rose);}
.s-dot.s-warn{background:var(--amber);}
.s-dot.s-calibrate{background:var(--violet);animation:pdot 1s ease-in-out infinite;}
@keyframes pdot{0%,100%{opacity:1}50%{opacity:0.3}}
.s-msg{font-family:var(--mono);font-size:9.5px;color:var(--text3);white-space:nowrap;letter-spacing:0.02em;}
#h-clock{font-family:var(--mono);font-size:9px;font-weight:300;color:var(--text4);letter-spacing:0.06em;padding:0 12px;border-left:1px solid var(--border);flex-shrink:0;}

/* ── MAIN ─────────────────────────────────────────────────────────── */
#main{overflow:hidden;background:transparent;position:relative;display:flex;flex-direction:column;height:100%;}

/* Empty state */
#empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;animation:fade-up 0.6s ease both;}
.es-rings{position:relative;width:90px;height:90px;margin-bottom:20px;flex-shrink:0;}
.es-ring{position:absolute;border-radius:50%;border:1px solid rgba(99,102,241,0.15);animation:ring-expand 3s ease-in-out infinite;}
.es-ring:nth-child(1){inset:28px;animation-delay:0s}
.es-ring:nth-child(2){inset:14px;animation-delay:0.4s;border-color:rgba(99,102,241,0.1)}
.es-ring:nth-child(3){inset:0;animation-delay:0.8s;border-color:rgba(99,102,241,0.06)}
.es-ring-core{position:absolute;inset:32px;border-radius:50%;background:linear-gradient(135deg,var(--indigo),var(--violet));box-shadow:0 0 18px rgba(99,102,241,0.5);animation:core-pulse 2.4s ease-in-out infinite;}
@keyframes ring-expand{0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.06);opacity:0.4}}
@keyframes core-pulse{0%,100%{box-shadow:0 0 18px rgba(99,102,241,0.5)}50%{box-shadow:0 0 32px rgba(99,102,241,0.8)}}
.es-title{font-family:var(--display);font-size:20px;font-weight:700;color:var(--text);letter-spacing:-0.01em;}

/* Answer frame */
#answer-frame{display:none;flex-direction:column;height:100%;padding:10px 16px 8px;gap:6px;overflow:hidden;flex:1;}
#answer-frame.show{display:flex;}

#q-header{display:flex;align-items:baseline;gap:10px;flex-shrink:0;padding-bottom:8px;border-bottom:1px solid var(--border);}
.q-label{font-family:var(--mono);font-size:8.5px;font-weight:700;color:var(--indigo2);letter-spacing:0.12em;background:rgba(99,102,241,0.1);padding:2px 6px;border-radius:3px;flex-shrink:0;}
#q-text{font-family:var(--display);font-size:14px;font-weight:600;color:var(--text);line-height:1.3;letter-spacing:-0.01em;}

/* Thinking */
#thinking{display:none;align-items:center;gap:10px;padding:8px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);flex-shrink:0;}
#thinking.show{display:flex;}
.think-orb{width:28px;height:28px;border-radius:50%;flex-shrink:0;background:conic-gradient(from 0deg,var(--indigo),var(--violet),var(--cyan),var(--indigo));animation:orb-spin 1.8s linear infinite;position:relative;}
.think-orb::after{content:'';position:absolute;inset:3px;border-radius:50%;background:var(--bg2);}
@keyframes orb-spin{to{transform:rotate(360deg)}}
.think-label{font-family:var(--display);font-size:11px;font-weight:600;color:var(--text);}
.think-dots::after{content:'';animation:dots 1.6s steps(4,end) infinite;}
@keyframes dots{0%{content:''}25%{content:'.'}50%{content:'..'}75%{content:'...'}100%{content:''}}

/* Stream block */
#stream-block{display:none;flex-shrink:0;border-radius:var(--r);border:1px solid rgba(99,102,241,0.2);background:linear-gradient(135deg,rgba(99,102,241,0.05) 0%,rgba(139,92,246,0.03) 100%);padding:14px 18px;margin-bottom:6px;}
#stream-block.show{display:block;}
.stream-header{display:flex;align-items:center;gap:7px;font-family:var(--mono);font-size:9px;font-weight:500;color:var(--indigo2);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;}
.stream-spinner{width:10px;height:10px;border-radius:50%;border:1.5px solid rgba(99,102,241,0.2);border-top-color:var(--indigo);animation:spin 0.8s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
#stream-text{font-family:var(--mono);font-size:11.5px;font-weight:300;color:var(--text2);line-height:1.8;white-space:pre-wrap;word-break:break-word;}

/* Answer blocks */
#answer-blocks{display:flex;flex-direction:column;gap:5px;overflow-y:auto;overflow-x:hidden;min-height:0;flex:1;padding-bottom:8px;align-items:stretch;}
@keyframes fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.blk{animation:fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both;}

/* Followup bar */
#followup-bar{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex-shrink:0;}
.fu-card{border-radius:var(--r2);border:1px solid rgba(245,158,11,0.18);background:rgba(245,158,11,0.04);padding:9px 12px;min-height:56px;overflow:hidden;}
.fu-card-placeholder{font-family:var(--mono);font-size:9px;color:var(--text4);font-style:italic;}
.fu-card-q{display:flex;align-items:baseline;gap:6px;margin-bottom:3px;}
.fu-card-q-label{font-family:var(--mono);font-size:7.5px;font-weight:700;letter-spacing:0.1em;color:var(--amber2);background:rgba(245,158,11,0.1);padding:1px 5px;border-radius:3px;flex-shrink:0;}
.fu-card-q-text{font-size:11px;font-weight:500;color:var(--text);line-height:1.4;}
.fu-card-a{font-family:var(--sans);font-size:10px;font-weight:300;color:var(--text3);line-height:1.4;margin-top:2px;}
.fu-card-actions{display:flex;gap:5px;margin-top:4px;}
.fu-nav-btn,.fu-ask-btn{font-family:var(--mono);font-size:8px;font-weight:500;padding:2px 7px;border-radius:3px;cursor:pointer;transition:all 0.15s;user-select:none;}
.fu-nav-btn{color:var(--text3);border:1px solid var(--border);background:transparent;}
.fu-nav-btn:hover{color:var(--text);border-color:var(--border2);background:var(--surface);}
.fu-ask-btn{color:var(--amber);border:1px solid rgba(245,158,11,0.25);background:rgba(245,158,11,0.06);}
.fu-ask-btn:hover{background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.4);}

/* Follow-up append */
.fu-divider{display:flex;align-items:center;gap:10px;padding:7px 12px;border-radius:var(--r2);border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.04);flex-shrink:0;margin-top:4px;}
.fu-div-label{font-family:var(--mono);font-size:8px;font-weight:700;letter-spacing:0.12em;color:var(--indigo2);background:rgba(99,102,241,0.12);padding:2px 6px;border-radius:3px;flex-shrink:0;}
.fu-div-q{font-family:var(--display);font-size:12px;font-weight:600;color:var(--text);line-height:1.3;}
.stream-inline-wrap{padding:8px 12px;flex-shrink:0;border:1px solid rgba(99,102,241,0.15);border-radius:var(--r2);background:rgba(99,102,241,0.03);}
.stream-inline-text{font-family:var(--mono);font-size:11px;font-weight:300;color:var(--text2);line-height:1.7;white-space:pre-wrap;word-break:break-word;max-height:80px;overflow:hidden;}

/* Block base */
.b{border-radius:var(--r);border:1px solid var(--border);background:var(--surface);overflow:hidden;position:relative;}
.b-tag{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:8.5px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:9px;padding:2px 7px;border-radius:4px;}

/* HEADLINE */
.b-headline{padding:9px 14px;background:linear-gradient(135deg,rgba(99,102,241,0.08) 0%,rgba(139,92,246,0.05) 100%);border-color:rgba(99,102,241,0.2);flex-shrink:0;}
.b-headline .b-tag{background:rgba(99,102,241,0.12);color:var(--indigo2);margin-bottom:5px;}
.b-headline-text{font-family:var(--display);font-size:13px;font-weight:700;line-height:1.3;letter-spacing:-0.01em;background:linear-gradient(135deg,var(--text) 40%,var(--indigo2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

/* ANSWER */
.b-answer{padding:10px 14px;border-color:rgba(255,255,255,0.07);flex-shrink:0;}
.b-answer .b-tag{background:rgba(6,182,212,0.1);color:var(--cyan2);margin-bottom:7px;}
.ans-list{display:flex;flex-direction:column;gap:5px;}
.ans-bullet{display:flex;align-items:baseline;gap:8px;padding:5px 8px;border-radius:5px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);transition:background 0.12s;}
.ans-bullet:hover{background:rgba(6,182,212,0.04);}
.ans-dot{font-size:6px;color:var(--cyan2);flex-shrink:0;margin-top:3px;opacity:0.7;}
.ans-line{font-family:var(--sans);font-size:12.5px;font-weight:300;color:var(--text2);line-height:1.5;}
.ans-label{font-family:var(--sans);font-size:12.5px;font-weight:600;color:var(--text);}
.ans-sep{color:var(--text4);margin:0 2px;}

/* DIAGRAM */
.b-diagram{padding:10px 14px;background:rgba(6,182,212,0.025);border-color:rgba(6,182,212,0.18);flex-shrink:0;}
.b-diagram .b-tag{background:rgba(6,182,212,0.1);color:var(--cyan2);margin-bottom:7px;}
.diag-art{font-family:var(--mono);font-size:10.5px;line-height:1.5;color:var(--cyan2);white-space:pre;overflow-x:auto;overflow-y:hidden;max-height:220px;text-shadow:0 0 8px rgba(6,182,212,0.2);}

/* FOLLOWUP block */
.b-followup{padding:10px 14px;}
.b-followup .b-tag{background:rgba(255,255,255,0.05);color:var(--text4);}
.fu{padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
.fu:last-child{border-bottom:none;padding-bottom:0;}
.fu-q{display:flex;align-items:baseline;gap:7px;font-family:var(--sans);font-size:11px;font-weight:500;color:var(--amber2);margin-bottom:4px;}
.fu-a{font-family:var(--sans);font-size:12px;font-weight:300;color:var(--text3);line-height:1.6;padding-left:18px;border-left:1px solid rgba(255,255,255,0.08);margin-left:3px;}

/* CODE */
.b-code{border-color:rgba(139,92,246,0.15);}
.code-header{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(139,92,246,0.12);}
.code-lang-wrap{display:flex;align-items:center;gap:7px;}
.code-dots{display:flex;gap:4px;}
.code-dot{width:7px;height:7px;border-radius:50%;}
.code-dot:nth-child(1){background:rgba(244,63,94,0.4)}.code-dot:nth-child(2){background:rgba(245,158,11,0.4)}.code-dot:nth-child(3){background:rgba(16,185,129,0.4)}
.code-lang{font-family:var(--mono);font-size:9px;font-weight:500;color:var(--violet2);text-transform:uppercase;letter-spacing:0.1em;}
.code-copy{font-family:var(--mono);font-size:9px;color:var(--text4);cursor:pointer;padding:2px 8px;border:1px solid var(--border);border-radius:3px;background:transparent;transition:all 0.15s;}
.code-copy:hover{color:var(--text2);border-color:var(--border2);background:var(--surface);}
.b-code pre{margin:0;padding:14px 16px;font-family:var(--mono)!important;font-size:11.5px;line-height:1.7;background:#0a0a18!important;overflow-x:auto;}
.b-code pre code{background:transparent!important;font-family:var(--mono)!important;}

/* PLAIN */
.b-plain-text{font-family:var(--sans);font-size:12.5px;font-weight:300;color:var(--text3);line-height:1.8;}
.b-plain-text p+p{margin-top:7px;}

/* ── SYSTEM DESIGN ─────────────────────────────────────────────────── */
#sd-frame{display:flex;flex-direction:column;gap:5px;}
.sd-headline{display:flex;align-items:center;gap:10px;padding:5px 10px;border-radius:var(--r2);border:1px solid rgba(99,102,241,0.2);background:linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04));flex-shrink:0;}
.sd-headline-label{font-family:var(--mono);font-size:7.5px;font-weight:700;letter-spacing:0.12em;color:var(--indigo2);background:rgba(99,102,241,0.12);padding:2px 5px;border-radius:3px;flex-shrink:0;white-space:nowrap;}
.sd-headline-text{font-family:var(--display);font-size:11px;font-weight:600;color:var(--text);line-height:1.3;letter-spacing:-0.01em;}
.sd-zone-a{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;align-items:start;}
.sd-zone-b{display:grid;grid-template-columns:1fr 1fr;gap:5px;align-items:start;}
.sd-right{display:flex;flex-direction:column;gap:5px;}
.sd-bottom{display:grid;grid-template-columns:1fr 1fr;gap:5px;align-items:start;}
.sd-card{border-radius:var(--r2);border:1px solid var(--border);background:var(--surface);padding:6px 9px;}
.sd-card-title{font-family:var(--display);font-size:7.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid var(--border);white-space:nowrap;}
.sd-title-indigo{color:var(--indigo2)}.sd-title-violet{color:var(--violet2)}.sd-title-emerald{color:var(--emerald2)}.sd-title-amber{color:var(--amber2)}.sd-title-cyan{color:var(--cyan2)}
.sd-diag-card{border-radius:var(--r2);border:1px solid rgba(6,182,212,0.15);background:rgba(6,182,212,0.02);padding:6px 9px;align-self:start;}
.sd-diag-title{font-family:var(--display);font-size:7.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--cyan2);margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid rgba(6,182,212,0.15);white-space:nowrap;}
.sd-diag-body pre{font-family:var(--mono);font-size:8.5px;line-height:1.3;color:var(--cyan2);text-shadow:0 0 6px rgba(6,182,212,0.2);white-space:pre;margin:0;overflow-x:auto;}
.req-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1px;}
.req-list li{display:flex;align-items:baseline;gap:4px;font-family:var(--sans);font-size:9.5px;font-weight:300;color:var(--text2);line-height:1.3;}
.req-list li::before{content:'';width:3px;height:3px;border-radius:50%;background:var(--indigo);flex-shrink:0;margin-top:4px;}
.req-list-nf li::before{background:var(--violet);}
.sc-grid{display:flex;flex-direction:column;gap:1px;}
.sc-row{display:flex;justify-content:space-between;align-items:baseline;padding:2px 4px;border-radius:3px;background:rgba(255,255,255,0.02);}
.sc-k{font-family:var(--mono);font-size:8.5px;color:var(--text4);}
.sc-v{font-family:var(--mono);font-size:8.5px;font-weight:600;color:var(--emerald2);}
.sc-full{font-family:var(--mono);font-size:8.5px;color:var(--text3);padding:1px 4px;}
.dp-list{display:flex;flex-direction:column;gap:1px;}
.dp-item{display:flex;align-items:baseline;gap:5px;padding:1px 0;}
.dp-n{font-family:var(--mono);font-size:7.5px;font-weight:700;color:var(--violet2);width:11px;text-align:right;flex-shrink:0;}
.dp-t{font-family:var(--sans);font-size:9.5px;font-weight:300;color:var(--text2);line-height:1.3;}
.ec-list{display:flex;flex-direction:column;gap:2px;}
.ec-item{display:flex;align-items:baseline;gap:4px;}
.ec-tag{font-family:var(--mono);font-size:7.5px;font-weight:600;color:var(--amber2);background:rgba(245,158,11,0.1);padding:1px 4px;border-radius:3px;flex-shrink:0;white-space:nowrap;}
.ec-val{font-family:var(--sans);font-size:9.5px;color:var(--text2);line-height:1.3;}
.to-list2{display:flex;flex-direction:column;gap:3px;}
.to-item{padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);}
.to-item:last-child{border-bottom:none;}
.to-header{display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;}
.to-pick{font-family:var(--mono);font-size:8.5px;font-weight:600;color:var(--cyan2);}
.to-sep{font-family:var(--mono);font-size:7.5px;color:var(--text4);}
.to-alt2{font-family:var(--mono);font-size:8.5px;color:var(--text3);}
.to-reason2{font-family:var(--sans);font-size:9px;color:var(--text2);line-height:1.3;padding-left:2px;}
.to-plain{font-family:var(--sans);font-size:9px;color:var(--text2);line-height:1.3;}
.sd-shimmer{color:var(--text4)!important;opacity:0.5;font-style:italic;font-size:9px;}
.sd-shimmer-lines{display:flex;flex-direction:column;gap:5px;padding:3px 0;}
.sd-shimmer-lines::before,.sd-shimmer-lines::after{content:'';display:block;height:7px;border-radius:3px;background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 100%);background-size:200% 100%;animation:shimmer-slide 1.4s ease-in-out infinite;}
.sd-shimmer-lines::after{width:70%;}
@keyframes shimmer-slide{0%{background-position:200% 0}100%{background-position:-200% 0}}
.sd-filled{animation:sd-pop 0.3s cubic-bezier(0.22,1,0.36,1) both;}
@keyframes sd-pop{from{opacity:0.4;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}

/* ── HISTORY MODAL ─────────────────────────────────────────────────── */
#hist-modal{
  position:fixed;inset:0;z-index:1000;
  background:rgba(0,0,0,0.55);backdrop-filter:blur(5px);
  display:none;align-items:flex-start;justify-content:flex-end;
  padding:60px 16px 16px;
}
#hist-modal.open{display:flex;}
.modal-panel{
  width:300px;max-height:calc(100vh - 80px);
  background:rgba(7,7,20,0.97);border:1px solid var(--border2);
  border-radius:var(--r);display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,0.6);
  animation:fade-up 0.2s ease both;
}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--border);}
.modal-title{font-family:var(--display);font-size:12px;font-weight:700;color:var(--text);}
.modal-close{width:22px;height:22px;border-radius:4px;background:transparent;border:1px solid var(--border);color:var(--text3);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;line-height:1;}
.modal-close:hover{background:var(--surface);color:var(--text);}
#hist-list{flex:1;overflow-y:auto;padding:4px 0 8px;}
.hist-item{display:flex;align-items:flex-start;gap:8px;padding:8px 14px;cursor:pointer;border-left:2px solid transparent;transition:all 0.15s;}
.hist-item:hover{background:rgba(255,255,255,0.03);border-left-color:var(--border2);}
.hist-item.active{background:rgba(99,102,241,0.05);border-left-color:var(--indigo);}
.hist-time{font-family:var(--mono);font-size:8.5px;color:var(--text4);flex-shrink:0;margin-top:2px;}
.hist-q{font-family:var(--sans);font-size:11px;font-weight:400;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4;}
.hist-empty{font-family:var(--mono);font-size:10px;color:var(--text4);padding:20px 16px;text-align:center;font-style:italic;}
</style>
</head>
<body>
<div id="app">

<!-- ── HEADER ──────────────────────────────────────────────────────── -->
<div id="header">
  <div class="h-logo">
    <div class="h-logo-mark">IA</div>
    <div>
      <div class="h-logo-name">Interview Assistant</div>
      <div class="h-logo-ver">Neural · v7</div>
    </div>
  </div>

  <div class="h-sep"></div>

  <div class="h-device">
    <div class="h-dev-label">
      <svg width="10" height="10" fill="none" stroke="var(--emerald)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
      <span class="h-dev-text">Audio</span>
      <span class="h-dev-badge">CAPTURE</span>
    </div>
    <select id="dev-sel"></select>
  </div>

  <div class="h-wave-wrap">
    <canvas id="wave-canvas" width="88" height="26"></canvas>
    <div class="h-levels">
      <div class="h-level-row">rms <span id="rms-v">0.0000</span></div>
      <div class="h-level-row">thr <span id="thr-v">0.0060</span></div>
    </div>
  </div>

  <div class="h-ask">
    <input type="text" id="ask-input" placeholder="Ask a question…"
           onkeydown="if(event.key==='Enter')sendManual()">
    <div class="h-send" onclick="sendManual()" title="Send">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
      </svg>
    </div>
  </div>

  <div class="h-btns">
    <button class="btn btn-primary" id="tog-btn" onclick="toggle()">
      <svg width="8" height="8" viewBox="0 0 9 9" fill="currentColor"><polygon points="2,1 8,4.5 2,8"/></svg>
      Start
    </button>
    <button class="btn btn-ghost" onclick="doCalibrate()" title="Calibrate VAD threshold">Cal</button>
    <button class="btn btn-ghost" id="search-tog" onclick="toggleSearch()">Search</button>
    <button class="btn btn-ghost" id="copy-btn" onclick="doCopy()">Copy</button>
    <button class="btn btn-ghost" onclick="doReset()" title="Clear conversation context">Reset</button>
    <button class="btn btn-ghost btn-hist" onclick="openHistory()" title="View history">
      Hist <span id="hist-badge"></span>
    </button>
  </div>

  <div class="h-status">
    <div class="s-dot" id="s-dot"></div>
    <span class="s-msg" id="s-text">Select device → Start</span>
  </div>

  <div id="h-clock"></div>
</div>

<!-- ── MAIN ────────────────────────────────────────────────────────── -->
<div id="main">
  <div id="empty-state">
    <div class="es-rings">
      <div class="es-ring"></div><div class="es-ring"></div><div class="es-ring"></div>
      <div class="es-ring-core"></div>
    </div>
    <div class="es-title">Ready to assist</div>
  </div>

  <div id="answer-frame">
    <div id="q-header">
      <span class="q-label">Q</span>
      <div id="q-text"></div>
    </div>
    <div id="thinking">
      <div class="think-orb"></div>
      <div class="think-label">Processing<span class="think-dots"></span></div>
    </div>
    <div id="stream-block">
      <div class="stream-header"><div class="stream-spinner"></div>Generating…</div>
      <div id="stream-text"></div>
    </div>
    <div id="answer-blocks"></div>
    <div id="followup-bar">
      <div class="fu-card" id="fu-card-1">
        <div class="fu-card-placeholder">Follow-up predictions will appear here</div>
      </div>
      <div class="fu-card" id="fu-card-2"></div>
    </div>
  </div>
</div>

<!-- ── HISTORY MODAL ─────────────────────────────────────────────── -->
<div id="hist-modal">
  <div class="modal-panel">
    <div class="modal-header">
      <div class="modal-title">Session History</div>
      <button class="modal-close" onclick="closeHistory()">×</button>
    </div>
    <div id="hist-list">
      <div class="hist-empty">No history yet</div>
    </div>
  </div>
</div>

</div><!-- #app -->

<script>
let on=false, qaCount=0, log=[], lastRaw='', useSearch=false;
let sessionId=0, followupTargets=[];

(function tick(){
  const n=new Date();
  const s=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0');
  const el=document.getElementById('h-clock');
  if(el)el.textContent=s;
  setTimeout(tick,1000);
})();

function setStatus(state,msg){
  const dot=document.getElementById('s-dot');
  const txt=document.getElementById('s-text');
  if(dot){dot.className='s-dot';dot.classList.add('s-'+state);}
  if(txt)txt.textContent=msg||state;
}

function toggleSearch(){
  useSearch=!useSearch;
  const btn=document.getElementById('search-tog');
  if(useSearch){
    btn.style.color='var(--cyan2)';btn.style.borderColor='rgba(6,182,212,0.4)';
    btn.textContent='Search: ON';
  }else{
    btn.style.color='';btn.style.borderColor='';
    btn.textContent='Search';
  }
}

const waveHistory=new Float32Array(64);
let waveCanvas,waveCtx;
function initWave(){
  waveCanvas=document.getElementById('wave-canvas');
  if(waveCanvas)waveCtx=waveCanvas.getContext('2d');
}
function drawWave(thr){
  if(!waveCtx)return;
  const w=waveCanvas.width,h=waveCanvas.height;
  waveCtx.clearRect(0,0,w,h);
  const bw=w/64;
  for(let i=0;i<64;i++){
    const v=waveHistory[i],bh=Math.max(2,v*h*8);
    waveCtx.fillStyle=v>thr?'rgba(16,185,129,0.7)':'rgba(99,102,241,0.3)';
    waveCtx.fillRect(i*bw,h-bh,bw-1,bh);
  }
}
function updateLevel(rms,thr){
  document.getElementById('rms-v').textContent=rms.toFixed(4);
  document.getElementById('thr-v').textContent=thr.toFixed(4);
  waveHistory.copyWithin(0,1);
  waveHistory[63]=rms;
  drawWave(thr);
}
initWave();
setInterval(()=>{
  waveHistory.copyWithin(0,1);
  waveHistory[63]=Math.random()*0.02;
  drawWave(0.006);
},120);

async function loadDevs(){
  const ds=await fetch('/devices').then(r=>r.json());
  const sel=document.getElementById('dev-sel');
  sel.innerHTML='';
  ds.forEach(d=>{
    const o=document.createElement('option');
    o.value=d.index;
    o.text=d.name;
    sel.appendChild(o);
  });
  const brioIdx=[...sel.options].findIndex(o=>/brio/i.test(o.text));
  if(brioIdx>=0){
    sel.selectedIndex=brioIdx;
  } else {
    const micIdx=[...sel.options].findIndex(o=>/microphone|mic/i.test(o.text));
    if(micIdx>=0) sel.selectedIndex=micIdx;
  }
}
loadDevs();

async function toggle(){
  const sel=document.getElementById('dev-sel');
  const btn=document.getElementById('tog-btn');
  if(!on){
    const r=await fetch('/start',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({device_index:parseInt(sel.value)})}).then(r=>r.json());
    if(r.ok){
      on=true;btn.className='btn btn-danger';
      btn.innerHTML='<svg width="8" height="8" viewBox="0 0 9 9" fill="currentColor"><rect x="1" y="1" width="7" height="7" rx="1"/></svg> Stop';
      sel.disabled=true;
    }else setStatus('warn','Error: '+r.msg);
  }else{
    await fetch('/stop',{method:'POST'});
    on=false;btn.className='btn btn-primary';
    btn.innerHTML='<svg width="8" height="8" viewBox="0 0 9 9" fill="currentColor"><polygon points="2,1 8,4.5 2,8"/></svg> Start';
    sel.disabled=false;
  }
}

async function doCalibrate(){
  const sel=document.getElementById('dev-sel');
  const r=await fetch('/calibrate',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({device_index:parseInt(sel.value)})}).then(r=>r.json());
  if(!r.ok)setStatus('warn',r.msg||'Calibrate failed');
}

async function sendManual(){
  const inp=document.getElementById('ask-input');
  const q=inp.value.trim();
  if(!q)return;
  inp.value='';inp.disabled=true;
  try{
    const res=await fetch('/ask',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question:q,use_search:useSearch})});
    if(!res.ok){const b=await res.json().catch(()=>({}));setStatus('error',b.msg||`Error ${res.status}`);}
  }catch(err){setStatus('error','Network error — is the server running?');}
  finally{inp.disabled=false;inp.focus();}
}

function doCopy(){
  if(!lastRaw)return;
  navigator.clipboard.writeText(lastRaw);
  const b=document.getElementById('copy-btn');
  b.textContent='Copied!';setTimeout(()=>b.textContent='Copy',2000);
}

async function doReset(){
  if(!confirm('Clear conversation context? The model will start fresh.'))return;
  try{
    await fetch('/reset',{method:'POST'});
    log.length=0;qaCount=0;
    const badge=document.getElementById('hist-badge');
    if(badge){badge.style.display='none';badge.textContent='';}
    const hl=document.getElementById('hist-list');
    if(hl)hl.innerHTML='<div class="hist-empty">No history yet</div>';
    setStatus('ready','Context reset — fresh session');
  }catch(err){setStatus('error','Reset failed: '+err.message);}
}

function openHistory(){
  document.getElementById('hist-modal').classList.add('open');
}
function closeHistory(){
  document.getElementById('hist-modal').classList.remove('open');
}
document.getElementById('hist-modal').addEventListener('click',function(e){
  if(e.target===this)closeHistory();
});

function copyCode(btn){
  const code=btn.closest('.b-code').querySelector('code');
  if(!code)return;
  navigator.clipboard.writeText(code.textContent);
  btn.textContent='✓ copied';
  setTimeout(()=>btn.innerHTML='&#8680; copy',2000);
}

const e=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function stripMd(s){return (s||'').replace(/\*\*/g,'').replace(/\*/g,'').trim();}
const ps=s=>{
  const clean=(s||'').replace(/^#{1,4}\s+.*/gm,'').replace(/^[-*]{3,}\s*$/gm,'').replace(/\*\*/g,'').replace(/\*/g,'');
  return clean.split(/\n\n+/).map(p=>p.trim()).filter(Boolean).slice(0,3).map(p=>`<p>${e(p)}</p>`).join('');
};

const SYSDESIGN_TYPES=new Set(['REQUIREMENTS','SCALEMATH','DIAGRAM','DEEPDESIGN','EDGECASES','TRADEOFFS']);

function buildBlock(b,delay=0){
  const d=document.createElement('div');
  d.className='blk';
  d.style.animationDelay=delay+'ms';

  switch(b.type){
    case 'HEADLINE':
      d.classList.add('b-headline');
      d.innerHTML=`<div class="b-tag">&#9670; Core Answer</div>
        <div class="b-headline-text">${e(stripMd(b.content))}</div>`;
      break;

    case 'ANSWER':{
      d.classList.add('b-answer');
      const lines=(b.content||'').split('\n')
        .map(l=>stripMd(l).replace(/^[•\-\*]\s*/,'').trim()).filter(Boolean);
      const bullets=lines.map(l=>{
        const ci=l.indexOf(':');
        if(ci>0&&ci<40)return `<div class="ans-bullet"><span class="ans-dot">◆</span><span class="ans-line"><strong class="ans-label">${e(l.slice(0,ci).trim())}</strong><span class="ans-sep">:</span>${e(l.slice(ci+1).trim())}</span></div>`;
        return `<div class="ans-bullet"><span class="ans-dot">◆</span><span class="ans-line">${e(l)}</span></div>`;
      }).join('');
      d.innerHTML=`<div class="b-tag">&#9656; Key Points</div><div class="ans-list">${bullets}</div>`;
      break;
    }

    case 'DIAGRAM':{
      d.classList.add('b-diagram');
      d.innerHTML=`<div class="b-tag">&#9654; Flow</div><div class="diag-art">${e((b.content||'').trim())}</div>`;
      break;
    }

    case 'CODE':{
      const lang=(b.lang||'bash').toLowerCase();
      d.classList.add('b-code');
      d.innerHTML=`<div class="code-header">
        <div class="code-lang-wrap">
          <div class="code-dots"><div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div></div>
          <span class="code-lang">${lang}</span>
        </div>
        <button class="code-copy" onclick="copyCode(this)">&#8680; copy</button>
      </div>`;
      const pre=document.createElement('pre');
      const codeEl=document.createElement('code');
      codeEl.className=`language-${lang}`;
      codeEl.textContent=b.content;
      pre.appendChild(codeEl);
      d.appendChild(pre);
      requestAnimationFrame(()=>{if(window.hljs)hljs.highlightElement(codeEl);});
      break;
    }

    case 'FOLLOWUP':{
      let html='',lines=(b.content||'').split('\n').map(l=>l.trim()).filter(Boolean);
      for(let i=0;i<lines.length;i++){
        if(/^Q\d*:/i.test(lines[i])){
          html+=`<div class="fu"><div class="fu-q"><span style="font-size:9px;opacity:0.7">Q&nbsp;</span>${e(lines[i].replace(/^Q\d*:/i,'').trim())}</div>`;
          if(i+1<lines.length&&/^A\d*:/i.test(lines[i+1])){
            html+=`<div class="fu-a">${e(lines[i+1].replace(/^A\d*:/i,'').trim())}</div>`;i++;
          }
          html+='</div>';
        }
      }
      if(!html)html=`<div class="fu"><div class="fu-q">${e(b.content)}</div></div>`;
      d.classList.add('b-followup');
      d.innerHTML=`<div class="b-tag">&#8644; Follow-ups</div>${html}`;
      break;
    }

    case 'plain':{
      const txt=(b.content||'').replace(/^#{1,4}\s+.*/gm,'').replace(/^[-*]{3,}\s*$/gm,'').replace(/\*\*/g,'').trim();
      if(!txt)return null;
      d.classList.add('b-plain');
      d.innerHTML=`<div class="b-plain-text">${ps(txt)}</div>`;
      break;
    }

    default:return null;
  }
  return d;
}

function renderFollowupBar(blocks){
  const fuBlock=blocks.find(b=>b.type==='FOLLOWUP');
  const c1=document.getElementById('fu-card-1');
  const c2=document.getElementById('fu-card-2');
  if(!c1)return;
  if(!fuBlock){
    c1.innerHTML='<div class="fu-card-placeholder">Follow-up predictions will appear here</div>';
    if(c2)c2.innerHTML='';return;
  }
  const lines=fuBlock.content.split('\n').map(l=>l.trim()).filter(Boolean);
  const pairs=[];
  for(let i=0;i<lines.length;i++){
    if(/^Q\d*:/i.test(lines[i])){
      const q=stripMd(lines[i].replace(/^Q\d*:\s*/i,''));
      const a=i+1<lines.length&&/^A\d*:/i.test(lines[i+1])?stripMd(lines[i+1].replace(/^A\d*:\s*/i,'')):'' ;
      if(a)i++;pairs.push({q,a});
    }
  }
  followupTargets=pairs.map(p=>({q:p.q,fromSession:sessionId}));
  [c1,c2].forEach((card,idx)=>{
    if(!card)return;
    const p=pairs[idx];
    if(!p){card.innerHTML='';return;}
    const fromSid=sessionId;
    card.innerHTML=
      `<div class="fu-card-q"><span class="fu-card-q-label">Q${idx+1}</span><span class="fu-card-q-text">${e(p.q)}</span></div>
       <div class="fu-card-a">${e(p.a)}</div>
       <div class="fu-card-actions">
         <span class="fu-nav-btn" onclick="scrollToSession(${fromSid})">&#8593; view</span>
         <span class="fu-ask-btn" onclick="sendFollowupQ('${p.q.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">&rarr; ask</span>
       </div>`;
  });
}

function scrollToSession(sid){
  const area=document.getElementById('answer-blocks');
  if(!sid)return;
  if(String(area.dataset.firstSession)===String(sid)){area.scrollTo({top:0,behavior:'smooth'});return;}
  const el=document.getElementById('session-'+sid);
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
}

async function sendFollowupQ(qText){
  if(!qText)return;
  closeHistory();
  try{
    const res=await fetch('/ask',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question:qText,use_search:useSearch})});
    if(!res.ok){const b=await res.json().catch(()=>({}));setStatus('error',b.msg||`Error ${res.status}`);}
  }catch(err){setStatus('error','Network error — is the server running?');}
}

function render(blocks){
  const area=document.getElementById('answer-blocks');
  area.innerHTML='';
  const isSysDesign=blocks.some(b=>SYSDESIGN_TYPES.has(b.type));
  if(isSysDesign){
    renderSysDesign(blocks,area);
  }else{
    let delay=0;
    blocks.forEach(b=>{
      if(b.type==='FOLLOWUP')return;
      const el=buildBlock(b,delay);
      if(!el)return;
      area.appendChild(el);delay+=60;
    });
  }
  renderFollowupBar(blocks);
  safeHighlight(area);
}

function renderSysDesign(blocks,area){
  const byType={};
  (Array.isArray(blocks)?blocks:[]).forEach(b=>{byType[b.type]=b;});

  const frame=document.createElement('div');
  frame.id='sd-frame';

  const hlTxt=byType.HEADLINE?stripMd(byType.HEADLINE.content):'';
  const hlDiv=document.createElement('div');
  hlDiv.className='sd-headline blk';
  hlDiv.innerHTML=`<span class="sd-headline-label">&#9670; Approach</span><span class="sd-headline-text" id="sd-hl-text">${hlTxt?e(hlTxt):'<span class="sd-shimmer">Generating architecture…</span>'}</span>`;
  frame.appendChild(hlDiv);

  const zA=document.createElement('div');zA.className='sd-zone-a blk';zA.style.animationDelay='40ms';
  zA.innerHTML=`
    <div class="sd-card"><div class="sd-card-title sd-title-indigo">Functional</div><div id="sd-func-body"><div class="sd-shimmer-lines"></div></div></div>
    <div class="sd-card"><div class="sd-card-title sd-title-violet">Non-Functional</div><div id="sd-nonfunc-body"><div class="sd-shimmer-lines"></div></div></div>
    <div class="sd-card"><div class="sd-card-title sd-title-emerald">Scale Math</div><div id="sd-scale-body"><div class="sd-shimmer-lines"></div></div></div>`;
  frame.appendChild(zA);

  const zB=document.createElement('div');zB.className='sd-zone-b blk';zB.style.animationDelay='80ms';
  zB.innerHTML=`
    <div class="sd-diag-card" id="sd-diag"><div class="sd-diag-title">&#9723; Architecture</div><div class="sd-diag-body" id="sd-diag-body"><div class="sd-shimmer-lines"></div></div></div>
    <div class="sd-right">
      <div class="sd-card"><div class="sd-card-title sd-title-violet">Layer Design</div><div id="sd-deep-body"><div class="sd-shimmer-lines"></div></div></div>
      <div class="sd-bottom">
        <div class="sd-card"><div class="sd-card-title sd-title-amber">Edge Cases</div><div id="sd-edge-body"><div class="sd-shimmer-lines"></div></div></div>
        <div class="sd-card"><div class="sd-card-title sd-title-cyan">Trade-offs</div><div id="sd-to-body"><div class="sd-shimmer-lines"></div></div></div>
      </div>
    </div>`;
  frame.appendChild(zB);
  area.appendChild(frame);

  if(byType.REQUIREMENTS)fillRequirements(byType.REQUIREMENTS.content);
  if(byType.SCALEMATH)   fillScale(byType.SCALEMATH.content);
  if(byType.DIAGRAM)     fillDiagram(byType.DIAGRAM.content);
  if(byType.DEEPDESIGN)  fillDeep(byType.DEEPDESIGN.content);
  if(byType.EDGECASES)   fillEdge(byType.EDGECASES.content);
  if(byType.TRADEOFFS)   fillTradeoffs(byType.TRADEOFFS.content);
}

function fillRequirements(content){
  const lines=content.split('\n').map(l=>stripMd(l).replace(/^[-*]\s*/,'')).filter(Boolean);
  const func=[],nfunc=[];let mode=null;
  lines.forEach(l=>{
    if(/^FUNCTIONAL/i.test(l)){mode='f';return;}
    if(/^NON.FUNCTIONAL/i.test(l)){mode='n';return;}
    if(mode==='f')func.push(l);if(mode==='n')nfunc.push(l);
  });
  const fb=document.getElementById('sd-func-body');
  const nb=document.getElementById('sd-nonfunc-body');
  if(fb){fb.innerHTML=`<ul class="req-list">${func.map(t=>`<li>${e(t)}</li>`).join('')}</ul>`;fb.classList.add('sd-filled');}
  if(nb){nb.innerHTML=`<ul class="req-list req-list-nf">${nfunc.map(t=>`<li>${e(t)}</li>`).join('')}</ul>`;nb.classList.add('sd-filled');}
}
function fillScale(content){
  const rows=content.split('\n').map(l=>stripMd(l).replace(/^[-*]\s*/,'').trim()).filter(Boolean)
    .map(l=>{const ci=l.indexOf(':');
      if(ci<1)return `<div class="sc-full">${e(l)}</div>`;
      return `<div class="sc-row"><span class="sc-k">${e(l.slice(0,ci).trim())}</span><span class="sc-v">${e(l.slice(ci+1).trim())}</span></div>`;
    }).join('');
  const sb=document.getElementById('sd-scale-body');
  if(sb){sb.innerHTML=`<div class="sc-grid">${rows}</div>`;sb.classList.add('sd-filled');}
}
function fillDiagram(content){
  const db=document.getElementById('sd-diag-body');
  if(db){db.innerHTML=`<pre>${e(content.trim())}</pre>`;db.classList.add('sd-filled');}
}
function fillDeep(content){
  const items=content.split('\n').map(l=>stripMd(l).trim())
    .filter(l=>/^\d+[.)]\s/.test(l))
    .map(l=>{const m=l.match(/^(\d+)[.)]\s*(.*)/);if(!m)return '';
      return `<div class="dp-item"><span class="dp-n">${m[1]}</span><span class="dp-t">${e(m[2].slice(0,95))}</span></div>`;
    }).filter(Boolean).join('');
  const db=document.getElementById('sd-deep-body');
  if(db){db.innerHTML=`<div class="dp-list">${items}</div>`;db.classList.add('sd-filled');}
}
function fillEdge(content){
  const items=content.split('\n').map(l=>stripMd(l).replace(/^[-*]\s*/,'').trim()).filter(Boolean)
    .map(l=>{const ci=l.indexOf(':');
      if(ci>0&&ci<35)return `<div class="ec-item"><span class="ec-tag">${e(l.slice(0,ci).trim())}</span><span class="ec-val">${e(l.slice(ci+1).trim().slice(0,75))}</span></div>`;
      return `<div class="ec-item"><span class="ec-val">${e(l.slice(0,80))}</span></div>`;
    }).join('');
  const eb=document.getElementById('sd-edge-body');
  if(eb){eb.innerHTML=`<div class="ec-list">${items}</div>`;eb.classList.add('sd-filled');}
}
function fillTradeoffs(content){
  const items=content.split('\n').map(l=>stripMd(l).replace(/^[-*]\s*/,'').trim()).filter(Boolean)
    .map(l=>{
      const parts=l.split('|').map(p=>p.trim());
      const pick=(parts[0]||'').replace(/^(Decision|Choice):\s*/i,'').trim();
      const alt=(parts[1]||'').replace(/^(vs|Rejected):\s*/i,'').trim();
      const reason=(parts[2]||'').replace(/^(because|Reason):\s*/i,'').trim();
      if(!pick)return `<div class="to-plain">${e(l.slice(0,85))}</div>`;
      return `<div class="to-item"><div class="to-header"><span class="to-pick">${e(pick)}</span>${alt?`<span class="to-sep">vs</span><span class="to-alt2">${e(alt)}</span>`:''}</div>${reason?`<div class="to-reason2">${e(reason.slice(0,75))}</div>`:''}</div>`;
    }).join('');
  const tb=document.getElementById('sd-to-body');
  if(tb){tb.innerHTML=`<div class="to-list2">${items}</div>`;tb.classList.add('sd-filled');}
}

function addHistory(q,blocks){
  qaCount++;
  const badge=document.getElementById('hist-badge');
  if(badge){badge.textContent=qaCount;badge.style.display='flex';}
  log.push({q,blocks});
  const logIdx=log.length-1;
  const hl=document.getElementById('hist-list');
  if(!hl)return;
  const empty=hl.querySelector('.hist-empty');
  if(empty)empty.remove();
  const item=document.createElement('div');
  item.className='hist-item';
  const ts=new Date();
  item.innerHTML=
    `<div class="hist-time">${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}</div>
     <div class="hist-q">${e(q.slice(0,60))}</div>`;
  item.onclick=()=>{loadHistory(logIdx);closeHistory();};
  hl.appendChild(item);
}

function loadHistory(logIdx){
  const entry=log[logIdx];
  if(!entry)return;
  document.getElementById('answer-blocks').innerHTML='';
  showAnswerFrame(entry.q);
  render(entry.blocks);
  document.querySelectorAll('.hist-item').forEach((el,i)=>
    el.classList.toggle('active',i===logIdx)
  );
}

function safeHighlight(container){
  if(!window.hljs)return;
  container.querySelectorAll('pre code').forEach(bl=>hljs.highlightElement(bl));
}

let streamBuf='', streamIsDesign=false;

const es=new EventSource('/stream');

es.onopen=()=>{
  if(log.length)setStatus('ready','Reconnected — listening…');
};
es.onerror=()=>{
  setStatus('warn','Connection lost — reconnecting…');
};

function showAnswerFrame(question){
  document.getElementById('q-text').textContent=question;
  document.getElementById('empty-state').style.display='none';
  document.getElementById('answer-frame').classList.add('show');
}

es.addEventListener('stream_start',ev=>{
  const d=JSON.parse(ev.data);
  streamIsDesign=!!d.is_design;
  streamBuf='';
  const area=document.getElementById('answer-blocks');
  const hasContent=area.children.length>0;
  showAnswerFrame(d.question);
  sessionId++;
  if(streamIsDesign){
    area.innerHTML='';
    renderSysDesign([],area);
    document.getElementById('stream-block').classList.remove('show');
  }else{
    if(hasContent){
      const divider=document.createElement('div');
      divider.className='fu-divider blk';divider.id='session-'+sessionId;
      divider.innerHTML=`<span class="fu-div-label">&#8618; Follow-up</span><span class="fu-div-q">${e(d.question)}</span>`;
      area.appendChild(divider);
      const si=document.createElement('div');si.id='stream-inline';si.className='stream-inline-wrap blk';
      si.innerHTML=`<div class="stream-header"><div class="stream-spinner"></div>Answering…</div><div id="stream-inline-text" class="stream-inline-text"></div>`;
      area.appendChild(si);
      document.getElementById('stream-block').classList.remove('show');
    }else{
      area.innerHTML='';area.dataset.firstSession=sessionId;
      document.getElementById('stream-text').textContent='';
      document.getElementById('stream-block').classList.add('show');
    }
  }
});

es.addEventListener('token',ev=>{
  const d=JSON.parse(ev.data);
  if(streamIsDesign){
    streamBuf+=d.t;
  }else{
    const it=document.getElementById('stream-inline-text');
    if(it)it.textContent+=d.t;
    else document.getElementById('stream-text').textContent+=d.t;
  }
});

es.addEventListener('status',ev=>{const d=JSON.parse(ev.data);setStatus(d.state,d.msg);});
es.addEventListener('level',ev=>{const d=JSON.parse(ev.data);updateLevel(d.rms,d.threshold);});
es.addEventListener('question',ev=>{
  const d=JSON.parse(ev.data);
  showAnswerFrame(d.text);streamBuf='';
});
es.addEventListener('thinking',ev=>{
  const d=JSON.parse(ev.data);
  document.getElementById('thinking').classList.toggle('show',d.active);
});

es.addEventListener('answer',ev=>{
  const d=JSON.parse(ev.data);
  document.getElementById('thinking').classList.remove('show');
  document.getElementById('stream-block').classList.remove('show');
  lastRaw=d.raw;
  const area=document.getElementById('answer-blocks');
  const inline=document.getElementById('stream-inline');
  if(streamIsDesign){
    const byType={};d.parsed.forEach(b=>{byType[b.type]=b;});
    if(byType.HEADLINE){
      const hl=document.getElementById('sd-hl-text');
      if(hl){hl.textContent=stripMd(byType.HEADLINE.content);hl.classList.remove('sd-shimmer');}
    }
    if(byType.REQUIREMENTS)fillRequirements(byType.REQUIREMENTS.content);
    if(byType.SCALEMATH)   fillScale(byType.SCALEMATH.content);
    if(byType.DIAGRAM)     fillDiagram(byType.DIAGRAM.content);
    if(byType.DEEPDESIGN)  fillDeep(byType.DEEPDESIGN.content);
    if(byType.EDGECASES)   fillEdge(byType.EDGECASES.content);
    if(byType.TRADEOFFS)   fillTradeoffs(byType.TRADEOFFS.content);
    renderFollowupBar(d.parsed);
  }else if(inline){
    inline.remove();
    let delay=0;
    d.parsed.forEach(b=>{
      if(b.type==='FOLLOWUP')return;
      const el=buildBlock(b,delay);if(!el)return;
      area.appendChild(el);delay+=60;
    });
    safeHighlight(area);
    renderFollowupBar(d.parsed);
  }else{
    render(d.parsed);
  }
  addHistory(d.question,d.parsed);
  streamIsDesign=false;
});

es.addEventListener('calibrate_done',ev=>{
  const d=JSON.parse(ev.data);
  document.getElementById('thr-v').textContent=d.threshold.toFixed(4);
});

es.addEventListener('error',ev=>{
  const d=JSON.parse(ev.data);
  document.getElementById('stream-block').classList.remove('show');
  const inline=document.getElementById('stream-inline');
  if(inline)inline.remove();
  setStatus('error','Error: '+d.msg);
});
</script>
</body>
</html>"""


if __name__ == "__main__":
    threading.Thread(target=broadcaster.run, daemon=True, name="sse-broadcaster").start()

    def _open_browser():
        import socket
        for _ in range(100):
            try:
                with socket.create_connection(("127.0.0.1", CFG.port), timeout=0.1):
                    break
            except OSError:
                time.sleep(0.1)
        webbrowser.open(f"http://localhost:{CFG.port}")
    threading.Thread(target=_open_browser, daemon=True, name="browser-open").start()

    log.info("Interview Assistant  →  http://localhost:%d", CFG.port)
    log.info("Model: %s  |  Port: %d", CFG.model, CFG.port)
    app.run(host="0.0.0.0", port=CFG.port, threaded=True)
