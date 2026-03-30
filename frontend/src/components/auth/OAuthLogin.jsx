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
    { label: 'Preparation', href: '/prepare' },
    { label: 'Practice', href: '/app/coding' },
    { label: 'Attend', href: 'https://lumora.cariara.com/dashboard' },
    { label: 'Pricing', href: '/premium' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden landing-root">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center">
            <Icon name="ascend" size={16} className="text-white" />
          </div>
          <div>
            <span className="landing-display font-bold text-lg tracking-tight text-gray-900">Ascend</span>
            <span className="block text-[10px] landing-mono uppercase tracking-[0.2em] text-emerald-600 -mt-0.5">Interview AI</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium landing-body">
              {link.label}
            </a>
          ))}
          <a href="/prepare" className="px-5 py-2 bg-emerald-500 text-white font-semibold text-sm rounded hover:bg-emerald-600 transition-colors landing-body">
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
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 border border-emerald-200 bg-emerald-50 rounded-full mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs landing-mono text-emerald-700 tracking-wide">AI-Powered Interview Prep</span>
        </div>

        <h1 className={`landing-display font-extrabold leading-tight tracking-tight max-w-4xl transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="text-3xl md:text-4xl lg:text-5xl text-gray-900">Your Winning Edge in </span>
          <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Every Interview</span>
        </h1>

        <p className={`mt-6 text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed landing-body transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          AI-powered coding solutions, system design, and live interview assistance. 20+ languages. Invisible to screen share.
        </p>

        <div className={`mt-8 flex flex-col sm:flex-row items-center gap-3 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-16 md:py-20 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="landing-mono text-xs text-emerald-600 tracking-widest uppercase">Capabilities</span>
            <h2 className="landing-display font-bold text-2xl md:text-3xl mt-2 tracking-tight text-gray-900">
              Everything You Need. <span className="text-gray-400">Nothing You Don't.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: 'microphone', title: 'Live Interview', desc: 'Real-time AI answers during interviews. Completely invisible to screen share.', tags: ['Voice Capture', 'Stealth Mode', 'Streaming'], color: 'emerald' },
              { icon: 'code', title: 'Coding Engine', desc: '20+ languages with explanations, auto-fix, and complexity analysis.', tags: ['Multi-Language', 'Auto-Fix', 'Complexity'], color: 'cyan' },
              { icon: 'systemDesign', title: 'System Design', desc: 'Architecture diagrams, scalability analysis, and tech justifications.', tags: ['Diagrams', 'Scale Math', 'Tradeoffs'], color: 'violet' },
            ].map((f) => (
              <div key={f.title} className="p-6 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className={`w-10 h-10 border border-${f.color}-200 bg-${f.color}-50 rounded flex items-center justify-center mb-4`}>
                  <Icon name={f.icon} size={18} className={`text-${f.color}-500`} />
                </div>
                <h3 className="landing-display font-semibold text-lg mb-2 text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed landing-body">{f.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {f.tags.map(t => (
                    <span key={t} className="text-[10px] landing-mono px-2 py-1 border border-gray-200 text-gray-400 rounded">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: 'briefcase', title: 'Company Prep', desc: 'Tailored pitch from your JD + resume.', color: 'amber' },
              { icon: 'resume', title: 'Resume Builder', desc: 'ATS-optimized with PDF and DOCX export.', color: 'cyan' },
              { icon: 'eyeOff', title: 'Stealth Mode', desc: 'Hidden from screen share, dock, and task manager.', color: 'rose' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className={`w-9 h-9 border border-${f.color}-200 bg-${f.color}-50 rounded flex items-center justify-center flex-shrink-0`}>
                  <Icon name={f.icon} size={16} className={`text-${f.color}-500`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 landing-display">{f.title}</div>
                  <div className="text-sm text-gray-500 landing-body">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="landing-mono text-xs text-emerald-600 tracking-widest uppercase">Workflow</span>
            <h2 className="landing-display font-bold text-2xl md:text-3xl mt-2 tracking-tight text-gray-900">
              Three Steps. <span className="text-gray-400">Zero Friction.</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Drop Your Problem In', desc: 'Text, screenshot, or LeetCode URL. Paste, snap, or speak it.', color: 'text-emerald-200' },
              { step: '02', title: 'AI Generates', desc: 'Code, explanations, diagrams, and edge cases in seconds.', color: 'text-cyan-200' },
              { step: '03', title: 'Practice & Refine', desc: 'Step-by-step walkthrough with follow-up Q&A. Build confidence.', color: 'text-violet-200' },
            ].map((item, i) => (
              <div key={i} className="group p-5 border border-gray-200 rounded-lg bg-white text-center">
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
      <section className="px-6 md:px-12 py-16 md:py-24 text-center">
        <h2 className="landing-display font-bold text-2xl md:text-3xl tracking-tight max-w-2xl mx-auto text-gray-900">
          Your Next Interview{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Starts Here</span>
        </h2>
        <p className="mt-3 text-sm text-gray-500 max-w-lg mx-auto landing-body">
          Stop memorizing. Start understanding. Practice with AI that thinks like a senior engineer.
        </p>
        <a href="/app/coding" className="inline-block mt-6 px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded hover:bg-emerald-600 transition-colors shadow-sm landing-body">
          Start Practicing
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 md:px-12 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center">
              <Icon name="ascend" size={12} className="text-white" />
            </div>
            <span className="landing-display font-bold text-sm text-gray-900">Ascend</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { label: 'Preparation', href: '/prepare' },
              { label: 'Practice', href: '/app/coding' },
              { label: 'Attend', href: 'https://lumora.cariara.com/dashboard' },
              { label: 'Pricing', href: '/premium' },
              { label: 'Support', href: 'mailto:support@cariara.com' },
            ].map((link) => (
              <a key={link.label} href={link.href} className="text-xs text-gray-400 hover:text-gray-900 transition-colors landing-body font-medium">{link.label}</a>
            ))}
          </div>
          <p className="text-xs text-gray-400 landing-mono">
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
      `}</style>
    </div>
  );
}
