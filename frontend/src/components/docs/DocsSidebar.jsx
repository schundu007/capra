import { Icon } from '../Icons.jsx';

/**
 * Shared Sidebar for Documentation Pages
 * Matches techprep.app style
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
    { id: 'upgrade', label: 'Upgrade', icon: 'zap', href: '/#pricing', color: '#f59e0b' },
  ];

  return (
    <div className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: '#0a0a0f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="p-5">
        <a href="/app" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Icon name="ascend" size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">Ascend</span>
        </a>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon name={item.icon} size={18} className={isActive ? 'text-green-400' : ''} />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {bottomItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5"
            style={{ color: item.color || '#9ca3af' }}
          >
            <Icon name={item.icon} size={18} />
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
