import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../pages/Signup';
import { useAuthStore } from '../store/auth';

describe('Signup Password Requirements & Strength Hint', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      status: 'unauthenticated',
      pendingFlows: [],
      pendingEmail: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders signup form with submit button enabled (client hint only, weak password does not block submit)', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    const submitBtn = screen.getByTestId('signup-submit-button');
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();

    // Password strength bar is not visible initially when password is empty
    expect(screen.queryByTestId('password-strength-bar')).not.toBeInTheDocument();
  });

  it('reveals strength bar and passes 5 rules progressively as characters are typed', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('signup-password-input');
    const submitBtn = screen.getByTestId('signup-submit-button');

    // 1. Type weak password (lowercase only, length < 8)
    fireEvent.change(passwordInput, { target: { value: 'pass' } });

    const strengthBar = screen.getByTestId('password-strength-bar');
    expect(strengthBar).toBeInTheDocument();
    expect(strengthBar).toHaveTextContent(/WEAK/i);
    expect(submitBtn).not.toBeDisabled();

    const ruleLength = screen.getByTestId('rule-length');
    const ruleUpper = screen.getByTestId('rule-uppercase');
    const ruleLower = screen.getByTestId('rule-lowercase');
    const ruleNumber = screen.getByTestId('rule-number');
    const ruleSpecial = screen.getByTestId('rule-special');

    // Only lowercase passes initially
    expect(ruleLower.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleLength.querySelector('svg')).toHaveClass('lucide-circle');
    expect(ruleUpper.querySelector('svg')).toHaveClass('lucide-circle');
    expect(ruleNumber.querySelector('svg')).toHaveClass('lucide-circle');
    expect(ruleSpecial.querySelector('svg')).toHaveClass('lucide-circle');

    // 2. Add uppercase and digits (e.g. 'passWord1') -> length, lower, upper, number
    fireEvent.change(passwordInput, { target: { value: 'passWord1' } });
    expect(ruleLength.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleUpper.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleLower.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleNumber.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleSpecial.querySelector('svg')).toHaveClass('lucide-circle');
    expect(strengthBar).toHaveTextContent(/GOOD/i);
    expect(submitBtn).not.toBeDisabled();

    // 3. Add special character -> all 5 rules pass
    fireEvent.change(passwordInput, { target: { value: 'passWord1!' } });
    expect(ruleLength.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleUpper.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleLower.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleNumber.querySelector('svg')).toHaveClass('lucide-check');
    expect(ruleSpecial.querySelector('svg')).toHaveClass('lucide-check');
    expect(strengthBar).toHaveTextContent(/STRONG/i);
    expect(submitBtn).not.toBeDisabled();
  });
});
