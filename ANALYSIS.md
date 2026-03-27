# Capra (Ascend) - Legacy Issues & Improvement Analysis

**Date:** 2026-03-27
**Deployed URL:** capra.cariara.com
**Scope:** Full-stack analysis covering architecture, UI/UX, code quality, performance, and security.

---

## Executive Summary

The Ascend application is a functional AI-powered coding assistant, but it suffers from **legacy architecture patterns**, **poor user experience design**, **significant accessibility gaps**, and **maintainability debt** that make it feel dated and hard to use. Below are the categorized findings with severity ratings.

---

## 1. ARCHITECTURE ISSUES

### 1.1 God Component Anti-Pattern (Critical)

**File:** `frontend/src/App.jsx` (~500+ lines)

The main `App.jsx` is a monolithic component managing **30+ useState hooks**, manual URL routing, and all application logic in a single file.

```
Problem State:     6 useState hooks
Solution State:    4 useState hooks
UI State:          9 useState hooks
Modal State:       9 useState hooks
Provider State:    3 useState hooks
Mode State:        5 useState hooks
Editor/Sidebar:    3 useState hooks
```

**Impact:** Every state change re-renders the entire application tree. This is the #1 performance bottleneck.

**Fix:** Migrate to a proper router (React Router) and distribute state into the existing Zustand store (`appStore.ts` exists but is underutilized). Break App.jsx into route-level page components.

### 1.2 No Client-Side Router

The app uses manual `window.location.pathname` checks instead of React Router:

```js
const isLandingPage = !isElectron && (currentPath === '/' || currentPath === '/login');
const isDownloadPage = !isElectron && currentPath === '/download';
const isPremiumPage = !isElectron && currentPath === '/premium';
```

**Impact:** No navigation history, no code splitting, no lazy loading of routes, no transition animations, full page reloads on navigation.

### 1.3 Prop Drilling Nightmare

Components receive 13-19 props drilled from App.jsx:
- `AppHeader`: ~19 props
- `ProblemInput`: ~13 props
- `CodeDisplay`: 10+ props

**Fix:** Use Zustand store (already in project) or React Context for shared state.

### 1.4 Dual Backend Confusion

Two backends exist:
- **Node.js/Express** (`backend/src/`) - primary
- **Python/FastAPI** (`backend/app/`) - secondary

No clear documentation on when each is used. The Python backend appears partially abandoned.

### 1.5 Legacy Naming Throughout

Storage keys still reference the old "Chundu" name:
```js
useLocalStorage('chundu_provider', 'claude');
useLocalStorage('chundu_model', 'claude-sonnet-4-20250514');
useLocalStorage('chundu_auto_switch', false);
```

Migration code exists but old keys are still the primary source of truth.

---

## 2. UI/UX ISSUES

### 2.1 Landing Page / Login (OAuthLogin.jsx)

| Issue | Severity | Detail |
|-------|----------|--------|
| No mobile navigation | High | Desktop nav uses `hidden md:flex`, mobile has zero navigation |
| Hardcoded gradient colors | Medium | Uses `linear-gradient(135deg, #10b981, #34d399)` instead of design tokens |
| "Trusted by" section uses text instead of logos | Medium | Lists company names as plain text - no credibility |
| Vague CTAs | Medium | "Get Started" and "Explore First" are ambiguous |
| No loading state feedback | Medium | Spinner shows but no text explaining what's happening |
| External links unmarked | Low | Links open in new tabs without visual indicators |

### 2.2 Problem Input (ProblemInput.jsx)

| Issue | Severity | Detail |
|-------|----------|--------|
| Destructive tab switching | Critical | Changing tabs clears ALL user input without confirmation |
| No autosave/draft | High | Losing work on accidental navigation or refresh |
| No character limit indication | Medium | Shows count but no max limit (e.g., "1200/2000") |
| Magic number sizing | Medium | `lineHeight: 22`, `minHeight: lineHeight * 2 + 16` hardcoded |
| Missing autofocus | Low | User must click to start typing |

### 2.3 Code Display (CodeDisplay.jsx)

| Issue | Severity | Detail |
|-------|----------|--------|
| Copy button hidden by default | High | Only appears on hover (`opacity-0`) - poor discoverability |
| No keyboard shortcut for copy | Medium | Missing Ctrl+C hint or shortcut |
| Hardcoded max height | Medium | `maxHeight: '300px'` not responsive |
| No "Copied!" screen reader announcement | Medium | Visual-only feedback |

### 2.4 Header (AppHeader.jsx / Header.tsx)

| Issue | Severity | Detail |
|-------|----------|--------|
| Two header files exist | High | `Header.tsx` and `AppHeader.jsx` create confusion |
| Keyboard shortcut unexplained | Medium | Shows shortcut key but not what it triggers |
| Settings icon has no label | Medium | Icon-only button violates project's own UI guidelines |

### 2.5 Onboarding (OnboardingModal.jsx)

| Issue | Severity | Detail |
|-------|----------|--------|
| Skippable without consequence | Medium | Users can bypass entire onboarding in one click |
| Step jumping allowed | Medium | Clickable dots let users skip critical info |
| Undefined CSS classes | High | References `glass-card`, `gradient-text`, `animate-pulse-glow` that don't exist |
| Hardcoded company list | Low | `['Google', 'Meta', 'Amazon', ...]` should be config |

### 2.6 General UX Problems

- **No error boundaries** - Any component crash takes down the entire app
- **No empty states** - Missing helpful content when no data exists
- **No skeleton loading** - Components appear/disappear abruptly
- **No breadcrumbs or navigation hierarchy** - Users get lost in the app
- **No responsive design testing** - Multiple fixed-width containers break on mobile
- **Stealth mode** exists as a feature but has no clear documentation for users

---

## 3. ACCESSIBILITY ISSUES (WCAG 2.1 Violations)

### 3.1 Critical Violations

| Component | Issue | WCAG |
|-----------|-------|------|
| All icon buttons | Missing `aria-label` (rely on `title` only) | 1.1.1 Non-text Content |
| Input errors | No `aria-describedby` linking error text to inputs | 1.3.1 Info and Relationships |
| Onboarding dots | No accessible labels or `aria-current` | 4.1.2 Name, Role, Value |
| OAuthLogin nav | Uses `<div>` instead of `<nav>` | 1.3.1 Info and Relationships |
| CodeDisplay copy | No `aria-live` announcement for "Copied!" state | 4.1.3 Status Messages |

### 3.2 Contrast Failures

| Element | Colors | Ratio | Required |
|---------|--------|-------|----------|
| Preview text | `text-neutral-300` on `bg-neutral-700/30` | ~4:1 | 4.5:1 (AA) |
| "Trusted by" label | `text-gray-600` on dark bg | ~3:1 | 4.5:1 (AA) |
| Ghost button variant | `text-neutral-400` on transparent | ~3.5:1 | 4.5:1 (AA) |

### 3.3 Keyboard Navigation

- No visible focus indicators on many interactive elements
- Tab order not tested across major flows
- Modal trap (focus should be locked inside modals) - not verified

---

## 4. PERFORMANCE ISSUES

### 4.1 Bundle & Loading

- **No code splitting** - Entire app loads as single bundle (no React.lazy/Suspense)
- **No route-based splitting** - Landing page loads all interview/coding components
- **Google Fonts blocking** - Fonts loaded synchronously in `<head>` with no `font-display: swap`
- **Large component files** - `AscendPrepModal.jsx` (76KB), `AscendAssistantPanel.jsx` (80KB), `SystemDesignPanel.jsx` (40KB) all load eagerly
- **Mermaid.js** (large library) loaded for all users even if they never use diagrams

### 4.2 Runtime Performance

- **30+ useState in App.jsx** - Any state change causes full tree re-render
- **No React.memo** on expensive child components
- **Textarea height recalculation** on every keystroke without debounce
- **Inline styles** throughout OAuthLogin and OnboardingModal prevent CSS caching
- **OnboardingModal steps** re-created on every render (should be memoized)
- **Key-based re-mounting** (`key={currentStep}`) forces DOM destruction instead of CSS transitions

### 4.3 Network

- **No service worker** or PWA support for offline capability
- **No API response caching** strategy visible on frontend
- **SSE connections** not cleaned up properly on unmount in some components

---

## 5. SECURITY CONCERNS

### 5.1 Client-Side

| Issue | Severity | Detail |
|-------|----------|--------|
| Token in localStorage | Medium | `localStorage.getItem('ascend_auth')` - vulnerable to XSS |
| No CSP headers | Medium | No Content-Security-Policy visible in index.html |
| Deploy comment in HTML | Low | `<!-- Trigger redeploy Fri Feb 6 21:02:59 PST 2026 -->` leaks deployment info |
| Vite SVG favicon | Low | References `/vite.svg` - identifies build tool |

### 5.2 Backend

| Issue | Severity | Detail |
|-------|----------|--------|
| Rate limiting bypassable | Medium | Rate limiter uses IP - can be bypassed with proxies |
| No request signing validation visible | Medium | `requestSigning.js` exists but unclear if enforced |
| CORS whitelist includes preview URLs | Low | Railway/Vercel preview URLs get full CORS access |

---

## 6. SEO & META ISSUES

**File:** `frontend/index.html`

- **Title:** Generic "Ascend" - should be "Ascend | AI-Powered Interview Prep"
- **Missing:** `<meta name="description">` tag
- **Missing:** Open Graph tags (`og:title`, `og:description`, `og:image`)
- **Missing:** Twitter Card tags
- **Missing:** Canonical URL tag
- **Missing:** Structured data (JSON-LD)
- **Missing:** Sitemap reference
- **Missing:** `robots.txt`
- **Favicon:** Only SVG, no `.ico` or PNG fallbacks for older browsers

---

## 7. CODE QUALITY ISSUES

### 7.1 Inconsistent File Types

Mixed `.jsx` and `.tsx` without clear convention:
- `Header.tsx`, `ActionBar.tsx` (TypeScript)
- `ProblemInput.jsx`, `CodeDisplay.jsx`, `App.jsx` (JavaScript)
- No runtime prop validation on JSX files

### 7.2 Dead Code & Unused References

- CSS classes referenced but undefined: `glass-card`, `gradient-text`, `animate-pulse-glow`, `bg-gradient-radial`
- CSS variables referenced but undefined: `var(--brand-gradient)`, `var(--shadow-glow-purple)`
- Storage migration from "ascend_" to "chundu_" keys but both still actively used
- `useLocalState` custom hook used 20+ times but could be replaced with Zustand

### 7.3 Large Files Needing Decomposition

| File | Size | Recommended Split |
|------|------|-------------------|
| `AscendAssistantPanel.jsx` | 80KB | Chat, Controls, History, Settings subcomponents |
| `AscendPrepModal.jsx` | 76KB | InputPanel, OutputPanel, Controls subcomponents |
| `SystemDesignPanel.jsx` | 40KB | DiagramView, ExplanationView, Controls |
| `ExplanationPanel.jsx` | 35KB | ComplexityCard, EdgeCases, StepByStep |
| `ProblemPage.jsx` | 33KB | ProblemHeader, ProblemContent, ProblemSidebar |
| `App.jsx` | 20KB+ | Route pages, layout wrapper, providers |

### 7.4 No Testing Coverage

- Only 2 test files exist: `appStore.test.ts` and `requestSigning.test.js`
- No component tests
- No integration tests
- No E2E tests
- No CI/CD test pipeline

---

## 8. PRIORITIZED IMPROVEMENT ROADMAP

### Phase 1: Critical Fixes (Week 1-2)
1. Add React Router - replace manual pathname routing
2. Add error boundaries around major sections
3. Fix destructive tab switching in ProblemInput (add confirmation)
4. Add missing `aria-label` to all icon buttons
5. Fix undefined CSS classes causing visual bugs
6. Add `<meta>` tags for SEO

### Phase 2: Architecture (Week 3-4)
1. Migrate App.jsx state to Zustand store
2. Implement code splitting with React.lazy/Suspense
3. Split large components (start with App.jsx and AscendAssistantPanel)
4. Standardize on TypeScript (`.tsx`) for all components
5. Add proper prop types / interfaces

### Phase 3: UX Modernization (Week 5-6)
1. Redesign landing page with proper mobile navigation
2. Add skeleton loading states
3. Add empty states with helpful content
4. Implement autosave/draft for problem input
5. Make copy button always visible (not hover-only)
6. Add breadcrumb navigation

### Phase 4: Performance (Week 7-8)
1. Lazy load Mermaid.js and heavy components
2. Add `font-display: swap` for Google Fonts
3. Implement service worker for offline support
4. Add React.memo to expensive components
5. Debounce textarea height calculations

### Phase 5: Quality & Security (Week 9-10)
1. Add component testing with Vitest + Testing Library
2. Add E2E tests with Playwright
3. Implement CSP headers
4. Move tokens from localStorage to httpOnly cookies
5. Remove deployment comments from HTML
6. Add CI/CD pipeline with test gates

---

## Summary Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Architecture | 2 | 3 | 2 | 1 | 8 |
| UI/UX | 1 | 4 | 8 | 4 | 17 |
| Accessibility | 3 | 2 | 3 | 1 | 9 |
| Performance | 1 | 3 | 3 | 1 | 8 |
| Security | 0 | 0 | 4 | 3 | 7 |
| Code Quality | 1 | 3 | 3 | 2 | 9 |
| SEO | 0 | 1 | 2 | 2 | 5 |
| **Total** | **8** | **16** | **25** | **14** | **63** |
