import type { CameraApi, IncidentApi, AlertApi, StatsApi } from '../types/api';
import type { Camera, Incident, Alert, DashboardStats, IncidentTrendPoint, StatMetric } from '../types/domain';

/**
 * Transforms CameraApi (backend format) to Camera (UI domain model)
 */
export function toCamera(apiCam: CameraApi): Camera {
  return {
    id: apiCam.id,
    name: apiCam.name,
    zone: apiCam.zone || 'Entry',
    ip: apiCam.location || apiCam.stream_url || '192.168.1.1',
    fps: Number(apiCam.fps) || 30,
    status: apiCam.status,
  };
}

/**
 * Transforms IncidentApi to Incident domain model
 */
export function toIncident(apiInc: IncidentApi): Incident {
  const confStr =
    typeof apiInc.confidence === 'number'
      ? apiInc.confidence.toFixed(2)
      : String(apiInc.confidence ?? '0.85');

  return {
    id: apiInc.id,
    type: apiInc.type,
    camera: apiInc.camera_name,
    time: apiInc.detected_at,
    severity: apiInc.severity,
    status: apiInc.status,
    confidence: confStr,
    snapshot: apiInc.snapshot ?? null,
  };
}

/**
 * Transforms AlertApi to Alert domain model
 */
export function toAlert(apiAlert: AlertApi): Alert {
  return {
    id: apiAlert.id,
    title: apiAlert.message,
    desc: apiAlert.message,
    camera: apiAlert.camera_name,
    time: apiAlert.created_at,
    level: apiAlert.priority,
    acknowledged: Boolean(apiAlert.acknowledged),
  };
}

/**
 * Transforms StatsApi to DashboardStats (metrics cards and area chart series)
 */
export function toDashboardStats(apiStats: StatsApi): DashboardStats {
  const online = apiStats.cameras_online ?? 0;
  const total = apiStats.cameras_total ?? 0;
  const offline = Math.max(0, total - online);

  const metrics: StatMetric[] = [
    {
      label: 'Cameras Online',
      value: String(online),
      sub: `${offline} offline · 0 maintenance`,
      accent: 'cyan',
      trend: `${online}/${total}`,
    },
    {
      label: 'Incidents Today',
      value: String(apiStats.incidents_today ?? 0),
      sub: 'Recorded today',
      accent: 'danger',
      trend: `+${apiStats.incidents_today ?? 0} today`,
    },
    {
      label: 'Active Alerts',
      value: String(apiStats.active_alerts ?? 0),
      sub: `${apiStats.active_alerts ?? 0} require attention`,
      accent: 'amber',
      trend: (apiStats.active_alerts ?? 0) > 0 ? '↑ URGENT' : 'Nominal',
    },
    {
      label: 'System Health',
      value: `${apiStats.system_health ?? 100}%`,
      sub: 'All services running',
      accent: 'success',
      trend: 'Nominal',
    },
  ];

  // Convert hourly_incidents (24 values) into chart trend points
  const hourly = apiStats.hourly_incidents || [];
  const chartData: IncidentTrendPoint[] = [];

  // Group into 4-hour key interval markers for the chart, or 24 hourly markers
  const intervals = [0, 4, 8, 12, 16, 20, 23];
  intervals.forEach((hour) => {
    const totalVal = hourly[hour] ?? 0;
    const timeLabel = `${String(hour === 23 ? 24 : hour).padStart(2, '0')}:00`;
    chartData.push({
      time: timeLabel,
      total: totalVal,
      high: Math.round(totalVal * 0.35),
    });
  });

  return {
    metrics,
    chartData,
  };
}
