import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * World-Class Landing Page - Dark Theme with Animated Elements
 */
export default function OAuthLogin() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);

  // Animated code snippets
  const codeSnippets = [
    { lang: 'python', code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i' },
    { lang: 'javascript', code: 'function maxProfit(prices) {\n  let min = prices[0], max = 0;\n  for (let p of prices) {\n    min = Math.min(min, p);\n    max = Math.max(max, p - min);\n  }\n  return max;\n}' },
    { lang: 'sql', code: 'SELECT d.name, COUNT(e.id)\nFROM departments d\nLEFT JOIN employees e\n  ON d.id = e.dept_id\nGROUP BY d.id\nHAVING COUNT(e.id) > 5;' },
  ];

  // Rotate code snippets
  useEffect(() => {
    const interval = setInterval(() => {
      setCodeIndex((prev) => (prev + 1) % codeSnippets.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
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
    { id: 'google', name: 'Google', color: '#fff' },
    { id: 'github', name: 'GitHub', color: '#fff' },
    { id: 'linkedin', name: 'LinkedIn', color: '#fff' },
  ];

  const features = [
    { emoji: '💻', title: 'Live Coding', desc: 'Real-time solutions with edge cases & complexity analysis', stat: '10x faster' },
    { emoji: '🏗️', title: 'System Design', desc: 'Architecture diagrams, trade-offs, API design', stat: '95% success' },
    { emoji: '🎯', title: 'Behavioral Prep', desc: 'STAR method responses for any scenario', stat: 'AI-crafted' },
    { emoji: '🏢', title: 'Company Intel', desc: 'Culture, values, interview patterns decoded', stat: '500+ companies' },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Uber', 'Airbnb', 'LinkedIn'];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#030712' }}>
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            bottom: '-10%',
            right: '-5%',
            animation: 'float 15s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            top: '40%',
            right: '20%',
            animation: 'float 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Ascend</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a>
            <button
              onClick={() => handleOAuthLogin('google')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
              }}
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center px-6 lg:px-12 py-8 lg:py-0">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left mb-12 lg:mb-0">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400 text-sm font-medium">AI-Powered Interview Assistant</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1]">
              <span className="text-white">Stop Failing</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                }}
              >
                Tech Interviews
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Your invisible co-pilot for coding rounds, system design, and behavioral interviews.
              <span className="text-white font-medium"> Join 10,000+ engineers</span> who landed offers at FAANG.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading !== null}
                className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
                  color: '#fff',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      Start Free Trial
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
              <button
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                }}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              {[
                { value: '10,000+', label: 'Engineers Helped' },
                { value: '95%', label: 'Success Rate' },
                { value: '$180k', label: 'Avg. Offer' },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Interactive Demo */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Main Card */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Window Header */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-500 font-mono">ascend_interview.{codeSnippets[codeIndex].lang}</span>
                  </div>
                </div>

                {/* Code Display */}
                <div className="p-6 font-mono text-sm">
                  <div className="text-gray-500 mb-2 text-xs">// AI solving in real-time...</div>
                  <pre className="text-green-400 leading-relaxed whitespace-pre-wrap">
                    {codeSnippets[codeIndex].code}
                  </pre>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: '100%',
                          background: 'linear-gradient(90deg, #10b981, #34d399)',
                          animation: 'progress 4s linear infinite',
                        }}
                      />
                    </div>
                    <span className="text-xs text-green-400">Solved ✓</span>
                  </div>
                </div>

                {/* Analysis Panel */}
                <div
                  className="px-6 py-4"
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderTop: '1px solid rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Time</div>
                      <div className="text-green-400 font-semibold">O(n)</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Space</div>
                      <div className="text-green-400 font-semibold">O(n)</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Edge Cases</div>
                      <div className="text-green-400 font-semibold">5/5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards */}
              <div
                className="absolute -left-16 top-1/4 p-4 rounded-xl hidden lg:block"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  animation: 'floatSide 6s ease-in-out infinite',
                }}
              >
                <div className="text-2xl mb-1">🏗️</div>
                <div className="text-xs text-blue-400 font-medium">System Design</div>
              </div>

              <div
                className="absolute -right-12 bottom-1/4 p-4 rounded-xl hidden lg:block"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  animation: 'floatSide 5s ease-in-out infinite reverse',
                }}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-purple-400 font-medium">Behavioral</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Strip */}
        <div
          className="py-6 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex animate-marquee whitespace-nowrap">
            {[...features, ...features].map((feature, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-3 mx-8 px-5 py-3 rounded-full"
                style={{
                  background: activeFeature === (i % 4) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: `1px solid ${activeFeature === (i % 4) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                }}
              >
                <span className="text-xl">{feature.emoji}</span>
                <span className="text-white font-medium">{feature.title}</span>
                <span className="text-gray-500">•</span>
                <span className="text-green-400 text-sm">{feature.stat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="py-12 px-6 lg:px-12">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm mb-4">Trusted by engineers who landed offers at</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {companies.map((company, i) => (
                <span
                  key={i}
                  className="text-gray-600 font-semibold text-lg hover:text-white transition-colors cursor-default"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="py-16 px-6 lg:px-12" id="signup">
          <div
            className="max-w-md mx-auto p-8 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Start Your Free Trial</h2>
              <p className="text-gray-400">No credit card required. Cancel anytime.</p>
            </div>

            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleOAuthLogin(provider.id)}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {loading === provider.id ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      {provider.id === 'google' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {provider.id === 'github' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                      {provider.id === 'linkedin' && (
                        <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )}
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
              By signing up, you agree to our{' '}
              <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
              {' '}and{' '}
              <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-6 lg:px-12 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-gray-500 text-sm">© 2024 Ascend. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
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
        @keyframes floatSide {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes progress {
          0% { width: 0%; }
          90% { width: 100%; }
          100% { width: 100%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
