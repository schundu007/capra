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

// Lazy-loaded pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const MainApp = React.lazy(() => import('./pages/MainApp'));
const DownloadPage = React.lazy(() => import('./components/billing/DownloadPage'));
const PremiumPage = React.lazy(() => import('./components/billing/PremiumPage'));
const PracticePage = React.lazy(() => import('./pages/PracticePage'));
const DocsPage = React.lazy(() => import('./components/DocsPage'));
const ProblemPage = React.lazy(() => import('./components/ProblemPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage.jsx'));
const AppShell = React.lazy(() => import('./components/layout/AppShell'));

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
