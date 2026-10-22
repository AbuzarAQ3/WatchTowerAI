import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../lib/api';

type VerifyState = 'loading' | 'success' | 'expired' | 'invalid' | 'network_error';

export default function VerifyEmail() {
  const { key } = useParams<{ key: string }>();
  const [state, setState] = useState<VerifyState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyKey = useCallback(async (verificationKey: string) => {
    setState('loading');
    setErrorMessage('');

    try {
      const response = await authApi.post('/auth/email/verify', {
        key: verificationKey,
      });

      if (response.status === 200 || response.data?.status === 200) {
        setState('success');
      } else {
        setState('expired');
      }
    } catch (err: any) {
      const response = err.response;
      const status = response?.status;
      const errors = response?.data?.errors;

      if (status === 400) {
        const errorItem = Array.isArray(errors) ? errors[0] : null;
        setErrorMessage(errorItem?.message || 'The verification link has expired or is invalid.');
        setState('expired');
      } else if (!status) {
        // Network error (no response received)
        setErrorMessage(err.message || 'Unable to connect to verification server.');
        setState('network_error');
      } else {
        setState('expired');
      }
    }
  }, []);

  useEffect(() => {
    if (!key || key.trim() === '') {
      setState('invalid');
      return;
    }

    // Key comes raw/decoded from React Router params
    verifyKey(key);
  }, [key, verifyKey]);

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
          maxWidth: '520px',
          borderRadius: '20px',
          border: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
          background: 'var(--clr-bg-surface, #0f1624)',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(245,158,11,0.1), 0 20px 80px rgba(0,0,0,0.8)',
          padding: '36px',
          textAlign: 'center',
        }}
      >
        {/* State: Loading */}
        {state === 'loading' && (
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '3px solid rgba(245,158,11,0.2)',
                borderTopColor: 'var(--clr-amber, #f59e0b)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 20px auto',
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-sans, sans-serif)', marginBottom: '8px' }}>
              Validating Cryptographic Verification Key
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--clr-text-secondary, #94a3b8)' }}>
              Verifying token authenticity with allauth service...
            </p>
          </div>
        )}

        {/* State: Success */}
        {state === 'success' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--clr-success-dim, rgba(16,185,129,0.12))',
                border: '1px solid var(--clr-success, #10b981)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 20px auto',
              }}
            >
              ✓
            </div>
            <span className="badge badge-success" style={{ marginBottom: '12px' }}>
              VERIFICATION COMPLETE
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-sans, sans-serif)', marginBottom: '10px' }}>
              Email Address Verified
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--clr-text-secondary, #94a3b8)', lineHeight: '1.6', marginBottom: '24px' }}>
              Your operator account has been activated with verified security clearance. You may now authenticate.
            </p>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '12px',
                letterSpacing: '0.15em',
              }}
            >
              ◆ CONTINUE TO OPERATOR LOGIN →
            </Link>
          </div>
        )}

        {/* State: Expired */}
        {state === 'expired' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--clr-danger-dim, rgba(239,68,68,0.12))',
                border: '1px solid var(--clr-danger, #ef4444)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 20px auto',
              }}
            >
              ✕
            </div>
            <span className="badge badge-danger" style={{ marginBottom: '12px' }}>
              LINK EXPIRED OR INVALID
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-sans, sans-serif)', marginBottom: '10px' }}>
              Verification Failed
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--clr-text-secondary, #94a3b8)', lineHeight: '1.6', marginBottom: '24px' }}>
              {errorMessage || 'This verification link is no longer valid or has already been used.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* TODO: Resend verification email */}
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
                ↻ Resend Verification Key
              </button>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: '11px',
                }}
              >
                Register a New Account
              </Link>
            </div>
          </div>
        )}

        {/* State: Invalid / Missing key */}
        {state === 'invalid' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--clr-danger-dim, rgba(239,68,68,0.12))',
                border: '1px solid var(--clr-danger, #ef4444)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 20px auto',
              }}
            >
              ⚠️
            </div>
            <span className="badge badge-danger" style={{ marginBottom: '12px' }}>
              MALFORMED LINK
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-sans, sans-serif)', marginBottom: '10px' }}>
              Invalid Verification Link
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--clr-text-secondary, #94a3b8)', lineHeight: '1.6', marginBottom: '24px' }}>
              The verification key in the link is missing or improperly formed.
            </p>
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
              Return to Operator Login
            </Link>
          </div>
        )}

        {/* State: Network Error */}
        {state === 'network_error' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--clr-warning-dim, rgba(245,158,11,0.12))',
                border: '1px solid var(--clr-warning, #f59e0b)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 20px auto',
              }}
            >
              📡
            </div>
            <span className="badge badge-warning" style={{ marginBottom: '12px' }}>
              NETWORK ERROR
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-sans, sans-serif)', marginBottom: '10px' }}>
              Connection Failed
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--clr-text-secondary, #94a3b8)', lineHeight: '1.6', marginBottom: '24px' }}>
              {errorMessage || 'Could not connect to the authentication server. Please verify your connection.'}
            </p>
            <button
              onClick={() => key && verifyKey(key)}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '11px',
              }}
            >
              ↻ Retry Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
