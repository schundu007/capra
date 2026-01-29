# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capra is an AI-powered coding assistant that solves programming problems from text input, screenshots, or URLs (HackerRank/LeetCode). It supports both Claude and GPT-4 providers.

## Commands

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all

# Run both frontend and backend concurrently
npm run dev

# Run separately
cd backend && npm run dev    # Starts on http://localhost:3001
cd frontend && npm run dev   # Starts on http://localhost:5173

# Build frontend for production
npm run build

# Run with PM2 (optional)
pm2 start ecosystem.config.cjs
```

## Architecture

### Backend (Express.js, Node 20+, ES Modules)
- `backend/src/index.js` - Main entry, configures Express with routes and middleware
- `backend/src/routes/` - API endpoints:
  - `solve.js` - POST /api/solve/stream - SSE streaming for problem solutions
  - `analyze.js` - POST /api/analyze - Screenshot OCR extraction
  - `fetch.js` - POST /api/fetch - Scrape problems from URLs
  - `run.js` - Code execution
  - `fix.js` - Code fixing
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

### Browser Extension (`extension/`)
Chrome extension that captures session cookies from coding platforms (Glider, Lark, HackerRank) to enable authenticated problem fetching. Syncs cookies to the backend temporarily (4 hours).

## Key Patterns

- **SSE Streaming**: The solve endpoint uses Server-Sent Events to stream AI responses in real-time
- **Provider Abstraction**: Both `claude.js` and `openai.js` services share the same interface for solving problems
- **Scraper Strategy**: `scraper.js` has platform-specific scraping logic for different coding sites

## Environment Variables

Backend requires `.env` file in `backend/` directory:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PORT=3001
```
