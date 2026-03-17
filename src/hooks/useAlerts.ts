import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService, ListAlertsParams, OpenCaseRequest } from '@/services/alerts.service';
import { userManagementService } from '@/services/user-management.service';
import { toast } from 'sonner';

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

export function useUsers(params: any = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userManagementService.listUsers(params),
  });
}
