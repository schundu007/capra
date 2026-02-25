import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getApiUrl } from '../../hooks/useElectron.js';

const API_URL = getApiUrl();

/**
 * Pricing Plans Modal - Modern Design System
 */
export default function PricingPlans({ isOpen, onClose }) {
  const { getAccessToken, subscription, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$99',
      period: '/month',
      credits: 5,
      features: [
        '5 company preps per month',
        'AI-powered interview questions',
        'Personalized preparation content',
        'Progress tracking',
      ],
      popular: true,
      gradient: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
      borderColor: 'rgba(124, 58, 237, 0.5)',
      accentColor: 'var(--brand-primary-light)',
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: '$200',
      period: '/quarter',
      credits: 5,
      savings: 'Save $97',
      features: [
        '5 company preps per quarter',
        'AI-powered interview questions',
        'Personalized preparation content',
        'Progress tracking',
        'Priority support',
      ],
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)',
      borderColor: 'rgba(6, 182, 212, 0.5)',
      accentColor: 'var(--accent-teal-light)',
    },
  ];

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    setError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in first');
      }

      const pricesRes = await fetch(`${API_URL}/api/billing/prices`);
      const prices = await pricesRes.json();

      const priceId = planId === 'monthly' ? prices.monthly.priceId : prices.quarterly.priceId;

      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}?checkout=success`,
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
      if (!token) {
        throw new Error('Please sign in first');
      }

      const pricesRes = await fetch(`${API_URL}/api/billing/prices`);
      const prices = await pricesRes.json();

      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: prices.addon.priceId,
          successUrl: `${window.location.origin}?checkout=success`,
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
      if (!token) {
        throw new Error('Please sign in first');
      }

      const res = await fetch(`${API_URL}/api/billing/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
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
      style={{ background: 'rgba(15, 15, 20, 0.95)', backdropFilter: 'blur(8px)' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-30" />

      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scale-in glass-card scrollbar-thin"
        style={{ boxShadow: 'var(--shadow-lg), var(--shadow-glow-purple)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl transition-all z-10"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-glow-purple)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="gradient-text">Upgrade Your Interview Prep</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {hasActiveSubscription
                ? `You're on the ${subscription.plan_type} plan`
                : 'Choose a plan to unlock your full potential'}
            </p>
          </div>

          {/* Current subscription management */}
          {hasActiveSubscription && (
            <div
              className="mb-8 p-5 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.3)' }}>
                    <svg className="w-6 h-6" style={{ color: 'var(--accent-success-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--accent-success-light)' }}>
                      Active {subscription.plan_type} subscription
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {subscription.cancel_at_period_end
                        ? 'Cancels at end of period'
                        : `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === 'portal'}
                  className="btn-secondary px-5 py-2.5"
                >
                  {loading === 'portal' ? 'Loading...' : 'Manage Subscription'}
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          {!hasActiveSubscription && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: plan.gradient,
                    border: `1px solid ${plan.borderColor}`,
                  }}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: 'var(--brand-gradient)', color: 'white', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)' }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  {plan.savings && (
                    <div
                      className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'var(--accent-teal)', color: 'white' }}
                    >
                      {plan.savings}
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>

                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                  </div>

                  <div
                    className="mb-5 p-4 rounded-xl flex items-center gap-3"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                      <svg className="w-5 h-5" style={{ color: plan.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-semibold" style={{ color: plan.accentColor }}>{plan.credits} credits included</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                          <svg className="w-3 h-3" style={{ color: plan.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                    className={`w-full py-4 rounded-xl font-bold transition-all disabled:opacity-50 ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {loading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Credit Add-on */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                  <svg className="w-7 h-7" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Need More Credits?</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Add 5 credits to your account for one-time use</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>$50</span>
                <button
                  onClick={handleBuyCredits}
                  disabled={loading !== null}
                  className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  {loading === 'addon' ? 'Processing...' : 'Buy Credits'}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mt-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="var(--accent-error)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--accent-error-light)' }}>{error}</p>
            </div>
          )}

          {/* Pricing note */}
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Each credit allows you to prepare for one company interview.
          </p>
        </div>
      </div>
    </div>
  );
}
