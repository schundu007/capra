You are refactoring the Ascend app at /home/user/capra. This is Phase 1: Critical Foundation Fixes. Complete ALL tasks below. Read each file before editing. Commit after completing all tasks.

IMPORTANT RULES:
- Do NOT break existing functionality
- Do NOT change backend code in this phase
- Keep Electron compatibility (check `isElectron` guards)
- Use existing Tailwind design tokens from tailwind.config.js (brand-*, neutral-*, etc.)
- Test that the dev server starts after changes: `cd frontend && npm run dev`

---

TASK 1: INSTALL AND CONFIGURE REACT ROUTER

1. Install react-router-dom v6: `cd frontend && npm install react-router-dom@6`

2. Create `frontend/src/router.jsx`:
   - Import `BrowserRouter`, `Routes`, `Route`, `Navigate` from react-router-dom
   - Import `MemoryRouter` for Electron
   - Import `isElectron` from `./constants`
   - Define routes matching the current manual pathname checks in App.jsx:
     - `/` → LandingPage (renders OAuthLogin for unauthenticated, redirects to /app for authenticated)
     - `/login` → Redirect to `/`
     - `/download` → DownloadPage (lazy loaded)
     - `/premium` → PremiumPage (lazy loaded)
     - `/prepare/*` → DocsPage (lazy loaded)
     - `/problems/:slug` → ProblemPage (lazy loaded)
     - `/app` → MainApp with default coding mode (lazy loaded)
     - `/app/coding` → MainApp coding mode
     - `/app/design` → MainApp system-design mode
     - `/app/prep` → MainApp behavioral mode
     - `*` → NotFound page
   - Export a `<AppRouter>` component that uses `BrowserRouter` for web, `MemoryRouter` for Electron
   - Wrap routes in `<React.Suspense fallback={<LoadingScreen />}>`

3. Create `frontend/src/pages/MainApp.jsx`:
   - Extract the main authenticated app UI from App.jsx (the Allotment split pane with ProblemInput, CodeDisplay, ExplanationPanel, Sidebar, etc.)
   - Use `useParams()` or route path to determine ascendMode instead of `window.location.pathname`
   - Keep all existing state management and hooks - just move them here from App.jsx

4. Create `frontend/src/pages/LandingPage.jsx`:
   - Wraps OAuthLogin
   - If user is authenticated, redirect to `/app` using `<Navigate to="/app" />`

5. Create `frontend/src/pages/NotFound.jsx`:
   - Simple 404 page: centered text "Page not found" with a "Go Home" link to `/`
   - Style with existing Tailwind: bg-neutral-900, text-neutral-200, rounded-xl

6. Create `frontend/src/components/shared/LoadingScreen.jsx`:
   - Full-viewport centered loading spinner
   - Dark background bg-neutral-900, brand-colored spinner (brand-400)
   - Text "Loading..." in text-neutral-400 below spinner

7. Update `frontend/src/main.jsx` (or main.tsx):
   - Wrap `<App />` with `<AppRouter>` from router.jsx
   - Keep AuthProvider wrapping

8. Slim down `frontend/src/App.jsx`:
   - Remove ALL manual pathname checks (`isLandingPage`, `isDownloadPage`, `isPremiumPage`, `isDocsPage`, `isProblemPage`, `appModeFromPath`)
   - Remove the conditional rendering blocks that checked those variables
   - App.jsx should now only contain: providers (AuthProvider, theme), the `<AppRouter>`, and global overlays (toasts, modals that appear everywhere)
   - Replace any `window.location.href = '/path'` with `useNavigate()` from react-router-dom

9. Update any component that uses `window.location.href` or `window.location.pathname` for navigation to use React Router's `useNavigate()` or `<Link>` component instead. Search all files in frontend/src/ for these patterns.

---

TASK 2: ADD ERROR BOUNDARIES

1. Create `frontend/src/components/shared/ErrorBoundary.jsx`:

```jsx
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px] bg-neutral-800/50 rounded-xl border border-neutral-700/50">
          <div className="text-error-400 text-lg font-medium mb-2">Something went wrong</div>
          <p className="text-neutral-400 text-sm mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

2. Wrap these in ErrorBoundary in the MainApp page:
   - The main content area (around the Allotment/split pane)
   - AscendAssistantPanel
   - AscendPrepModal
   - SystemDesignPanel
   - Each settings/modal component

---

TASK 3: FIX DESTRUCTIVE TAB SWITCHING IN ProblemInput

Read `frontend/src/components/ProblemInput.jsx` first.

1. Find the tab switching handler (the function that runs when switching between Text/URL/Screenshot tabs)
2. Before clearing content, check if user has input:
   ```js
   const hasContent = extractedText?.trim() || currentProblem?.trim();
   if (hasContent) {
     const confirmed = window.confirm('Switching tabs will clear your current input. Continue?');
     if (!confirmed) return;
   }
   ```
3. Add beforeunload listener when there's unsaved content:
   ```js
   useEffect(() => {
     const handler = (e) => {
       if (extractedText?.trim() || currentProblem?.trim()) {
         e.preventDefault();
         e.returnValue = '';
       }
     };
     window.addEventListener('beforeunload', handler);
     return () => window.removeEventListener('beforeunload', handler);
   }, [extractedText, currentProblem]);
   ```

---

TASK 4: FIX ACCESSIBILITY - ARIA LABELS

Search ALL files in `frontend/src/components/` for `<button` elements that contain only icons (SVG elements, icon components) without visible text labels.

For EACH icon-only button found, add an appropriate `aria-label`. Examples:
- Copy buttons: `aria-label="Copy code"`
- Close/dismiss buttons: `aria-label="Close"`
- Collapse buttons: `aria-label="Collapse panel"`
- Expand buttons: `aria-label="Expand panel"`
- Settings buttons: `aria-label="Open settings"`
- Clear buttons: `aria-label="Clear input"`
- Send/submit buttons: `aria-label="Send message"`
- Delete buttons: `aria-label="Delete"`

Files to check (at minimum):
- ProblemInput.jsx
- CodeDisplay.jsx
- AppHeader.jsx or Header.tsx
- ExplanationPanel.jsx
- AscendAssistantPanel.jsx
- AscendPrepModal.jsx
- SystemDesignPanel.jsx
- VoiceAssistantPanel.jsx
- OnboardingModal.jsx
- SettingsPanel.jsx
- Sidebar.jsx
- Any file in components/ui/

Additional a11y fixes:
- In OAuthLogin.jsx: replace the navigation `<div>` with `<nav aria-label="Main navigation">`
- In CodeDisplay.jsx: add `aria-live="polite"` to the element that shows "Copied!" feedback
- In OnboardingModal.jsx: add `aria-label="Step X of Y"` to each progress dot, add `aria-current="step"` to the active dot
- In any form Input components: if there's an error message displayed, link it to the input with `aria-describedby`

---

TASK 5: FIX UNDEFINED CSS CLASSES

Read `frontend/src/styles/components.css` first.

Add these missing class definitions:

In `frontend/src/styles/components.css`:
```css
/* Glass card effect */
.glass-card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1rem;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #2dd4bf, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

In `frontend/src/styles/animations.css`, add:
```css
/* Pulse glow animation */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 8px rgba(45, 212, 191, 0.2);
  }
  50% {
    box-shadow: 0 0 24px rgba(45, 212, 191, 0.5);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

In `frontend/src/styles/tokens.css`, add these missing CSS variables (in the :root block):
```css
--brand-gradient: linear-gradient(135deg, #14b8a6, #2dd4bf, #22d3ee);
--shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3);
```

In `frontend/tailwind.config.js`, add `bg-gradient-radial` if not present:
```js
// In theme.extend.backgroundImage:
'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
```

---

TASK 6: FIX SEO AND HTML META TAGS

Update `frontend/index.html`:

1. Replace the entire `<head>` content with:
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ascend | AI-Powered Coding Interview Prep</title>
  <meta name="description" content="Ascend is an AI-powered coding assistant for technical interview preparation. Practice coding problems, system design, and behavioral interviews with real-time AI guidance." />
  <meta name="theme-color" content="#0f172a" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://capra.cariara.com" />
  <meta property="og:title" content="Ascend | AI-Powered Coding Interview Prep" />
  <meta property="og:description" content="Practice coding interviews with AI-powered problem solving, system design diagrams, and behavioral interview coaching." />
  <meta property="og:image" content="https://capra.cariara.com/og-image.png" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Ascend | AI-Powered Coding Interview Prep" />
  <meta name="twitter:description" content="AI-powered coding interview preparation" />

  <link rel="canonical" href="https://capra.cariara.com" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/favicon.svg" />

  <!-- Fonts (with display=swap for performance) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</head>
```

2. Remove the deploy timestamp comment at the bottom of the file: `<!-- Trigger redeploy ... -->`

3. Create `frontend/public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0f172a"/>
  <text x="16" y="23" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#2dd4bf" text-anchor="middle">A</text>
</svg>
```

4. Delete `frontend/public/vite.svg` if it exists.

---

FINAL: Verify the app starts without errors:
```bash
cd frontend && npm run dev
```

Check the terminal output for build errors. Fix any import errors or missing references.

Then commit all changes:
```bash
git add -A && git commit -m "Phase 1: React Router, error boundaries, a11y, CSS fixes, SEO meta tags"
```
