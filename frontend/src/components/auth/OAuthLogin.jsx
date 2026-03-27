import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

export default function OAuthLogin({ loginOnly = false }) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Intersection observer for scroll-triggered animations
  useEffect(() => {
    if (loginOnly) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loginOnly]);

  const handleOAuthLogin = async (provider) => {
    setLoading(provider);
    setError('');
    try { await signIn(provider); } catch (err) { setError(err.message || 'Failed to sign in'); setLoading(null); }
  };

  const handlePricingClick = async (planId) => {
    setLoading(planId);
    setError('');
    localStorage.setItem('ascend_pending_plan', planId);
    try { await signIn('google'); } catch (err) { localStorage.removeItem('ascend_pending_plan'); setError(err.message || 'Failed to sign in'); setLoading(null); }
  };

  const isVisible = (id) => visibleSections.has(id);

  // ── Login-only (for protected routes) ──
  if (loginOnly) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b', fontFamily: "'Inter Tight', 'Inter', sans-serif" }}>
        <div className="w-full max-w-md p-8 rounded-2xl text-center" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Icon name="ascend" size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to Ascend</h2>
          <p className="text-gray-400 mb-8">Access your interview toolkit.</p>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={() => handleOAuthLogin('google')} disabled={!!loading} className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] mb-3" style={{ background: '#fff', color: '#000' }}>
            {loading === 'google' ? <Icon name="loader" size={18} className="animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
          </button>
          <button onClick={() => handleOAuthLogin('github')} disabled={!!loading} className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            {loading === 'github' ? <Icon name="loader" size={18} className="animate-spin" /> : <><GithubIcon /> Continue with GitHub</>}
          </button>
          <p className="text-gray-600 text-xs mt-6"><a href="/" className="text-gray-500 hover:text-white transition-colors">Back to home</a></p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // LANDING PAGE
  // ══════════════════════════════════════════════════════════════

  const features = [
    { icon: 'microphone', title: 'Live Interview Assistant', desc: 'Real-time voice transcription with instant AI-generated answers. Completely invisible during screen sharing.', color: '#10b981', tag: 'Most Popular' },
    { icon: 'code', title: 'AI Coding Engine', desc: '20+ languages with line-by-line explanations, complexity analysis, auto-fix, and live code execution.', color: '#3b82f6' },
    { icon: 'systemDesign', title: 'System Design', desc: 'Auto-generated architecture diagrams for AWS, GCP, Azure with scalability and trade-off analysis.', color: '#f59e0b' },
    { icon: 'briefcase', title: 'Company-Specific Prep', desc: 'Upload your JD + resume. Get a tailored pitch, behavioral questions, and technical focus areas.', color: '#8b5cf6' },
    { icon: 'resume', title: 'Resume & Cover Letters', desc: 'AI-generated, ATS-optimized documents tailored to each role. Export as PDF or DOCX.', color: '#06b6d4' },
    { icon: 'eyeOff', title: '100% Stealth Mode', desc: 'Invisible to screen share, hidden from dock and task manager. Works across all platforms.', color: '#ec4899' },
  ];

  const steps = [
    { num: '01', title: 'Paste or upload your problem', desc: 'Text, screenshot, or HackerRank/LeetCode URL', icon: 'upload' },
    { num: '02', title: 'AI generates your solution', desc: 'Code, explanations, diagrams in seconds', icon: 'sparkles' },
    { num: '03', title: 'Review and practice', desc: 'Step-by-step walkthrough with follow-up Q&A', icon: 'bookOpen' },
  ];

  const stats = [
    { value: '20+', label: 'Languages' },
    { value: '50K+', label: 'Problems Solved' },
    { value: '99%', label: 'Uptime' },
    { value: '< 3s', label: 'Avg Response' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#07070a', fontFamily: "'Inter Tight', 'Inter', sans-serif" }}>

      {/* ═══ BACKGROUND EFFECTS ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary glow */}
        <div className="absolute w-[1000px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(ellipse, #10b981, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      <div className="relative z-10">

        {/* ═══ NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`} style={{ background: scrolled ? 'rgba(7,7,10,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent' }}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Icon name="ascend" size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Ascend</span>
            </a>

            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Jobs', href: 'https://jobs.cariara.com', external: true },
                { label: 'Prep', href: '/prepare' },
                { label: 'Interview', href: '/app/coding' },
                { label: 'Pricing', href: '/premium' },
                { label: 'Download', href: '/download' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : '_self'}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => handleOAuthLogin('google')} disabled={!!loading} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {loading === 'google' ? <Icon name="loader" size={16} className="animate-spin" /> : 'Get Started'}
              </button>
              {/* Mobile menu button */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={20} />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 mx-6 p-4 rounded-2xl" style={{ background: 'rgba(17,17,22,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
              {[
                { label: 'Jobs', href: 'https://jobs.cariara.com' },
                { label: 'Prep', href: '/prepare' },
                { label: 'Interview', href: '/app/coding' },
                { label: 'Pricing', href: '/premium' },
                { label: 'Download', href: '/download' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors">{link.label}</a>
              ))}
              <button onClick={() => handleOAuthLogin('google')} className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Get Started Free
              </button>
            </div>
          )}
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="pt-36 sm:pt-44 pb-24 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#34d399' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-powered interview preparation platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-[1.02] tracking-tight">
            <span className="text-white">Ace every</span>
            <br className="sm:hidden" />{' '}
            <span className="text-white">interview.</span>
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 40%, #6ee7b7 100%)' }}>Land your dream job.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI coding solutions, system design diagrams, live interview assistance, and company-specific prep — all in one platform. <span className="text-gray-200 font-medium">100% invisible to screen share.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="group px-8 py-4 rounded-2xl font-semibold text-lg text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:scale-[1.03] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {loading === 'google' ? <Icon name="loader" size={20} className="animate-spin mx-auto" /> : (
                <span className="flex items-center justify-center gap-2">
                  Start Free
                  <Icon name="arrowRight" size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
            <a href="/prepare" className="px-8 py-4 rounded-2xl font-semibold text-lg text-gray-300 transition-all duration-300 hover:text-white hover:bg-white/[0.06]" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Explore Interview Prep
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto mb-16">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trusted by */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="w-full sm:w-auto text-xs uppercase tracking-widest text-gray-600 font-medium">Trusted by engineers at</span>
            {['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Stripe', 'Netflix'].map((c, i) => (
              <span key={i} className="font-semibold text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-default">{c}</span>
            ))}
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" data-animate className="py-24 max-w-5xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-4 block">How it works</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Three steps to your next offer</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`group relative p-8 rounded-3xl transition-all duration-700 hover:scale-[1.02] ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transitionDelay: `${i * 150}ms`
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl font-black text-emerald-500/20">{step.num}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)' }}>
                    <Icon name={step.icon} size={20} style={{ color: '#10b981' }} />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-700">
                    <Icon name="chevronRight" size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" data-animate className="py-24 max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-4 block">Features</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Everything you need to land the job</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">From first application to signed offer letter — one platform, zero context switching.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                id={`feat-${i}`}
                data-animate
                className={`group relative p-7 rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transitionDelay: `${i * 100}ms`
                }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${f.color}08, transparent 70%)` }} />

                <div className="relative">
                  {f.tag && (
                    <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}25` }}>
                      {f.tag}
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ background: `${f.color}10`, border: `1px solid ${f.color}15` }}>
                    <Icon name={f.icon} size={24} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2.5">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ DEMO PREVIEW ═══ */}
        <section id="demo" data-animate className="py-24 max-w-6xl mx-auto px-6">
          <div className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${isVisible('demo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Mock IDE header */}
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1.5 rounded-lg text-xs text-gray-500" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  ascend — AI Interview Assistant
                </div>
              </div>
            </div>

            {/* IDE content mockup */}
            <div className="grid md:grid-cols-2 divide-x divide-white/[0.04]">
              {/* Left: Problem */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>Medium</div>
                  <span className="text-gray-500 text-xs">Two Sum</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Given an array of integers <code className="px-1.5 py-0.5 rounded text-emerald-400 text-xs" style={{ background: 'rgba(16,185,129,0.1)' }}>nums</code> and an integer <code className="px-1.5 py-0.5 rounded text-emerald-400 text-xs" style={{ background: 'rgba(16,185,129,0.1)' }}>target</code>, return indices of the two numbers that add up to target.
                </p>
                <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="text-gray-500 mb-2 text-xs font-mono">Example:</div>
                  <div className="font-mono text-xs leading-relaxed">
                    <span className="text-gray-500">Input: </span>
                    <span className="text-emerald-400">nums = [2,7,11,15]</span>
                    <span className="text-gray-500">, target = </span>
                    <span className="text-amber-400">9</span>
                    <br />
                    <span className="text-gray-500">Output: </span>
                    <span className="text-sky-400">[0, 1]</span>
                  </div>
                </div>
              </div>

              {/* Right: Solution */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="sparkles" size={14} style={{ color: '#10b981' }} />
                    <span className="text-xs text-emerald-400 font-semibold">AI Solution</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
                    <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.08)' }}>O(n)</span>
                    <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.08)' }}>Python</span>
                  </div>
                </div>
                <div className="rounded-xl p-4 font-mono text-xs leading-[1.8]" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <span className="text-purple-400">def</span> <span className="text-sky-400">two_sum</span><span className="text-gray-400">(nums, target):</span><br />
                  {'  '}<span className="text-gray-400">seen = {'{}'}</span><br />
                  {'  '}<span className="text-purple-400">for</span> <span className="text-gray-300">i, num</span> <span className="text-purple-400">in</span> <span className="text-sky-400">enumerate</span><span className="text-gray-400">(nums):</span><br />
                  {'    '}<span className="text-gray-400">diff = target - num</span><br />
                  {'    '}<span className="text-purple-400">if</span> <span className="text-gray-400">diff</span> <span className="text-purple-400">in</span> <span className="text-gray-400">seen:</span><br />
                  {'      '}<span className="text-purple-400">return</span> <span className="text-gray-400">[seen[diff], i]</span><br />
                  {'    '}<span className="text-gray-400">seen[num] = i</span>
                </div>
                <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.08)' }}>
                  <span className="text-emerald-400 font-semibold">Explanation:</span>
                  <span className="text-gray-400 ml-2">Hash map stores complements for O(n) single-pass lookup instead of O(n&sup2;) brute force.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRICING CTA ═══ */}
        <section id="pricing-cta" data-animate className="py-24 max-w-4xl mx-auto px-6">
          <div className={`relative text-center p-12 sm:p-16 rounded-3xl overflow-hidden transition-all duration-700 ${isVisible('pricing-cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
            {/* Glow */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.15), transparent 60%)' }} />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Ready to ace your next interview?</h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">Join thousands of engineers who landed roles at top companies. Plans start at $99/mo with a 30-day money-back guarantee.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="group px-8 py-4 rounded-2xl font-semibold text-lg text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {loading === 'google' ? <Icon name="loader" size={20} className="animate-spin mx-auto" /> : (
                    <span className="flex items-center justify-center gap-2">
                      Start Free — No Credit Card
                      <Icon name="arrowRight" size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </button>
                <a href="/premium" className="px-8 py-4 rounded-2xl font-semibold text-lg text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/[0.06]" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* ═══ FOOTER ═══ */}
        <footer className="py-12" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
              <div>
                <a href="/" className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <Icon name="ascend" size={16} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-lg tracking-tight">Ascend</span>
                </a>
                <p className="text-gray-600 text-sm max-w-xs">AI-powered interview prep platform. From first application to signed offer.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-4 text-sm">
                <div>
                  <h4 className="text-gray-400 font-semibold mb-3 text-xs uppercase tracking-wider">Product</h4>
                  <div className="flex flex-col gap-2.5">
                    <a href="/app/coding" className="text-gray-500 hover:text-white transition-colors">Interview</a>
                    <a href="/prepare" className="text-gray-500 hover:text-white transition-colors">Prep</a>
                    <a href="/premium" className="text-gray-500 hover:text-white transition-colors">Pricing</a>
                    <a href="/download" className="text-gray-500 hover:text-white transition-colors">Download</a>
                  </div>
                </div>
                <div>
                  <h4 className="text-gray-400 font-semibold mb-3 text-xs uppercase tracking-wider">Company</h4>
                  <div className="flex flex-col gap-2.5">
                    <a href="https://jobs.cariara.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">Jobs</a>
                    <a href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy</a>
                    <a href="mailto:support@cariara.com" className="text-gray-500 hover:text-white transition-colors">Support</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Cariara. All rights reserved.</span>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>Built with</span>
                <Icon name="sparkles" size={12} style={{ color: '#10b981' }} />
                <span>for engineers, by engineers</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Smooth scrolling */
        html { scroll-behavior: smooth; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
function GithubIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>;
}
