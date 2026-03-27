You are continuing the Ascend app refactor at /home/user/capra. This is Phase 2: State Architecture and Code Splitting. Phase 1 (React Router, error boundaries, a11y, CSS, SEO) is already done.

IMPORTANT RULES:
- Read each file before editing
- Do NOT break existing functionality
- Keep Electron compatibility
- Test that dev server starts after changes: `cd frontend && npm run dev`

---

TASK 1: MIGRATE App.jsx STATE TO ZUSTAND STORE

Read `frontend/src/store/appStore.ts` first to understand the existing store structure.
Read `frontend/src/App.jsx` (or pages/MainApp.jsx) to see all the useState hooks that need migrating.

Expand the Zustand store with these new slices. Use the `persist` middleware for slices that need localStorage persistence. Use `immer` middleware if already in use, otherwise use spread pattern.

Add these slices to appStore.ts:

**ProviderSlice** (persisted, key: `ascend_provider`):
```ts
interface ProviderSlice {
  provider: 'claude' | 'openai';
  model: string;
  autoSwitch: boolean;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setAutoSwitch: (enabled: boolean) => void;
}
```

**ModeSlice** (persist only ascendMode, key: `ascend_mode_settings`):
```ts
interface ModeSlice {
  ascendMode: 'coding' | 'system-design' | 'behavioral';
  designDetailLevel: string;
  codingDetailLevel: string;
  codingLanguage: string;
  autoGenerateEraser: boolean;
  setAscendMode: (mode: string) => void;
  setDesignDetailLevel: (level: string) => void;
  setCodingDetailLevel: (level: string) => void;
  setCodingLanguage: (lang: string) => void;
  setAutoGenerateEraser: (enabled: boolean) => void;
}
```

**ModalSlice** (NOT persisted - modals should not survive refresh):
```ts
interface ModalSlice {
  modals: {
    settings: boolean;
    setupWizard: boolean;
    platformAuth: boolean;
    ascendAssistant: boolean;
    prepTab: boolean;
    savedDesigns: boolean;
    adminPanel: boolean;
    pricingPlans: boolean;
    onboarding: boolean;
  };
  openModal: (name: string) => void;
  closeModal: (name: string) => void;
  toggleModal: (name: string) => void;
  closeAllModals: () => void;
}
```

**EditorSlice** (persisted, key: `ascend_editor`):
```ts
interface EditorSlice {
  editorSettings: {
    theme: string;
    keyBindings: string;
    fontSize: number;
    tabSpacing: number;
    intelliSense: boolean;
    autoCloseBrackets: boolean;
  };
  sidebarCollapsed: boolean;
  stealthMode: boolean;
  updateEditorSettings: (updates: Partial<EditorSettings>) => void;
  toggleSidebar: () => void;
  toggleStealthMode: () => void;
}
```

Implementation notes:
- Use zustand's `persist` middleware with `partialize` to only persist specific fields
- Set default values matching what's currently in App.jsx
- For the provider default: `'claude'`
- For the model default: `'claude-sonnet-4-20250514'`
- Use `ascend_` prefix for ALL storage keys (not `chundu_`)
- Export a `useAppStore` hook and individual selector hooks like `useProvider`, `useModals`, etc.

After creating the store slices, update these components to use the store DIRECTLY instead of receiving props:

1. **App.jsx / MainApp.jsx**: Remove useState hooks for provider, model, autoSwitch, ascendMode, all modal states, editorSettings, sidebarCollapsed, stealthMode. Replace with `useAppStore()`.

2. **AppHeader.jsx**: Instead of receiving ~19 props, import from store:
   ```js
   const { provider, model, ascendMode, stealthMode } = useAppStore();
   const { openModal, closeModal } = useAppStore();
   ```
   Remove the corresponding props from the parent component.

3. **Sidebar.jsx**: Get `sidebarCollapsed`, `ascendMode`, `toggleSidebar` from store.

4. **SettingsPanel.jsx**: Get `editorSettings`, `updateEditorSettings`, `provider`, `setProvider`, `model`, `setModel` from store.

5. **ProblemInput.jsx**: Get `ascendMode`, `codingLanguage` from store if they were props.

6. **AscendModeSelector.jsx**: Get and set `ascendMode` from store.

For each component, remove the props that are now coming from the store, and update the parent to stop passing them.

---

TASK 2: CODE SPLITTING WITH REACT.LAZY

Update `frontend/src/router.jsx` (created in Phase 1) to use React.lazy for ALL route components:

```jsx
import React, { Suspense } from 'react';
import LoadingScreen from './components/shared/LoadingScreen';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const MainApp = React.lazy(() => import('./pages/MainApp'));
const DownloadPage = React.lazy(() => import('./components/billing/DownloadPage'));
const PremiumPage = React.lazy(() => import('./components/billing/PremiumPage'));
const DocsPage = React.lazy(() => import('./components/DocsPage'));
const ProblemPage = React.lazy(() => import('./components/ProblemPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
```

Also lazy-load heavy modal/panel components inside MainApp.jsx:

```jsx
const AscendAssistantPanel = React.lazy(() => import('../components/AscendAssistantPanel'));
const AscendPrepModal = React.lazy(() => import('../components/AscendPrepModal'));
const SystemDesignPanel = React.lazy(() => import('../components/SystemDesignPanel'));
const VoiceAssistantPanel = React.lazy(() => import('../components/VoiceAssistantPanel'));
const SettingsPanel = React.lazy(() => import('../components/settings/SettingsPanel'));
const OnboardingModal = React.lazy(() => import('../components/onboarding/OnboardingModal'));
const AdminPanel = React.lazy(() => import('../components/AdminPanel'));
```

Wrap each lazy modal in `<Suspense fallback={null}>` (modals don't need visible loading state).

For Mermaid.js: find any static import of mermaid and change to dynamic:
```js
// Before:
import mermaid from 'mermaid';

// After:
let mermaidInstance = null;
async function getMermaid() {
  if (!mermaidInstance) {
    const mod = await import('mermaid');
    mermaidInstance = mod.default;
    mermaidInstance.initialize({ startOnLoad: false, theme: 'dark' });
  }
  return mermaidInstance;
}
```

---

TASK 3: SLIM DOWN App.jsx TO UNDER 100 LINES

After Tasks 1 and 2, App.jsx should be minimal. It should contain ONLY:

1. AuthProvider wrapper
2. Theme application (the useEffect for data-theme)
3. The router component
4. Global-level elements that appear on ALL pages (toast notifications, etc.)

If App.jsx still has solving logic, extract it:
- Move solve/streaming logic to `frontend/src/hooks/useAppSolve.js` (if useSolve hook doesn't already encapsulate it)
- Move auth check logic to `frontend/src/hooks/useAuthCheck.js`

The target: App.jsx should be a clean shell under 100 lines.

Add TODO comments to large files that still need splitting (do NOT split them yet):
- `AscendAssistantPanel.jsx`: add `// TODO: Split into ChatMessages, ChatInput, AssistantControls, AssistantHistory subcomponents`
- `AscendPrepModal.jsx`: add `// TODO: Split into PrepInputPanel, PrepOutputPanel, PrepControls subcomponents`
- `SystemDesignPanel.jsx`: add `// TODO: Split into DiagramViewer, DesignExplanation, DesignControls subcomponents`
- `ExplanationPanel.jsx`: add `// TODO: Split into ComplexityCard, EdgeCaseList, StepByStepExplanation subcomponents`
- `ProblemPage.jsx`: add `// TODO: Split into ProblemHeader, ProblemContent, ProblemSidebar subcomponents`

---

TASK 4: RENAME LEGACY STORAGE KEYS

Search the ENTIRE frontend/src/ directory for any remaining `chundu_` string references.

For each occurrence:
- If it's a localStorage key being READ, add a migration check: read `ascend_` key first, fall back to `chundu_` key
- If it's a localStorage key being WRITTEN, change to `ascend_` prefix
- If it's in a useLocalStorage hook default key, change to `ascend_` prefix
- If it's in a variable name or comment, update to reflect current naming

The storage keys should be:
- `chundu_token` → `ascend_token`
- `chundu_provider` → `ascend_provider`
- `chundu_model` → `ascend_model`
- `chundu_auto_switch` → `ascend_auto_switch`
- `chundu_coding_history` → `ascend_coding_history`
- `chundu_system_design_sessions` → `ascend_system_design_sessions`
- `chundu_sidebar_collapsed` → `ascend_sidebar_collapsed`

Keep the `migrateStorageKeys()` function but invert it: migrate FROM `chundu_*` TO `ascend_*` (it currently does the opposite). After migration, delete the old `chundu_*` keys.

---

FINAL: Verify the app builds and starts:
```bash
cd frontend && npm run build && npm run dev
```

Commit:
```bash
git add -A && git commit -m "Phase 2: Zustand state migration, React.lazy code splitting, App.jsx cleanup, storage key migration"
```
