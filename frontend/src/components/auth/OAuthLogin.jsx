import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

/**
 * Ascend Landing Page — Enterprise-grade, compact, modern design
 * No duplicate sections. Key content front and center.
 */
export default function OAuthLogin({ loginOnly = false }) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeDemo, setActiveDemo] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Sticky nav background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate demo tabs
  useEffect(() => {
    const interval = setInterval(() => setActiveDemo((p) => (p + 1) % 3), 6000);
    return () => clearInterval(interval);
  }, []);

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

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const isVisible = (id) => visibleSections.has(id);

  // Feature tabs data — single consolidated section
  const features = [
    {
      id: 'coding', title: 'Coding Problems', icon: 'code', color: '#10b981',
      desc: 'Real-time AI-powered solutions for 20+ languages with auto-fix, complexity analysis, and line-by-line explanations.',
      bullets: ['20+ Languages', 'Auto-fix Errors', 'Complexity Analysis', 'Line-by-line Explanations'],
      preview: (
        <pre className="text-green-400 text-xs md:text-sm font-mono leading-relaxed">
{`def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        comp = target - n
        if comp in seen:
            return [seen[comp], i]
        seen[n] = i
    return []`}
        </pre>
      ),
    },
    {
      id: 'system-design', title: 'System Design', icon: 'systemDesign', color: '#3b82f6',
      desc: 'Architecture diagrams, scalability patterns, and deep-dive explanations with auto-generated visuals.',
      bullets: ['High-level Design', 'Low-level Deep Dives', 'Auto Diagrams', 'Tech Justifications'],
      preview: (
        <div className="space-y-2">
          {[
            { name: 'Load Balancer', sub: 'NGINX / ALB', color: '#3b82f6', bg: '#1e3a5f' },
            { name: 'API Servers', sub: 'Go / Node.js', color: '#22d3ee', bg: '#164e63' },
            { name: 'Redis Cache', sub: 'TTL: 24h', color: '#ef4444', bg: '#3f1e1e' },
            { name: 'PostgreSQL', sub: 'Primary + Replicas', color: '#22c55e', bg: '#1e2e1e' },
          ].map((n, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: n.bg, border: `1px solid ${n.color}40` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: n.color }} />
              <div>
                <div className="text-xs font-semibold" style={{ color: n.color }}>{n.name}</div>
                <div className="text-[10px] text-gray-500">{n.sub}</div>
              </div>
              {i < 3 && <div className="ml-auto text-gray-600 text-xs">→</div>}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'behavioral', title: 'Behavioral', icon: 'users', color: '#8b5cf6',
      desc: 'AI-generated STAR method responses for leadership, teamwork, and conflict resolution questions.',
      bullets: ['STAR Framework', 'Follow-up Q&A', 'Leadership Principles', 'Custom Stories'],
      preview: (
        <div className="space-y-2.5">
          {[
            { letter: 'S', word: 'Situation', color: '#8b5cf6' },
            { letter: 'T', word: 'Task', color: '#a78bfa' },
            { letter: 'A', word: 'Action', color: '#c4b5fd' },
            { letter: 'R', word: 'Result', color: '#ddd6fe' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background: item.color }}>{item.letter}</div>
              <span className="text-gray-300 text-sm">{item.word}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'assistant', title: 'Live Assistant', icon: 'microphone', color: '#f59e0b',
      desc: 'Real-time voice transcription with instant AI answers. 100% invisible during screen sharing.',
      bullets: ['Live Transcription', 'Instant Answers', '100% Invisible', 'All Platforms'],
      preview: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-medium">Recording...</span>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div className="text-amber-400 text-[10px] uppercase tracking-wider mb-1">Transcribed</div>
            <p className="text-gray-300 text-xs">"Design a system that handles 10M daily active users..."</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="text-green-400 text-[10px] uppercase tracking-wider mb-1">AI Response</div>
            <p className="text-gray-300 text-xs">Start with a load balancer distributing across API servers...</p>
          </div>
        </div>
      ),
    },
  ];

  // Testimonials
  const testimonials = [
    { name: 'Sarah M.', role: 'Senior SWE @ Meta', text: 'Got offers from 3 FAANG companies. The coding assistance was flawless.', avatar: 'S', color: '#10b981' },
    { name: 'James K.', role: 'Staff Eng @ Google', text: 'The system design help alone is worth 10x the price. Nailed Amazon L6 and Google L5.', avatar: 'J', color: '#3b82f6' },
    { name: 'Priya R.', role: 'Eng Manager @ Netflix', text: 'Game changer for behavioral interviews. The STAR responses were perfect.', avatar: 'P', color: '#8b5cf6' },
    { name: 'Michael T.', role: 'SDE II @ Amazon', text: 'Failed 5 interviews before Ascend. After using it, got offers from 3 top companies.', avatar: 'M', color: '#f59e0b' },
  ];

  // FAQ
  const faqItems = [
    { q: 'How does Ascend work?', a: 'Paste a problem, take a screenshot, or enable live transcription. Our AI provides instant, accurate solutions with detailed explanations in real-time.' },
    { q: 'Is it really undetectable?', a: "Yes. Ascend is completely invisible during screen sharing. It doesn't appear in your dock, taskbar, or task manager. Works with Zoom, Meet, Teams, and all coding platforms." },
    { q: 'What languages and platforms are supported?', a: 'We support 20+ programming languages including Python, JavaScript, Java, C++, Go, Rust, and SQL. Works with HackerRank, LeetCode, CoderPad, CodeSignal, and more.' },
    { q: 'Can I try before buying?', a: 'Yes! We offer a free tier with limited credits so you can experience Ascend before committing. No credit card required.' },
    { q: 'How is Desktop different from subscriptions?', a: 'Desktop is a one-time purchase with lifetime access. You use your own API keys, so there are no ongoing fees.' },
    { q: 'Do you offer refunds?', a: 'Yes, 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund. No questions asked.' },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Stripe', 'OpenAI', 'Netflix'];

  // ── Login-only mode (for protected routes) ──
  if (loginOnly) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-md p-8 rounded-2xl text-center" style={{ background: '#141419', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Icon name="ascend" size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to Ascend</h2>
          <p className="text-gray-400 mb-8">Log in to access coding practice, system design, and more.</p>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={() => handleOAuthLogin('google')} disabled={!!loading} className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] mb-3" style={{ background: '#fff', color: '#000' }}>
            {loading === 'google' ? <Icon name="loader" size={18} className="animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
          </button>
          <button onClick={() => handleOAuthLogin('github')} disabled={!!loading} className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
            {loading === 'github' ? <Icon name="loader" size={18} className="animate-spin" /> : <><GithubIcon /> Continue with GitHub</>}
          </button>
          <p className="text-gray-600 text-xs mt-6"><a href="/" className="text-gray-500 hover:text-white transition-colors">← Back to home</a></p>
        </div>
      </div>
    );
  }

  // ── Full Landing Page ──
  return (
    <div className="min-h-screen relative" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #10b98120 0%, transparent 60%)', top: '-300px', left: '50%', transform: 'translateX(-50%)' }} />
      </div>

      <div className="relative z-10">

        {/* ═══ STICKY NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`} style={{ background: scrolled ? 'rgba(9, 9, 11, 0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Ascend</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Features', id: 'features' },
                { label: 'Demo', id: 'demo' },
                { label: 'Pricing', id: 'pricing' },
                { label: 'Reviews', id: 'testimonials' },
              ].map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="px-3.5 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">{item.label}</button>
              ))}
              <a href="/docs" className="px-3.5 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Docs</a>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleOAuthLogin('google')} className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="pt-32 pb-16 max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Trusted by 50,000+ engineers at top tech companies
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-[1.1] tracking-tight">
              <span className="text-white">Ace Every Interview,</span>
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)' }}>Secure Your Future</span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
              Real-time AI for coding, system design & behavioral interviews. <span className="text-white font-medium">100% invisible.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 text-base" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {loading === 'google' ? <Icon name="loader" size={18} className="animate-spin mx-auto" /> : 'Start Free — No Credit Card'}
              </button>
              <button onClick={() => scrollTo('demo')} className="px-7 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2.5 transition-all hover:bg-white/10 text-base" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon name="play" size={16} /> Watch Demo
              </button>
            </div>

            {/* Social proof row */}
            <div className="flex items-center justify-center gap-5">
              <div className="flex -space-x-2.5">
                {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'].map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#09090b]" style={{ background: color }}>
                    {['S', 'J', 'P', 'M', 'E'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <div className="flex">{[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={14} className="text-yellow-400" />)}</div>
                <span className="text-gray-400"><span className="text-white font-semibold">4.9</span> from 2,000+ reviews</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TRUSTED BY — single logos strip ═══ */}
        <section className="py-8 border-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {companies.map((name, i) => (
                <span key={i} className="text-gray-500 font-semibold text-base hover:text-gray-300 transition-colors cursor-default" style={{ letterSpacing: '-0.01em' }}>{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES — consolidated tabbed section ═══ */}
        <section id="features" data-animate className={`py-20 transition-all duration-700 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything You Need to Succeed</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">AI-powered tools for every type of technical interview</p>
            </div>

            {/* Feature tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {features.map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(i)} className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all" style={{
                  background: activeFeature === i ? `${f.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeFeature === i ? f.color + '50' : 'rgba(255,255,255,0.06)'}`,
                  color: activeFeature === i ? f.color : '#9ca3af',
                }}>
                  <Icon name={f.icon} size={16} />
                  {f.title}
                </button>
              ))}
            </div>

            {/* Active feature content */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${features[activeFeature].color}15` }}>
                    <Icon name={features[activeFeature].icon} size={24} style={{ color: features[activeFeature].color }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{features[activeFeature].title}</h3>
                </div>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">{features[activeFeature].desc}</p>
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {features[activeFeature].bullets.map((b, j) => (
                    <div key={j} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <Icon name="check" size={14} style={{ color: features[activeFeature].color }} />
                      <span className="text-gray-300 text-sm">{b}</span>
                    </div>
                  ))}
                </div>
                <a href="/docs" className="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all text-sm" style={{ color: features[activeFeature].color }}>
                  Explore {features[activeFeature].title} <Icon name="arrowRight" size={16} />
                </a>
              </div>
              <div className="order-1 lg:order-2 p-6 rounded-2xl min-h-[280px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-full max-w-sm">{features[activeFeature].preview}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section data-animate id="how-it-works" className={`py-16 transition-all duration-700 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Get Started in Minutes</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { num: '01', title: 'Sign Up', desc: 'Create an account in seconds with Google or GitHub', icon: 'users', color: '#10b981' },
                { num: '02', title: 'Choose Mode', desc: 'Pick Coding, System Design, or Behavioral prep', icon: 'target', color: '#3b82f6' },
                { num: '03', title: 'Get Answers', desc: 'Paste, screenshot, or transcribe for instant AI solutions', icon: 'sparkles', color: '#8b5cf6' },
                { num: '04', title: 'Land Offers', desc: 'Ace your interviews and secure top tech offers', icon: 'rocket', color: '#f59e0b' },
              ].map((step, i) => (
                <div key={i} className="relative p-5 rounded-xl group hover:scale-[1.02] transition-all" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs font-bold mb-3" style={{ color: step.color }}>{step.num}</div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${step.color}12` }}>
                    <Icon name={step.icon} size={20} style={{ color: step.color }} />
                  </div>
                  <h3 className="text-white font-semibold mb-1 text-sm">{step.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ LIVE DEMO ═══ */}
        <section id="demo" data-animate className={`py-16 transition-all duration-700 ${isVisible('demo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">See Ascend in Action</h2>
              <p className="text-gray-400">Real-time AI solving interview problems instantly</p>
            </div>

            <div className="flex justify-center gap-2 mb-5">
              {[
                { id: 0, label: 'Coding', icon: 'code', color: '#10b981' },
                { id: 1, label: 'System Design', icon: 'systemDesign', color: '#3b82f6' },
                { id: 2, label: 'Behavioral', icon: 'users', color: '#8b5cf6' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveDemo(tab.id)} className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all" style={{
                  background: activeDemo === tab.id ? `${tab.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeDemo === tab.id ? tab.color : 'rgba(255,255,255,0.06)'}`,
                  color: activeDemo === tab.id ? tab.color : '#9ca3af',
                }}>
                  <Icon name={tab.icon} size={14} />{tab.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-gray-600 text-xs font-mono ml-3">ascend-assistant</span>
              </div>

              <div className="p-6" style={{ minHeight: '280px' }}>
                {activeDemo === 0 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">Problem</div>
                      <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-gray-300 text-sm">Given an array of integers, return indices of two numbers that add up to a target.</p>
                      </div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">AI Solution</div>
                      <pre className="text-green-400 text-xs font-mono leading-relaxed">
{`def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target-n], i]
        seen[n] = i`}
                      </pre>
                    </div>
                    <div className="space-y-3">
                      <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">Analysis</div>
                      {[
                        { label: 'Time', value: 'O(n) — Single pass', color: '#10b981' },
                        { label: 'Space', value: 'O(n) — Hash map', color: '#3b82f6' },
                        { label: 'Pattern', value: 'Hash map for O(1) lookups', color: '#8b5cf6' },
                      ].map((a, i) => (
                        <div key={i} className="p-3 rounded-lg" style={{ background: `${a.color}08` }}>
                          <div className="text-xs font-semibold mb-0.5" style={{ color: a.color }}>{a.label}</div>
                          <div className="text-white text-sm">{a.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeDemo === 1 && (
                  <div>
                    <div className="flex items-center gap-2 text-blue-400 font-semibold mb-4 text-sm">
                      <Icon name="systemDesign" size={18} /> Design: URL Shortener Service
                    </div>
                    <div className="grid md:grid-cols-5 gap-3 mb-4">
                      {[
                        { name: 'Users', color: '#3b82f6', bg: '#1e3a5f' },
                        { name: 'Load Balancer', color: '#3b82f6', bg: '#1e3a5f' },
                        { name: 'API Servers', color: '#22d3ee', bg: '#164e63' },
                        { name: 'Cache + DB', color: '#22c55e', bg: '#1e2e1e' },
                        { name: 'CDN', color: '#a855f7', bg: '#2e1e3f' },
                      ].map((n, i) => (
                        <div key={i} className="p-3 rounded-lg text-center" style={{ background: n.bg, border: `1px solid ${n.color}40` }}>
                          <div className="text-xs font-semibold" style={{ color: n.color }}>{n.name}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-gray-500 text-[10px] uppercase mb-1.5">Scalability</div>
                        <ul className="text-gray-300 text-xs space-y-1">
                          <li>Horizontal scaling with K8s</li>
                          <li>Read replicas for DB</li>
                          <li>Cache-aside pattern</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-gray-500 text-[10px] uppercase mb-1.5">Tech Stack</div>
                        <ul className="text-gray-300 text-xs space-y-1">
                          <li>Go for high throughput</li>
                          <li>Redis for caching</li>
                          <li>PostgreSQL for persistence</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {activeDemo === 2 && (
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Icon name="question" size={14} className="text-purple-400" />
                      </div>
                      <span className="text-gray-400 text-sm">Interviewer:</span>
                      <span className="text-white text-sm">"Tell me about a time you dealt with a difficult teammate."</span>
                    </div>
                    <div className="p-5 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Icon name="sparkles" size={14} className="text-purple-400" />
                        <span className="text-purple-400 font-semibold text-sm">STAR Response</span>
                      </div>
                      <div className="space-y-2 text-gray-300 text-sm">
                        <p><span className="text-white font-semibold">Situation:</span> A senior engineer was dismissive of my suggestions...</p>
                        <p><span className="text-white font-semibold">Task:</span> I needed to find a way to collaborate effectively...</p>
                        <p><span className="text-white font-semibold">Action:</span> Scheduled a 1:1, listened to their concerns, proposed a compromise...</p>
                        <p><span className="text-white font-semibold">Result:</span> Delivered the project 2 weeks early and became close collaborators.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" data-animate className={`py-20 transition-all duration-700 ${isVisible('pricing') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Simple, Transparent Pricing</h2>
              <p className="text-gray-400">Start free. Upgrade when ready. Cancel anytime.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Monthly */}
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Icon name="cloud" size={20} className="text-gray-400" />
                  <h3 className="text-lg font-bold text-white">Monthly</h3>
                </div>
                <p className="text-gray-500 text-xs mb-5">Perfect for trying it out</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-bold text-white">$99</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {['5 credits per month', '25 coding problems', 'System design basics', 'Email support'].map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-gray-400 text-sm">
                      <Icon name="check" size={14} className="text-green-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('monthly')} className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
                  {loading === 'monthly' ? <Icon name="loader" size={16} className="animate-spin mx-auto" /> : 'Get Started'}
                </button>
              </div>

              {/* Quarterly Pro */}
              <div className="relative p-6 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03))', border: '2px solid #10b981', boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#10b981', color: '#fff' }}>MOST POPULAR</div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Icon name="rocket" size={20} className="text-green-400" />
                  <h3 className="text-lg font-bold text-white">Quarterly Pro</h3>
                </div>
                <p className="text-gray-400 text-xs mb-5">Best value for serious prep</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">$300</span>
                  <span className="text-gray-400 text-sm">/quarter</span>
                </div>
                <div className="text-green-400 text-xs mb-5">$100/mo — Save $97 vs monthly</div>
                <ul className="space-y-3 mb-6">
                  {['10 credits per month', 'Unlimited problems', 'Full system design', 'Behavioral coaching', 'Job Discovery Portal', 'Priority support'].map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-gray-300 text-sm">
                      <Icon name="check" size={14} className="text-green-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('quarterly_pro')} className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: '#10b981', color: '#fff' }}>
                  {loading === 'quarterly_pro' ? <Icon name="loader" size={16} className="animate-spin mx-auto" /> : 'Get Quarterly Pro'}
                </button>
              </div>

              {/* Desktop */}
              <div className="relative p-6 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#8b5cf6', color: '#fff' }}>LIFETIME</div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Icon name="terminal" size={20} className="text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Desktop</h3>
                </div>
                <p className="text-gray-500 text-xs mb-5">One-time purchase, own forever</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">$300</span>
                  <span className="text-gray-500 text-sm">once</span>
                </div>
                <div className="text-purple-400 text-xs mb-5">No subscription, ever</div>
                <ul className="space-y-3 mb-6">
                  {['Unlimited forever', 'Use your own API keys', 'Offline mode', 'All future updates', 'No recurring fees'].map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-gray-400 text-sm">
                      <Icon name="check" size={14} className="text-purple-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('desktop_lifetime')} className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-purple-500/80" style={{ background: '#8b5cf6', color: '#fff' }}>
                  {loading === 'desktop_lifetime' ? <Icon name="loader" size={16} className="animate-spin mx-auto" /> : 'Buy Desktop'}
                </button>
              </div>
            </div>
            <p className="text-center text-gray-600 text-xs mt-6">30-day money-back guarantee · Secure payment via Stripe</p>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section id="testimonials" data-animate className={`py-16 transition-all duration-700 ${isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-center gap-3 mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Loved by Engineers</h2>
              <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(250, 204, 21, 0.08)' }}>
                {[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={12} className="text-yellow-400" />)}
                <span className="text-yellow-400 font-bold text-xs ml-1">4.9</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {testimonials.map((t, i) => (
                <div key={i} className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: t.color }}>{t.avatar}</div>
                    <div>
                      <div className="text-white font-semibold text-sm">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" data-animate className={`py-16 transition-all duration-700 ${isVisible('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">FAQ</h2>
            <div className="space-y-2.5">
              {faqItems.map((faq, i) => (
                <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ background: expandedFaq === i ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${expandedFaq === i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}` }}>
                  <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left">
                    <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                    <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${expandedFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 pb-4">
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-6">
            <div className="p-10 rounded-2xl text-center" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))', border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 0 60px rgba(16, 185, 129, 0.08)' }}>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Land Your Dream Job?</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">Join 50,000+ engineers acing interviews and securing top offers.</p>
              <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>
                {loading === 'google' ? <Icon name="loader" size={18} className="animate-spin" /> : 'Start Free Trial — No Credit Card'}
              </button>
              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Icon name="ascend" size={16} className="text-white" />
                </div>
                <span className="text-white font-bold">Ascend</span>
              </div>
              <div className="flex items-center gap-5 text-xs text-gray-500">
                <a href="/docs" className="hover:text-white transition-colors">Docs</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="mailto:support@cariara.com" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t text-center text-gray-600 text-xs" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              © 2025 Ascend by Cariara. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
    </div>
  );
}

// ── Inline SVG Icons for OAuth buttons ──
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
  );
}
