import { useState, useEffect } from 'react';

import { Icon } from '../Icons.jsx';

export default function OAuthLogin({ loginOnly = false }) {
  
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);





  // ══════════════════════════════════════════════════════════════
  // LANDING PAGE
  // ══════════════════════════════════════════════════════════════

  const navLinks = [
    { label: 'Preparation', href: '/prepare' },
    { label: 'Practice', href: '/app/coding' },
    { label: 'Attend', href: 'https://lumora.cariara.com/dashboard' },
    { label: 'Pricing', href: '/premium' },
  ];

  return (
    <div className="landing-root min-h-screen overflow-x-hidden" style={{ background: '#ffffff', color: '#1a1a1a' }}>

      <div className="relative z-10">

        {/* ═══ NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`} style={{ background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent' }}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Icon name="ascend" size={20} className="text-gray-900" />
              </div>
              <span className="text-2xl font-bold text-gray-900 landing-display">Ascend</span>
            </a>

            <div className="hidden md:flex items-center gap-2 mr-auto ml-8">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="px-5 py-2.5 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 landing-body">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href="/prepare" className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-gray-900 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] landing-body" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Preparation
              </a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-3 mx-6 p-5 rounded-2xl" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors landing-body">{link.label}</a>
              ))}
              <a href="/prepare" className="block w-full mt-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-900 text-center landing-body" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Preparation
              </a>
            </div>
          )}
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="pt-28 sm:pt-32 pb-10 max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="max-w-[800px] mx-auto text-center">
            <h1 className="text-[clamp(28px,4.5vw,44px)] font-bold leading-[1.08] tracking-[-0.03em] mb-3 landing-display sm:whitespace-nowrap">
              <span className="text-gray-900">Your winning edge in </span>
              <span className="landing-gradient-text">every interview.</span>
            </h1>
            <p className="text-base text-gray-500 mb-6 leading-[1.6] landing-body">AI-powered coding solutions, system design, and live interview assistance — completely invisible to screen share.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { label: '20+ languages', icon: 'code' },
                { label: 'System design', icon: 'systemDesign' },
                { label: 'Stealth mode', icon: 'eyeOff' },
                { label: 'Company prep', icon: 'briefcase' },
              ].map((cap, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full landing-body" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  <Icon name={cap.icon} size={14} className="text-emerald-600" />
                  <span className="text-sm text-gray-700 font-medium">{cap.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-8">
          <h2 className="text-2xl font-bold text-center mb-6 landing-display"><span className="text-gray-900">Everything you need to </span><span style={{color:'#10b981'}}>land the job.</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: 'microphone', title: 'Live Interview', desc: 'Real-time AI answers. Invisible to screen share.', accent: '#10b981' },
              { icon: 'code', title: 'Coding Engine', desc: '20+ languages with explanations and auto-fix.', accent: '#3b82f6' },
              { icon: 'systemDesign', title: 'System Design', desc: 'Architecture diagrams with scalability analysis.', accent: '#f59e0b' },
              { icon: 'briefcase', title: 'Company Prep', desc: 'Tailored pitch from your JD + resume.', accent: '#8b5cf6' },
              { icon: 'resume', title: 'Resume Builder', desc: 'ATS-optimized with PDF and DOCX export.', accent: '#06b6d4' },
              { icon: 'eyeOff', title: 'Stealth Mode', desc: 'Hidden from screen share, dock, and task manager.', accent: '#ec4899' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl hover:shadow-md transition-all duration-200" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${f.accent}10` }}>
                  <Icon name={f.icon} size={18} style={{ color: f.accent }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{f.title}</div>
                  <div className="text-sm text-gray-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-8">
          <h2 className="text-2xl font-bold text-center mb-6 landing-display"><span className="text-gray-900">Three steps. </span><span style={{color:'#10b981'}}>That's it.</span></h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'Drop your problem in', desc: 'Text, screenshot, or LeetCode URL.' },
              { num: '02', title: 'Get the solution', desc: 'Code, explanations, and diagrams in seconds.' },
              { num: '03', title: 'Practice and refine', desc: 'Step-by-step walkthrough with follow-up Q&A.' },
            ].map((step, i) => (
              <div key={i} className="p-5 rounded-xl text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="text-3xl font-black text-emerald-500 mb-2 landing-display">{step.num}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1 landing-display">{step.title}</div>
                <div className="text-sm text-gray-500 landing-body">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-6 max-w-[1440px] mx-auto px-4 sm:px-8 mt-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 py-4" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={14} className="text-gray-900" />
              </div>
              <span className="text-sm text-gray-500 landing-body">&copy; 2025 Ascend by Cariara.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {[
                { label: 'Preparation', href: '/prepare' },
                { label: 'Practice', href: '/app/coding' },
                { label: 'Attend', href: 'https://lumora.cariara.com/dashboard' },
                { label: 'Pricing', href: '/premium' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Support', href: 'mailto:support@cariara.com' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors landing-body">{link.label}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&family=Source+Serif+4:wght@600;700;800&display=swap');

        .landing-root {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .landing-display {
          font-family: 'Source Serif 4', Georgia, serif;
        }

        .landing-body {
          font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
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
        .landing-root footer span.text-gray-900 {
          font-family: 'Source Serif 4', Georgia, serif;
        }

        .landing-root p,
        .landing-root a,
        .landing-root button,
        .landing-root span:not(.landing-display) {
          font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
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
