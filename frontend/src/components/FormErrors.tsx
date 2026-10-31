import React from 'react';
import type { ApiError } from '../store/auth';

interface FormErrorsProps {
  errors: ApiError[];
}

/**
 * Top-level error banner for non-field errors or general errors
 */
export const FormErrors: React.FC<FormErrorsProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  // Filter errors that do NOT correspond to a specific input field
  const bannerErrors = errors.filter(
    (err) =>
      !err.param ||
      err.param === 'non_field_errors' ||
      err.param === '__all__' ||
      err.param === 'detail'
  );

  if (bannerErrors.length === 0) return null;

  return (
    <div
      role="alert"
      style={{
        padding: '12px 14px',
        marginBottom: '16px',
        borderRadius: '8px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        color: '#fca5a5',
        fontSize: '12px',
        lineHeight: '1.4',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#ef4444' }}>
        <span>⚠️</span>
        <span>Authentication Alert</span>
      </div>
      {bannerErrors.map((err, idx) => (
        <p key={idx} style={{ margin: 0, color: '#fecaca', fontSize: '11px' }}>
          {err.message}
        </p>
      ))}
    </div>
  );
};

/**
 * Helper to get the first error message for a specific form field
 */
export function getFieldError(errors: ApiError[], fieldName: string): string | undefined {
  const match = errors.find((e) => e.param === fieldName);
  return match?.message;
}

/**
 * Inline error component displayed beneath a specific form field
 */
export const FieldError: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;
  return (
    <span
      role="alert"
      style={{
        display: 'block',
        marginTop: '5px',
        fontSize: '11px',
        color: 'var(--clr-danger, #ef4444)',
        fontWeight: 500,
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      ↳ {error}
    </span>
  );
};

export default FormErrors;
