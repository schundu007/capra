import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Auth Callback Component - Handles OAuth redirect and shows errors
 * Tokens are parsed in AuthContext, this component just displays status
 */
export default function AuthCallback() {
  const { isAuthenticated, loading } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for error in URL hash (from cariara OAuth)
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorType = params.get('error');
      const errorMessage = params.get('message');
      setError(errorMessage || errorType || 'Authentication failed');
    }
  }, []);

  // If authenticated, redirect to main app (or saved redirect from pre-login navigation)
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const savedRedirect = sessionStorage.getItem('postLoginRedirect');
      if (savedRedirect) {
        sessionStorage.removeItem('postLoginRedirect');
        window.location.href = savedRedirect;
      } else {
        window.location.href = '/app';
      }
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffffff' }}>
        <div
          className="w-full max-w-sm p-8 rounded-lg text-center"
          style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
        >
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Signing you in...</h2>
          <p className="text-gray-500">Please wait while we complete the authentication.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffffff' }}>
        <div
          className="w-full max-w-sm p-8 rounded-lg text-center"
          style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
        >
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ background: '#10b981', color: '#ffffff' }}
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffffff' }}>
        <div
          className="w-full max-w-sm p-8 rounded-lg text-center"
          style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
        >
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated and no error - just show login
  return null;
}
