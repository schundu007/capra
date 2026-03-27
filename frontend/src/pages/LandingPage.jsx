import { useAuth } from '../contexts/AuthContext';
import { isElectron } from '../constants';
import OAuthLogin from '../components/auth/OAuthLogin';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Authenticated users on webapp go to /app
  if (!isElectron && isAuthenticated) {
    window.location.href = '/app/coding';
    return null;
  }

  return <OAuthLogin />;
}
