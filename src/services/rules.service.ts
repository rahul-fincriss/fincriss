import api from '@/lib/api-client';

const extractArray = <T>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  const nestedData = data?.data;
  if (Array.isArray(nestedData)) return nestedData;
  if (nestedData && typeof nestedData === 'object') {
    for (const key of keys) {
      if (Array.isArray(nestedData[key])) return nestedData[key];
    }
  }
  return [];
};

export interface RuleConfig {
  rule_id: string;
  rule_name: string;
  description: string;
  category: string;
  is_enabled: boolean;
  is_active?: boolean; // legacy alias
  base_score: number;
  priority: number;
  version: number;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface RuleThreshold {
  threshold_id: string | number;
  rule_id: string;
  parameter_name: string;
  parameter_value: number;
  parameter_type: 'INTEGER' | 'DECIMAL' | 'PERCENTAGE';
  display_name: string;
  display_order: number;
  min_allowed: number;
  max_allowed: number;
  default_value: number;
  unit: string;
  description: string;
}

export interface RuleAuditEntry {
  log_id: number;
  rule_id: string;
  change_type: 'CONFIG_CHANGED' | 'THRESHOLD_CHANGED' | 'TOGGLED' | 'RESET_TO_DEFAULT';
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
  reason: string;
}

export const rulesService = {
  async listRules(): Promise<RuleConfig[]> {
    const response = await api.get('/api/rules/configs');
    const rules = extractArray<any>(response.data, ['rules', 'configs', 'items', 'entries']);
    return rules.map(r => ({
      ...r,
      is_active: r.is_active ?? r.is_enabled,
      is_enabled: r.is_enabled ?? r.is_active,
    }));
  },

  async getRule(ruleId: string): Promise<RuleConfig & { thresholds?: RuleThreshold[] }> {
    const response = await api.get(`/api/rules/configs/${ruleId}?include_thresholds=true`);
    return response.data;
  },

  async createRule(rule: Partial<RuleConfig>): Promise<void> {
    await api.post('/api/rules/configs', rule);
  },

  async updateRule(ruleId: string, updates: Partial<RuleConfig>, changedBy: string): Promise<void> {
    await api.put(`/api/rules/configs/${ruleId}?changed_by=${changedBy}`, updates);
  },

  async getRuleThresholds(ruleId: string): Promise<RuleThreshold[]> {
    const response = await api.get(`/api/rules/thresholds/${ruleId}`);
    return extractArray<RuleThreshold>(response.data, ['thresholds', 'items', 'entries']);
  },

  async toggleRule(ruleId: string, changedBy?: string): Promise<void> {
    await api.post(`/api/rules/configs/${ruleId}/toggle`, { changed_by: changedBy || 'admin' });
  },

  async updateThreshold(thresholdId: string | number, value: number, changedBy: string): Promise<void> {
    await api.put(`/api/rules/thresholds/${thresholdId}?changed_by=${changedBy}`, {
      parameter_value: value,
    });
  },

  async bulkUpdateThresholds(
    ruleId: string,
    thresholds: Record<string, number>,
    reason: string,
    changedBy: string
  ): Promise<void> {
    await api.post(`/api/rules/thresholds/${ruleId}/bulk-update`, {
      thresholds,
      reason,
      changed_by: changedBy,
    });
  },

  // Legacy signature kept for existing hooks
  async updateThresholds(ruleId: string, thresholds: { threshold_id: string; parameter_value: number }[]): Promise<void> {
    const thresholdMap: Record<string, number> = {};
    thresholds.forEach(t => { thresholdMap[t.threshold_id] = t.parameter_value; });
    await api.post(`/api/rules/thresholds/${ruleId}/bulk-update`, { thresholds: thresholdMap });
  },

  async resetThresholds(ruleId: string, changedBy?: string): Promise<void> {
    await api.post(`/api/rules/thresholds/${ruleId}/reset`, { changed_by: changedBy || 'admin' });
  },

  async getAuditLog(params: { rule_id?: string; changed_by?: string; limit?: number } = {}): Promise<RuleAuditEntry[]> {
    const response = await api.get('/api/rules/audit-log', { params });
    return extractArray<RuleAuditEntry>(response.data, ['entries', 'items', 'logs']);
  },
};
