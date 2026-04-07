import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService, ListAlertsParams, OpenCaseRequest } from '@/services/alerts.service';
import { userManagementService } from '@/services/user-management.service';
import { toast } from 'sonner';

function extractErrorMessage(error: any, fallback: string): string {
  const detail = error?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
  if (typeof detail === 'object') return detail.msg || JSON.stringify(detail);
  return fallback;
}

export function useAlerts(params: ListAlertsParams = {}) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertsService.listAlerts(params),
  });
}

export function useAlert(alertId: string) {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: () => alertsService.getAlert(alertId),
    enabled: !!alertId,
  });
}

export function useOpenCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alertId, request }: { alertId: string; request: OpenCaseRequest }) => 
      alertsService.openCase(alertId, request),
    onSuccess: (_, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      toast.success('Case opened successfully');
    },
    onError: (error: any) => {
      console.error('Failed to open case:', error);
      toast.error(error.response?.data?.detail || 'Failed to open case');
    }
  });
}

export function useGenerateSummary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: string) => alertsService.generateSummary(alertId),
    onSuccess: (_, alertId) => {
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      toast.success('AI summary generated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to generate summary:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate AI summary');
    }
  });
}

export function useAssignAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alertId, assignedTo }: { alertId: string; assignedTo: string }) =>
      alertsService.assignAlert(alertId, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert assigned successfully');
    },
    onError: (error: any) => {
      console.error('Failed to assign alert:', error);
      toast.error(error.response?.data?.detail || 'Failed to assign alert');
    }
  });
}

export function useUsers(params: any = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userManagementService.listUsers(params),
  });
}
