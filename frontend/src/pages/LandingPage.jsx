import { useAuth } from '../contexts/AuthContext';
import { isElectron } from '../constants';
import OAuthLogin from '../components/auth/OAuthLogin';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  // While auth is loading (e.g. parsing OAuth hash callback), show nothing
  // This prevents flashing the landing page before the redirect fires
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Authenticated users on webapp go to /app
  if (!isElectron && isAuthenticated) {
    window.location.href = '/app/coding';
    return null;
  }

  return <OAuthLogin />;
}
