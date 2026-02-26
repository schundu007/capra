import { useState } from 'react';
import { Icon } from './Icons';

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
          <Icon name="chevronDown" size={16} />
          {isLoading && <div className="slack-spinner" style={{ width: '14px', height: '14px', marginLeft: '8px' }} />}
        </div>
        <button
          onClick={onCollapse}
          className="slack-compose-btn"
          title="Collapse sidebar"
          style={{ WebkitAppRegion: 'no-drag', width: '28px', height: '28px' }}
        >
          <Icon name="chevronsLeft" size={14} />
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
              <Icon name="microphone" size={18} />
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
              <Icon name="chevronDown" size={14} />
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
                        <Icon name="document" size={16} />
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
              <Icon name="chevronDown" size={14} />
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
                        <Icon name="clock" size={16} />
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
              <Icon name={stealthMode ? 'eyeOff' : 'eye'} size={18} />
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
            <Icon name="settings" size={18} />
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
                  <Icon name="users" size={14} />
                </button>
              )}
              <button
                onClick={onLogout}
                className="slack-btn-icon"
                style={{ width: '28px', height: '28px', color: 'var(--sidebar-text)' }}
                title="Sign out"
              >
                <Icon name="logout" size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
