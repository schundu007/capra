You are continuing the Ascend app refactor at /home/user/capra. This is Phase 3: UX Modernization. Phases 1-2 (Router, a11y, state, code splitting) are done.

IMPORTANT RULES:
- Read each file before editing
- Do NOT break existing functionality
- Use existing Tailwind tokens from tailwind.config.js
- Match the existing dark theme aesthetic (neutral-800/900 backgrounds, brand teal accents)
- Test: `cd frontend && npm run dev`

---

TASK 1: ADD MOBILE NAVIGATION TO LANDING PAGE

Read `frontend/src/components/auth/OAuthLogin.jsx` first.

1. Add a hamburger menu button visible only on mobile (`md:hidden`):
   ```jsx
   <button
     className="md:hidden p-2 text-neutral-300 hover:text-white"
     onClick={() => setMobileMenuOpen(true)}
     aria-label="Open menu"
   >
     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
     </svg>
   </button>
   ```

2. Add state: `const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`

3. Create the mobile menu overlay (rendered conditionally):
   ```jsx
   {mobileMenuOpen && (
     <>
       {/* Backdrop */}
       <div
         className="fixed inset-0 bg-black/60 z-40 md:hidden"
         onClick={() => setMobileMenuOpen(false)}
         aria-hidden="true"
       />
       {/* Slide-in menu */}
       <div className="fixed top-0 right-0 h-full w-72 bg-neutral-900 border-l border-neutral-700 z-50 md:hidden animate-slide-in-right">
         <div className="flex justify-end p-4">
           <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-2 text-neutral-400 hover:text-white">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         </div>
         <nav className="flex flex-col gap-2 px-4" aria-label="Mobile navigation">
           {/* Same links as desktop nav */}
         </nav>
       </div>
     </>
   )}
   ```

4. Replace the desktop navigation `<div>` with `<nav aria-label="Main navigation">` if not done in Phase 1.

5. Replace ALL hardcoded hex colors with Tailwind tokens:
   - `#10b981` → `brand-500` or `emerald-500`
   - `#34d399` → `brand-400` or `emerald-400`
   - `#6ee7b7` → `brand-300` or `emerald-300`
   - Any `linear-gradient(135deg, #10b981, ...)` → use CSS variable `var(--brand-gradient)` or Tailwind `bg-gradient-to-br from-brand-500 to-brand-300`

6. Improve CTA button text:
   - "Get Started" → "Start Practicing Free"
   - "Explore First" → "Browse Problems"
   - "Get Credits & Start" → "Get Free Credits"

---

TASK 2: CREATE SKELETON LOADING COMPONENTS

Create `frontend/src/components/shared/Skeleton.jsx`:

```jsx
export default function Skeleton({ variant = 'text', lines = 3, className = '' }) {
  const shimmer = 'animate-shimmer bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%]';

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded ${shimmer}`}
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'code') {
    return (
      <div className={`space-y-2 p-4 bg-neutral-800/50 rounded-xl ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded ${shimmer}`}
            style={{ width: `${40 + Math.random() * 50}%`, marginLeft: i % 3 === 0 ? 0 : '1.5rem' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-neutral-800/50 rounded-xl border border-neutral-700/30 ${className}`}>
        <div className={`h-6 w-1/3 rounded mb-4 ${shimmer}`} />
        <div className="space-y-3">
          <div className={`h-4 rounded ${shimmer}`} />
          <div className={`h-4 w-4/5 rounded ${shimmer}`} />
          <div className={`h-4 w-3/5 rounded ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'panel') {
    return (
      <div className={`flex-1 p-6 space-y-4 ${className}`}>
        <div className={`h-8 w-1/4 rounded ${shimmer}`} />
        <div className={`h-64 rounded-xl ${shimmer}`} />
        <div className="space-y-3">
          <div className={`h-4 rounded ${shimmer}`} />
          <div className={`h-4 w-3/4 rounded ${shimmer}`} />
        </div>
      </div>
    );
  }

  return <div className={`h-4 rounded ${shimmer} ${className}`} />;
}
```

Now integrate skeletons into existing components:

In `CodeDisplay.jsx`: When `isLoading` is true and there's no solution yet, show `<Skeleton variant="code" lines={12} />` instead of empty space.

In `ExplanationPanel.jsx`: When loading, show `<Skeleton variant="card" />` repeated 3 times.

---

TASK 3: CREATE EMPTY STATE COMPONENTS

Create `frontend/src/components/shared/EmptyState.jsx`:

```jsx
export default function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center mb-6 text-neutral-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-neutral-300 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 rounded-lg text-sm font-medium transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}
```

Add empty states to:

1. **CodeDisplay.jsx** - When no solution and not loading:
   ```jsx
   <EmptyState
     icon={<CodeIcon />}  // Use an appropriate SVG
     title="No Solution Yet"
     description="Enter a problem on the left and click Solve to generate a solution with detailed explanations."
   />
   ```

2. **ExplanationPanel.jsx** - When no explanation data:
   ```jsx
   <EmptyState
     icon={<BookIcon />}
     title="Explanation Appears Here"
     description="Once a solution is generated, you'll see step-by-step explanations, complexity analysis, and edge cases."
   />
   ```

3. **SystemDesignPanel.jsx** - When no design loaded:
   ```jsx
   <EmptyState
     icon={<DiagramIcon />}
     title="System Design Mode"
     description="Describe a system design problem to get architecture diagrams, component breakdowns, and scalability analysis."
   />
   ```

Use simple inline SVGs for the icons (4-5 line SVGs, not imported libraries).

---

TASK 4: MAKE COPY BUTTON ALWAYS VISIBLE

Read `frontend/src/components/CodeDisplay.jsx`.

Find ALL copy buttons that use `opacity-0 group-hover:opacity-100` or similar hover-to-show pattern.

Change them to always visible with subtle styling:
- Remove `opacity-0` and `group-hover:opacity-100`
- Use: `bg-neutral-700/50 hover:bg-neutral-600 text-neutral-400 hover:text-neutral-200 rounded-md p-1.5 transition-colors`
- Ensure the "Copied!" feedback has `aria-live="polite"` (should be done from Phase 1, verify)
- Add `title="Copy code"` and `aria-label="Copy code to clipboard"`

---

TASK 5: ADD AUTOSAVE FOR PROBLEM INPUT

Read `frontend/src/components/ProblemInput.jsx`.

1. Add a debounced autosave effect:
   ```jsx
   const [draftSaved, setDraftSaved] = useState(false);

   // Save draft with debounce
   useEffect(() => {
     const content = extractedText || currentProblem;
     if (!content?.trim()) {
       localStorage.removeItem('ascend_draft_input');
       setDraftSaved(false);
       return;
     }

     const timer = setTimeout(() => {
       localStorage.setItem('ascend_draft_input', JSON.stringify({
         text: content,
         tab: activeTab,  // whatever the current tab state variable is called
         timestamp: Date.now(),
       }));
       setDraftSaved(true);
       setTimeout(() => setDraftSaved(false), 2000);
     }, 500);

     return () => clearTimeout(timer);
   }, [extractedText, currentProblem]);
   ```

2. Restore draft on mount:
   ```jsx
   useEffect(() => {
     try {
       const draft = JSON.parse(localStorage.getItem('ascend_draft_input'));
       if (draft?.text && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
         // Only restore if less than 24 hours old
         setExtractedText?.(draft.text) || setCurrentProblem?.(draft.text);
       }
     } catch {}
   }, []);
   ```

3. Clear draft on successful solve:
   - Find where the solve/submit handler is called
   - Add `localStorage.removeItem('ascend_draft_input')` after successful submission

4. Show save indicator:
   ```jsx
   {draftSaved && (
     <span className="text-xs text-neutral-500 animate-fade-in">Draft saved</span>
   )}
   ```
   Place this near the character count or input area.

5. Add autofocus to the textarea:
   ```jsx
   // Only autofocus on desktop
   useEffect(() => {
     if (window.innerWidth > 768) {
       textareaRef.current?.focus();
     }
   }, []);
   ```

---

TASK 6: FIX CONTRAST ISSUES FOR WCAG AA

Search for these low-contrast patterns in `frontend/src/components/` and fix:

1. `text-neutral-400` on `bg-neutral-800` or `bg-neutral-900` backgrounds → change to `text-neutral-300`
   - But ONLY for body text that needs to be readable (not decorative/muted labels that are intentionally de-emphasized)
   - Focus on: button text, input text, paragraph text, link text

2. `text-neutral-500` used for primary readable text → change to `text-neutral-400` minimum

3. Specific fixes:
   - ProblemInput.jsx: preview text `text-neutral-300` on semi-transparent bg → change to `text-neutral-200`
   - OAuthLogin.jsx: "Trusted by" text `text-gray-600` → change to `text-neutral-400`
   - Button.jsx ghost variant: `text-neutral-400` → change to `text-neutral-300`

4. Do NOT change colors on intentionally muted/decorative elements (timestamps, dividers, hints that should be subtle).

---

FINAL: Verify:
```bash
cd frontend && npm run build && npm run dev
```

Commit:
```bash
git add -A && git commit -m "Phase 3: Mobile nav, skeleton loading, empty states, autosave, contrast fixes"
```
