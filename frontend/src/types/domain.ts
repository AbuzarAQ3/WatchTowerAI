/**
 * Frontend Domain / UI Models (used across React components and views)
 */

export interface Camera {
  id: number | string;
  name: string;
  zone: string;
  ip: string;
  location?: string;
  fps: number;
  status: 'live' | 'offline' | 'maintenance';
  lastSeen?: string | null;
  isPlaying?: boolean;
  showDetections?: boolean;
}

export interface CameraBox {
  top: string;
  left: string;
  width: string;
  height: string;
  label: string;
}

export interface Incident {
  id: string;
  type: string;
  camera: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'reviewing' | 'resolved';
  confidence: string | number;
  snapshot?: string | null;
}

export interface Alert {
  id: string;
  title: string;
  desc: string;
  camera: string;
  time: string;
  level: 'high' | 'medium' | 'low';
  acknowledged: boolean;
}

export type StatAccent = 'cyan' | 'danger' | 'amber' | 'success' | 'info';

export interface StatMetric {
  label: string;
  value: string;
  sub: string;
  accent: StatAccent;
  trend: string;
}

export interface IncidentTrendPoint {
  time: string;
  total: number;
  high: number;
}

export interface DashboardStats {
  metrics: StatMetric[];
  chartData: IncidentTrendPoint[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
