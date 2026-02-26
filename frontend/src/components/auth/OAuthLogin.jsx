import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Icon } from '../Icons.jsx';

/**
 * Ascend Landing Page - Modern AI-Inspired Design
 * Custom SVG icons, Inter font, 75% width container
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
        { from: 'client', to: 'lb' },
        { from: 'lb', to: 'api' },
        { from: 'api', to: 'cache' },
        { from: 'api', to: 'db' },
        { from: 'cache', to: 'db' },
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
        { from: 'users', to: 'ws' },
        { from: 'ws', to: 'pubsub' },
        { from: 'ws', to: 'presence' },
        { from: 'pubsub', to: 'store' },
      ]
    },
    {
      title: 'E-commerce Platform',
      subtitle: 'Microservices architecture',
      nodes: [
        { id: 'gateway', label: 'API Gateway', icon: 'shield', x: 10, y: 40, color: '#10b981' },
        { id: 'catalog', label: 'Catalog', icon: 'puzzle', x: 35, y: 20, color: '#3b82f6' },
        { id: 'cart', label: 'Cart', icon: 'package', x: 35, y: 60, color: '#8b5cf6' },
        { id: 'payment', label: 'Payment', icon: 'wallet', x: 60, y: 20, color: '#f59e0b' },
        { id: 'orders', label: 'Orders', icon: 'clipboard', x: 60, y: 60, color: '#ef4444' },
        { id: 'queue', label: 'Queue', icon: 'inbox', x: 85, y: 40, color: '#06b6d4' },
      ],
      connections: [
        { from: 'gateway', to: 'catalog' },
        { from: 'gateway', to: 'cart' },
        { from: 'catalog', to: 'payment' },
        { from: 'cart', to: 'orders' },
        { from: 'payment', to: 'queue' },
        { from: 'orders', to: 'queue' },
      ]
    },
  ];

  const interviewQA = [
    { q: 'Tell me about a challenging project', a: 'Led migration of monolith to microservices, reducing deploy time by 80%...' },
    { q: 'How do you handle conflict?', a: 'I focus on understanding perspectives first. In one case, I mediated...' },
    { q: 'Why do you want this role?', a: 'Your focus on developer experience aligns with my passion...' },
  ];

  const reviews = [
    { name: 'Sarah M.', title: 'Senior Software Engineer', text: 'Got offers from 3 FAANG companies. The coding assistance was flawless.', rating: 5 },
    { name: 'James K.', title: 'Staff Engineer', text: 'The system design help alone is worth it. Helped me nail my Amazon L6 interview.', rating: 5 },
    { name: 'Priya R.', title: 'Engineering Manager', text: 'Game changer for behavioral interviews. The STAR method responses were perfect.', rating: 5 },
  ];

  const faqItems = [
    { q: 'How does Ascend work?', a: 'Ascend uses advanced AI to listen to your interview in real-time, transcribe questions, and provide instant answers for coding, system design, and behavioral interviews.' },
    { q: 'Is Ascend really undetectable?', a: 'Yes. Ascend is completely invisible during screen sharing, doesn\'t appear in your dock or task manager, and cannot be detected by any interview platform.' },
    { q: 'What platforms does it work with?', a: 'Ascend works with Zoom, Google Meet, Microsoft Teams, HackerRank, LeetCode, CoderPad, Amazon Chime, Webex, and virtually any other interview platform.' },
    { q: 'What programming languages are supported?', a: 'We support 20+ languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, and more.' },
  ];

  const features = [
    { icon: 'microphone', title: 'Speech Recognition', desc: 'Blazing fast transcription with state-of-the-art AI models', highlight: 'Real-time' },
    { icon: 'robot', title: 'AI Answers', desc: 'Powered by Claude & GPT-4 for accurate, contextual responses', highlight: '99% Accurate' },
    { icon: 'code', title: 'Full Coding Support', desc: 'Solves LeetCode, HackerRank problems with optimal solutions', highlight: 'All Languages' },
    { icon: 'systemDesign', title: 'System Design', desc: 'Architecture diagrams, trade-offs, and scalability analysis', highlight: 'Visual Diagrams' },
    { icon: 'resume', title: 'Resume Upload', desc: 'Upload once, get personalized answers matching your experience', highlight: 'Personalized' },
    { icon: 'target', title: 'Auto Generate', desc: 'Automatically detects questions and generates responses', highlight: 'Hands-free' },
    { icon: 'globe', title: 'Multi-Language', desc: 'Support for 20+ programming languages and frameworks', highlight: '20+ Languages' },
    { icon: 'chartBar', title: 'AI Summary', desc: 'Post-interview analysis with performance insights', highlight: 'Analytics' },
  ];

  const benefits = [
    { icon: 'brain', title: 'Expand Your Knowledge', desc: 'Leverage AI-driven insights to quickly master cutting-edge industry technologies.', color: '#10b981' },
    { icon: 'messageSquare', title: 'Enhance Communication', desc: 'Ascend structures your thoughts, making your expression more confident and persuasive.', color: '#3b82f6' },
    { icon: 'muscle', title: 'Boost Confidence', desc: 'From virtual meetings to in-person interviews, navigate every scenario with ease.', color: '#8b5cf6' },
    { icon: 'growth', title: 'Personalized Growth', desc: 'Ascend continuously adapts, offering personalized suggestions for ongoing skill enhancement.', color: '#f59e0b' },
  ];

  const privacyFeatures = [
    { icon: 'eye', title: 'Invisible on Screen Share' },
    { icon: 'target', title: 'Invisible in Dock' },
    { icon: 'clipboard', title: 'Invisible in Task Manager' },
    { icon: 'keyboard', title: 'Tab Switch Safe' },
    { icon: 'mouse', title: 'Cursor Undetectable' },
  ];

  const platforms = [
    { name: 'Zoom', icon: 'video' },
    { name: 'Google Meet', icon: 'camera' },
    { name: 'Teams', icon: 'briefcase' },
    { name: 'HackerRank', icon: 'terminal' },
    { name: 'LeetCode', icon: 'puzzle' },
    { name: 'CoderPad', icon: 'notes' },
  ];

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
            const duration = 2000;
            const steps = 60;
            const targets = { success: 300, offers: 17000, salary: 30 };
            let step = 0;
            const interval = setInterval(() => {
              step++;
              const progress = step / steps;
              const eased = 1 - Math.pow(1 - progress, 3);
              setCounters({
                success: Math.round(targets.success * eased),
                offers: Math.round(targets.offers * eased),
                salary: Math.round(targets.salary * eased),
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

  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Uber'];

  return (
    <div className="min-h-screen relative" style={{ background: '#030712', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', top: '-200px', left: '-100px' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', bottom: '0', right: '-100px' }} />
      </div>

      {/* Main Container - 75% width, centered */}
      <div className="relative z-10 mx-auto" style={{ width: '75%', maxWidth: '1400px', minWidth: '320px' }}>

        {/* Navigation */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Icon name="ascend" size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Ascend</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Features</button>
            <button onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Reviews</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Pricing</button>
            <button onClick={() => handleOAuthLogin('google')} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Icon name="sparkles" size={16} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">AI-Powered Interview Assistant</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                <span className="text-white">Ace Every</span>
                <br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)' }}>Technical Interview</span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Real-time AI assistance for coding, system design, and behavioral interviews.
                <span className="text-white font-medium"> 100% invisible. 100% effective.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button onClick={() => handleOAuthLogin('google')} disabled={loading !== null} className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 hover:scale-105" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="loader" size={20} className="animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Try Free
                      <Icon name="arrowRight" size={20} />
                    </span>
                  )}
                </button>
                <button className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-white/10" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                  <span className="flex items-center gap-2">
                    <Icon name="play" size={20} />
                    Watch Demo
                  </span>
                </button>
              </div>

              <p className="text-gray-500 text-sm">No credit card required</p>
            </div>

            {/* Right Content - Demo */}
            <div className="w-full lg:w-1/2">
              <div className="flex gap-2 mb-4 justify-center">
                {[
                  { id: 0, label: 'Coding', icon: 'code', color: '#10b981' },
                  { id: 1, label: 'System Design', icon: 'systemDesign', color: '#3b82f6' },
                  { id: 2, label: 'Behavioral', icon: 'behavioral', color: '#8b5cf6' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDemo(tab.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeDemo === tab.id ? `${tab.color}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${activeDemo === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`,
                      color: activeDemo === tab.id ? tab.color : '#9ca3af'
                    }}
                  >
                    <Icon name={tab.icon} size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${activeDemo === 0 ? 'rgba(16, 185, 129, 0.3)' : activeDemo === 1 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}` }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {activeDemo === 0 ? `solution.${codeSnippets[codeIndex].lang}` : activeDemo === 1 ? 'system_design.md' : 'behavioral.md'}
                    </span>
                  </div>
                </div>

                {activeDemo === 0 && (
                  <div className="p-6">
                    <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm">
                      <div className="text-gray-500 mb-2 text-xs">// AI solving in real-time...</div>
                      <pre className="text-green-400 leading-relaxed whitespace-pre-wrap">{codeSnippets[codeIndex].code}</pre>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', animation: 'progress 4s linear infinite' }} />
                        </div>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <Icon name="check" size={12} /> Solved
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemo === 1 && (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="layers" size={24} className="text-blue-400" />
                      <div>
                        <div className="text-blue-400 font-semibold">{systemDesigns[designIndex].title}</div>
                        <div className="text-gray-500 text-xs">{systemDesigns[designIndex].subtitle}</div>
                      </div>
                    </div>
                    {/* Architecture Diagram */}
                    <div className="relative h-48 rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      {/* Grid Background */}
                      <svg className="absolute inset-0 w-full h-full opacity-10">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>

                      {/* Connection Lines */}
                      <svg className="absolute inset-0 w-full h-full">
                        {systemDesigns[designIndex].connections.map((conn, i) => {
                          const fromNode = systemDesigns[designIndex].nodes.find(n => n.id === conn.from);
                          const toNode = systemDesigns[designIndex].nodes.find(n => n.id === conn.to);
                          if (!fromNode || !toNode) return null;
                          return (
                            <g key={i}>
                              <line
                                x1={`${fromNode.x + 5}%`}
                                y1={`${fromNode.y}%`}
                                x2={`${toNode.x - 5}%`}
                                y2={`${toNode.y}%`}
                                stroke="rgba(59, 130, 246, 0.4)"
                                strokeWidth="2"
                                strokeDasharray="4,4"
                              />
                              {/* Animated data packet */}
                              <circle r="3" fill="#3b82f6">
                                <animateMotion
                                  dur={`${1.5 + i * 0.3}s`}
                                  repeatCount="indefinite"
                                  path={`M${fromNode.x + 5},${fromNode.y * 1.92} L${toNode.x - 5},${toNode.y * 1.92}`}
                                />
                              </circle>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Nodes */}
                      {systemDesigns[designIndex].nodes.map((node) => (
                        <div
                          key={node.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-500"
                          style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ background: `${node.color}20`, border: `1px solid ${node.color}`, boxShadow: `0 0 15px ${node.color}40` }}
                          >
                            <Icon name={node.icon} size={18} style={{ color: node.color }} />
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{node.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {['Latency', 'Throughput', 'Availability', 'Scale'].map((metric, i) => (
                        <div key={metric} className="p-2 rounded-lg text-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                          <div className="text-xs text-gray-500">{metric}</div>
                          <div className="text-blue-400 font-semibold text-xs">{['<50ms', '10K/s', '99.99%', 'Auto'][i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDemo === 2 && (
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Icon name="question" size={16} className="text-purple-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Interviewer</span>
                      </div>
                      <p className="text-white font-medium pl-10">"{interviewQA[interviewIndex].q}"</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Icon name="answer" size={16} className="text-green-400" />
                        </div>
                        <span className="text-gray-400 text-sm">STAR Response</span>
                      </div>
                      <p className="text-purple-300 pl-10">"{interviewQA[interviewIndex].a}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trusted Companies */}
        <div className="py-12 border-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <p className="text-center text-gray-500 text-sm mb-8">Trusted by engineers at</p>
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap">
            {companies.map((company, i) => (
              <span key={i} className="text-gray-500 font-semibold text-lg hover:text-white transition-colors cursor-default">{company}</span>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: `${counters.success}%+`, label: 'Higher Success Rate', desc: 'Interview pass rate exceeds 60%', color: '#10b981' },
              { value: `${counters.offers.toLocaleString()}+`, label: 'Offers Received', desc: 'From 5,000+ companies worldwide', color: '#3b82f6' },
              { value: `${counters.salary}%+`, label: 'Salary Increase', desc: 'Surpassing the 10-20% average', color: '#8b5cf6' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-2xl transition-all hover:scale-105" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}30` }}>
                <div className="text-5xl font-black mb-2 tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xl font-bold text-white mb-2">{stat.label}</div>
                <p className="text-gray-400 text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Compatibility */}
        <div className="py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Icon name="trophy" size={16} className="text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">#1 Interview Assistant</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Works with any platform</h2>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {platforms.map((platform, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Icon name={platform.icon} size={20} className="text-gray-400" />
                <span className="text-white font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything to <span className="text-green-400">Ace Your Interview</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">From coding challenges to behavioral questions, we've got you covered.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl transition-all hover:scale-105 cursor-pointer" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <Icon name={feature.icon} size={24} className="text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.desc}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">{feature.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why <span className="text-green-400">Ascend</span>?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="group p-8 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: `${benefit.color}15` }}>
                    <Icon name={benefit.icon} size={28} style={{ color: benefit.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              People love <span className="text-green-400">Ascend</span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              {[...Array(5)].map((_, i) => <Icon key={i} name="star5" size={20} />)}
              <span className="text-white font-bold ml-2">4.9</span>
              <span className="text-gray-500 ml-2">• 10,000+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `hsl(${i * 60 + 120}, 60%, 40%)` }}>
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{review.name}</div>
                    <div className="text-green-400 text-sm">{review.title}</div>
                  </div>
                </div>
                <p className="text-gray-300">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Section */}
        <div className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">100% Private & Undetectable</h2>
            <p className="text-gray-400">Your interview assistant stays completely hidden.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {privacyFeatures.map((feature, i) => (
              <div key={i} className="p-4 rounded-xl text-center" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div className="flex justify-center mb-2">
                  <Icon name={feature.icon} size={28} className="text-green-400" />
                </div>
                <div className="text-white font-medium text-sm">{feature.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your <span className="text-green-400">Plan</span></h2>
            <p className="text-gray-400">Cloud credits or Desktop lifetime - pick what works for you</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Monthly */}
            <div className="p-6 rounded-2xl transition-all hover:scale-105" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="cloud" size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Monthly</h3>
              <p className="text-gray-500 text-xs mb-3">Cloud Interview Assistant</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">$99</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {['5 credits included', '25 coding problems', '10 system designs'].map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <Icon name="check" size={14} className="text-green-400" />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePricingClick('monthly')} className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/20" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                {loading === 'monthly' ? 'Processing...' : 'Get Started'}
              </button>
            </div>

            {/* Quarterly Pro */}
            <div className="relative p-6 rounded-2xl scale-105" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', border: '2px solid #10b981' }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#10b981', color: '#fff' }}>BEST VALUE</div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="rocket" size={24} className="text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Quarterly Pro</h3>
              <p className="text-gray-500 text-xs mb-3">Interview + Job Discovery</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">$300</span>
                <span className="text-gray-500 text-sm">/quarter</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {['10 credits included', '50 coding problems', 'Job Discovery access'].map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <Icon name="check" size={14} className="text-green-400" />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePricingClick('quarterly_pro')} className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
                {loading === 'quarterly_pro' ? 'Processing...' : 'Get Pro Access'}
              </button>
            </div>

            {/* Desktop Lifetime */}
            <div className="relative p-6 rounded-2xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#8b5cf6', color: '#fff' }}>LIFETIME</div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="terminal" size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Desktop App</h3>
              <p className="text-gray-500 text-xs mb-3">Own Keys • Mac & Windows</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">$300</span>
                <span className="text-gray-500 text-sm">one-time</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {['Unlimited usage forever', 'Use your own API keys', 'All features included'].map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <Icon name="check" size={14} className="text-purple-400" />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePricingClick('desktop_lifetime')} className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>
                {loading === 'desktop_lifetime' ? 'Processing...' : 'Buy Lifetime'}
              </button>
            </div>

            {/* Credit Pack */}
            <div className="p-6 rounded-2xl transition-all hover:scale-105" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="ticket" size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Credit Pack</h3>
              <p className="text-gray-500 text-xs mb-3">Top up anytime</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">$30</span>
                <span className="text-gray-500 text-sm">one-time</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {['3 credits', '15 coding problems', 'No expiration'].map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <Icon name="check" size={14} className="text-green-400" />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePricingClick('addon')} className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/20" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                {loading === 'addon' ? 'Processing...' : 'Buy Credits'}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">30-Day Money Back Guarantee on all plans</p>
        </div>

        {/* FAQ Section */}
        <div className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">FAQ</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <Icon name="question" size={16} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <div className="max-w-md mx-auto p-8 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Get Started Free</h2>
              <p className="text-gray-400">No credit card required</p>
            </div>

            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleOAuthLogin(provider.id)}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 hover:bg-white/10"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                >
                  {loading === provider.id ? (
                    <Icon name="loader" size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Icon name={provider.id} size={20} />
                      Continue with {provider.name}
                    </>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-gray-500">
              By signing up, you agree to our <a href="/terms" className="text-gray-400 hover:text-white">Terms</a> and <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="ascend" size={24} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">Ascend</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms</a>
              <a href="mailto:support@ascend.ai" className="text-gray-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-600 text-sm">© 2025 Ascend. All Rights Reserved.</div>
        </footer>
      </div>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes progress {
          0% { width: 0%; }
          90% { width: 100%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
