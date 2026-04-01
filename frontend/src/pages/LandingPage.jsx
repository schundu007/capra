import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import OAuthLogin from '../components/auth/OAuthLogin';
import LoadingScreen from '../components/shared/LoadingScreen';

export default function LandingPage() {
  const { user, loading } = useAuth();

  // Wait for auth to initialize before deciding what to show
  if (loading) return <LoadingScreen />;

  // Redirect authenticated users to the main app
  if (user) return <Navigate to="/app/coding" replace />;

  return <OAuthLogin />;
}
