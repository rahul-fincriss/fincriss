import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/audit.service';

export function useAuditLogs(params: any = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.listLogs(params),
  });
}
