import api from '@/lib/api-client';

export interface DashboardTiles {
  highAlertsOpen: number;
  unassignedAlertsOpen: number;
  openCases: number;
  pendingStrs: number;
}

export const dashboardService = {
  async getTiles(): Promise<DashboardTiles> {
    try {
      const response = await api.get('/api/dashboard/tiles');
      const data = response.data;
      return {
        highAlertsOpen: data.high_alerts_open || 0,
        unassignedAlertsOpen: data.unassigned_alerts_open || 0,
        openCases: data.open_cases || 0,
        pendingStrs: data.pending_strs || 0,
      };
    } catch (error) {
      console.warn("Failed to fetch dashboard tiles", error);
      return {
        highAlertsOpen: 0,
        unassignedAlertsOpen: 0,
        openCases: 0,
        pendingStrs: 0,
      };
    }
  },
};
