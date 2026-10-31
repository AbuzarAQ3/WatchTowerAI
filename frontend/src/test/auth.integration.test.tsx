import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { server } from './server';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../App';
import { useAuthStore } from '../store/auth';
import * as tokenLib from '../lib/token';
import * as config from '../services/config';

describe('Auth Integration Tests (MSW + React Testing Library)', () => {
  const originalLocation = window.location;
  let locationHref = '';

  beforeAll(async () => {
    // Fail immediately if any unhandled request is executed
    server.listen({ onUnhandledRequest: 'error' });
    // Warm lazy chunks to prevent cold-start happy-dom timeouts in Scenario 1 and Scenario 12
    await import('../pages/Dashboard');
    await import('../pages/Cameras');
  });

  afterAll(() => {
    server.close();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  beforeEach(() => {
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);
    localStorage.clear();
    locationHref = '';
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        get href() {
          return locationHref;
        },
        set href(val: string) {
          locationHref = val;
        },
        pathname: '/login',
      },
    });

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
    server.resetHandlers();
  });

  it('Scenario 1: Login success — redirects to dashboard and stores session token', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId('login-username-input');
    const passwordInput = screen.getByTestId('login-password-input');
    fireEvent.change(usernameInput, { target: { value: 'abuzar' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });

    const submitBtn = screen.getByTestId('login-submit-button');
    await userEvent.click(submitBtn);

    expect(await screen.findByText(/Camera Feeds/i, {}, { timeout: 4000 })).toBeInTheDocument();

    expect(tokenLib.getToken()).toBe('session_token_success_123');
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.username).toBe('abuzar');
  });

  it('Scenario 2: Invalid credentials — renders inline error banner and stays on /login', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId('login-username-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitBtn = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'wrong_user' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPass!' } });

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Invalid username or password/i);
    });

    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(tokenLib.getToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('Scenario 3: Login with pending verification — redirects to /verify-email/pending', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId('login-username-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitBtn = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'pending_user' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Check Your Clearance Dispatch/i)).toBeInTheDocument();
    });

    expect(tokenLib.getToken()).toBe('session_token_pending_flow');
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().pendingFlows).toContain('verify_email');
  });

  it('Scenario 4: Signup success — redirects to /login with banner, then login succeeds to dashboard', async () => {
    let deleteSessionToken: string | null = null;
    server.use(
      http.delete('*/_allauth/app/v1/auth/session', ({ request }) => {
        deleteSessionToken = request.headers.get('X-Session-Token');
        return HttpResponse.json({ status: 200, data: {} });
      }),
      http.post('*/_allauth/app/v1/auth/login', async ({ request }) => {
        const body = (await request.json()) as any;
        if (body?.username === 'john_doe' && body?.password === 'StrongPassword123!') {
          return HttpResponse.json({
            status: 200,
            data: {
              user: { id: 2, username: 'john_doe', email: 'john@example.com' },
            },
            meta: {
              is_authenticated: true,
              session_token: 'session_token_john_login',
            },
          });
        }
        return HttpResponse.json(
          {
            status: 400,
            errors: [{ param: 'password', code: 'invalid_credentials', message: 'Invalid credentials' }],
          },
          { status: 400 }
        );
      })
    );

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId('signup-username-input');
    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const submitBtn = screen.getByTestId('signup-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'john_doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    await userEvent.click(submitBtn);

    // 1. Should navigate to /login and show banner
    const banner = await screen.findByTestId('registered-success-banner');
    expect(banner).toHaveTextContent('Account created. Please log in.');

    // 2. DELETE /auth/session was called with X-Session-Token from signup
    expect(deleteSessionToken).toBe('session_token_signup_success');

    // 3. User is unauthenticated and token is cleared
    expect(tokenLib.getToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');

    // 4. On login form, username is prefilled from state, password is empty
    const loginUser = screen.getByTestId('login-username-input') as HTMLInputElement;
    const loginPass = screen.getByTestId('login-password-input') as HTMLInputElement;
    expect(loginUser.value).toBe('john_doe');
    expect(loginPass.value).toBe('');

    // 5. Now log in with password
    fireEvent.change(loginPass, { target: { value: 'StrongPassword123!' } });
    const loginSubmitBtn = screen.getByTestId('login-submit-button');
    await userEvent.click(loginSubmitBtn);

    // 6. Should navigate to dashboard
    expect(await screen.findByText(/Camera Feeds/i, {}, { timeout: 4000 })).toBeInTheDocument();
    expect(tokenLib.getToken()).toBe('session_token_john_login');
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.username).toBe('john_doe');
  });

  it('Scenario 5: Signup pending verification — navigates to /verify-email/pending with email', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId('signup-username-input');
    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const submitBtn = screen.getByTestId('signup-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'new_pending_user' } });
    fireEvent.change(emailInput, { target: { value: 'pending@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Check Your Clearance Dispatch/i)).toBeInTheDocument();
      expect(screen.getByText(/pending@example.com/i)).toBeInTheDocument();
    });

    expect(useAuthStore.getState().pendingFlows).toContain('verify_email');
  });

  it('Scenario 6: Session restore with valid token — restores session and stays on dashboard', async () => {
    tokenLib.setToken('valid_token');
    useAuthStore.setState({ token: 'valid_token', status: 'loading' });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Camera Feeds/i, {}, { timeout: 4000 })).toBeInTheDocument();

    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.username).toBe('abuzar');
  });

  it('Scenario 7: Session restore with expired token — clears token and redirects to /login', async () => {
    tokenLib.setToken('expired_token');
    useAuthStore.setState({ token: 'expired_token', status: 'loading' });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    });

    expect(tokenLib.getToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('Scenario 8: Session restore with pending-flow token — retains token, status remains unauthenticated, redirects to /verify-email/pending', async () => {
    tokenLib.setToken('pending_flow_token');
    useAuthStore.setState({ token: 'pending_flow_token', status: 'loading' });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Must be redirected to /verify-email/pending because of pending verify_email flow
      expect(screen.getByRole('heading', { name: /Check Your Clearance Dispatch/i })).toBeInTheDocument();
    });

    // Token MUST be preserved for pending flows!
    expect(tokenLib.getToken()).toBe('pending_flow_token');
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().pendingFlows).toContain('verify_email');
  });

  it('Scenario 9: Logout — calls backend, clears token, and updates store state', async () => {
    tokenLib.setToken('valid_token');
    useAuthStore.setState({
      token: 'valid_token',
      status: 'authenticated',
      user: { id: 1, username: 'abuzar' },
    });

    await useAuthStore.getState().logout();

    expect(tokenLib.getToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('Scenario 10: Email verification with valid key — renders success state', async () => {
    render(
      <MemoryRouter initialEntries={['/account/verify-email/valid_key_123']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/VERIFICATION COMPLETE/i)).toBeInTheDocument();
      expect(screen.getByText(/Email Address Verified/i)).toBeInTheDocument();
    });
  });

  it('Scenario 11: Email verification with invalid key — renders expired/invalid state', async () => {
    render(
      <MemoryRouter initialEntries={['/account/verify-email/invalid_key_999']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/This verification link is invalid or has expired/i)).toBeInTheDocument();
    });
  });

  it('Scenario 12: Protected route access while unauthenticated — redirects to /login with state.from, then redirects back to target after login', async () => {
    render(
      <MemoryRouter initialEntries={['/cameras']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Initial check: unauthenticated operator lands on login
    await waitFor(() => {
      expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    });

    const usernameInput = screen.getByTestId('login-username-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitBtn = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'abuzar' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    await userEvent.click(submitBtn);

    // Once authorized, should follow state.from and redirect to /cameras
    await waitFor(() => {
      expect(screen.getAllByRole('heading', { level: 1, name: /Cameras/i }).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Manage and monitor camera feeds/i)).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('Scenario 13: X-Session-Token header assertion inside MSW handler', async () => {
    let capturedHeader: string | null = 'not_called';

    // Override GET /auth/session handler to inspect header
    server.use(
      http.get('*/_allauth/app/v1/auth/session', ({ request }) => {
        capturedHeader = request.headers.get('X-Session-Token');
        return HttpResponse.json({
          status: 200,
          data: { user: { id: 1 } },
          meta: { is_authenticated: true },
        });
      })
    );

    // Case A: token exists in storage -> X-Session-Token header sent
    tokenLib.setToken('assert_test_token_123');
    await useAuthStore.getState().restoreSession();
    expect(capturedHeader).toBe('assert_test_token_123');

    // Case B: token cleared in storage -> X-Session-Token header NOT sent
    tokenLib.clearToken();
    capturedHeader = 'not_called';
    await useAuthStore.getState().restoreSession();
    expect(capturedHeader).toBe('not_called'); // restoreSession returns early without calling API when !token
  });

  it('Scenario 14: Email verification with invalid_or_expired_key (400) — renders expired state', async () => {
    server.use(
      http.post('*/_allauth/app/v1/auth/email/verify', () => {
        return HttpResponse.json(
          {
            status: 400,
            errors: [
              {
                param: 'key',
                code: 'invalid_or_expired_key',
                message: 'This verification link is invalid or has expired.',
              },
            ],
          },
          { status: 400 }
        );
      })
    );

    render(
      <MemoryRouter initialEntries={['/account/verify-email/expired_token_abc']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/LINK EXPIRED OR INVALID/i)).toBeInTheDocument();
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Register a New Account/i })).toBeInTheDocument();
    });
  });

  it('Scenario 15: Email verification with malformed/whitespace key — client-side check shows invalid state without API call', async () => {
    let apiCalled = false;
    server.use(
      http.post('*/_allauth/app/v1/auth/email/verify', () => {
        apiCalled = true;
        return HttpResponse.json({ status: 200 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/account/verify-email/%20']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/MALFORMED LINK/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid Verification Link/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Return to Operator Login/i })).toBeInTheDocument();
    });

    expect(apiCalled).toBe(false);
  });

  it('Scenario 16: Pending-flow token refresh — visiting /verify-email/pending without pendingEmail does not crash', async () => {
    tokenLib.setToken('pending_flow_token');
    useAuthStore.setState({
      token: 'pending_flow_token',
      status: 'unauthenticated',
      pendingFlows: ['verify_email'],
      pendingEmail: null,
    });

    render(
      <MemoryRouter initialEntries={['/verify-email/pending']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Check Your Clearance Dispatch/i })).toBeInTheDocument();
      expect(screen.getByText(/your registered email/i)).toBeInTheDocument();
    });

    expect(useAuthStore.getState().pendingFlows).toContain('verify_email');
  });

  it('Scenario 17: Network error (HttpResponse.error()) on login — renders retry-able banner and retains form values', async () => {
    server.use(
      http.post('*/_allauth/app/v1/auth/login', () => {
        return HttpResponse.error();
      })
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId('login-username-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement;
    const submitBtn = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'network_user' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretPass123!' } });

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Form values MUST NOT be cleared on network failure
    expect(usernameInput.value).toBe('network_user');
    expect(passwordInput.value).toBe('SecretPass123!');

    // Submit button re-enabled for retry
    expect(submitBtn).not.toBeDisabled();
    expect(submitBtn).toHaveAttribute('aria-busy', 'false');
  });

  it('Scenario 18: Login button in-flight disabled and aria-busy set', async () => {
    let resolveLogin: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    server.use(
      http.post('*/_allauth/app/v1/auth/login', async () => {
        await pendingPromise;
        return HttpResponse.json({
          status: 200,
          data: { user: { id: 1, username: 'abuzar' } },
          meta: { is_authenticated: true, session_token: 'session_token_18' },
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId('login-username-input');
    const passwordInput = screen.getByTestId('login-password-input');
    fireEvent.change(usernameInput, { target: { value: 'abuzar' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });

    const submitBtn = screen.getByTestId('login-submit-button');

    // Trigger click without waiting for completion
    fireEvent.click(submitBtn);

    // In-flight state: button must be disabled and aria-busy must be true
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('aria-busy', 'true');

    // Release promise to let request finish
    resolveLogin!({});

    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe('authenticated');
    });
  });
});
