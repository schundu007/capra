# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ascend is an AI-powered coding assistant that solves programming problems from text input, screenshots, or URLs (HackerRank/LeetCode). It supports both Claude and GPT-4 providers, multiple interview modes (coding, system design, behavioral), and includes an Ascend Assistant with voice transcription.

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
npm run dev             # Run backend + frontend separately (for webapp dev, rarely used)
npm run build:electron  # Build for distribution
npm run dist:mac        # macOS DMG/ZIP
npm run dist:win        # Windows NSIS
npm run dist:linux      # Linux AppImage/DEB
```

### Testing

Both frontend and backend use Vitest:

```bash
cd frontend && npx vitest run            # Run frontend tests once
cd frontend && npx vitest                 # Watch mode
cd frontend && npx vitest run --coverage  # With coverage
cd backend && npx vitest run              # Run backend tests once
cd backend && npx vitest                  # Watch mode
```

Frontend test setup is in `frontend/src/test/setup.ts` (mocks localStorage, matchMedia, electronAPI, fetch).

### Backend Dev Server

Backend uses `node --watch` (not nodemon): `cd backend && npm run dev`

## Deployment

The webapp auto-deploys on push to `main`:
- **Vercel** builds from `frontend/` (see `vercel.json`)
- **Railway** builds from `backend/` (see `railway.json`)
- **Desktop App**: Restart locally with `npm run dev:electron`

## Architecture

### Data Flow
```
User Input → Frontend (React) → Backend API → AI Provider (Claude/OpenAI) → SSE Stream → Frontend
```

### Frontend State Management

The app uses **Zustand** (`frontend/src/store/appStore.ts`) as the primary state store, with `persist` middleware for localStorage persistence. Key state includes solution data, loading states, ascend mode, provider selection, and UI state.

Auth context is handled separately via React Context (`frontend/src/contexts/AuthContext.jsx`).

Platform detection uses `useElectron.js` hook which checks `window.electronAPI?.isElectron` and provides `getApiUrl()` to resolve the correct backend URL.

### SSE Streaming Pattern
The `/api/solve/stream` endpoint uses Server-Sent Events:
1. Frontend initiates fetch, backend sets SSE headers
2. Backend streams: `data: {chunk, partial: true}\n\n`
3. Final: `data: {done: true, result: {...}}\n\n`
4. Frontend uses `parseStreamingContent()` in App.jsx to progressively extract JSON fields (code, language, explanations) as they arrive

The backend also has an `SSEBroadcaster` class (`backend/src/services/sse-broadcaster.js`) implementing pub/sub for multi-subscriber SSE with heartbeats and queuing.

### Authentication (Three Strategies)

`backend/src/middleware/unifiedAuth.js` handles all platforms:
1. **Webapp** - JWT tokens from Cariara OAuth (`JWT_SECRET_KEY` env var)
2. **Electron** - Device ID + optional linked account (device license system)
3. **Local deployment** - Username/password tokens

The Electron embedded backend (`electron/backend-server.js`) skips webapp authentication since users provide their own API keys.

### Database & Caching

- **PostgreSQL** (`pg`) - Webapp user data, subscriptions, credits, company preps. Schema in `database/schema.sql`, migrations in `database/migrations/`. Configured via `backend/src/config/database.js`. Optional — the app gracefully degrades when not configured (`isDatabaseConfigured()`).
- **Redis** (`ioredis`) - Problem caching. Initialized in `backend/src/services/redis.js` via `initRedis()`. Also optional.

### Billing & Credits

Stripe integration (`backend/src/config/stripe.js`, `backend/src/routes/billing.js`, `backend/src/routes/credits.js`) manages subscriptions and a credits system. Tables: `ascend_subscriptions`, `ascend_credits`, `ascend_credit_transactions`.

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

## Key Directories

- `electron/` - Desktop app (main.js, preload.cjs, backend-server.js, store/)
  - `electron/store/` - Electron-store for settings and secure-store for API keys
  - `electron/ipc/` - IPC handlers for main/renderer communication
- `frontend/src/` - React app shared by both platforms
  - `frontend/src/store/` - Zustand state management (appStore.ts)
  - `frontend/src/hooks/` - React hooks (useElectron, useSolve, useStreamingParser, etc.)
  - `frontend/src/services/api.ts` - Typed API client (axios)
- `backend/src/routes/` - Express API endpoints
- `backend/src/services/` - AI providers, scraper, diagram generation, SSE broadcaster
- `backend/src/middleware/` - Auth, rate limiting, validation, error handling
- `backend/src/config/` - Database, Stripe, env var validation
- `database/` - PostgreSQL schema and migrations
- `extension/` - Chrome extension for webapp cookie sync

## Backend Routes

| Route | Description |
|-------|-------------|
| `/api/solve/stream` | SSE streaming solutions (supports ascendMode: coding/system_design/behavioral) |
| `/api/solve/followup` | Follow-up Q&A with problem context |
| `/api/analyze` | Screenshot OCR via AI vision |
| `/api/fetch` | Scrape problems from HackerRank/LeetCode URLs |
| `/api/run` | Code execution (Piston API) |
| `/api/fix` | AI-powered code fixing |
| `/api/transcribe` | Audio transcription (Deepgram) |
| `/api/ascend` | Ascend assistant endpoints |
| `/api/ascendPrep` | Interview prep content (company-specific) |
| `/api/diagram/eraser` | Eraser.io diagram generation |
| `/api/billing` | Stripe subscription management |
| `/api/credits` | Credits balance and transactions |
| `/api/device` | Device license management (Electron) |
| `/api/voice` | Voice assistant processing |

## Environment Variables

**Backend `.env`** (Railway dashboard for webapp):
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ERASER_API_KEY=...
PORT=3001
JWT_SECRET_KEY=...          # Cariara OAuth
DATABASE_URL=postgres://... # PostgreSQL (optional)
REDIS_URL=redis://...       # Redis (optional)
STRIPE_SECRET_KEY=...       # Stripe billing (optional)
```

**Frontend `.env`** (Vercel):
```
VITE_API_URL=https://your-railway-url.railway.app
```

**Note:** In Electron, API keys come from OS keychain via `secure-store.js`, not env vars.

## UI Guidelines

### Icons (CRITICAL)
- **NEVER use generic icons** - This is a strict rule
- Generic icons to AVOID: hamburger menus, generic settings cogs, placeholder icons, abstract shapes
- Instead use: specific text labels, descriptive buttons, or contextually meaningful icons
- When in doubt, use text labels instead of icons

### Styling
- Use TailwindCSS for styling
- Follow existing code style (no ESLint/Prettier configured)

## Ascend Modes

The app supports three interview modes via the `ascendMode` parameter in `/api/solve/stream`:
- `coding` - Standard algorithmic problem solving
- `system_design` - System design interviews with diagram generation
- `behavioral` - Behavioral interview practice

## Safe Logging Pattern

Backend services use `safeLog()` from `backend/src/services/utils.js` instead of `console.log()` to prevent EPIPE errors when Electron pipes close during shutdown. Use this pattern in any new service code.

## Notes

- Node.js >=20 required
- Both `.jsx` and `.tsx` files exist in frontend (prefer `.jsx` for new components)
- Frontend uses React 18 + Vite + TailwindCSS
- Electron stealth mode (Cmd+Shift+S) hides the window during video calls
