import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isElectron } from './constants';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/shared/LoadingScreen';

// Redirect to landing page if not authenticated (waits for auth to initialize)
// Redirect to onboarding if not completed
function ProtectedRoute({ children }) {
  const { user, loading, onboardingCompleted } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;

  // Don't redirect if already on onboarding page
  if (onboardingCompleted === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
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
const NotFound = React.lazy(() => import('./pages/NotFound'));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage.jsx'));
const AppShell = React.lazy(() => import('./components/layout/AppShell'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Bare routes — no sidebar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingScreen />}>
              <OnboardingPage />
            </Suspense>
          </ProtectedRoute>
        } />

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
