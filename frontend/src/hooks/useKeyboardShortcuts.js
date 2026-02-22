import { useEffect, useCallback } from 'react';

/**
 * Check if the currently focused element is a user-facing input field
 * Excludes Monaco editor's hidden textarea and other non-user inputs
 */
function isInputFocused() {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  // Check if it's inside Monaco editor - don't block shortcuts there
  // Monaco uses a hidden textarea with class 'inputarea'
  if (activeElement.classList?.contains('inputarea')) {
    return false; // Allow shortcuts even when Monaco is "focused"
  }

  // Check if inside Monaco editor container
  if (activeElement.closest('.monaco-editor')) {
    return false; // Allow shortcuts in code display area
  }

  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = activeElement.isContentEditable;

  // Only block on actual user input fields (not hidden ones)
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';

  // Check if it's a visible, user-interactable input
  if (isInput) {
    // Check if it's hidden or has no dimensions (like Monaco's hidden textarea)
    const rect = activeElement.getBoundingClientRect();
    const style = window.getComputedStyle(activeElement);
    const isHidden = style.visibility === 'hidden' ||
                     style.display === 'none' ||
                     rect.width === 0 ||
                     rect.height === 0 ||
                     parseFloat(style.opacity) === 0;
    if (isHidden) return false;
  }

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
    // Debug logging
    console.log('[Shortcuts] Key:', e.key, 'disabled:', disabled, 'isInputFocused:', isInputFocused(), 'hasProblem:', hasProblem, 'hasCode:', hasCode);

    // Don't handle shortcuts when disabled or in input fields (except for some)
    if (disabled) {
      console.log('[Shortcuts] Disabled, returning');
      return;
    }

    const isMac = navigator.platform.toLowerCase().includes('mac');
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    // Escape - always works, closes modals or clears
    if (e.key === 'Escape') {
      e.preventDefault();
      onClear?.();
      return;
    }

    // Cmd/Ctrl + Shift + C: Copy code - works even in input fields
    if (e.key === 'c' && cmdKey && e.shiftKey) {
      e.preventDefault();
      if (hasCode && onCopyCode) {
        onCopyCode();
      }
      return;
    }

    // Don't process other shortcuts if typing in input
    const inputFocused = isInputFocused();
    console.log('[Shortcuts] inputFocused:', inputFocused, 'activeElement:', document.activeElement?.tagName, document.activeElement?.className);
    if (inputFocused) {
      // Allow Cmd+Enter to submit from text area
      if (e.key === 'Enter' && cmdKey && !e.shiftKey) {
        // Let the form handle Cmd+Enter for submit
        return;
      }
      console.log('[Shortcuts] Blocked due to input focus');
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

    // Cmd/Ctrl + N: New problem
    if (e.key === 'n' && cmdKey && !e.shiftKey) {
      e.preventDefault();
      onClear?.();
      return;
    }

    // Space bar: Solve (when not in input)
    if (e.key === ' ' && !cmdKey && !e.shiftKey && !e.altKey) {
      console.log('[Shortcuts] Space pressed, isLoading:', isLoading, 'hasProblem:', hasProblem, 'onSolve:', !!onSolve);
      e.preventDefault();
      // Always call onSolve if available (removed hasProblem check for now)
      if (!isLoading && onSolve) {
        console.log('[Shortcuts] Calling onSolve');
        onSolve();
      }
      return;
    }

    // Enter: Run code (when not in input, not with modifiers)
    if (e.key === 'Enter' && !cmdKey && !e.shiftKey && !e.altKey) {
      console.log('[Shortcuts] Enter pressed, isLoading:', isLoading, 'hasCode:', hasCode, 'onRun:', !!onRun);
      e.preventDefault();
      // Always call onRun if available (removed hasCode check for now)
      if (!isLoading && onRun) {
        console.log('[Shortcuts] Calling onRun');
        onRun();
      }
      return;
    }

  }, [onSolve, onRun, onClear, onCopyCode, isLoading, hasProblem, hasCode, disabled]);

  useEffect(() => {
    // Use capture phase to catch events before they're handled by other elements
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
