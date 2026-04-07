import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboardTiles() {
  return useQuery({
    queryKey: ['dashboard-tiles'],
    queryFn: () => dashboardService.getTiles(),
  });
}
