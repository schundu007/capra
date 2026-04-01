import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppShellContext } from './AppShellContext.jsx';
import ShellSidebar from './ShellSidebar.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

/**
 * Unified layout shell for all app routes.
 * Desktop (>=768px): persistent left sidebar via CSS hidden/md:block.
 * Mobile (<768px): NO sidebar in DOM. Hamburger opens overlay drawer.
 */
export default function AppShell() {
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Close drawer on any navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

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

  // Lock body scroll when drawer open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [sidebarOpen]);

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

        {/* Desktop sidebar — pure CSS: hidden on mobile, visible on md+ */}
        <div className="hidden md:flex md:w-64 md:flex-shrink-0 h-screen border-r border-gray-100">
          <ShellSidebar />
        </div>

        {/* Mobile drawer — only renders when open */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40" onClick={ctx.closeSidebar}>
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="absolute top-0 left-0 h-full w-72 max-w-[80vw] bg-white shadow-xl z-50"
              onClick={e => e.stopPropagation()}
            >
              <ShellSidebar />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
