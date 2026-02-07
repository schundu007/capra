export default function LoadingOverlay({ message = 'Processing...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Dual spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-amber-600/30 border-b-amber-600 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-lg font-medium text-slate-100 animate-pulse-subtle">
            {message}
          </p>
        </div>

        {/* Shimmer progress bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full shimmer-bg rounded-full" />
        </div>
      </div>
    </div>
  );
}
