import { useState } from 'react';

// Check if running on macOS in Electron (needs extra padding for traffic lights)
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');
const isElectron = window.electronAPI?.isElectron || false;

/**
 * Sidebar component - Oracle Cloud Console-inspired light theme
 * with design-oriented background and integrated controls
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
  // Props for quick actions
  onOpenInterviewPrep,
  onOpenPlatforms,
  onOpenSettings,
  isLoading,
  // User management props
  user,
  isAdmin,
  authRequired,
  onLogout,
  onOpenAdminPanel,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Format relative time
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
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{
        width: '260px',
        minWidth: '260px',
        background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 50%, #f0f0f0 100%)',
        borderRight: '1px solid #e0e0e0',
        position: 'relative',
      }}
    >
      {/* Subtle pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      {/* Header - draggable area for macOS */}
      <div
        className="flex items-center justify-between py-3 relative z-10"
        style={{
          paddingLeft: isMacElectron ? '80px' : '16px',
          paddingRight: '12px',
          borderBottom: '1px solid #e0e0e0',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitAppRegion: 'drag'
        }}
      >
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <img
            src="/ascend-icon.png"
            alt="Ascend"
            className="w-7 h-7 object-contain"
          />
          <span className="font-semibold text-sm" style={{ color: '#333333' }}>Ascend</span>
          {isLoading && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          )}
        </div>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-md transition-colors"
          style={{
            color: '#999999',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#666666'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#999999'; }}
          title="Collapse sidebar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {/* Quick Actions Section */}
        <div className="px-3 py-4">
          <div className="flex items-center gap-2 px-2 mb-3">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: '#888888' }}
            >
              Quick Actions
            </span>
          </div>

          <div className="space-y-1">
            {/* Interview Prep */}
            <button
              onClick={onOpenInterviewPrep}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Interview Prep</span>
            </button>

            {/* Platforms */}
            <button
              onClick={onOpenPlatforms}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
              style={{
                background: 'rgba(0,0,0,0.02)',
                color: '#555555',
                border: '1px solid #e5e5e5',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#d0d0d0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-sm font-medium">Platforms</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '0 16px' }} />

        {/* Saved Designs Section */}
        <div className="px-3 py-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: '#888888' }}
            >
              Saved Designs ({savedDesigns.length})
            </span>
          </div>

          <div className="mt-1">
            {savedDesigns.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs rounded-lg" style={{ color: '#999999', background: 'rgba(0,0,0,0.02)' }}>
                No saved designs yet
              </div>
            ) : (
              <>
                <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                  {savedDesigns.slice(0, 5).map((design) => (
                    <div
                      key={design.id}
                      className="group flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
                      style={{ color: '#444444' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <button
                        onClick={() => onLoadDesign(design.id)}
                        className="flex-1 flex flex-col text-left min-w-0"
                      >
                        <div className="text-sm truncate group-hover:text-[#10b981]">
                          {design.title || 'Untitled Design'}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#999999' }}>
                          {formatRelativeTime(design.timestamp)}
                        </div>
                      </button>
                      {onDeleteDesign && (
                        <button
                          onClick={(e) => handleDelete('design', design.id, e)}
                          className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors flex-shrink-0"
                          style={{
                            background: deleteConfirmId === `design-${design.id}` ? '#fef2f2' : 'transparent',
                            color: deleteConfirmId === `design-${design.id}` ? '#ef4444' : '#999999',
                            border: deleteConfirmId === `design-${design.id}` ? '1px solid #fecaca' : '1px solid transparent',
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
                    style={{ color: '#10b981' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.05)'; }}
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
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '0 16px' }} />

        {/* Recent History Section */}
        <div className="px-3 py-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: '#888888' }}
            >
              Recent ({codingHistory.length})
            </span>
          </div>

          <div className="mt-1">
            {codingHistory.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs rounded-lg" style={{ color: '#999999', background: 'rgba(0,0,0,0.02)' }}>
                No history yet
              </div>
            ) : (
              <>
                <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                  {codingHistory.slice(0, 8).map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
                      style={{ color: '#444444' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <button
                        onClick={() => onLoadHistory(entry.id)}
                        className="flex-1 flex flex-col text-left min-w-0"
                      >
                        <div className="text-sm truncate group-hover:text-[#10b981]">
                          {entry.title || 'Untitled Problem'}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: '#999999' }}>
                          <span
                            className="px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(0,0,0,0.05)', color: '#666666' }}
                          >
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
                            background: deleteConfirmId === `history-${entry.id}` ? '#fef2f2' : 'transparent',
                            color: deleteConfirmId === `history-${entry.id}` ? '#ef4444' : '#999999',
                            border: deleteConfirmId === `history-${entry.id}` ? '1px solid #fecaca' : '1px solid transparent',
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
                    style={{ color: '#10b981' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.05)'; }}
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
        className="relative z-10 px-3 py-3 space-y-2"
        style={{
          borderTop: '1px solid #e0e0e0',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* User Section (for webapp with auth) */}
        {authRequired && user && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            {/* User Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: '#10b981' }}
            >
              {(user.name || user.username || 'U')[0].toUpperCase()}
            </div>
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#333333' }}>
                {user.name || user.username || 'User'}
              </div>
              {user.email && (
                <div className="text-xs truncate" style={{ color: '#888888' }}>
                  {user.email}
                </div>
              )}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isAdmin && onOpenAdminPanel && (
                <button
                  onClick={onOpenAdminPanel}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: '#888888' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#666666'; }}
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
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
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

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
          style={{
            background: 'rgba(0,0,0,0.02)',
            color: '#555555',
            border: '1px solid #e5e5e5',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#d0d0d0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
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
