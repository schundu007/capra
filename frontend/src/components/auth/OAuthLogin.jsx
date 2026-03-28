import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

export default function OAuthLogin({ loginOnly = false }) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
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

  // ── Login-only (for protected routes) ──
  if (loginOnly) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080c', fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="w-full max-w-md p-10 rounded-2xl text-center" style={{ background: 'linear-gradient(180deg, #111116 0%, #0d0d12 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Icon name="ascend" size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to Ascend</h2>
          <p className="text-gray-400 mb-8" style={{ fontFamily: "'General Sans', 'Inter', sans-serif" }}>Access your interview toolkit.</p>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={() => handleOAuthLogin('google')} disabled={!!loading} className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] mb-3" style={{ background: '#fff', color: '#000' }}>
            {loading === 'google' ? <Icon name="loader" size={18} className="animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
          </button>
          <button onClick={() => handleOAuthLogin('github')} disabled={!!loading} className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
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

  const navLinks = [
    { label: 'Interview', href: '/app/coding' },
    { label: 'Prep', href: '/prepare' },
    { label: 'Pricing', href: '/premium' },
    { label: 'Download', href: '/download' },
  ];

  return (
    <div className="landing-root min-h-screen overflow-x-hidden" style={{ background: '#08080c' }}>

      {/* ═══ BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px]" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px]" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">

        {/* ═══ NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`} style={{ background: scrolled ? 'rgba(8,8,12,0.8)' : 'transparent', backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent' }}>
          <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Icon name="ascend" size={20} className="text-white" />
              </div>
              <span className="text-[22px] font-bold text-white landing-display">Ascend</span>
            </a>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="px-5 py-2.5 rounded-xl text-[16px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200 landing-body">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => handleOAuthLogin('google')} disabled={!!loading} className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold text-white transition-all duration-300 hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] landing-body" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {loading === 'google' ? <Icon name="loader" size={16} className="animate-spin" /> : 'Get Started'}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-3 mx-6 p-5 rounded-2xl" style={{ background: 'rgba(14,14,20,0.98)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="block px-4 py-3.5 text-[16px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors landing-body">{link.label}</a>
              ))}
              <button onClick={() => handleOAuthLogin('google')} className="w-full mt-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold text-white landing-body" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Get Started Free
              </button>
            </div>
          )}
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="pt-32 sm:pt-40 pb-20 max-w-[1200px] mx-auto px-8">
          <div className="max-w-[700px] mx-auto text-center">
            <h1 className="text-[clamp(36px,6vw,64px)] font-bold leading-[1] tracking-[-0.03em] mb-6 landing-display">
              <span className="text-white">Your unfair advantage in </span>
              <span className="landing-gradient-text">every interview.</span>
            </h1>

            <p className="text-[17px] sm:text-[19px] text-gray-400 mb-8 max-w-[500px] mx-auto leading-[1.6] landing-body">
              AI-powered coding solutions, system design, and live interview assistance. Completely invisible to screen share.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="group px-7 py-3.5 rounded-2xl font-semibold text-[16px] text-white transition-all duration-300 hover:shadow-[0_8px_40px_rgba(16,185,129,0.25)] active:scale-[0.98] landing-body" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {loading === 'google' ? <Icon name="loader" size={18} className="animate-spin mx-auto" /> : (
                  <span className="flex items-center justify-center gap-2">
                    Start for free
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                )}
              </button>
              <a href="/prepare" className="px-7 py-3.5 rounded-2xl font-semibold text-[16px] text-gray-300 transition-all duration-300 hover:text-white hover:bg-white/[0.05] landing-body" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Explore prep guides
              </a>
            </div>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: '20+ programming languages', icon: 'code' },
                { label: 'Architecture diagrams', icon: 'systemDesign' },
                { label: 'Stealth mode', icon: 'eyeOff' },
              ].map((cap, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full landing-body" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon name={cap.icon} size={14} className="text-emerald-400" />
                  <span className="text-[13px] text-gray-400 font-medium">{cap.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRODUCT SHOWCASE ═══ */}
        <section className="pb-12 max-w-[1200px] mx-auto px-8">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
            {/* Window chrome */}
            <div className="px-5 py-3.5 flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef444480' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b80' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e80' }} />
              </div>
            </div>

            <div className="grid md:grid-cols-5">
              {/* Left panel: problem */}
              <div className="md:col-span-2 p-6 sm:p-7" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider landing-body" style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}>Medium</span>
                  <span className="text-gray-500 text-[13px] landing-body">Two Sum</span>
                </div>
                <p className="text-[15px] text-gray-300 leading-[1.7] mb-6 landing-body">
                  Given an array of integers and a target, return indices of the two numbers that add up to the target.
                </p>
                <div className="rounded-xl p-5" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <pre className="text-[13px] leading-[1.8] font-mono text-gray-400">
{`nums = [2, 7, 11, 15]
target = 9

→ [0, 1]`}
                  </pre>
                </div>
              </div>

              {/* Right panel: AI solution */}
              <div className="md:col-span-3 p-6 sm:p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[14px] text-emerald-400 font-semibold landing-body">AI Solution</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] landing-body">
                    <span className="px-2.5 py-1 rounded-lg text-gray-500" style={{ background: 'rgba(255,255,255,0.04)' }}>O(n) time</span>
                    <span className="px-2.5 py-1 rounded-lg text-gray-500" style={{ background: 'rgba(255,255,255,0.04)' }}>Python</span>
                  </div>
                </div>
                <div className="rounded-xl p-5 mb-5 font-mono text-[13px] leading-[2]" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <span className="text-violet-400">def</span> <span className="text-sky-300">two_sum</span><span className="text-gray-500">(</span><span className="text-gray-300">nums, target</span><span className="text-gray-500">):</span>{'\n'}
                  {'    '}<span className="text-gray-300">seen</span> <span className="text-gray-500">= {'{}'}</span>{'\n'}
                  {'    '}<span className="text-violet-400">for</span> <span className="text-gray-300">i, num</span> <span className="text-violet-400">in</span> <span className="text-sky-300">enumerate</span><span className="text-gray-500">(</span><span className="text-gray-300">nums</span><span className="text-gray-500">):</span>{'\n'}
                  {'        '}<span className="text-gray-300">diff</span> <span className="text-gray-500">=</span> <span className="text-gray-300">target - num</span>{'\n'}
                  {'        '}<span className="text-violet-400">if</span> <span className="text-gray-300">diff</span> <span className="text-violet-400">in</span> <span className="text-gray-300">seen</span><span className="text-gray-500">:</span>{'\n'}
                  {'            '}<span className="text-violet-400">return</span> <span className="text-gray-500">[</span><span className="text-gray-300">seen[diff], i</span><span className="text-gray-500">]</span>{'\n'}
                  {'        '}<span className="text-gray-300">seen[num]</span> <span className="text-gray-500">=</span> <span className="text-gray-300">i</span>
                </div>
                <div className="p-4 rounded-xl landing-body" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.08)' }}>
                  <p className="text-[13px] text-gray-400 leading-[1.7]">
                    <span className="text-emerald-400 font-semibold">Line 3-7:</span> Hash map stores each number's index. For each element, check if its complement exists — giving O(n) time vs O(n&sup2;) brute force.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHAT YOU GET ═══ */}
        <section className="py-12 max-w-[1200px] mx-auto px-8">
          <div className="mb-6">
            <h2 className="text-[clamp(24px,4vw,36px)] font-bold leading-[1.05] tracking-[-0.025em] text-white mb-3 landing-display">
              Built for engineers who<br className="hidden sm:block" /> take interviews seriously.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-gray-500 max-w-[520px] leading-[1.6] landing-body">
              Six tools. One platform. From problem to offer letter.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[
              { icon: 'microphone', title: 'Live Interview Mode', desc: 'Real-time AI answers during interviews. Invisible during any screen share or recording.', accent: '#10b981' },
              { icon: 'code', title: 'Coding Engine', desc: 'Solutions in 20+ languages. Line-by-line explanations, complexity analysis, auto-fix, and live execution.', accent: '#3b82f6' },
              { icon: 'systemDesign', title: 'System Design', desc: 'Architecture diagrams for AWS, GCP, and Azure. Trade-off analysis and scalability patterns.', accent: '#f59e0b' },
              { icon: 'briefcase', title: 'Company Prep', desc: 'Upload a job description and resume. Get a tailored pitch, behavioral questions, and focus areas.', accent: '#8b5cf6' },
              { icon: 'resume', title: 'Resume Builder', desc: 'ATS-optimized resume and cover letter generation tailored to each role. PDF and DOCX export.', accent: '#06b6d4' },
              { icon: 'eyeOff', title: 'Stealth Mode', desc: 'Hidden from screen share, dock, and task manager. Undetectable on Zoom, Meet, and Teams.', accent: '#ec4899' },
            ].map((f, i) => (
              <div key={i} className="group p-5 sm:p-6 transition-colors duration-300 hover:bg-white/[0.02]" style={{ background: '#0b0b10' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110" style={{ background: `${f.accent}0d`, border: `1px solid ${f.accent}18` }}>
                  <Icon name={f.icon} size={22} style={{ color: f.accent }} />
                </div>
                <h3 className="text-[16px] font-bold text-white mb-1.5 landing-display">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-[1.5] landing-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-12 max-w-[1200px] mx-auto px-8">
          <div className="mb-6">
            <h2 className="text-[clamp(24px,4vw,36px)] font-bold leading-[1.05] tracking-[-0.025em] text-white mb-3 landing-display">
              Three steps.<br />That's it.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Drop your problem in', desc: 'Paste text, upload a screenshot, or enter a LeetCode / HackerRank URL.' },
              { num: '2', title: 'Get the solution', desc: 'AI generates code with explanations, complexity, and architecture diagrams in seconds.' },
              { num: '3', title: 'Practice and refine', desc: 'Walk through step-by-step. Ask follow-up questions. Run code. Build confidence.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <span className="text-[60px] sm:text-[72px] font-black leading-none landing-display" style={{ color: 'rgba(255,255,255,0.03)' }}>{step.num}</span>
                <div className="mt-[-16px] sm:mt-[-20px] relative z-10">
                  <h3 className="text-[18px] sm:text-[20px] font-bold text-white mb-3 landing-display">{step.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-[1.5] landing-body">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-12 max-w-[1200px] mx-auto px-8">
          <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)', border: '1px solid rgba(16,185,129,0.1)' }}>
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]" style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />

            <div className="relative px-8 sm:px-10 py-10 sm:py-12 text-center">
              <h2 className="text-[clamp(24px,4vw,36px)] font-bold leading-[1.05] tracking-[-0.025em] text-white mb-6 landing-display">
                Start preparing today.
              </h2>
              <p className="text-[15px] sm:text-[16px] text-gray-400 mb-6 max-w-[480px] mx-auto leading-[1.6] landing-body">
                Free to start. Plans from $99/mo.<br />30-day money-back guarantee.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="group px-8 rounded-2xl font-semibold text-[18px] text-white transition-all duration-300 hover:shadow-[0_8px_40px_rgba(16,185,129,0.3)] active:scale-[0.98] landing-body" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '18px 36px' }}>
                  {loading === 'google' ? <Icon name="loader" size={20} className="animate-spin mx-auto" /> : (
                    <span className="flex items-center justify-center gap-3">
                      Get started free
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
                  )}
                </button>
                <a href="/premium" className="px-8 rounded-2xl font-semibold text-[18px] text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/[0.05] landing-body" style={{ padding: '18px 36px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  View pricing
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* ═══ FOOTER ═══ */}
        <footer className="py-10 max-w-[1200px] mx-auto px-8">
          <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
              <div>
                <a href="/" className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <Icon name="ascend" size={18} className="text-white" />
                  </div>
                  <span className="text-[20px] font-bold text-white landing-display">Ascend</span>
                </a>
                <p className="text-[15px] text-gray-600 max-w-[280px] leading-[1.6] landing-body">
                  AI-powered interview preparation.<br />From application to offer.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-20 gap-y-8">
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-400 mb-4 uppercase tracking-wider landing-body">Product</h4>
                  <div className="flex flex-col gap-3">
                    <a href="/app/coding" className="text-[15px] text-gray-500 hover:text-white transition-colors landing-body">Interview</a>
                    <a href="/prepare" className="text-[15px] text-gray-500 hover:text-white transition-colors landing-body">Prep Guides</a>
                    <a href="/premium" className="text-[15px] text-gray-500 hover:text-white transition-colors landing-body">Pricing</a>
                    <a href="/download" className="text-[15px] text-gray-500 hover:text-white transition-colors landing-body">Desktop App</a>
                  </div>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-400 mb-4 uppercase tracking-wider landing-body">Company</h4>
                  <div className="flex flex-col gap-3">
                    <a href="https://jobs.cariara.com" target="_blank" rel="noopener noreferrer" className="text-[15px] text-gray-500 hover:text-white transition-colors landing-body">Careers</a>
                    <a href="/privacy" className="text-[15px] text-gray-500 hover:text-white transition-colors landing-body">Privacy</a>
                    <a href="mailto:support@cariara.com" className="text-[15px] text-gray-500 hover:text-white transition-colors landing-body">Support</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[13px] text-gray-600 landing-body">&copy; {new Date().getFullYear()} Cariara</span>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=General+Sans:wght@400;500;600;700&display=swap');

        .landing-root {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .landing-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        .landing-body {
          font-family: 'General Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .landing-gradient-text {
          background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-root h1,
        .landing-root h2,
        .landing-root h3,
        .landing-root nav span,
        .landing-root footer span.text-white {
          font-family: 'Space Grotesk', sans-serif;
        }

        .landing-root p,
        .landing-root a,
        .landing-root button,
        .landing-root span:not(.landing-display) {
          font-family: 'General Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        html { scroll-behavior: smooth; }

        .landing-root ::-webkit-scrollbar { width: 6px; }
        .landing-root ::-webkit-scrollbar-track { background: transparent; }
        .landing-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .landing-root ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
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
