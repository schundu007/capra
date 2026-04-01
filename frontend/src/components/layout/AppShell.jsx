import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppShellContext } from './AppShellContext.jsx';
import ShellSidebar from './ShellSidebar.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

/**
 * Unified layout shell for all app routes.
 * Desktop: persistent left sidebar + main content.
 * Mobile: no sidebar, hamburger opens a drawer overlay.
 */
export default function AppShell() {
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Close drawer on any navigation (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, location.search, isMobile]);

  // Derive active section from URL
  useEffect(() => {
    const path = location.pathname;
    const params = new URLSearchParams(location.search);
    if (path.startsWith('/prepare')) {
      const page = params.get('page') || path.replace('/prepare/', '').replace('/prepare', 'coding');
      const normalized = page === 'dsa' ? 'coding' : page === 'low-level-design' ? 'low-level' : page;
      setActiveSection(normalized || 'coding');
    } else if (path.startsWith('/app/design')) {
      setActiveSection('system-design');
    } else if (path.startsWith('/app/prep')) {
      setActiveSection('behavioral');
    } else if (path.startsWith('/app')) {
      setActiveSection('coding');
    }
  }, [location.pathname, location.search]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, sidebarOpen]);

  const ctx = {
    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
    toggleSidebar: () => setSidebarOpen(v => !v),
    activeSection,
    setActiveSection,
  };

  return (
    <AppShellContext.Provider value={ctx}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar — always visible, never on mobile */}
        {!isMobile && (
          <div className="w-64 flex-shrink-0 h-screen border-r border-gray-100">
            <ShellSidebar />
          </div>
        )}

        {/* Mobile drawer overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-40" onClick={ctx.closeSidebar}>
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="absolute top-0 left-0 h-full w-72 max-w-[80vw] bg-white shadow-xl z-50"
              onClick={e => e.stopPropagation()}
            >
              <ShellSidebar />
            </div>
          </div>
        )}

        {/* Main content — Outlet renders the matched route */}
        <div className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
