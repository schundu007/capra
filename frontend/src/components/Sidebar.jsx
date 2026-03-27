import { useState, memo } from 'react';
import { Icon } from './Icons';

// Check if running on macOS in Electron
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');

/**
 * Sidebar - Enterprise premium design with modern styling
 */
export default memo(function Sidebar({
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
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [designsCollapsed, setDesignsCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);

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

  return (
    <div className="w-[260px] min-w-[260px] h-full flex flex-col bg-neutral-850 border-r border-neutral-700/50">
      {/* Header with Logo */}
      <div
        className="flex items-center h-14 px-4 border-b border-neutral-700/50"
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
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-700/30 transition-colors"
            onClick={() => setDesignsCollapsed(!designsCollapsed)}
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${designsCollapsed ? '-rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Saved Designs
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-700 text-brand-400">
              {savedDesigns.length}
            </span>
          </button>

          {!designsCollapsed && (
            <div className="space-y-0.5 mt-1">
              {savedDesigns.length === 0 ? (
                <div className="px-3 py-2 text-sm text-neutral-500 italic">
                  No saved designs
                </div>
              ) : (
                <>
                  {savedDesigns.slice(0, 5).map((design) => (
                    <button
                      key={design.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all duration-150 group"
                      onClick={() => onLoadDesign(design.id)}
                    >
                      <div className="w-7 h-7 rounded-md bg-neutral-700 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-600">
                        <Icon name="document" size={14} />
                      </div>
                      <span className="text-sm truncate flex-1 text-left">{design.title || 'Untitled'}</span>
                      {onDeleteDesign && (
                        <span
                          onClick={(e) => handleDelete('design', design.id, e)}
                          className={`
                            opacity-0 group-hover:opacity-100 transition-all duration-150
                            w-6 h-6 rounded-md flex items-center justify-center text-sm
                            ${deleteConfirmId === `design-${design.id}`
                              ? 'bg-error-500/20 text-error-400'
                              : 'hover:bg-neutral-600 text-neutral-500'
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
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-700/30 transition-colors"
            onClick={() => setHistoryCollapsed(!historyCollapsed)}
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${historyCollapsed ? '-rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Recent History
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-700 text-brand-400">
              {codingHistory.length}
            </span>
          </button>

          {!historyCollapsed && (
            <div className="space-y-0.5 mt-1">
              {codingHistory.length === 0 ? (
                <div className="px-3 py-2 text-sm text-neutral-500 italic">
                  No history yet
                </div>
              ) : (
                <>
                  {codingHistory.slice(0, 8).map((entry) => (
                    <button
                      key={entry.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all duration-150 group"
                      onClick={() => onLoadHistory(entry.id)}
                    >
                      <div className="w-7 h-7 rounded-md bg-neutral-700 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-600">
                        <Icon name="clock" size={14} />
                      </div>
                      <span className="text-sm truncate flex-1 text-left">{entry.title || 'Untitled'}</span>
                      {onDeleteHistory && (
                        <span
                          onClick={(e) => handleDelete('history', entry.id, e)}
                          className={`
                            opacity-0 group-hover:opacity-100 transition-all duration-150
                            w-6 h-6 rounded-md flex items-center justify-center text-sm
                            ${deleteConfirmId === `history-${entry.id}`
                              ? 'bg-error-500/20 text-error-400'
                              : 'hover:bg-neutral-600 text-neutral-500'
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
        <div className="p-3 border-t border-neutral-700/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-neutral-700/30">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-white font-semibold text-sm">
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-400 border-2 border-neutral-850" />
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
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-600 transition-colors"
                  title="Admin"
                >
                  <Icon name="users" size={16} />
                </button>
              )}
              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-error-400 hover:bg-error-500/10 transition-colors"
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
});
