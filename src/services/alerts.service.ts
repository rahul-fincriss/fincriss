import api from '@/lib/api-client';
import { PrioritizedAlert, AlertStatus, RiskLevel } from '@/types';

export interface ListAlertsParams {
  priority_level?: string;
  status?: string;
  has_case?: boolean;
  limit?: number;
  offset?: number;
}

export interface OpenCaseRequest {
  assigned_to?: string;
  notes?: string;
}

export const alertsService = {
  async listAlerts(params: ListAlertsParams = {}): Promise<PrioritizedAlert[]> {
    const response = await api.get('/api/alerts', { params });
    // Note: We might need to map the API response to our internal PrioritizedAlert type
    // if the field names differ (e.g., camelCase vs snake_case)
    const data = response.data;
    console.log("alertsService.listAlerts raw data:", data);
    
    // Preliminary mapping based on common patterns
    const alerts = Array.isArray(data) ? data : (data.alerts || data.items || []);
    return alerts.map((alert: any) => ({
      id: alert.alert_id || alert.id,
      sourceSystem: alert.source_system || alert.sourceSystem || 'Legacy',
      alertType: alert.alert_type || alert.alertType || 'behavior_deviation',
      customerId: alert.customer_id || alert.customerId,
      customerName: alert.customer_name || alert.customerName,
      amount: alert.amount || 0,
      currency: alert.currency || 'INR',
      timestamp: new Date(alert.timestamp || alert.created_at),
      status: (alert.status?.toLowerCase() as AlertStatus) || 'new',
      mapsScore: alert.priority_score || alert.mapsScore || 0,
      riskLevel: (alert.priority_level?.toLowerCase() as RiskLevel) || 'medium',
      riskDrivers: alert.risk_drivers || alert.riskDrivers || [],
      slaDeadline: new Date(alert.sla_deadline || Date.now() + 86400000),
      rawPayload: alert.raw_payload || {},
      assignedTo: alert.assigned_to,
    }));
  },

  async getAlert(alertId: string): Promise<PrioritizedAlert> {
    const response = await api.get(`/api/alerts/${alertId}`);
    const alert = response.data;
    console.log("alertsService.getAlert raw data:", alert);
    
    return {
      id: alert.alert_id || alert.id,
      sourceSystem: alert.source_system || alert.sourceSystem || 'Legacy',
      alertType: alert.alert_type || alert.alertType || 'behavior_deviation',
      customerId: alert.customer_id || alert.customerId,
      customerName: alert.customer_name || alert.customerName,
      amount: alert.amount || 0,
      currency: alert.currency || 'INR',
      timestamp: new Date(alert.timestamp || alert.created_at),
      status: (alert.status?.toLowerCase() as AlertStatus) || 'new',
      mapsScore: alert.priority_score || alert.mapsScore || 0,
      riskLevel: (alert.priority_level?.toLowerCase() as RiskLevel) || 'medium',
      riskDrivers: alert.risk_drivers || alert.riskDrivers || [],
      slaDeadline: new Date(alert.sla_deadline || Date.now() + 86400000),
      rawPayload: alert.raw_payload || {},
      assignedTo: alert.assigned_to,
    };
  },

  async openCase(alertId: string, request: OpenCaseRequest): Promise<void> {
    await api.post(`/api/alerts/${alertId}/open-case`, request);
  },
};
