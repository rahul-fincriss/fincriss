import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesService } from '@/services/rules.service';

export function useRules() {
  return useQuery({
    queryKey: ['rules'],
    queryFn: () => rulesService.listRules(),
  });
}

export function useRuleThresholds(ruleId: string | null) {
  return useQuery({
    queryKey: ['rule-thresholds', ruleId],
    queryFn: () => (ruleId ? rulesService.getRuleThresholds(ruleId) : Promise.resolve([])),
    enabled: !!ruleId,
  });
}

export function useToggleRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => rulesService.toggleRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useUpdateThresholds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, thresholds }: { ruleId: string; thresholds: { threshold_id: string; parameter_value: number }[] }) =>
      rulesService.updateThresholds(ruleId, thresholds),
    onSuccess: (_, { ruleId }) => {
      queryClient.invalidateQueries({ queryKey: ['rule-thresholds', ruleId] });
    },
  });
}

export function useBulkUpdateThresholds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, thresholds, reason, changedBy }: {
      ruleId: string;
      thresholds: Record<string, number>;
      reason: string;
      changedBy: string;
    }) => rulesService.bulkUpdateThresholds(ruleId, thresholds, reason, changedBy),
    onSuccess: (_, { ruleId }) => {
      queryClient.invalidateQueries({ queryKey: ['rule-thresholds', ruleId] });
      queryClient.invalidateQueries({ queryKey: ['rule-audit-log'] });
    },
  });
}

export function useResetThresholds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, changedBy }: { ruleId: string; changedBy?: string }) =>
      rulesService.resetThresholds(ruleId, changedBy),
    onSuccess: (_, { ruleId }) => {
      queryClient.invalidateQueries({ queryKey: ['rule-thresholds', ruleId] });
      queryClient.invalidateQueries({ queryKey: ['rule-audit-log'] });
    },
  });
}

export function useRuleAuditLog(params: { rule_id?: string; changed_by?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['rule-audit-log', params],
    queryFn: () => rulesService.getAuditLog(params),
  });
}
