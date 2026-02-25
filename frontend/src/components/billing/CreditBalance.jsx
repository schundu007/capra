import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Credit Balance Indicator - Modern Design System
 */
export default function CreditBalance({ onUpgrade, compact = false }) {
  const { credits, subscription, isAuthenticated, isWebApp } = useAuth();

  // Don't show for Electron users or if not authenticated
  if (!isWebApp || !isAuthenticated) {
    return null;
  }

  const balance = credits?.balance ?? 0;
  const planType = subscription?.plan_type ?? 'free';

  if (compact) {
    return (
      <button
        onClick={onUpgrade}
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all group"
        style={{
          background: balance > 0
            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
          border: balance > 0
            ? '1px solid rgba(124, 58, 237, 0.4)'
            : '1px solid rgba(239, 68, 68, 0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = balance > 0
            ? '0 4px 12px rgba(124, 58, 237, 0.3)'
            : '0 4px 12px rgba(239, 68, 68, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        title={`${balance} credits remaining`}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{
            background: balance > 0
              ? 'rgba(124, 58, 237, 0.3)'
              : 'rgba(239, 68, 68, 0.3)'
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke={balance > 0 ? 'var(--brand-primary-light)' : 'var(--accent-error-light)'}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col items-start">
          <span
            className="text-sm font-bold leading-tight"
            style={{ color: balance > 0 ? 'var(--brand-primary-light)' : 'var(--accent-error-light)' }}
          >
            {balance} Credits
          </span>
          <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
            {balance === 0 ? 'Get more' : 'Available'}
          </span>
        </div>
        <svg
          className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--text-muted)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(124, 58, 237, 0.2)' }}
          >
            <svg className="w-4 h-4" style={{ color: 'var(--brand-primary-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Credits</h3>
        </div>
        {planType !== 'free' && (
          <span className="badge badge-primary text-[10px]">
            {planType.toUpperCase()}
          </span>
        )}
      </div>

      <div
        className="p-4 rounded-xl text-center mb-4"
        style={{
          background: balance > 0
            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
          border: balance > 0
            ? '1px solid rgba(124, 58, 237, 0.2)'
            : '1px solid rgba(239, 68, 68, 0.2)'
        }}
      >
        <div
          className="text-4xl font-bold mb-1"
          style={{ color: balance > 0 ? 'var(--brand-primary-light)' : 'var(--accent-error-light)' }}
        >
          {balance}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Available Credits</div>
      </div>

      {balance === 0 && (
        <div
          className="p-3 rounded-xl mb-4 flex items-center gap-2 justify-center"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <svg className="w-4 h-4" style={{ color: 'var(--accent-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--accent-error-light)' }}>No credits remaining</p>
        </div>
      )}

      <button
        onClick={onUpgrade}
        className="btn-primary w-full py-3"
      >
        {balance === 0 ? 'Get Credits' : 'Manage Plan'}
      </button>

      {/* Usage stats */}
      {credits && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Earned: {credits.lifetime_earned}</span>
            <span>Used: {credits.lifetime_used}</span>
          </div>
        </div>
      )}
    </div>
  );
}
