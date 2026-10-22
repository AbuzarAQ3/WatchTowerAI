import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function VerifyEmailPending() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingFlows, pendingEmail } = useAuthStore();

  const email = (location.state as any)?.email || pendingEmail;
  const hasPendingFlow = pendingFlows.includes('verify_email') || !!email;

  useEffect(() => {
    // If the user navigates here without a pending flow, redirect to /login
    if (!hasPendingFlow) {
      navigate('/login', { replace: true });
    }
  }, [hasPendingFlow, navigate]);

  if (!hasPendingFlow) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#05080F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'var(--font-mono, monospace)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '12px',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '24px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '540px',
          borderRadius: '20px',
          border: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
          background: 'var(--clr-bg-surface, #0f1624)',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(245,158,11,0.1), 0 20px 80px rgba(0,0,0,0.8)',
          padding: '36px',
          textAlign: 'center',
        }}
      >
        {/* Radar / Envelope Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            background: 'var(--clr-amber-dim, rgba(245,158,11,0.15))',
            border: '1px solid var(--clr-amber, #f59e0b)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 20px auto',
          }}
        >
          ✉️
        </div>

        <span className="badge badge-warning" style={{ marginBottom: '12px' }}>
          VERIFICATION PENDING
        </span>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-sans, sans-serif)',
            marginBottom: '10px',
          }}
        >
          Check Your Clearance Dispatch
        </h1>

        <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary, #94a3b8)', lineHeight: '1.6', marginBottom: '20px' }}>
          We sent a verification link to{' '}
          <strong style={{ color: 'var(--clr-amber, #f59e0b)' }}>
            {email || 'your registered email'}
          </strong>
          . Click it to activate your account and complete zero-trust enrollment.
        </p>

        <div
          style={{
            background: 'var(--clr-bg-elevated, #161e30)',
            border: '1px dashed var(--clr-border, rgba(255,255,255,0.1))',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '11px',
            color: 'var(--clr-text-muted, #4b5a72)',
            textAlign: 'left',
            marginBottom: '24px',
          }}
        >
          <p style={{ margin: '0 0 4px 0', color: 'var(--clr-text-secondary, #94a3b8)', fontWeight: 600 }}>
            ℹ️ Security Instructions:
          </p>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Check spam/junk filters if the message does not appear in 2 minutes.</li>
            <li>Verification links are single-use and expire within 24 hours.</li>
            <li>Once verified, authenticate with your operator passphrase.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* TODO: Resend verification email button */}
          <button
            type="button"
            disabled
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '11px',
              opacity: 0.5,
              cursor: 'not-allowed',
            }}
          >
            ↻ Resend Verification Email (Cooldowned)
          </button>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '11px',
            }}
          >
            ← Return to Operator Login
          </Link>
        </div>
      </div>
    </div>
  );
}
