import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Compact OAuth Login Page
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
    { id: 'google', name: 'Google', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )},
    { id: 'github', name: 'GitHub', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    )},
    { id: 'linkedin', name: 'LinkedIn', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', top: '-20%', left: '-10%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', bottom: '-10%', right: '-5%' }} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <img src="/ascend-logo.png" alt="Ascend" className="w-9 h-9 object-contain filter brightness-0 invert" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="color:white;font-size:24px;font-weight:bold">A</span>'; }} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Ascend</h1>
            <p className="text-gray-400 text-sm">AI Interview Assistant</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOAuthLogin(provider.id)}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                }}
              >
                {loading === provider.id ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  provider.icon
                )}
                <span>Continue with {provider.name}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-gray-500 text-xs">
            By continuing, you agree to our Terms of Service
          </p>
        </div>

        {/* Desktop App Link */}
        <div className="mt-6 text-center">
          <a
            href="https://github.com/anthropics/claude-code/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Desktop App
          </a>
        </div>
      </div>
    </div>
  );
}
