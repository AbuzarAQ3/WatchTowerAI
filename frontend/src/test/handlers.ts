import { http, HttpResponse } from 'msw';

export const handlers = [
  // POST /auth/login
  http.post('*/_allauth/app/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as any;
    const { username, password } = body || {};

    if (username === 'abuzar' && password === 'StrongPass123!') {
      return HttpResponse.json({
        status: 200,
        data: {
          user: { id: 1, username: 'abuzar', email: 'abuzar@example.com' },
        },
        meta: {
          is_authenticated: true,
          session_token: 'session_token_success_123',
        },
      });
    }

    if (username === 'pending_user') {
      return HttpResponse.json(
        {
          status: 401,
          data: {
            flows: [
              { id: 'login' },
              { id: 'signup' },
              { id: 'verify_email', is_pending: true },
            ],
          },
          meta: {
            is_authenticated: false,
            session_token: 'session_token_pending_flow',
          },
        },
        { status: 401 }
      );
    }

    // Invalid credentials (400)
    return HttpResponse.json(
      {
        status: 400,
        errors: [
          {
            param: 'password',
            code: 'invalid_credentials',
            message: 'Invalid username or password.',
          },
        ],
      },
      { status: 400 }
    );
  }),

  // POST /auth/signup
  http.post('*/_allauth/app/v1/auth/signup', async ({ request }) => {
    const body = (await request.json()) as any;
    const { username, email } = body || {};

    if (username === 'new_pending_user' || email === 'pending@example.com') {
      return HttpResponse.json(
        {
          status: 401,
          data: {
            flows: [{ id: 'verify_email', is_pending: true }],
          },
          meta: {
            is_authenticated: false,
            session_token: 'session_token_signup_pending',
          },
        },
        { status: 401 }
      );
    }

    if (username === 'error_user') {
      return HttpResponse.json(
        {
          status: 400,
          errors: [
            {
              param: 'username',
              code: 'username_taken',
              message: 'A user with that username already exists.',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Successful signup with auto-login (verification optional)
    return HttpResponse.json({
      status: 200,
      data: {
        user: { id: 2, username, email },
      },
      meta: {
        is_authenticated: true,
        session_token: 'session_token_signup_success',
      },
    });
  }),

  // GET /auth/session
  http.get('*/_allauth/app/v1/auth/session', ({ request }) => {
    const token = request.headers.get('X-Session-Token');

    if (token === 'valid_token' || token === 'assert_test_token_123') {
      return HttpResponse.json({
        status: 200,
        data: {
          user: { id: 1, username: 'abuzar', email: 'abuzar@example.com' },
        },
        meta: {
          is_authenticated: true,
          session_token: token,
        },
      });
    }

    if (token === 'pending_flow_token') {
      return HttpResponse.json(
        {
          status: 401,
          data: {
            flows: [
              { id: 'login' },
              { id: 'signup' },
              { id: 'verify_email', is_pending: true },
            ],
          },
          meta: {
            is_authenticated: false,
            session_token: 'pending_flow_token',
          },
        },
        { status: 401 }
      );
    }

    // Expired or invalid token (dead session)
    return HttpResponse.json(
      {
        status: 401,
        data: {
          flows: [{ id: 'login' }, { id: 'signup' }],
        },
        meta: {
          is_authenticated: false,
        },
      },
      { status: 401 }
    );
  }),

  // DELETE /auth/session (Logout)
  http.delete('*/_allauth/app/v1/auth/session', () => {
    return HttpResponse.json({
      status: 200,
      data: {},
    });
  }),

  // POST /auth/email/verify
  http.post('*/_allauth/app/v1/auth/email/verify', async ({ request }) => {
    const body = (await request.json()) as any;
    const { key } = body || {};

    if (key === 'valid_key_123') {
      return HttpResponse.json({
        status: 200,
        data: {
          user: { id: 1, username: 'verified_user' },
        },
        meta: {
          is_authenticated: true,
          session_token: 'token_verified_123',
        },
      });
    }

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
  }),

  // Mock dashboard fallback endpoints in case full dashboard mounts
  http.get('*/api/stats', () => {
    return HttpResponse.json({
      cameras_online: 12,
      cameras_total: 15,
      incidents_today: 7,
      active_alerts: 3,
      system_health: 98,
      hourly_incidents: [0, 1, 2, 0, 1, 3, 2, 4, 1, 2, 5, 4, 3, 2, 1, 0, 2, 3, 4, 2, 1, 2, 3, 1],
    });
  }),
  http.get('*/api/stats/', () => {
    return HttpResponse.json({
      cameras_online: 12,
      cameras_total: 15,
      incidents_today: 7,
      active_alerts: 3,
      system_health: 98,
      hourly_incidents: [0, 1, 2, 0, 1, 3, 2, 4, 1, 2, 5, 4, 3, 2, 1, 0, 2, 3, 4, 2, 1, 2, 3, 1],
    });
  }),

  http.get('*/api/cameras', () => {
    return HttpResponse.json([]);
  }),
  http.get('*/api/cameras/', () => {
    return HttpResponse.json([]);
  }),

  http.get('*/api/incidents', () => {
    return HttpResponse.json([]);
  }),
  http.get('*/api/incidents/', () => {
    return HttpResponse.json([]);
  }),

  http.get('*/api/alerts', () => {
    return HttpResponse.json([]);
  }),
  http.get('*/api/alerts/', () => {
    return HttpResponse.json([]);
  }),
];
