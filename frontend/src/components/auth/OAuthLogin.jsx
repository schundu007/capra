import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

export default function OAuthLogin({ loginOnly = false }) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
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
          <p className="text-gray-600 text-xs mt-6"><a href="/" className="text-gray-500 hover:text-white transition-colors">← Back to home</a></p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // LANDING PAGE — Simple. Clean. Effective.
  // Only 6 sections: Hero → Features → Social Proof → Pricing → CTA → Footer
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full" style={{ background: 'radial-gradient(circle, #10b98110 0%, transparent 60%)', top: '-300px', left: '50%', transform: 'translateX(-50%)' }} />
      </div>

      <div className="relative z-10">

        {/* ═══ NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`} style={{ background: scrolled ? 'rgba(9,9,11,0.9)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">Ascend</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="https://jobs.cariara.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">Jobs</a>
              <a href="/prepare" target="_blank" rel="noopener" className="text-gray-400 hover:text-white text-sm transition-colors">Prep</a>
              <a href="/app/coding" target="_blank" rel="noopener" className="text-gray-400 hover:text-white text-sm transition-colors">Interview</a>
              <a href="/premium" target="_blank" rel="noopener" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a>
            </div>
            <button onClick={() => handleOAuthLogin('google')} className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: '#10b981' }}>
              Get Started
            </button>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="pt-32 pb-20 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            <span className="text-white">Ace every interview.</span>
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)' }}>Land your dream job.</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered coding solutions, system design diagrams, live interview assistance, and company-specific prep. <span className="text-white">100% invisible.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-8 py-4 rounded-xl font-semibold text-lg text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
              {loading === 'google' ? <Icon name="loader" size={20} className="animate-spin mx-auto" /> : 'Start Free — No Credit Card'}
            </button>
            <a href="/prepare" target="_blank" rel="noopener" className="px-8 py-4 rounded-xl font-semibold text-lg text-white transition-all hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Explore Prep
            </a>
          </div>

          {/* Trusted by */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-gray-500">
            <span className="text-xs uppercase tracking-wider text-gray-600">Trusted by engineers at</span>
            {['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Stripe', 'Netflix'].map((c, i) => (
              <span key={i} className="font-semibold text-sm hover:text-gray-300 transition-colors">{c}</span>
            ))}
          </div>
        </section>

        {/* ═══ FEATURES — 6 clean cards ═══ */}
        <section className="py-16 max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything you need. Nothing you don't.</h2>
            <p className="text-gray-400 text-lg">From job search to signed offer letter — one platform.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: 'microphone', title: 'Live Interview Assistant', desc: 'Real-time voice transcription with instant AI answers. Invisible during screen sharing.', color: '#10b981' },
              { icon: 'code', title: 'AI Coding Engine', desc: '20+ languages. Line-by-line explanations, complexity analysis, auto-fix, and code execution.', color: '#3b82f6' },
              { icon: 'systemDesign', title: 'System Design', desc: 'Auto-generated architecture diagrams for AWS, GCP, Azure with scalability patterns.', color: '#f59e0b' },
              { icon: 'briefcase', title: 'Company-Specific Prep', desc: 'Upload JD + resume. Get tailored pitch, behavioral questions, and technical focus areas.', color: '#8b5cf6' },
              { icon: 'resume', title: 'Resume & Cover Letters', desc: 'AI-generated, ATS-optimized documents tailored to each role. Export PDF/DOCX.', color: '#06b6d4' },
              { icon: 'eyeOff', title: '100% Stealth Mode', desc: 'Invisible to screen share. Hidden from dock and task manager. Works with all platforms.', color: '#ec4899' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl transition-all hover:scale-[1.02]" style={{ background: `${f.color}06`, border: `1px solid ${f.color}15` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}12` }}>
                  <Icon name={f.icon} size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ PRICING LINK ═══ */}
        <section className="py-12 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-lg mb-6">Plans start at $99/mo. 30-day money-back guarantee.</p>
          <a href="/premium" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 30px rgba(16,185,129,0.15)' }}>
            View Plans & Pricing
            <Icon name="arrowRight" size={18} />
          </a>
        </section>


        {/* ═══ FOOTER ═══ */}
        <footer className="py-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={14} className="text-white" />
              </div>
              <span className="text-white font-bold text-sm">Ascend</span>
            </div>
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <a href="https://jobs.cariara.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Jobs</a>
              <a href="/prepare" target="_blank" rel="noopener" className="hover:text-white transition-colors">Prep</a>
              <a href="/app/coding" target="_blank" rel="noopener" className="hover:text-white transition-colors">Interview</a>
              <a href="/premium" target="_blank" rel="noopener" className="hover:text-white transition-colors">Pricing</a>
              <a href="/download" target="_blank" rel="noopener" className="hover:text-white transition-colors">Download</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="mailto:support@cariara.com" className="hover:text-white transition-colors">Support</a>
            </div>
            <span className="text-gray-600 text-xs">© 2025 Cariara</span>
          </div>
        </footer>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
    </div>
  );
}

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
function GithubIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>;
}
