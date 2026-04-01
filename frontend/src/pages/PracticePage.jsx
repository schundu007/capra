import { useState, useEffect } from 'react';
import { Icon } from '../components/Icons.jsx';
import { PRACTICE_SECTIONS, FREE_CODING } from '../data/practiceContent.js';

export default function PracticePage() {
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
    <div className="landing-root min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-blue-50/30" style={{ paddingTop: 64, paddingBottom: 56 }}>
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
              <a key={link.label} href={link.href} className={`text-sm font-semibold transition-colors landing-body ${isHighlighted ? '' : 'text-gray-400 hover:text-white'}`} style={isHighlighted ? { background: 'linear-gradient(90deg, #34d399, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>
                {link.label}
              </a>
            );
          })}
          <a href="/" className="px-5 py-2 bg-emerald-500 text-white font-semibold text-sm rounded-lg hover:bg-emerald-400 transition-colors landing-body">
            Home
          </a>
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
          <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 border-b border-gray-100 bg-white px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors landing-body">{link.label}</a>
          ))}
          <a href="/" className="block w-full mt-2 px-4 py-2.5 bg-emerald-500 text-white font-semibold text-sm text-center rounded hover:bg-emerald-600 transition-colors landing-body">
            Home
          </a>
        </div>
      )}

      {/* Hero */}
      <section className="text-center px-6 pt-10 pb-8 md:pt-14 md:pb-10">
        <h1 className={`landing-display font-extrabold tracking-tight transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="text-2xl md:text-3xl lg:text-4xl text-gray-900">Free Interview </span>
          <span className="text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Practice</span>
        </h1>
        <p className={`mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto landing-body transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Master the essentials with curated system design, technical, behavioral, and coding challenges — completely free.
        </p>
      </section>

      {/* Sections */}
      <section className="px-6 md:px-12 pb-10 max-w-6xl mx-auto space-y-8">
        {/* System Design, Technical, Behavioral */}
        {PRACTICE_SECTIONS.map((section, si) => (
          <div
            key={section.key}
            className={`text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${si * 100}ms` }}
          >
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <Icon name={section.icon} size={16} style={{ color: section.color }} />
              <h2 className="landing-mono text-xs font-bold tracking-[0.15em] uppercase" style={{ color: section.color }}>
                {section.title}
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {section.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 text-sm rounded-full border transition-colors landing-body ${section.chipBg} ${section.chipBorder} ${section.chipText} ${section.chipHover}`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Practice Coding */}
        <div className={`text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <Icon name="code" size={16} style={{ color: '#8b5cf6' }} />
            <h2 className="landing-mono text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#8b5cf6' }}>
              PRACTICE CODING
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {FREE_CODING.map((item) => (
              <a
                key={item.slug}
                href={`/problems/${item.slug}`}
                className="px-4 py-2 text-sm rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-purple-50 hover:border-purple-200 transition-colors landing-body"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-5">
            <a
              href="/app/coding"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white text-sm font-semibold rounded-full hover:bg-purple-600 transition-colors landing-mono"
            >
              <Icon name="code" size={14} className="text-white" />
              Open Coding IDE
            </a>
          </div>
        </div>
      </section>

      {/* Premium Upsell */}
      <section className="px-6 md:px-12 pb-10 max-w-5xl mx-auto">
        <div className={`relative overflow-hidden rounded-2xl p-8 md:p-10 text-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ background: 'linear-gradient(135deg, #111827 0%, #1e293b 50%, #111827 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 30% 50%, #10b981 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #3b82f6 0%, transparent 60%)' }} />
          <div className="relative">
            <h3 className="landing-display font-bold text-xl md:text-2xl text-white">
              Ready for the full library?
            </h3>
            <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto landing-body">
              Unlock 200+ topics across DSA, system design, low-level design, and behavioral interviews.
            </p>
            <a
              href="/premium"
              className="inline-block mt-5 px-8 py-3 bg-emerald-500 text-white font-semibold text-sm rounded-lg hover:bg-emerald-400 transition-colors landing-body"
            >
              View Premium Plans
            </a>
          </div>
        </div>
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
        .landing-display { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .landing-body { font-family: 'Work Sans', 'Plus Jakarta Sans', system-ui, sans-serif; }
        .landing-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
    </div>
  );
}
