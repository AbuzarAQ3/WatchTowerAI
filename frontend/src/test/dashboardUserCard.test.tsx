import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { useAuthStore } from '../store/auth';
import { server } from './server';

describe('Dashboard User Card (Real Mode vs Mock Mode)', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: 'test_token',
      status: 'authenticated',
      pendingFlows: [],
      pendingEmail: null,
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      status: 'unauthenticated',
      pendingFlows: [],
      pendingEmail: null,
    });
    vi.unstubAllEnvs();
    server.resetHandlers();
  });

  it('Real Mode: renders real user attributes (using allauth display and username), Authenticated status, and hides mock strings', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false');

    useAuthStore.setState({
      user: {
        id: 101,
        username: 'operator_bravo',
        display: 'Bravo Commander',
        email: 'bravo@watchtower.agency',
        assigned_cameras: 5,
      },
      status: 'authenticated',
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const userCard = await screen.findByTestId('user-card');
    expect(userCard).toBeInTheDocument();

    const usernameEl = screen.getByTestId('user-card-username');
    expect(usernameEl).toHaveTextContent('Bravo Commander');

    const emailEl = screen.getByTestId('user-card-email');
    expect(emailEl).toHaveTextContent('bravo@watchtower.agency');

    const statusEl = screen.getByTestId('user-card-status');
    expect(statusEl).toHaveTextContent('Authenticated');

    const idEl = screen.getByTestId('user-card-id');
    expect(idEl).toHaveTextContent('ID: 101');

    expect(screen.getByText(/5 Cameras Assigned/i)).toBeInTheDocument();

    // Verify hardcoded mock strings NEVER leak into Real Mode
    expect(screen.queryByText('mock-1')).not.toBeInTheDocument();
    expect(screen.queryByText(/Anuj/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/anuj@test\.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/WT-001/i)).not.toBeInTheDocument();
  });

  it('Real Mode: displays N/A for missing fields and hides assigned cameras when field is absent', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false');

    // User without display, email, id, or assigned_cameras
    useAuthStore.setState({
      user: {
        username: 'minimal_operator',
      },
      status: 'authenticated',
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const userCard = await screen.findByTestId('user-card');
    expect(userCard).toBeInTheDocument();

    expect(screen.getByTestId('user-card-username')).toHaveTextContent('minimal_operator');
    expect(screen.getByTestId('user-card-email')).toHaveTextContent('N/A');
    expect(screen.getByTestId('user-card-id')).toHaveTextContent('ID: N/A');
    expect(screen.getByTestId('user-card-status')).toHaveTextContent('Authenticated');

    // Assigned cameras section must be hidden when user object does not have assigned_cameras field
    expect(screen.queryByText(/Cameras Assigned/i)).not.toBeInTheDocument();

    // Mock strings should not appear
    expect(screen.queryByText('mock-1')).not.toBeInTheDocument();
    expect(screen.queryByText(/Anuj/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/anuj@test\.com/i)).not.toBeInTheDocument();
  });

  it('Mock Mode: renders mock strings when VITE_USE_MOCK is true', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true');

    useAuthStore.setState({
      user: null,
      status: 'authenticated',
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const userCard = await screen.findByTestId('user-card');
    expect(userCard).toBeInTheDocument();

    expect(screen.getByTestId('user-card-username')).toHaveTextContent(/mock/i);
    expect(screen.getByTestId('user-card-email')).toHaveTextContent(/mock/i);
    expect(screen.getByTestId('user-card-id')).toHaveTextContent(/mock-1/i);
    expect(screen.getByTestId('user-card-status')).toHaveTextContent('Active');
  });
});
