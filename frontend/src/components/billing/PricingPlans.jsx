import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getApiUrl } from '../../hooks/useElectron.js';

const API_URL = getApiUrl();

/**
 * Pricing Plans Modal - Light Theme Design
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
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e5e5'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-all z-10"
          style={{ color: '#666666', background: '#f5f5f5' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e5e5';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f5f5f5';
            e.currentTarget.style.color = '#666666';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#10b981' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>
              Upgrade Your Interview Prep
            </h2>
            <p style={{ color: '#666666' }}>
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
                background: '#f0fdf4',
                border: '1px solid #10b981'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#dcfce7' }}>
                    <svg className="w-6 h-6" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#059669' }}>
                      Active {subscription.plan_type} subscription
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {subscription.cancel_at_period_end
                        ? 'Cancels at end of period'
                        : `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === 'portal'}
                  className="px-5 py-2.5 rounded-lg font-medium transition-all"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid #e5e5e5'
                  }}
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
                  className="relative rounded-xl p-6 transition-all hover:shadow-lg"
                  style={{
                    background: plan.popular ? '#fafafa' : '#ffffff',
                    border: plan.popular ? '2px solid #10b981' : '1px solid #e5e5e5',
                  }}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#10b981', color: 'white' }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  {plan.savings && (
                    <div
                      className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#f59e0b', color: 'white' }}
                    >
                      {plan.savings}
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-3" style={{ color: '#000000' }}>{plan.name}</h3>

                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-4xl font-bold" style={{ color: '#000000' }}>{plan.price}</span>
                    <span style={{ color: '#666666' }}>{plan.period}</span>
                  </div>

                  <div
                    className="mb-5 p-4 rounded-lg flex items-center gap-3"
                    style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
                      <svg className="w-5 h-5" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-semibold" style={{ color: '#059669' }}>{plan.credits} credits included</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3" style={{ color: '#333333' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f0fdf4' }}>
                          <svg className="w-3 h-3" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: plan.popular ? '#10b981' : '#ffffff',
                      color: plan.popular ? '#ffffff' : '#000000',
                      border: plan.popular ? 'none' : '1px solid #e5e5e5',
                    }}
                    onMouseEnter={(e) => {
                      if (plan.popular) {
                        e.currentTarget.style.background = '#059669';
                      } else {
                        e.currentTarget.style.background = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.popular) {
                        e.currentTarget.style.background = '#10b981';
                      } else {
                        e.currentTarget.style.background = '#ffffff';
                      }
                    }}
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
            className="rounded-xl p-6"
            style={{ background: '#fafafa', border: '1px solid #e5e5e5' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe' }}>
                  <svg className="w-6 h-6" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#000000' }}>Need More Credits?</h3>
                  <p style={{ color: '#666666' }}>Add 5 credits to your account for one-time use</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-3xl font-bold" style={{ color: '#000000' }}>$50</span>
                <button
                  onClick={handleBuyCredits}
                  disabled={loading !== null}
                  className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
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
              className="mt-6 p-4 rounded-lg flex items-start gap-3"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca'
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {/* Pricing note */}
          <p className="mt-6 text-center text-sm" style={{ color: '#666666' }}>
            Each credit allows you to prepare for one company interview.
          </p>
        </div>
      </div>
    </div>
  );
}
