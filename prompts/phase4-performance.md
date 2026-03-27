You are continuing the Ascend app refactor at /home/user/capra. This is Phase 4: Performance Optimization. Phases 1-3 are done.

IMPORTANT RULES:
- Read each file before editing
- Do NOT break existing functionality
- Test: `cd frontend && npm run dev`

---

TASK 1: OPTIMIZE FONT LOADING

In `frontend/index.html`:

1. Verify the Google Fonts URL includes `&display=swap` (should be done in Phase 1, verify)

2. Add font preload hints BEFORE the Google Fonts stylesheet link:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   ```

3. Add a CSS fallback in case fonts fail to load. In `frontend/src/styles/tokens.css` or the global CSS entry, add:
   ```css
   /* Ensure text is visible during font load */
   html {
     font-display: swap;
   }
   ```

4. In `tailwind.config.js`, verify the font-family stack has system fallbacks (it should already: `['Inter Tight', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif']`). If 'Inter Tight' is the Google Font being loaded, this is correct.

---

TASK 2: ADD React.memo TO EXPENSIVE COMPONENTS

Read each component first to understand its props.

1. **CodeDisplay.jsx** - Wrap with React.memo:
   ```jsx
   import { memo } from 'react';

   const CodeDisplay = memo(function CodeDisplay(props) {
     // ... existing component code
   });

   export default CodeDisplay;
   ```
   This prevents re-render when parent state (like modal visibility) changes but solution data hasn't.

2. **ExplanationPanel.jsx** - Same pattern:
   ```jsx
   export default memo(function ExplanationPanel(props) { ... });
   ```

3. **ProblemInput.jsx** - Same pattern:
   ```jsx
   export default memo(function ProblemInput(props) { ... });
   ```

4. **Sidebar.jsx** - Same pattern:
   ```jsx
   export default memo(function Sidebar(props) { ... });
   ```

For components that receive object or function props, ensure the parent passes stable references:
- Wrap callback functions passed as props in `useCallback`
- Wrap object props in `useMemo`
- Check MainApp.jsx (or wherever these components are rendered) and stabilize any inline function/object props:
  ```jsx
  // BAD: creates new function every render
  <CodeDisplay onCopy={() => setCopyToast(true)} />

  // GOOD: stable reference
  const handleCopy = useCallback(() => setCopyToast(true), []);
  <CodeDisplay onCopy={handleCopy} />
  ```

---

TASK 3: DEBOUNCE TEXTAREA HEIGHT CALCULATION

Read `frontend/src/components/ProblemInput.jsx`.

Find the `adjustTextareaHeight` function (or similar) that recalculates textarea height.

1. Create a debounced version:
   ```jsx
   const adjustTextareaHeight = useCallback(() => {
     const textarea = textareaRef.current;
     if (!textarea) return;
     textarea.style.height = 'auto';
     textarea.style.height = `${textarea.scrollHeight}px`;
   }, []);

   // Debounced version for typing
   const debouncedAdjustHeight = useMemo(() => {
     let timer;
     return () => {
       clearTimeout(timer);
       timer = setTimeout(adjustTextareaHeight, 100);
     };
   }, [adjustTextareaHeight]);
   ```

2. Use `adjustTextareaHeight` (immediate) for:
   - Initial render
   - Tab switches
   - Content cleared

3. Use `debouncedAdjustHeight` for:
   - onChange events (typing)

4. Clean up timer on unmount:
   ```jsx
   useEffect(() => {
     return () => {
       // debouncedAdjustHeight cleanup handled by useMemo dependency
     };
   }, []);
   ```

---

TASK 4: REPLACE INLINE STYLES WITH CSS CLASSES

Read `frontend/src/components/auth/OAuthLogin.jsx`.

1. Find ALL `style={{ ... }}` props in the file
2. For each one, convert to Tailwind classes or CSS custom properties:

   Common conversions:
   - `style={{ background: 'linear-gradient(...)' }}` → use `className="bg-gradient-to-br from-brand-500 to-brand-300"` or add a class in components.css
   - `style={{ opacity: 0.8 }}` → `className="opacity-80"`
   - `style={{ maxWidth: '600px' }}` → `className="max-w-xl"` or `className="max-w-[600px]"`
   - `style={{ gap: '12px' }}` → `className="gap-3"`
   - `style={{ padding: '...' }}` → `className="p-X"` equivalent
   - `style={{ borderRadius: '...' }}` → `className="rounded-X"`

3. For complex gradients that can't be expressed in Tailwind, add them to `frontend/src/styles/components.css`:
   ```css
   .landing-hero-gradient {
     background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-300));
   }

   .landing-bg-glow {
     background: radial-gradient(ellipse at center, rgba(45, 212, 191, 0.15) 0%, transparent 70%);
   }
   ```

4. Do the same for `frontend/src/components/onboarding/OnboardingModal.jsx`:
   - Replace all `style={{ ... }}` with Tailwind classes or component CSS
   - Specifically replace hardcoded rgba colors with CSS variables or Tailwind opacity utilities

---

TASK 5: CLEAN UP SSE CONNECTIONS

Search `frontend/src/` for:
- `new EventSource`
- `fetch(` with streaming (look for `reader.read()` or `getReader()`)
- `AbortController`

For each streaming connection found:

1. Ensure there's an AbortController:
   ```jsx
   const abortControllerRef = useRef(null);
   ```

2. Ensure cleanup on unmount:
   ```jsx
   useEffect(() => {
     return () => {
       abortControllerRef.current?.abort();
     };
   }, []);
   ```

3. Ensure abort is called before starting a new request (prevent concurrent streams):
   ```jsx
   const startStream = () => {
     abortControllerRef.current?.abort();
     abortControllerRef.current = new AbortController();
     fetch(url, { signal: abortControllerRef.current.signal });
   };
   ```

Check these files specifically:
- `hooks/useSolve.js` - main solving stream
- `hooks/useStreamingParser.js` - streaming parser
- `components/AscendAssistantPanel.jsx` - assistant chat stream
- `components/VoiceAssistantPanel.jsx` - voice stream
- Any component using EventSource

---

TASK 6: OPTIMIZE CONDITIONAL IMPORTS

Check if any component imports large libraries at the top level that are only used conditionally.

Common patterns to fix:

1. Mermaid (should be dynamic from Phase 2, verify):
   ```jsx
   // Should NOT be at top level
   // import mermaid from 'mermaid';  // ~500KB

   // Should be dynamic
   const mermaid = await import('mermaid');
   ```

2. react-syntax-highlighter themes: if multiple themes are imported but only one is used, remove unused imports.

3. pdf-parse, mammoth, docx in backend: verify they're only imported where used (less critical for backend but good practice).

---

FINAL: Build and verify bundle is smaller:
```bash
cd frontend && npm run build 2>&1 | tail -20
```

Check the build output for chunk sizes. The main chunk should be noticeably smaller now that heavy components are lazy-loaded.

Commit:
```bash
git add -A && git commit -m "Phase 4: Font optimization, React.memo, debouncing, inline styles removal, SSE cleanup"
```
