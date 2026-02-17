# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capra is an AI-powered coding assistant that solves programming problems from text input, screenshots, or URLs (HackerRank/LeetCode). It supports both Claude and GPT-4 providers.

## Commands

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all

# Run both frontend and backend concurrently (webapp mode)
npm run dev

# Run desktop app in development
npm run dev:electron

# Run separately
cd backend && npm run dev    # Starts on http://localhost:3001
cd frontend && npm run dev   # Starts on http://localhost:5173

# Build frontend for production
npm run build

# Build desktop app
npm run build:electron

# Distribution builds
npm run dist:mac    # macOS DMG/ZIP
npm run dist:win    # Windows NSIS
npm run dist:linux  # Linux AppImage/DEB

# Preview production build locally
cd frontend && npm run preview

# Run with PM2 (optional, webapp mode)
pm2 start ecosystem.config.cjs
```

## Deployment

**CRITICAL: After EVERY code change, you MUST:**
1. Commit the changes with a descriptive message
2. Push to GitHub: `git push origin main`
3. This triggers auto-deployment to Vercel (frontend) and Railway (backend)
4. Wait 1-3 minutes for deployments to complete

**IMPORTANT: Never suggest deploying locally. This project uses cloud deployment:**

- **Frontend**: Deployed to **Vercel** (auto-deploys from git push)
- **Backend**: Deployed to **Railway** (auto-deploys from git push)

To deploy changes:
1. `git add -A && git commit -m "description"`
2. `git push origin main`
3. Vercel and Railway will auto-deploy (1-3 minutes)
4. Verify deployment status on their dashboards if needed

## Architecture

### Desktop App vs Webapp

**CRITICAL: When making changes, always consider both platforms!**

| Component | Desktop App | Webapp |
|-----------|-------------|--------|
| Frontend | Embedded in Electron | Standalone hosted |
| Backend | Embedded in Electron | Separately deployed |
| API Keys | Secure OS keychain (electron-store) | localStorage or server-side |
| Auth | Skipped (local app) | Required (multi-user) |
| Platform Cookies | Native Electron windows | Browser extension |

### Project Structure

```
/
├── electron/           # Desktop app (Electron-specific)
│   ├── main.js         # Main process, window management
│   ├── preload.js      # IPC bridge to renderer
│   ├── backend-server.js  # Embedded Express server
│   ├── auth-window.js  # Platform auth windows (Glider, HackerRank, etc.)
│   ├── ipc/            # IPC handlers
│   │   ├── api-keys.js # Secure key management
│   │   └── settings.js # App settings
│   ├── store/          # Persistent storage
│   │   ├── config-store.js # General config
│   │   └── secure-store.js # Encrypted API keys
│   └── updater/        # Auto-update logic
│
├── frontend/           # React app (shared by both platforms)
│   └── src/
│       ├── App.jsx     # Main app with platform detection
│       ├── hooks/
│       │   └── useElectron.js  # Electron feature detection
│       └── components/
│           ├── settings/       # Settings UI (Electron-only features)
│           └── PlatformAuth.jsx # Platform login (Electron-only)
│
├── backend/            # Express API (shared by both platforms)
│   └── src/
│       ├── index.js    # Entry point
│       ├── routes/     # API endpoints
│       └── services/   # AI providers, scrapers
│
└── extension/          # Browser extension (webapp support)
```

### Backend (Express.js, Node 20+, ES Modules)
- `backend/src/index.js` - Main entry, configures Express with routes and middleware
- `backend/src/routes/` - API endpoints:
  - `solve.js` - POST /api/solve/stream - SSE streaming for problem solutions
  - `analyze.js` - POST /api/analyze - Screenshot OCR extraction (uses OpenAI Vision)
  - `fetch.js` - POST /api/fetch - Scrape problems from URLs (requires platform cookies for auth)
  - `run.js` - POST /api/run - Sandboxed code execution via Piston API
  - `fix.js` - POST /api/fix - AI-powered code fixing based on error output
  - `auth.js` - Platform authentication for extension
- `backend/src/services/` - AI provider integrations:
  - `claude.js` - Anthropic SDK wrapper
  - `openai.js` - OpenAI SDK wrapper
  - `scraper.js` - Cheerio-based URL scraping for HackerRank/LeetCode/Glider/Lark

### Frontend (React 18 + Vite + TailwindCSS)
- `frontend/src/App.jsx` - Main app, handles SSE streaming, state management, resizable panels
- `frontend/src/components/` - UI components:
  - `ProblemInput.jsx` - Text input, URL input, screenshot upload
  - `CodeDisplay.jsx` - Syntax-highlighted code with streaming support
  - `ExplanationPanel.jsx` - Line-by-line explanations
  - `ProviderToggle.jsx` - Claude/GPT-4 switcher
  - `PlatformStatus.jsx` - Auth status for scraped platforms
- `frontend/src/hooks/useElectron.js` - Electron detection and API URL resolution

### Browser Extension (`extension/`)
Chrome extension that captures session cookies from coding platforms (Glider, Lark, HackerRank) to enable authenticated problem fetching. Syncs cookies to the backend temporarily (4 hours).

## Key Patterns

- **SSE Streaming**: The solve endpoint uses Server-Sent Events to stream AI responses in real-time. Frontend uses `EventSource` or `fetch` with stream reading.
- **Provider Abstraction**: Both `claude.js` and `openai.js` services share the same interface for solving problems
- **Scraper Strategy**: `scraper.js` has platform-specific scraping logic for different coding sites (Glider, Lark, HackerRank, LeetCode)
- **Platform Detection**: `isElectron = window.electronAPI?.isElectron` determines runtime environment
- **Auth Headers**: Use `getAuthHeaders()` helper to include JWT token in API requests (webapp only)

## Environment Variables

Backend requires `.env` file in `backend/` directory:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PORT=3001
```

---

## Desktop App & Webapp Synchronization Guide

### When Making Changes, Always Consider Both Platforms

**Before implementing any feature or fix, ask:**
1. Does this change affect the shared frontend code?
2. Does this change affect the shared backend API?
3. Does this need Electron-specific handling?
4. Does the webapp need an equivalent implementation?

### Change Categories and Sync Requirements

#### 1. UI/UX Changes (HIGH SYNC PRIORITY)
**Location:** `frontend/src/components/`

These changes automatically apply to both platforms since they share the frontend codebase.

**Checklist:**
- [ ] Test in both `npm run dev` (webapp) and `npm run dev:electron` (desktop)
- [ ] Verify responsive behavior (desktop windows can resize)
- [ ] Check dark/light theme compatibility if applicable
- [ ] Ensure no Electron-only APIs are used without feature detection

**Example pattern for conditional rendering:**
```jsx
const isElectron = window.electronAPI?.isElectron || false;

// Electron-only feature
{isElectron && <SettingsButton onClick={() => setShowSettings(true)} />}

// Webapp-only feature
{!isElectron && <CloudSyncButton />}
```

#### 2. API/Backend Changes (AUTOMATIC SYNC)
**Location:** `backend/src/`

Backend changes automatically apply to both platforms.

**Checklist:**
- [ ] Test endpoint works with both Electron embedded server and standalone server
- [ ] Verify CORS settings if adding new origins
- [ ] Check authentication middleware behavior (Electron skips auth)

#### 3. Electron-Specific Features (WEBAPP EQUIVALENT NEEDED)
**Location:** `electron/`

When adding Electron features, consider webapp equivalents.

| Electron Feature | Webapp Equivalent |
|------------------|-------------------|
| Native menus | Header nav buttons |
| Secure keychain storage | localStorage + server-side validation |
| Platform auth windows | Browser extension cookie sync |
| Auto-updater | Service worker or manual update prompt |
| File system access | File input + drag-drop |
| System notifications | Web notifications API |

**Checklist for Electron features:**
- [ ] Implement in `electron/` directory
- [ ] Add IPC handler in `electron/main.js` or `electron/ipc/`
- [ ] Expose via `electron/preload.js`
- [ ] Document the webapp equivalent needed
- [ ] Create webapp fallback or alternative if applicable

#### 4. Settings/Configuration (PLATFORM-SPECIFIC STORAGE)

| Setting | Desktop | Webapp |
|---------|---------|--------|
| API Keys | `electron/store/secure-store.js` | localStorage or user account |
| User preferences | `electron/store/config-store.js` | localStorage |
| Platform cookies | Electron session | Browser extension sync |

**When adding new settings:**
- [ ] Add to Electron secure/config store
- [ ] Add to webapp localStorage with same key naming
- [ ] Update `frontend/src/components/settings/SettingsPanel.jsx`
- [ ] Add migration logic if changing existing settings

#### 5. Authentication & Authorization

**Desktop App:** Auth is skipped (`isElectron` check bypasses login)
**Webapp:** Full auth flow required

**When modifying auth:**
- [ ] Verify desktop app still skips auth
- [ ] Test webapp login/logout flow
- [ ] Check token handling in `getAuthHeaders()`

### Feature Development Workflow

1. **Plan:** Identify which platforms are affected
2. **Implement:** Start with shared code, then add platform-specific
3. **Test Desktop:** `npm run dev:electron`
4. **Test Webapp:** `npm run dev`
5. **Document:** Note any platform-specific behaviors

### Common Pitfalls

1. **Using `window.electronAPI` without checks** - Always check existence first
2. **Hardcoding localhost URLs** - Use `getApiUrl()` from `useElectron.js`
3. **Adding Electron-only UI without guards** - Wrap in `{isElectron && ...}`
4. **Forgetting to test both modes** - Make it a habit to test both
5. **Not considering webapp equivalents** - Document what webapp needs

### Quick Reference: Platform Detection

```javascript
// In React components
import { getApiUrl } from './hooks/useElectron';
const isElectron = window.electronAPI?.isElectron || false;
const API_URL = getApiUrl();

// Conditional IPC calls
if (isElectron && window.electronAPI) {
  const result = await window.electronAPI.someMethod();
}
```

### Testing Checklist for PRs

- [ ] Tested with `npm run dev` (webapp mode)
- [ ] Tested with `npm run dev:electron` (desktop mode)
- [ ] No console errors in either mode
- [ ] Platform-specific code properly guarded
- [ ] Documented webapp equivalents for Electron-only features

## Notes

- **No tests configured**: This project currently has no automated test suite
- **No linting configured**: No ESLint/Prettier setup - follow existing code style
- **Styling**: Uses TailwindCSS with custom theme in `frontend/src/index.css` (CSS variables for colors)
