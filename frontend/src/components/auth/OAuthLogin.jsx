import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Ascend Landing Page - Compact Version
 */
export default function OAuthLogin() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeDemo, setActiveDemo] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [designIndex, setDesignIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const statsRef = useRef(null);
  const [counters, setCounters] = useState({ success: 0, offers: 0, salary: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Code snippets for demo
  const codeSnippets = [
    { lang: 'python', code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i' },
    { lang: 'javascript', code: 'function maxProfit(prices) {\n  let min = prices[0], max = 0;\n  for (let p of prices) {\n    min = Math.min(min, p);\n    max = Math.max(max, p - min);\n  }\n  return max;\n}' },
  ];

  // System designs for demo
  const systemDesigns = [
    {
      title: 'URL Shortener',
      nodes: [
        { id: 'users', label: 'Users', icon: '👥', x: 5, y: 40, color: '#8b5cf6' },
        { id: 'lb', label: 'Load Balancer', icon: '⚖️', x: 25, y: 40, color: '#f59e0b' },
        { id: 'api', label: 'API Servers', icon: '🖥️', x: 50, y: 25, color: '#10b981' },
        { id: 'cache', label: 'Redis Cache', icon: '⚡', x: 50, y: 55, color: '#ef4444' },
        { id: 'db', label: 'PostgreSQL', icon: '🗄️', x: 75, y: 40, color: '#3b82f6' },
      ],
      connections: [{ from: 'users', to: 'lb' }, { from: 'lb', to: 'api' }, { from: 'lb', to: 'cache' }, { from: 'api', to: 'db' }, { from: 'cache', to: 'db' }]
    },
    {
      title: 'Real-time Chat',
      nodes: [
        { id: 'clients', label: 'Clients', icon: '📱', x: 5, y: 40, color: '#8b5cf6' },
        { id: 'ws', label: 'WebSocket', icon: '🔌', x: 28, y: 40, color: '#10b981' },
        { id: 'pubsub', label: 'Redis PubSub', icon: '📡', x: 52, y: 25, color: '#ef4444' },
        { id: 'queue', label: 'Message Queue', icon: '📬', x: 52, y: 55, color: '#f59e0b' },
        { id: 'mongo', label: 'MongoDB', icon: '🍃', x: 78, y: 40, color: '#22c55e' },
      ],
      connections: [{ from: 'clients', to: 'ws' }, { from: 'ws', to: 'pubsub' }, { from: 'ws', to: 'queue' }, { from: 'pubsub', to: 'mongo' }, { from: 'queue', to: 'mongo' }]
    },
  ];

  // Interview Q&A for demo
  const interviewQA = [
    { q: 'Tell me about a challenging project', a: 'Led migration of monolith to microservices, reducing deploy time by 80%...' },
    { q: 'How do you handle conflict?', a: 'I focus on understanding perspectives first. In one case, I mediated...' },
  ];

  // Reviews (reduced to 3)
  const reviews = [
    { name: 'Sarah M.', title: 'Senior Software Engineer', text: 'Got offers from 3 FAANG companies. The coding assistance was flawless.', date: 'Feb 2025' },
    { name: 'James K.', title: 'Staff Engineer', text: 'The system design help alone is worth it. Helped me nail my Amazon L6 interview.', date: 'Jan 2025' },
    { name: 'Priya R.', title: 'Engineering Manager', text: 'Game changer for behavioral interviews. The STAR method responses were perfect.', date: 'Feb 2025' },
  ];

  // FAQ (reduced to 4)
  const faqItems = [
    { q: 'How does Ascend work?', a: 'Ascend uses AI to transcribe questions in real-time and provide instant answers for coding, system design, and behavioral interviews.' },
    { q: 'Is Ascend undetectable?', a: 'Yes. Completely invisible during screen sharing, doesn\'t appear in dock or task manager, and cannot be detected by interview platforms.' },
    { q: 'What platforms does it work with?', a: 'Zoom, Google Meet, Microsoft Teams, HackerRank, LeetCode, CoderPad, Amazon Chime, Webex, and more.' },
    { q: 'Can I use my own API keys?', a: 'Yes! The desktop app supports your own Claude or OpenAI API keys for unlimited usage.' },
  ];

  // Privacy features
  const privacyFeatures = [
    { icon: '👁️', title: 'Invisible on Screen Share' },
    { icon: '🎯', title: 'Invisible in Dock' },
    { icon: '📋', title: 'Hidden from Task Manager' },
    { icon: '⌨️', title: 'Tab Switch Safe' },
  ];

  // Demo rotation
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

  // Stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          const duration = 2000, steps = 60;
          const targets = { success: 300, offers: 17000, salary: 30 };
          let step = 0;
          const interval = setInterval(() => {
            step++;
            const eased = 1 - Math.pow(1 - step / steps, 3);
            setCounters({ success: Math.round(targets.success * eased), offers: Math.round(targets.offers * eased), salary: Math.round(targets.salary * eased) });
            if (step >= steps) clearInterval(interval);
          }, duration / steps);
        }
      });
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

  const handleOAuthLogin = async (provider) => {
    setLoading(provider);
    setError('');
    try {
      await signIn(provider);
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      setLoading(null);
    }
  };

  const handlePricingClick = async (planId) => {
    setLoading(planId);
    setError('');
    localStorage.setItem('ascend_pending_plan', planId);
    try {
      await signIn('google');
    } catch (err) {
      localStorage.removeItem('ascend_pending_plan');
      setError(err.message || 'Failed to sign in');
      setLoading(null);
    }
  };

  const providers = [
    { id: 'google', name: 'Google' },
    { id: 'github', name: 'GitHub' },
    { id: 'linkedin', name: 'LinkedIn' },
  ];

  const features = [
    { emoji: '🎙️', title: 'Speech Recognition', desc: 'Real-time transcription' },
    { emoji: '💻', title: 'Coding Support', desc: 'Solves LeetCode, HackerRank' },
    { emoji: '🏗️', title: 'System Design', desc: 'Architecture diagrams' },
    { emoji: '🎯', title: 'Behavioral Prep', desc: 'STAR method responses' },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Uber'];

  return (
    <div className="min-h-screen relative overflow-hidden scroll-smooth" style={{ background: '#030712' }}>
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', top: '-20%', left: '-10%' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', bottom: '-10%', right: '-5%' }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <img src="/ascend-logo.png" alt="Ascend" className="w-7 h-7 object-contain filter brightness-0 invert" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <span className="text-xl font-bold text-white">Ascend</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm">Features</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</button>
            <button onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm">Reviews</button>
            <button onClick={() => handleOAuthLogin('google')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }}>Sign In</button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="px-6 lg:px-12 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1]">
                  <span className="text-white">Your Real-Time AI</span><br />
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)' }}>Interview Assistant</span>
                </h1>
                <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                  Real-time coding solutions, system design help, and behavioral prep. <span className="text-white font-medium">100% Private & Undetectable.</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                  <button onClick={() => handleOAuthLogin('google')} disabled={loading !== null} className="group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <>Try For Free <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
                    </span>
                  </button>
                </div>
                <p className="text-gray-500 text-sm">No Credit Card Required</p>
              </div>

              {/* Right Content - Demo */}
              <div className="w-full lg:w-1/2">
                <div className="flex gap-2 mb-4 justify-center">
                  {[{ id: 0, label: '💻 Coding', color: '#10b981' }, { id: 1, label: '🏗️ System Design', color: '#3b82f6' }, { id: 2, label: '🎯 Behavioral', color: '#8b5cf6' }].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveDemo(tab.id)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: activeDemo === tab.id ? `${tab.color}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${activeDemo === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`, color: activeDemo === tab.id ? tab.color : '#9ca3af' }}>{tab.label}</button>
                  ))}
                </div>
                <div className="relative rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${activeDemo === 0 ? 'rgba(16, 185, 129, 0.3)' : activeDemo === 1 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}` }}>
                  <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                  </div>

                  {activeDemo === 0 && (
                    <div className="p-6">
                      <div className="font-mono text-sm">
                        <pre className="text-green-400 leading-relaxed whitespace-pre-wrap">{codeSnippets[codeIndex].code}</pre>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-xs text-green-400">✓ O(n) time • O(n) space</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDemo === 1 && (
                    <div className="p-4">
                      <div className="text-blue-400 font-semibold mb-3">{systemDesigns[designIndex].title}</div>
                      <div className="relative h-40 rounded-lg" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                        <svg className="absolute inset-0 w-full h-full">
                          <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" /></marker></defs>
                          {systemDesigns[designIndex].connections.map((conn, i) => {
                            const fromNode = systemDesigns[designIndex].nodes.find(n => n.id === conn.from);
                            const toNode = systemDesigns[designIndex].nodes.find(n => n.id === conn.to);
                            if (!fromNode || !toNode) return null;
                            return <line key={i} x1={`${fromNode.x + 8}%`} y1={`${fromNode.y}%`} x2={`${toNode.x - 2}%`} y2={`${toNode.y}%`} stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" markerEnd="url(#arrowhead)" />;
                          })}
                        </svg>
                        {systemDesigns[designIndex].nodes.map((node) => (
                          <div key={node.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                            <div className="flex flex-col items-center gap-1 p-2 rounded-lg" style={{ background: `${node.color}15`, border: `1px solid ${node.color}40` }}>
                              <span className="text-lg">{node.icon}</span>
                              <span className="text-xs font-medium text-white whitespace-nowrap">{node.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeDemo === 2 && (
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><span className="text-purple-400">Q</span></div><span className="text-gray-400 text-sm">Interviewer</span></div>
                        <p className="text-white font-medium pl-10">"{interviewQA[interviewIndex].q}"</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-green-400">A</span></div><span className="text-gray-400 text-sm">STAR Response</span></div>
                        <p className="text-purple-300 pl-10">"{interviewQA[interviewIndex].a}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companies */}
        <div className="py-6 border-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <p className="text-center text-gray-500 text-sm mb-4">Trusted by engineers at</p>
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap px-6">
            {companies.map((company, i) => <span key={i} className="text-gray-500 font-bold text-lg">{company}</span>)}
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="py-16 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="text-4xl font-black text-green-400 mb-1">{counters.success}%+</div>
              <div className="text-white font-bold">Higher Success Rate</div>
            </div>
            <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="text-4xl font-black text-blue-400 mb-1">{counters.offers.toLocaleString()}+</div>
              <div className="text-white font-bold">Offers Received</div>
            </div>
            <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="text-4xl font-black text-purple-400 mb-1">{counters.salary}%+</div>
              <div className="text-white font-bold">Salary Increase</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="py-16 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Everything You Need</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="p-5 rounded-xl text-center" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="text-3xl mb-3">{feature.emoji}</div>
                  <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="py-12 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">100% Private & Undetectable</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {privacyFeatures.map((feature, i) => (
                <div key={i} className="p-4 rounded-xl text-center" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-white text-sm font-medium">{feature.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="py-16 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Choose Your Plan</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Monthly */}
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="text-xl mb-1">☁️</div>
                <h3 className="text-white font-bold">Monthly</h3>
                <div className="flex items-baseline gap-1 my-3"><span className="text-2xl font-bold text-white">$99</span><span className="text-gray-500 text-sm">/mo</span></div>
                <ul className="space-y-1 mb-4 text-sm text-gray-300">
                  <li>✓ 5 credits</li>
                  <li>✓ 25 coding problems</li>
                  <li>✓ 10 system designs</li>
                </ul>
                <button onClick={() => handlePricingClick('monthly')} className="w-full py-2 rounded-lg font-medium text-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>{loading === 'monthly' ? '...' : 'Get Started'}</button>
              </div>

              {/* Quarterly Pro */}
              <div className="p-5 rounded-2xl relative" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', border: '2px solid #10b981' }}>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#10b981', color: '#fff' }}>BEST VALUE</div>
                <div className="text-xl mb-1">🚀</div>
                <h3 className="text-white font-bold">Quarterly Pro</h3>
                <div className="flex items-baseline gap-1 my-3"><span className="text-2xl font-bold text-white">$300</span><span className="text-gray-500 text-sm">/qtr</span></div>
                <ul className="space-y-1 mb-4 text-sm text-gray-300">
                  <li>✓ 10 credits</li>
                  <li>✓ 50 coding problems</li>
                  <li className="text-blue-400">✓ Job Discovery Portal</li>
                </ul>
                <button onClick={() => handlePricingClick('quarterly_pro')} className="w-full py-2 rounded-lg font-medium text-sm" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>{loading === 'quarterly_pro' ? '...' : 'Get Pro'}</button>
              </div>

              {/* Desktop */}
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div className="text-xl mb-1">🖥️</div>
                <h3 className="text-white font-bold">Desktop Lifetime</h3>
                <div className="flex items-baseline gap-1 my-3"><span className="text-2xl font-bold text-white">$300</span><span className="text-gray-500 text-sm">once</span></div>
                <ul className="space-y-1 mb-4 text-sm text-gray-300">
                  <li>✓ Mac & Windows</li>
                  <li>✓ Use your own API keys</li>
                  <li>✓ Unlimited forever</li>
                </ul>
                <button onClick={() => handlePricingClick('desktop_lifetime')} className="w-full py-2 rounded-lg font-medium text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>{loading === 'desktop_lifetime' ? '...' : 'Buy Lifetime'}</button>
              </div>

              {/* Credits */}
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="text-xl mb-1">🎫</div>
                <h3 className="text-white font-bold">Credit Pack</h3>
                <div className="flex items-baseline gap-1 my-3"><span className="text-2xl font-bold text-white">$30</span><span className="text-gray-500 text-sm">once</span></div>
                <ul className="space-y-1 mb-4 text-sm text-gray-300">
                  <li>✓ 3 credits</li>
                  <li>✓ No expiration</li>
                  <li>✓ Stack with plans</li>
                </ul>
                <button onClick={() => handlePricingClick('addon')} className="w-full py-2 rounded-lg font-medium text-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>{loading === 'addon' ? '...' : 'Buy Credits'}</button>
              </div>
            </div>
            <p className="text-center text-gray-500 text-sm mt-6">1 credit = 5 coding + 2 system design + 30 min interview • 30-Day Money Back Guarantee</p>
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews" className="py-16 px-6 lg:px-12" style={{ background: 'rgba(16, 185, 129, 0.02)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">What Users Say</h2>
              <div className="flex items-center justify-center gap-1 text-yellow-400">{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}<span className="text-white font-bold ml-2">4.9</span></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {reviews.map((review, i) => (
                <div key={i} className="p-5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: `hsl(${i * 60 + 120}, 60%, 40%)` }}>{review.name[0]}</div>
                    <div>
                      <div className="text-white font-semibold text-sm">{review.name}</div>
                      <div className="text-green-400 text-xs">{review.title}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="py-16 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">FAQ</h2>
            <div className="space-y-3">
              {faqItems.map((faq, i) => (
                <div key={i} className="p-5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-400 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sign In CTA */}
        <div className="py-12 px-6 lg:px-12">
          <div className="max-w-sm mx-auto p-6 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Get Started Free</h2>
              <p className="text-gray-400 text-sm">No credit card required</p>
            </div>
            <div className="space-y-2">
              {providers.map((provider) => (
                <button key={provider.id} onClick={() => handleOAuthLogin(provider.id)} disabled={loading !== null} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                  {loading === provider.id ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <>
                    {provider.id === 'google' && <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                    {provider.id === 'github' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>}
                    {provider.id === 'linkedin' && <svg className="w-4 h-4" fill="#0A66C2" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                    Continue with {provider.name}
                  </>}
                </button>
              ))}
            </div>
            {error && <div className="mt-3 p-2 rounded-lg text-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}><p className="text-red-400 text-xs">{error}</p></div>}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-6 lg:px-12 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <img src="/ascend-logo.png" alt="" className="w-5 h-5 object-contain filter brightness-0 invert" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <span className="text-white font-bold">Ascend</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="text-gray-500 hover:text-white">Privacy</a>
              <a href="/terms" className="text-gray-500 hover:text-white">Terms</a>
              <a href="mailto:support@ascend.ai" className="text-gray-500 hover:text-white">Contact</a>
            </div>
            <div className="text-gray-600 text-sm">© 2025 Ascend</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
