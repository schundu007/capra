import { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icons.jsx';
import { useAuth } from '../../contexts/AuthContext';

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function OAuthLogin() {
  const { signIn, user, loading, authError } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); window.scrollTo(0, 0); }, []);

  const navLinks = [
    { label: 'Apply', href: 'https://jobs.cariara.com' },
    { label: 'Prepare', href: '/prepare' },
    { label: 'Practice', href: '/practice' },
    { label: 'Attend', href: 'https://lumora.cariara.com/app' },
    { label: 'Pricing', href: '/premium' },
  ];

  return (
    <div className="min-h-screen text-gray-900 overflow-hidden landing-root" style={{ background: 'linear-gradient(180deg, #fdf2f8 0%, #ede9fe 50%, #e0e7ff 100%)', paddingTop: '64px', paddingBottom: '52px' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4" style={{ background: '#111827' }}>
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Icon name="ascend" size={16} className="text-white" />
          </div>
          <div>
            <span className="landing-display font-bold text-lg tracking-tight text-white">Ascend</span>
            <span className="block text-[10px] landing-mono uppercase tracking-[0.2em] text-emerald-400 -mt-0.5">Interview AI</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isHighlighted = ['Apply', 'Prepare', 'Practice'].includes(link.label);
            return (
              <a key={link.label} href={link.href} {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`text-sm font-semibold transition-colors landing-body ${isHighlighted ? '' : 'text-gray-400 hover:text-white'}`} style={isHighlighted ? { background: 'linear-gradient(90deg, #34d399, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <a href="/prepare" className="text-sm text-gray-300 hover:text-white transition-colors landing-body font-medium">Dashboard</a>
          ) : !loading ? (
            <a href="/login" className="text-sm text-gray-300 hover:text-white transition-colors landing-body font-medium">Sign in</a>
          ) : null}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 md:hidden border-b border-gray-100 bg-white px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors landing-body">{link.label}</a>
          ))}
          {user ? (
            <a href="/prepare" className="block px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded transition-colors landing-body">Dashboard</a>
          ) : !loading ? (
            <a href="/login" className="block w-full mt-2 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded transition-colors landing-body text-left">Sign in</a>
          ) : null}
        </div>
      )}

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-12 pb-12 md:pt-16 md:pb-16">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 border border-emerald-200 bg-emerald-50 rounded-full mb-5 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs landing-mono text-emerald-700 tracking-wide">AI-Powered Interview Prep</span>
        </div>

        <h1 className={`landing-display font-extrabold leading-tight tracking-tight max-w-4xl transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="text-3xl md:text-4xl lg:text-5xl text-gray-900">Your Winning Edge in </span>
          <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Every Interview</span>
        </h1>

        <p className={`mt-4 text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed landing-body transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          AI-powered coding solutions, system design, and live interview assistance. 20+ languages. Invisible to screen share.
        </p>

        <div className={`mt-7 flex flex-col sm:flex-row items-center gap-3 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {user ? (
            <>
              <a href="/prepare" className="px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded-lg hover:bg-emerald-600 transition-colors shadow-sm landing-body flex items-center gap-2">
                Go to Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </a>
              <a href="/premium" className="px-8 py-3 text-gray-600 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors landing-body">
                View Plans
              </a>
            </>
          ) : (
            <>
              <a href="/practice" className="px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded-lg hover:bg-emerald-600 transition-colors shadow-sm landing-body flex items-center gap-2">
                Start Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </a>
              <a href="/premium" className="px-8 py-3 text-gray-600 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors landing-body">
                View Plans
              </a>
            </>
          )}
        </div>
        {authError && (
          <div className={`mt-4 max-w-md mx-auto px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 landing-body transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <span className="font-semibold">Sign in failed:</span> {authError}. Please try again.
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />

      {/* Journey — Left line with 4 labeled dots */}
      <section className="px-6 md:px-12 py-10">
        <div className="max-w-5xl mx-auto flex items-center gap-8 md:gap-12">
          {/* Left: Vertical line with 4 dots */}
          <div className="journey-stepper relative flex flex-col items-center" style={{ minHeight: '260px' }}>
            {/* Vertical line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="journey-stepper-line h-full" style={{ width: '3px', background: 'linear-gradient(180deg, #059669 0%, #0891b2 33%, #7c3aed 66%, #d97706 100%)', borderRadius: '2px' }} />
            </div>
            {/* 4 Dots with labels */}
            <div className="relative flex flex-col justify-between h-full py-1" style={{ minHeight: '260px' }}>
              {[
                { label: 'Apply', color: '#059669', glowColor: '16,185,129', href: 'https://jobs.cariara.com' },
                { label: 'Prepare', color: '#0891b2', glowColor: '8,145,178', href: '/prepare' },
                { label: 'Practice', color: '#7c3aed', glowColor: '124,58,237', href: '/practice' },
                { label: 'Attend', color: '#d97706', glowColor: '217,119,6', href: 'https://lumora.cariara.com/app' },
              ].map((dot, i) => (
                <a key={dot.label} href={dot.href} className={`journey-dot-step journey-dot-step-${i} group flex items-center gap-3 relative z-10`} style={{ animationDelay: `${i * 0.15}s` }}>
                  {/* The dot */}
                  <div className="journey-dot-circle flex-shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125" style={{ width: '16px', height: '16px', background: dot.color, border: '3px solid white', boxShadow: `0 0 0 2px ${dot.color}, 0 2px 10px rgba(${dot.glowColor},0.45)` }} />
                  {/* Label */}
                  <span className="landing-display text-sm font-bold whitespace-nowrap transition-colors duration-200 group-hover:underline" style={{ color: dot.color }}>{dot.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: Journey cards grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { label: 'Apply', href: 'https://jobs.cariara.com', icon: 'briefcase', desc: 'Find your role', color: '#059669', bgLight: '#ecfdf5', borderColor: '#6ee7b7', glowColor: '16,185,129' },
              { label: 'Prepare', href: '/prepare', icon: 'book', desc: 'Study & review', color: '#0891b2', bgLight: '#ecfeff', borderColor: '#67e8f9', glowColor: '8,145,178' },
              { label: 'Practice', href: '/practice', icon: 'code', desc: 'Solve problems', color: '#7c3aed', bgLight: '#f5f3ff', borderColor: '#c4b5fd', glowColor: '124,58,237' },
              { label: 'Attend', href: 'https://lumora.cariara.com/app', icon: 'microphone', desc: 'Ace the interview', color: '#d97706', bgLight: '#fffbeb', borderColor: '#fcd34d', glowColor: '217,119,6' },
            ].map((item, i) => (
              <a key={item.label} href={item.href} className={`journey-card journey-card-${i} group relative flex flex-col items-center gap-2 p-5 rounded-xl text-center transition-all duration-300`} style={{ background: item.bgLight, border: `1.5px solid ${item.borderColor}`, animationDelay: `${i * 0.12}s` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: `0 2px 10px rgba(${item.glowColor},0.2)` }}>
                  <Icon name={item.icon} size={22} style={{ color: item.color }} />
                </div>
                <span className="text-sm font-bold text-gray-900 landing-display">{item.label}</span>
                <span className="text-xs text-gray-500 landing-body">{item.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-10 md:py-12 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="landing-mono text-xs text-emerald-600 tracking-widest uppercase">Capabilities</span>
            <h2 className="landing-display font-bold text-2xl md:text-3xl mt-2 tracking-tight text-gray-900">
              Everything You Need. <span className="text-gray-400">Nothing You Don't.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-2.5">
            {[
              { icon: 'microphone', title: 'Live Interview', desc: 'Real-time AI answers during interviews. Completely invisible to screen share.', tags: ['Voice Capture', 'Stealth Mode', 'Streaming'], color: 'emerald', href: 'https://lumora.cariara.com/app' },
              { icon: 'code', title: 'Coding Engine', desc: '20+ languages with explanations, auto-fix, and complexity analysis.', tags: ['Multi-Language', 'Auto-Fix', 'Complexity'], color: 'cyan', href: '/prepare/coding' },
              { icon: 'systemDesign', title: 'System Design', desc: 'Architecture diagrams, scalability analysis, and tech justifications.', tags: ['Diagrams', 'Scale Math', 'Tradeoffs'], color: 'violet', href: '/prepare/system-design' },
            ].map((f) => (
              <a key={f.title} href={f.href} className="block p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className={`w-9 h-9 border border-${f.color}-200 bg-${f.color}-50 rounded flex items-center justify-center mb-3`}>
                  <Icon name={f.icon} size={18} className={`text-${f.color}-500`} />
                </div>
                <h3 className="landing-display font-semibold text-base mb-1 text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-snug landing-body">{f.desc}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {f.tags.map(t => (
                    <span key={t} className="text-[10px] landing-mono px-2 py-1 border border-gray-200 text-gray-400 rounded">{t}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5 mt-2.5">
            {[
              { icon: 'briefcase', title: 'Company Prep', desc: 'Tailored pitch from your JD + resume.', color: 'amber', href: '/prepare/behavioral' },
              { icon: 'resume', title: 'Resume Builder', desc: 'ATS-optimized with PDF and DOCX export.', color: 'cyan', href: '/prepare/coding' },
              { icon: 'eyeOff', title: 'Stealth Mode', desc: 'Hidden from screen share, dock, and task manager.', color: 'rose', href: '/download' },
            ].map((f) => (
              <a key={f.title} href={f.href} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className={`w-9 h-9 border border-${f.color}-200 bg-${f.color}-50 rounded flex items-center justify-center flex-shrink-0`}>
                  <Icon name={f.icon} size={16} className={`text-${f.color}-500`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 landing-display">{f.title}</div>
                  <div className="text-sm text-gray-500 landing-body">{f.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-10 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="landing-mono text-xs text-emerald-600 tracking-widest uppercase">Workflow</span>
            <h2 className="landing-display font-bold text-2xl md:text-3xl mt-2 tracking-tight text-gray-900">
              Three Steps. <span className="text-gray-400">Zero Friction.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { step: '01', title: 'Drop Your Problem In', desc: 'Text, screenshot, or LeetCode URL. Paste, snap, or speak it.', color: 'text-emerald-200' },
              { step: '02', title: 'AI Generates', desc: 'Code, explanations, diagrams, and edge cases in seconds.', color: 'text-cyan-200' },
              { step: '03', title: 'Practice & Refine', desc: 'Step-by-step walkthrough with follow-up Q&A. Build confidence.', color: 'text-violet-200' },
            ].map((item, i) => (
              <div key={i} className="group p-4 border border-gray-200 rounded-lg bg-white text-center">
                <span className={`landing-mono text-3xl font-black ${item.color} group-hover:text-gray-300 transition-colors`}>
                  {item.step}
                </span>
                <h3 className="landing-display font-semibold text-sm mt-2 mb-1 text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed landing-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-10 md:py-14 text-center">
        <h2 className="landing-display font-bold text-2xl md:text-3xl tracking-tight max-w-2xl mx-auto text-gray-900">
          Your Next Interview{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Starts Here</span>
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto landing-body">
          Stop memorizing. Start understanding. Practice with AI that thinks like a senior engineer.
        </p>
        <a href="/practice" className="inline-block mt-4 px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded-lg hover:bg-emerald-600 transition-colors shadow-sm landing-body">
          Start Practicing
        </a>
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-6 md:px-12 py-3" style={{ background: '#111827' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
              <Icon name="ascend" size={12} className="text-white" />
            </div>
            <span className="landing-display font-bold text-sm text-white">Ascend</span>
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { label: 'Apply', href: 'https://jobs.cariara.com' },
              { label: 'Prepare', href: '/prepare' },
              { label: 'Practice', href: '/practice' },
              { label: 'Attend', href: 'https://lumora.cariara.com/app' },
              { label: 'Pricing', href: '/premium' },
              { label: 'Support', href: 'mailto:support@cariara.com' },
            ].map((link) => (
              <a key={link.label} href={link.href} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors landing-body font-medium">{link.label}</a>
            ))}
          </div>
          <p className="text-xs text-gray-500 landing-mono">
            &copy; {new Date().getFullYear()} Ascend by Cariara
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');

        .landing-root {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-family: 'Work Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .landing-display {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .landing-body {
          font-family: 'Work Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .landing-mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        html { scroll-behavior: smooth; }

        /* Journey Stepper — left line with labeled dots */
        .journey-dot-step {
          opacity: 0;
          animation: dotStepIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .journey-dot-step-0 { animation-delay: 0.1s; }
        .journey-dot-step-1 { animation-delay: 0.25s; }
        .journey-dot-step-2 { animation-delay: 0.4s; }
        .journey-dot-step-3 { animation-delay: 0.55s; }

        @keyframes dotStepIn {
          from { opacity: 0; transform: translateX(-15px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Journey cards — fade in */
        .journey-card {
          opacity: 0;
          animation: cardFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .journey-card-0 { animation-delay: 0.15s; }
        .journey-card-1 { animation-delay: 0.3s; }
        .journey-card-2 { animation-delay: 0.45s; }
        .journey-card-3 { animation-delay: 0.6s; }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .journey-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
