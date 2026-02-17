# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capra is an AI-powered coding assistant that solves programming problems from text input, screenshots, or URLs (HackerRank/LeetCode). It supports both Claude and GPT-4 providers.

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

## Deployment (Webapp)

**CRITICAL: After EVERY code change:**
```bash
git add -A && git commit -m "description"
git push origin main
```

This triggers auto-deployment:
- **Frontend** → Vercel (auto-deploys in ~1 min)
- **Backend** → Railway (auto-deploys in ~2 min)

**NEVER suggest running the webapp locally. Always push to deploy.**

## Project Structure

```
/
├── electron/              # Desktop app only
│   ├── main.js            # Main process, window management
│   ├── preload.js         # IPC bridge
│   ├── backend-server.js  # Embedded Express server
│   └── store/
│       ├── config-store.js   # General config
│       └── secure-store.js   # Encrypted API keys (keychain)
│
├── frontend/              # React app (shared by both platforms)
│   └── src/
│       ├── App.jsx
│       ├── hooks/useElectron.js  # Platform detection
│       └── components/
│
├── backend/               # Express API (shared by both platforms)
│   └── src/
│       ├── index.js
│       ├── routes/        # API endpoints
│       └── services/      # AI providers (claude.js, openai.js)
│
└── extension/             # Chrome extension (webapp cookie sync)
```

## Key Files

### Backend Routes
- `solve.js` - POST /api/solve/stream - SSE streaming solutions
- `analyze.js` - POST /api/analyze - Screenshot OCR
- `fetch.js` - POST /api/fetch - Scrape problems from URLs
- `run.js` - POST /api/run - Code execution (Piston API)
- `fix.js` - POST /api/fix - AI code fixing
- `diagram.js` - POST /api/diagram/eraser - Eraser.io diagrams

### Backend Services
- `claude.js` - Anthropic API integration
- `openai.js` - OpenAI API integration
- `eraser.js` - Eraser.io diagram generation

### Frontend Components
- `App.jsx` - Main app, state management
- `CodeDisplay.jsx` - Code panel with Code/Design tabs
- `SystemDesignPanel.jsx` - System design display
- `ExplanationPanel.jsx` - Approach + Interviewer Q&A

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

## Testing Changes

1. **Desktop App**: `npm run dev:electron` - test locally
2. **Webapp**: Push to GitHub → Vercel/Railway auto-deploy → test on production URL

## UI Guidelines

- **NEVER use generic icons** - Always use specific, meaningful icons or text labels instead of generic placeholder icons
- Use TailwindCSS for styling
- Follow existing code style (no ESLint/Prettier configured)

## Notes

- No automated tests configured
- Push to git after EVERY change to deploy webapp
