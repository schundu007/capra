# Efficiency Report

Analysis of the capra codebase for performance inefficiencies.

---

## 1. API Client Re-instantiation on Every Request (FIXED)

**Files:** `backend/src/services/claude.js`, `backend/src/services/openai.js`, `backend/src/services/interviewPrep.js`

**Issue:** `getClient()` in both `claude.js` and `openai.js` creates a brand-new SDK client instance (`new Anthropic(...)` / `new OpenAI(...)`) on every single function call. Each call to `solveProblem`, `extractText`, `fixCode`, `solveProblemStream`, `answerFollowUpQuestion`, and `analyzeImage` triggers a fresh instantiation. The same pattern exists in `interviewPrep.js` with `getClaudeClient()` and `getOpenAIClient()`.

**Impact:** Unnecessary object allocation and potential repeated internal SDK setup (HTTP agent creation, header construction, config parsing) on every API call. Under load, this adds up.

**Fix:** Cache the client instance and only re-create it when the API key changes.

---

## 2. Duplicated SSE Stream-Reading Logic in Frontend

**File:** `frontend/src/App.jsx`

**Issue:** The SSE stream-reading pattern (fetch → getReader → decode → split lines → parse `data:` events) is copy-pasted across `solveWithStream()` (line 164), `handleFollowUpQuestion()` (line 826), and partially in `handleFetchUrl()` / `handleScreenshot()` via `solveWithStream`. The `handleFollowUpQuestion` handler re-implements the entire SSE reader from scratch instead of reusing a shared utility.

**Impact:** Code duplication increases maintenance burden and risk of subtle inconsistencies (e.g., the follow-up handler doesn't process streaming chunks for progressive display, unlike the solve handler).

**Suggested Fix:** Extract a reusable `readSSEStream(response, { onChunk, onDone, onError })` utility function.

---

## 3. `parseStreamingContent()` Re-runs All Regex on Every Chunk

**File:** `frontend/src/App.jsx` (lines 67-161)

**Issue:** During streaming, `parseStreamingContent(fullText)` is called on every single SSE chunk. Each invocation runs 5+ regex matches (code, language, pitch, complexity, systemDesign) against the entire accumulated text from the beginning. As the response grows (often 2-8 KB of JSON), these repeated full-text regex scans become increasingly expensive.

**Impact:** O(n * m) complexity where n = number of chunks and m = total text length. For a typical streaming response with ~50 chunks and ~4 KB final text, this means ~100 KB of regex scanning instead of incremental parsing.

**Suggested Fix:** Track which fields have already been extracted and skip their regex once matched, or use an incremental JSON parser.

---

## 4. Duplicated Prompt Strings Between Claude and OpenAI Services

**Files:** `backend/src/services/claude.js`, `backend/src/services/openai.js`

**Issue:** `SYSTEM_DESIGN_BASIC_PROMPT`, `SYSTEM_DESIGN_FULL_PROMPT`, `BRIEF_PROMPT`, and `FOLLOW_UP_PROMPT` are nearly identical multi-hundred-line string constants duplicated across both files. The coding prompt in `openai.js` (`CODING_PROMPT`) is a subset of `SYSTEM_PROMPT` in `claude.js`.

**Impact:** Any prompt change must be made in two places, risking drift. These large string constants also double memory usage for no reason.

**Suggested Fix:** Extract shared prompts into a `backend/src/services/prompts.js` module and import from both services.

---

## 5. Synchronous File I/O in User Service

**File:** `backend/src/services/users.js`

**Issue:** `loadUsersFromFile()` uses `fs.readFileSync()` (line 71) and `saveUsersToFile()` uses `fs.writeFileSync()` (line 91). These block the Node.js event loop during file I/O.

**Impact:** While the user data file is likely small, synchronous file operations on the main event loop can stall all other request handling during disk writes. This matters more under concurrent load.

**Suggested Fix:** Use `fs.promises.readFile` / `fs.promises.writeFile` with proper async/await.

---

## 6. `cleanupText()` Duplicated Across Files

**Files:** `frontend/src/App.jsx` (line 56), `backend/src/services/interviewPrep.js` (line 229)

**Issue:** The exact same `cleanupText()` function (replace multiple spaces, collapse newlines, trim) is defined independently in both the frontend and backend.

**Impact:** Minor code duplication, but signals a missing shared utility pattern.

**Suggested Fix:** On the backend, extract to a shared utility. On the frontend, the duplication is harder to avoid across the client/server boundary but could be shared via a common package.
