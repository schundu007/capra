import { useState } from 'react';

// Check if running on macOS in Electron (needs extra padding for traffic lights)
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');
const isElectron = window.electronAPI?.isElectron || false;

/**
 * Sidebar component - Modern Design System
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
  onOpenSettings,
  isLoading,
  showAscendAssistant,
  onToggleAscendAssistant,
  user,
  isAdmin,
  authRequired,
  onLogout,
  onOpenAdminPanel,
  stealthMode = false,
  onToggleStealth,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
    <div
      className="h-full flex flex-col"
      style={{
        width: '280px',
        minWidth: '280px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between py-3"
        style={{
          paddingLeft: isMacElectron ? '80px' : '16px',
          paddingRight: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          WebkitAppRegion: 'drag'
        }}
      >
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand-gradient)', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
          >
            <img
              src="/ascend-logo.png"
              alt="Ascend"
              className="w-5 h-5 object-contain filter brightness-0 invert"
            />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Ascend</span>
          {isLoading && (
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ background: 'var(--accent-success)', boxShadow: '0 0 10px var(--accent-success)' }}
            />
          )}
        </div>
        <button
          onClick={onCollapse}
          className="p-2 rounded-lg transition-all"
          style={{
            color: 'var(--text-muted)',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Collapse sidebar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Interview Assistant Toggle */}
        <div className="px-3 py-4">
          <button
            onClick={onToggleAscendAssistant}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              background: showAscendAssistant
                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)'
                : 'var(--bg-elevated)',
              color: showAscendAssistant ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
              border: showAscendAssistant ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid var(--border-subtle)',
              boxShadow: showAscendAssistant ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!showAscendAssistant) {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showAscendAssistant) {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: showAscendAssistant ? 'rgba(124, 58, 237, 0.3)' : 'var(--bg-active)'
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold">Voice Assistant</span>
            {showAscendAssistant && (
              <div
                className="ml-auto w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--accent-success)', boxShadow: '0 0 8px var(--accent-success)' }}
              />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="divider mx-4" />

        {/* Saved Designs Section */}
        <div className="px-3 py-4">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Saved Designs
            </span>
            <span className="badge text-[10px]">{savedDesigns.length}</span>
          </div>

          <div className="mt-1">
            {savedDesigns.length === 0 ? (
              <div
                className="px-4 py-4 text-center text-xs rounded-xl"
                style={{ color: 'var(--text-subtle)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                No saved designs yet
              </div>
            ) : (
              <>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  {savedDesigns.slice(0, 5).map((design) => (
                    <div
                      key={design.id}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <button
                        onClick={() => onLoadDesign(design.id)}
                        className="flex-1 flex flex-col text-left min-w-0"
                      >
                        <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {design.title || 'Untitled Design'}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {formatRelativeTime(design.timestamp)}
                        </div>
                      </button>
                      {onDeleteDesign && (
                        <button
                          onClick={(e) => handleDelete('design', design.id, e)}
                          className="ml-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                          style={{
                            background: deleteConfirmId === `design-${design.id}` ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            color: deleteConfirmId === `design-${design.id}` ? 'var(--accent-error)' : 'var(--text-muted)',
                            border: deleteConfirmId === `design-${design.id}` ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                          }}
                          title={deleteConfirmId === `design-${design.id}` ? 'Click to confirm' : 'Delete'}
                        >
                          {deleteConfirmId === `design-${design.id}` ? '?' : '×'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {savedDesigns.length > 5 && (
                  <button
                    onClick={onViewAllDesigns}
                    className="w-full px-3 py-2.5 text-xs text-left flex items-center gap-2 transition-all rounded-xl mt-2"
                    style={{ color: 'var(--accent-teal-light)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    View All ({savedDesigns.length})
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="divider mx-4" />

        {/* Recent History Section */}
        <div className="px-3 py-4">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Recent History
            </span>
            <span className="badge text-[10px]">{codingHistory.length}</span>
          </div>

          <div className="mt-1">
            {codingHistory.length === 0 ? (
              <div
                className="px-4 py-4 text-center text-xs rounded-xl"
                style={{ color: 'var(--text-subtle)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No history yet
              </div>
            ) : (
              <>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  {codingHistory.slice(0, 8).map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <button
                        onClick={() => onLoadHistory(entry.id)}
                        className="flex-1 flex flex-col text-left min-w-0"
                      >
                        <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {entry.title || 'Untitled Problem'}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span
                            className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                            style={{ background: 'var(--bg-active)', color: 'var(--text-muted)' }}
                          >
                            {entry.language || 'auto'}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(entry.timestamp)}</span>
                        </div>
                      </button>
                      {onDeleteHistory && (
                        <button
                          onClick={(e) => handleDelete('history', entry.id, e)}
                          className="ml-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                          style={{
                            background: deleteConfirmId === `history-${entry.id}` ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            color: deleteConfirmId === `history-${entry.id}` ? 'var(--accent-error)' : 'var(--text-muted)',
                            border: deleteConfirmId === `history-${entry.id}` ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                          }}
                          title={deleteConfirmId === `history-${entry.id}` ? 'Click to confirm' : 'Delete'}
                        >
                          {deleteConfirmId === `history-${entry.id}` ? '?' : '×'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {codingHistory.length > 8 && onViewAllHistory && (
                  <button
                    onClick={onViewAllHistory}
                    className="w-full px-3 py-2.5 text-xs text-left flex items-center gap-2 transition-all rounded-xl mt-2"
                    style={{ color: 'var(--accent-teal-light)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    View All ({codingHistory.length})
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - User & Settings */}
      <div
        className="px-3 py-4 space-y-2"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
        }}
      >
        {/* User Section (for webapp with auth) */}
        {authRequired && user && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'var(--brand-gradient)', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
            >
              {(user.name || user.username || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name || user.username || 'User'}
              </div>
              {user.email && (
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user.email}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isAdmin && onOpenAdminPanel && (
                <button
                  onClick={onOpenAdminPanel}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="User management"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onLogout}
                className="p-2 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--accent-error)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Stealth Mode Toggle - Only in Electron */}
        {isElectron && (
          <button
            onClick={onToggleStealth}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              background: stealthMode
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                : 'var(--bg-elevated)',
              color: stealthMode ? 'var(--accent-success-light)' : 'var(--text-secondary)',
              border: stealthMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            title={stealthMode ? 'Stealth ON - Hidden from screen capture (Cmd+Shift+S)' : 'Stealth OFF - Screenshots allowed (Cmd+Shift+S)'}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: stealthMode ? 'rgba(16, 185, 129, 0.3)' : 'var(--bg-active)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {stealthMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </div>
              <span className="text-sm font-semibold">Stealth Mode</span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-md"
              style={{
                background: stealthMode ? 'rgba(16, 185, 129, 0.3)' : 'var(--bg-active)',
                color: stealthMode ? 'var(--accent-success-light)' : 'var(--text-muted)',
              }}
            >
              {stealthMode ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
            color: 'var(--accent-teal-light)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(6, 182, 212, 0.3)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold">Settings</span>
        </button>
      </div>
    </div>
  );
}
