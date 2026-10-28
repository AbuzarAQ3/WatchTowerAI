/**
 * Backend API Contract Types (snake_case representation matching Django REST Framework serializers)
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CameraApi {
  id: number | string;
  name: string;
  location?: string;
  zone: string;
  stream_url?: string;
  status: 'live' | 'offline' | 'maintenance';
  fps: number;
  last_seen?: string;
  created_at?: string;
}

export interface IncidentApi {
  id: string;
  camera: number | string;
  camera_name: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'reviewing' | 'resolved';
  confidence: number | string;
  snapshot?: string | null;
  detected_at: string;
  notes?: string;
}

export interface AlertApi {
  id: string;
  incident?: string | null;
  camera_name: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  acknowledged: boolean;
  created_at: string;
}

export interface StatsApi {
  cameras_online: number;
  cameras_total: number;
  incidents_today: number;
  active_alerts: number;
  system_health: number;
  hourly_incidents: number[]; // 24 numbers representing hourly count across the day
}
