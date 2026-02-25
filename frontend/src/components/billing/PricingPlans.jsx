import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getApiUrl } from '../../hooks/useElectron.js';

const API_URL = getApiUrl();

/**
 * Pricing Plans Modal Component
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

      // Get prices
      const pricesRes = await fetch(`${API_URL}/api/billing/prices`);
      const prices = await pricesRes.json();

      const priceId = planId === 'monthly' ? prices.monthly.priceId : prices.quarterly.priceId;

      // Create checkout session
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl"
        style={{ background: '#1a1a1a', border: '1px solid #333333' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
          style={{ color: '#888888' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333333'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade Your Interview Prep</h2>
            <p className="text-gray-400">
              {hasActiveSubscription
                ? `You're on the ${subscription.plan_type} plan`
                : 'Choose a plan to unlock unlimited potential'}
            </p>
          </div>

          {/* Current subscription management */}
          {hasActiveSubscription && (
            <div className="mb-8 p-4 rounded-lg" style={{ background: '#1a3d2e', border: '1px solid #166534' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 font-medium">Active {subscription.plan_type} subscription</p>
                  <p className="text-sm text-gray-400">
                    {subscription.cancel_at_period_end
                      ? 'Cancels at end of period'
                      : `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === 'portal'}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ background: '#166534', color: '#ffffff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#14532d'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#166534'; }}
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
                  className="relative rounded-xl p-6 transition-all"
                  style={{
                    background: plan.popular ? '#1a3d2e' : '#242424',
                    border: plan.popular ? '2px solid #10b981' : '1px solid #333333',
                  }}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#10b981', color: '#ffffff' }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  {plan.savings && (
                    <div
                      className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#3b82f6', color: '#ffffff' }}
                    >
                      {plan.savings}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>

                  <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <span className="text-emerald-400 font-medium">{plan.credits} credits included</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                    className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50"
                    style={{
                      background: plan.popular ? '#10b981' : '#333333',
                      color: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = plan.popular ? '#059669' : '#444444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = plan.popular ? '#10b981' : '#333333';
                    }}
                  >
                    {loading === plan.id ? 'Processing...' : 'Subscribe Now'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Credit Add-on */}
          <div
            className="rounded-xl p-6"
            style={{ background: '#242424', border: '1px solid #333333' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Need More Credits?</h3>
                <p className="text-gray-400">Add 5 credits to your account for one-time use</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-white">$50</span>
                <button
                  onClick={handleBuyCredits}
                  disabled={loading !== null}
                  className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ background: '#3b82f6', color: '#ffffff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; }}
                >
                  {loading === 'addon' ? 'Processing...' : 'Buy Credits'}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: '#3d1f1f', border: '1px solid #7f1d1d' }}>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Free tier note */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Your first company prep is always free. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
