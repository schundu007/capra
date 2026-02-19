# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capra is an AI-powered coding assistant that solves programming problems from text input, screenshots, or URLs (HackerRank/LeetCode). It supports both Claude and GPT-4 providers, multiple interview modes (coding, system design, behavioral), and includes an Interview Assistant with voice transcription.

## Two Platforms

| Platform | Frontend | Backend | API Keys |
|----------|----------|---------|----------|
| **Desktop App** | Electron | Embedded Express (port 3001) | OS Keychain (secure-store.js) |
| **Webapp** | **Vercel** (cloud) | **Railway** (cloud) | localStorage |

**IMPORTANT: The webapp does NOT run locally. It's deployed to Vercel + Railway.**

## Commands

```bash
npm run install:all     # Install all dependencies
npm run dev:electron    # Desktop app development (the only local dev mode)
npm run build:electron  # Build for distribution
npm run dist:mac        # macOS DMG/ZIP
npm run dist:win        # Windows NSIS
npm run dist:linux      # Linux AppImage/DEB
```

## Deployment

**CRITICAL: After EVERY code change, ALWAYS deploy to BOTH platforms:**

1. **Desktop App**: Restart with `npm run dev:electron`
2. **Webapp**: Commit and push to trigger auto-deployment (Vercel + Railway)

```bash
git add -A && git commit -m "description" && git push origin main
```

## Architecture

### Data Flow
```
User Input → Frontend (React) → Backend API → AI Provider (Claude/OpenAI) → SSE Stream → Frontend
```

### SSE Streaming Pattern
The `/api/solve/stream` endpoint uses Server-Sent Events:
1. Frontend initiates fetch, backend sets SSE headers
2. Backend streams: `data: {chunk, partial: true}\n\n`
3. Final: `data: {done: true, result: {...}}\n\n`
4. Frontend uses `parseStreamingContent()` in App.jsx to progressively extract JSON fields (code, language, explanations) as they arrive

### Electron IPC Bridge
The desktop app uses a preload script (`electron/preload.cjs`) to expose `window.electronAPI`:
- `getApiKeys()` / `setApiKeys()` - Secure keychain access
- `getPlatformInfo()` - Backend port, platform details
- `platformLogin()` / `platformLogout()` - HackerRank/LeetCode auth windows

### Runtime API Key Pattern
AI services (`backend/src/services/claude.js`, `openai.js`) support runtime key updates:
```js
import * as claudeService from '../services/claude.js';
claudeService.setApiKey(key);  // Update at runtime
claudeService.getApiKey();     // Check current key
```
This allows Electron to inject keys from OS keychain without env vars.

### Embedded Backend (Electron)
`electron/backend-server.js` creates an Express server that:
- Reuses all routes from `backend/src/routes/`
- Skips webapp authentication (users provide own keys)
- Injects platform cookies for authenticated scraping

## Key Directories

- `electron/` - Desktop app (main.js, preload.cjs, backend-server.js, store/)
- `frontend/src/` - React app shared by both platforms
- `backend/src/routes/` - Express API endpoints
- `backend/src/services/` - AI providers, scraper, diagram generation
- `extension/` - Chrome extension for webapp cookie sync

## Backend Routes

| Route | Description |
|-------|-------------|
| `/api/solve/stream` | SSE streaming solutions (supports interviewMode: coding/system_design/behavioral) |
| `/api/solve/followup` | Follow-up Q&A with problem context |
| `/api/analyze` | Screenshot OCR via AI vision |
| `/api/fetch` | Scrape problems from HackerRank/LeetCode URLs |
| `/api/run` | Code execution (Piston API) |
| `/api/fix` | AI-powered code fixing |
| `/api/transcribe` | Audio transcription (Interview Assistant) |
| `/api/interview` | Interview assistant endpoints |
| `/api/diagram/eraser` | Eraser.io diagram generation |

## Platform Detection

```jsx
const isElectron = window.electronAPI?.isElectron || false;

// Get correct API URL
import { getApiUrl } from './hooks/useElectron';
const API_URL = getApiUrl(); // localhost:3001 (Electron) or Railway URL (webapp)
```

## Environment Variables

**Backend `.env`** (Railway dashboard for webapp):
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ERASER_API_KEY=...
PORT=3001
```

**Frontend `.env`** (Vercel):
```
VITE_API_URL=https://your-railway-url.railway.app
```

**Note:** In Electron, API keys come from OS keychain via `secure-store.js`, not env vars.

## UI Guidelines

### Icons (CRITICAL)
- **NEVER use generic icons** - This is a strict rule
- Generic icons to AVOID: hamburger menus (☰), generic settings cogs, placeholder icons, abstract shapes
- Instead use: specific text labels, descriptive buttons, or contextually meaningful icons
- When in doubt, use text labels instead of icons
- Icons should be immediately recognizable for their specific function

### Styling
- Use TailwindCSS for styling
- Follow existing code style (no ESLint/Prettier configured)

## Notes

- Node.js ≥20 required
- No automated tests configured
