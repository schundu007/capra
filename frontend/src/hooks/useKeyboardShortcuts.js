import { useEffect, useCallback } from 'react';

/**
 * Check if the currently focused element is an input field
 */
function isInputFocused() {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = activeElement.isContentEditable;
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';

  return isInput || isEditable;
}

/**
 * Hook to manage global keyboard shortcuts for Ascend
 *
 * Shortcuts:
 * - Cmd/Ctrl + Enter: Solve problem
 * - Cmd/Ctrl + Shift + R: Run code
 * - Escape: Clear all / Close modals
 * - Cmd/Ctrl + Shift + C: Copy code
 * - Cmd/Ctrl + N: New problem (clear)
 */
export function useKeyboardShortcuts({
  onSolve,
  onRun,
  onClear,
  onCopyCode,
  isLoading = false,
  hasProblem = false,
  hasCode = false,
  disabled = false,
}) {
  const handleKeyDown = useCallback((e) => {
    // Don't handle shortcuts when disabled or in input fields (except for some)
    if (disabled) return;

    const isMac = navigator.platform.toLowerCase().includes('mac');
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    // Escape - always works, closes modals or clears
    if (e.key === 'Escape') {
      e.preventDefault();
      onClear?.();
      return;
    }

    // Don't process other shortcuts if typing in input
    if (isInputFocused()) {
      // Allow Cmd+Enter to submit from text area
      if (e.key === 'Enter' && cmdKey && !e.shiftKey) {
        // Let the form handle Cmd+Enter for submit
        return;
      }
      return;
    }

    // Cmd/Ctrl + Enter: Solve
    if (e.key === 'Enter' && cmdKey && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && hasProblem && onSolve) {
        onSolve();
      }
      return;
    }

    // Cmd/Ctrl + Shift + R: Run code
    if (e.key === 'r' && cmdKey && e.shiftKey) {
      e.preventDefault();
      if (!isLoading && hasCode && onRun) {
        onRun();
      }
      return;
    }

    // Cmd/Ctrl + Shift + C: Copy code
    if (e.key === 'c' && cmdKey && e.shiftKey) {
      e.preventDefault();
      if (hasCode && onCopyCode) {
        onCopyCode();
      }
      return;
    }

    // Cmd/Ctrl + N: New problem
    if (e.key === 'n' && cmdKey && !e.shiftKey) {
      e.preventDefault();
      onClear?.();
      return;
    }

    // Space bar: Solve (when not in input)
    if (e.key === ' ' && !cmdKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (!isLoading && hasProblem && onSolve) {
        onSolve();
      }
      return;
    }

    // Enter: Run code (when not in input, not with modifiers)
    if (e.key === 'Enter' && !cmdKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (!isLoading && hasCode && onRun) {
        onRun();
      }
      return;
    }

  }, [onSolve, onRun, onClear, onCopyCode, isLoading, hasProblem, hasCode, disabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
