import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Icon } from '../Icons.jsx';
import { useAppShell } from './AppShellContext.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

const LEARNING_TRACKS = [
  { id: 'coding', label: 'DSA & Algorithms', icon: 'code' },
  { id: 'system-design', label: 'System Design', icon: 'systemDesign' },
  { id: 'low-level', label: 'Low-Level Design', icon: 'layers' },
  { id: 'behavioral', label: 'Behavioral', icon: 'users' },
];

const PRACTICE_LINKS = [
  { href: '/app/coding', label: 'Coding', icon: 'code', color: '#10b981' },
  { href: '/app/design', label: 'Design', icon: 'systemDesign', color: '#3b82f6' },
  { href: '/app/prep', label: 'Interview Prep', icon: 'briefcase', color: '#a855f7' },
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

  const handleTrackClick = (id) => {
    const page = id === 'low-level' ? 'low-level-design' : id;
    navigate(`/prepare/${page}`);
    setActiveSection(id);
    if (isMobile) closeSidebar();
  };

  const handlePracticeClick = (href) => {
    navigate(href);
    if (isMobile) closeSidebar();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center transition-transform hover:scale-105">
            <Icon name="ascend" size={16} className="text-white" />
          </div>
          <div>
            <span className="landing-display font-bold text-lg tracking-tight text-gray-900">Ascend</span>
            <span className="block text-[10px] landing-mono uppercase tracking-[0.2em] text-emerald-600 -mt-0.5">Interview AI</span>
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

      {/* Learning Tracks */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="landing-mono text-[10px] text-emerald-600 tracking-widest uppercase px-3 mb-3">Learning Tracks</div>
        {LEARNING_TRACKS.map((item) => {
          const isActive = isOnPrepare && activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTrackClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all mb-1 landing-body ${
                isActive ? 'text-emerald-700 font-semibold bg-emerald-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'
              }`}
            >
              <Icon name={item.icon} size={18} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>
          );
        })}

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent my-4" />

        {/* Practice */}
        <div className="landing-mono text-[10px] text-emerald-600 tracking-widest uppercase px-3 mb-3">Practice</div>
        {PRACTICE_LINKS.map((link) => {
          const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');
          return (
            <button
              key={link.href}
              onClick={() => handlePracticeClick(link.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all mb-1 landing-body ${
                isActive
                  ? 'font-semibold bg-emerald-50 text-emerald-700'
                  : 'font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon name={link.icon} size={18} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
              <span>{link.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>
          );
        })}

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

        {/* Utility */}
        <button
          onClick={() => { window.dispatchEvent(new CustomEvent('ascend:open-settings')); if (isMobile) closeSidebar(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all landing-body font-medium"
        >
          <Icon name="settings" size={16} />
          <span>Settings</span>
        </button>
        <Link
          to="/premium"
          onClick={() => { if (isMobile) closeSidebar(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-amber-600 hover:bg-amber-50 transition-all landing-body font-medium"
        >
          <Icon name="zap" size={16} />
          <span>Pricing</span>
        </Link>
      </nav>
    </div>
  );
}
