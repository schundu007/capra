import { useState } from 'react';
import { Icon } from './Icons';

// Check if running on macOS in Electron
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');
const isElectron = window.electronAPI?.isElectron || false;

/**
 * Sidebar - Enterprise premium design
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

  // Theme-based styles
  const isLight = theme === 'light';

  const containerStyle = {
    width: '260px',
    minWidth: '260px',
    ...(isLight && {
      background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
      color: '#1a1a1a',
      borderRight: '1px solid #e5e7eb',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
    }),
  };

  const headerStyle = {
    paddingLeft: isMacElectron ? '80px' : '16px',
    WebkitAppRegion: 'drag',
    ...(isLight && {
      background: 'transparent',
      borderBottom: '1px solid #e5e7eb',
    }),
  };

  const itemStyle = isLight ? { color: 'rgba(0, 0, 0, 0.7)' } : {};
  const sectionTitleStyle = isLight ? { color: 'rgba(0, 0, 0, 0.5)' } : {};
  const badgeStyle = isLight ? { color: 'rgba(0, 0, 0, 0.6)', background: 'rgba(0, 0, 0, 0.06)' } : {};

  return (
    <div
      className={`sidebar-enterprise ${isLight ? 'sidebar-light' : ''}`}
      style={containerStyle}
    >
      {/* Header with Logo */}
      <div
        className="sidebar-header"
        style={headerStyle}
      >
        <button
          onClick={onCollapse}
          className="sidebar-logo"
          title="Collapse sidebar"
          style={{ WebkitAppRegion: 'no-drag', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div className="sidebar-logo-mark">
            <img
              src="/ascend-logo.png"
              alt="Ascend"
              className="h-4 w-auto object-contain filter brightness-0 invert"
            />
          </div>
          <span className="sidebar-logo-text" style={isLight ? { color: '#1a1a1a' } : {}}>Ascend</span>
          {isLoading && (
            <div className="w-4 h-4 border-2 rounded-full animate-spin ml-2" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-slack py-2">
        {/* Voice Assistant */}
        <div className="sidebar-section" style={{ padding: '8px 0' }}>
          <button
            onClick={onToggleAscendAssistant}
            className={`sidebar-item ${showAscendAssistant ? 'active' : ''}`}
            style={!showAscendAssistant ? itemStyle : {}}
          >
            <div className="sidebar-item-icon">
              <Icon name="microphone" size={18} />
            </div>
            <span className="sidebar-item-text">Voice Assistant</span>
            {showAscendAssistant && <div className="sidebar-status-dot" />}
          </button>
        </div>

        <div className="sidebar-divider" style={isLight ? { background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 50%, transparent 100%)' } : {}} />

        {/* Saved Designs Section */}
        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => setDesignsCollapsed(!designsCollapsed)}
          >
            <span className={`sidebar-section-title ${designsCollapsed ? 'collapsed' : ''}`} style={sectionTitleStyle}>
              <Icon name="chevronDown" size={12} />
              Saved Designs
            </span>
            <span className="sidebar-section-badge" style={badgeStyle}>
              {savedDesigns.length}
            </span>
          </div>

          {!designsCollapsed && (
            <div className="mt-1">
              {savedDesigns.length === 0 ? (
                <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.5 }}>
                  <span className="sidebar-item-text" style={{ fontStyle: 'italic' }}>No saved designs</span>
                </div>
              ) : (
                <>
                  {savedDesigns.slice(0, 5).map((design) => (
                    <button
                      key={design.id}
                      className="sidebar-item group"
                      onClick={() => onLoadDesign(design.id)}
                    >
                      <div className="sidebar-item-icon">
                        <Icon name="document" size={16} />
                      </div>
                      <span className="sidebar-item-text">{design.title || 'Untitled'}</span>
                      {onDeleteDesign && (
                        <span
                          onClick={(e) => handleDelete('design', design.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            color: deleteConfirmId === `design-${design.id}` ? '#ef4444' : 'rgba(255,255,255,0.5)',
                            fontSize: '14px',
                            padding: '2px 6px',
                            cursor: 'pointer',
                          }}
                        >
                          {deleteConfirmId === `design-${design.id}` ? '?' : '×'}
                        </span>
                      )}
                    </button>
                  ))}
                  {savedDesigns.length > 5 && (
                    <button
                      onClick={onViewAllDesigns}
                      className="sidebar-item"
                      style={{ color: '#3b82f6' }}
                    >
                      <span className="sidebar-item-text">Show all ({savedDesigns.length})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Recent History Section */}
        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => setHistoryCollapsed(!historyCollapsed)}
          >
            <span className={`sidebar-section-title ${historyCollapsed ? 'collapsed' : ''}`} style={sectionTitleStyle}>
              <Icon name="chevronDown" size={12} />
              Recent History
            </span>
            <span className="sidebar-section-badge" style={badgeStyle}>
              {codingHistory.length}
            </span>
          </div>

          {!historyCollapsed && (
            <div className="mt-1">
              {codingHistory.length === 0 ? (
                <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.5 }}>
                  <span className="sidebar-item-text" style={{ fontStyle: 'italic' }}>No history yet</span>
                </div>
              ) : (
                <>
                  {codingHistory.slice(0, 8).map((entry) => (
                    <button
                      key={entry.id}
                      className="sidebar-item group"
                      onClick={() => onLoadHistory(entry.id)}
                    >
                      <div className="sidebar-item-icon">
                        <Icon name="clock" size={16} />
                      </div>
                      <span className="sidebar-item-text">{entry.title || 'Untitled'}</span>
                      {onDeleteHistory && (
                        <span
                          onClick={(e) => handleDelete('history', entry.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            color: deleteConfirmId === `history-${entry.id}` ? '#ef4444' : 'rgba(255,255,255,0.5)',
                            fontSize: '14px',
                            padding: '2px 6px',
                            cursor: 'pointer',
                          }}
                        >
                          {deleteConfirmId === `history-${entry.id}` ? '?' : '×'}
                        </span>
                      )}
                    </button>
                  ))}
                  {codingHistory.length > 8 && onViewAllHistory && (
                    <button
                      onClick={onViewAllHistory}
                      className="sidebar-item"
                      style={{ color: '#3b82f6' }}
                    >
                      <span className="sidebar-item-text">Show all ({codingHistory.length})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="sidebar-footer" style={isLight ? { borderTop: '1px solid #e5e7eb', background: 'transparent' } : {}}>
        {/* Stealth Mode - Electron only */}
        {isElectron && (
          <div
            onClick={onToggleStealth}
            className={`sidebar-item ${stealthMode ? 'active' : ''}`}
            title={stealthMode ? 'Stealth ON - Click to disable' : 'Stealth OFF - Click to enable'}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onToggleStealth()}
            style={!stealthMode ? itemStyle : {}}
          >
            <div className="sidebar-item-icon">
              <Icon name={stealthMode ? 'eyeOff' : 'eye'} size={18} />
            </div>
            <span className="sidebar-item-text">Stealth Mode</span>
            <button
              className={`sidebar-toggle ${stealthMode ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleStealth(); }}
              style={isLight && !stealthMode ? { background: 'rgba(0, 0, 0, 0.1)' } : {}}
            >
              <div className="sidebar-toggle-knob" />
            </button>
          </div>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="sidebar-item"
          style={itemStyle}
        >
          <div className="sidebar-item-icon">
            <Icon name="settings" size={18} />
          </div>
          <span className="sidebar-item-text">Settings</span>
        </button>

        {/* User Section */}
        {authRequired && user && (
          <div className="sidebar-user mt-2">
            <div className="sidebar-avatar">
              {(user.name || user.username || 'U')[0].toUpperCase()}
              <div className="sidebar-avatar-status" />
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name || user.username || 'User'}</div>
            </div>
            <div className="sidebar-user-actions">
              {isAdmin && onOpenAdminPanel && (
                <button
                  onClick={onOpenAdminPanel}
                  className="sidebar-action-btn"
                  title="Admin"
                >
                  <Icon name="users" size={14} />
                </button>
              )}
              <button
                onClick={onLogout}
                className="sidebar-action-btn"
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
