import api from '@/lib/api-client';
import { AuditEntry } from '@/types';

export const auditService = {
  async listLogs(params: any = {}): Promise<AuditEntry[]> {
    // Note: The API endpoint is currently prefix-specific but plan suggests using it for general trail
    const response = await api.get('/api/rules/audit-log', { params });
    const data = response.data;
    console.log("auditService.listLogs raw data:", data);
    
    const logs = Array.isArray(data) ? data : (data.items || []);
    return logs.map((log: any) => ({
      id: log.id?.toString() || log.audit_id?.toString() || Math.random().toString(),
      entityType: log.entity_type || 'alert',
      entityId: (log.entity_id || '').toString(),
      action: log.action || 'Updated',
      performedBy: log.performed_by || log.username || 'System',
      performedAt: new Date(log.performed_at || log.timestamp || Date.now()),
      details: log.details || log.description || '',
      modelVersion: log.model_version || log.version,
    }));
  },
};
