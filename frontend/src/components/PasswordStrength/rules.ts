export interface StrengthRule {
  id: string;
  label: string;
  test: (pwd: string) => boolean;
}

export const PASSWORD_RULES: StrengthRule[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter (A-Z)',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter (a-z)',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'At least one number (0-9)',
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: 'special',
    label: 'At least one special character (!@#$%^&*)',
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
];

/**
 * Calculates number of passed password rules (0 to 5)
 */
export function calculatePasswordStrength(pwd: string): number {
  if (!pwd) return 0;
  return PASSWORD_RULES.filter((rule) => rule.test(pwd)).length;
}

/**
 * Maps passed rules (0 to 5) to strength level (0 to 4):
 * 0: 0 passed
 * 1: 1-2 passed (WEAK)
 * 2: 3 passed (FAIR)
 * 3: 4 passed (GOOD)
 * 4: 5 passed (STRONG)
 */
export function getPasswordStrengthLevel(pwd: string): number {
  const passed = calculatePasswordStrength(pwd);
  if (passed === 0) return 0;
  if (passed <= 2) return 1;
  if (passed === 3) return 2;
  if (passed === 4) return 3;
  return 4;
}
