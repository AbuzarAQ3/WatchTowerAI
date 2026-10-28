import api from '../lib/api';
import { isMockEnabled, mockDelay } from './config';
import { INITIAL_ALERTS } from './mock/alerts.mock';
import { toAlert } from './mappers';
import type { Alert } from '../types/domain';
import type { AlertApi, PaginatedResponse } from '../types/api';

let mockAlertsState: Alert[] = [...INITIAL_ALERTS];

/**
 * Fetch all alerts
 */
export async function getAlerts(): Promise<Alert[]> {
  if (isMockEnabled()) {
    await mockDelay();
    return [...mockAlertsState];
  }

  const response = await api.get<PaginatedResponse<AlertApi> | AlertApi[]>('/api/alerts/');
  const rawList = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return rawList.map(toAlert);
}

/**
 * Acknowledge an individual alert notification
 */
export async function acknowledgeAlert(id: string): Promise<Alert> {
  if (isMockEnabled()) {
    await mockDelay();
    mockAlertsState = mockAlertsState.map((a) =>
      a.id === id ? { ...a, acknowledged: true } : a
    );
    const found = mockAlertsState.find((a) => a.id === id);
    if (!found) {
      throw new Error(`Alert ${id} not found`);
    }
    return found;
  }

  const response = await api.patch<AlertApi>(`/api/alerts/${id}/`, {
    acknowledged: true,
  });
  return toAlert(response.data);
}

/**
 * Acknowledge all active alerts at once
 */
export async function acknowledgeAllAlerts(): Promise<void> {
  if (isMockEnabled()) {
    await mockDelay();
    mockAlertsState = mockAlertsState.map((a) => ({ ...a, acknowledged: true }));
    return;
  }

  await api.post('/api/alerts/acknowledge_all/');
}

/**
 * Dismiss / remove an alert notification
 * TODO: Connect to DELETE /api/alerts/:id/ when backend endpoint is ready.
 * Currently handled as a frontend-safe dismiss operation.
 */
export async function dismissAlert(id: string): Promise<void> {
  if (isMockEnabled()) {
    await mockDelay(100);
    mockAlertsState = mockAlertsState.filter((a) => a.id !== id);
    return;
  }

  // TODO: Uncomment once backend DELETE endpoint is implemented:
  // await api.delete(`/api/alerts/${id}/`);
}

/**
 * Reset mock state (useful for test resets)
 */
export function _resetMockAlerts(): void {
  mockAlertsState = [...INITIAL_ALERTS];
}
