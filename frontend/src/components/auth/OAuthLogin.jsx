import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

/**
 * Ascend Landing Page — World-class, enterprise-grade
 * Highlights full end-to-end pipeline: Job Discovery → Resume/CL → Prep → Interview → Offer
 * Compact, no duplicates, modern bento grid, performance metrics, competitor comparison
 */
export default function OAuthLogin({ loginOnly = false }) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeDemo, setActiveDemo] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [counters, setCounters] = useState({ users: 0, offers: 0, salary: 0, speed: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [activePipeline, setActivePipeline] = useState(0);
  const [typedCode, setTypedCode] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Typing animation for hero mockup
  useEffect(() => {
    const code = `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i\n    return []`;
    let idx = 0;
    const typeInterval = setInterval(() => {
      if (idx <= code.length) {
        setTypedCode(code.slice(0, idx));
        idx++;
      } else {
        clearInterval(typeInterval);
      }
    }, 35);
    const cursorInterval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => { clearInterval(typeInterval); clearInterval(cursorInterval); };
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setVisibleSections((prev) => new Set([...prev, entry.target.id]));
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Sticky nav
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Auto-rotate demo & pipeline
  useEffect(() => {
    const i1 = setInterval(() => setActiveDemo((p) => (p + 1) % 3), 6000);
    const i2 = setInterval(() => setActivePipeline((p) => (p + 1) % 5), 4000);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, []);

  // Animated counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          const targets = { users: 50000, offers: 17500, salary: 35, speed: 1.2 };
          const steps = 50;
          let step = 0;
          const interval = setInterval(() => {
            step++;
            const e = 1 - Math.pow(1 - step / steps, 3);
            setCounters({
              users: Math.round(targets.users * e),
              offers: Math.round(targets.offers * e),
              salary: Math.round(targets.salary * e),
              speed: +(targets.speed * e).toFixed(1),
            });
            if (step >= steps) clearInterval(interval);
          }, 30);
        }
      }),
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

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
  const vis = (id) => visibleSections.has(id);
  const anim = (id) => `transition-all duration-700 ${vis(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  // ── Pipeline stages ──
  const pipeline = [
    { icon: 'search', label: 'Find Jobs', color: '#06b6d4', desc: 'AI scrapes and matches jobs from top boards based on your profile, skills, and preferences.' },
    { icon: 'resume', label: 'Auto Resume & CL', color: '#8b5cf6', desc: 'Generate tailored resumes and cover letters for each role. ATS-optimized, one-click export to PDF/DOCX.' },
    { icon: 'target', label: 'Interview Prep', color: '#f59e0b', desc: 'Company-specific prep with pitch, behavioral questions, system design prompts, and culture insights.' },
    { icon: 'microphone', label: 'Live Assistant', color: '#10b981', desc: 'Real-time voice transcription with instant AI answers during live interviews. 100% invisible.' },
    { icon: 'trophy', label: 'Land Offers', color: '#ec4899', desc: 'Ace every round — coding, system design, behavioral — and secure offers from top companies.' },
  ];

  // ── FAQ ──
  const faqItems = [
    { q: 'How does Ascend work?', a: 'Paste a problem, take a screenshot, or enable live transcription. Our AI provides instant, accurate solutions with detailed explanations. Upload your JD and resume for company-specific prep.' },
    { q: 'Is it really undetectable?', a: "Yes. Ascend is completely invisible during screen sharing — it doesn't appear in your dock, taskbar, or task manager. Works with Zoom, Meet, Teams, and all coding platforms." },
    { q: 'What languages and platforms are supported?', a: 'We support 20+ programming languages including Python, JavaScript, Java, C++, Go, Rust, and SQL. Works with HackerRank, LeetCode, CoderPad, CodeSignal, and more.' },
    { q: 'Can I generate resumes and cover letters?', a: 'Yes! Upload your resume and a job description — Ascend generates tailored cover letters and interview prep materials. Export to PDF or DOCX.' },
    { q: 'How is Desktop different from subscriptions?', a: 'Desktop is a one-time purchase with lifetime access. You use your own API keys (Claude or GPT-4), so there are no ongoing fees. Perfect for power users.' },
    { q: 'Do you offer refunds?', a: 'Yes, 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund. No questions asked.' },
    { q: 'Is my data secure?', a: "Absolutely. We don't store your interview questions or solutions. All processing happens in real-time and is immediately discarded." },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Stripe', 'OpenAI', 'Netflix'];

  const testimonials = [
    { name: 'Sarah M.', role: 'Senior SWE', company: 'Meta', text: 'Got offers from 3 FAANG companies. The prep generation and live assistant were game-changers — I felt prepared for everything.', avatar: 'S', color: '#10b981' },
    { name: 'James K.', role: 'Staff Engineer', company: 'Google', text: 'The system design diagrams alone are worth 10x the price. Auto-generated architecture diagrams with AWS components blew my interviewers away.', avatar: 'J', color: '#3b82f6' },
    { name: 'Priya R.', role: 'Eng Manager', company: 'Netflix', text: 'The voice assistant is incredible — live transcription of questions with instant STAR responses. I never blanked out once.', avatar: 'P', color: '#8b5cf6' },
    { name: 'Michael T.', role: 'SDE II', company: 'Amazon', text: 'Failed 5 interviews before Ascend. The company-specific prep with tailored questions and resume matching changed everything. 3 offers in 2 months.', avatar: 'M', color: '#f59e0b' },
    { name: 'Emily C.', role: 'Backend Eng', company: 'Stripe', text: 'The end-to-end pipeline — from job scraping to offer — saved me weeks. Auto-generated cover letters matched perfectly to each JD.', avatar: 'E', color: '#ec4899' },
    { name: 'David L.', role: 'Senior SWE', company: 'Microsoft', text: 'Stealth mode during live interviews is flawless. My screen share showed nothing. The code execution and auto-fix features are incredibly fast.', avatar: 'D', color: '#06b6d4' },
  ];

  // ── Login-only mode ──
  if (loginOnly) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-md p-8 rounded-2xl text-center" style={{ background: '#141419', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Icon name="ascend" size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to Ascend</h2>
          <p className="text-gray-400 mb-8">Log in to access your interview toolkit.</p>
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

  // ══════════════════════════════════════════════════════════════════════════════
  // FULL LANDING PAGE
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen relative" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient BG with AI-era orbs */}
      <div className="fixed inset-0 pointer-events-none noise-bg">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {/* Primary green orb */}
        <div className="absolute w-[900px] h-[900px] rounded-full orb-pulse" style={{ background: 'radial-gradient(circle, #10b98118 0%, transparent 55%)', top: '-350px', left: '50%' }} />
        {/* Secondary blue orb */}
        <div className="absolute w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, #3b82f610 0%, transparent 55%)', top: '40%', right: '-200px', opacity: 0.15, animation: 'orbPulse 10s ease-in-out infinite 2s' }} />
        {/* Tertiary purple orb */}
        <div className="absolute w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, #8b5cf610 0%, transparent 55%)', bottom: '10%', left: '-150px', opacity: 0.1, animation: 'orbPulse 12s ease-in-out infinite 4s' }} />
      </div>

      <div className="relative z-10">

        {/* ═══════════════ STICKY NAV ═══════════════ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2.5' : 'py-4'}`} style={{ background: scrolled ? 'rgba(9, 9, 11, 0.88)' : 'transparent', backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Ascend</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'How It Works', id: 'pipeline' },
                { label: 'Features', id: 'features' },
                { label: 'Demo', id: 'demo' },
                { label: 'Pricing', id: 'pricing' },
                { label: 'Reviews', id: 'testimonials' },
              ].map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="px-4 py-2 text-base text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">{item.label}</button>
              ))}
              <a href="/docs" className="px-4 py-2 text-base text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Docs</a>
            </div>
            <button onClick={() => handleOAuthLogin('google')} className="px-6 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              Get Started Free
            </button>
          </div>
        </nav>

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="pt-36 pb-16 max-w-7xl mx-auto px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* AI-era trust badge with shimmer */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 ai-shimmer" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <Icon name="sparkles" size={16} className="text-green-400" />
              #1 AI-Powered Interview Platform — 50,000+ Engineers
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[5.25rem] font-black mb-7 leading-[1.04] tracking-tight">
              <span className="text-white">From Job Search to</span>
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #a7f3d0 100%)', WebkitBackgroundClip: 'text' }}>Offer Letter</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The only platform that handles <span className="text-white font-medium">everything</span> — job discovery, resume generation, interview prep, live AI assistance, and offer negotiation. <span className="text-white font-medium">100% invisible.</span>
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {loading === 'google' ? <Icon name="loader" size={22} className="animate-spin mx-auto" /> : 'Start Free — No Credit Card'}
              </button>
              <button onClick={() => scrollTo('demo')} className="px-10 py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon name="play" size={18} /> Watch Demo
              </button>
            </div>

            {/* AI model badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {[
                { label: 'Claude Opus / Sonnet', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.2)' },
                { label: 'GPT-4o', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' },
                { label: 'Whisper + Deepgram', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium" style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}>
                  <Icon name="brain" size={14} />
                  {m.label}
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center gap-5 mb-14">
              <div className="flex -space-x-2.5">
                {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'].map((c, i) => (
                  <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#09090b]" style={{ background: c }}>
                    {['S', 'J', 'P', 'M', 'E'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-lg">
                <div className="flex">{[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={18} className="text-yellow-400" />)}</div>
                <span className="text-gray-400"><span className="text-white font-semibold">4.9</span> from 2,000+ reviews</span>
              </div>
            </div>
          </div>

          {/* ── Hero Product Mockup ── */}
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c1220, #141c2e)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16, 185, 129, 0.06)' }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1 rounded-md text-xs" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Icon name="lock" size={10} className="text-green-400" />
                    <span className="text-gray-400">ascend.cariara.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <span className="text-green-400 text-[10px] font-medium">Stealth Active</span>
                </div>
              </div>

              {/* App UI mockup */}
              <div className="grid grid-cols-12 min-h-[340px]">
                {/* Sidebar */}
                <div className="col-span-2 p-3 hidden md:block" style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <img src={import.meta.env.BASE_URL + 'ascend-icon.png'} alt="Ascend" className="w-5 h-5" />
                    <span className="text-white text-xs font-bold">Ascend</span>
                  </div>
                  {[
                    { label: 'Coding', icon: 'code', active: true, color: '#10b981' },
                    { label: 'System Design', icon: 'systemDesign', color: '#3b82f6' },
                    { label: 'Behavioral', icon: 'users', color: '#8b5cf6' },
                    { label: 'Prep', icon: 'briefcase', color: '#f59e0b' },
                    { label: 'Voice', icon: 'microphone', color: '#ec4899' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 text-[10px] ${item.active ? 'text-white' : 'text-gray-500'}`} style={item.active ? { background: `${item.color}15`, borderLeft: `2px solid ${item.color}` } : {}}>
                      <Icon name={item.icon} size={12} style={item.active ? { color: item.color } : {}} />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Problem panel */}
                <div className="col-span-5 md:col-span-4 p-4" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider">Problem</span>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>Medium</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>Arrays</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="text-gray-300 text-xs leading-relaxed">Given an array of integers <span className="text-green-400 font-mono">nums</span> and an integer <span className="text-green-400 font-mono">target</span>, return indices of the two numbers such that they add up to <span className="text-green-400 font-mono">target</span>.</p>
                  </div>
                  <div className="p-2.5 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-gray-500 text-[9px] uppercase mb-1">Example</div>
                    <div className="font-mono text-[10px]">
                      <div className="text-gray-400">Input: <span className="text-cyan-400">[2,7,11,15]</span>, target=<span className="text-amber-400">9</span></div>
                      <div className="text-gray-400">Output: <span className="text-green-400">[0, 1]</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 py-1.5 rounded-lg text-center text-[10px] font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      Solve
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-[10px] text-gray-400 flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Icon name="camera" size={10} /> Screenshot
                    </div>
                  </div>
                </div>

                {/* Solution panel */}
                <div className="col-span-7 md:col-span-6 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[10px] uppercase tracking-wider">AI Solution</span>
                      <span className="flex items-center gap-1 text-[9px] text-green-400"><span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />Streaming</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>O(n) time</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>O(n) space</span>
                    </div>
                  </div>
                  {/* Animated code typing */}
                  <div className="rounded-lg p-3 font-mono text-[11px] leading-relaxed mb-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <pre className="text-green-400 whitespace-pre-wrap">{typedCode}<span className={`inline-block w-[6px] h-[13px] ml-[1px] -mb-[2px] ${cursorVisible ? 'bg-green-400' : 'bg-transparent'}`} /></pre>
                  </div>
                  {/* Explanation cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.06)' }}>
                      <div className="text-[9px] font-semibold text-green-400 mb-0.5">Approach</div>
                      <div className="text-gray-300 text-[10px]">Hash map for O(1) complement lookups</div>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.06)' }}>
                      <div className="text-[9px] font-semibold text-purple-400 mb-0.5">Pattern</div>
                      <div className="text-gray-300 text-[10px]">Two Sum → Hash Map</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Icon name="brain" size={10} className="text-green-400" /> Claude Sonnet 4</span>
                  <span>Python</span>
                  <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded text-[8px] bg-white/5 border border-white/10">Cmd</kbd><span>+</span><kbd className="px-1 py-0.5 rounded text-[8px] bg-white/5 border border-white/10">Enter</kbd> to solve</span>
                </div>
              </div>
            </div>

            {/* Glow effect under mockup */}
            <div className="h-px mx-12 mt-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)' }} />

            {/* Platform compatibility strip */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <span className="text-gray-600 text-[10px] uppercase tracking-wider">Works with</span>
              {['Zoom', 'Google Meet', 'Teams', 'HackerRank', 'LeetCode', 'CoderPad', 'CodeSignal'].map((p, i) => (
                <span key={i} className="text-gray-500 text-[11px] font-medium hover:text-gray-300 transition-colors cursor-default">{p}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ COMPANY LOGOS ═══════════════ */}
        <section className="py-10 border-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-6xl mx-auto px-8">
            <p className="text-center text-gray-600 text-sm mb-5 uppercase tracking-wider">Engineers using Ascend landed offers at</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
              {companies.map((name, i) => (
                <span key={i} className="text-gray-500 font-semibold text-xl hover:text-gray-300 transition-colors cursor-default">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ END-TO-END PIPELINE ═══════════════ */}
        <section id="pipeline" data-animate className={`py-16 ${anim('pipeline')}`}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Your Complete Interview Pipeline</h2>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">No other platform covers the full journey. Ascend takes you from job search to signed offer.</p>
            </div>

            {/* Pipeline steps */}
            <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-10">
              {pipeline.map((step, i) => (
                <button key={i} onClick={() => setActivePipeline(i)} className={`flex-1 p-5 rounded-2xl text-left transition-all group ${activePipeline === i ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`} style={{
                  background: activePipeline === i ? `${step.color}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activePipeline === i ? step.color + '40' : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: activePipeline === i ? `0 0 30px ${step.color}10` : 'none',
                }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${step.color}15` }}>
                      <Icon name={step.icon} size={22} style={{ color: step.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${step.color}20`, color: step.color }}>{String(i + 1).padStart(2, '0')}</span>
                      {i < 4 && <span className="hidden lg:inline text-gray-600 text-base">→</span>}
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{step.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </button>
              ))}
            </div>

            {/* Pipeline detail preview */}
            <div className="p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {activePipeline === 0 && (
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { title: 'Smart Job Matching', desc: 'AI analyzes your resume and preferences to find the best-fit roles across top job boards', icon: 'search' },
                    { title: 'Company Research', desc: 'Auto-scrape Glassdoor, LinkedIn, and company pages for interview intel and culture insights', icon: 'building' },
                    { title: 'Application Tracking', desc: 'Track every application, interview stage, and follow-up in one unified dashboard', icon: 'chartBar' },
                  ].map((f, i) => (
                    <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                      <Icon name={f.icon} size={24} className="text-cyan-400 mb-3" />
                      <h4 className="text-white text-lg font-semibold mb-2">{f.title}</h4>
                      <p className="text-gray-400 text-base leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              {activePipeline === 1 && (
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { title: 'Tailored Resumes', desc: 'AI generates ATS-optimized resumes matched to each job description and company culture', icon: 'resume' },
                    { title: 'Cover Letters', desc: 'One-click cover letters that highlight relevant experience and align with role requirements', icon: 'coverLetter' },
                    { title: 'Export PDF/DOCX', desc: 'Professional formatting with export to PDF and DOCX. Ready to submit instantly', icon: 'download' },
                  ].map((f, i) => (
                    <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                      <Icon name={f.icon} size={24} className="text-purple-400 mb-3" />
                      <h4 className="text-white text-lg font-semibold mb-2">{f.title}</h4>
                      <p className="text-gray-400 text-base leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              {activePipeline === 2 && (
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { title: 'Company-Specific Prep', desc: 'Upload JD + resume and get tailored pitch, behavioral questions, and technical focus areas', icon: 'target' },
                    { title: 'STAR Responses', desc: 'AI generates structured behavioral answers using the STAR method for leadership and teamwork', icon: 'users' },
                    { title: 'System Design Prompts', desc: 'Practice with company-relevant design questions and auto-generated architecture diagrams', icon: 'systemDesign' },
                  ].map((f, i) => (
                    <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                      <Icon name={f.icon} size={24} className="text-amber-400 mb-3" />
                      <h4 className="text-white text-lg font-semibold mb-2">{f.title}</h4>
                      <p className="text-gray-400 text-base leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              {activePipeline === 3 && (
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { title: 'Voice Transcription', desc: 'Real-time speech-to-text captures interviewer questions instantly using Whisper + Deepgram', icon: 'microphone' },
                    { title: 'Instant AI Answers', desc: 'Get staff-engineer-level responses in <2 seconds. Coding, system design, behavioral — all modes', icon: 'zap' },
                    { title: '100% Stealth Mode', desc: 'Invisible during screen sharing. Hidden from dock, taskbar, and task manager on all platforms', icon: 'eyeOff' },
                  ].map((f, i) => (
                    <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                      <Icon name={f.icon} size={24} className="text-green-400 mb-3" />
                      <h4 className="text-white text-lg font-semibold mb-2">{f.title}</h4>
                      <p className="text-gray-400 text-base leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              {activePipeline === 4 && (
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { title: 'Multiple Offers', desc: 'Users report 3-5x higher offer rates. Practice and real-time assist combine for maximum success', icon: 'trophy' },
                    { title: '35% Salary Increase', desc: 'Average salary bump for Ascend users who switched jobs using our platform', icon: 'trendUp' },
                    { title: '500+ Companies', desc: 'Engineers have landed offers at 500+ companies worldwide including FAANG, unicorns, and startups', icon: 'globe' },
                  ].map((f, i) => (
                    <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                      <Icon name={f.icon} size={24} className="text-pink-400 mb-3" />
                      <h4 className="text-white text-lg font-semibold mb-2">{f.title}</h4>
                      <p className="text-gray-400 text-base leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════ BENTO FEATURE GRID ═══════════════ */}
        <section id="features" data-animate className={`py-16 ${anim('features')}`}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                <Icon name="sparkles" size={10} />
                Powered by Claude & GPT-4
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Built for Every Interview Type</h2>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">AI-powered tools for coding, system design, behavioral, and live interviews</p>
            </div>

            {/* Bento grid — 2 large + 4 medium */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Large: Live Interview Assistant */}
              <div className="md:col-span-2 p-8 rounded-3xl group hover:scale-[1.01] transition-all" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                    <Icon name="microphone" size={22} className="text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-white">Live Interview Assistant</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>FLAGSHIP</span>
                    </div>
                    <p className="text-gray-400 text-lg">Real-time voice transcription with instant AI-powered answers. Works with Zoom, Meet, Teams. Invisible during screen sharing.</p>
                  </div>
                </div>
                {/* Live waveform visualization */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-[10px] font-medium font-code">LIVE</span>
                  </div>
                  <div className="flex items-end gap-[2px] h-5">
                    {[3, 5, 8, 4, 7, 10, 6, 9, 3, 7, 5, 8, 4, 6, 9, 7, 5, 3, 8, 6, 10, 4, 7, 5].map((h, i) => (
                      <div key={i} className="w-[3px] rounded-full bg-green-400" style={{ height: `${h * 2}px`, opacity: 0.4 + (h / 15), animation: `float ${1.5 + (i % 3) * 0.5}s ease-in-out infinite ${i * 0.1}s` }} />
                    ))}
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Icon name="eyeOff" size={11} className="text-gray-500" />
                    <span className="text-gray-500 text-[10px] font-code">Invisible to screen share</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Live Transcription', 'Instant Answers', 'Stealth Mode', 'All Platforms'].map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <Icon name="check" size={12} className="text-green-400" />
                      <span className="text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium: Code Execution */}
              <div className="p-7 rounded-2xl group hover:scale-[1.01] transition-all" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(6, 182, 212, 0.02))', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(6, 182, 212, 0.12)' }}>
                  <Icon name="terminal" size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Code Execution</h3>
                <p className="text-gray-400 text-base mb-4">Run code in 20+ languages with auto-fix. Test solutions instantly with a built-in sandbox.</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Python', 'JS', 'Java', 'C++', 'Go', 'Rust'].map((l, i) => (
                    <span key={i} className="px-3 py-1 rounded-md text-sm font-medium" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#67e8f9' }}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Medium: AI Coding Engine */}
              <div className="p-7 rounded-2xl group hover:scale-[1.01] transition-all" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02))', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                  <Icon name="code" size={20} className="text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">AI Coding Engine</h3>
                <p className="text-gray-400 text-base mb-4">Instant solutions with line-by-line explanations, complexity analysis, and edge case identification.</p>
                <div className="flex flex-wrap gap-1.5">
                  {['O(n) Analysis', 'Auto-Fix', 'Follow-up Q&A'].map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-md text-sm font-medium" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd' }}>{f}</span>
                  ))}
                </div>
              </div>

              {/* Medium: System Design */}
              <div className="p-7 rounded-2xl group hover:scale-[1.01] transition-all" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                  <Icon name="systemDesign" size={20} className="text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">System Design</h3>
                <p className="text-gray-400 text-base mb-4">Auto-generated architecture diagrams for AWS, GCP, Azure. High-level and low-level deep dives.</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Auto Diagrams', 'AWS/GCP/Azure', 'Scalability'].map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-md text-sm font-medium" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d' }}>{f}</span>
                  ))}
                </div>
              </div>

              {/* Medium: Behavioral STAR */}
              <div className="p-7 rounded-2xl group hover:scale-[1.01] transition-all" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.02))', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(168, 85, 247, 0.12)' }}>
                  <Icon name="users" size={20} className="text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Behavioral Coaching</h3>
                <p className="text-gray-400 text-base mb-4">AI-generated STAR responses for leadership, teamwork, and conflict resolution interviews.</p>
                <div className="flex flex-wrap gap-1.5">
                  {['STAR Method', 'Leadership', 'Follow-ups'].map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-md text-sm font-medium" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c4b5fd' }}>{f}</span>
                  ))}
                </div>
              </div>

              {/* Large: Company-Specific Prep */}
              <div className="md:col-span-2 p-8 rounded-3xl group hover:scale-[1.01] transition-all" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139, 92, 246, 0.12)' }}>
                    <Icon name="briefcase" size={22} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-white">Company-Specific Interview Prep</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' }}>AI GENERATED</span>
                    </div>
                    <p className="text-gray-400 text-lg">Upload your JD + resume → get tailored pitch, behavioral questions, system design prompts, company culture insights, and technical focus areas.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Custom Pitch', 'STAR Responses', 'Tech Focus Areas', 'Export PDF/DOCX'].map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <Icon name="check" size={12} className="text-purple-400" />
                      <span className="text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium: Screenshot OCR */}
              <div className="p-7 rounded-2xl group hover:scale-[1.01] transition-all" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(236, 72, 153, 0.02))', border: '1px solid rgba(236, 72, 153, 0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(236, 72, 153, 0.12)' }}>
                  <Icon name="camera" size={20} className="text-pink-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Screenshot Solver</h3>
                <p className="text-gray-400 text-base mb-4">Snap a screenshot of any problem. AI extracts the text and generates a complete solution instantly.</p>
                <div className="flex flex-wrap gap-1.5">
                  {['OCR Extraction', 'Instant Solve', 'Any Platform'].map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-md text-sm font-medium" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#f9a8d4' }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional capabilities strip */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {[
                { icon: 'brain', label: 'Claude + GPT-4', color: '#10b981' },
                { icon: 'globe', label: 'Web + Desktop + Extension', color: '#3b82f6' },
                { icon: 'lock', label: 'Stealth Mode', color: '#8b5cf6' },
                { icon: 'document', label: 'Problem Library', color: '#f59e0b' },
                { icon: 'users', label: 'Behavioral STAR', color: '#ec4899' },
                { icon: 'compass', label: 'Roadmaps & Projects', color: '#06b6d4' },
              ].map((cap, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-base" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon name={cap.icon} size={12} style={{ color: cap.color }} />
                  <span className="text-gray-400">{cap.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ BY THE NUMBERS ═══════════════ */}
        <section ref={statsRef} data-animate id="stats" className={`py-20 ${anim('stats')}`}>
          <div className="max-w-6xl mx-auto px-8">
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 p-10 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl glow-border" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(139,92,246,0.05) 100%)' }} />
              {[
                { value: `${counters.users.toLocaleString()}+`, label: 'Active Users', color: '#10b981', icon: 'users' },
                { value: `${counters.offers.toLocaleString()}+`, label: 'Offers Secured', color: '#3b82f6', icon: 'trophy' },
                { value: `${counters.salary}%`, label: 'Avg Salary Increase', color: '#8b5cf6', icon: 'trendUp' },
                { value: `${counters.speed}s`, label: 'Avg Response Time', color: '#f59e0b', icon: 'zap' },
              ].map((stat, i) => (
                <div key={i} className="text-center relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${stat.color}10` }}>
                    <Icon name={stat.icon} size={20} style={{ color: stat.color }} />
                  </div>
                  <div className="text-4xl md:text-5xl font-black mb-2 tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ LIVE DEMO ═══════════════ */}
        <section id="demo" data-animate className={`py-14 ${anim('demo')}`}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">See It in Action</h2>
              <p className="text-gray-400 text-xl">Real-time AI solving interview problems</p>
            </div>

            <div className="flex justify-center gap-2 mb-5">
              {[
                { id: 0, label: 'Coding', icon: 'code', color: '#10b981' },
                { id: 1, label: 'System Design', icon: 'systemDesign', color: '#3b82f6' },
                { id: 2, label: 'Behavioral', icon: 'users', color: '#8b5cf6' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveDemo(tab.id)} className="px-5 py-2.5 rounded-xl text-base font-semibold flex items-center gap-2 transition-all" style={{
                  background: activeDemo === tab.id ? `${tab.color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeDemo === tab.id ? tab.color : 'rgba(255,255,255,0.06)'}`,
                  color: activeDemo === tab.id ? tab.color : '#9ca3af',
                }}>
                  <Icon name={tab.icon} size={13} />{tab.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-gray-600 text-xs font-mono ml-2">ascend</span>
              </div>
              <div className="p-6" style={{ minHeight: '260px' }}>
                {activeDemo === 0 && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">Problem</div>
                      <div className="p-3 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
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
                    <div className="space-y-2.5">
                      <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Analysis</div>
                      {[
                        { label: 'Time', value: 'O(n) — Single pass', color: '#10b981' },
                        { label: 'Space', value: 'O(n) — Hash map', color: '#3b82f6' },
                        { label: 'Pattern', value: 'Hash map for O(1) lookups', color: '#8b5cf6' },
                      ].map((a, i) => (
                        <div key={i} className="p-2.5 rounded-lg" style={{ background: `${a.color}08` }}>
                          <div className="text-[10px] font-semibold mb-0.5" style={{ color: a.color }}>{a.label}</div>
                          <div className="text-white text-sm">{a.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeDemo === 1 && (
                  <div>
                    <div className="flex items-center gap-2 text-blue-400 font-semibold mb-4 text-sm">
                      <Icon name="systemDesign" size={16} /> URL Shortener — High Level Design
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {[
                        { name: 'Users', color: '#3b82f6', bg: '#1e3a5f' },
                        { name: 'Load Balancer', color: '#3b82f6', bg: '#1e3a5f' },
                        { name: 'API Servers', color: '#22d3ee', bg: '#164e63' },
                        { name: 'Cache + DB', color: '#22c55e', bg: '#1e2e1e' },
                        { name: 'CDN', color: '#a855f7', bg: '#2e1e3f' },
                      ].map((n, i) => (
                        <div key={i} className="p-2.5 rounded-lg text-center" style={{ background: n.bg, border: `1px solid ${n.color}40` }}>
                          <div className="text-[10px] font-semibold" style={{ color: n.color }}>{n.name}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { title: 'Scalability', items: ['Horizontal scaling with K8s', 'Read replicas for DB', 'Cache-aside pattern'] },
                        { title: 'Tech Stack', items: ['Go for high throughput', 'Redis for caching', 'PostgreSQL + S3'] },
                      ].map((col, i) => (
                        <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="text-gray-500 text-[10px] uppercase mb-1.5">{col.title}</div>
                          <ul className="text-gray-300 text-xs space-y-1">{col.items.map((item, j) => <li key={j}>• {item}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeDemo === 2 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center"><Icon name="question" size={13} className="text-purple-400" /></div>
                      <span className="text-gray-400 text-sm">Interviewer:</span>
                      <span className="text-white text-sm">"Tell me about a time you dealt with a difficult teammate."</span>
                    </div>
                    <div className="p-5 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.12)' }}>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Icon name="sparkles" size={13} className="text-purple-400" />
                        <span className="text-purple-400 font-semibold text-sm">STAR Response</span>
                      </div>
                      <div className="space-y-2 text-gray-300 text-sm">
                        <p><span className="text-white font-semibold">Situation:</span> A senior engineer was dismissive of my suggestions on a critical migration...</p>
                        <p><span className="text-white font-semibold">Task:</span> I needed to find a way to collaborate effectively without escalating...</p>
                        <p><span className="text-white font-semibold">Action:</span> Scheduled a 1:1, actively listened, proposed a compromise on architecture...</p>
                        <p><span className="text-white font-semibold">Result:</span> Delivered 2 weeks early, became close collaborators on 3 subsequent projects.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ COMPARISON + FAQ (side-by-side) ═══════════════ */}
        <section data-animate id="comparison" className={`py-16 ${anim('comparison')}`}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Comparison Table */}
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Why Engineers Choose Ascend</h2>
                  <p className="text-gray-400 text-lg">The only all-in-one platform</p>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'rgba(16, 185, 129, 0.06)' }}>
                          <th className="text-left p-3 text-gray-400 font-medium text-xs">Feature</th>
                          <th className="p-3 text-green-400 font-bold text-xs">Ascend</th>
                          <th className="p-3 text-gray-500 font-medium text-xs">LockedIn</th>
                          <th className="p-3 text-gray-500 font-medium text-xs">Others</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { f: 'Live Interview Assistant', a: true, b: true, c: false },
                          { f: 'AI Coding Solutions', a: true, b: true, c: false },
                          { f: 'System Design Diagrams', a: true, b: false, c: false },
                          { f: 'Behavioral STAR', a: true, b: false, c: false },
                          { f: 'Company-Specific Prep', a: true, b: false, c: false },
                          { f: 'Resume & CL Generation', a: true, b: true, c: false },
                          { f: 'Code Execution', a: true, b: false, c: false },
                          { f: 'Screenshot OCR', a: true, b: false, c: false },
                          { f: 'Stealth Mode', a: true, b: true, c: false },
                          { f: 'Desktop Lifetime', a: true, b: true, c: false },
                          { f: 'Choose AI Provider', a: true, b: false, c: false },
                        ].map((row, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.12)' : 'transparent' }}>
                            <td className="p-2.5 text-gray-300 text-sm">{row.f}</td>
                            {['a', 'b', 'c'].map((k) => (
                              <td key={k} className="p-2.5 text-center">
                                {row[k] ? <Icon name="check" size={14} className={k === 'a' ? 'text-green-400 mx-auto' : 'text-gray-500 mx-auto'} /> : <Icon name="x" size={14} className="text-gray-700 mx-auto" />}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right: FAQ */}
              <div id="faq">
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">FAQ</h2>
                  <p className="text-gray-400 text-lg">Everything you need to know</p>
                </div>
                <div className="space-y-2">
                  {faqItems.map((faq, i) => (
                    <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ background: expandedFaq === i ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${expandedFaq === i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}` }}>
                      <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full px-5 py-3.5 flex items-center justify-between text-left">
                        <span className="text-white font-medium text-base pr-3">{faq.q}</span>
                        <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${expandedFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-5 pb-3.5">
                          <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ TESTIMONIALS (compact single row) ═══════════════ */}
        <section id="testimonials" data-animate className={`py-14 ${anim('testimonials')}`}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Loved by Engineers</h2>
                <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(250, 204, 21, 0.08)' }}>
                  {[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={12} className="text-yellow-400" />)}
                  <span className="text-yellow-400 font-bold text-xs ml-1">4.9</span>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {testimonials.map((t, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: t.color }}>{t.avatar}</div>
                    <div>
                      <div className="text-white font-semibold text-sm">{t.name}</div>
                      <div className="text-gray-500 text-[11px]">{t.role} @ {t.company}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ PRICING (compact) ═══════════════ */}
        <section id="pricing" data-animate className={`py-16 ${anim('pricing')}`}>
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Simple, Transparent Pricing</h2>
              <p className="text-gray-400 text-lg">Start free. Upgrade when ready. <a href="/premium" className="text-green-400 font-semibold hover:text-green-300 transition-colors">View full details →</a></p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Monthly */}
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="cloud" size={16} className="text-gray-400" />
                    <h3 className="text-lg font-bold text-white">Monthly</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$99</span>
                    <span className="text-gray-500 text-xs">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {['5 credits/month', 'Coding + System Design', 'Email support'].map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                      <Icon name="check" size={12} className="text-green-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('monthly')} className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
                  {loading === 'monthly' ? <Icon name="loader" size={14} className="animate-spin mx-auto" /> : 'Get Started'}
                </button>
              </div>

              {/* Quarterly Pro */}
              <div className="relative p-6 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03))', border: '2px solid #10b981', boxShadow: '0 0 30px rgba(16, 185, 129, 0.06)' }}>
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#10b981', color: '#fff' }}>POPULAR</div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="rocket" size={16} className="text-green-400" />
                    <h3 className="text-lg font-bold text-white">Quarterly Pro</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$300</span>
                    <span className="text-gray-400 text-xs">/qtr</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {['Unlimited everything', 'Voice assistant + Stealth', 'Company prep + Resume/CL', 'Job Discovery Portal'].map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Icon name="check" size={12} className="text-green-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('quarterly_pro')} className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: '#10b981', color: '#fff' }}>
                  {loading === 'quarterly_pro' ? <Icon name="loader" size={14} className="animate-spin mx-auto" /> : 'Get Quarterly Pro'}
                </button>
              </div>

              {/* Desktop */}
              <div className="relative p-6 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#8b5cf6', color: '#fff' }}>LIFETIME</div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="terminal" size={16} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Desktop</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$300</span>
                    <span className="text-gray-500 text-xs">once</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {['Unlimited forever', 'Your own API keys', 'Offline + All platforms'].map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                      <Icon name="check" size={12} className="text-purple-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('desktop_lifetime')} className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-purple-500/80" style={{ background: '#8b5cf6', color: '#fff' }}>
                  {loading === 'desktop_lifetime' ? <Icon name="loader" size={14} className="animate-spin mx-auto" /> : 'Buy Desktop'}
                </button>
              </div>
            </div>
            <p className="text-center text-gray-600 text-xs mt-4">30-day money-back guarantee · Secure payment via Stripe</p>
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="py-14">
          <div className="max-w-3xl mx-auto px-8">
            <div className="p-10 rounded-2xl text-center" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03))', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.05)' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Ready to Land Your Dream Job?</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto text-base">Join 50,000+ engineers who went from job search to offer letter with Ascend.</p>
              <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-8 py-3.5 rounded-xl font-bold text-base text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
                {loading === 'google' ? <Icon name="loader" size={16} className="animate-spin" /> : 'Start Free Trial — No Credit Card'}
              </button>
              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Icon name="ascend" size={14} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg">Ascend</span>
                <span className="text-gray-600 text-sm">— From job search to offer letter</span>
              </div>
              <div className="flex items-center gap-6 text-base text-gray-500">
                <a href="/docs" className="hover:text-white transition-colors">Docs</a>
                <a href="/download" className="hover:text-white transition-colors">Download</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="mailto:support@cariara.com" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t text-center text-gray-600 text-sm" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              © 2025 Ascend by Cariara. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        /* AI-era shimmer effect for badges and highlights */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .ai-shimmer {
          background: linear-gradient(90deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.08) 50%, rgba(16,185,129,0) 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }

        /* Gradient border glow for featured cards */
        @keyframes borderGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .glow-border { animation: borderGlow 3s ease-in-out infinite; }

        /* Floating animation for hero mockup elements */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-slow { animation: float 6s ease-in-out infinite; }
        .float-medium { animation: float 4s ease-in-out infinite; }

        /* Ambient orb pulse */
        @keyframes orbPulse {
          0%, 100% { opacity: 0.12; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.18; transform: translateX(-50%) scale(1.05); }
        }
        .orb-pulse { animation: orbPulse 8s ease-in-out infinite; }

        /* AI sparkle dots */
        @keyframes sparkleFade {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }

        /* Smooth reveal for sections */
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Monospace code font */
        .font-code { font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace; }

        /* Glass card effect */
        .glass-card {
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.06);
        }

        /* Noise texture overlay */
        .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.015;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

// ── Inline SVG Icons for OAuth ──
function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
function GithubIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>;
}
