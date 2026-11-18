import type { StatMetric, IncidentTrendPoint, DashboardStats } from '../../types/domain';

export const STATS_METRICS: StatMetric[] = [
  {
    label: 'Cameras Online',
    value: '12',
    sub: '2 offline · 1 maintenance',
    accent: 'cyan',
    trend: '12/15',
  },
  {
    label: 'Incidents Today',
    value: '7',
    sub: 'Last: 14 mins ago',
    accent: 'danger',
    trend: '+3 vs yesterday',
  },
  {
    label: 'Active Alerts',
    value: '3',
    sub: '2 high · 1 medium',
    accent: 'amber',
    trend: '↑ URGENT',
  },
  {
    label: 'System Health',
    value: '98%',
    sub: 'All services running',
    accent: 'success',
    trend: 'Nominal',
  },
];

export const CHART_DATA: IncidentTrendPoint[] = [
  { time: '00:00', total: 2, high: 0 },
  { time: '04:00', total: 1, high: 0 },
  { time: '08:00', total: 4, high: 1 },
  { time: '12:00', total: 6, high: 2 },
  { time: '16:00', total: 5, high: 1 },
  { time: '20:00', total: 8, high: 3 },
  { time: '24:00', total: 7, high: 2 },
];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  metrics: STATS_METRICS,
  chartData: CHART_DATA,
};
