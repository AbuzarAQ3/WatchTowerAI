import api from '../lib/api';
import { isMockEnabled, mockDelay } from './config';
import { INITIAL_INCIDENTS, DASHBOARD_INCIDENTS } from './mock/incidents.mock';
import { toIncident } from './mappers';
import type { Incident } from '../types/domain';
import type { IncidentApi, PaginatedResponse } from '../types/api';

let mockIncidentsState: Incident[] = [...INITIAL_INCIDENTS];
let mockDashboardIncidentsState: Incident[] = [...DASHBOARD_INCIDENTS];

export interface IncidentFilterParams {
  search?: string;
  severity?: string;
  status?: string;
}

/**
 * Fetch all incidents with optional filter params
 */
export async function getIncidents(params?: IncidentFilterParams): Promise<Incident[]> {
  if (isMockEnabled()) {
    await mockDelay();
    let result = [...mockIncidentsState];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.camera.toLowerCase().includes(q)
      );
    }
    if (params?.severity && params.severity !== 'all') {
      result = result.filter((i) => i.severity === params.severity);
    }
    if (params?.status && params.status !== 'all') {
      result = result.filter((i) => i.status === params.status);
    }

    return result;
  }

  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set('search', params.search);
  if (params?.severity && params.severity !== 'all') queryParams.set('severity', params.severity);
  if (params?.status && params.status !== 'all') queryParams.set('status', params.status);

  const url = `/api/incidents/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get<PaginatedResponse<IncidentApi> | IncidentApi[]>(url);
  const rawList = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return rawList.map(toIncident);
}

/**
 * Fetch recent incidents for the dashboard feed (ordered by detection time descending)
 */
export async function getRecentIncidents(limit = 5): Promise<Incident[]> {
  if (isMockEnabled()) {
    await mockDelay();
    return [...mockDashboardIncidentsState].slice(0, limit);
  }

  const response = await api.get<PaginatedResponse<IncidentApi> | IncidentApi[]>(
    `/api/incidents/?ordering=-detected_at&page_size=${limit}`
  );
  const rawList = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return rawList.map(toIncident);
}

/**
 * Cycle / update incident workflow status
 */
export async function updateIncidentStatus(
  id: string,
  newStatus: Incident['status']
): Promise<Incident> {
  if (isMockEnabled()) {
    await mockDelay();
    mockIncidentsState = mockIncidentsState.map((inc) =>
      inc.id === id ? { ...inc, status: newStatus } : inc
    );
    mockDashboardIncidentsState = mockDashboardIncidentsState.map((inc) =>
      inc.id === id ? { ...inc, status: newStatus } : inc
    );

    const found = mockIncidentsState.find((i) => i.id === id);
    if (!found) {
      throw new Error(`Incident ${id} not found`);
    }
    return found;
  }

  const response = await api.patch<IncidentApi>(`/api/incidents/${id}/`, {
    status: newStatus,
  });
  return toIncident(response.data);
}

/**
 * Reset mock state (useful for test resets)
 */
export function _resetMockIncidents(): void {
  mockIncidentsState = [...INITIAL_INCIDENTS];
  mockDashboardIncidentsState = [...DASHBOARD_INCIDENTS];
}
