import { useState } from 'react';

// Check if running on macOS in Electron
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');
const isElectron = window.electronAPI?.isElectron || false;

/**
 * Sidebar - Slack-inspired design
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
    <div
      className="slack-sidebar"
      style={{ width: '260px', minWidth: '260px' }}
    >
      {/* Workspace Header */}
      <div
        className="slack-workspace-header"
        style={{ paddingLeft: isMacElectron ? '80px' : '16px', WebkitAppRegion: 'drag' }}
      >
        <div className="slack-workspace-name" style={{ WebkitAppRegion: 'no-drag' }}>
          <span>Ascend</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {isLoading && <div className="slack-spinner" style={{ width: '14px', height: '14px', marginLeft: '8px' }} />}
        </div>
        <button
          onClick={onCollapse}
          className="slack-compose-btn"
          title="Collapse sidebar"
          style={{ WebkitAppRegion: 'no-drag', width: '28px', height: '28px' }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-slack">
        {/* Voice Assistant */}
        <div className="slack-section">
          <button
            onClick={onToggleAscendAssistant}
            className={`slack-item ${showAscendAssistant ? 'active' : ''}`}
            style={{ height: '32px', paddingLeft: '16px' }}
          >
            <div className="slack-item-icon">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <span className="slack-item-text">Voice Assistant</span>
            {showAscendAssistant && <div className="slack-status-dot" style={{ marginLeft: 'auto' }} />}
          </button>
        </div>

        <div className="slack-divider" style={{ margin: '8px 16px' }} />

        {/* Saved Designs Section */}
        <div className="slack-section">
          <div
            className="slack-section-header"
            onClick={() => setDesignsCollapsed(!designsCollapsed)}
          >
            <span className={`slack-section-title ${designsCollapsed ? 'collapsed' : ''}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Saved Designs
            </span>
            <span className="slack-badge" style={{ fontSize: '11px', padding: '0 6px' }}>
              {savedDesigns.length}
            </span>
          </div>

          {!designsCollapsed && (
            <div className="mt-1">
              {savedDesigns.length === 0 ? (
                <div className="slack-item" style={{ color: 'var(--sidebar-section-header)', cursor: 'default' }}>
                  <span className="slack-item-text" style={{ fontStyle: 'italic' }}>No saved designs</span>
                </div>
              ) : (
                <>
                  {savedDesigns.slice(0, 5).map((design) => (
                    <div
                      key={design.id}
                      className="slack-item group"
                      onClick={() => onLoadDesign(design.id)}
                    >
                      <div className="slack-item-icon">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="slack-item-text">{design.title || 'Untitled'}</span>
                      {onDeleteDesign && (
                        <button
                          onClick={(e) => handleDelete('design', design.id, e)}
                          className="opacity-0 group-hover:opacity-100 ml-auto"
                          style={{
                            color: deleteConfirmId === `design-${design.id}` ? 'var(--accent-red)' : 'var(--sidebar-text)',
                            fontSize: '14px',
                            padding: '2px 6px',
                          }}
                        >
                          {deleteConfirmId === `design-${design.id}` ? '?' : '×'}
                        </button>
                      )}
                    </div>
                  ))}
                  {savedDesigns.length > 5 && (
                    <button
                      onClick={onViewAllDesigns}
                      className="slack-item"
                      style={{ color: 'var(--text-link)' }}
                    >
                      <span className="slack-item-text">Show all ({savedDesigns.length})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Recent History Section */}
        <div className="slack-section">
          <div
            className="slack-section-header"
            onClick={() => setHistoryCollapsed(!historyCollapsed)}
          >
            <span className={`slack-section-title ${historyCollapsed ? 'collapsed' : ''}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Recent History
            </span>
            <span className="slack-badge" style={{ fontSize: '11px', padding: '0 6px' }}>
              {codingHistory.length}
            </span>
          </div>

          {!historyCollapsed && (
            <div className="mt-1">
              {codingHistory.length === 0 ? (
                <div className="slack-item" style={{ color: 'var(--sidebar-section-header)', cursor: 'default' }}>
                  <span className="slack-item-text" style={{ fontStyle: 'italic' }}>No history yet</span>
                </div>
              ) : (
                <>
                  {codingHistory.slice(0, 8).map((entry) => (
                    <div
                      key={entry.id}
                      className="slack-item group"
                      onClick={() => onLoadHistory(entry.id)}
                    >
                      <div className="slack-item-icon">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="slack-item-text">{entry.title || 'Untitled'}</span>
                      {onDeleteHistory && (
                        <button
                          onClick={(e) => handleDelete('history', entry.id, e)}
                          className="opacity-0 group-hover:opacity-100 ml-auto"
                          style={{
                            color: deleteConfirmId === `history-${entry.id}` ? 'var(--accent-red)' : 'var(--sidebar-text)',
                            fontSize: '14px',
                            padding: '2px 6px',
                          }}
                        >
                          {deleteConfirmId === `history-${entry.id}` ? '?' : '×'}
                        </button>
                      )}
                    </div>
                  ))}
                  {codingHistory.length > 8 && onViewAllHistory && (
                    <button
                      onClick={onViewAllHistory}
                      className="slack-item"
                      style={{ color: 'var(--text-link)' }}
                    >
                      <span className="slack-item-text">Show all ({codingHistory.length})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {/* Stealth Mode - Electron only */}
        {isElectron && (
          <button
            onClick={onToggleStealth}
            className={`slack-item ${stealthMode ? 'active' : ''}`}
            style={{ height: '36px', paddingLeft: '16px' }}
            title={stealthMode ? 'Stealth ON' : 'Stealth OFF'}
          >
            <div className="slack-item-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {stealthMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
            </div>
            <span className="slack-item-text">Stealth Mode</span>
            <span
              className="slack-badge"
              style={{
                marginLeft: 'auto',
                background: stealthMode ? 'var(--accent-green)' : 'transparent',
                color: stealthMode ? 'white' : 'var(--sidebar-text)',
              }}
            >
              {stealthMode ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="slack-item"
          style={{ height: '36px', paddingLeft: '16px' }}
        >
          <div className="slack-item-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="slack-item-text">Settings</span>
        </button>

        {/* User Section */}
        {authRequired && user && (
          <div className="slack-user-section">
            <div className="slack-avatar">
              {(user.name || user.username || 'U')[0].toUpperCase()}
              <div className="slack-avatar-status" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="slack-user-name truncate">{user.name || user.username || 'User'}</div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && onOpenAdminPanel && (
                <button
                  onClick={onOpenAdminPanel}
                  className="slack-btn-icon"
                  style={{ width: '28px', height: '28px', color: 'var(--sidebar-text)' }}
                  title="Admin"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onLogout}
                className="slack-btn-icon"
                style={{ width: '28px', height: '28px', color: 'var(--sidebar-text)' }}
                title="Sign out"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
