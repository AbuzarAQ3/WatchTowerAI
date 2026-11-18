import { describe, it, expect } from 'vitest';
import { toCamera, toIncident, toAlert, toDashboardStats, sanitizeUrlOrIp, extractHostFromUrl } from './mappers';
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
    expect(cam.lastSeen).toBe('2026-10-28T10:00:00Z');
  });

  describe('Edge-case Mappings & Security Sanitization', () => {
    it('handles null and undefined snapshot in toIncident', () => {
      const baseApiInc: IncidentApi = {
        id: 'INC-NULL',
        camera: 1,
        camera_name: 'Zone A',
        type: 'Intrusion',
        severity: 'high',
        status: 'open',
        confidence: 0.9,
        detected_at: '2026-10-28',
      };

      const incWithNull = toIncident({ ...baseApiInc, snapshot: null });
      expect(incWithNull.snapshot).toBeNull();

      const incWithUndefined = toIncident({ ...baseApiInc, snapshot: undefined });
      expect(incWithUndefined.snapshot).toBeNull();
    });

    it('handles null and undefined last_seen in toCamera', () => {
      const baseApiCam: CameraApi = {
        id: 10,
        name: 'Perimeter Cam',
        zone: 'Perimeter',
        status: 'offline',
        fps: 20,
      };

      const camWithNull = toCamera({ ...baseApiCam, last_seen: null as any });
      expect(camWithNull.lastSeen).toBeNull();

      const camWithUndefined = toCamera({ ...baseApiCam, last_seen: undefined });
      expect(camWithUndefined.lastSeen).toBeNull();
    });

    it('handles empty results lists without crashing', () => {
      const emptyApiCameras: CameraApi[] = [];
      const mappedCameras = emptyApiCameras.map(toCamera);
      expect(mappedCameras).toEqual([]);

      const emptyApiIncidents: IncidentApi[] = [];
      const mappedIncidents = emptyApiIncidents.map(toIncident);
      expect(mappedIncidents).toEqual([]);
    });

    it('sanitizes RTSP URL containing username:password credentials', () => {
      const sanitized = sanitizeUrlOrIp('rtsp://admin:classifiedSecret123@192.168.1.50:554/s');
      expect(sanitized).toBe('rtsp://192.168.1.50:554/s');
      expect(sanitized).not.toContain('classifiedSecret123');
      expect(sanitized).not.toContain('admin:');
    });

    it('sanitizes user@host without scheme', () => {
      const sanitized = sanitizeUrlOrIp('operator:pass123@10.0.0.55');
      expect(sanitized).toBe('10.0.0.55');
      expect(sanitized).not.toContain('pass123');
      expect(sanitized).not.toContain('operator');

      const sanitizedUserOnly = sanitizeUrlOrIp('viewer@10.0.0.55');
      expect(sanitizedUserOnly).toBe('10.0.0.55');
      expect(sanitizedUserOnly).not.toContain('viewer');
    });

    it('sanitizes query-string secrets (token, password, key)', () => {
      const sanitized = sanitizeUrlOrIp('http://host:8080/s?token=secretToken123');
      expect(sanitized).toBe('http://host:8080/s');
      expect(sanitized).not.toContain('secretToken123');

      const sanitizedMulti = sanitizeUrlOrIp('http://host/s?fps=30&token=abc&key=xyz&channel=1');
      expect(sanitizedMulti).toBe('http://host/s?fps=30&channel=1');
      expect(sanitizedMulti).not.toContain('abc');
      expect(sanitizedMulti).not.toContain('xyz');
    });

    it('preserves plain text and clean IPs without modification', () => {
      expect(sanitizeUrlOrIp('Main Gate')).toBe('Main Gate');
      expect(sanitizeUrlOrIp('192.168.1.100')).toBe('192.168.1.100');
      expect(sanitizeUrlOrIp('Building B - Floor 2')).toBe('Building B - Floor 2');
    });

    it('prevents credentials in stream_url from leaking to Camera.ip domain model', () => {
      const apiCam: CameraApi = {
        id: 77,
        name: 'Secure Vault Cam',
        zone: 'Vault',
        stream_url: 'rtsp://vault_admin:superSecretKey99@192.168.1.88:554/live',
        status: 'live',
        fps: 30,
      };

      const cam = toCamera(apiCam);
      expect(cam.ip).toBe('192.168.1.88');
      expect(cam.ip).not.toContain('superSecretKey99');
      expect(cam.ip).not.toContain('vault_admin');
    });
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

  describe('Camera.ip Mapping Specific Cases', () => {
    it('Case 1: location="Main Gate" + stream_url=rtsp://192.168.1.10/stream yields IP="192.168.1.10" and Location="Main Gate"', () => {
      const apiCam: CameraApi = {
        id: 101,
        name: 'Gate Camera',
        zone: 'Perimeter',
        location: 'Main Gate',
        stream_url: 'rtsp://192.168.1.10/stream',
        status: 'live',
        fps: 25,
      };

      const cam = toCamera(apiCam);
      expect(cam.ip).toBe('192.168.1.10');
      expect(cam.location).toBe('Main Gate');
    });

    it('Case 2: only location="Main Gate" yields IP="Main Gate" for backward compatibility', () => {
      const apiCam: CameraApi = {
        id: 102,
        name: 'Lobby Camera',
        zone: 'Lobby',
        location: 'Main Gate',
        status: 'live',
        fps: 30,
      };

      const cam = toCamera(apiCam);
      expect(cam.ip).toBe('Main Gate');
      expect(cam.location).toBe('Main Gate');
    });

    it('Case 3: empty location and stream_url yields dash "-"', () => {
      const apiCam: CameraApi = {
        id: 103,
        name: 'Unknown Camera',
        zone: 'Vault',
        status: 'offline',
        fps: 15,
      };

      const cam = toCamera(apiCam);
      expect(cam.ip).toBe('-');
    });
  });
});
