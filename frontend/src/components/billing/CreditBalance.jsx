import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Credit Balance Indicator Component
 */
export default function CreditBalance({ onUpgrade, compact = false }) {
  const { credits, subscription, isAuthenticated, useSupabaseAuth } = useAuth();

  // Don't show for Electron users or if not using Supabase auth
  if (!useSupabaseAuth || !isAuthenticated) {
    return null;
  }

  const balance = credits?.balance ?? 0;
  const freeTierAvailable = credits?.free_tier_available ?? true;
  const planType = subscription?.plan_type ?? 'free';

  if (compact) {
    return (
      <button
        onClick={onUpgrade}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
        style={{
          background: balance > 0 || freeTierAvailable ? '#1a3d2e' : '#3d1f1f',
          border: balance > 0 || freeTierAvailable ? '1px solid #166534' : '1px solid #7f1d1d',
        }}
        title={freeTierAvailable ? 'First company free' : `${balance} credits remaining`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span
          className="text-sm font-medium"
          style={{ color: balance > 0 || freeTierAvailable ? '#4ade80' : '#ef4444' }}
        >
          {freeTierAvailable ? 'Free' : balance}
        </span>
      </button>
    );
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: '#242424', border: '1px solid #333333' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Credits</h3>
        {planType !== 'free' && (
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: '#166534', color: '#4ade80' }}
          >
            {planType}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div
          className="flex-1 p-3 rounded-lg text-center"
          style={{ background: '#1a1a1a' }}
        >
          <div className="text-2xl font-bold text-white">{balance}</div>
          <div className="text-xs text-gray-500">Available</div>
        </div>

        {freeTierAvailable && (
          <div
            className="flex-1 p-3 rounded-lg text-center"
            style={{ background: '#1a3d2e', border: '1px solid #166534' }}
          >
            <div className="text-lg font-bold text-emerald-400">FREE</div>
            <div className="text-xs text-emerald-400/70">First company</div>
          </div>
        )}
      </div>

      {balance === 0 && !freeTierAvailable && (
        <div
          className="p-3 rounded-lg mb-3 text-center"
          style={{ background: '#3d1f1f', border: '1px solid #7f1d1d' }}
        >
          <p className="text-sm text-red-400">No credits remaining</p>
        </div>
      )}

      <button
        onClick={onUpgrade}
        className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ background: '#10b981', color: '#ffffff' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#10b981'; }}
      >
        {balance === 0 && !freeTierAvailable ? 'Get Credits' : 'Manage Plan'}
      </button>

      {/* Usage stats */}
      {credits && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Lifetime earned: {credits.lifetime_earned}</span>
            <span>Used: {credits.lifetime_used}</span>
          </div>
        </div>
      )}
    </div>
  );
}
