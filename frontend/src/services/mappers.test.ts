import { describe, it, expect } from 'vitest';
import { toCamera, toIncident, toAlert, toDashboardStats } from './mappers';
import type { CameraApi, IncidentApi, AlertApi, StatsApi } from '../types/api';

describe('Service Mappers', () => {
  it('maps CameraApi to Camera domain model', () => {
    const apiCam: CameraApi = {
      id: 42,
      name: 'Main Gate Cam',
      location: '192.168.1.100',
      zone: 'Entry',
      stream_url: 'rtsp://stream.local/1',
      status: 'live',
      fps: 30,
      last_seen: '2026-10-28T10:00:00Z',
      created_at: '2026-10-20T08:00:00Z',
    };

    const cam = toCamera(apiCam);
    expect(cam.id).toBe(42);
    expect(cam.name).toBe('Main Gate Cam');
    expect(cam.ip).toBe('192.168.1.100');
    expect(cam.zone).toBe('Entry');
    expect(cam.fps).toBe(30);
    expect(cam.status).toBe('live');
  });

  it('maps IncidentApi to Incident domain model', () => {
    const apiInc: IncidentApi = {
      id: 'INC-999',
      camera: 10,
      camera_name: 'Library Front',
      type: 'Loitering',
      severity: 'high',
      status: 'open',
      confidence: 0.942,
      snapshot: 'https://cdn.local/snaps/999.jpg',
      detected_at: '2026-10-28 11:30',
      notes: 'Repeated presence near window',
    };

    const inc = toIncident(apiInc);
    expect(inc.id).toBe('INC-999');
    expect(inc.camera).toBe('Library Front');
    expect(inc.type).toBe('Loitering');
    expect(inc.severity).toBe('high');
    expect(inc.status).toBe('open');
    expect(inc.confidence).toBe('0.94');
    expect(inc.snapshot).toBe('https://cdn.local/snaps/999.jpg');
    expect(inc.time).toBe('2026-10-28 11:30');
  });

  it('maps AlertApi to Alert domain model', () => {
    const apiAlert: AlertApi = {
      id: 'ALT-101',
      incident: 'INC-999',
      camera_name: 'Admin Block',
      message: 'Intrusion in unauthorized area',
      priority: 'high',
      acknowledged: false,
      created_at: '5 mins ago',
    };

    const alert = toAlert(apiAlert);
    expect(alert.id).toBe('ALT-101');
    expect(alert.title).toBe('Intrusion in unauthorized area');
    expect(alert.camera).toBe('Admin Block');
    expect(alert.level).toBe('high');
    expect(alert.acknowledged).toBe(false);
    expect(alert.time).toBe('5 mins ago');
  });

  it('maps StatsApi to DashboardStats model', () => {
    const apiStats: StatsApi = {
      cameras_online: 10,
      cameras_total: 12,
      incidents_today: 5,
      active_alerts: 2,
      system_health: 99,
      hourly_incidents: [0, 1, 0, 2, 3, 1, 0, 0, 4, 2, 1, 0, 5, 2, 1, 0, 6, 2, 1, 0, 4, 1, 0, 3],
    };

    const stats = toDashboardStats(apiStats);
    expect(stats.metrics).toHaveLength(4);
    expect(stats.metrics[0].label).toBe('Cameras Online');
    expect(stats.metrics[0].value).toBe('10');
    expect(stats.metrics[0].trend).toBe('10/12');
    expect(stats.metrics[1].value).toBe('5');
    expect(stats.metrics[2].value).toBe('2');
    expect(stats.metrics[3].value).toBe('99%');
    expect(stats.chartData.length).toBeGreaterThan(0);
    expect(stats.chartData[0].time).toBe('00:00');
  });
});
