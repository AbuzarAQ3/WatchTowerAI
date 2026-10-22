import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './auth';
import { authApi } from '../lib/api';
import * as tokenLib from '../lib/token';

vi.mock('../lib/api', () => ({
  authApi: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      status: 'unauthenticated',
      pendingFlows: [],
      pendingEmail: null,
    });
  });

  it('handles login success: stores token, user, and sets authenticated status', async () => {
    const mockUser = { id: 1, username: 'abuzar', email: 'abuzar@example.com' };
    const mockToken = 'session_abc_123';

    vi.mocked(authApi.post).mockResolvedValueOnce({
      data: {
        status: 200,
        data: { user: mockUser },
        meta: { is_authenticated: true, session_token: mockToken },
      },
    } as any);

    const result = await useAuthStore.getState().login('abuzar', 'StrongPass123!');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.user).toEqual(mockUser);
    }

    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(tokenLib.getToken()).toBe(mockToken);
  });

  it('handles login with 401 pending flow (verify_email): preserves token and returns pending', async () => {
    const mockToken = 'session_pending_token';
    vi.mocked(authApi.post).mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          status: 401,
          data: {
            flows: [
              { id: 'login' },
              { id: 'signup' },
              { id: 'verify_email', is_pending: true },
            ],
          },
          meta: { is_authenticated: false, session_token: mockToken },
        },
      },
    });

    const result = await useAuthStore.getState().login('abuzar', 'StrongPass123!');

    expect(result.kind).toBe('pending');
    if (result.kind === 'pending') {
      expect(result.flows).toContain('verify_email');
    }

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.token).toBe(mockToken);
    expect(state.pendingFlows).toContain('verify_email');
  });

  it('handles login with 400 validation error', async () => {
    vi.mocked(authApi.post).mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          status: 400,
          errors: [
            { message: 'Invalid credentials.', code: 'invalid_credentials' },
          ],
        },
      },
    });

    const result = await useAuthStore.getState().login('abuzar', 'WrongPassword');

    expect(result.kind).toBe('error');
    if (result.kind === 'error') {
      expect(result.errors[0].message).toBe('Invalid credentials.');
    }

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
  });

  it('handles restoreSession when valid session exists', async () => {
    tokenLib.setToken('valid_token');
    const mockUser = { id: 2, username: 'operator1' };

    vi.mocked(authApi.get).mockResolvedValueOnce({
      data: {
        status: 200,
        data: { user: mockUser },
        meta: { is_authenticated: true },
      },
    } as any);

    await useAuthStore.getState().restoreSession();

    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(mockUser);
  });

  it('handles restoreSession when session is dead/invalid: clears token and sets unauthenticated', async () => {
    tokenLib.setToken('expired_token');

    vi.mocked(authApi.get).mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          status: 401,
          data: { flows: [{ id: 'login' }, { id: 'signup' }] },
        },
      },
    });

    await useAuthStore.getState().restoreSession();

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
    expect(tokenLib.getToken()).toBeNull();
  });

  it('handles logout: calls backend, clears token and store state even if network fails', async () => {
    tokenLib.setToken('token_to_logout');
    useAuthStore.setState({
      user: { id: 1, username: 'user1' },
      token: 'token_to_logout',
      status: 'authenticated',
    });

    // Simulate backend network failure during logout
    vi.mocked(authApi.delete).mockRejectedValueOnce(new Error('Network error'));

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(tokenLib.getToken()).toBeNull();
  });
});
