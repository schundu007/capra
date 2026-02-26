# Interview Assistant

The Interview Assistant provides real-time voice transcription, coaching, and answer suggestions during live interviews. Available exclusively with **Quarterly Pro** subscription.

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Setting Up](#setting-up)
4. [Using During Interviews](#using-during-interviews)
5. [Stealth Mode](#stealth-mode)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Interview Assistant is your real-time companion during live interviews:

- **Voice Transcription** — Automatic speech-to-text
- **Question Detection** — Identifies interviewer questions
- **Answer Suggestions** — Context-aware response hints
- **Code Hints** — Technical guidance without giving full solutions

![Interview Assistant](../images/interview-assistant-overview.png)
*Interview Assistant panel during a live session*

> **Important:** This feature is designed for practice and coaching. Use responsibly in actual interviews.

---

## Requirements

### Subscription

- **Quarterly Pro** subscription required
- Desktop app only (not available in web app)

### System Requirements

| Platform | Requirement |
|----------|-------------|
| **macOS** | Microphone permission granted |
| **Windows** | Microphone access enabled |
| **Audio** | Working microphone input |

### Permissions (macOS)

Grant microphone access to Ascend:

1. Open **System Preferences → Security & Privacy**
2. Click **Privacy** tab
3. Select **Microphone** from sidebar
4. Check the box next to **Ascend**

![macOS Microphone Permission](../images/macos-mic-permission.png)
*Enable microphone access in macOS*

---

## Setting Up

### Accessing Interview Assistant

1. Open the desktop app
2. Click **Interview Assistant** in the sidebar
3. Or use shortcut `Cmd+I` / `Ctrl+I`

### Audio Configuration

Select your input device:

1. Click the **microphone icon** in the assistant panel
2. Choose your preferred input device
3. Test the audio levels

![Audio Settings](../images/audio-settings.png)
*Configure your microphone input*

### Test Your Setup

Before any real interview:

1. Click **Test Recording**
2. Speak a few sentences
3. Verify transcription accuracy
4. Adjust mic position if needed

---

## Using During Interviews

### Starting a Session

1. Start your interview call (Zoom, Teams, Google Meet, etc.)
2. In Ascend, click **Start Listening**
3. The assistant begins transcribing

![Start Listening](../images/start-listening.png)
*Start the Interview Assistant*

### Real-Time Features

#### Transcription

Live speech-to-text appears as conversation flows:

```
Interviewer: "Tell me about a time you dealt with a difficult
             technical challenge."

You: "In my previous role at Company X, I worked on..."
```

#### Question Detection

The assistant highlights detected questions:

```
[QUESTION DETECTED]
"How would you design a system to handle 1 million requests per second?"
```

#### Answer Hints

Context-aware suggestions appear:

```
[HINT]
Consider discussing:
- Load balancing strategies
- Caching layers
- Database sharding
- Async processing with queues
```

#### Code Suggestions

For technical questions, receive algorithmic hints:

```
[TECHNICAL HINT]
This sounds like a sliding window problem.
Consider tracking window boundaries with two pointers.
```

### Ending a Session

1. Click **Stop Listening** when the interview ends
2. Review the full transcript
3. Save or export if needed

---

## Stealth Mode

### What is Stealth Mode?

Stealth mode minimizes Ascend's visual footprint:

- **Transparent overlay** — Nearly invisible window
- **Minimal UI** — Just essential hints
- **Quick toggle** — Instant show/hide

![Stealth Mode](../images/stealth-mode.png)
*Stealth mode for minimal visibility*

### Enabling Stealth Mode

1. Press `Cmd+Shift+H` / `Ctrl+Shift+H`
2. Or click **Stealth** in the assistant panel

### Stealth Controls

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Shift+H` | Toggle stealth mode |
| `Cmd/Ctrl+Shift+↑` | Increase transparency |
| `Cmd/Ctrl+Shift+↓` | Decrease transparency |
| `Cmd/Ctrl+Shift+M` | Move overlay position |

### Customizing Stealth Mode

In **Settings → Interview Assistant → Stealth**:

- **Opacity Level** — 10% to 50%
- **Position** — Corner placement
- **Hint Length** — Brief vs detailed
- **Auto-hide** — Hide after X seconds

---

## Best Practices

### For Practice Sessions

Use Interview Assistant during mock interviews to:

1. **Record** your answers for review
2. **Identify** nervous habits or filler words
3. **Practice** responding to common questions
4. **Get feedback** on your answers

### For Real Interviews

If using during actual interviews:

1. **Test thoroughly** beforehand
2. **Use hints sparingly** — don't become dependent
3. **Focus on conversation** — hints are supplementary
4. **Be ethical** — use for guidance, not cheating

### Interview Setup Checklist

Before any interview:

- [ ] Test microphone and audio levels
- [ ] Close unnecessary applications
- [ ] Position Ascend window appropriately
- [ ] Enable stealth mode if needed
- [ ] Have backup notes ready

---

## Troubleshooting

### Audio Not Detected

**Symptoms:** No transcription appearing

**Solutions:**
1. Check microphone permissions
2. Verify correct input device selected
3. Check audio levels (not too low)
4. Restart the application

### Poor Transcription Quality

**Symptoms:** Inaccurate or garbled text

**Solutions:**
1. Move microphone closer
2. Reduce background noise
3. Speak more clearly/slowly
4. Try a different microphone

### High Latency

**Symptoms:** Significant delay in transcription

**Solutions:**
1. Check internet connection
2. Close other resource-heavy apps
3. Reduce video quality on call
4. Restart the application

### Assistant Not Responding

**Symptoms:** Hints not appearing

**Solutions:**
1. Ensure Quarterly Pro subscription active
2. Check internet connectivity
3. Verify API keys configured (desktop)
4. Contact support if persistent

---

## Privacy & Security

### What We Process

- Audio is transcribed in real-time
- Transcriptions used to generate hints
- Session data not stored after completion

### What We Don't Do

- Record or store audio files
- Share transcription data
- Train models on your data

### Data Handling

| Data | Retained | Purpose |
|------|----------|---------|
| Audio | Never | Transcription only |
| Transcripts | Session only | Context for hints |
| Hints | Never | Generated on-demand |

---

## Next Steps

- [Company Prep Guide](./company-prep.md) — Prepare before the interview
- [Coding Interview Guide](./coding-interview.md) — Technical preparation
- [System Design Guide](./system-design.md) — Architecture interviews
