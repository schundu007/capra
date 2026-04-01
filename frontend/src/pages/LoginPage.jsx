import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import LoadingScreen from '../components/shared/LoadingScreen';

export default function LoginPage() {
  const { signIn, user, loading, authError } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/prepare" replace />;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 landing-root"
      style={{
        background: 'linear-gradient(180deg, #fdf2f8 0%, #ede9fe 50%, #e0e7ff 100%)',
      }}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Logo + Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
            <Icon name="ascend" size={24} className="text-white" />
          </div>
          <div className="text-center">
            <span className="landing-display font-bold text-xl tracking-tight text-gray-900 block">
              Ascend
            </span>
            <span className="landing-mono text-[10px] uppercase tracking-[0.2em] text-emerald-500">
              Interview AI
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="landing-display font-bold text-xl text-gray-900 mb-1.5">
            Welcome back
          </h1>
          <p className="landing-body text-sm text-gray-500 leading-relaxed">
            Sign in to access 300+ interview prep topics
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-6" />

        {/* Error Banner */}
        {authError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 landing-body">
            <span className="font-semibold">Sign in failed:</span> {authError}. Please try again.
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {/* Official Google "G" logo (colored) */}
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335" />
          </svg>
          <span className="landing-body text-sm font-medium text-gray-700">
            Continue with Google
          </span>
        </button>

        {/* Terms */}
        <p className="mt-5 text-center text-xs text-gray-400 landing-body leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-gray-500 hover:text-gray-700 underline underline-offset-2">
            Terms of Service
          </a>
        </p>
      </div>

      {/* Back to home link */}
      <a
        href="/"
        className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors landing-body flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to home
      </a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');

        .landing-root {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-family: 'Work Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .landing-display {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .landing-body {
          font-family: 'Work Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .landing-mono {
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>
    </div>
  );
}
