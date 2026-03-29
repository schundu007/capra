import OAuthLogin from '../components/auth/OAuthLogin';

// OAuth disabled — show landing page for all users
// When OAuth is re-enabled, restore auth check here
export default function LandingPage() {
  return <OAuthLogin />;
}
