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
