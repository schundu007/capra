import { useCallback, useRef } from 'react';

export function useScrollSync() {
  const codeRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const scrollToLine = useCallback((lineNumber: number, target: 'code' | 'explanation') => {
    if (isScrolling.current) return;

    const container = target === 'code' ? codeRef.current : explanationRef.current;
    if (!container) return;

    const element = container.querySelector(`[data-line="${lineNumber}"]`);
    if (element) {
      isScrolling.current = true;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }
  }, []);

  const handleCodeScroll = useCallback(() => {
    if (isScrolling.current || !codeRef.current || !explanationRef.current) return;

    // Find the first visible line in the code editor
    const codeContainer = codeRef.current;
    const scrollTop = codeContainer.scrollTop;
    const lineHeight = 24; // Approximate line height
    const visibleLineStart = Math.floor(scrollTop / lineHeight) + 1;

    // Scroll explanation to matching line
    scrollToLine(visibleLineStart, 'explanation');
  }, [scrollToLine]);

  return {
    codeRef,
    explanationRef,
    scrollToLine,
    handleCodeScroll,
  };
}
