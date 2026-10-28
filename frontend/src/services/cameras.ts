import api from '../lib/api';
import { isMockEnabled, mockDelay } from './config';
import { INITIAL_CAMERAS } from './mock/cameras.mock';
import { toCamera } from './mappers';
import type { Camera } from '../types/domain';
import type { CameraApi, PaginatedResponse } from '../types/api';

// In-memory mock store to persist mutations across UI operations in dev mode
let mockCamerasState: Camera[] = [...INITIAL_CAMERAS];

export interface CreateCameraInput {
  name: string;
  zone: string;
  ip: string;
  fps: number;
  status: 'live' | 'offline' | 'maintenance';
}

/**
 * Fetch list of all campus cameras
 */
export async function getCameras(): Promise<Camera[]> {
  if (isMockEnabled()) {
    await mockDelay();
    return [...mockCamerasState];
  }

  const response = await api.get<PaginatedResponse<CameraApi> | CameraApi[]>('/api/cameras/');
  const rawList = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return rawList.map(toCamera);
}

/**
 * Register a new camera endpoint
 */
export async function createCamera(input: CreateCameraInput): Promise<Camera> {
  if (isMockEnabled()) {
    await mockDelay();
    const newCam: Camera = {
      id: Date.now(),
      name: input.name,
      zone: input.zone,
      ip: input.ip,
      fps: input.fps,
      status: input.status,
    };
    mockCamerasState = [...mockCamerasState, newCam];
    return newCam;
  }

  const payload = {
    name: input.name,
    zone: input.zone,
    location: input.ip,
    fps: input.fps,
    status: input.status,
  };

  const response = await api.post<CameraApi>('/api/cameras/', payload);
  return toCamera(response.data);
}

/**
 * Reset mock state (useful for test resets)
 */
export function _resetMockCameras(): void {
  mockCamerasState = [...INITIAL_CAMERAS];
}
