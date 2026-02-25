import { useState } from 'react';

// Check if running on macOS in Electron (needs extra padding for traffic lights)
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');
const isElectron = window.electronAPI?.isElectron || false;

/**
 * Sidebar component - Modern dark theme with solid colors
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
  onOpenSupport,
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
        width: '260px',
        minWidth: '260px',
        background: '#1a1a1a',
        borderRight: '1px solid #333333',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between py-3"
        style={{
          paddingLeft: isMacElectron ? '80px' : '16px',
          paddingRight: '12px',
          borderBottom: '1px solid #333333',
          background: '#242424',
          WebkitAppRegion: 'drag'
        }}
      >
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <img
            src="/ascend-icon.png"
            alt="Ascend"
            className="w-7 h-7 object-contain"
          />
          <span className="font-semibold text-sm" style={{ color: '#ffffff' }}>Ascend</span>
          {isLoading && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          )}
        </div>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-md transition-colors"
          style={{
            color: '#888888',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333333'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}
          title="Collapse sidebar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Interview Assistant Toggle */}
        <div className="px-3 py-4">
          <button
            onClick={onToggleAscendAssistant}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
            style={{
              background: showAscendAssistant ? '#1a3d2e' : '#2a2a2a',
              color: showAscendAssistant ? '#4ade80' : '#cccccc',
              border: showAscendAssistant ? '1px solid #166534' : '1px solid #444444',
            }}
            onMouseEnter={(e) => {
              if (!showAscendAssistant) {
                e.currentTarget.style.background = '#333333';
              }
            }}
            onMouseLeave={(e) => {
              if (!showAscendAssistant) {
                e.currentTarget.style.background = '#2a2a2a';
              }
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <span className="text-sm font-semibold">Ascend</span>
            {showAscendAssistant && (
              <div className="ml-auto w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
            )}
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #333333', margin: '0 16px' }} />

        {/* Saved Designs Section */}
        <div className="px-3 py-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#888888' }}>
              Saved Designs ({savedDesigns.length})
            </span>
          </div>

          <div className="mt-1">
            {savedDesigns.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs rounded-lg" style={{ color: '#666666', background: '#2a2a2a' }}>
                No saved designs yet
              </div>
            ) : (
              <>
                <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                  {savedDesigns.slice(0, 5).map((design) => (
                    <div
                      key={design.id}
                      className="group flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
                      style={{ color: '#cccccc' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <button
                        onClick={() => onLoadDesign(design.id)}
                        className="flex-1 flex flex-col text-left min-w-0"
                      >
                        <div className="text-sm truncate group-hover:text-emerald-400">
                          {design.title || 'Untitled Design'}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#666666' }}>
                          {formatRelativeTime(design.timestamp)}
                        </div>
                      </button>
                      {onDeleteDesign && (
                        <button
                          onClick={(e) => handleDelete('design', design.id, e)}
                          className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors flex-shrink-0"
                          style={{
                            background: deleteConfirmId === `design-${design.id}` ? '#3d1f1f' : 'transparent',
                            color: deleteConfirmId === `design-${design.id}` ? '#ef4444' : '#666666',
                            border: deleteConfirmId === `design-${design.id}` ? '1px solid #7f1d1d' : '1px solid transparent',
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
                    className="w-full px-3 py-2 text-xs text-left flex items-center gap-1 transition-colors rounded-lg mt-1"
                    style={{ color: '#22d3d1' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#0d3d3d'; }}
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
        <div style={{ borderTop: '1px solid #333333', margin: '0 16px' }} />

        {/* Recent History Section */}
        <div className="px-3 py-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#888888' }}>
              Recent ({codingHistory.length})
            </span>
          </div>

          <div className="mt-1">
            {codingHistory.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs rounded-lg" style={{ color: '#666666', background: '#2a2a2a' }}>
                No history yet
              </div>
            ) : (
              <>
                <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                  {codingHistory.slice(0, 8).map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
                      style={{ color: '#cccccc' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <button
                        onClick={() => onLoadHistory(entry.id)}
                        className="flex-1 flex flex-col text-left min-w-0"
                      >
                        <div className="text-sm truncate group-hover:text-emerald-400">
                          {entry.title || 'Untitled Problem'}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: '#666666' }}>
                          <span className="px-1.5 py-0.5 rounded" style={{ background: '#333333', color: '#999999' }}>
                            {entry.language || 'auto'}
                          </span>
                          <span>{formatRelativeTime(entry.timestamp)}</span>
                        </div>
                      </button>
                      {onDeleteHistory && (
                        <button
                          onClick={(e) => handleDelete('history', entry.id, e)}
                          className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors flex-shrink-0"
                          style={{
                            background: deleteConfirmId === `history-${entry.id}` ? '#3d1f1f' : 'transparent',
                            color: deleteConfirmId === `history-${entry.id}` ? '#ef4444' : '#666666',
                            border: deleteConfirmId === `history-${entry.id}` ? '1px solid #7f1d1d' : '1px solid transparent',
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
                    className="w-full px-3 py-2 text-xs text-left flex items-center gap-1 transition-colors rounded-lg mt-1"
                    style={{ color: '#22d3d1' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#0d3d3d'; }}
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
        className="px-3 py-3 space-y-2"
        style={{
          borderTop: '1px solid #333333',
          background: '#242424',
        }}
      >
        {/* User Section (for webapp with auth) */}
        {authRequired && user && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              background: '#1a3d2e',
              border: '1px solid #166534',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
              style={{ background: '#10b981' }}
            >
              {(user.name || user.username || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#ffffff' }}>
                {user.name || user.username || 'User'}
              </div>
              {user.email && (
                <div className="text-xs truncate" style={{ color: '#888888' }}>
                  {user.email}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isAdmin && onOpenAdminPanel && (
                <button
                  onClick={onOpenAdminPanel}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: '#888888' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#333333'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}
                  title="User management"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: '#888888' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3d1f1f'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Support Button */}
        {onOpenSupport && (
          <button
            onClick={onOpenSupport}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
            style={{
              background: '#422006',
              color: '#fbbf24',
              border: '1px solid #b45309',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4a2608'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#422006'; }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">Support Ascend</span>
          </button>
        )}

        {/* Stealth Mode Toggle - Only in Electron */}
        {isElectron && (
          <button
            onClick={onToggleStealth}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
            style={{
              background: stealthMode ? '#14532d' : '#1f2937',
              color: stealthMode ? '#4ade80' : '#9ca3af',
              border: stealthMode ? '1px solid #166534' : '1px solid #374151',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            title={stealthMode ? 'Stealth ON - Hidden from screen capture (Cmd+Shift+S)' : 'Stealth OFF - Screenshots allowed (Cmd+Shift+S)'}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {stealthMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
              <span className="text-sm font-medium">Stealth Mode</span>
            </div>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{
              background: stealthMode ? '#166534' : '#374151',
              color: stealthMode ? '#86efac' : '#6b7280',
            }}>
              {stealthMode ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
          style={{
            background: '#1a2a3a',
            color: '#60a5fa',
            border: '1px solid #1e40af',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1e3a5f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a2a3a'; }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
