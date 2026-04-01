import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isElectron } from './constants';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/shared/LoadingScreen';

// Redirect to landing page if not authenticated (waits for auth to initialize)
// Saves the attempted URL so the user can be redirected back after login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    // Save the attempted URL so after login the user returns here
    const attemptedUrl = location.pathname + location.search;
    if (attemptedUrl && attemptedUrl !== '/') {
      localStorage.setItem('ascend_auth_redirect', attemptedUrl);
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

// Auto-reload on stale chunk errors (happens after deployment with new hashes)
function lazyWithRetry(importFn) {
  return React.lazy(() => importFn().catch(() => {
    // Chunk failed to load — likely a new deployment. Force reload once.
    if (!sessionStorage.getItem('chunk_reload')) {
      sessionStorage.setItem('chunk_reload', '1');
      window.location.reload();
    }
    return importFn(); // retry once more
  }));
}

// Lazy-loaded pages
const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));
const MainApp = lazyWithRetry(() => import('./pages/MainApp'));
const DownloadPage = lazyWithRetry(() => import('./components/billing/DownloadPage'));
const PremiumPage = lazyWithRetry(() => import('./components/billing/PremiumPage'));
const PracticePage = lazyWithRetry(() => import('./pages/PracticePage'));
const DocsPage = lazyWithRetry(() => import('./components/DocsPage'));
const ProblemPage = lazyWithRetry(() => import('./components/ProblemPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));
const OnboardingPage = lazyWithRetry(() => import('./pages/OnboardingPage.jsx'));
const AppShell = lazyWithRetry(() => import('./components/layout/AppShell'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Bare routes — no sidebar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingScreen />}>
              <OnboardingPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />

        {/* Shell routes — AppShell provides unified sidebar */}
        <Route element={<AppShell />}>
          <Route path="/prepare/*" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
          <Route path="/problems/:slug" element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} />
          <Route path="/app" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          <Route path="/app/coding" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          <Route path="/app/design" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          <Route path="/app/prep" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function AppRouter() {
  if (isElectron) {
    return null; // Electron routing handled in App.jsx
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
