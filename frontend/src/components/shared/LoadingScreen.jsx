export default function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: '#10b981' }}
        >
          <img
            src="/ascend-logo.png"
            alt="Ascend"
            className="h-7 w-auto object-contain filter brightness-0 invert"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 tracking-tight">Ascend</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-400">Loading</span>
          </div>
        </div>
      </div>
    </div>
  );
}
