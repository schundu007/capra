import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * OAuth Login Component - Light Theme Design
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#f5f5f5' }}
    >
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div
          className="p-10 rounded-2xl"
          style={{
            background: '#ffffff',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e5e5'
          }}
        >
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
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
            <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>
              Welcome to Ascend
            </h1>
          </div>

          {/* Feature Pills */}
          <div className="flex justify-center gap-2 mb-8">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #dcfce7' }}
            >
              Coding
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #dcfce7' }}
            >
              System Design
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #dcfce7' }}
            >
              Behavioral
            </span>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOAuthLogin(provider.id)}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  border: '1px solid #e5e5e5',
                }}
                onMouseEnter={(e) => {
                  if (loading === null) {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.borderColor = '#10b981';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e5e5';
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
              className="mt-6 p-4 rounded-lg flex items-start gap-3"
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

          {/* Terms */}
          <p className="mt-8 text-center text-sm" style={{ color: '#666666' }}>
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline" style={{ color: '#10b981' }}>
              Terms
            </a>
            {' '}and{' '}
            <a href="/privacy" className="underline" style={{ color: '#10b981' }}>
              Privacy Policy
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
