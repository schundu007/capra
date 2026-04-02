import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../hooks/useElectron.js';

const AuthContext = createContext(null);

const API_URL = getApiUrl();
// Google OAuth client (shared with Lumora)
const GOOGLE_CLIENT_ID = '935268333296-g5mfoojchp9r5i6dolh7n7vtgursrf52.apps.googleusercontent.com';
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
 * Set SSO cookie for cross-subdomain auth (ascend.cariara.com <-> lumora.cariara.com)
 */
function setSSOCookie(token) {
  document.cookie = `cariara_sso=${token}; domain=.cariara.com; path=/; max-age=${30*24*60*60}; secure; samesite=lax`;
}

function clearSSOCookie() {
  document.cookie = 'cariara_sso=; domain=.cariara.com; path=/; max-age=0; secure; samesite=lax';
}

/**
 * Parse auth tokens from URL hash (cariara OAuth redirect)
 */
function parseAuthFromHash() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) {
    return null;
  }

  // Parse hash fragment manually to avoid URLSearchParams treating '+' as space.
  // Hash fragments are percent-encoded, not form-encoded, so we split on '&'
  // and decode each value with decodeURIComponent.
  const hashStr = hash.substring(1);
  const paramMap = {};
  for (const part of hashStr.split('&')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.substring(0, eqIdx);
    const rawValue = part.substring(eqIdx + 1);
    try {
      paramMap[key] = decodeURIComponent(rawValue);
    } catch {
      paramMap[key] = rawValue;
    }
  }

  const accessToken = paramMap['access_token'] || null;
  const refreshToken = paramMap['refresh_token'] || null;
  const userId = paramMap['user_id'] || null;
  const userEmail = paramMap['user_email'] || null;
  const userName = paramMap['user_name'] || null;
  const userAvatar = paramMap['user_avatar'] || null;
  const userRole = paramMap['user_role'] || null;
  const onboardingCompleted = paramMap['onboarding_completed'] || null;

  if (accessToken && userId) {
    return {
      accessToken,
      refreshToken,
      user: {
        id: parseInt(userId, 10),
        email: userEmail || null,
        name: userName || null,
        avatar: userAvatar || null,
        role: userRole || 'user',
      },
      onboardingCompleted: onboardingCompleted === 'true',
    };
  }

  return null;
}

// Refresh interval: 7 days in milliseconds (well before 30-day token expiry)
const TOKEN_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [credits, setCredits] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);

  // Check if webapp auth is enabled (not in Electron)
  const isWebApp = !window.electronAPI?.isElectron;

  /**
   * Refresh the access token by calling POST /api/auth/refresh.
   * On success, updates state and localStorage with the new token.
   * On failure (401), clears auth to force re-login.
   * Returns the new token on success, or null on failure.
   */
  const refreshAccessToken = useCallback(async (currentToken) => {
    const tokenToRefresh = currentToken || accessToken;
    if (!tokenToRefresh) return null;

    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToRefresh}`,
        },
      });

      if (res.ok) {
        const { accessToken: newToken } = await res.json();
        // Update state
        setAccessToken(newToken);
        // Update localStorage
        const storedAuth = getStoredAuth();
        if (storedAuth) {
          storeAuth({ ...storedAuth, accessToken: newToken });
        }
        // Update SSO cookie with refreshed token
        setSSOCookie(newToken);
        return newToken;
      }

      // 401 means the token is truly invalid — force re-login
      if (res.status === 401) {
        console.warn('Token refresh failed (401), clearing auth');
        storeAuth(null);
        clearSSOCookie();
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setCredits(null);
        setSubscription(null);
        setUsage(null);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Network errors — don't clear auth, just fail silently
    }

    return null;
  }, [accessToken]);

  // Initialize auth state
  useEffect(() => {
    if (!isWebApp) {
      // Electron - skip webapp auth
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        // Check for OAuth error in URL hash (e.g., #error=access_denied&message=...)
        // Only treat as error if there's NO access_token (errors and tokens are mutually exclusive)
        const hash = window.location.hash;
        if (hash && hash.includes('error=') && !hash.includes('access_token=')) {
          const errorParams = {};
          for (const part of hash.substring(1).split('&')) {
            const eqIdx = part.indexOf('=');
            if (eqIdx === -1) continue;
            errorParams[part.substring(0, eqIdx)] = decodeURIComponent(part.substring(eqIdx + 1));
          }
          const errorMsg = errorParams['message'] || errorParams['error_description'] || errorParams['error'] || 'Authentication failed';
          setAuthError(errorMsg);
          window.history.replaceState(null, '', window.location.pathname);
          setLoading(false);
          return;
        }

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
            let checkoutFailed = false;
            try {
              const pricesRes = await fetch(`${API_URL}/api/billing/prices`);
              const prices = await pricesRes.json();

              // Map plan ID to price ID
              const priceMap = {
                monthly: prices.monthly?.priceId,
                quarterly_pro: prices.quarterly_pro?.priceId,
                desktop_lifetime: prices.desktop_lifetime?.priceId,
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
                    successUrl: `${window.location.origin}?checkout=success&plan=${pendingPlan}`,
                    cancelUrl: `${window.location.origin}/premium?checkout=canceled`,
                  }),
                });

                if (checkoutRes.ok) {
                  const { url } = await checkoutRes.json();
                  // Store auth before redirecting so user is logged in when they return
                  storeAuth(hashAuth);
                  setSSOCookie(hashAuth.accessToken);
                  window.location.href = url;
                  return; // Don't set loading to false, we're redirecting
                } else {
                  checkoutFailed = true;
                }
              } else {
                checkoutFailed = true;
              }
            } catch (error) {
              console.error('Failed to create checkout session:', error);
              checkoutFailed = true;
            }

            // If checkout failed, store auth and redirect back to premium page
            if (checkoutFailed) {
              storeAuth(hashAuth);
              setSSOCookie(hashAuth.accessToken);
              setUser(hashAuth.user);
              setAccessToken(hashAuth.accessToken);
              setRefreshToken(hashAuth.refreshToken);
              await fetchUserData(hashAuth.accessToken);
              window.location.replace('/premium');
              return;
            }
          }

          // No pending plan or checkout failed - proceed with normal login
          storeAuth(hashAuth);
          setSSOCookie(hashAuth.accessToken);
          setUser(hashAuth.user);
          setAccessToken(hashAuth.accessToken);
          setRefreshToken(hashAuth.refreshToken);
          setOnboardingCompleted(hashAuth.onboardingCompleted || false);

          // Fetch user data
          await fetchUserData(hashAuth.accessToken);

          // Redirect to saved page or landing page
          const savedRedirect = localStorage.getItem('ascend_auth_redirect');
          localStorage.removeItem('ascend_auth_redirect');
          window.location.replace(savedRedirect || '/practice');
          return;
        }

        // Check for checkout success redirect
        const urlParams = new URLSearchParams(window.location.search);
        const checkoutStatus = urlParams.get('checkout');
        const planType = urlParams.get('plan');

        if (checkoutStatus === 'success') {
          // Clear the URL params
          window.history.replaceState(null, '', window.location.pathname);

          // Get stored auth to refresh user data
          const storedAuth = getStoredAuth();
          if (storedAuth?.accessToken) {
            setUser(storedAuth.user);
            setAccessToken(storedAuth.accessToken);
            setRefreshToken(storedAuth.refreshToken);

            // Refresh user data after purchase
            await fetchUserData(storedAuth.accessToken);

            // Redirect to download page for desktop_lifetime purchases
            if (planType === 'desktop_lifetime') {
              setLoading(false);
              window.location.href = '/download';
              return;
            }

            // For other plans, show success (could add a toast notification here)
            console.log('Payment successful for plan:', planType);
          }

          setLoading(false);
          return;
        }

        // Otherwise check localStorage for existing session
        const storedAuth = getStoredAuth();
        if (storedAuth?.accessToken) {
          setSSOCookie(storedAuth.accessToken);
          setUser(storedAuth.user);
          setAccessToken(storedAuth.accessToken);
          setRefreshToken(storedAuth.refreshToken);

          // Fetch user data (also validates token)
          await fetchUserData(storedAuth.accessToken);

          // Check onboarding status
          try {
            const headers = { Authorization: `Bearer ${storedAuth.accessToken}` };
            const onboardingRes = await fetch(`${API_URL}/api/onboarding/status`, { headers });
            if (onboardingRes.ok) {
              const onboardingData = await onboardingRes.json();
              setOnboardingCompleted(onboardingData.onboarding_completed);
            }
          } catch (e) {
            console.error('Failed to fetch onboarding status:', e);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only clear auth if we don't have a stored session (network errors shouldn't log out users)
        const storedAuth = getStoredAuth();
        if (storedAuth?.user) {
          // Keep user logged in with stored data despite network error
          setUser(storedAuth.user);
          setAccessToken(storedAuth.accessToken);
          setRefreshToken(storedAuth.refreshToken);
        } else {
          storeAuth(null);
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isWebApp]);

  // Set up periodic token refresh (every 7 days)
  useEffect(() => {
    if (!isWebApp || !accessToken) return;

    const intervalId = setInterval(() => {
      refreshAccessToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isWebApp, accessToken, refreshAccessToken]);

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
        // Token expired — try refreshing once before giving up
        const newToken = await refreshAccessToken(token);
        if (newToken) {
          // Retry with the refreshed token (non-recursive, single retry)
          const retryHeaders = { Authorization: `Bearer ${newToken}` };
          const retryRes = await fetch(`${API_URL}/api/credits`, { headers: retryHeaders });
          if (retryRes.ok) {
            const creditsData = await retryRes.json();
            setCredits(creditsData);
          } else {
            throw new Error('Token expired');
          }

          // Also fetch subscription and usage with the new token
          const subRes = await fetch(`${API_URL}/api/billing/subscription`, { headers: retryHeaders });
          if (subRes.ok) {
            const subData = await subRes.json();
            setSubscription(subData.subscription);
          }

          const usageRes = await fetch(`${API_URL}/api/usage`, { headers: retryHeaders });
          if (usageRes.ok) {
            const usageData = await usageRes.json();
            setUsage(usageData.usage);
          }
          return; // Successfully fetched with refreshed token
        }
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
        clearSSOCookie();
        setUser(null);
        setAccessToken(null);
      }
    }
  }, [refreshAccessToken]);

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

  // Sign in with Google OAuth (direct, shared with Lumora)
  const signIn = useCallback(async (provider) => {
    if (!isWebApp) {
      throw new Error('OAuth not available');
    }

    // Save redirect URL for post-login navigation.
    // If ProtectedRoute already saved the attempted URL (e.g. /prepare/coding),
    // don't overwrite it with /login. Only save if no redirect is already pending.
    const currentPath = window.location.pathname + window.location.search;
    const existingRedirect = localStorage.getItem('ascend_auth_redirect');
    if (!existingRedirect && currentPath !== '/login' && currentPath !== '/') {
      localStorage.setItem('ascend_auth_redirect', currentPath);
    }

    // Use Ascend backend's Google OAuth endpoint
    window.location.href = `${API_URL}/api/auth/google/login`;
  }, [isWebApp]);

  // Sign out
  const signOut = useCallback(async () => {
    storeAuth(null);
    clearSSOCookie();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setCredits(null);
    setSubscription(null);
    setUsage(null);
    // Always redirect to landing page on logout
    window.location.replace('/');
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
    authError,
    credits,
    subscription,
    usage,
    onboardingCompleted,
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
