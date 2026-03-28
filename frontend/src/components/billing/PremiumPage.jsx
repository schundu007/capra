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
      color: '#6b7280',
      badge: null,
      features: [
        'Full access to AI Coding Engine',
        'Full access to System Design mode',
        '5 credits per month (25 coding problems)',
        'Screenshot OCR problem solving',
        'Follow-up Q&A with AI',
        'One-time payment (no auto-renewal)',
      ],
      cta: 'Get Monthly',
    },
    {
      id: 'quarterly_pro',
      name: 'Quarterly Pro',
      price: 300,
      originalPrice: 397,
      period: '3 months access',
      periodShort: '/quarter',
      icon: 'rocket',
      color: '#10b981',
      badge: 'POPULAR',
      badgeColor: '#10b981',
      features: [
        'Everything in Monthly',
        'Unlimited coding + system design',
        'Company-specific interview prep',
        'Behavioral coaching (STAR method)',
        'Live interview assistant with stealth mode',
        'Resume & cover letter generation',
        'Job Discovery Portal access',
        'Export prep materials to PDF/DOCX',
        'Priority support',
      ],
      cta: 'Get Quarterly Pro',
      savings: 'Save $97 vs Monthly',
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
        'Pay once, access forever',
        'Use your own API keys (Claude/GPT-4)',
        'Desktop app for macOS, Windows, Linux',
        'Offline mode — no internet required',
        'All future updates included',
        'Highest priority support',
        'No recurring fees, ever',
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
    <div className="min-h-screen relative" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="absolute w-[900px] h-[900px] rounded-full" style={{ background: 'radial-gradient(circle, #10b98115 0%, transparent 55%)', top: '-350px', left: '50%', transform: 'translateX(-50%)', opacity: 0.15 }} />
        <div className="absolute w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, #8b5cf610 0%, transparent 55%)', bottom: '10%', right: '-150px', opacity: 0.12 }} />
      </div>

      <div className="relative z-10">

        {/* ═══ NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`} style={{ background: scrolled ? 'rgba(9, 9, 11, 0.88)' : 'transparent', backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Ascend</span>
            </a>
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => scrollTo('plans')} className="px-4 py-2 text-base text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Plans</button>
              <button onClick={() => scrollTo('features')} className="px-4 py-2 text-base text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Features</button>
              <button onClick={() => scrollTo('faq')} className="px-4 py-2 text-base text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">FAQ</button>
              <a href="/prepare" target="_blank" rel="noopener" className="px-4 py-2 text-base text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Prep</a>
            </div>
            <a href="/" className="px-6 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              Back to App
            </a>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="pt-36 pb-10 max-w-4xl mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
            <Icon name="sparkles" size={16} className="text-green-400" />
            AI-powered interview preparation
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.04] tracking-tight text-white">
            Ace Your Next<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #a7f3d0 100%)' }}>Technical Interview</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get unlimited access to AI-powered coding solutions, system design diagrams, behavioral coaching, live interview assistance, and company-specific prep.
          </p>
          <button onClick={() => scrollTo('plans')} className="px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)' }}>
            View Plans & Pricing
          </button>
        </section>

        {/* ═══ PRICING CARDS ═══ */}
        <section id="plans" className="py-20 max-w-6xl mx-auto px-8">
          {hasActiveSubscription && (
            <div className="mb-10 p-5 rounded-2xl text-center" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="flex items-center justify-center gap-2 text-green-400 text-lg font-semibold mb-1">
                <Icon name="checkCircle" size={22} />
                You have an active {subscription?.planType?.replace('_', ' ')} subscription
              </div>
              <p className="text-gray-400">Manage your subscription in the app settings.</p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 rounded-xl text-center" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-red-400 text-base">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => {
              const isFeatured = plan.id === 'quarterly_pro';
              const isLifetime = plan.id === 'desktop_lifetime';
              return (
                <div key={plan.id} className={`relative rounded-3xl overflow-hidden transition-all hover:scale-[1.02] ${isFeatured ? 'md:-mt-4 md:mb-4' : ''}`} style={{
                  background: isFeatured
                    ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.03))'
                    : isLifetime
                    ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.02))'
                    : 'rgba(255,255,255,0.02)',
                  border: isFeatured ? '2px solid #10b981' : isLifetime ? '2px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isFeatured ? '0 0 60px rgba(16, 185, 129, 0.1)' : isLifetime ? '0 0 40px rgba(139, 92, 246, 0.08)' : 'none',
                }}>
                  {plan.badge && (
                    <div className="absolute top-0 left-0 right-0 py-2 text-center text-sm font-bold text-white" style={{ background: plan.badgeColor }}>
                      {plan.badge}
                    </div>
                  )}

                  <div className={`p-8 ${plan.badge ? 'pt-14' : ''}`}>
                    {/* Plan header */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}15` }}>
                        <Icon name={plan.icon} size={24} style={{ color: plan.color }} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <p className="text-gray-500 text-sm">{plan.period}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="my-6">
                      <div className="flex items-baseline gap-2">
                        {plan.originalPrice && (
                          <span className="text-2xl text-gray-600 line-through font-medium">${plan.originalPrice}</span>
                        )}
                        <span className="text-6xl font-black text-white">${plan.price}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-gray-500 text-base">One-time payment</span>
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
                      className="w-full py-4 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] mb-8"
                      style={{
                        background: isFeatured ? '#10b981' : isLifetime ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        boxShadow: isFeatured ? '0 0 30px rgba(16, 185, 129, 0.2)' : isLifetime ? '0 0 30px rgba(139, 92, 246, 0.15)' : 'none',
                      }}
                    >
                      {loading === plan.id ? (
                        <Icon name="loader" size={20} className="animate-spin mx-auto" />
                      ) : plan.cta}
                    </button>

                    {/* Features */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <Icon name="check" size={18} className="flex-shrink-0 mt-0.5" style={{ color: plan.color === '#6b7280' ? '#10b981' : plan.color }} />
                          <span className="text-gray-300 text-base leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-gray-500 text-base mt-8">
            All plans include access to premium content, priority support, and regular updates.
          </p>
          <p className="text-center text-gray-600 text-sm mt-2">
            30-day money-back guarantee · Secure payment via Stripe · No auto-renewal
          </p>
        </section>

        {/* ═══ WHAT'S INCLUDED ═══ */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">What's Included</h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">Every tool you need to go from job search to signed offer letter</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whatsIncluded.map((item, i) => (
              <div key={i} className="p-7 rounded-2xl transition-all hover:scale-[1.02]" style={{ background: `${item.color}06`, border: `1px solid ${item.color}18` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: `${item.color}12` }}>
                  <Icon name={item.icon} size={28} style={{ color: item.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ GUARANTEE ═══ */}
        <section className="py-20 max-w-3xl mx-auto px-8 text-center">
          <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <Icon name="sre" size={28} style={{ color: '#10b981' }} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">30-Day Money-Back Guarantee</h3>
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto">
              Try Ascend risk-free. If it's not for you, contact us within 30 days for a full refund — no questions asked.
            </p>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" className="py-24 max-w-3xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-14">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqItems.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden transition-all" style={{ background: expandedFaq === i ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${expandedFaq === i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}` }}>
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full px-7 py-5 flex items-center justify-between text-left">
                  <span className="text-white font-semibold text-lg pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${expandedFaq === i ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-7 pb-5">
                    <p className="text-gray-400 text-base leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-20 max-w-3xl mx-auto px-8">
          <div className="p-14 rounded-3xl text-center" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03))', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 0 50px rgba(16, 185, 129, 0.06)' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">Start preparing with AI-powered tools for coding, system design, and behavioral interviews.</p>
            <button onClick={() => scrollTo('plans')} className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)' }}>
              Get Started Now
            </button>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Icon name="ascend" size={18} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg">Ascend</span>
              </div>
              <div className="flex items-center gap-6 text-base text-gray-500">
                <a href="/" className="hover:text-white transition-colors">Home</a>
                <a href="https://jobs.cariara.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Jobs</a>
                <a href="/prepare" target="_blank" rel="noopener" className="hover:text-white transition-colors">Prep</a>
                <a href="/app/coding" target="_blank" rel="noopener" className="hover:text-white transition-colors">Interview</a>
                <a href="/download" target="_blank" rel="noopener" className="hover:text-white transition-colors">Download</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="mailto:support@cariara.com" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t text-center text-gray-600 text-sm" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              © 2025 Ascend by Cariara. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
