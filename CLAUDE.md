# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capra is an AI-powered coding assistant that solves programming problems from text input, screenshots, or URLs (HackerRank/LeetCode). It supports both Claude and GPT-4 providers and includes an Interview Assistant feature with voice transcription.

## Two Platforms

| Platform | Frontend | Backend | API Keys |
|----------|----------|---------|----------|
| **Desktop App** | Electron | Embedded Express (port 3001) | OS Keychain (secure-store.js) |
| **Webapp** | **Vercel** (cloud) | **Railway** (cloud) | localStorage |

**IMPORTANT: The webapp does NOT run locally. It's deployed to Vercel + Railway.**

## Commands

```bash
# Install all dependencies
npm run install:all

# Desktop App Development (the only local dev mode)
npm run dev:electron

# Build desktop app for distribution
npm run build:electron
npm run dist:mac    # macOS DMG/ZIP
npm run dist:win    # Windows NSIS
npm run dist:linux  # Linux AppImage/DEB
```

## Deployment

**CRITICAL: After EVERY code change, ALWAYS deploy to BOTH platforms:**

1. **Desktop App**: Restart with `npm run dev:electron` (or rebuild for distribution)
2. **Webapp**: Commit and push to trigger auto-deployment

```bash
# Always commit and push after changes
git add -A && git commit -m "description"
git push origin main
```

This triggers auto-deployment:
- **Frontend** → Vercel (auto-deploys in ~1 min)
- **Backend** → Railway (auto-deploys in ~2 min)

**NEVER forget to deploy to both platforms. Changes must be live on webapp AND desktop app.**

## Architecture

### Data Flow
```
User Input → Frontend (React) → Backend API → AI Provider (Claude/OpenAI) → Streaming Response → Frontend
```

### SSE Streaming Pattern
The `/api/solve/stream` endpoint uses Server-Sent Events for real-time code generation:
1. Frontend initiates fetch with SSE headers
2. Backend streams chunks as `data: {chunk, partial: true}\n\n`
3. Final response: `data: {done: true, result: {...}}\n\n`
4. Frontend parses JSON progressively for instant feedback

### Electron Embedded Backend
In the desktop app, `electron/backend-server.js` runs an Express server that:
- Imports and reuses all routes from `backend/src/routes/`
- Skips authentication (users provide their own API keys)
- Gets API keys from OS keychain via `secure-store.js`

## Project Structure

```
/
├── electron/              # Desktop app only
│   ├── main.js            # Main process, window management
│   ├── preload.cjs        # IPC bridge (exposes electronAPI)
│   ├── backend-server.js  # Embedded Express server (reuses backend routes)
│   ├── auth-window.js     # Platform OAuth windows (HackerRank, LeetCode)
│   └── store/
│       ├── config-store.js   # General config (electron-store)
│       └── secure-store.js   # Encrypted API keys (OS keychain via safeStorage)
│
├── frontend/              # React app (shared by both platforms)
│   └── src/
│       ├── App.jsx                     # Main app, state management
│       ├── hooks/useElectron.js        # Platform detection, getApiUrl()
│       └── components/
│           ├── CodeDisplay.jsx         # Code panel with Code/Design tabs
│           ├── ExplanationPanel.jsx    # Approach + Interviewer Q&A
│           ├── InterviewAssistantPanel.jsx  # Voice Q&A for interviews
│           ├── SystemDesignPanel.jsx   # System design diagrams
│           └── ProblemInput.jsx        # Text/URL/Screenshot input
│
├── backend/               # Express API (shared by both platforms)
│   └── src/
│       ├── index.js       # Server setup, route registration
│       ├── routes/        # API endpoints
│       └── services/      # AI providers (claude.js, openai.js)
│
└── extension/             # Chrome extension (webapp cookie sync)
    ├── manifest.json      # Extension config (v3)
    ├── background.js      # Cookie extraction and sync
    └── popup.js           # Extension UI
```

## Key Files

### Backend Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/solve/stream` | POST | SSE streaming solutions |
| `/api/solve/followup` | POST | Follow-up Q&A for any interview problem |
| `/api/analyze` | POST | Screenshot OCR via AI vision |
| `/api/fetch` | POST | Scrape problems from HackerRank/LeetCode URLs |
| `/api/run` | POST | Code execution (Piston API) |
| `/api/fix` | POST | AI code fixing |
| `/api/transcribe` | POST | Audio transcription |
| `/api/interview` | POST | Interview assistant endpoints |
| `/api/diagram/eraser` | POST | Eraser.io diagram generation |
| `/api/auth/*` | Various | Authentication (webapp only) |

### Backend Services
- `claude.js` - Anthropic API with streaming, setApiKey()/getApiKey() for runtime updates
- `openai.js` - OpenAI API with streaming, same pattern as claude.js
- `eraser.js` - Eraser.io diagram generation
- `scraper.js` - HackerRank/LeetCode problem extraction

## Platform Detection

```jsx
const isElectron = window.electronAPI?.isElectron || false;

// Electron-only feature
{isElectron && <SettingsButton />}

// Use correct API URL
import { getApiUrl } from './hooks/useElectron';
const API_URL = getApiUrl(); // Returns localhost:3001 for Electron, Railway URL for webapp
```

## Environment Variables

Backend `.env` (for Railway, set in dashboard):
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ERASER_API_KEY=...
PORT=3001
```

Frontend `.env` (for Vercel):
```
VITE_API_URL=https://your-railway-url.railway.app
```

**Note:** In Electron, API keys come from the OS keychain, not environment variables.

## Testing Changes

1. **Desktop App**: `npm run dev:electron` - test locally
2. **Webapp**: Push to GitHub → Vercel/Railway auto-deploy → test on production URL

## UI Guidelines

- **NEVER use generic icons** - Always use specific, meaningful icons or text labels
- Use TailwindCSS for styling
- Follow existing code style (no ESLint/Prettier configured)

## Notes

- Node.js ≥20 required for backend
- No automated tests configured
- Push to git after EVERY change to deploy webapp
