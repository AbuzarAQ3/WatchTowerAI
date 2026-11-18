import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './auth';
import { authApi } from '../lib/api';
import * as tokenLib from '../lib/token';
import * as config from '../services/config';

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
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);
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

  it('handles restoreSession when pending flow exists (e.g. verify_email): preserves token, sets pendingFlows, status remains unauthenticated', async () => {
    tokenLib.setToken('pending_flow_token_123');

    vi.mocked(authApi.get).mockRejectedValueOnce({
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
        },
      },
    });

    await useAuthStore.getState().restoreSession();

    const state = useAuthStore.getState();
    // Status must remain unauthenticated (never authenticated)
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
    // Token must be preserved (NOT cleared)
    expect(state.token).toBe('pending_flow_token_123');
    expect(tokenLib.getToken()).toBe('pending_flow_token_123');
    expect(state.pendingFlows).toContain('verify_email');
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

  it('handles logout when backend returns 401: cleanly clears token and resets store state', async () => {
    tokenLib.setToken('token_to_logout_401');
    useAuthStore.setState({
      user: { id: 1, username: 'user1' },
      token: 'token_to_logout_401',
      status: 'authenticated',
    });

    // Simulate backend returning 401 on session delete
    vi.mocked(authApi.delete).mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: 'Session expired' },
      },
    });

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(tokenLib.getToken()).toBeNull();
  });

  it('supports mock mode: login succeeds for seeded demo user without calling API', async () => {
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(true);
    const result = await useAuthStore.getState().login('demo', 'Demo@1234');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.user.username).toBe('demo');
    }
    expect(authApi.post).not.toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(tokenLib.getToken()).toBe('mock-session-token-demo');
  });

  it('supports mock mode: login fails with 400 invalid_credentials for unregistered users or wrong password', async () => {
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(true);
    const resultUnregistered = await useAuthStore.getState().login('random_user', 'any');
    expect(resultUnregistered.kind).toBe('error');
    if (resultUnregistered.kind === 'error') {
      expect(resultUnregistered.errors[0].code).toBe('invalid_credentials');
    }

    const resultWrongPass = await useAuthStore.getState().login('demo', 'WrongPassword');
    expect(resultWrongPass.kind).toBe('error');
    if (resultWrongPass.kind === 'error') {
      expect(resultWrongPass.errors[0].code).toBe('invalid_credentials');
    }

    expect(authApi.post).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(tokenLib.getToken()).toBeNull();
  });

  it('supports mock mode: signup registers user in mockUsersDb, leaves unauthenticated, and subsequent login succeeds', async () => {
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(true);
    const signupResult = await useAuthStore.getState().signup({
      username: 'new_pilot',
      email: 'pilot@mock.local',
      password: 'PilotPass123!',
    });
    expect(signupResult.kind).toBe('success');
    if (signupResult.kind === 'success') {
      expect(signupResult.user.username).toBe('new_pilot');
    }

    // Should NOT be authenticated after signup
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(tokenLib.getToken()).toBeNull();

    // Now login with new credentials
    const loginResult = await useAuthStore.getState().login('new_pilot', 'PilotPass123!');
    expect(loginResult.kind).toBe('success');
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(tokenLib.getToken()).toBe('mock-session-token-new_pilot');
  });

  it('handles real mode signup: invalidates session via DELETE /auth/session, clears token, leaves unauthenticated', async () => {
    const mockUser = { id: 5, username: 'agent007', email: 'agent@wt.local' };
    const mockSessionToken = 'session_signup_token_777';

    vi.mocked(authApi.post).mockResolvedValueOnce({
      data: {
        status: 200,
        data: { user: mockUser },
        meta: { is_authenticated: true, session_token: mockSessionToken },
      },
    } as any);

    let tokenDuringDelete: string | null = null;
    vi.mocked(authApi.delete).mockImplementationOnce(async () => {
      tokenDuringDelete = tokenLib.getToken();
      return { data: { status: 200 } } as any;
    });

    const result = await useAuthStore.getState().signup({
      username: 'agent007',
      email: 'agent@wt.local',
      password: 'AgentPass123!',
    });

    expect(result.kind).toBe('success');
    expect(authApi.post).toHaveBeenCalledWith('/auth/signup', {
      username: 'agent007',
      email: 'agent@wt.local',
      password: 'AgentPass123!',
    });
    // Invalidation called DELETE /auth/session with token set in storage
    expect(authApi.delete).toHaveBeenCalledWith('/auth/session');
    expect(tokenDuringDelete).toBe(mockSessionToken);

    // After signup, token is cleared and status is unauthenticated
    expect(tokenLib.getToken()).toBeNull();
    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
