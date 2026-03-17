import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesService, ListCasesParams, UpdateCaseRequest } from '@/services/cases.service';
import { toast } from 'sonner';

export function useCases(params: ListCasesParams = {}) {
  return useQuery({
    queryKey: ['cases', params],
    queryFn: () => casesService.listCases(params),
  });
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ['case', caseId],
    queryFn: () => casesService.getCase(caseId),
    enabled: !!caseId,
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, request }: { caseId: string; request: UpdateCaseRequest }) => 
      casesService.updateCase(caseId, request),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      toast.success('Case updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update case:', error);
      toast.error(error.response?.data?.detail || 'Failed to update case');
    }
  });
}

export function useCloseCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, notes }: { caseId: string; notes: string }) => 
      casesService.closeCase(caseId, notes),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      toast.success('Case closed successfully');
    },
    onError: (error: any) => {
      console.error('Failed to close case:', error);
      toast.error(error.response?.data?.detail || 'Failed to close case');
    }
  });
}
