import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * World-Class Landing Page - Inspired by ParakeetAI
 */
export default function OAuthLogin() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeDemo, setActiveDemo] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [designIndex, setDesignIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Animated code snippets
  const codeSnippets = [
    { lang: 'python', code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i' },
    { lang: 'javascript', code: 'function maxProfit(prices) {\n  let min = prices[0], max = 0;\n  for (let p of prices) {\n    min = Math.min(min, p);\n    max = Math.max(max, p - min);\n  }\n  return max;\n}' },
    { lang: 'sql', code: 'SELECT d.name, COUNT(e.id)\nFROM departments d\nLEFT JOIN employees e\n  ON d.id = e.dept_id\nGROUP BY d.id\nHAVING COUNT(e.id) > 5;' },
  ];

  // System Design components
  const systemDesigns = [
    { title: 'URL Shortener', components: ['Load Balancer', 'API Gateway', 'Redis Cache', 'PostgreSQL', 'CDN'] },
    { title: 'Chat System', components: ['WebSocket Server', 'Message Queue', 'MongoDB', 'Redis PubSub', 'S3 Storage'] },
    { title: 'E-commerce', components: ['Microservices', 'Kafka', 'Elasticsearch', 'Payment Gateway', 'CDN'] },
  ];

  // Interview Q&A
  const interviewQA = [
    { q: 'Tell me about a challenging project', a: 'Led migration of monolith to microservices, reducing deploy time by 80%...' },
    { q: 'How do you handle conflict?', a: 'I focus on understanding perspectives first. In one case, I mediated...' },
    { q: 'Why do you want this role?', a: 'Your focus on developer experience aligns with my passion...' },
  ];

  // User reviews
  const reviews = [
    { name: 'Sarah M.', email: 'sarah.m...@gmail.com', text: 'Absolutely incredible! Got offers from 3 FAANG companies. The coding assistance was flawless.', date: 'Feb 2025', rating: 5 },
    { name: 'James K.', email: 'james.k...@outlook.com', text: 'The system design help alone is worth it. Helped me nail my Amazon interview.', date: 'Jan 2025', rating: 5 },
    { name: 'Priya R.', email: 'priya.r...@gmail.com', text: 'Game changer for behavioral interviews. The STAR method responses were perfect.', date: 'Feb 2025', rating: 5 },
    { name: 'Michael C.', email: 'michael.c...@yahoo.com', text: 'Used it for my Google interview. The real-time coding solutions saved me multiple times.', date: 'Jan 2025', rating: 5 },
  ];

  // Supported platforms
  const platforms = [
    { name: 'Zoom', icon: '📹' },
    { name: 'Google Meet', icon: '🎥' },
    { name: 'Microsoft Teams', icon: '💼' },
    { name: 'HackerRank', icon: '💻' },
    { name: 'LeetCode', icon: '🧩' },
    { name: 'CoderPad', icon: '📝' },
    { name: 'Amazon Chime', icon: '🔔' },
    { name: 'Webex', icon: '🌐' },
  ];

  // Privacy features
  const privacyFeatures = [
    { icon: '👁️', title: 'Invisible on Screen Share', desc: 'Completely hidden during screen sharing' },
    { icon: '🎯', title: 'Invisible in Dock', desc: 'No visible icon in your taskbar or dock' },
    { icon: '📋', title: 'Invisible in Task Manager', desc: 'Hidden from system process lists' },
    { icon: '⌨️', title: 'Tab Switch Safe', desc: 'No detection when switching windows' },
    { icon: '🖱️', title: 'Cursor Undetectable', desc: 'Mouse movements remain private' },
  ];

  // Platform verification
  const platformVerification = [
    { name: 'Zoom', status: 'Undetectable', checked: '2h ago' },
    { name: 'Microsoft Teams', status: 'Undetectable', checked: '2h ago' },
    { name: 'Google Meet', status: 'Undetectable', checked: '2h ago' },
    { name: 'HackerRank', status: 'Undetectable', checked: '4h ago' },
    { name: 'LeetCode', status: 'Undetectable', checked: '4h ago' },
    { name: 'CoderPad', status: 'Undetectable', checked: '6h ago' },
  ];

  // Effects for animations
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
    const interval = setInterval(() => setReviewIndex((prev) => (prev + 1) % reviews.length), 5000);
    return () => clearInterval(interval);
  }, []);

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

  const providers = [
    { id: 'google', name: 'Google' },
    { id: 'github', name: 'GitHub' },
    { id: 'linkedin', name: 'LinkedIn' },
  ];

  const features = [
    { emoji: '🎙️', title: 'Speech Recognition', desc: 'Blazing fast transcription with state-of-the-art AI models', highlight: 'Real-time' },
    { emoji: '🤖', title: 'AI Answers', desc: 'Powered by Claude & GPT-4 for accurate, contextual responses', highlight: '99% Accurate' },
    { emoji: '💻', title: 'Full Coding Support', desc: 'Solves LeetCode, HackerRank problems with optimal solutions', highlight: 'All Languages' },
    { emoji: '🏗️', title: 'System Design', desc: 'Architecture diagrams, trade-offs, and scalability analysis', highlight: 'Visual Diagrams' },
    { emoji: '📄', title: 'Resume Upload', desc: 'Upload once, get personalized answers matching your experience', highlight: 'Personalized' },
    { emoji: '🎯', title: 'Auto Generate', desc: 'Automatically detects questions and generates responses', highlight: 'Hands-free' },
    { emoji: '🌍', title: 'Multi-Language', desc: 'Support for 20+ programming languages and frameworks', highlight: '20+ Languages' },
    { emoji: '📊', title: 'AI Summary', desc: 'Post-interview analysis with performance insights', highlight: 'Analytics' },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Uber', 'Airbnb', 'LinkedIn'];

  return (
    <div className="min-h-screen relative overflow-hidden scroll-smooth" style={{ background: '#030712' }}>
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', top: '-20%', left: '-10%', animation: 'float 20s ease-in-out infinite' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', bottom: '-10%', right: '-5%', animation: 'float 15s ease-in-out infinite reverse' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', top: '40%', right: '20%', animation: 'float 18s ease-in-out infinite' }} />
      </div>

      {/* Star Field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: Math.random() > 0.7 ? '3px' : '2px', height: Math.random() > 0.7 ? '3px' : '2px', background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.4})`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`, animationDelay: `${Math.random() * 2}s` }} />
        ))}
      </div>

      {/* Plus Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
              <img src="/ascend-logo.png" alt="Ascend" className="w-7 h-7 object-contain filter brightness-0 invert" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <span className="text-xl font-bold text-white">Ascend</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm">Features</button>
            <button onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm">Reviews</button>
            <button onClick={() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</button>
            <button onClick={() => handleOAuthLogin('google')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }}>Sign In</button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="px-6 lg:px-12 py-12 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span className="text-2xl">💻</span>
                  <span className="text-green-400 text-sm font-medium">Full Coding Interview Support</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1]">
                  <span className="text-white">Your Real-Time AI</span>
                  <br />
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)' }}>Interview Assistant</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                  Automatically get answers to every interview question with AI. Real-time coding solutions, system design help, and behavioral prep.
                  <span className="text-white font-medium"> 100% Private.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <button onClick={() => handleOAuthLogin('google')} disabled={loading !== null} className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)', color: '#fff' }}>
                    <span className="flex items-center justify-center gap-2">
                      {loading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <>Try For Free <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
                    </span>
                  </button>
                  <button className="px-8 py-4 rounded-xl font-semibold text-lg transition-all" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Watch Demo
                    </span>
                  </button>
                </div>

                <p className="text-gray-500 text-sm mb-6">No Credit Card Required • Credits, Subscriptions, Lifetime</p>

                {/* Social Proof */}
                <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center text-lg" style={{ background: `hsl(${i * 60 + 120}, 70%, 50%)` }}>
                        {['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                      <span className="text-white font-bold ml-1">4.9</span>
                    </div>
                    <p className="text-gray-500 text-sm">Used by <span className="text-white font-semibold">10,000+</span> engineers</p>
                  </div>
                </div>
              </div>

              {/* Right Content - Demo */}
              <div className="w-full lg:w-1/2">
                <div className="flex gap-2 mb-4 justify-center">
                  {[{ id: 0, label: '💻 Coding', color: '#10b981' }, { id: 1, label: '🏗️ System Design', color: '#3b82f6' }, { id: 2, label: '🎯 Behavioral', color: '#8b5cf6' }].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveDemo(tab.id)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: activeDemo === tab.id ? `${tab.color}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${activeDemo === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`, color: activeDemo === tab.id ? tab.color : '#9ca3af' }}>{tab.label}</button>
                  ))}
                </div>

                <div className="relative rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${activeDemo === 0 ? 'rgba(16, 185, 129, 0.3)' : activeDemo === 1 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                  <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-gray-500 font-mono">{activeDemo === 0 ? `solution.${codeSnippets[codeIndex].lang}` : activeDemo === 1 ? 'system_design.md' : 'behavioral.md'}</span>
                    </div>
                  </div>

                  {activeDemo === 0 && (
                    <div className="p-6">
                      <div className="font-mono text-sm">
                        <div className="text-gray-500 mb-2 text-xs">// AI solving in real-time...</div>
                        <pre className="text-green-400 leading-relaxed whitespace-pre-wrap">{codeSnippets[codeIndex].code}</pre>
                        <div className="mt-4 flex items-center gap-2">
                          <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', animation: 'progress 4s linear infinite' }} />
                          </div>
                          <span className="text-xs text-green-400">Solved ✓</span>
                        </div>
                      </div>
                      <div className="mt-4 px-4 py-3 rounded-lg grid grid-cols-3 gap-4 text-center" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                        <div><div className="text-xs text-gray-500">Time</div><div className="text-green-400 font-semibold">O(n)</div></div>
                        <div><div className="text-xs text-gray-500">Space</div><div className="text-green-400 font-semibold">O(n)</div></div>
                        <div><div className="text-xs text-gray-500">Edge Cases</div><div className="text-green-400 font-semibold">5/5</div></div>
                      </div>
                    </div>
                  )}

                  {activeDemo === 1 && (
                    <div className="p-6">
                      <div className="text-blue-400 font-semibold text-lg mb-4">{systemDesigns[designIndex].title}</div>
                      <div className="space-y-2">
                        {systemDesigns[designIndex].components.map((comp, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', animation: `slideIn 0.5s ease-out ${i * 0.1}s both` }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.2)' }}><span className="text-blue-400 text-xs font-bold">{i + 1}</span></div>
                            <span className="text-white font-medium">{comp}</span>
                            <div className="ml-auto"><div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div></div>
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
                        <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-green-400">A</span></div><span className="text-gray-400 text-sm">STAR Method Response</span></div>
                        <p className="text-purple-300 pl-10">"{interviewQA[interviewIndex].a}"</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {['Situation ✓', 'Task ✓', 'Action ✓', 'Result'].map((tag, i) => (
                          <span key={tag} className="px-2 py-1 rounded text-xs font-medium" style={{ background: i < 3 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)', color: i < 3 ? '#a78bfa' : '#6b7280' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted Companies Marquee */}
        <div className="py-8 border-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <p className="text-center text-gray-500 text-sm mb-6">Used for 100,000+ Interviews at Top Companies</p>
          <div className="flex justify-center gap-8 md:gap-16 flex-wrap px-6">
            {companies.map((company, i) => (
              <span key={i} className="text-gray-500 font-bold text-xl hover:text-white transition-colors">{company}</span>
            ))}
          </div>
        </div>

        {/* Platform Compatibility */}
        <div className="py-16 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <span className="text-blue-400 font-medium">#1 Interview Assistant on the market 🏆</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Works with any interview platform</h2>
            <p className="text-gray-400 text-lg mb-10">Use Ascend with any video or coding platform including Zoom, Google Meet, Microsoft Teams, HackerRank, and LeetCode.</p>

            {/* Platform Icons Marquee */}
            <div className="relative overflow-hidden py-4">
              <div className="flex gap-6 animate-marquee">
                {[...platforms, ...platforms].map((platform, i) => (
                  <div key={i} className="flex-shrink-0 px-6 py-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <span className="text-white font-medium whitespace-nowrap">{platform.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #34d399)' }}>Ace Your Interview</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">From coding challenges to behavioral questions, we've got you covered with AI-powered assistance.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl transition-all hover:scale-105 hover:border-green-500/30" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="text-4xl mb-4">{feature.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{feature.desc}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <span className="text-green-400 text-sm font-medium">{feature.highlight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="py-20 px-6 lg:px-12" style={{ background: 'rgba(16, 185, 129, 0.02)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">People love <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #34d399)' }}>Ascend</span> 💬</h2>
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-xl">{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}<span className="text-white font-bold ml-2">4.9 / 5</span><span className="text-gray-500 ml-2">• 10,000+ reviews</span></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review, i) => (
                <div key={i} className="p-6 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: `hsl(${i * 60 + 120}, 60%, 40%)` }}>{review.name[0]}</div>
                    <div>
                      <div className="text-white font-semibold">{review.name}</div>
                      <div className="text-gray-500 text-sm">{review.email}</div>
                    </div>
                    <div className="ml-auto text-yellow-400">{'★'.repeat(review.rating)}</div>
                  </div>
                  <p className="text-gray-300 mb-3">"{review.text}"</p>
                  <p className="text-gray-500 text-sm">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div id="privacy" className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">100% Private and Undetectable</h2>
              <p className="text-gray-400 text-lg">Your interview assistant stays completely hidden. No one will ever know.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-12">
              {privacyFeatures.map((feature, i) => (
                <div key={i} className="p-4 rounded-xl text-center" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <div className="text-white font-medium text-sm mb-1">{feature.title}</div>
                  <div className="text-gray-500 text-xs">{feature.desc}</div>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-6">Platform Verification Status</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {platformVerification.map((platform, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="text-white font-medium mb-1">{platform.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-green-400 text-sm">{platform.status}</span>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">checked {platform.checked}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-20 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Buy Credits or <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #34d399)' }}>Go Unlimited</span> ✨</h2>
              <p className="text-gray-400 text-lg">Start free. Upgrade when you're ready.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Monthly */}
              <div className="relative p-8 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 className="text-xl font-bold text-white mb-2">Monthly</h3>
                <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold text-white">$99</span><span className="text-gray-500">/month</span></div>
                <ul className="space-y-3 mb-8">
                  {['5 credits', '25 coding problems', '10 system designs', '5 company preps', '2.5 hrs interview'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300"><svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{item}</li>
                  ))}
                </ul>
                <button onClick={() => handleOAuthLogin('google')} className="w-full py-3 rounded-xl font-semibold transition-all" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' }}>Get Started</button>
              </div>

              {/* Quarterly - Popular */}
              <div className="relative p-8 rounded-2xl scale-105" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', border: '2px solid #10b981', boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)' }}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#10b981', color: '#fff' }}>MOST POPULAR</div>
                <h3 className="text-xl font-bold text-white mb-2">Quarterly</h3>
                <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-bold text-white">$200</span><span className="text-gray-500">/quarter</span></div>
                <p className="text-green-400 text-sm mb-6">Save $98 (33% off)</p>
                <ul className="space-y-3 mb-8">
                  {['10 credits', '50 coding problems', '20 system designs', '10 company preps', '5 hrs interview'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300"><svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{item}</li>
                  ))}
                </ul>
                <button onClick={() => handleOAuthLogin('google')} className="w-full py-3 rounded-xl font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>Get Started</button>
              </div>

              {/* Credit Pack */}
              <div className="relative p-8 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 className="text-xl font-bold text-white mb-2">Credit Pack</h3>
                <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold text-white">$30</span><span className="text-gray-500">one-time</span></div>
                <ul className="space-y-3 mb-8">
                  {['3 credits', '15 coding problems', '6 system designs', '3 company preps', '1.5 hrs interview'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300"><svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{item}</li>
                  ))}
                </ul>
                <button onClick={() => handleOAuthLogin('google')} className="w-full py-3 rounded-xl font-semibold transition-all" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' }}>Buy Credits</button>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm mb-4">1 credit = 5 coding + 2 system design + 1 company prep + 30 min interview</p>
              <p className="text-gray-600 text-sm mb-4">30-Day Money Back Guarantee</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-gray-500 text-sm">Accepted:</span>
                {['💳 Visa', '💳 Mastercard', '💳 Amex', '🍎 Apple Pay', '📱 Google Pay'].map((method, i) => (
                  <span key={i} className="text-gray-400 text-sm">{method}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 px-6 lg:px-12">
          <div className="max-w-md mx-auto p-8 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Try For Free</h2>
              <p className="text-gray-400">No credit card required. Start immediately.</p>
            </div>

            <div className="space-y-3">
              {providers.map((provider) => (
                <button key={provider.id} onClick={() => handleOAuthLogin(provider.id)} disabled={loading !== null} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}>
                  {loading === provider.id ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <>
                    {provider.id === 'google' && <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                    {provider.id === 'github' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>}
                    {provider.id === 'linkedin' && <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                    Continue with {provider.name}
                  </>}
                </button>
              ))}
            </div>

            {error && <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}><p className="text-red-400 text-sm text-center">{error}</p></div>}

            <p className="mt-6 text-center text-xs text-gray-500">By signing up, you agree to our <a href="/terms" className="text-gray-400 hover:text-white">Terms</a> and <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></p>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-12 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <img src="/ascend-logo.png" alt="Ascend" className="w-6 h-6 object-contain filter brightness-0 invert" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <span className="text-white font-bold text-lg">Ascend</span>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <a href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms & Conditions</a>
                <a href="mailto:support@ascend.ai" className="text-gray-500 hover:text-white transition-colors">Contact</a>
              </div>

              <div className="flex items-center gap-4">
                {['𝕏', 'in', '▶️', '📷'].map((icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">{icon}</a>
                ))}
              </div>
            </div>
            <div className="text-center mt-8 text-gray-600 text-sm">© 2025 Ascend. All Rights Reserved.</div>
          </div>
        </footer>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes progress {
          0% { width: 0%; }
          90% { width: 100%; }
          100% { width: 100%; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
