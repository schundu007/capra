# Claude Code CLI Prompts - Fix All 63 Issues

Individual prompt files for each phase are in the `prompts/` directory.
Run them sequentially - each phase builds on the previous one.

## Files

| Phase | File | Description | Issues Fixed |
|-------|------|-------------|--------------|
| 1 | `prompts/phase1-critical-fixes.md` | React Router, error boundaries, a11y, CSS, SEO | 18 |
| 2 | `prompts/phase2-state-architecture.md` | Zustand migration, code splitting, App.jsx cleanup | 12 |
| 3 | `prompts/phase3-ux-modernization.md` | Mobile nav, skeletons, empty states, autosave, contrast | 16 |
| 4 | `prompts/phase4-performance.md` | Fonts, React.memo, debounce, inline styles, SSE cleanup | 10 |
| 5 | `prompts/phase5-quality-security.md` | TypeScript, dead code, security headers, SEO files | 7 |

## How to Run

### Option A: One phase at a time (recommended)

```bash
# Phase 1 - Critical fixes
cat prompts/phase1-critical-fixes.md | claude

# Phase 2 - Architecture
cat prompts/phase2-state-architecture.md | claude

# Phase 3 - UX
cat prompts/phase3-ux-modernization.md | claude

# Phase 4 - Performance
cat prompts/phase4-performance.md | claude

# Phase 5 - Quality & Security
cat prompts/phase5-quality-security.md | claude
```

### Option B: Run a specific phase

```bash
./prompts/run-all.sh 1   # Run only phase 1
./prompts/run-all.sh 3   # Run only phase 3
```

### Option C: Run all phases sequentially

```bash
./prompts/run-all.sh
```

## Tips

- **Review after each phase** - Check `git diff HEAD~1` to review changes before proceeding
- **Test after each phase** - Run `cd frontend && npm run dev` to verify the app works
- **Rollback if needed** - Each phase creates a separate commit, so `git revert HEAD` to undo one phase
- **Resume from any phase** - Phases are independent enough that you can skip ahead if earlier phases are partially done
