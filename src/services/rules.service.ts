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
  is_active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface RuleThreshold {
  threshold_id: string;
  rule_id: string;
  parameter_name: string;
  parameter_value: number;
  unit: string;
  description: string;
}

export const rulesService = {
  async listRules(): Promise<RuleConfig[]> {
    const response = await api.get('/api/rules/configs');
    return extractArray<RuleConfig>(response.data, ['rules', 'configs', 'items', 'entries']);
  },

  async getRuleThresholds(ruleId: string): Promise<RuleThreshold[]> {
    const response = await api.get(`/api/rules/thresholds/${ruleId}`);
    return extractArray<RuleThreshold>(response.data, ['thresholds', 'items', 'entries']);
  },

  async toggleRule(ruleId: string): Promise<void> {
    await api.post(`/api/rules/configs/${ruleId}/toggle`);
  },

  async updateThresholds(ruleId: string, thresholds: { threshold_id: string; parameter_value: number }[]): Promise<void> {
    await api.post(`/api/rules/thresholds/${ruleId}/bulk-update`, {
      thresholds: thresholds
    });
  },

  async resetThresholds(ruleId: string): Promise<void> {
    await api.post(`/api/rules/thresholds/${ruleId}/reset`);
  }
};
