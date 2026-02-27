import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

/**
 * Ascend Landing Page - Modern Design with Distinct Sections
 */
export default function OAuthLogin() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeDemo, setActiveDemo] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [designIndex, setDesignIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [counters, setCounters] = useState({ success: 0, offers: 0, salary: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  const codeSnippets = [
    { lang: 'python', code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i' },
    { lang: 'javascript', code: 'function maxProfit(prices) {\n  let min = prices[0], max = 0;\n  for (let p of prices) {\n    min = Math.min(min, p);\n    max = Math.max(max, p - min);\n  }\n  return max;\n}' },
    { lang: 'sql', code: 'SELECT d.name, COUNT(e.id)\nFROM departments d\nLEFT JOIN employees e\n  ON d.id = e.dept_id\nGROUP BY d.id\nHAVING COUNT(e.id) > 5;' },
  ];

  const systemDesigns = [
    {
      title: 'URL Shortener',
      subtitle: 'High-throughput link shortening service',
      nodes: [
        { id: 'client', label: 'Client', icon: 'globe', x: 10, y: 40, color: '#10b981' },
        { id: 'lb', label: 'Load Balancer', icon: 'server', x: 30, y: 40, color: '#3b82f6' },
        { id: 'api', label: 'API Server', icon: 'cpu', x: 50, y: 25, color: '#8b5cf6' },
        { id: 'cache', label: 'Redis Cache', icon: 'activity', x: 50, y: 55, color: '#f59e0b' },
        { id: 'db', label: 'Database', icon: 'layers', x: 75, y: 40, color: '#ef4444' },
      ],
      connections: [
        { from: 'client', to: 'lb' }, { from: 'lb', to: 'api' }, { from: 'api', to: 'cache' }, { from: 'api', to: 'db' }, { from: 'cache', to: 'db' },
      ]
    },
    {
      title: 'Real-time Chat',
      subtitle: 'Scalable messaging architecture',
      nodes: [
        { id: 'users', label: 'Users', icon: 'users', x: 10, y: 40, color: '#10b981' },
        { id: 'ws', label: 'WebSocket', icon: 'wifi', x: 30, y: 40, color: '#3b82f6' },
        { id: 'pubsub', label: 'Pub/Sub', icon: 'activity', x: 50, y: 25, color: '#8b5cf6' },
        { id: 'presence', label: 'Presence', icon: 'eye', x: 50, y: 55, color: '#f59e0b' },
        { id: 'store', label: 'Message Store', icon: 'layers', x: 75, y: 40, color: '#ef4444' },
      ],
      connections: [
        { from: 'users', to: 'ws' }, { from: 'ws', to: 'pubsub' }, { from: 'ws', to: 'presence' }, { from: 'pubsub', to: 'store' },
      ]
    },
  ];

  const interviewQA = [
    { q: 'Tell me about a challenging project', a: 'Led migration of monolith to microservices, reducing deploy time by 80%...' },
    { q: 'How do you handle conflict?', a: 'I focus on understanding perspectives first. In one case, I mediated...' },
    { q: 'Why do you want this role?', a: 'Your focus on developer experience aligns with my passion...' },
  ];

  const reviews = [
    { name: 'Sarah M.', title: 'Senior SWE @ Meta', text: 'Got offers from 3 FAANG companies. The coding assistance was flawless.', rating: 5 },
    { name: 'James K.', title: 'Staff Engineer @ Google', text: 'The system design help alone is worth it. Helped me nail my Amazon L6 interview.', rating: 5 },
    { name: 'Priya R.', title: 'Eng Manager @ Netflix', text: 'Game changer for behavioral interviews. The STAR method responses were perfect.', rating: 5 },
  ];

  const faqItems = [
    { q: 'How does Ascend work?', a: 'Ascend uses advanced AI to listen to your interview in real-time, transcribe questions, and provide instant answers.' },
    { q: 'Is it really undetectable?', a: 'Yes. Completely invisible during screen sharing, not in dock/taskbar, undetectable by any platform.' },
    { q: 'What platforms work?', a: 'Zoom, Google Meet, Teams, HackerRank, LeetCode, CoderPad, and virtually any interview platform.' },
    { q: 'What languages supported?', a: '20+ languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL.' },
  ];

  const features = [
    { icon: 'microphone', title: 'Live Transcription', color: '#10b981' },
    { icon: 'robot', title: 'AI Answers', color: '#3b82f6' },
    { icon: 'code', title: 'Code Solutions', color: '#8b5cf6' },
    { icon: 'systemDesign', title: 'System Design', color: '#f59e0b' },
    { icon: 'resume', title: 'Resume Sync', color: '#ef4444' },
    { icon: 'target', title: 'Auto Detect', color: '#06b6d4' },
    { icon: 'globe', title: '20+ Languages', color: '#ec4899' },
    { icon: 'chartBar', title: 'Analytics', color: '#84cc16' },
  ];

  const privacyFeatures = [
    { icon: 'eye', title: 'Screen Share Safe' },
    { icon: 'target', title: 'Hidden in Dock' },
    { icon: 'clipboard', title: 'No Task Manager' },
    { icon: 'keyboard', title: 'Tab Switch Safe' },
  ];

  const platforms = [
    { name: 'Zoom', icon: 'video' },
    { name: 'Meet', icon: 'camera' },
    { name: 'Teams', icon: 'briefcase' },
    { name: 'HackerRank', icon: 'terminal' },
    { name: 'LeetCode', icon: 'puzzle' },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix'];

  useEffect(() => {
    const interval = setInterval(() => setCodeIndex((prev) => (prev + 1) % codeSnippets.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setDesignIndex((prev) => (prev + 1) % systemDesigns.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setInterviewIndex((prev) => (prev + 1) % interviewQA.length), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveDemo((prev) => (prev + 1) % 3), 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);
            const duration = 2000, steps = 60, targets = { success: 300, offers: 17000, salary: 30 };
            let step = 0;
            const interval = setInterval(() => {
              step++;
              const eased = 1 - Math.pow(1 - step / steps, 3);
              setCounters({ success: Math.round(targets.success * eased), offers: Math.round(targets.offers * eased), salary: Math.round(targets.salary * eased) });
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

  const providers = [{ id: 'google', name: 'Google' }, { id: 'github', name: 'GitHub' }, { id: 'linkedin', name: 'LinkedIn' }];

  return (
    <div className="min-h-screen relative" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #10b98120 0%, transparent 60%)', top: '-300px', left: '-200px' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f620 0%, transparent 60%)', bottom: '0', right: '-100px' }} />
      </div>

      <div className="relative z-10 mx-auto px-6" style={{ maxWidth: '1200px' }}>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            NAVIGATION - Floating glass nav
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="ascend" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Ascend</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white text-sm">Features</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white text-sm">Pricing</button>
            <a href="/docs" className="text-gray-400 hover:text-white text-sm">Docs</a>
            <button onClick={() => handleOAuthLogin('google')} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#10b981', color: '#fff' }}>
              Get Started
            </button>
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                <Icon name="sparkles" size={12} />
                AI Interview Assistant
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                <span className="text-white">Ace Every</span><br />
                <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Technical Interview</span>
              </h1>
              <p className="text-gray-400 mb-8 text-lg">Real-time AI for coding, system design & behavioral. <span className="text-white">100% invisible.</span></p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="px-8 py-3.5 rounded-xl font-semibold text-white transition-transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {loading ? <Icon name="loader" size={18} className="animate-spin" /> : 'Start Free Trial'}
                </button>
                <button className="px-6 py-3.5 rounded-xl font-medium text-gray-300 flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon name="play" size={16} /> Watch Demo
                </button>
              </div>
            </div>

            {/* Demo Window */}
            <div className="w-full lg:w-1/2">
              <div className="flex gap-2 mb-3 justify-center">
                {[{ id: 0, label: 'Coding', color: '#10b981' }, { id: 1, label: 'System Design', color: '#3b82f6' }, { id: 2, label: 'Behavioral', color: '#8b5cf6' }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveDemo(tab.id)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: activeDemo === tab.id ? `${tab.color}20` : 'transparent', border: `1px solid ${activeDemo === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`, color: activeDemo === tab.id ? tab.color : '#6b7280' }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${['#10b981', '#3b82f6', '#8b5cf6'][activeDemo]}30`, height: '380px' }}>
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-gray-500 flex-1 text-center font-mono">{activeDemo === 0 ? 'solution.py' : activeDemo === 1 ? 'architecture.md' : 'response.md'}</span>
                </div>
                <div className="p-5" style={{ height: '332px' }}>
                  {activeDemo === 0 && (
                    <div className="h-full flex flex-col">
                      <div className="text-gray-500 text-xs mb-2 font-mono">// AI solving...</div>
                      <pre className="text-green-400 text-sm font-mono flex-1 leading-relaxed">{codeSnippets[codeIndex].code}</pre>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: '100%', background: '#10b981', animation: 'progress 4s linear infinite' }} />
                        </div>
                        <span className="text-green-400 text-xs flex items-center gap-1"><Icon name="check" size={12} />Done</span>
                      </div>
                    </div>
                  )}
                  {activeDemo === 1 && (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="layers" size={18} className="text-blue-400" />
                        <span className="text-blue-400 font-medium">{systemDesigns[designIndex].title}</span>
                      </div>
                      <div className="relative flex-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <svg className="absolute inset-0 w-full h-full opacity-5"><defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3b82f6" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
                        {systemDesigns[designIndex].nodes.map((node) => (
                          <div key={node.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${node.color}20`, border: `1px solid ${node.color}` }}>
                              <Icon name={node.icon} size={16} style={{ color: node.color }} />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1">{node.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeDemo === 2 && (
                    <div className="h-full flex flex-col">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Icon name="question" size={16} className="text-purple-400" /></div>
                          <span className="text-gray-400 text-sm">Interviewer</span>
                        </div>
                        <p className="text-white ml-10">"{interviewQA[interviewIndex].q}"</p>
                      </div>
                      <div className="flex-1 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><Icon name="answer" size={16} className="text-green-400" /></div>
                          <span className="text-gray-400 text-sm">STAR Response</span>
                        </div>
                        <p className="text-purple-300 ml-10 text-sm">"{interviewQA[interviewIndex].a}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            SOCIAL PROOF BAR - Minimal horizontal strip
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section ref={statsRef} className="py-6 mb-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex flex-wrap items-center justify-center gap-8 px-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">Trusted by</span>
              {companies.map((c, i) => <span key={i} className="text-gray-400 font-medium">{c}</span>)}
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-6">
              {[{ v: `${counters.success}%`, l: 'Success', c: '#10b981' }, { v: counters.offers.toLocaleString(), l: 'Offers', c: '#3b82f6' }, { v: `${counters.salary}%`, l: 'Salary↑', c: '#8b5cf6' }].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold tabular-nums" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-gray-500 text-xs">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            FEATURES SECTION - Icon grid with colored accents
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Powerful Features</h2>
            <p className="text-gray-500">Everything you need to ace any interview</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="group p-5 rounded-xl transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${f.color}08, ${f.color}03)`, border: `1px solid ${f.color}20` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${f.color}15` }}>
                  <Icon name={f.icon} size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-medium text-sm">{f.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            PRIVACY SECTION - Shield themed card
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-8">
          <div className="p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                <Icon name="shield" size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">100% Undetectable</h3>
                <p className="text-gray-400 text-sm">Works invisibly on any platform</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {privacyFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <Icon name={f.icon} size={14} className="text-green-400" />
                  <span className="text-gray-300 text-xs">{f.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            PLATFORMS SECTION - Pill badges
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-gray-500 text-sm">Works with:</span>
          {platforms.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Icon name={p.icon} size={14} className="text-gray-400" />
              <span className="text-white text-sm">{p.name}</span>
            </div>
          ))}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            CTA SECTION - Glowing card
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12">
          <div className="max-w-md mx-auto p-8 rounded-2xl text-center" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 0 60px rgba(16, 185, 129, 0.1)' }}>
            <h2 className="text-xl font-bold text-white mb-2">Ready to Ace Your Interview?</h2>
            <p className="text-gray-400 text-sm mb-6">Start your free trial today. No credit card required.</p>
            <div className="space-y-2">
              {providers.map((p) => (
                <button key={p.id} onClick={() => handleOAuthLogin(p.id)} disabled={loading !== null} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  {loading === p.id ? <Icon name="loader" size={16} className="animate-spin" /> : <><Icon name={p.id} size={16} />{p.name}</>}
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            <p className="mt-4 text-[11px] text-gray-600">By signing up, you agree to our <a href="/terms" className="text-gray-500 hover:text-white">Terms</a> & <a href="/privacy" className="text-gray-500 hover:text-white">Privacy</a></p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            PRICING SECTION - Large prominent cards
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section id="pricing" className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Simple Pricing</h2>
            <p className="text-gray-500">Start free, upgrade when ready</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Monthly */}
            <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="cloud" size={20} className="text-gray-400" />
                <h3 className="text-lg font-bold text-white">Monthly</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['5 credits/month', '25 coding problems', 'Basic support'].map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon name="check" size={16} className="text-green-400" />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePricingClick('monthly')} className="w-full py-3 rounded-xl font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                {loading === 'monthly' ? '...' : 'Get Started'}
              </button>
            </div>

            {/* Quarterly Pro - Featured */}
            <div className="relative p-6 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', border: '2px solid #10b981' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#10b981', color: '#fff' }}>POPULAR</div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="rocket" size={20} className="text-green-400" />
                <h3 className="text-lg font-bold text-white">Quarterly Pro</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$300</span>
                <span className="text-gray-500">/qtr</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['10 credits/month', 'Unlimited problems', 'Job Discovery Portal', 'Priority support'].map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300 text-sm">
                    <Icon name="check" size={16} className="text-green-400" />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePricingClick('quarterly_pro')} className="w-full py-3 rounded-xl font-semibold" style={{ background: '#10b981', color: '#fff' }}>
                {loading === 'quarterly_pro' ? '...' : 'Get Pro'}
              </button>
            </div>

            {/* Desktop Lifetime */}
            <div className="relative p-6 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#8b5cf6', color: '#fff' }}>LIFETIME</div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="terminal" size={20} className="text-purple-400" />
                <h3 className="text-lg font-bold text-white">Desktop</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$300</span>
                <span className="text-gray-500">once</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['Unlimited forever', 'Use your own API keys', 'Offline mode', 'No subscription'].map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon name="check" size={16} className="text-purple-400" />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePricingClick('desktop_lifetime')} className="w-full py-3 rounded-xl font-medium" style={{ background: '#8b5cf6', color: '#fff' }}>
                {loading === 'desktop_lifetime' ? '...' : 'Buy Now'}
              </button>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">30-day money back guarantee</p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            REVIEWS SECTION - Testimonial cards
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section id="reviews" className="py-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <h2 className="text-xl font-bold text-white">Loved by Engineers</h2>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(250, 204, 21, 0.1)' }}>
              {[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={12} className="text-yellow-400" />)}
              <span className="text-yellow-400 text-sm font-bold ml-1">4.9</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${['#10b981', '#3b82f6', '#8b5cf6'][i]}, ${['#059669', '#2563eb', '#7c3aed'][i]})` }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{r.name}</div>
                    <div className="text-gray-500 text-xs">{r.title}</div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            FAQ SECTION - Clean accordion style
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12">
          <h2 className="text-xl font-bold text-white text-center mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {faqItems.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-medium text-sm mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════════════════════ */}
        <footer className="py-8 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="ascend" size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold">Ascend</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
            <span>© 2025</span>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes progress { 0% { width: 0; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
}
