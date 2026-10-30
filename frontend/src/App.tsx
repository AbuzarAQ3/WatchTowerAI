import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { ToastProvider } from './components/Toast';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmailPending from './pages/VerifyEmailPending';
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail'));
// Lazy-loaded surveillance views
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Incidents = React.lazy(() => import('./pages/Incidents'));
const Cameras = React.lazy(() => import('./pages/Cameras'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Settings = React.lazy(() => import('./pages/Settings'));
import AppLayout, { ModuleLoadingFallback } from './components/layout/AppLayout';

/**
 * Top-level Bootstrapper that restores active session on app mount
 * and renders a full-page security loader while verifying credentials,
 * preventing any flash of the unauthenticated login view.
 */
function AuthBootstrapper({ children }: { children: React.ReactNode }) {
  const { status, restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (status === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--clr-bg-base, #090d14)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: 'var(--clr-text-primary, #e2e8f0)',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(245, 158, 11, 0.2)',
            borderTopColor: 'var(--clr-amber, #f59e0b)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--clr-text-secondary, #94a3b8)',
          }}
        >
          INITIALIZING SECURITY SESSION...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <AuthBootstrapper>
      <Routes>
        {/* Public routes — redirected away if already authenticated */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />

        {/* Email verification routes */}
        <Route path="/verify-email/pending" element={<VerifyEmailPending />} />
        <Route
          path="/account/verify-email/:key"
          element={
            <React.Suspense fallback={<ModuleLoadingFallback />}>
              <VerifyEmail />
            </React.Suspense>
          }
        />
        <Route
          path="/verify-email/:key"
          element={
            <React.Suspense fallback={<ModuleLoadingFallback />}>
              <VerifyEmail />
            </React.Suspense>
          }
        />

        {/* Protected routes — Dashboard and surveillance views */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="cameras" element={<Cameras />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthBootstrapper>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
