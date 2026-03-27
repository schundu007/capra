import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isElectron } from './constants';
import LoadingScreen from './components/shared/LoadingScreen';

// Lazy-loaded pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const MainApp = React.lazy(() => import('./pages/MainApp'));
const DownloadPage = React.lazy(() => import('./components/billing/DownloadPage'));
const PremiumPage = React.lazy(() => import('./components/billing/PremiumPage'));
const DocsPage = React.lazy(() => import('./components/DocsPage'));
const ProblemPage = React.lazy(() => import('./components/ProblemPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/prepare/*" element={<DocsPage />} />
        <Route path="/problems/:slug" element={<ProblemPage />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="/app/coding" element={<MainApp />} />
        <Route path="/app/design" element={<MainApp />} />
        <Route path="/app/prep" element={<MainApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function AppRouter() {
  // Electron uses hash-based or in-memory routing handled by App.jsx directly
  // Webapp uses BrowserRouter
  if (isElectron) {
    return null; // Electron routing handled in App.jsx
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
