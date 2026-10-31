import React from 'react';
import { Check, Circle } from 'lucide-react';
import { PASSWORD_RULES } from './rules';

export interface PasswordStrengthProps {
  password?: string;
}

export default function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        marginTop: '10px',
        padding: '10px 12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--clr-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      <span style={{ fontSize: '10px', color: 'var(--clr-text-secondary, #94a3b8)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Password Requirements
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', marginTop: '2px' }}>
        {PASSWORD_RULES.map((rule) => {
          const isPassed = rule.test(password);
          return (
            <div
              key={rule.id}
              data-testid={`rule-${rule.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isPassed ? 'var(--clr-success, #10b981)' : 'var(--clr-text-muted, #64748b)',
                transition: 'color 0.2s ease',
              }}
            >
              {isPassed ? (
                <Check size={12} strokeWidth={2.5} style={{ color: 'var(--clr-success, #10b981)', flexShrink: 0 }} />
              ) : (
                <Circle size={8} style={{ color: 'var(--clr-text-muted, #64748b)', flexShrink: 0 }} />
              )}
              <span style={{ opacity: isPassed ? 1 : 0.75 }}>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
