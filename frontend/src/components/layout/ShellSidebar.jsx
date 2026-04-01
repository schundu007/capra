import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Icon } from '../Icons.jsx';
import { useAppShell } from './AppShellContext.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

const PREPARE_ITEMS = [
  { id: 'coding', label: 'DSA & Algorithms', icon: 'code', href: '/prepare/coding' },
  { id: 'system-design', label: 'System Design', icon: 'systemDesign', href: '/prepare/system-design' },
  { id: 'low-level', label: 'Low-Level Design', icon: 'layers', href: '/prepare/low-level-design' },
  { id: 'behavioral', label: 'Behavioral', icon: 'users', href: '/prepare/behavioral' },
];

const PRACTICE_ITEMS = [
  { id: 'app-coding', label: 'Coding', icon: 'code', href: '/app/coding' },
  { id: 'app-design', label: 'System Design', icon: 'systemDesign', href: '/app/design' },
  { id: 'app-prep', label: 'Interview Prep', icon: 'briefcase', href: '/app/prep' },
];

/**
 * Unified sidebar content — used by AppShell on desktop (inline) and mobile (drawer).
 */
export default function ShellSidebar() {
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSection, setActiveSection, closeSidebar } = useAppShell();

  const isOnPrepare = location.pathname.startsWith('/prepare');

  const handleNav = (href, sectionId) => {
    navigate(href);
    if (sectionId) setActiveSection(sectionId);
    if (isMobile) closeSidebar();
  };

  const isPracticeActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Icon name="ascend" size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-gray-900">Ascend</span>
            <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-emerald-600 -mt-0.5">Interview AI</span>
          </div>
        </a>
        {isMobile && (
          <button onClick={closeSidebar} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {/* Prepare */}
        <div className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase px-3 mb-2">Prepare</div>
        {PREPARE_ITEMS.map((item) => {
          const isActive = isOnPrepare && activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.href, item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all mb-0.5 ${
                isActive
                  ? 'text-emerald-700 font-semibold bg-emerald-50 border-l-2 border-emerald-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium border-l-2 border-transparent'
              }`}
            >
              <Icon name={item.icon} size={16} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="mx-4 h-px bg-gray-100 my-3" />

        {/* Practice */}
        <div className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase px-3 mb-2">Practice</div>
        {PRACTICE_ITEMS.map((item) => {
          const isActive = isPracticeActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all mb-0.5 ${
                isActive
                  ? 'text-emerald-700 font-semibold bg-emerald-50 border-l-2 border-emerald-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium border-l-2 border-transparent'
              }`}
            >
              <Icon name={item.icon} size={16} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom utility */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={() => { window.dispatchEvent(new CustomEvent('ascend:open-settings')); if (isMobile) closeSidebar(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium"
        >
          <Icon name="settings" size={15} className="text-gray-400" />
          <span>Settings</span>
        </button>
        <Link
          to="/premium"
          onClick={() => { if (isMobile) closeSidebar(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-emerald-600 hover:bg-emerald-50 transition-all font-medium"
        >
          <Icon name="zap" size={15} className="text-emerald-500" />
          <span>Upgrade</span>
        </Link>
      </div>
    </div>
  );
}
