import { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icons.jsx';

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
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const navLinks = [
    { label: 'Apply', href: 'https://jobs.cariara.com' },
    { label: 'Prepare', href: '/prepare' },
    { label: 'Practice', href: '/app/coding' },
    { label: 'Attend', href: 'https://lumora.cariara.com/app' },
    { label: 'Pricing', href: '/premium' },
  ];

  return (
    <div className="min-h-screen text-gray-900 overflow-hidden landing-root" style={{ background: 'linear-gradient(180deg, #fdf2f8 0%, #ede9fe 50%, #e0e7ff 100%)' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4" style={{ background: '#111827' }}>
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
              <a key={link.label} href={link.href} className={`text-sm font-semibold transition-colors landing-body ${isHighlighted ? '' : 'text-gray-400 hover:text-white'}`} style={isHighlighted ? { background: 'linear-gradient(90deg, #34d399, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>
                {link.label}
              </a>
            );
          })}
          <a href="/prepare" className="px-5 py-2 bg-emerald-500 text-white font-semibold text-sm rounded-lg hover:bg-emerald-400 transition-colors landing-body">
            Get Started
          </a>
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors landing-body">{link.label}</a>
          ))}
          <a href="/prepare" className="block w-full mt-2 px-4 py-2.5 bg-emerald-500 text-white font-semibold text-sm text-center rounded hover:bg-emerald-600 transition-colors landing-body">
            Get Started
          </a>
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

        <div className={`mt-5 flex flex-col sm:flex-row items-center gap-3 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a href="/app/coding" className="px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded hover:bg-emerald-600 transition-colors shadow-sm landing-body">
            Start Practicing
          </a>
          <a href="#features" className="px-8 py-3 border border-gray-300 text-gray-600 font-medium text-sm rounded hover:border-gray-400 hover:text-gray-900 transition-colors landing-body">
            See Features
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />

      {/* Journey Highlighter */}
      <section className="px-6 md:px-12 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Apply', href: 'https://jobs.cariara.com', icon: 'briefcase', desc: 'Find your role', gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '#6ee7b7', badge: '#059669', iconColor: '#059669', glow: '0 0 20px #6ee7b740, 0 0 40px #6ee7b720' },
              { label: 'Prepare', href: '/prepare', icon: 'book', desc: 'Study & review', gradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', border: '#67e8f9', badge: '#0891b2', iconColor: '#0891b2', glow: '0 0 20px #67e8f940, 0 0 40px #67e8f920' },
              { label: 'Practice', href: '/app/coding', icon: 'code', desc: 'Solve problems', gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '#c4b5fd', badge: '#7c3aed', iconColor: '#7c3aed', glow: '0 0 20px #c4b5fd40, 0 0 40px #c4b5fd20' },
              { label: 'Attend', href: 'https://lumora.cariara.com/app', icon: 'microphone', desc: 'Ace the interview', gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '#fcd34d', badge: '#d97706', iconColor: '#d97706', glow: '0 0 20px #fcd34d40, 0 0 40px #fcd34d20' },
            ].map((item, i) => (
              <a key={item.label} href={item.href} className={`journey-card journey-card-${i} group relative flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-500 text-center`} style={{ background: item.gradient, border: `2px solid ${item.border}`, boxShadow: `0 4px 20px rgba(0,0,0,0.06), ${item.glow}`, animationDelay: `${i * 0.15}s` }}>
                <div className="journey-badge absolute -top-3 left-5 px-2.5 py-1 rounded-full text-[11px] font-bold landing-mono text-white" style={{ background: item.badge, animationDelay: `${i * 0.15 + 0.5}s` }}>{i + 1}</div>
                <div className="journey-icon w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: 'white', boxShadow: `0 2px 12px ${item.border}40`, animationDelay: `${i * 0.2}s` }}>
                  <Icon name={item.icon} size={26} style={{ color: item.iconColor }} />
                </div>
                <span className="text-base font-bold text-gray-900 landing-display">{item.label}</span>
                <span className="text-xs text-gray-500 landing-body">{item.desc}</span>
                <div className="journey-shimmer absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" style={{ animationDelay: `${i * 0.4}s` }} />
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
              { icon: 'code', title: 'Coding Engine', desc: '20+ languages with explanations, auto-fix, and complexity analysis.', tags: ['Multi-Language', 'Auto-Fix', 'Complexity'], color: 'cyan', href: '/app/coding' },
              { icon: 'systemDesign', title: 'System Design', desc: 'Architecture diagrams, scalability analysis, and tech justifications.', tags: ['Diagrams', 'Scale Math', 'Tradeoffs'], color: 'violet', href: '/app/design' },
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
              { icon: 'briefcase', title: 'Company Prep', desc: 'Tailored pitch from your JD + resume.', color: 'amber', href: '/app/prep' },
              { icon: 'resume', title: 'Resume Builder', desc: 'ATS-optimized with PDF and DOCX export.', color: 'cyan', href: '/app/coding' },
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
        <a href="/app/coding" className="inline-block mt-4 px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded hover:bg-emerald-600 transition-colors shadow-sm landing-body">
          Start Practicing
        </a>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-5" style={{ background: '#111827' }}>
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
              { label: 'Practice', href: '/app/coding' },
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

        /* Journey card entrance — slide up + fade in */
        .journey-card {
          animation: journeySlideUp 0.6s ease-out both;
        }
        @keyframes journeySlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Floating / breathing effect — each card floats at its own rhythm */
        .journey-card-0 { animation: journeySlideUp 0.6s ease-out both, journeyFloat 4s ease-in-out 1s infinite; }
        .journey-card-1 { animation: journeySlideUp 0.6s ease-out both, journeyFloat 4.5s ease-in-out 1.2s infinite; }
        .journey-card-2 { animation: journeySlideUp 0.6s ease-out both, journeyFloat 5s ease-in-out 1.4s infinite; }
        .journey-card-3 { animation: journeySlideUp 0.6s ease-out both, journeyFloat 4.2s ease-in-out 1.6s infinite; }
        @keyframes journeyFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }

        /* Hover override — stop floating, lift up */
        .journey-card:hover {
          animation: none !important;
          transform: translateY(-8px) scale(1.03) !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Badge bounce-in */
        .journey-badge {
          animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Icon pulse on load */
        .journey-icon {
          animation: iconPulse 2s ease-in-out infinite;
        }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
          50%      { box-shadow: 0 4px 20px rgba(0,0,0,0.14); }
        }
        .journey-card:hover .journey-icon {
          animation: none;
        }

        /* Shimmer sweep across card */
        .journey-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmerSweep 3s ease-in-out infinite;
        }
        @keyframes shimmerSweep {
          0%   { left: -100%; }
          50%  { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>
    </div>
  );
}
