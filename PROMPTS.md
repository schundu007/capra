# Claude Code CLI Prompts - Fix All Issues

Copy and paste each prompt into Claude Code CLI (`claude`) one phase at a time.
Wait for each phase to complete before starting the next.

---

## Phase 1: Critical Foundation Fixes

```
You are refactoring the Ascend app in /home/user/capra. Complete ALL of the following tasks in this phase. Do not skip any. Commit after each major task.

### Task 1.1: Install and configure React Router

1. Run `cd frontend && npm install react-router-dom@6`
2. Create `frontend/src/router.jsx` with route definitions for ALL existing paths:
   - `/` and `/login` → LandingPage (currently OAuthLogin)
   - `/download` → DownloadPage
   - `/premium` → PremiumPage
   - `/prepare/*` → DocsPage
   - `/problems/:slug` → ProblemPage
   - `/app/coding` → MainApp with coding mode
   - `/app/design` → MainApp with system-design mode
   - `/app/prep` → MainApp with behavioral mode
   - `/app` → MainApp (default coding mode)
3. Wrap the app with `<BrowserRouter>` in `frontend/src/main.jsx` (or main.tsx)
4. Replace ALL manual `window.location.pathname` checks in `App.jsx` with React Router's `<Routes>`, `<Route>`, `useParams()`, `useNavigate()`
5. Replace any `window.location.href = ...` navigation with `useNavigate()`
6. Create a `frontend/src/pages/` directory and extract route-level components:
   - `pages/LandingPage.jsx` (wraps OAuthLogin)
   - `pages/MainApp.jsx` (the main coding/design/prep interface extracted from App.jsx)
   - `pages/NotFound.jsx` (new 404 page)
7. Keep Electron compatibility: if `isElectron` is true, skip the router or use `MemoryRouter`
8. Verify no existing functionality breaks - all paths should render the same components as before

### Task 1.2: Add Error Boundaries

1. Create `frontend/src/components/shared/ErrorBoundary.jsx`:
   - Class component with `componentDidCatch` and `getDerivedStateFromError`
   - Render a user-friendly error card with "Something went wrong" message
   - Include a "Try Again" button that calls `this.setState({ hasError: false })`
   - Style with existing Tailwind classes (bg-neutral-800, text-neutral-200, rounded-xl, etc.)
2. Wrap these sections in `<ErrorBoundary>`:
   - The main content area (ProblemInput + CodeDisplay + ExplanationPanel)
   - AscendAssistantPanel
   - AscendPrepModal
   - SystemDesignPanel
   - Each modal (Settings, Onboarding, PlatformAuth)
3. Do NOT wrap the entire app in one boundary - use granular boundaries

### Task 1.3: Fix ProblemInput destructive tab switching

In `frontend/src/components/ProblemInput.jsx`:
1. Find the tab switching handler that clears user data
2. Before clearing, check if there is existing user input (text content, uploaded image, or URL)
3. If content exists, show a browser `confirm()` dialog: "Switching tabs will clear your current input. Continue?"
4. Only clear if user confirms; otherwise, revert to the previous tab
5. Also add `beforeunload` event listener when there is unsaved input to prevent accidental page close

### Task 1.4: Fix all accessibility - aria-labels

Search the entire `frontend/src/` directory for all `<button>` elements that only contain an icon (SVG, icon component, or emoji) without visible text. For EACH one:
1. Add an appropriate `aria-label` describing the button's action (e.g., `aria-label="Copy code"`, `aria-label="Close modal"`, `aria-label="Collapse panel"`)
2. Files to check (not exhaustive): ProblemInput.jsx, CodeDisplay.jsx, AppHeader.jsx, Header.tsx, ExplanationPanel.jsx, AscendAssistantPanel.jsx, OnboardingModal.jsx, SettingsPanel.jsx, Sidebar.jsx
3. Also fix: add `role="navigation"` or replace `<div>` with `<nav>` for navigation sections in OAuthLogin.jsx
4. Add `aria-live="polite"` to the "Copied!" toast/notification in CodeDisplay.jsx
5. Add `aria-describedby` linking error messages to their input fields in any form component

### Task 1.5: Fix undefined CSS classes

1. In `frontend/src/styles/components.css`, add definitions for these missing classes:
   - `.glass-card` - frosted glass effect: `background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 1rem;`
   - `.gradient-text` - gradient text: `background: linear-gradient(135deg, #2dd4bf, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`
2. In `frontend/src/styles/animations.css`, add:
   - `@keyframes pulse-glow` and `.animate-pulse-glow` class with a pulsing glow effect using brand color `rgba(45, 212, 191, 0.3)`
3. In `frontend/src/styles/tokens.css`, add missing CSS variables:
   - `--brand-gradient: linear-gradient(135deg, #14b8a6, #2dd4bf, #22d3ee);`
   - `--shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3);`
4. In `tailwind.config.js`, add `bg-gradient-radial` utility if not present (use `backgroundImage` extend)

### Task 1.6: Fix SEO meta tags

Update `frontend/index.html`:
1. Change `<title>` to `Ascend | AI-Powered Coding Interview Prep`
2. Add these meta tags in `<head>`:
   ```html
   <meta name="description" content="Ascend is an AI-powered coding assistant that helps you prepare for technical interviews with real-time problem solving, system design, and behavioral interview practice." />
   <meta name="theme-color" content="#0f172a" />
   <meta property="og:type" content="website" />
   <meta property="og:url" content="https://capra.cariara.com" />
   <meta property="og:title" content="Ascend | AI-Powered Coding Interview Prep" />
   <meta property="og:description" content="Prepare for coding interviews with AI-powered problem solving, system design diagrams, and behavioral interview practice." />
   <meta property="og:image" content="https://capra.cariara.com/og-image.png" />
   <meta name="twitter:card" content="summary_large_image" />
   <meta name="twitter:title" content="Ascend | AI-Powered Coding Interview Prep" />
   <meta name="twitter:description" content="AI-powered coding interview preparation" />
   <link rel="canonical" href="https://capra.cariara.com" />
   ```
3. Remove the deploy comment at the bottom: `<!-- Trigger redeploy ... -->`
4. Replace the Vite favicon with a proper branded favicon (create a simple SVG favicon with the letter "A" in brand teal #14b8a6)
5. Add `font-display=swap` to the Google Fonts URL

Commit all Phase 1 changes with message: "Phase 1: React Router, error boundaries, a11y, SEO, CSS fixes"
```

---

## Phase 2: State Architecture & Code Splitting

```
You are continuing the Ascend app refactor in /home/user/capra. This phase focuses on state management and code splitting. The app already has React Router from Phase 1.

### Task 2.1: Migrate App.jsx state to Zustand store

The file `frontend/src/store/appStore.ts` already exists with some slices. Expand it:

1. Read the current appStore.ts to understand existing slices
2. Add these NEW slices to the store (keep existing ones):

   **ProviderSlice:**
   - `provider`, `model`, `autoSwitch` (currently in App.jsx as localStorage hooks)
   - Actions: `setProvider`, `setModel`, `setAutoSwitch`
   - Persist to localStorage with key `ascend_provider_settings`

   **ModeSlice:**
   - `ascendMode`, `designDetailLevel`, `codingDetailLevel`, `codingLanguage`, `autoGenerateEraser`
   - Actions: setters for each
   - Persist `ascendMode` to localStorage

   **ModalSlice:**
   - `showSettings`, `showSetupWizard`, `showPlatformAuth`, `showAscendAssistant`, `showPrepTab`, `showSavedDesigns`, `showAdminPanel`, `showPricingPlans`, `showOnboarding`
   - Actions: `openModal(name)`, `closeModal(name)`, `toggleModal(name)`
   - Do NOT persist modals

   **EditorSlice:**
   - `editorSettings` (theme, keyBindings, fontSize, tabSpacing, intelliSense, autoCloseBrackets)
   - `sidebarCollapsed`
   - Actions: `updateEditorSettings(partial)`, `toggleSidebar`
   - Persist to localStorage

3. Update App.jsx (or the new pages/MainApp.jsx) to use `useAppStore()` instead of useState hooks
4. Update ALL child components that receive these as props to use `useAppStore()` directly instead
5. This should eliminate most prop drilling. Components like AppHeader, ProblemInput, CodeDisplay should import from store directly
6. Rename all `chundu_*` localStorage keys to `ascend_*` in the store's persist config. The migration function in App.jsx already handles backward compat.

### Task 2.2: Implement code splitting with React.lazy

In the router file (`frontend/src/router.jsx`):

1. Wrap each route component with `React.lazy()`:
   ```js
   const LandingPage = React.lazy(() => import('./pages/LandingPage'));
   const MainApp = React.lazy(() => import('./pages/MainApp'));
   const DownloadPage = React.lazy(() => import('./components/billing/DownloadPage'));
   const PremiumPage = React.lazy(() => import('./components/billing/PremiumPage'));
   const DocsPage = React.lazy(() => import('./components/DocsPage'));
   const ProblemPage = React.lazy(() => import('./components/ProblemPage'));
   ```

2. Wrap `<Routes>` in `<Suspense fallback={<LoadingScreen />}>`

3. Create `frontend/src/components/shared/LoadingScreen.jsx`:
   - Full-screen centered spinner with the Ascend brand
   - Dark background (bg-neutral-900), brand-colored spinner
   - "Loading..." text below spinner

4. Lazy-load heavy modals too:
   ```js
   const AscendAssistantPanel = React.lazy(() => import('./components/AscendAssistantPanel'));
   const AscendPrepModal = React.lazy(() => import('./components/AscendPrepModal'));
   const SystemDesignPanel = React.lazy(() => import('./components/SystemDesignPanel'));
   const SettingsPanel = React.lazy(() => import('./components/settings/SettingsPanel'));
   ```

5. Lazy-load Mermaid: in any component that imports mermaid, change to dynamic import:
   ```js
   const mermaid = await import('mermaid');
   ```

### Task 2.3: Split the largest component files

Split `App.jsx` (should now be much smaller after Task 2.1, but clean up remaining):

1. Extract the solve/streaming logic into a custom hook `frontend/src/hooks/useAppSolve.js` if not already done
2. Extract the auth-check logic into `frontend/src/hooks/useAuthCheck.js`
3. The remaining App.jsx should ONLY contain: Router setup, AuthProvider wrapper, theme application, and the top-level layout
4. It should be under 100 lines

For other large files, just add TODO comments at the top noting the recommended split (don't actually split them in this phase to limit risk):
- `AscendAssistantPanel.jsx`: `// TODO: Split into ChatMessages, ChatInput, AssistantControls, AssistantHistory`
- `AscendPrepModal.jsx`: `// TODO: Split into PrepInputPanel, PrepOutputPanel, PrepControls`
- `SystemDesignPanel.jsx`: `// TODO: Split into DiagramViewer, DesignExplanation, DesignControls`

Commit: "Phase 2: Zustand state migration, code splitting, App.jsx decomposition"
```

---

## Phase 3: UX Modernization

```
You are continuing the Ascend app refactor in /home/user/capra. This phase focuses on user experience improvements.

### Task 3.1: Add mobile navigation to landing page

In `frontend/src/components/auth/OAuthLogin.jsx`:

1. Add a hamburger menu button (visible only on mobile: `md:hidden`) in the header
2. Create a slide-out mobile nav drawer with the same links as desktop nav
3. Use `<nav>` semantic element (replacing any `<div>` used for navigation)
4. The mobile menu should:
   - Slide in from the right with animation
   - Have a close button
   - Close on link click
   - Close on backdrop click
   - Trap focus while open
5. Replace all hardcoded hex colors (#10b981, #34d399, etc.) with Tailwind design tokens (brand-500, brand-400, etc. from tailwind.config.js)
6. Make CTA buttons clearer: "Start Practicing Free" instead of "Get Started", "Browse Problems" instead of "Explore First"

### Task 3.2: Add skeleton loading states

Create `frontend/src/components/shared/Skeleton.jsx`:
1. A reusable skeleton component with variants:
   - `<Skeleton variant="text" />` - single line shimmer
   - `<Skeleton variant="code" />` - multi-line code block shimmer
   - `<Skeleton variant="card" />` - card-shaped shimmer
   - `<Skeleton variant="panel" />` - full panel shimmer
2. Style: `bg-neutral-700 animate-shimmer` with gradient overlay
3. Accept `width`, `height`, `lines` props

Add skeleton loading to:
- CodeDisplay: show code skeleton while solution is streaming
- ExplanationPanel: show text skeleton while loading
- ProblemPage: show content skeleton while fetching problem

### Task 3.3: Add empty states

Create `frontend/src/components/shared/EmptyState.jsx`:
1. Props: `icon`, `title`, `description`, `action` (optional button)
2. Centered layout with muted icon, heading, description text, and optional CTA button

Add empty states to:
- CodeDisplay when no solution exists: icon=code, title="No Solution Yet", description="Enter a problem and click Solve to see the solution here", action="Go to Input"
- ExplanationPanel when no explanation: icon=book, title="Explanation will appear here", description="Once a solution is generated, you'll see a detailed explanation"
- SystemDesignPanel when no design: icon=diagram, title="System Design", description="Describe a system design problem to get started"

### Task 3.4: Make copy button always visible in CodeDisplay

In `frontend/src/components/CodeDisplay.jsx`:
1. Find the copy button that uses `opacity-0 group-hover:opacity-100` or similar
2. Change it to always visible: remove the opacity-0, keep it styled as a small icon button in the top-right corner
3. Use a subtle style: `bg-neutral-700/50 hover:bg-neutral-600 text-neutral-400 hover:text-neutral-200`
4. Add `aria-live="polite"` to the "Copied!" feedback element
5. Add title/aria-label: `aria-label="Copy code to clipboard"`

### Task 3.5: Implement autosave for problem input

In `frontend/src/components/ProblemInput.jsx`:
1. Add a `useEffect` that debounces (500ms) saving the current input to localStorage key `ascend_draft_input`
2. On component mount, check for saved draft and restore it
3. Show a small "Draft saved" indicator (text-neutral-500, text-xs) near the input when draft is saved
4. Clear the draft when the user successfully submits/solves
5. Add autofocus to the textarea on mount (unless on mobile)

### Task 3.6: Fix contrast issues

Update these components for WCAG AA compliance (4.5:1 minimum contrast ratio):
1. ProblemInput.jsx: Change `text-neutral-300` on dark backgrounds to `text-neutral-200`
2. OAuthLogin.jsx: Change `text-gray-600` to `text-neutral-400` (lighter on dark bg)
3. Button.jsx ghost variant: Change `text-neutral-400` to `text-neutral-300`
4. Any other `text-neutral-400` or `text-neutral-500` on `bg-neutral-800/900` → bump to `text-neutral-300`

Commit: "Phase 3: Mobile nav, skeleton loading, empty states, UX improvements"
```

---

## Phase 4: Performance Optimization

```
You are continuing the Ascend app refactor in /home/user/capra. This phase focuses on performance.

### Task 4.1: Optimize Google Fonts loading

In `frontend/index.html`:
1. Add `&display=swap` to the Google Fonts URL if not already done
2. Add `<link rel="preload">` for the font files:
   ```html
   <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" as="style" />
   ```
3. Consider adding `font-display: swap` fallback in CSS:
   ```css
   @font-face { font-family: 'Inter'; font-display: swap; }
   ```

### Task 4.2: Add React.memo to expensive components

Wrap these components with React.memo:
1. `CodeDisplay` - only re-render when solution/language/highlighted line changes
2. `ExplanationPanel` - only re-render when explanation data changes
3. `ProblemInput` - only re-render when input-related props change
4. `Sidebar` - only re-render when collapsed state or mode changes

For each, add a custom comparison function if needed to avoid unnecessary re-renders on object prop changes.

### Task 4.3: Debounce textarea height calculation

In `frontend/src/components/ProblemInput.jsx`:
1. Find the `adjustTextareaHeight` function that runs on every keystroke
2. Wrap it with a debounce (use the existing `useDebounce` hook or create a simple one) with 100ms delay
3. Keep the initial calculation immediate (only debounce subsequent ones)

### Task 4.4: Replace inline styles with CSS classes

In `frontend/src/components/auth/OAuthLogin.jsx`:
1. Find all `style={{ ... }}` props
2. Convert each to Tailwind classes or add to components.css
3. Specifically replace hardcoded gradients with Tailwind `bg-gradient-to-*` utilities or CSS custom properties
4. Do the same for `frontend/src/components/onboarding/OnboardingModal.jsx`

### Task 4.5: Clean up SSE connections

Search for any SSE/EventSource/fetch with streaming in frontend/src/:
1. Ensure every streaming connection has cleanup in a useEffect return function
2. Ensure AbortController is used and abort() is called on unmount
3. Check `useSolve.js`, `useStreamingParser.js`, and any component using `EventSource`

Commit: "Phase 4: Font loading, React.memo, debouncing, inline style cleanup, SSE cleanup"
```

---

## Phase 5: Code Quality & Security

```
You are continuing the Ascend app refactor in /home/user/capra. Final phase: quality and security.

### Task 5.1: Standardize file extensions

Do NOT rename files in this task (too risky). Instead:
1. Create `frontend/src/types/components.ts` with TypeScript interfaces for the most-used component props:
   - `ProblemInputProps`
   - `CodeDisplayProps`
   - `ExplanationPanelProps`
   - `AppHeaderProps`
   - `SidebarProps`
2. Add JSDoc type annotations to the top of each JSX file that references the types:
   ```js
   /** @typedef {import('../types/components').ProblemInputProps} Props */
   /** @param {Props} props */
   ```
3. This gives type safety without renaming files

### Task 5.2: Remove dead code and legacy references

1. Search for and remove any references to undefined CSS classes that weren't fixed in Phase 1 (double-check `glass-card`, `gradient-text`, `animate-pulse-glow` are now defined)
2. In App.jsx: remove the `migrateStorageKeys()` function and its call - storage should already be migrated after months. Or move it to a one-time migration utility.
3. Remove the `Re-export for backward compatibility` line: `export { getAuthHeaders };` from App.jsx if nothing imports it from there
4. Search for any remaining `chundu_` references in the codebase and update to `ascend_` equivalents
5. Remove any commented-out code blocks (dead code)

### Task 5.3: Add security headers

1. In `frontend/index.html`, add CSP meta tag:
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.railway.app https://*.cariara.com wss://*.cariara.com;" />
   ```
   Note: Adjust the connect-src to include any API domains actually used.

2. In `backend/src/index.js`, verify helmet is configured properly. If using default helmet config, it should already set security headers. If not:
   ```js
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
         fontSrc: ["'self'", "https://fonts.gstatic.com"],
         imgSrc: ["'self'", "data:", "blob:", "https:"],
         connectSrc: ["'self'", "https://*.railway.app", "https://*.cariara.com"],
       }
     }
   }));
   ```

3. Remove the deploy timestamp comment from index.html if still present

### Task 5.4: Consolidate header components

1. Check if both `Header.tsx` and `AppHeader.jsx` exist in `frontend/src/components/layout/`
2. If both exist and serve different purposes, rename them clearly (e.g., `LandingHeader` vs `AppHeader`)
3. If one is unused, delete it
4. Ensure only one header component is imported per context (landing page vs app)

### Task 5.5: Add a proper favicon

1. Create `frontend/public/favicon.svg`:
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
     <rect width="32" height="32" rx="8" fill="#0f172a"/>
     <text x="16" y="24" font-family="system-ui" font-weight="700" font-size="22" fill="#2dd4bf" text-anchor="middle">A</text>
   </svg>
   ```
2. Update `index.html` to reference `/favicon.svg` instead of `/vite.svg`
3. Also add: `<link rel="apple-touch-icon" href="/favicon.svg" />`

Commit: "Phase 5: Type safety, dead code cleanup, security headers, component consolidation"

After all phases, push to remote:
git push -u origin <current-branch>
```

---

## Quick Reference: Run Order

```bash
# Phase 1 - Critical fixes (start here)
claude "$(cat PROMPTS.md | sed -n '/^## Phase 1/,/^## Phase 2/p' | head -n -1)"

# Phase 2 - Architecture
claude "$(cat PROMPTS.md | sed -n '/^## Phase 2/,/^## Phase 3/p' | head -n -1)"

# Phase 3 - UX
claude "$(cat PROMPTS.md | sed -n '/^## Phase 3/,/^## Phase 4/p' | head -n -1)"

# Phase 4 - Performance
claude "$(cat PROMPTS.md | sed -n '/^## Phase 4/,/^## Phase 5/p' | head -n -1)"

# Phase 5 - Quality & Security
claude "$(cat PROMPTS.md | sed -n '/^## Phase 5/,/^## Quick/p' | head -n -1)"
```

Or run each prompt manually by copying the content between the triple backticks.
