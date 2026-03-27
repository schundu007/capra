You are completing the Ascend app refactor at /home/user/capra. This is Phase 5: Code Quality and Security. Phases 1-4 are done.

IMPORTANT RULES:
- Read each file before editing
- Do NOT break existing functionality
- Test: `cd frontend && npm run dev`
- Test: `cd backend && npm start` (or equivalent)

---

TASK 1: ADD TYPESCRIPT PROP INTERFACES

Create `frontend/src/types/components.ts` with interfaces for the most-used components. Read each component first to determine its actual props.

```ts
// frontend/src/types/components.ts

export interface Solution {
  code: string;
  language: string;
  explanation?: string;
  complexity?: {
    time: string;
    space: string;
  };
  thoughts?: string[];
  edgeCases?: string[];
}

export interface EditorSettings {
  theme: string;
  keyBindings: string;
  fontSize: number;
  tabSpacing: number;
  intelliSense: boolean;
  autoCloseBrackets: boolean;
}

export interface ProblemInputProps {
  extractedText: string;
  setExtractedText: (text: string) => void;
  currentProblem: string;
  setCurrentProblem: (problem: string) => void;
  isLoading: boolean;
  onSolve: () => void;
  onClear: () => void;
  // Add remaining props after reading the component
}

export interface CodeDisplayProps {
  solution: Solution | null;
  isLoading: boolean;
  streamingContent: string;
  highlightedLine: number | null;
  onHighlightLine: (line: number | null) => void;
  editorSettings: EditorSettings;
  // Add remaining props after reading the component
}

export interface ExplanationPanelProps {
  solution: Solution | null;
  isLoading: boolean;
  onHighlightLine: (line: number | null) => void;
  // Add remaining props after reading the component
}

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  ascendMode: string;
  onModeChange: (mode: string) => void;
  // Add remaining props after reading the component
}
```

Read each component to fill in the ACTUAL props, not guesses. The interfaces above are starting points.

For JSX files (NOT renaming to TSX), add JSDoc annotations at the top:
```jsx
/** @typedef {import('../types/components').ProblemInputProps} ProblemInputProps */

/**
 * @param {ProblemInputProps} props
 */
export default function ProblemInput(props) { ... }
```

Do this for: ProblemInput.jsx, CodeDisplay.jsx, ExplanationPanel.jsx, Sidebar.jsx, and AppHeader.jsx (or whatever the main header component is).

---

TASK 2: REMOVE DEAD CODE

1. Search for and remove commented-out code blocks (more than 3 lines of commented code). Search pattern: `// ` followed by code-like content across multiple consecutive lines.

2. Remove the backward compatibility re-export in App.jsx if still present:
   ```js
   // Remove this line:
   export { getAuthHeaders };
   ```

3. Search for unused imports in all files under `frontend/src/`:
   - Run: `cd frontend && npx eslint --no-eslintrc --rule '{"no-unused-vars": "warn", "no-undef": "warn"}' --ext .jsx,.tsx,.ts,.js src/ 2>/dev/null || true`
   - Or manually check files that were modified in Phases 1-4 for orphaned imports

4. Check if both `Header.tsx` and `AppHeader.jsx` still exist:
   ```bash
   find frontend/src/components -name '*Header*' -o -name '*header*'
   ```
   - If both exist, determine which is used and delete the unused one
   - If they serve different purposes (landing header vs app header), rename for clarity:
     - Landing page header → `LandingHeader.tsx`
     - App header → `AppHeader.jsx`

5. Clean up the `migrateStorageKeys()` function:
   - If Phase 2 already handled migration properly in the Zustand persist config, this function may now be redundant
   - If still needed, ensure it migrates FROM `chundu_*` TO `ascend_*` (not the other way around)
   - After migrating, delete the old keys:
     ```js
     localStorage.removeItem(oldKey);
     ```

6. Search for any remaining `chundu` references:
   ```bash
   grep -r "chundu" frontend/src/ --include="*.jsx" --include="*.tsx" --include="*.ts" --include="*.js" -l
   ```
   Fix any found.

---

TASK 3: ADD SECURITY HEADERS

1. In `frontend/index.html`, add CSP meta tag inside `<head>`:
   ```html
   <meta http-equiv="Content-Security-Policy"
     content="default-src 'self';
       script-src 'self' 'unsafe-inline' 'unsafe-eval';
       style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
       font-src 'self' https://fonts.gstatic.com;
       img-src 'self' data: blob: https:;
       connect-src 'self' https://*.railway.app https://*.cariara.com wss://*.cariara.com https://api.anthropic.com https://api.openai.com https://fonts.googleapis.com https://fonts.gstatic.com;" />
   ```
   IMPORTANT: This CSP must be permissive enough for the app to work. The `unsafe-inline` and `unsafe-eval` are needed for Vite dev mode and React. Adjust `connect-src` based on what the app actually connects to.

2. Read `backend/src/index.js` and check how helmet is configured:
   - If helmet is imported but uses defaults, that's fine
   - If helmet is NOT imported, add it:
     ```js
     import helmet from 'helmet';
     app.use(helmet());
     ```
   - If helmet is imported with custom config, verify it includes:
     - `referrerPolicy: { policy: 'strict-origin-when-cross-origin' }`
     - `xContentTypeOptions` (nosniff)
     - `xFrameOptions: { action: 'deny' }` (or 'sameorigin' if iframe embedding is needed)

3. Verify the deploy comment is removed from index.html (should be done in Phase 1).

---

TASK 4: CONSOLIDATE HEADER COMPONENTS

1. Check what header components exist:
   ```bash
   find frontend/src/components -name '*[Hh]eader*'
   ```

2. If `Header.tsx` and `AppHeader.jsx` both exist in `components/layout/`:
   - Read both to understand their purpose
   - If Header.tsx is the landing page header and AppHeader.jsx is the app header, rename:
     - Header.tsx → keep as is (or rename to LandingHeader.tsx)
     - AppHeader.jsx → keep as is
   - If one is unused, delete it
   - If they're duplicates, keep the more complete one and delete the other
   - Update all imports across the codebase

3. Ensure whichever header is used has:
   - Proper `aria-label` on icon buttons (from Phase 1)
   - Text label or tooltip on the settings button
   - The keyboard shortcut indicator explains what it does (add a `title` attribute)

---

TASK 5: VERIFY FAVICON

Check if `frontend/public/favicon.svg` was created in Phase 1. If not, create it:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0f172a"/>
  <text x="16" y="23" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#2dd4bf" text-anchor="middle">A</text>
</svg>
```

Verify `index.html` references it:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

Delete `frontend/public/vite.svg` if it still exists.

---

TASK 6: ADD robots.txt AND BASIC sitemap.xml

Create `frontend/public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/

Sitemap: https://capra.cariara.com/sitemap.xml
```

Create `frontend/public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://capra.cariara.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://capra.cariara.com/prepare</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://capra.cariara.com/download</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://capra.cariara.com/premium</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

---

FINAL VERIFICATION:

Run the full build to ensure nothing is broken:
```bash
cd /home/user/capra
cd frontend && npm run build
cd ../backend && npm start &
sleep 3
curl -s http://localhost:3001/health || curl -s http://localhost:3009/health || echo "Backend health check - verify manually"
kill %1 2>/dev/null
```

Check for any build warnings or errors.

Commit:
```bash
git add -A && git commit -m "Phase 5: TypeScript interfaces, dead code removal, security headers, SEO files, component cleanup"
```

Push all changes:
```bash
git push -u origin $(git branch --show-current)
```
