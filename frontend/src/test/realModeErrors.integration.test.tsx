import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { server } from './server';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../App';
import { useAuthStore } from '../store/auth';
import * as tokenLib from '../lib/token';
import Dashboard from '../pages/Dashboard';
import Cameras from '../pages/Cameras';
import Incidents from '../pages/Incidents';
import Alerts from '../pages/Alerts';

describe('Real Mode (VITE_USE_MOCK=false) Resilience & Error Banners', () => {
  const originalLocation = window.location;
  let locationHref = '';

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  beforeEach(() => {
    vi.stubEnv('VITE_USE_MOCK', 'false');
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
        pathname: '/dashboard',
      },
    });

    tokenLib.setToken('real_mode_valid_token');
    useAuthStore.setState({
      token: 'real_mode_valid_token',
      status: 'authenticated',
      user: { id: 1, username: 'operator' },
      pendingFlows: [],
      pendingEmail: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    server.resetHandlers();
    tokenLib.clearToken();
  });

  it('Dashboard: displays error banner and retry button when /api/stats/ fails (500), and recovers on retry', async () => {
    let returnError = true;

    server.use(
      http.get('*/api/stats*', () => {
        if (returnError) {
          return HttpResponse.json({ detail: 'Internal stats engine failure' }, { status: 500 });
        }
        return HttpResponse.json({
          cameras_online: 8,
          cameras_total: 10,
          incidents_today: 4,
          active_alerts: 1,
          system_health: 95,
          hourly_incidents: [0, 1, 2, 0, 1, 3, 2, 4, 1, 2, 5, 4, 3, 2, 1, 0, 2, 3, 4, 2, 1, 2, 3, 1],
        });
      }),
      http.get('*/api/cameras*', () => HttpResponse.json([])),
      http.get('*/api/incidents*', () => HttpResponse.json([]))
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert error banner appears without crashing
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    // Toggle mock to return success and click Retry
    returnError = false;
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryBtn);

    // Dashboard recovers cleanly
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText(/Cameras Online/i)).toBeInTheDocument();
    });
  });

  it('Cameras: displays error banner and retry button on 404 response without crashing', async () => {
    server.use(
      http.get('*/api/cameras*', () => {
        return HttpResponse.json({ detail: 'Endpoint not found' }, { status: 404 });
      })
    );

    render(
      <MemoryRouter>
        <Cameras />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('Incidents: displays error banner and retry button on 500 server error', async () => {
    server.use(
      http.get('*/api/incidents*', () => {
        return HttpResponse.json({ detail: 'Database connection failed' }, { status: 500 });
      })
    );

    render(
      <MemoryRouter>
        <Incidents />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('Alerts: displays error banner on network failure (HttpResponse.error()) without crashing', async () => {
    server.use(
      http.get('*/api/alerts*', () => {
        return HttpResponse.error();
      })
    );

    render(
      <MemoryRouter>
        <Alerts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('Real Mode 401: /api/cameras/ returns 401 without pending flows -> clears token and redirects to /login', async () => {
    server.use(
      http.get('*/api/cameras*', () => {
        return HttpResponse.json(
          { detail: 'Session expired or invalid authentication token.' },
          { status: 401 }
        );
      })
    );

    render(
      <MemoryRouter>
        <Cameras />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(tokenLib.getToken()).toBeNull();
      expect(locationHref).toBe('/login');
    });
  });
});
