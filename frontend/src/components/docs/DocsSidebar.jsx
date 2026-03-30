import { Icon } from '../Icons.jsx';

/**
 * Shared Sidebar for Documentation Pages
 * Landing-page design language: Plus Jakarta Sans / Work Sans / IBM Plex Mono
 */
export default function DocsSidebar({ activePage }) {
  const navItems = [
    { id: 'coding', label: 'Data Structures & Algorithms', icon: 'code', href: '/prepare/coding' },
    { id: 'system-design', label: 'System Design', icon: 'systemDesign', href: '/prepare/system-design' },
    { id: 'low-level', label: 'Low Level Design', icon: 'layers', href: '/prepare/low-level-design' },
    { id: 'behavioral', label: 'Behavioral', icon: 'users', href: '/prepare/behavioral' },
    { id: 'projects', label: 'Projects', icon: 'briefcase', href: '/prepare/projects' },
    { id: 'companies', label: 'Companies', icon: 'building', href: '/prepare/companies' },
    { id: 'roadmaps', label: 'Roadmaps', icon: 'compass', href: '/prepare/roadmaps' },
  ];

  const bottomItems = [
    { id: 'upgrade', label: 'Upgrade to Pro', icon: 'zap', href: '/#pricing', color: '#f59e0b' },
  ];

  return (
    <div className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center">
            <Icon name="ascend" size={16} className="text-white" />
          </div>
          <div>
            <span className="landing-display font-bold text-lg tracking-tight text-gray-900">Ascend</span>
            <span className="block text-[10px] landing-mono uppercase tracking-[0.2em] text-emerald-600 -mt-0.5">Interview AI</span>
          </div>
        </a>
      </div>

      {/* Section Label */}
      <div className="px-5 pt-5 pb-2">
        <span className="landing-mono text-[10px] text-emerald-600 tracking-widest uppercase">Preparation</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
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

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

      {/* Bottom Items */}
      <div className="px-3 py-4">
        {bottomItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-amber-50 text-amber-600 landing-body"
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
