import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * OAuth Login Component - Showcase Landing Page
 */
export default function OAuthLogin() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

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
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: (
        <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
  ];

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: 'Live Coding Solutions',
      description: 'Real-time AI assistance during coding interviews. Solve LeetCode, HackerRank problems instantly.',
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: 'System Design Mastery',
      description: 'Interactive system design with architecture diagrams. Design scalable systems like a senior engineer.',
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Behavioral & HR Prep',
      description: 'Ace hiring manager rounds with AI-crafted responses. STAR method stories tailored for you.',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Company-Specific Prep',
      description: 'Deep research on target companies. Culture, values, and interview patterns at your fingertips.',
      color: '#10b981',
      bg: '#ecfdf5',
    },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    >
      {/* Left Side - Features Showcase */}
      <div className="hidden lg:flex lg:w-3/5 p-12 flex-col justify-center">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: '#10b981' }}
              >
                <img
                  src="/ascend-logo.png"
                  alt="Ascend"
                  className="h-9 w-auto object-contain filter brightness-0 invert"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
                  }}
                />
              </div>
              <span className="text-2xl font-bold" style={{ color: '#000' }}>Ascend</span>
            </div>

            <h1 className="text-5xl font-black mb-4 leading-tight" style={{ color: '#000' }}>
              Crack Your Next
              <br />
              <span style={{ color: '#10b981' }}>Tech Interview</span>
            </h1>

            <p className="text-xl mb-8" style={{ color: '#4b5563' }}>
              Your AI-powered secret weapon for coding rounds, system design,
              and behavioral interviews. Perform better than 95% of candidates.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-10">
              <div>
                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>10x</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>Faster Problem Solving</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>95%</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>500+</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>Offers Landed</div>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: feature.bg, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#000' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-10 p-6 rounded-2xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                JD
              </div>
              <div>
                <p className="text-base mb-3" style={{ color: '#374151' }}>
                  "Used Ascend for my Google L5 interviews. The live coding assistance and system design prep were game-changers. Got the offer with a 20% higher TC than expected!"
                </p>
                <div>
                  <span className="font-semibold" style={{ color: '#000' }}>John D.</span>
                  <span style={{ color: '#6b7280' }}> - Software Engineer at Google</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Hero (hidden on desktop) */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#10b981' }}
              >
                <img
                  src="/ascend-logo.png"
                  alt="Ascend"
                  className="h-10 w-auto object-contain filter brightness-0 invert"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
                  }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-black mb-2" style={{ color: '#000' }}>
              Crack Your Interview
            </h1>
            <p className="text-base" style={{ color: '#6b7280' }}>
              AI-powered interview prep for top tech companies
            </p>
          </div>

          {/* Login Card */}
          <div
            className="p-8 rounded-3xl"
            style={{
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e5e7eb'
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#000' }}>
                Get Started Free
              </h2>
              <p style={{ color: '#6b7280' }}>
                No credit card required. Start cracking interviews today.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleOAuthLogin(provider.id)}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: '2px solid #e5e7eb',
                  }}
                  onMouseEnter={(e) => {
                    if (loading === null) {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {loading === provider.id ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <span className="w-6 h-6 flex items-center justify-center">
                      {provider.icon}
                    </span>
                  )}
                  <span>Continue with {provider.name}</span>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mt-6 p-4 rounded-xl flex items-start gap-3"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca'
                }}
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid #e5e7eb' }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs" style={{ color: '#6b7280' }}>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs" style={{ color: '#6b7280' }}>Private</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs" style={{ color: '#6b7280' }}>Fast</span>
                </div>
              </div>
              <p className="text-center text-xs" style={{ color: '#9ca3af' }}>
                By signing in, you agree to our{' '}
                <a href="/terms" className="underline hover:text-gray-600">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Mobile Features Preview */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
            {features.slice(0, 2).map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-xl"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: feature.bg, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: '#000' }}>
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
