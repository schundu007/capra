# Ascend

AI-powered coding assistant.

## Features

- **Text Input**: Paste problem descriptions to get AI-generated solutions
- **Screenshot Upload**: Upload images of coding problems for automatic extraction and solving
- **URL Fetch**: Enter HackerRank/LeetCode URLs to auto-extract problems
- **Provider Toggle**: Switch between Claude and GPT-4
- **Split View**: Code solution on the left, line-by-line explanations on the right
- **Copy to Clipboard**: Quick copy solution code
- **Syntax Highlighting**: Python code with proper highlighting

## Project Structure

```
ascend/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProblemInput.jsx
│   │   │   ├── ScreenshotUpload.jsx
│   │   │   ├── CodeDisplay.jsx
│   │   │   ├── ExplanationPanel.jsx
│   │   │   └── ProviderToggle.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/           # Express.js API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── solve.js
│   │   │   ├── analyze.js
│   │   │   └── fetch.js
│   │   ├── services/
│   │   │   ├── claude.js
│   │   │   ├── openai.js
│   │   │   └── scraper.js
│   │   └── index.js
│   └── package.json
└── package.json       # Root scripts
```

## Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your API keys:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PORT=3001
```

### 3. Run Development Server

```bash
npm run dev
```

This starts both the backend (http://localhost:3001) and frontend (http://localhost:5173).

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## API Endpoints

- `POST /api/solve` - Solve a coding problem from text
- `POST /api/analyze` - Analyze a screenshot of a problem
- `POST /api/fetch` - Fetch problem from a URL
- `GET /api/health` - Health check

## Usage

1. **Text Input**: Paste a coding problem in the text area and click "Solve Problem"
2. **URL Input**: Enter a HackerRank or LeetCode URL and click "Fetch & Solve"
3. **Screenshot**: Drag & drop or click to upload an image of a coding problem
4. **Toggle Provider**: Click Claude or GPT-4 to switch AI providers

The solution appears in the split view with code on the left and explanations on the right.
Hover over code lines to highlight the corresponding explanation.

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, react-split-pane, react-syntax-highlighter
- **Backend**: Node.js, Express, Anthropic SDK, OpenAI SDK, Cheerio
