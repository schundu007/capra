export default function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-neutral-900">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-neutral-400">Loading...</span>
        </div>
      </div>
    </div>
  );
}
