import { describe, it, expect, beforeEach } from 'vitest';
import { getCameras, createCamera, _resetMockCameras } from './cameras';
import { getIncidents, getRecentIncidents, updateIncidentStatus, _resetMockIncidents } from './incidents';
import { getAlerts, acknowledgeAlert, acknowledgeAllAlerts, dismissAlert, _resetMockAlerts } from './alerts';
import { getDashboardStats } from './stats';

describe('Services Layer (Mock Mode)', () => {
  beforeEach(() => {
    _resetMockCameras();
    _resetMockIncidents();
    _resetMockAlerts();
  });

  describe('Cameras Service', () => {
    it('fetches cameras list', async () => {
      const cams = await getCameras();
      expect(cams.length).toBeGreaterThan(0);
      expect(cams[0]).toHaveProperty('name');
      expect(cams[0]).toHaveProperty('zone');
      expect(cams[0]).toHaveProperty('status');
    });

    it('creates a new camera', async () => {
      const initialCount = (await getCameras()).length;
      const created = await createCamera({
        name: 'Workshop Entrance',
        zone: 'Entry',
        ip: '192.168.1.99',
        fps: 25,
        status: 'live',
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Workshop Entrance');
      const updated = await getCameras();
      expect(updated.length).toBe(initialCount + 1);
    });
  });

  describe('Incidents Service', () => {
    it('fetches and filters incidents', async () => {
      const all = await getIncidents();
      expect(all.length).toBeGreaterThan(0);

      const highOnly = await getIncidents({ severity: 'high' });
      expect(highOnly.every((i) => i.severity === 'high')).toBe(true);

      const searchFiltered = await getIncidents({ search: 'Gate' });
      expect(
        searchFiltered.every(
          (i) => i.camera.includes('Gate') || i.type.includes('Gate') || i.id.includes('Gate')
        )
      ).toBe(true);
    });

    it('fetches recent incidents with limit', async () => {
      const recents = await getRecentIncidents(3);
      expect(recents.length).toBeLessThanOrEqual(3);
    });

    it('updates incident status', async () => {
      const incidents = await getIncidents();
      const first = incidents[0];
      const updated = await updateIncidentStatus(first.id, 'resolved');
      expect(updated.status).toBe('resolved');
    });
  });

  describe('Alerts Service', () => {
    it('fetches alerts', async () => {
      const alerts = await getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('acknowledges an individual alert', async () => {
      const alerts = await getAlerts();
      const first = alerts[0];
      const acked = await acknowledgeAlert(first.id);
      expect(acked.acknowledged).toBe(true);
    });

    it('acknowledges all alerts', async () => {
      await acknowledgeAllAlerts();
      const alerts = await getAlerts();
      expect(alerts.every((a) => a.acknowledged)).toBe(true);
    });

    it('dismisses an alert', async () => {
      const alerts = await getAlerts();
      const firstId = alerts[0].id;
      await dismissAlert(firstId);
      const after = await getAlerts();
      expect(after.find((a) => a.id === firstId)).toBeUndefined();
    });
  });

  describe('Stats Service', () => {
    it('fetches complete dashboard stats and chart data', async () => {
      const stats = await getDashboardStats();
      expect(stats.metrics.length).toBe(4);
      expect(stats.chartData.length).toBeGreaterThan(0);
    });
  });
});
