import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore, type ApiError } from '../store/auth';
import { FormErrors, FieldError, getFieldError } from '../components/FormErrors';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setPendingEmail } = useAuthStore();

  const [username, setUsername] = useState('abuzar');
  const [password, setPassword] = useState('StrongPass123!');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ApiError[]>([]);

  const usernameError = getFieldError(errors, 'username');
  const passwordError = getFieldError(errors, 'password');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.kind === 'success') {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else if (result.kind === 'pending') {
        setPendingEmail(username.includes('@') ? username : null);
        navigate('/verify-email/pending', {
          state: { email: username.includes('@') ? username : undefined },
        });
      } else if (result.kind === 'error') {
        setErrors(result.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* RED ALERT BORDER & AMBER RADIAL GLOW */}
      <div
        style={{
          position: 'absolute',
          inset: '12px',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '24px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(800px at 20% 0%, rgba(245,158,11,0.08), transparent), radial-gradient(600px at 100% 100%, rgba(239,68,68,0.06), transparent)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '1120px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          borderRadius: '20px',
          border: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
          background: 'var(--clr-bg-surface, #0f1624)',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(245,158,11,0.1), 0 20px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* LEFT - SECURITY TERMINAL */}
        <div
          style={{
            background: 'linear-gradient(180deg, #0F1624 0%, #090D14 100%)',
            padding: '28px',
            borderRight: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '18px',
              borderBottom: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #ef4444',
                  animation: 'blink 1s infinite',
                }}
              />
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--clr-danger, #ef4444)' }}>
                CLASSIFICATION: TOP SECRET // NOFORN
              </span>
            </div>
            <span
              style={{
                fontSize: '9px',
                color: 'var(--clr-text-muted, #4b5a72)',
                border: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
                padding: '3px 8px',
                borderRadius: '99px',
              }}
            >
              TERMINAL ID: WT-KAN-07
            </span>
          </div>

          <div style={{ marginTop: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'var(--clr-amber, #f59e0b)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#000',
                fontSize: '18px',
              }}
            >
              W
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.15em', fontFamily: 'var(--font-sans, sans-serif)' }}>
                WATCHTOWER AI
              </p>
              <p style={{ fontSize: '9px', color: 'var(--clr-text-muted, #4b5a72)' }}>
                SECURE PERIMETER OS • BUILD 2.4.1-STABLE
              </p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: '9px', color: 'var(--clr-text-muted, #4b5a72)' }}>CLEARANCE REQUIRED</p>
              <p style={{ fontSize: '12px', color: 'var(--clr-amber, #f59e0b)', fontWeight: 800 }}>LEVEL 4</p>
            </div>
          </div>

          <h1
            style={{
              marginTop: '28px',
              fontSize: '40px',
              fontWeight: 900,
              lineHeight: '0.95',
              letterSpacing: '-0.04em',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            HIGH SECURITY<br />
            <span
              style={{
                background: 'var(--clr-amber, #f59e0b)',
                padding: '0 8px',
                color: '#000',
              }}
            >
              AUTHENTICATION
            </span>
            <br />
            GATEWAY
          </h1>

          {/* Security Checks */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'DEVICE FINGERPRINT', status: 'VERIFIED', color: 'var(--clr-success, #10b981)' },
              { label: 'HEADLESS API HANDSHAKE', status: 'READY', color: 'var(--clr-success, #10b981)' },
              { label: 'ZERO-TRUST SESSION', status: 'ACTIVE', color: 'var(--clr-amber, #f59e0b)' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'var(--clr-bg-elevated, #161e30)',
                  border: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '10px',
                }}
              >
                <span style={{ color: 'var(--clr-text-secondary, #94a3b8)' }}>▶ {item.label}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>[{item.status}]</span>
              </div>
            ))}
          </div>

          {/* Live Threat Feed */}
          <div style={{ marginTop: '18px' }} className="card">
            <p style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'var(--clr-text-muted, #4b5a72)', marginBottom: '8px' }}>
              LIVE THREAT FEED // ZONE-BRAVO
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', maxHeight: '75px', overflow: 'hidden' }}>
              <p>
                <span style={{ color: 'var(--clr-danger, #ef4444)' }}>[02:14:33]</span> <span style={{ color: 'var(--clr-text-muted)' }}>CAM-03</span> Perimeter scan verified
              </p>
              <p>
                <span style={{ color: 'var(--clr-success, #10b981)' }}>[02:14:21]</span> <span style={{ color: 'var(--clr-text-muted)' }}>AUTH</span> Secure gateway operational
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: 'var(--clr-text-muted, #4b5a72)',
              borderTop: '1px solid var(--clr-border, rgba(255,255,255,0.07))',
            }}
          >
            <span>Auth Protocol: django-allauth Headless</span>
            <span>ENCRYPTION: AES-256-GCM • TLS 1.3</span>
          </div>
        </div>

        {/* RIGHT - AUTH FORM */}
        <div style={{ padding: '28px', background: '#0f1624', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'var(--clr-text-secondary, #94a3b8)' }}>
              AUTHENTICATION_REQUIRED —
            </p>
            <span className="badge badge-danger">🔒 SECURE ENCLAVE</span>
          </div>

          {/* Top-level banner errors */}
          <FormErrors errors={errors} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Operator Identifier (Username) */}
            <div>
              <label htmlFor="username" style={{ fontSize: '10px', color: 'var(--clr-text-muted, #4b5a72)', letterSpacing: '0.1em' }}>
                OPERATOR USERNAME • CLEARANCE ID
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={!!usernameError}
                style={{
                  marginTop: '6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  borderColor: usernameError ? 'var(--clr-danger, #ef4444)' : undefined,
                }}
                placeholder="Enter operator username"
              />
              <FieldError error={usernameError} />
            </div>

            {/* Passphrase */}
            <div>
              <label htmlFor="password" style={{ fontSize: '10px', color: 'var(--clr-text-muted, #4b5a72)', letterSpacing: '0.1em' }}>
                PASSPHRASE • ACCESS SECRET
              </label>
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!passwordError}
                  style={{
                    paddingRight: '40px',
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: showPass ? 'normal' : '2px',
                    borderColor: passwordError ? 'var(--clr-danger, #ef4444)' : undefined,
                  }}
                  placeholder="Enter secret passphrase"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--clr-text-muted, #4b5a72)',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <FieldError error={passwordError} />
            </div>

            {/* Role Profile Selection */}
            <div>
              <label style={{ fontSize: '10px', color: 'var(--clr-text-muted, #4b5a72)', letterSpacing: '0.1em' }}>
                MISSION PROFILE • CLEARANCE
              </label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {[
                  { id: 'ADMIN', desc: 'L4 • Full Control' },
                  { id: 'OPERATOR', desc: 'L2 • Monitor' },
                  { id: 'VIEWER', desc: 'L1 • Read Only' },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border:
                        role === r.id
                          ? '1px solid var(--clr-amber, #f59e0b)'
                          : '1px solid var(--clr-border, rgba(255,255,255,0.07))',
                      background:
                        role === r.id
                          ? 'var(--clr-amber-dim, rgba(245,158,11,0.15))'
                          : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: role === r.id ? 'var(--clr-amber, #f59e0b)' : 'var(--clr-text-primary, #e2e8f0)',
                      }}
                    >
                      {r.id}
                    </p>
                    <p style={{ fontSize: '8px', color: 'var(--clr-text-muted, #4b5a72)' }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '12px',
                letterSpacing: '0.15em',
                marginTop: '6px',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTopColor: '#000',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>AUTHENTICATING OPERATOR...</span>
                </div>
              ) : (
                '◆ AUTHORIZE & ENTER SECURE ZONE →'
              )}
            </button>

            {/* Link to Signup */}
            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--clr-text-secondary, #94a3b8)' }}>
              Need operator credentials?{' '}
              <Link to="/signup" style={{ color: 'var(--clr-amber, #f59e0b)', fontWeight: 700 }}>
                Request Clearance / Register
              </Link>
            </div>

            <p
              style={{
                fontSize: '8px',
                color: 'var(--clr-text-muted, #4b5a72)',
                textAlign: 'center',
                lineHeight: '1.4',
                marginTop: 'auto',
                paddingTop: '10px',
              }}
            >
              WARNING: Unauthorized access is monitored. Headless session tokens are cryptographically signed.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
