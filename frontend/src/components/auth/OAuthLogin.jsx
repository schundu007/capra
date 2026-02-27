import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

/**
 * Ascend Landing Page - Professional High-Converting Design
 * Inspired by techprep.app
 */
export default function OAuthLogin() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeDemo, setActiveDemo] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [counters, setCounters] = useState({ users: 0, offers: 0, salary: 0, companies: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Company logos where users landed offers
  const companyLogos = [
    { name: 'Google', color: '#4285F4' },
    { name: 'Meta', color: '#0668E1' },
    { name: 'Amazon', color: '#FF9900' },
    { name: 'Apple', color: '#A2AAAD' },
    { name: 'Netflix', color: '#E50914' },
    { name: 'Microsoft', color: '#00A4EF' },
    { name: 'Stripe', color: '#635BFF' },
    { name: 'OpenAI', color: '#10A37F' },
  ];

  // Pain points
  const painPoints = [
    { icon: 'alert', text: 'Struggling to get offers from top companies' },
    { icon: 'x', text: 'Repeated rejections without feedback' },
    { icon: 'clock', text: 'Wasting months on ineffective prep' },
    { icon: 'target', text: 'Unable to identify your weak areas' },
    { icon: 'users', text: 'Falling behind the competition' },
    { icon: 'brain', text: 'Blanking out during live interviews' },
    { icon: 'chartBar', text: 'Not knowing what top companies expect' },
    { icon: 'question', text: 'Feeling unprepared and anxious' },
  ];

  // Feature categories
  const featureCategories = [
    {
      title: 'Coding Problems',
      icon: 'code',
      color: '#10b981',
      desc: 'Real-time solutions with explanations',
      features: ['20+ Languages', 'Auto-fix Errors', 'Complexity Analysis', 'Line-by-line Explanations']
    },
    {
      title: 'System Design',
      icon: 'systemDesign',
      color: '#3b82f6',
      desc: 'Architecture diagrams & scalability',
      features: ['High-level Design', 'Low-level Deep Dives', 'Auto Diagrams', 'Tech Justifications']
    },
    {
      title: 'Behavioral',
      icon: 'users',
      color: '#8b5cf6',
      desc: 'STAR method responses',
      features: ['STAR Framework', 'Follow-up Q&A', 'Leadership Principles', 'Custom Stories']
    },
    {
      title: 'Live Assistant',
      icon: 'microphone',
      color: '#f59e0b',
      desc: 'Real-time transcription & answers',
      features: ['Live Transcription', 'Instant Answers', '100% Invisible', 'All Platforms']
    },
  ];

  // How it works steps
  const howItWorks = [
    { num: '01', title: 'Sign Up', desc: 'Create your account in seconds with Google, GitHub, or LinkedIn', icon: 'users' },
    { num: '02', title: 'Choose Mode', desc: 'Select Coding, System Design, or Behavioral prep based on your interview', icon: 'target' },
    { num: '03', title: 'Get Answers', desc: 'Paste problems, take screenshots, or use live transcription for instant AI solutions', icon: 'sparkles' },
    { num: '04', title: 'Land Offers', desc: 'Ace your interviews with confidence and secure top tech offers', icon: 'rocket' },
  ];

  // Comparison table
  const comparison = [
    { feature: 'Real-time AI Answers', ascend: true, leetcode: false, bytebyte: false, interviewing: false },
    { feature: 'Live Interview Transcription', ascend: true, leetcode: false, bytebyte: false, interviewing: false },
    { feature: 'System Design Diagrams', ascend: true, leetcode: false, bytebyte: true, interviewing: false },
    { feature: 'Behavioral STAR Responses', ascend: true, leetcode: false, bytebyte: false, interviewing: true },
    { feature: 'Code Execution & Testing', ascend: true, leetcode: true, bytebyte: false, interviewing: false },
    { feature: '100% Invisible Mode', ascend: true, leetcode: false, bytebyte: false, interviewing: false },
    { feature: 'Screenshot Problem Solving', ascend: true, leetcode: false, bytebyte: false, interviewing: false },
    { feature: 'Multi-language Support', ascend: true, leetcode: true, bytebyte: false, interviewing: false },
  ];

  // Testimonials
  const testimonials = [
    { name: 'Sarah M.', role: 'Senior SWE', company: 'Meta', text: 'Got offers from 3 FAANG companies. The coding assistance was flawless. Went from rejected everywhere to multiple L5 offers.', avatar: 'S' },
    { name: 'James K.', role: 'Staff Engineer', company: 'Google', text: 'The system design help alone is worth 10x the price. Helped me nail my Amazon L6 and Google L5 interviews.', avatar: 'J' },
    { name: 'Priya R.', role: 'Eng Manager', company: 'Netflix', text: 'Game changer for behavioral interviews. The STAR method responses were perfect. Got promoted to EM level.', avatar: 'P' },
    { name: 'Michael T.', role: 'SDE II', company: 'Amazon', text: 'Failed 5 interviews before Ascend. After using it, got offers from Amazon, Microsoft, and Uber. Life changing.', avatar: 'M' },
    { name: 'Emily C.', role: 'Backend Engineer', company: 'Stripe', text: 'The live transcription feature is incredible. Never blanked out during an interview again. Highly recommend.', avatar: 'E' },
    { name: 'David L.', role: 'Senior SWE', company: 'Microsoft', text: 'Went from 0 offers to 4 offers in 2 months. The ROI on this tool is insane. Worth every penny.', avatar: 'D' },
  ];

  // FAQ
  const faqItems = [
    { q: 'How does Ascend work?', a: 'Ascend uses advanced AI to analyze interview questions in real-time. Simply paste a problem, take a screenshot, or enable live transcription. Our AI provides instant, accurate solutions with detailed explanations.' },
    { q: 'Is Ascend really undetectable?', a: 'Yes. Ascend is completely invisible during screen sharing. It doesn\'t appear in your dock, taskbar, or task manager. Works seamlessly with Zoom, Meet, Teams, and all coding platforms.' },
    { q: 'What platforms and languages are supported?', a: 'We support 20+ programming languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, and SQL. Works with HackerRank, LeetCode, CoderPad, CodeSignal, and virtually any interview platform.' },
    { q: 'Can I try before buying?', a: 'Yes! We offer a free tier with limited credits so you can experience the power of Ascend before committing. No credit card required to start.' },
    { q: 'What\'s included in Quarterly Pro?', a: 'Quarterly Pro includes unlimited problems, all features (coding, system design, behavioral), priority support, and exclusive access to our Job Discovery Portal with curated opportunities.' },
    { q: 'How is Desktop different from subscriptions?', a: 'Desktop is a one-time purchase that gives you lifetime access. You use your own API keys (OpenAI or Anthropic), so there are no ongoing fees. Perfect for power users who want full control.' },
    { q: 'Do you offer refunds?', a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied for any reason, contact us for a full refund. No questions asked.' },
    { q: 'Is my data secure?', a: 'Absolutely. We don\'t store your interview questions or solutions. All processing happens in real-time and is immediately discarded. Your privacy is our priority.' },
  ];

  // Animate counters on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);
            const duration = 2000, steps = 60;
            const targets = { users: 50000, offers: 17500, salary: 35, companies: 500 };
            let step = 0;
            const interval = setInterval(() => {
              step++;
              const eased = 1 - Math.pow(1 - step / steps, 3);
              setCounters({
                users: Math.round(targets.users * eased),
                offers: Math.round(targets.offers * eased),
                salary: Math.round(targets.salary * eased),
                companies: Math.round(targets.companies * eased),
              });
              if (step >= steps) clearInterval(interval);
            }, duration / steps);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

  // Auto-rotate demo
  useEffect(() => {
    const interval = setInterval(() => setActiveDemo((prev) => (prev + 1) % 3), 5000);
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

  return (
    <div className="min-h-screen relative" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute w-[1000px] h-[1000px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #10b98115 0%, transparent 50%)', top: '-400px', left: '50%', transform: 'translateX(-50%)' }} />
      </div>

      <div className="relative z-10">

        {/* ══════════════════════════════════════════════════════════════════════════════════
            NAVIGATION
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="ascend" size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Ascend</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white text-sm transition-colors">Features</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</button>
            <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white text-sm transition-colors">Reviews</button>
            <a href="/docs" className="text-gray-400 hover:text-white text-sm transition-colors">Docs</a>
          </div>
          <button onClick={() => handleOAuthLogin('google')} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105" style={{ background: '#10b981', color: '#fff' }}>
            Get Started
          </button>
        </nav>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 font-medium">Join 50,000+ engineers landing top tech offers</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
              <span className="text-white">Ace Every Interview,</span><br />
              <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Secure Your Future</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Real-time AI assistance for coding, system design & behavioral interviews.
              <span className="text-white font-medium"> 100% invisible.</span> Used by engineers at top tech companies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-8 py-4 rounded-xl font-semibold text-lg text-white transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}>
                {loading === 'google' ? <Icon name="loader" size={20} className="animate-spin mx-auto" /> : 'Start Free Trial'}
              </button>
              <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-3 transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon name="play" size={18} />
                Watch Demo
              </button>
            </div>

            {/* Social Proof Avatars */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {['S', 'J', 'P', 'M', 'E'].map((letter, i) => (
                  <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-black" style={{ background: `linear-gradient(135deg, ${['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][i]}, ${['#059669', '#2563eb', '#7c3aed', '#d97706', '#db2777'][i]})` }}>
                    {letter}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={16} className="text-yellow-400" />)}
                </div>
                <span className="text-gray-400 text-sm"><span className="text-white font-semibold">4.9/5</span> from 2,000+ reviews</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            COMPANY LOGOS
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-gray-500 text-sm mb-8">Engineers using Ascend have landed offers at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {companyLogos.map((company, i) => (
                <span key={i} className="text-gray-500 font-semibold text-lg md:text-xl hover:text-white transition-colors cursor-default" style={{ letterSpacing: '-0.02em' }}>
                  {company.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            STATS SECTION
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section ref={statsRef} className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: `${counters.users.toLocaleString()}+`, label: 'Active Users', color: '#10b981' },
                { value: `${counters.offers.toLocaleString()}+`, label: 'Offers Secured', color: '#3b82f6' },
                { value: `${counters.salary}%`, label: 'Avg Salary Increase', color: '#8b5cf6' },
                { value: `${counters.companies}+`, label: 'Companies Hired From', color: '#f59e0b' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            PROBLEM STATEMENT
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sound Familiar?</h2>
              <p className="text-gray-400 text-lg">These challenges hold back talented engineers every day</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {painPoints.map((point, i) => (
                <div key={i} className="p-5 rounded-xl transition-all hover:scale-105" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <Icon name={point.icon} size={20} className="text-red-400 mb-3" />
                  <p className="text-gray-300 text-sm">{point.text}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <p className="text-xl text-white font-semibold mb-2">There's a better way.</p>
              <p className="text-gray-400">Ascend eliminates the guesswork from interview prep.</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            FEATURES GRID
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Comprehensive AI-powered tools for every type of technical interview</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featureCategories.map((cat, i) => (
                <div key={i} className="p-8 rounded-2xl transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${cat.color}08, ${cat.color}03)`, border: `1px solid ${cat.color}20` }}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}15` }}>
                      <Icon name={cat.icon} size={28} style={{ color: cat.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{cat.title}</h3>
                      <p className="text-gray-400">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {cat.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <Icon name="check" size={14} style={{ color: cat.color }} />
                        <span className="text-gray-300 text-sm">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            ALL-IN-ONE PLATFORM HUB
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Everything you need to land offers from top tech companies</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">The all-inclusive AI-powered platform. Save time, learn faster, and maximize your offer rate.</p>
            </div>

            {/* Hub Diagram */}
            <div className="relative py-12 mb-20">
              {/* Connection Lines SVG - Desktop */}
              <svg className="absolute inset-0 w-full h-full hidden lg:block" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="lineGradientLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                  </linearGradient>
                  <linearGradient id="lineGradientRight" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                  </linearGradient>
                </defs>
                {/* Left side connections */}
                <path d="M 15% 20% Q 25% 20%, 35% 35%" stroke="url(#lineGradientLeft)" strokeWidth="1" fill="none" />
                <path d="M 15% 40% Q 25% 40%, 35% 43%" stroke="url(#lineGradientLeft)" strokeWidth="1" fill="none" />
                <path d="M 15% 60% Q 25% 60%, 35% 52%" stroke="url(#lineGradientLeft)" strokeWidth="1" fill="none" />
                <path d="M 15% 80% Q 25% 80%, 35% 65%" stroke="url(#lineGradientLeft)" strokeWidth="1" fill="none" />
                {/* Right side connections */}
                <path d="M 85% 20% Q 75% 20%, 65% 35%" stroke="url(#lineGradientRight)" strokeWidth="1" fill="none" />
                <path d="M 85% 40% Q 75% 40%, 65% 43%" stroke="url(#lineGradientRight)" strokeWidth="1" fill="none" />
                <path d="M 85% 60% Q 75% 60%, 65% 52%" stroke="url(#lineGradientRight)" strokeWidth="1" fill="none" />
                <path d="M 85% 80% Q 75% 80%, 65% 65%" stroke="url(#lineGradientRight)" strokeWidth="1" fill="none" />
              </svg>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 relative z-10">
                {/* Left Features */}
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  {[
                    { icon: 'code', label: 'Data Structures & Algorithms', color: '#10b981' },
                    { icon: 'systemDesign', label: 'System Design', color: '#3b82f6' },
                    { icon: 'layers', label: 'Low Level Design', color: '#8b5cf6' },
                    { icon: 'terminal', label: 'Full Stack Coding', color: '#f59e0b' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:scale-105 cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Icon name={item.icon} size={18} style={{ color: item.color }} />
                      <span className="text-gray-300 text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Center - Company Logos Grid */}
                <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { name: 'amazon', display: 'amazon' },
                      { name: 'Google', display: 'Google' },
                      { name: 'Meta', display: 'Meta', prefix: '∞' },
                      { name: 'Rivian', display: 'RIVIAN', style: 'tracking-wider text-xs' },
                      { name: 'OpenAI', display: 'OpenAI', prefix: '◐' },
                      { name: 'Jane Street', display: 'Jane Street', style: 'text-xs' },
                      { name: 'stripe', display: 'stripe', style: 'font-bold' },
                      { name: 'Uber', display: 'Uber' },
                      { name: 'Microsoft', display: 'Microsoft', prefix: '⊞' },
                    ].map((company, i) => (
                      <div key={i} className="flex items-center justify-center px-4 py-3 text-gray-400 hover:text-white transition-colors cursor-default">
                        <span className={`font-semibold whitespace-nowrap ${company.style || ''}`}>
                          {company.prefix && <span className="mr-1">{company.prefix}</span>}
                          {company.display}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Features */}
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  {[
                    { icon: 'users', label: 'Behavioral', color: '#ec4899' },
                    { icon: 'building', label: 'Company Questions', color: '#06b6d4' },
                    { icon: 'briefcase', label: 'Projects', color: '#84cc16' },
                    { icon: 'compass', label: 'Roadmaps', color: '#f97316' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:scale-105 cursor-pointer lg:flex-row-reverse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Icon name={item.icon} size={18} style={{ color: item.color }} />
                      <span className="text-gray-300 text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Category Cards */}
            <div className="space-y-8">
              {/* DSA Card */}
              <div className="grid lg:grid-cols-2 gap-8 items-center p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Icon name="code" size={24} className="text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Data Structures & Algorithms</h3>
                  </div>
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    Level up your DSA skills by studying our optimal time and space complexity solutions. Get instant AI-powered explanations for any problem.
                  </p>
                  <button className="flex items-center gap-2 text-green-400 font-semibold hover:gap-3 transition-all mb-6">
                    Start with Data Structures & Algorithms <Icon name="arrowRight" size={18} />
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-gray-500 text-sm">See also:</span>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Ascend 100</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Blind 75</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">NeetCode 150</a>
                  </div>
                </div>
                <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <pre className="text-green-400 text-xs md:text-sm font-mono text-left inline-block">
{`def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        comp = target - n
        if comp in seen:
            return [seen[comp], i]
        seen[n] = i
    return []`}
                      </pre>
                      <div className="mt-4 flex justify-center gap-4">
                        <div className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                          <span className="text-green-400">O(n) time</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                          <span className="text-blue-400">O(n) space</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Design Card */}
              <div className="grid lg:grid-cols-2 gap-8 items-center p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02))', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <div className="order-2 lg:order-1 relative h-64 lg:h-80 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                  <div className="absolute inset-0 p-6">
                    <div className="grid grid-cols-3 gap-3 h-full">
                      {['Client', 'Load Balancer', 'API Gateway', 'Cache', 'Database', 'CDN'].map((comp, i) => (
                        <div key={i} className="flex items-center justify-center p-3 rounded-lg text-xs text-center" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          <span className="text-blue-300">{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                      <Icon name="systemDesign" size={24} className="text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">System Design</h3>
                  </div>
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    Enhance your system design knowledge and impress your interviewer with expert-level solutions and real-time AI-powered feedback with auto-generated diagrams.
                  </p>
                  <button className="flex items-center gap-2 text-blue-400 font-semibold hover:gap-3 transition-all mb-6">
                    Start with System Design <Icon name="arrowRight" size={18} />
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-gray-500 text-sm">See also:</span>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">High Level Design</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Low Level Design</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">AI Whiteboard</a>
                  </div>
                </div>
              </div>

              {/* Full Stack Card */}
              <div className="grid lg:grid-cols-2 gap-8 items-center p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                      <Icon name="layers" size={24} className="text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Full Stack</h3>
                  </div>
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    Nail every question and stay ahead of the competition by studying the most relevant full stack questions covering frontend, backend, and database topics.
                  </p>
                  <button className="flex items-center gap-2 text-amber-400 font-semibold hover:gap-3 transition-all mb-6">
                    Start with Full Stack <Icon name="arrowRight" size={18} />
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-gray-500 text-sm">See also:</span>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">React</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">REST API</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">SQL</a>
                  </div>
                </div>
                <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                  <div className="absolute inset-0 p-6 flex flex-col justify-center">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div className="text-amber-400 text-xs mb-1">Frontend</div>
                        <div className="text-gray-300 text-sm">React, TypeScript, Next.js</div>
                      </div>
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div className="text-green-400 text-xs mb-1">Backend</div>
                        <div className="text-gray-300 text-sm">Node.js, Python, Go</div>
                      </div>
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div className="text-blue-400 text-xs mb-1">Database</div>
                        <div className="text-gray-300 text-sm">PostgreSQL, MongoDB, Redis</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavioral Card */}
              <div className="grid lg:grid-cols-2 gap-8 items-center p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                <div className="order-2 lg:order-1 relative h-64 lg:h-80 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                  <div className="absolute inset-0 p-6 flex items-center justify-center">
                    <div className="space-y-4 w-full max-w-sm">
                      {[
                        { letter: 'S', word: 'Situation', color: '#8b5cf6' },
                        { letter: 'T', word: 'Task', color: '#a78bfa' },
                        { letter: 'A', word: 'Action', color: '#c4b5fd' },
                        { letter: 'R', word: 'Result', color: '#ddd6fe' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white" style={{ background: item.color }}>
                            {item.letter}
                          </div>
                          <span className="text-gray-300 font-medium">{item.word}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                      <Icon name="users" size={24} className="text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Behavioral</h3>
                  </div>
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    Become a top candidate and impress your interviewer using our vetted list of the most frequently asked behavioral questions with AI-generated STAR responses.
                  </p>
                  <button className="flex items-center gap-2 text-purple-400 font-semibold hover:gap-3 transition-all mb-6">
                    Start with Behavioral <Icon name="arrowRight" size={18} />
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-gray-500 text-sm">See also:</span>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Playbook</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Leadership Principles</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Common Questions</a>
                  </div>
                </div>
              </div>

              {/* Roadmaps & Projects - Side by Side */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Roadmaps Card */}
                <div className="p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.02))', border: '1px solid rgba(249, 115, 22, 0.15)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
                      <Icon name="compass" size={24} className="text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Roadmaps</h3>
                  </div>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Fast-track your interview prep and land any job by studying our curated list of the most frequently asked interview questions.
                  </p>
                  <div className="relative h-40 rounded-xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                    <div className="absolute inset-0 p-4">
                      <div className="flex items-center justify-between h-full">
                        {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => (
                          <div key={i} className="text-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: i === 0 ? '#f97316' : 'rgba(249, 115, 22, 0.2)', border: '2px solid #f97316' }}>
                              <span className="text-xs text-white font-bold">{i + 1}</span>
                            </div>
                            <span className="text-xs text-gray-400">{week}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute top-1/2 left-8 right-8 h-0.5 -translate-y-1/2 -z-0" style={{ background: 'rgba(249, 115, 22, 0.3)' }} />
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-orange-400 font-semibold hover:gap-3 transition-all mb-4">
                    Start with Roadmaps <Icon name="arrowRight" size={18} />
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-gray-500 text-sm">See also:</span>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Elite Candidate</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Company Specific</a>
                  </div>
                </div>

                {/* Projects Card */}
                <div className="p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.08), rgba(132, 204, 22, 0.02))', border: '1px solid rgba(132, 204, 22, 0.15)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(132, 204, 22, 0.15)' }}>
                      <Icon name="briefcase" size={24} className="text-lime-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Projects</h3>
                  </div>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Increase your resume acceptance rate and become a top candidate by practicing modern projects to hone your programming skills.
                  </p>
                  <div className="relative h-40 rounded-xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                    <div className="absolute inset-0 p-4">
                      <div className="grid grid-cols-2 gap-3 h-full">
                        {['URL Shortener', 'Rate Limiter', 'Chat App', 'Task Queue'].map((project, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(132, 204, 22, 0.1)', border: '1px solid rgba(132, 204, 22, 0.2)' }}>
                            <Icon name="folder" size={14} className="text-lime-400" />
                            <span className="text-xs text-gray-300">{project}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-lime-400 font-semibold hover:gap-3 transition-all mb-4">
                    Start with Projects <Icon name="arrowRight" size={18} />
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-gray-500 text-sm">See also:</span>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Take Home</a>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors underline underline-offset-2">Portfolio</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            DEMO SECTION
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section id="demo" className="py-20" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See Ascend in Action</h2>
              <p className="text-gray-400 text-lg">Real-time AI solving interview problems instantly</p>
            </div>

            {/* Demo Tabs */}
            <div className="flex justify-center gap-3 mb-6">
              {[
                { id: 0, label: 'Coding', icon: 'code', color: '#10b981' },
                { id: 1, label: 'System Design', icon: 'systemDesign', color: '#3b82f6' },
                { id: 2, label: 'Behavioral', icon: 'users', color: '#8b5cf6' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveDemo(tab.id)} className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" style={{ background: activeDemo === tab.id ? `${tab.color}20` : 'rgba(255,255,255,0.03)', border: `1px solid ${activeDemo === tab.id ? tab.color : 'rgba(255,255,255,0.08)'}`, color: activeDemo === tab.id ? tab.color : '#9ca3af' }}>
                  <Icon name={tab.icon} size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Demo Window */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 px-5 py-4" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-gray-500 text-sm font-mono ml-4">ascend-assistant</span>
              </div>
              <div className="p-8" style={{ minHeight: '350px' }}>
                {activeDemo === 0 && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider mb-3">Problem Detected</div>
                      <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-gray-300 text-sm">Given an array of integers, return indices of two numbers such that they add up to a specific target.</p>
                      </div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider mb-3">AI Solution</div>
                      <pre className="text-green-400 text-sm font-mono leading-relaxed">
{`def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target-n], i]
        seen[n] = i
    return []`}
                      </pre>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider mb-3">Analysis</div>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                          <div className="text-green-400 text-xs font-semibold mb-1">Time Complexity</div>
                          <div className="text-white">O(n) - Single pass</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                          <div className="text-blue-400 text-xs font-semibold mb-1">Space Complexity</div>
                          <div className="text-white">O(n) - Hash map storage</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                          <div className="text-purple-400 text-xs font-semibold mb-1">Approach</div>
                          <div className="text-white">Hash map for O(1) lookups</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeDemo === 1 && (
                  <div>
                    <div className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                      <Icon name="systemDesign" size={20} />
                      Design: URL Shortener Service
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {['API Gateway', 'Load Balancer', 'App Servers', 'Redis Cache', 'PostgreSQL', 'CDN'].map((comp, i) => (
                        <div key={i} className="p-3 rounded-lg text-center" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          <span className="text-white text-sm">{comp}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-gray-400 text-xs uppercase mb-2">Scalability</div>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Horizontal scaling with K8s</li>
                          <li>• Read replicas for DB</li>
                          <li>• Cache-aside pattern</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-gray-400 text-xs uppercase mb-2">Tech Stack</div>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Go for high throughput</li>
                          <li>• Redis for caching</li>
                          <li>• PostgreSQL for persistence</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {activeDemo === 2 && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Icon name="question" size={18} className="text-purple-400" />
                        </div>
                        <span className="text-gray-400">Interviewer asks:</span>
                      </div>
                      <p className="text-white text-lg ml-13">"Tell me about a time you had to deal with a difficult teammate."</p>
                    </div>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon name="sparkles" size={18} className="text-purple-400" />
                        <span className="text-purple-400 font-semibold">STAR Response Generated</span>
                      </div>
                      <div className="space-y-3 text-gray-300">
                        <p><span className="text-white font-semibold">Situation:</span> On my last project, a senior engineer was dismissive of my suggestions...</p>
                        <p><span className="text-white font-semibold">Task:</span> I needed to find a way to collaborate effectively...</p>
                        <p><span className="text-white font-semibold">Action:</span> I scheduled a 1:1, listened to their concerns, and proposed a compromise...</p>
                        <p><span className="text-white font-semibold">Result:</span> We delivered the project 2 weeks early and became close collaborators...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-gray-400 text-lg">Get started in minutes, land offers in weeks</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {howItWorks.map((step, i) => (
                <div key={i} className="relative">
                  {i < 3 && <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-green-500/50 to-transparent" style={{ width: 'calc(100% - 2rem)' }} />}
                  <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div className="text-green-400 text-sm font-bold mb-4">{step.num}</div>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <Icon name={step.icon} size={24} className="text-green-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            COMPARISON TABLE
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Engineers Choose Ascend</h2>
              <p className="text-gray-400 text-lg">Compare us to alternatives</p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Feature</th>
                      <th className="p-4 text-green-400 font-bold">Ascend</th>
                      <th className="p-4 text-gray-500 font-medium text-sm">LeetCode</th>
                      <th className="p-4 text-gray-500 font-medium text-sm">ByteByteGo</th>
                      <th className="p-4 text-gray-500 font-medium text-sm">Interviewing.io</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                        <td className="p-4 text-gray-300 text-sm">{row.feature}</td>
                        <td className="p-4 text-center">{row.ascend ? <Icon name="check" size={18} className="text-green-400 mx-auto" /> : <Icon name="x" size={18} className="text-gray-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{row.leetcode ? <Icon name="check" size={18} className="text-gray-500 mx-auto" /> : <Icon name="x" size={18} className="text-gray-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{row.bytebyte ? <Icon name="check" size={18} className="text-gray-500 mx-auto" /> : <Icon name="x" size={18} className="text-gray-600 mx-auto" />}</td>
                        <td className="p-4 text-center">{row.interviewing ? <Icon name="check" size={18} className="text-gray-500 mx-auto" /> : <Icon name="x" size={18} className="text-gray-600 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section id="testimonials" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Loved by Engineers</h2>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'rgba(250, 204, 21, 0.1)' }}>
                  {[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={14} className="text-yellow-400" />)}
                  <span className="text-yellow-400 font-bold ml-1">4.9</span>
                </div>
              </div>
              <p className="text-gray-400 text-lg">Real success stories from engineers who landed their dream jobs</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'][i]}, ${['#059669', '#2563eb', '#7c3aed', '#d97706', '#db2777', '#0891b2'][i]})` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{t.name}</div>
                      <div className="text-gray-500 text-sm">{t.role} @ {t.company}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            PRICING
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section id="pricing" className="py-20" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-400 text-lg">Start free. Upgrade when you're ready. Cancel anytime.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Monthly */}
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="cloud" size={24} className="text-gray-400" />
                  <h3 className="text-xl font-bold text-white">Monthly</h3>
                </div>
                <p className="text-gray-500 text-sm mb-6">Perfect for trying it out</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold text-white">$99</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['5 credits per month', '25 coding problems', 'System design basics', 'Email support'].map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-400">
                      <Icon name="check" size={18} className="text-green-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('monthly')} className="w-full py-3.5 rounded-xl font-semibold transition-all hover:bg-white/15" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                  {loading === 'monthly' ? <Icon name="loader" size={18} className="animate-spin mx-auto" /> : 'Get Started'}
                </button>
              </div>

              {/* Quarterly Pro - Featured */}
              <div className="relative p-8 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))', border: '2px solid #10b981', boxShadow: '0 0 60px rgba(16, 185, 129, 0.15)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: '#10b981', color: '#fff' }}>MOST POPULAR</div>
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="rocket" size={24} className="text-green-400" />
                  <h3 className="text-xl font-bold text-white">Quarterly Pro</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">Best value for serious prep</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-white">$300</span>
                  <span className="text-gray-400">/quarter</span>
                </div>
                <div className="text-green-400 text-sm mb-6">$100/mo — Save $97 vs monthly</div>
                <ul className="space-y-4 mb-8">
                  {['10 credits per month', 'Unlimited problems', 'Full system design', 'Behavioral coaching', 'Job Discovery Portal', 'Priority support'].map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300">
                      <Icon name="check" size={18} className="text-green-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('quarterly_pro')} className="w-full py-3.5 rounded-xl font-bold transition-all hover:scale-105" style={{ background: '#10b981', color: '#fff' }}>
                  {loading === 'quarterly_pro' ? <Icon name="loader" size={18} className="animate-spin mx-auto" /> : 'Get Quarterly Pro'}
                </button>
              </div>

              {/* Desktop Lifetime */}
              <div className="relative p-8 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.03))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: '#8b5cf6', color: '#fff' }}>LIFETIME</div>
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="terminal" size={24} className="text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Desktop</h3>
                </div>
                <p className="text-gray-500 text-sm mb-6">One-time purchase, own forever</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-white">$300</span>
                  <span className="text-gray-500">once</span>
                </div>
                <div className="text-purple-400 text-sm mb-6">No subscription, ever</div>
                <ul className="space-y-4 mb-8">
                  {['Unlimited forever', 'Use your own API keys', 'Offline mode', 'All future updates', 'No recurring fees'].map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-400">
                      <Icon name="check" size={18} className="text-purple-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingClick('desktop_lifetime')} className="w-full py-3.5 rounded-xl font-semibold transition-all hover:bg-purple-600" style={{ background: '#8b5cf6', color: '#fff' }}>
                  {loading === 'desktop_lifetime' ? <Icon name="loader" size={18} className="animate-spin mx-auto" /> : 'Buy Desktop'}
                </button>
              </div>
            </div>
            <p className="text-center text-gray-500 mt-8">30-day money-back guarantee • Secure payment via Stripe</p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-400 text-lg">Everything you need to know</p>
            </div>
            <div className="space-y-4">
              {faqItems.map((faq, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full p-5 flex items-center justify-between text-left">
                    <span className="text-white font-medium pr-4">{faq.q}</span>
                    <Icon name={expandedFaq === i ? 'chevronUp' : 'chevronDown'} size={18} className="text-gray-500 flex-shrink-0" />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="p-12 rounded-3xl text-center" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 0 80px rgba(16, 185, 129, 0.1)' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">Join 50,000+ engineers who are acing interviews and securing top tech offers with Ascend.</p>
              <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' }}>
                {loading === 'google' ? <Icon name="loader" size={20} className="animate-spin" /> : 'Start Free Trial — No Credit Card'}
              </button>
              {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════════════════════════════ */}
        <footer className="py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Icon name="ascend" size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-lg">Ascend</span>
                  <p className="text-gray-500 text-sm">Ace every interview.</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <a href="/docs" className="hover:text-white transition-colors">Documentation</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="mailto:support@cariara.com" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-gray-600 text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              © 2025 Ascend by Cariara. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
