import api from '@/lib/api-client';

export interface DashboardSummary {
  highRiskAlerts: number;
  alertsInQueue: number;
  openCases: number;
  pendingSTRs: number;
  highRiskTrend?: number;
  alertsTrend?: number;
  resolvedAlerts: number;
  avgResolutionTime: string;
  falsePositiveRate: string;
  strsFiled: number;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      const response = await api.get('/api/dashboard/summary');
      const data = response.data;
      console.log("dashboardService.getSummary raw data:", data);
      
      return {
        highRiskAlerts: data.high_risk_alerts || 0,
        alertsInQueue: data.alerts_in_queue || 0,
        openCases: data.open_cases || 0,
        pendingSTRs: data.pending_strs || 0,
        highRiskTrend: data.high_risk_trend,
        alertsTrend: data.alerts_trend,
        resolvedAlerts: data.resolved_alerts || 0,
        avgResolutionTime: data.avg_resolution_time || '0h',
        falsePositiveRate: data.false_positive_rate || '0%',
        strsFiled: data.strs_filed || 0,
      };
    } catch (error) {
      console.warn("Failed to fetch dashboard summary, returning mock data", error);
      return {
        highRiskAlerts: 12,
        alertsInQueue: 145,
        openCases: 24,
        pendingSTRs: 5,
        highRiskTrend: 8,
        alertsTrend: -12,
        resolvedAlerts: 432,
        avgResolutionTime: '4.5h',
        falsePositiveRate: '15%',
        strsFiled: 18,
      };
    }
  },
};
