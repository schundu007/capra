import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getApiUrl } from '../../hooks/useElectron.js';
import { Icon } from '../Icons.jsx';

const API_URL = getApiUrl();

/**
 * Premium Pricing Page — Dedicated /premium route
 * Inspired by algomaster.io/premium with Ascend branding
 */
export default function PremiumPage() {
  const { signIn, getAccessToken, isAuthenticated, subscription } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

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
      periodShort: '/mo',
      icon: 'cloud',
      color: '#3b82f6',
      badge: null,
      features: [
        'AI Coding + System Design',
        '5 credits/mo (25 problems)',
        'Screenshot OCR solver',
        'No auto-renewal',
      ],
      cta: 'Get Monthly',
    },
    {
      id: 'quarterly_pro',
      name: 'Quarterly Pro',
      price: 249,
      originalPrice: 297,
      period: '3 months access',
      periodShort: '/quarter',
      icon: 'rocket',
      color: '#10b981',
      badge: 'POPULAR',
      badgeColor: '#10b981',
      features: [
        'Everything in Monthly',
        'Unlimited usage',
        'Company prep + behavioral coaching',
        'Live assistant + stealth mode',
        'Resume & cover letter export',
      ],
      cta: 'Get Quarterly Pro',
      savings: 'Save $48 vs Monthly',
    },
    {
      id: 'desktop_lifetime',
      name: 'Desktop Lifetime',
      price: 300,
      originalPrice: 500,
      period: 'Forever access',
      periodShort: 'once',
      icon: 'terminal',
      color: '#8b5cf6',
      badge: 'BEST VALUE',
      badgeColor: '#8b5cf6',
      features: [
        'Everything in Quarterly Pro',
        'Pay once, own forever',
        'Your own API keys',
        'Desktop app (Mac/Win/Linux)',
        'Offline mode + free updates',
      ],
      cta: 'Get Lifetime',
      savings: '40% OFF',
    },
  ];

  const whatsIncluded = [
    { icon: 'code', title: 'AI Coding Engine', desc: 'Instant solutions in 20+ languages with line-by-line explanations, complexity analysis, and auto-fix', color: '#10b981' },
    { icon: 'systemDesign', title: 'System Design', desc: 'Auto-generated architecture diagrams for AWS, GCP, Azure with scalability patterns and tech justifications', color: '#3b82f6' },
    { icon: 'users', title: 'Behavioral Coaching', desc: 'AI-generated STAR method responses for leadership, teamwork, and conflict resolution interviews', color: '#8b5cf6' },
    { icon: 'microphone', title: 'Live Interview Assistant', desc: 'Real-time AI answers during live interviews. 100% invisible to screen share', color: '#ec4899' },
    { icon: 'briefcase', title: 'Company-Specific Prep', desc: 'Upload JD + resume to get tailored pitch, behavioral questions, system design prompts, and culture insights', color: '#f59e0b' },
    { icon: 'resume', title: 'Resume & Cover Letters', desc: 'AI-generated tailored resumes and cover letters for each role. ATS-optimized with PDF/DOCX export', color: '#06b6d4' },
    { icon: 'camera', title: 'Screenshot Solver', desc: 'Snap a screenshot of any coding problem. AI extracts text via OCR and generates a complete solution', color: '#f97316' },
    { icon: 'terminal', title: 'Code Execution', desc: 'Run and test code in 20+ languages with a built-in sandbox. Auto-fix errors and re-run instantly', color: '#84cc16' },
  ];

  const faqItems = [
    { q: 'What is Ascend?', a: 'Ascend is an AI-powered interview preparation platform that covers the full pipeline — from job discovery and resume generation to live interview assistance. It supports coding, system design, and behavioral interviews with real-time AI assistance.' },
    { q: 'What is included in Ascend Premium?', a: 'Premium includes unlimited access to the AI coding engine, system design with auto-diagrams, behavioral coaching, company-specific prep, live interview assistant, resume/cover letter generation, screenshot OCR solver, and code execution sandbox.' },
    { q: 'What happens when my access expires?', a: 'For Monthly and Quarterly plans, you will lose access to premium features when your period ends. Your saved work (prep materials, coding history) remains accessible. You can renew anytime. Desktop Lifetime never expires.' },
    { q: 'Do you offer refunds?', a: 'Yes! We offer a 30-day money-back guarantee on all plans. If you\'re not satisfied for any reason, contact us at support@cariara.com for a full refund. No questions asked.' },
    { q: 'How often is new content added?', a: 'We release updates weekly — new problem solutions, system design patterns, behavioral templates, and AI model improvements. Desktop Lifetime users get all future updates included.' },
    { q: 'Can I share my account with others?', a: 'No, each account is for individual use only. We monitor for account sharing and may suspend accounts that violate our terms of service.' },
    { q: 'How is Ascend different from LeetCode or other platforms?', a: 'Ascend is the only platform that covers the entire interview pipeline end-to-end: job search, resume/CL generation, interview prep, AND real-time live assistance during actual interviews. Plus, our stealth mode is 100% invisible during screen sharing.' },
    { q: 'What AI models power Ascend?', a: 'Ascend uses Claude (Opus & Sonnet) and GPT-4o for coding and reasoning, and specialized models for diagram generation. Desktop users can choose their preferred AI provider.' },
  ];

  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <div className="min-h-screen relative" style={{ background: '#ffffff', fontFamily: "'Source Sans 3', sans-serif", color: '#1a1a1a' }}>
      <div className="relative">

        {/* ═══ NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`} style={{ background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent' }}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Icon name="ascend" size={20} className="text-white" />
              </div>
              <span className="text-[26px] font-bold text-gray-900 premium-heading">Ascend</span>
            </a>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollTo('plans')} className="px-5 py-2.5 rounded-xl text-[16px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">Plans</button>
              <button onClick={() => scrollTo('features')} className="px-5 py-2.5 rounded-xl text-[16px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">Features</button>
              <button onClick={() => scrollTo('faq')} className="px-5 py-2.5 rounded-xl text-[16px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">FAQ</button>
            </div>
            <a href="/" className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl text-[16px] font-semibold text-white transition-all duration-300 hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)]" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              Back to App
            </a>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="pt-28 sm:pt-32 pb-8 max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="max-w-[800px] mx-auto text-center">
            <h1 className="text-[clamp(32px,5vw,52px)] font-bold leading-[1.08] tracking-[-0.03em] mb-3 premium-heading">
              <span className="text-gray-900">Ace Your Next </span>
              <span className="landing-gradient-text">Technical Interview</span>
            </h1>
            <p className="text-[16px] text-gray-500 mb-6 leading-[1.6]">Choose a plan and start preparing with AI-powered tools for coding, system design, and behavioral interviews.</p>
            <button onClick={() => scrollTo('plans')} className="px-6 py-3 rounded-xl font-semibold text-[16px] text-white transition-all hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)]" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              View Plans & Pricing
            </button>
          </div>
        </section>

        {/* ═══ PRICING CARDS ═══ */}
        <section id="plans" className="py-6 max-w-[1440px] mx-auto px-4 sm:px-8">
          {hasActiveSubscription && (
            <div className="mb-4 p-3 rounded-2xl text-center" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #a7f3d0' }}>
              <div className="flex items-center justify-center gap-2 text-emerald-600 text-lg font-semibold mb-1">
                <Icon name="checkCircle" size={22} />
                You have an active {subscription?.planType?.replace('_', ' ')} subscription
              </div>
              <p className="text-gray-600">Manage your subscription in the app settings.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-xl text-center" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p className="text-red-600 text-base">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {plans.map((plan, i) => {
              const isFeatured = plan.id === 'quarterly_pro';
              const isLifetime = plan.id === 'desktop_lifetime';
              return (
                <div key={plan.id} className={`relative rounded-xl overflow-hidden transition-all hover:scale-[1.02] flex flex-col `} style={{
                  background: isFeatured
                    ? '#f0fdf4'
                    : isLifetime
                    ? '#f5f3ff'
                    : '#eff6ff',
                  border: isFeatured ? '2px solid #10b981' : isLifetime ? '2px solid #8b5cf6' : '1px solid #bfdbfe',
                  boxShadow: isFeatured ? '0 4px 24px rgba(16, 185, 129, 0.12)' : isLifetime ? '0 4px 24px rgba(139, 92, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {plan.badge && (
                    <div className="absolute top-0 left-0 right-0 py-2 text-center text-sm font-bold text-gray-900" style={{ background: plan.badgeColor }}>
                      {plan.badge}
                    </div>
                  )}

                  <div className={`p-4 text-center flex-1 flex flex-col ${plan.badge ? 'pt-10' : ''}`}>
                    {/* Plan header */}
                    <div className="flex flex-col items-center text-center gap-1 mb-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${plan.color}15` }}>
                        <Icon name={plan.icon} size={24} style={{ color: plan.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 premium-heading">{plan.name}</h3>
                        <p className="text-gray-700 text-sm">{plan.period}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="my-3">
                      <div className="flex items-baseline gap-2 justify-center">
                        {plan.originalPrice && (
                          <span className="text-2xl text-gray-600 line-through font-medium">${plan.originalPrice}</span>
                        )}
                        <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 justify-center">
                        <span className="text-gray-700 text-sm">One-time payment</span>
                        {plan.savings && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${plan.color}20`, color: plan.color }}>
                            {plan.savings}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={!!loading}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] mb-4"
                      style={{
                        background: isFeatured ? '#10b981' : isLifetime ? '#8b5cf6' : '#3b82f6',
                        color: '#fff',
                        boxShadow: isFeatured ? '0 4px 16px rgba(16,185,129,0.15)' : isLifetime ? '0 4px 16px rgba(139,92,246,0.15)' : '0 4px 16px rgba(59,130,246,0.15)',
                      }}
                    >
                      {loading === plan.id ? (
                        <Icon name="loader" size={20} className="animate-spin mx-auto" />
                      ) : plan.cta}
                    </button>

                    {/* Features */}
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1 justify-items-start mx-auto mt-auto">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-1.5">
                          <Icon name="check" size={14} className="flex-shrink-0" style={{ color: plan.color }} />
                          <span className="text-gray-800 text-[12px]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-gray-900 text-[15px] mt-3 font-semibold">
            30-day money-back guarantee · Secure payment via Stripe · No auto-renewal
          </p>
        </section>

        {/* ═══ WHAT'S INCLUDED ═══ */}
        <section id="features" className="py-8 max-w-[1440px] mx-auto px-4 sm:px-8">
          <h2 className="text-[24px] font-bold text-gray-900 text-center mb-6">What's Included</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whatsIncluded.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl hover:shadow-md transition-all duration-200" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}10` }}>
                  <Icon name={item.icon} size={18} style={{ color: item.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-gray-900">{item.title}</div>
                  <div className="text-[12px] text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" className="py-8 max-w-[1440px] mx-auto px-4 sm:px-8">
          <h2 className="text-[24px] font-bold text-gray-900 text-center mb-6 premium-heading">Frequently Asked Questions</h2>
          <div className="max-w-[900px] mx-auto space-y-2">
            {faqItems.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ background: '#fff', border: `1px solid ${expandedFaq === i ? '#d1d5db' : '#e2e8f0'}`, boxShadow: expandedFaq === i ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.03)' }}>
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full px-5 py-3.5 flex items-center justify-between text-left">
                  <span className="text-gray-900 font-semibold text-[14px] pr-4">{faq.q}</span>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${expandedFaq === i ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-4">
                    <p className="text-gray-600 text-[13px] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-6 max-w-[1440px] mx-auto px-4 sm:px-8 mt-4">
          <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={14} className="text-white" />
              </div>
              <span className="text-[13px] text-gray-500">&copy; 2025 Ascend by Cariara. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Interview', href: '/app/coding' },
                { label: 'Download', href: '/download' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Support', href: 'mailto:support@cariara.com' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">{link.label}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&family=Source+Serif+4:wght@600;700;800&display=swap');

        .min-h-screen h1,
        .min-h-screen h2,
        .min-h-screen h3,
        .min-h-screen h4,
        .premium-heading {
          font-family: 'Source Serif 4', Georgia, serif;
        }

        .min-h-screen p,
        .min-h-screen a,
        .min-h-screen button,
        .min-h-screen span,
        .min-h-screen li,
        .min-h-screen div,
        .premium-body {
          font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .landing-gradient-text {
          background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
