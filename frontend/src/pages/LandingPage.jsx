import { useAuth } from '../contexts/AuthContext';
import OAuthLogin from '../components/auth/OAuthLogin';
import LoadingScreen from '../components/shared/LoadingScreen';

export default function LandingPage() {
  const { loading } = useAuth();

  // Wait for auth to initialize before deciding what to show
  if (loading) return <LoadingScreen />;

  // Show landing page for everyone — OAuthLogin already handles
  // different CTAs for logged-in vs not (e.g., "Open App" button)
  return <OAuthLogin />;
}
