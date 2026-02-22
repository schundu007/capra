import { useState } from 'react';

// Check if running on macOS in Electron (needs extra padding for traffic lights)
const isMacElectron = window.electronAPI?.isElectron && navigator.platform.toLowerCase().includes('mac');

/**
 * Sidebar component for Electron desktop app
 * Oracle Cloud Console-inspired light theme with dashed border active states
 */
export default function Sidebar({
  interviewMode,
  onModeChange,
  savedDesigns = [],
  codingHistory = [],
  onLoadDesign,
  onLoadHistory,
  onDeleteDesign,
  onDeleteHistory,
  onCollapse,
  onViewAllDesigns,
  onViewAllHistory,
}) {
  const [expandedSection, setExpandedSection] = useState('modes'); // 'modes' | 'designs' | 'history'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const modes = [
    { id: 'coding', label: 'Coding' },
    { id: 'system-design', label: 'System Design' },
    { id: 'behavioral', label: 'Behavioral' },
  ];

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
        width: '240px',
        minWidth: '240px',
        background: '#ffffff',
        borderRight: '1px solid #e5e5e5',
      }}
    >
      {/* Header - draggable area for macOS */}
      <div
        className="flex items-center justify-between py-3"
        style={{
          paddingLeft: isMacElectron ? '80px' : '16px',
          paddingRight: '16px',
          borderBottom: '1px solid #e5e5e5',
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
        </div>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-md transition-colors"
          style={{
            color: '#999999',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#666666'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#999999'; }}
          title="Collapse sidebar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Modes Section */}
      <div className="px-2 py-3">
        <div
          className="flex items-center justify-between px-2 py-1.5 cursor-pointer"
          onClick={() => setExpandedSection(expandedSection === 'modes' ? null : 'modes')}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: '#666666' }}
          >
            Modes
          </span>
          <svg
            className={`w-3 h-3 transition-transform ${expandedSection === 'modes' ? 'rotate-180' : ''}`}
            style={{ color: '#999999' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expandedSection === 'modes' && (
          <div className="mt-2 space-y-1">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-md text-left transition-all"
                style={{
                  background: 'transparent',
                  color: '#333333',
                  border: interviewMode === mode.id ? '1px dashed #10b981' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (interviewMode !== mode.id) {
                    e.currentTarget.style.background = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span className="text-sm font-medium">{mode.label}</span>
                {interviewMode === mode.id && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #e5e5e5', margin: '0 12px' }} />

      {/* Saved Designs Section */}
      <div className="px-2 py-3">
        <div
          className="flex items-center justify-between px-2 py-1.5 cursor-pointer"
          onClick={() => setExpandedSection(expandedSection === 'designs' ? null : 'designs')}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: '#666666' }}
          >
            Saved Designs ({savedDesigns.length})
          </span>
          <svg
            className={`w-3 h-3 transition-transform ${expandedSection === 'designs' ? 'rotate-180' : ''}`}
            style={{ color: '#999999' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expandedSection === 'designs' && (
          <div className="mt-1">
            {savedDesigns.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs" style={{ color: '#999999' }}>
                No saved designs yet
              </div>
            ) : (
              <>
                <div className="space-y-1 max-h-48 overflow-y-auto mt-2 scrollbar-thin">
                  {savedDesigns.slice(0, 5).map((design) => (
                    <div
                      key={design.id}
                      className="group flex items-center justify-between px-3 py-2 rounded-md transition-colors"
                      style={{ color: '#333333' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
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
                    className="w-full px-4 py-2 text-sm text-left flex items-center gap-1 transition-colors"
                    style={{ color: '#10b981' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#059669'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#10b981'; }}
                  >
                    View All
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #e5e5e5', margin: '0 12px' }} />

      {/* Recent History Section */}
      <div className="px-2 py-3 flex-1 min-h-0 flex flex-col">
        <div
          className="flex items-center justify-between px-2 py-1.5 cursor-pointer flex-shrink-0"
          onClick={() => setExpandedSection(expandedSection === 'history' ? null : 'history')}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: '#666666' }}
          >
            Recent ({codingHistory.length})
          </span>
          <svg
            className={`w-3 h-3 transition-transform ${expandedSection === 'history' ? 'rotate-180' : ''}`}
            style={{ color: '#999999' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expandedSection === 'history' && (
          <div className="mt-1 flex-1 min-h-0 flex flex-col">
            {codingHistory.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs" style={{ color: '#999999' }}>
                No history yet
              </div>
            ) : (
              <>
                <div className="space-y-1 flex-1 overflow-y-auto mt-2 scrollbar-thin">
                  {codingHistory.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between px-3 py-2 rounded-md transition-colors"
                      style={{ color: '#333333' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
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
                            style={{ background: '#f5f5f5', color: '#666666' }}
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
                {codingHistory.length > 10 && (
                  <button
                    onClick={onViewAllHistory}
                    className="flex-shrink-0 w-full px-4 py-2 text-sm text-left flex items-center gap-1 transition-colors"
                    style={{ color: '#10b981' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#059669'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#10b981'; }}
                  >
                    View All
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
