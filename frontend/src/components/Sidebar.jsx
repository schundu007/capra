import { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { useIsMobile } from '../hooks/useIsMobile';

// Check if running on macOS in Electron
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');

/**
 * Sidebar - Enterprise premium design with modern styling
 */
export default function Sidebar({
  savedDesigns = [],
  codingHistory = [],
  onLoadDesign,
  onLoadHistory,
  onDeleteDesign,
  onDeleteHistory,
  onCollapse,
  onViewAllDesigns,
  onViewAllHistory,
  isLoading,
  showAscendAssistant,
  onToggleAscendAssistant,
  user,
  isAdmin,
  authRequired,
  onLogout,
  onOpenAdminPanel,
  theme = 'dark',
  isOpen = true,
}) {
  const { isMobile } = useIsMobile();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [designsCollapsed, setDesignsCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, isOpen]);

  const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleDelete = (type, id, e) => {
    e.stopPropagation();
    const confirmKey = `${type}-${id}`;

    if (deleteConfirmId === confirmKey) {
      if (type === 'design' && onDeleteDesign) {
        onDeleteDesign(id);
      } else if (type === 'history' && onDeleteHistory) {
        onDeleteHistory(id);
      }
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(confirmKey);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const sidebarContent = (
    <div className={`${isMobile ? 'w-[280px] max-w-[80vw]' : 'w-[260px] min-w-[260px]'} h-full flex flex-col bg-white border-r border-gray-200`}>
      {/* Header with Logo */}
      <div
        className="flex items-center h-14 px-4 border-b border-gray-200"
        style={{
          paddingLeft: isMacElectron ? '80px' : '16px',
          WebkitAppRegion: 'drag',
        }}
      >
        <button
          onClick={onCollapse}
          className="flex items-center gap-3 group"
          title="Collapse sidebar"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-400/20 group-hover:shadow-brand-400/40 group-hover:scale-105 transition-all duration-200">
            <img
              src="/ascend-logo.png"
              alt="Ascend"
              className="h-5 w-auto object-contain filter brightness-0 invert"
            />
          </div>
          <span className="text-base font-semibold text-brand-400 tracking-tight">Ascend</span>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Saved Designs Section */}
        <div className="space-y-1">
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100/30 transition-colors"
            onClick={() => setDesignsCollapsed(!designsCollapsed)}
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${designsCollapsed ? '-rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Saved Designs
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-brand-400">
              {savedDesigns.length}
            </span>
          </button>

          {!designsCollapsed && (
            <div className="space-y-0.5 mt-1">
              {savedDesigns.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400 italic">
                  No saved designs
                </div>
              ) : (
                <>
                  {savedDesigns.slice(0, 5).map((design) => (
                    <button
                      key={design.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:text-white hover:bg-gray-100/50 transition-all duration-150 group"
                      onClick={() => onLoadDesign(design.id)}
                    >
                      <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200">
                        <Icon name="document" size={14} />
                      </div>
                      <span className="text-sm truncate flex-1 text-left">{design.title || 'Untitled'}</span>
                      {onDeleteDesign && (
                        <span
                          onClick={(e) => handleDelete('design', design.id, e)}
                          className={`
                            opacity-0 group-hover:opacity-100 touch:opacity-100 transition-all duration-150
                            w-6 h-6 rounded-md flex items-center justify-center text-sm
                            ${deleteConfirmId === `design-${design.id}`
                              ? 'bg-error-500/20 text-error-400'
                              : 'hover:bg-gray-200 text-gray-400'
                            }
                          `}
                        >
                          {deleteConfirmId === `design-${design.id}` ? '?' : '×'}
                        </span>
                      )}
                    </button>
                  ))}
                  {savedDesigns.length > 5 && (
                    <button
                      onClick={onViewAllDesigns}
                      className="w-full px-3 py-2 text-sm text-brand-400 hover:text-brand-300 hover:bg-brand-400/10 rounded-lg transition-colors"
                    >
                      Show all ({savedDesigns.length})
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Recent History Section */}
        <div className="space-y-1 mt-2">
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100/30 transition-colors"
            onClick={() => setHistoryCollapsed(!historyCollapsed)}
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${historyCollapsed ? '-rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Recent History
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-brand-400">
              {codingHistory.length}
            </span>
          </button>

          {!historyCollapsed && (
            <div className="space-y-0.5 mt-1">
              {codingHistory.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400 italic">
                  No history yet
                </div>
              ) : (
                <>
                  {codingHistory.slice(0, 8).map((entry) => (
                    <button
                      key={entry.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:text-white hover:bg-gray-100/50 transition-all duration-150 group"
                      onClick={() => onLoadHistory(entry.id)}
                    >
                      <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200">
                        <Icon name="clock" size={14} />
                      </div>
                      <span className="text-sm truncate flex-1 text-left">{entry.title || 'Untitled'}</span>
                      {onDeleteHistory && (
                        <span
                          onClick={(e) => handleDelete('history', entry.id, e)}
                          className={`
                            opacity-0 group-hover:opacity-100 touch:opacity-100 transition-all duration-150
                            w-6 h-6 rounded-md flex items-center justify-center text-sm
                            ${deleteConfirmId === `history-${entry.id}`
                              ? 'bg-error-500/20 text-error-400'
                              : 'hover:bg-gray-200 text-gray-400'
                            }
                          `}
                        >
                          {deleteConfirmId === `history-${entry.id}` ? '?' : '×'}
                        </span>
                      )}
                    </button>
                  ))}
                  {codingHistory.length > 8 && onViewAllHistory && (
                    <button
                      onClick={onViewAllHistory}
                      className="w-full px-3 py-2 text-sm text-brand-400 hover:text-brand-300 hover:bg-brand-400/10 rounded-lg transition-colors"
                    >
                      Show all ({codingHistory.length})
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      {authRequired && user && (
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-100/30">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-white font-semibold text-sm">
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-400 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user.name || user.username || 'User'}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && onOpenAdminPanel && (
                <button
                  onClick={onOpenAdminPanel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title="Admin"
                >
                  <Icon name="users" size={16} />
                </button>
              )}
              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-error-400 hover:bg-error-500/10 transition-colors"
                title="Sign out"
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Desktop: render inline as before
  if (!isMobile) return sidebarContent;

  // Mobile: render as overlay drawer
  return (
    <div
      className={`fixed inset-0 z-modal-backdrop transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onCollapse}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
      {/* Drawer */}
      <div
        className={`absolute top-0 left-0 h-full transition-transform duration-300 ease-smooth ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {sidebarContent}
      </div>
    </div>
  );
}
