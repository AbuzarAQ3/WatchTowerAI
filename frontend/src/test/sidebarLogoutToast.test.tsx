import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ToastProvider } from '../components/Toast/ToastContext';
import { useAuthStore } from '../store/auth';

describe('Sidebar Logout and Toast Notification', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useAuthStore.setState({
      user: { id: 1, username: 'officer_test' },
      token: 'session_active_123',
      status: 'authenticated',
      pendingFlows: [],
      pendingEmail: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    useAuthStore.setState({
      user: null,
      token: null,
      status: 'unauthenticated',
      pendingFlows: [],
      pendingEmail: null,
    });
  });

  it('triggers "Logged out successfully" toast on logout button click, and auto-dismisses after 4 seconds', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <Sidebar />
        </ToastProvider>
      </MemoryRouter>
    );

    // Initial state: no toast visible
    expect(screen.queryByText('Logged out successfully')).not.toBeInTheDocument();

    const logoutButton = screen.getByTestId('sidebar-logout');
    expect(logoutButton).toBeInTheDocument();

    // Click logout
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // Verify toast is rendered with the exact message from ToastContext
    const toastMessage = screen.getByText('Logged out successfully');
    expect(toastMessage).toBeInTheDocument();

    // Verify the container has aria-live="polite"
    const liveContainer = toastMessage.closest('[aria-live="polite"]');
    expect(liveContainer).toBeInTheDocument();

    // Advance timers by 4000ms (auto-dismiss duration)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Toast should be dismissed
    expect(screen.queryByText('Logged out successfully')).not.toBeInTheDocument();
  });
});
