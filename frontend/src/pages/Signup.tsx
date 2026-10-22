import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type ApiError } from '../store/auth';
import { FormErrors, FieldError, getFieldError } from '../components/FormErrors';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, setPendingEmail } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ApiError[]>([]);

  const usernameError = getFieldError(errors, 'username');
  const emailError = getFieldError(errors, 'email');
  const passwordError = getFieldError(errors, 'password');

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['WEAK', 'FAIR', 'GOOD', 'STRONG'];
  const strengthColors = ['var(--clr-danger, #ef4444)', 'var(--clr-warning, #f59e0b)', 'var(--clr-cyan, #22d3ee)', 'var(--clr-success, #10b981)'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      const result = await signup({ username, email, password });

      if (result.kind === 'success') {
        navigate('/dashboard', { replace: true });
      } else if (result.kind === 'pending') {
        setPendingEmail(email);
        navigate('/verify-email/pending', {
          state: { email },
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
      {/* AMBER & CYAN AMBIENT GLOW */}
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
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(800px at 80% 0%, rgba(245,158,11,0.08), transparent), radial-gradient(600px at 0% 100%, rgba(34,211,238,0.06), transparent)',
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
          padding: '32px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
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
            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-sans, sans-serif)' }}>
              OPERATOR REGISTRATION
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--clr-text-muted, #4b5a72)' }}>
              WATCHTOWER AI • CREDENTIAL ENROLLMENT
            </p>
          </div>
        </div>

        {/* Top-level banner errors */}
        <FormErrors errors={errors} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Username */}
          <div>
            <label htmlFor="signup-username" style={{ fontSize: '10px', color: 'var(--clr-text-muted, #4b5a72)', letterSpacing: '0.1em' }}>
              OPERATOR USERNAME • CALLSIGN
            </label>
            <input
              id="signup-username"
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
              placeholder="e.g. abuzar"
            />
            <FieldError error={usernameError} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" style={{ fontSize: '10px', color: 'var(--clr-text-muted, #4b5a72)', letterSpacing: '0.1em' }}>
              COMMUNICATION EMAIL • VERIFICATION TARGET
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
              style={{
                marginTop: '6px',
                fontFamily: 'var(--font-mono, monospace)',
                borderColor: emailError ? 'var(--clr-danger, #ef4444)' : undefined,
              }}
              placeholder="e.g. abuzar@example.com"
            />
            <FieldError error={emailError} />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" style={{ fontSize: '10px', color: 'var(--clr-text-muted, #4b5a72)', letterSpacing: '0.1em' }}>
              SECURE PASSPHRASE • STRONG PASS REQUIRED
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <input
                id="signup-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
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
                placeholder="Minimum 8 characters"
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

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: '3px',
                        flex: 1,
                        background: i <= strength ? strengthColors[strength - 1] : 'var(--clr-border, rgba(255,255,255,0.1))',
                        borderRadius: '99px',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    color: strengthColors[Math.max(0, strength - 1)],
                    fontWeight: 700,
                  }}
                >
                  {strengthLabels[Math.max(0, strength - 1)]}
                </span>
              </div>
            )}
          </div>

          {/* Submit button */}
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
              marginTop: '10px',
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
                <span>ENROLLING CREDENTIALS...</span>
              </div>
            ) : (
              '◆ COMPLETE ENROLLMENT & JOIN →'
            )}
          </button>

          {/* Link to Login */}
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--clr-text-secondary, #94a3b8)' }}>
            Already hold security clearance?{' '}
            <Link to="/login" style={{ color: 'var(--clr-amber, #f59e0b)', fontWeight: 700 }}>
              Access Gateway / Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
