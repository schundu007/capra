import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getApiUrl } from '../../hooks/useElectron.js';

const API_URL = getApiUrl();

export default function PricingPlans({ isOpen, onClose }) {
  const { getAccessToken, subscription } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Per credit allowances
  const PER_CREDIT = {
    codingProblems: 5,
    systemDesigns: 2,
    companyPreps: 1,
    interviewMinutes: 30,
  };

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$99',
      period: '/mo',
      credits: 5,
      popular: false,
    },
    {
      id: 'quarterly_pro',
      name: 'Quarterly Pro',
      price: '$300',
      period: '/qtr',
      credits: 10,
      popular: true,
      features: ['Job Discovery', 'jobs.cariara.com access'],
    },
    {
      id: 'desktop_lifetime',
      name: 'Desktop App',
      price: '$300',
      period: 'one-time',
      credits: 0,
      popular: false,
      isDesktop: true,
      desktopFeatures: ['Lifetime access', 'Use your own API keys', 'Unlimited usage', 'No credits needed'],
    },
  ].map(plan => ({
    ...plan,
    codingProblems: plan.credits * PER_CREDIT.codingProblems,
    systemDesigns: plan.credits * PER_CREDIT.systemDesigns,
    companyPreps: plan.credits * PER_CREDIT.companyPreps,
    interviewHours: Math.round((plan.credits * PER_CREDIT.interviewMinutes) / 60 * 10) / 10,
  }));

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    setError('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in first');
      const pricesRes = await fetch(`${API_URL}/api/billing/prices`);
      const prices = await pricesRes.json();
      const priceId = prices[planId]?.priceId;
      if (!priceId) throw new Error('Invalid plan');
      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}?checkout=success&plan=${planId}`,
          cancelUrl: `${window.location.origin}?checkout=canceled`,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create checkout');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  const handleBuyCredits = async () => {
    setLoading('addon');
    setError('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in first');
      const pricesRes = await fetch(`${API_URL}/api/billing/prices`);
      const prices = await pricesRes.json();
      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          priceId: prices.addon.priceId,
          successUrl: `${window.location.origin}?checkout=success&plan=addon`,
          cancelUrl: `${window.location.origin}?checkout=canceled`,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create checkout');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('portal');
    setError('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in first');
      const res = await fetch(`${API_URL}/api/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to open portal');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  const hasActiveSubscription = subscription?.plan_type !== 'free' && subscription?.status === 'active';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl"
        style={{ background: '#ffffff', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)', border: '1px solid #e5e5e5' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg transition-all z-10"
          style={{ color: '#666', background: '#f5f5f5' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e5e5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: '#10b981' }}>
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
            <h2 className="text-xl font-bold" style={{ color: '#000' }}>Crack Interview with Pro Plans</h2>
          </div>

          {/* Active Subscription */}
          {hasActiveSubscription && (
            <div className="mb-5 p-4 rounded-lg flex items-center justify-between" style={{ background: '#f0fdf4', border: '1px solid #10b981' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
                  <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: '#059669' }}>Active {subscription.plan_type}</p>
                  <p className="text-xs" style={{ color: '#666' }}>
                    {subscription.cancel_at_period_end ? 'Cancels at period end' : `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={loading === 'portal'}
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: '#fff', color: '#000', border: '1px solid #e5e5e5' }}
              >
                {loading === 'portal' ? '...' : 'Manage'}
              </button>
            </div>
          )}

          {/* Plans */}
          {!hasActiveSubscription && (
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative rounded-lg p-5"
                  style={{
                    background: plan.popular ? '#fafafa' : plan.isDesktop ? '#fff7ed' : '#fff',
                    border: plan.popular ? '2px solid #10b981' : plan.isDesktop ? '2px solid #f97316' : '1px solid #e5e5e5',
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#10b981', color: 'white' }}>
                      POPULAR
                    </div>
                  )}
                  {plan.isDesktop && (
                    <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#f97316', color: 'white' }}>
                      LIFETIME
                    </div>
                  )}

                  <h3 className="font-bold mb-2" style={{ color: '#000' }}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold" style={{ color: '#000' }}>{plan.price}</span>
                    <span className="text-sm" style={{ color: '#666' }}>{plan.period}</span>
                  </div>

                  {!plan.isDesktop && (
                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ background: '#f0fdf4' }}>
                      <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium" style={{ color: '#059669' }}>{plan.credits} credits</span>
                    </div>
                  )}

                  {plan.isDesktop && (
                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ background: '#fff7ed' }}>
                      <svg className="w-4 h-4" style={{ color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium" style={{ color: '#ea580c' }}>Desktop App</span>
                    </div>
                  )}

                  {/* Features list */}
                  <div className="space-y-2 mb-4 text-sm" style={{ color: '#333' }}>
                    {plan.isDesktop ? (
                      plan.desktopFeatures.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{plan.codingProblems} coding problems</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{plan.systemDesigns} system designs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{plan.companyPreps} company prep{plan.companyPreps > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{plan.interviewHours} hrs interview session</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                    className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                    style={{
                      background: plan.popular ? '#10b981' : plan.isDesktop ? '#f97316' : '#fff',
                      color: plan.popular || plan.isDesktop ? '#fff' : '#000',
                      border: plan.popular || plan.isDesktop ? 'none' : '1px solid #e5e5e5',
                    }}
                  >
                    {loading === plan.id ? 'Processing...' : plan.isDesktop ? 'Buy Now' : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add-on */}
          <div className="p-4 rounded-lg" style={{ background: '#fafafa', border: '1px solid #e5e5e5' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#dbeafe' }}>
                  <svg className="w-5 h-5" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: '#000' }}>Need More Credits?</p>
                  <p className="text-xs" style={{ color: '#666' }}>3 credits one-time</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold" style={{ color: '#000' }}>$30</span>
                <button
                  onClick={handleBuyCredits}
                  disabled={loading !== null}
                  className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
                  style={{ background: '#3b82f6', color: 'white' }}
                >
                  {loading === 'addon' ? '...' : 'Buy'}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: '#666' }}>
              <span>15 coding</span>
              <span>6 system design</span>
              <span>3 company preps</span>
              <span>1.5 hrs interview</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <svg className="w-4 h-4" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {/* Note */}
          <p className="mt-4 text-center text-xs" style={{ color: '#999' }}>
            1 credit = 5 coding problems + 2 system designs + 1 company prep + 30 min interview
          </p>
        </div>
      </div>
    </div>
  );
}
