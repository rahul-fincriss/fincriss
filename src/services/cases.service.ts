import api from '@/lib/api-client';
import { Case, CaseStatus, RiskLevel } from '@/types';

export interface ListCasesParams {
  priority?: string;
  status?: string;
  assigned_to?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateCaseRequest {
  status?: string;
  assigned_to?: string;
}

export const casesService = {
  async listCases(params: ListCasesParams = {}): Promise<Case[]> {
    const response = await api.get('/api/cases', { params });
    const data = response.data;
    console.log("casesService.listCases raw data:", data);
    
    const cases = Array.isArray(data) ? data : (data.cases || data.items || []);
    return cases.map((c: any) => ({
      id: (c.case_id || c.id).toString(),
      title: c.title || `Investigation: ${c.customer_name || 'Customer'}`,
      customerId: (c.customer_id || '').toString(),
      customerName: c.customer_name || 'Unknown Customer',
      status: (c.status?.toLowerCase() as CaseStatus) || 'open',
      priority: (c.priority?.toLowerCase() as RiskLevel) || 'medium',
      createdAt: new Date(c.created_at || c.timestamp),
      updatedAt: new Date(c.updated_at || c.created_at || c.timestamp),
      assignedTo: c.assigned_to,
      description: c.description || '',
      alertsCount: c.alerts_count || 0,
      linkedAlerts: c.linked_alerts || [],
      slaDeadline: new Date(c.sla_deadline || c.created_at || Date.now() + 86400000 * 3), // Default 3 days
      totalAmount: c.total_amount || 0,
      currency: c.currency || 'INR',
      notes: [],
      documents: [],
    }));
  },

  async getCase(caseId: string): Promise<Case> {
    const response = await api.get(`/api/cases/${caseId}`);
    const c = response.data;
    console.log("casesService.getCase raw data:", c);
    
    return {
      id: (c.case_id || c.id).toString(),
      title: c.title || `Investigation: ${c.customer_name || 'Customer'}`,
      customerId: (c.customer_id || '').toString(),
      customerName: c.customer_name || 'Unknown Customer',
      status: (c.status?.toLowerCase() as CaseStatus) || 'open',
      priority: (c.priority?.toLowerCase() as RiskLevel) || 'medium',
      createdAt: new Date(c.created_at || c.timestamp),
      updatedAt: new Date(c.updated_at || c.created_at || c.timestamp),
      assignedTo: c.assigned_to,
      description: c.description || '',
      alertsCount: c.alerts_count || 0,
      linkedAlerts: c.linked_alerts || [],
      slaDeadline: new Date(c.sla_deadline || c.created_at || Date.now() + 86400000 * 3),
      totalAmount: c.total_amount || 0,
      currency: c.currency || 'INR',
      notes: c.notes || [],
      documents: c.documents || [],
    };
  },

  async updateCase(caseId: string, request: UpdateCaseRequest): Promise<void> {
    await api.patch(`/api/cases/${caseId}`, request);
  },

  async closeCase(caseId: string, notes: string): Promise<void> {
    await api.post(`/api/cases/${caseId}/close`, { notes });
  },
};
