import { useState } from 'react';
import { Icon } from '../Icons.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

/**
 * Shared Sidebar for Documentation Pages
 * Mobile: hamburger menu with overlay drawer
 * Desktop: fixed sidebar
 */
export default function DocsSidebar({ activePage }) {
  const { isMobile } = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'coding', label: 'Data Structures & Algorithms', icon: 'code', href: '/prepare/coding' },
    { id: 'system-design', label: 'System Design', icon: 'systemDesign', href: '/prepare/system-design' },
    { id: 'low-level', label: 'Low Level Design', icon: 'layers', href: '/prepare/low-level-design' },
    { id: 'behavioral', label: 'Behavioral', icon: 'users', href: '/prepare/behavioral' },
    { id: 'projects', label: 'Projects', icon: 'briefcase', href: '/prepare/projects' },
    { id: 'companies', label: 'Companies', icon: 'building', href: '/prepare/companies' },
    { id: 'roadmaps', label: 'Roadmaps', icon: 'compass', href: '/prepare/roadmaps' },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center">
            <Icon name="ascend" size={16} className="text-white" />
          </div>
          <div>
            <span className="landing-display font-bold text-lg tracking-tight text-gray-900">Ascend</span>
            <span className="block text-[10px] landing-mono uppercase tracking-[0.2em] text-emerald-600 -mt-0.5">Interview AI</span>
          </div>
        </a>
        {isMobile && (
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="px-5 pt-5 pb-2">
        <span className="landing-mono text-[10px] text-emerald-600 tracking-widest uppercase">Preparation</span>
      </div>

      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all landing-body ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'
              }`}
            >
              <Icon name={item.icon} size={18} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

      <div className="px-3 py-4">
        <a href="/#pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-amber-50 text-amber-600 landing-body">
          <Icon name="zap" size={18} />
          <span>Upgrade to Pro</span>
        </a>
      </div>
    </>
  );

  // Mobile: hamburger + overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger bar */}
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center h-12 px-3 bg-white border-b border-gray-200">
          <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="ml-2 font-bold text-sm text-gray-900">{navItems.find(n => n.id === activePage)?.label || 'Preparation'}</span>
        </div>
        {/* Spacer */}
        <div className="h-12 shrink-0" />

        {/* Overlay */}
        {isOpen && <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)} />}

        {/* Drawer */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] flex flex-col bg-white transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <div className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100">
      {sidebarContent}
    </div>
  );
}
