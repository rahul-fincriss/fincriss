import api from '@/lib/api-client';
import { AuditEntry } from '@/types';
import { AdminAuditEntry } from '@/types/admin';

export const auditService = {
  // General platform audit logs (alerts, cases, STRs)
  async listLogs(params: any = {}): Promise<AuditEntry[]> {
    // FALLBACK: Using rules/audit-log because /api/audit-logs is currently failing on the backend
    const response = await api.get('/api/rules/audit-log', { params });
    const data = response.data;
    console.log("auditService.listLogs fallback raw data:", data);
    
    const logs = Array.isArray(data) ? data : (data.items || data.audit_logs || []);
    return logs.map((log: any) => ({
      id: (log.id || log.audit_id || Math.random()).toString(),
      entityType: log.entity_type || 'alert',
      entityId: (log.entity_id || '').toString(),
      action: log.action || 'Updated',
      performedBy: log.performed_by || log.username || 'System',
      performedAt: new Date(log.performed_at || log.timestamp || Date.now()),
      details: log.details || log.description || '',
      modelVersion: log.model_version || log.version,
    }));
  },

  // Rule configuration specific audit logs
  async listRuleAuditLogs(params: any = {}): Promise<any[]> {
    const response = await api.get('/api/rules/audit-log', { params });
    const data = response.data;
    console.log("auditService.listRuleAuditLogs raw data:", data);
    
    const logs = Array.isArray(data) ? data : (data.items || data.audit_logs || []);
    return logs.map((log: any) => ({
      id: (log.id || log.audit_id || Math.random()).toString(),
      ruleId: log.rule_id,
      action: log.action || 'Threshold Updated',
      performedBy: log.changed_by || log.performed_by || 'System',
      performedAt: new Date(log.performed_at || log.timestamp || Date.now()),
      previousValue: log.previous_value,
      newValue: log.new_value,
      details: log.details || `Rule ${log.rule_id} updated`,
    }));
  },

  // Workforce/Admin audit logs
  async listAdminLogs(params: any = {}): Promise<AdminAuditEntry[]> {
    // FALLBACK: Using rules/audit-log because /api/audit-logs is currently failing on the backend
    const response = await api.get('/api/rules/audit-log', { params });
    const data = response.data;
    
    const logs = Array.isArray(data) ? data : (data.items || data.audit_logs || []);
    return logs.map((log: any) => ({
      id: (log.id || log.audit_id || Math.random()).toString(),
      actionType: log.action_type || log.action || 'user_updated',
      entityType: log.entity_type || 'user',
      entityId: (log.entity_id || '').toString(),
      entityName: log.entity_name || (log.entity_id || '').toString(),
      performedBy: log.performed_by || 'System',
      performedAt: new Date(log.performed_at || Date.now()),
      previousValue: log.previous_value,
      newValue: log.new_value,
      details: log.details,
    }));
  }
};
