import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { status } = useAuthStore();
  const location = useLocation();

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
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--clr-text-secondary, #94a3b8)' }}>
          CHECKING SESSION...
        </p>
      </div>
    );
  }

  if (status === 'authenticated') {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicOnlyRoute;
