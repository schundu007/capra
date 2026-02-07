import { useAppStore } from '../../store/appStore';

export function Header() {
  const { clearAll, isStreaming } = useAppStore();

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          {isStreaming && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text">
            Copra
          </h1>
        </div>
      </div>

      {/* Center Status */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-sm text-slate-400">
            {isStreaming ? 'Generating...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Keyboard Shortcut Hints */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700">⌘</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Enter</kbd>
          <span className="ml-1">to analyze</span>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-slate-700" />

        {/* Clear Button */}
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
    </header>
  );
}
