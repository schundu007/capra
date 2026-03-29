import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * MobileTabView — Swipeable tabbed container for mobile layouts.
 *
 * Usage:
 *   <MobileTabView
 *     tabs={[
 *       { id: 'problem', label: 'Problem' },
 *       { id: 'code', label: 'Code' },
 *       { id: 'explain', label: 'Explain' },
 *     ]}
 *     activeTab={activeTab}
 *     onTabChange={setActiveTab}
 *   >
 *     {(activeId) => (
 *       <>
 *         {activeId === 'problem' && <ProblemInput ... />}
 *         {activeId === 'code' && <CodeDisplay ... />}
 *         {activeId === 'explain' && <ExplanationPanel ... />}
 *       </>
 *     )}
 *   </MobileTabView>
 */
export default function MobileTabView({ tabs, activeTab, onTabChange, children, className = '' }) {
  const [localActive, setLocalActive] = useState(tabs[0]?.id);
  const active = activeTab ?? localActive;
  const setActive = onTabChange ?? setLocalActive;

  // Swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Only trigger if horizontal swipe is dominant and long enough
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;

    const currentIndex = tabs.findIndex((t) => t.id === active);
    if (dx < 0 && currentIndex < tabs.length - 1) {
      setActive(tabs[currentIndex + 1].id);
    } else if (dx > 0 && currentIndex > 0) {
      setActive(tabs[currentIndex - 1].id);
    }
  }, [active, tabs, setActive]);

  // Active indicator offset
  const tabBarRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    if (!tabBarRef.current) return;
    const activeBtn = tabBarRef.current.querySelector(`[data-tab-id="${active}"]`);
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [active, tabs]);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Tab bar */}
      <div
        ref={tabBarRef}
        className="relative flex items-stretch border-b border-neutral-700/50 bg-neutral-800/80 backdrop-blur-sm flex-shrink-0"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-200
              ${active === tab.id ? 'text-brand-400' : 'text-neutral-500 active:text-neutral-300'}`}
          >
            {tab.label}
          </button>
        ))}
        {/* Animated indicator line */}
        <div
          className="absolute bottom-0 h-0.5 bg-brand-400 transition-all duration-250 ease-smooth rounded-full"
          style={indicatorStyle}
        />
      </div>

      {/* Tab content */}
      <div
        className="flex-1 min-h-0 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {typeof children === 'function' ? children(active) : children}
      </div>
    </div>
  );
}
