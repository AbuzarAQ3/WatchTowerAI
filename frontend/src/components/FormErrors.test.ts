import { describe, it, expect } from 'vitest';
import { getFieldError } from './FormErrors';
import type { ApiError } from '../store/auth';

describe('Form Error Helper', () => {
  const sampleErrors: ApiError[] = [
    { param: 'username', message: 'This field is required.', code: 'required' },
    { param: 'password', message: 'Password is too short.', code: 'min_length' },
    { message: 'Invalid clearance credentials provided.', code: 'invalid_credentials' },
    { param: 'non_field_errors', message: 'Too many failed login attempts.', code: 'throttled' },
  ];

  it('correctly maps errors to fields by param', () => {
    expect(getFieldError(sampleErrors, 'username')).toBe('This field is required.');
    expect(getFieldError(sampleErrors, 'password')).toBe('Password is too short.');
    expect(getFieldError(sampleErrors, 'email')).toBeUndefined();
  });

  it('identifies non-field errors for top-level banner rendering', () => {
    const bannerErrors = sampleErrors.filter(
      (err) =>
        !err.param ||
        err.param === 'non_field_errors' ||
        err.param === '__all__' ||
        err.param === 'detail'
    );

    expect(bannerErrors.length).toBe(2);
    expect(bannerErrors[0].message).toBe('Invalid clearance credentials provided.');
    expect(bannerErrors[1].message).toBe('Too many failed login attempts.');
  });
});
