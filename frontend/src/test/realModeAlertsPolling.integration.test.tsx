import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { server } from './server';
import { http, HttpResponse } from 'msw';
import Alerts from '../pages/Alerts';
import { ToastProvider } from '../components/Toast';
import * as config from '../services/config';
import type { AlertApi } from '../types/api';

const mockAlert1: AlertApi = {
  id: 'alt-1',
  camera_name: 'Gate Cam 01',
  message: 'Perimeter breach north',
  priority: 'high',
  acknowledged: false,
  created_at: '2026-10-28T12:00:00Z',
};

const mockAlert2: AlertApi = {
  id: 'alt-2',
  camera_name: 'Parking Cam 04',
  message: 'Unauthorized vehicle detected',
  priority: 'medium',
  acknowledged: false,
  created_at: '2026-10-28T12:05:00Z',
};

describe('Alerts Page: Real-Mode Background Polling (MSW Integration)', () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.useRealTimers();
  });

  it('automatically fetches and displays newly detected alert on 10s background poll in real mode', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    let currentAlerts: AlertApi[] = [mockAlert1];

    server.use(
      http.get('*/api/alerts/*', () => {
        return HttpResponse.json(currentAlerts);
      })
    );

    render(
      <ToastProvider>
        <Alerts />
      </ToastProvider>
    );

    // Initial alert rendered
    expect((await screen.findAllByText('Perimeter breach north')).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('alt-2')).not.toBeInTheDocument();

    // Backend receives new alert
    currentAlerts = [mockAlert1, mockAlert2];

    // Advance by 10s for polling tick
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    // New alert now appears without user interaction
    expect((await screen.findAllByText('Unauthorized vehicle detected')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('alt-2')).toBeInTheDocument();
  });

  it('ensures dismissed alert does not reappear on subsequent background poll ticks', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const alertsFromBackend: AlertApi[] = [mockAlert1, mockAlert2];

    server.use(
      http.get('*/api/alerts/*', () => {
        return HttpResponse.json(alertsFromBackend);
      })
    );

    render(
      <ToastProvider>
        <Alerts />
      </ToastProvider>
    );

    expect((await screen.findAllByText('Perimeter breach north')).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText('Unauthorized vehicle detected')).length).toBeGreaterThanOrEqual(1);

    // User dismisses alert 1
    const dismissBtn = screen.getAllByLabelText('Dismiss Alert')[0];
    fireEvent.click(dismissBtn);

    // Alert 1 is removed
    expect(screen.queryByText('alt-1')).not.toBeInTheDocument();
    expect(screen.queryAllByText('Perimeter breach north')).toHaveLength(0);

    // Background poll runs after 10s, backend still serves alert 1 and alert 2
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    // Alert 1 MUST NOT reappear
    expect(screen.queryByText('alt-1')).not.toBeInTheDocument();
    expect(screen.queryAllByText('Perimeter breach north')).toHaveLength(0);
    expect(screen.getByText('alt-2')).toBeInTheDocument();
  });

  it('prevents an in-flight background poll from overwriting optimistic acknowledged state', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    server.use(
      http.get('*/api/alerts/*', () => {
        return HttpResponse.json([mockAlert1]);
      }),
      http.patch('*/api/alerts/alt-1/*', () => {
        return HttpResponse.json({ ...mockAlert1, acknowledged: true });
      })
    );

    render(
      <ToastProvider>
        <Alerts />
      </ToastProvider>
    );

    expect((await screen.findAllByText('Perimeter breach north')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Acknowledge')).toBeInTheDocument();

    // User clicks acknowledge
    const ackBtn = screen.getByText('Acknowledge');
    fireEvent.click(ackBtn);

    // Optimistically updated
    expect(screen.getByText(/Acknowledged/i)).toBeInTheDocument();

    // Background poll occurs after 10s with stale unacknowledged response
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    // Optimistic acknowledged status must remain preserved
    expect(screen.getByText(/Acknowledged/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Acknowledge$/)).not.toBeInTheDocument();
  });
});
