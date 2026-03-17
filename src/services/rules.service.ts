import api from '@/lib/api-client';

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
    return response.data;
  },

  async getRuleThresholds(ruleId: string): Promise<RuleThreshold[]> {
    const response = await api.get(`/api/rules/thresholds/${ruleId}`);
    return response.data;
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
