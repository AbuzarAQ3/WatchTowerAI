import api from '../lib/api';
import { isMockEnabled, mockDelay } from './config';
import { INITIAL_DASHBOARD_STATS } from './mock/stats.mock';
import { toDashboardStats } from './mappers';
import type { DashboardStats } from '../types/domain';
import type { StatsApi } from '../types/api';

/**
 * Fetch complete dashboard stats (metrics and hourly incident trend series)
 * Uses a single unified endpoint /api/stats/
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (isMockEnabled()) {
    await mockDelay();
    return {
      metrics: [...INITIAL_DASHBOARD_STATS.metrics],
      chartData: [...INITIAL_DASHBOARD_STATS.chartData],
    };
  }

  const response = await api.get<StatsApi>('/api/stats/');
  return toDashboardStats(response.data);
}
