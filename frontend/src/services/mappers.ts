import type { CameraApi, IncidentApi, AlertApi, StatsApi } from '../types/api';
import type { Camera, Incident, Alert, DashboardStats, IncidentTrendPoint, StatMetric } from '../types/domain';

/**
 * Sanitizes URLs, IPs, or location strings:
 * - Strips embedded userinfo (username:password@ or user@)
 * - Strips sensitive query-string secrets (token, password, key, secret, pass, auth)
 * - Preserves plain text locations (e.g. "Main Gate", "Zone A") and clean IPs without throwing
 */
export function sanitizeUrlOrIp(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '192.168.1.1';
  try {
    let result = raw;
    // 1. Strip username:password@ or user@ from URLs with schemes
    result = result.replace(/^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)[^@\s/]+@/, '$1');
    // 2. Strip user:password@ or user@ if without scheme (user@host or user:pass@host)
    result = result.replace(/^[^@\s/:]+(:[^@\s/]*)?@/, '');

    // 3. Strip sensitive query parameters (token, password, key, secret, pass, auth)
    if (result.includes('?')) {
      const [base, query] = result.split('?');
      if (query) {
        const sensitiveParams = ['token', 'password', 'key', 'secret', 'pass', 'auth'];
        const cleanParams = query
          .split('&')
          .filter((param) => {
            const paramKey = param.split('=')[0].toLowerCase();
            return !sensitiveParams.includes(paramKey);
          })
          .join('&');
        result = cleanParams ? `${base}?${cleanParams}` : base;
      }
    }

    return result;
  } catch {
    return typeof raw === 'string' ? raw : '192.168.1.1';
  }
}

/**
 * Extracts hostname / IP from a URL string safely without throwing.
 */
export function extractHostFromUrl(url: string): string {
  if (!url || typeof url !== 'string') return '-';
  try {
    const match = url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^@/]+@)?([^/:?#]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {}
  return sanitizeUrlOrIp(url);
}

/**
 * Transforms CameraApi (backend format) to Camera (UI domain model)
 */
export function toCamera(apiCam: CameraApi & { ip?: string }): Camera {
  let cleanIp = '-';

  if (apiCam.stream_url && typeof apiCam.stream_url === 'string' && apiCam.stream_url.trim()) {
    const streamHost = extractHostFromUrl(apiCam.stream_url.trim());
    const isIp = (str?: string) => Boolean(str && /^(\d{1,3}\.){3}\d{1,3}$/.test(str));
    // If location is specifically an IP address and stream_url host is not, preserve location as IP for backward compatibility
    if (apiCam.location && isIp(apiCam.location.trim()) && !isIp(streamHost)) {
      cleanIp = apiCam.location.trim();
    } else {
      cleanIp = streamHost || '-';
    }
  } else if (apiCam.ip && typeof apiCam.ip === 'string' && apiCam.ip.trim()) {
    cleanIp = sanitizeUrlOrIp(apiCam.ip.trim());
  } else if (apiCam.location && typeof apiCam.location === 'string' && apiCam.location.trim()) {
    cleanIp = sanitizeUrlOrIp(apiCam.location.trim());
  }

  return {
    id: apiCam.id,
    name: apiCam.name,
    zone: apiCam.zone || 'Entry',
    ip: cleanIp,
    location: apiCam.location ? sanitizeUrlOrIp(apiCam.location) : undefined,
    fps: Number(apiCam.fps) || 30,
    status: apiCam.status,
    lastSeen: apiCam.last_seen ?? null,
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
