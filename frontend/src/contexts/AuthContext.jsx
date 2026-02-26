import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../hooks/useElectron.js';

const AuthContext = createContext(null);

const API_URL = getApiUrl();
const CARIARA_OAUTH_URL = 'https://cariara-backend.up.railway.app';
const STORAGE_KEY = 'ascend_auth';

/**
 * Get stored auth from localStorage
 */
function getStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored auth:', e);
  }
  return null;
}

/**
 * Store auth in localStorage
 */
function storeAuth(auth) {
  if (auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Parse auth tokens from URL hash (cariara OAuth redirect)
 */
function parseAuthFromHash() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) {
    return null;
  }

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const userId = params.get('user_id');
  const userEmail = params.get('user_email');
  const userName = params.get('user_name');
  const userRole = params.get('user_role');

  if (accessToken && userId) {
    return {
      accessToken,
      refreshToken,
      user: {
        id: parseInt(userId, 10),
        email: userEmail ? decodeURIComponent(userEmail) : null,
        name: userName ? decodeURIComponent(userName) : null,
        role: userRole || 'user',
      },
    };
  }

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);

  // Check if webapp auth is enabled (not in Electron)
  const isWebApp = !window.electronAPI?.isElectron;

  // Initialize auth state
  useEffect(() => {
    if (!isWebApp) {
      // Electron - skip webapp auth
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        // First check URL hash for OAuth callback tokens
        const hashAuth = parseAuthFromHash();
        if (hashAuth) {
          // Clear the hash from URL immediately
          window.history.replaceState(null, '', window.location.pathname);

          // Check for pending plan purchase BEFORE setting user state
          // This prevents the app from showing the main page briefly
          const pendingPlan = localStorage.getItem('ascend_pending_plan');
          if (pendingPlan) {
            localStorage.removeItem('ascend_pending_plan');
            // Redirect to Stripe checkout immediately
            try {
              const pricesRes = await fetch(`${API_URL}/api/billing/prices`);
              const prices = await pricesRes.json();

              // Map plan ID to price ID
              const priceMap = {
                monthly: prices.monthly?.priceId,
                quarterly_pro: prices.quarterly_pro?.priceId,
                desktop_lifetime: prices.desktop_lifetime?.priceId,
                addon: prices.addon?.priceId,
              };

              const priceId = priceMap[pendingPlan];
              if (priceId) {
                const checkoutRes = await fetch(`${API_URL}/api/billing/checkout`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${hashAuth.accessToken}`,
                  },
                  body: JSON.stringify({
                    priceId,
                    successUrl: `${window.location.origin}?checkout=success`,
                    cancelUrl: `${window.location.origin}?checkout=canceled`,
                  }),
                });

                if (checkoutRes.ok) {
                  const { url } = await checkoutRes.json();
                  // Store auth before redirecting so user is logged in when they return
                  storeAuth(hashAuth);
                  window.location.href = url;
                  return; // Don't set loading to false, we're redirecting
                }
              }
            } catch (error) {
              console.error('Failed to create checkout session:', error);
            }
          }

          // No pending plan or checkout failed - proceed with normal login
          storeAuth(hashAuth);
          setUser(hashAuth.user);
          setAccessToken(hashAuth.accessToken);
          setRefreshToken(hashAuth.refreshToken);

          // Fetch user data
          await fetchUserData(hashAuth.accessToken);

          setLoading(false);
          return;
        }

        // Otherwise check localStorage for existing session
        const storedAuth = getStoredAuth();
        if (storedAuth?.accessToken) {
          setUser(storedAuth.user);
          setAccessToken(storedAuth.accessToken);
          setRefreshToken(storedAuth.refreshToken);

          // Fetch user data (also validates token)
          await fetchUserData(storedAuth.accessToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth
        storeAuth(null);
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isWebApp]);

  // Fetch user's credits and subscription
  const fetchUserData = useCallback(async (token) => {
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch credits
      const creditsRes = await fetch(`${API_URL}/api/credits`, { headers });
      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setCredits(creditsData);
      } else if (creditsRes.status === 401) {
        // Token expired, clear auth
        throw new Error('Token expired');
      }

      // Fetch subscription
      const subRes = await fetch(`${API_URL}/api/billing/subscription`, { headers });
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription);
      }

      // Fetch usage
      const usageRes = await fetch(`${API_URL}/api/usage`, { headers });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData.usage);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      if (error.message === 'Token expired') {
        storeAuth(null);
        setUser(null);
        setAccessToken(null);
      }
    }
  }, []);

  // Refresh user data (after purchase, etc.)
  const refreshUserData = useCallback(async () => {
    if (accessToken) {
      await fetchUserData(accessToken);
    }
  }, [accessToken, fetchUserData]);

  // Get access token
  const getAccessToken = useCallback(() => {
    return accessToken;
  }, [accessToken]);

  // Sign in with OAuth (redirect to cariara)
  const signIn = useCallback(async (provider) => {
    if (!isWebApp) {
      throw new Error('OAuth not available');
    }

    // Map provider names to cariara endpoints
    const providerMap = {
      google: 'google',
      github: 'github',
      linkedin_oidc: 'linkedin',
      linkedin: 'linkedin',
    };

    const cariaraProvider = providerMap[provider] || provider;

    // Redirect to cariara OAuth endpoint with ascend redirect
    window.location.href = `${CARIARA_OAUTH_URL}/auth/${cariaraProvider}/login?redirect=ascend`;
  }, [isWebApp]);

  // Sign out
  const signOut = useCallback(async () => {
    storeAuth(null);
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setCredits(null);
    setSubscription(null);
    setUsage(null);
  }, []);

  // Check if user can create company
  const canCreateCompany = useCallback(async () => {
    if (!accessToken) return { allowed: false, reason: 'Not authenticated' };

    try {
      const res = await fetch(`${API_URL}/api/credits/can-create`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        return await res.json();
      }
      return { allowed: false, reason: 'Failed to check credits' };
    } catch (error) {
      return { allowed: false, reason: error.message };
    }
  }, [accessToken]);

  const value = {
    user,
    accessToken,
    loading,
    credits,
    subscription,
    usage,
    isWebApp,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshUserData,
    canCreateCompany,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
