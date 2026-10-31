import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PasswordStrength from './PasswordStrength';

describe('PasswordStrength Component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders container with role="status" and aria-live="polite"', () => {
    render(<PasswordStrength password="" />);
    const statusContainer = screen.getByRole('status');
    expect(statusContainer).toBeInTheDocument();
    expect(statusContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('verifies Rule 1: length requirement (>= 8 characters)', () => {
    const { rerender } = render(<PasswordStrength password="short" />);
    const lengthRule = screen.getByTestId('rule-length');
    expect(lengthRule).toHaveTextContent('At least 8 characters');
    // Not passed initially
    expect(lengthRule.querySelector('svg')).toHaveClass('lucide-circle');

    rerender(<PasswordStrength password="12345678" />);
    expect(lengthRule.querySelector('svg')).toHaveClass('lucide-check');
  });

  it('verifies Rule 2: uppercase letter requirement', () => {
    const { rerender } = render(<PasswordStrength password="lowercaseonly" />);
    const rule = screen.getByTestId('rule-uppercase');
    expect(rule.querySelector('svg')).toHaveClass('lucide-circle');

    rerender(<PasswordStrength password="hasUppercase" />);
    expect(rule.querySelector('svg')).toHaveClass('lucide-check');
  });

  it('verifies Rule 3: lowercase letter requirement', () => {
    const { rerender } = render(<PasswordStrength password="UPPERCASE123!" />);
    const rule = screen.getByTestId('rule-lowercase');
    expect(rule.querySelector('svg')).toHaveClass('lucide-circle');

    rerender(<PasswordStrength password="UPPERCASEa123!" />);
    expect(rule.querySelector('svg')).toHaveClass('lucide-check');
  });

  it('verifies Rule 4: number requirement', () => {
    const { rerender } = render(<PasswordStrength password="NoNumbersHere!" />);
    const rule = screen.getByTestId('rule-number');
    expect(rule.querySelector('svg')).toHaveClass('lucide-circle');

    rerender(<PasswordStrength password="HasNumber1" />);
    expect(rule.querySelector('svg')).toHaveClass('lucide-check');
  });

  it('verifies Rule 5: special character requirement', () => {
    const { rerender } = render(<PasswordStrength password="NoSpecialChar123" />);
    const rule = screen.getByTestId('rule-special');
    expect(rule.querySelector('svg')).toHaveClass('lucide-circle');

    rerender(<PasswordStrength password="HasSpecialChar123!" />);
    expect(rule.querySelector('svg')).toHaveClass('lucide-check');
  });

  it('passes all 5 rules simultaneously when a strong password is provided', () => {
    render(<PasswordStrength password="StrongPass123!" />);

    const rules = ['rule-length', 'rule-uppercase', 'rule-lowercase', 'rule-number', 'rule-special'];
    rules.forEach((ruleId) => {
      const el = screen.getByTestId(ruleId);
      expect(el.querySelector('svg')).toHaveClass('lucide-check');
    });
  });
});
