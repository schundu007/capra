import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getApiUrl } from '../../hooks/useElectron.js';
import { Icon } from '../Icons.jsx';

const API_URL = getApiUrl();

export default function PremiumPage() {
  const { signIn, getAccessToken, isAuthenticated, subscription } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    setError('');
    try {
      if (!isAuthenticated) {
        localStorage.setItem('ascend_pending_plan', planId);
        await signIn('google');
        return;
      }
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
          cancelUrl: `${window.location.origin}/premium?checkout=canceled`,
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

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 99,
      originalPrice: null,
      period: '1 month access',
      icon: 'cloud',
      color: '#3b82f6',
      colorName: 'blue',
      badge: null,
      features: ['AI Coding + System Design', '5 credits/mo (25 problems)', 'Screenshot OCR solver', 'No auto-renewal'],
      cta: 'Get Monthly',
    },
    {
      id: 'quarterly_pro',
      name: 'Quarterly Pro',
      price: 249,
      originalPrice: 297,
      period: '3 months access',
      icon: 'rocket',
      color: '#10b981',
      colorName: 'emerald',
      badge: 'POPULAR',
      features: ['Everything in Monthly', 'Unlimited usage', 'Company prep + behavioral coaching', 'Live assistant + stealth mode', 'Resume & cover letter export'],
      cta: 'Get Quarterly Pro',
      savings: 'Save $48 vs Monthly',
    },
    {
      id: 'desktop_lifetime',
      name: 'Desktop Lifetime',
      price: 300,
      originalPrice: 500,
      period: 'Forever access',
      icon: 'terminal',
      color: '#8b5cf6',
      colorName: 'violet',
      badge: 'BEST VALUE',
      features: ['Everything in Quarterly Pro', 'Pay once, own forever', 'Your own API keys', 'Desktop app (Mac/Win/Linux)', 'Offline mode + free updates'],
      cta: 'Get Lifetime',
      savings: '40% OFF',
    },
  ];

  const whatsIncluded = [
    { icon: 'code', title: 'AI Coding Engine', desc: 'Instant solutions in 20+ languages with explanations and auto-fix', tags: ['Multi-Language', 'Auto-Fix'] },
    { icon: 'systemDesign', title: 'System Design', desc: 'Architecture diagrams for AWS, GCP, Azure with scalability analysis', tags: ['Diagrams', 'Scale Math'] },
    { icon: 'users', title: 'Behavioral Coaching', desc: 'STAR method responses for leadership and conflict resolution', tags: ['STAR Method', 'Practice'] },
    { icon: 'microphone', title: 'Live Assistant', desc: 'Real-time AI answers during live interviews. Invisible to screen share', tags: ['Stealth', 'Real-Time'] },
    { icon: 'briefcase', title: 'Company Prep', desc: 'Upload JD + resume for tailored pitch and culture insights', tags: ['JD Match', 'Culture Fit'] },
    { icon: 'resume', title: 'Resume Builder', desc: 'AI-generated resumes and cover letters. ATS-optimized PDF/DOCX', tags: ['ATS-Ready', 'Export'] },
  ];

  const faqItems = [
    { q: 'What is Ascend?', a: 'Ascend is an AI-powered interview preparation platform that covers the full pipeline — from resume generation to live interview assistance. It supports coding, system design, and behavioral interviews.' },
    { q: 'What is included in Ascend Premium?', a: 'Premium includes unlimited AI coding, system design with auto-diagrams, behavioral coaching, company-specific prep, live interview assistant, resume/cover letter generation, screenshot OCR solver, and code execution sandbox.' },
    { q: 'What happens when my access expires?', a: 'For Monthly and Quarterly plans, you lose access to premium features when your period ends. Your saved work remains accessible. Desktop Lifetime never expires.' },
    { q: 'Do you offer refunds?', a: 'Yes! 30-day money-back guarantee on all plans. Contact support@cariara.com for a full refund. No questions asked.' },
    { q: 'How is Ascend different from LeetCode?', a: 'Ascend covers the entire interview pipeline end-to-end: resume generation, interview prep, AND real-time live assistance during actual interviews. Plus stealth mode is 100% invisible during screen sharing.' },
    { q: 'What AI models power Ascend?', a: 'Claude (Opus & Sonnet) and GPT-4o for coding and reasoning, plus specialized models for diagram generation. Desktop users can choose their preferred AI provider.' },
  ];

  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden premium-root">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center">
            <Icon name="ascend" size={16} className="text-white" />
          </div>
          <div>
            <span className="premium-display font-bold text-lg tracking-tight text-gray-900">Ascend</span>
            <span className="block text-[10px] premium-mono uppercase tracking-[0.2em] text-emerald-600 -mt-0.5">Interview AI</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollTo('plans')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Plans</button>
          <button onClick={() => scrollTo('features')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Features</button>
          <button onClick={() => scrollTo('faq')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">FAQ</button>
          <a href="/app/coding" className="px-5 py-2 bg-emerald-500 text-white font-semibold text-sm rounded hover:bg-emerald-600 transition-colors">
            Back to App
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-emerald-200 bg-emerald-50 rounded-full mb-8">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs premium-mono text-emerald-700 tracking-wide">Premium Plans</span>
        </div>

        <h1 className="premium-display font-extrabold leading-tight tracking-tight max-w-3xl">
          <span className="text-3xl md:text-4xl lg:text-5xl text-gray-900">Ace Your Next </span>
          <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Technical Interview</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed premium-body">
          Choose a plan and start preparing with AI-powered tools for coding, system design, and behavioral interviews.
        </p>

        <button onClick={() => scrollTo('plans')} className="mt-6 px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded hover:bg-emerald-600 transition-colors shadow-sm premium-body">
          View Plans
        </button>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />

      {/* Pricing Cards */}
      <section id="plans" className="px-6 md:px-12 py-16 md:py-20 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="premium-mono text-xs text-emerald-600 tracking-widest uppercase">Pricing</span>
            <h2 className="premium-display font-bold text-2xl md:text-3xl mt-2 tracking-tight text-gray-900">
              Simple Plans. <span className="text-gray-400">No Surprises.</span>
            </h2>
          </div>

          {hasActiveSubscription && (
            <div className="mb-6 p-4 border border-emerald-200 bg-emerald-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold mb-1">
                <Icon name="checkCircle" size={18} />
                Active {subscription?.planType?.replace('_', ' ')} subscription
              </div>
              <p className="text-sm text-gray-500">Manage your subscription in app settings.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isFeatured = plan.id === 'quarterly_pro';
              return (
                <div key={plan.id} className={`relative p-6 border rounded-lg bg-white flex flex-col transition-all hover:shadow-sm ${isFeatured ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200'}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-[10px] font-bold premium-mono uppercase tracking-wider rounded-full text-white" style={{ background: plan.color }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className={`w-10 h-10 border border-${plan.colorName}-200 bg-${plan.colorName}-50 rounded flex items-center justify-center mx-auto mb-3`}>
                      <Icon name={plan.icon} size={18} style={{ color: plan.color }} />
                    </div>
                    <h3 className="premium-display font-bold text-lg text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-400 premium-mono mt-0.5">{plan.period}</p>
                  </div>

                  <div className="text-center mb-4">
                    <div className="flex items-baseline gap-2 justify-center">
                      {plan.originalPrice && (
                        <span className="text-xl text-gray-400 line-through">${plan.originalPrice}</span>
                      )}
                      <span className="text-4xl font-extrabold text-gray-900 premium-display">${plan.price}</span>
                    </div>
                    {plan.savings && (
                      <span className="inline-block mt-2 px-3 py-1 text-[10px] font-bold premium-mono uppercase tracking-wider rounded-full" style={{ background: `${plan.color}15`, color: plan.color }}>
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading}
                    className="w-full py-2.5 text-sm font-semibold rounded transition-colors mb-4 premium-body"
                    style={{ background: plan.color, color: '#fff' }}
                  >
                    {loading === plan.id ? <Icon name="loader" size={18} className="animate-spin mx-auto" /> : plan.cta}
                  </button>

                  <ul className="space-y-2 mt-auto">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600 premium-body">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 premium-mono mt-6 tracking-wide">
            30-day money-back guarantee · Secure payment via Stripe · No auto-renewal
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section id="features" className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="premium-mono text-xs text-emerald-600 tracking-widest uppercase">Included</span>
            <h2 className="premium-display font-bold text-2xl md:text-3xl mt-2 tracking-tight text-gray-900">
              Everything You Need. <span className="text-gray-400">In Every Plan.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whatsIncluded.map((item, i) => (
              <div key={i} className="p-5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="w-9 h-9 border border-emerald-200 bg-emerald-50 rounded flex items-center justify-center mb-3">
                  <Icon name={item.icon} size={16} className="text-emerald-500" />
                </div>
                <h3 className="premium-display font-semibold text-base mb-1 text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed premium-body">{item.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map(t => (
                    <span key={t} className="text-[10px] premium-mono px-2 py-1 border border-gray-200 text-gray-400 rounded">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 md:px-12 py-16 md:py-20 bg-gray-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="premium-mono text-xs text-emerald-600 tracking-widest uppercase">FAQ</span>
            <h2 className="premium-display font-bold text-2xl md:text-3xl mt-2 tracking-tight text-gray-900">
              Common Questions
            </h2>
          </div>

          <div className="space-y-2">
            {faqItems.map((faq, i) => (
              <div key={i} className={`border rounded-lg bg-white transition-all ${expandedFaq === i ? 'border-gray-300 shadow-sm' : 'border-gray-200'}`}>
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left">
                  <span className="text-sm font-semibold text-gray-900 pr-4 premium-body">{faq.q}</span>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${expandedFaq === i ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed premium-body">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 md:px-12 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center">
              <Icon name="ascend" size={12} className="text-white" />
            </div>
            <span className="premium-display font-bold text-sm text-gray-900">Ascend</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { label: 'Home', href: '/' },
              { label: 'Practice', href: '/app/coding' },
              { label: 'Preparation', href: '/prepare' },
              { label: 'Support', href: 'mailto:support@cariara.com' },
            ].map((link) => (
              <a key={link.label} href={link.href} className="text-xs text-gray-400 hover:text-gray-900 transition-colors premium-body font-medium">{link.label}</a>
            ))}
          </div>
          <p className="text-xs text-gray-400 premium-mono">
            &copy; {new Date().getFullYear()} Ascend by Cariara
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');

        .premium-root {
          -webkit-font-smoothing: antialiased;
          font-family: 'Work Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .premium-display {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .premium-body {
          font-family: 'Work Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .premium-mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
