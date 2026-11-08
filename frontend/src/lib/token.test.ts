import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getToken, setToken, clearToken } from './token';

describe('Token Persistence Helper', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores and retrieves the session token using key watchtower.session_token', () => {
    setToken('test_token_123');
    expect(getToken()).toBe('test_token_123');
    expect(localStorage.getItem('watchtower.session_token')).toBe('test_token_123');
  });

  it('clears the session token', () => {
    setToken('token_to_clear');
    clearToken();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem('watchtower.session_token')).toBeNull();
  });

  it('safely handles localStorage throwing an exception during getItem', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied in private browsing mode');
    });

    expect(getToken()).toBeNull();
  });

  it('safely handles localStorage throwing an exception during setItem', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    expect(() => setToken('new_token')).not.toThrow();
  });

  it('safely handles localStorage throwing an exception during removeItem', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage restriction');
    });

    expect(() => clearToken()).not.toThrow();
  });
});
