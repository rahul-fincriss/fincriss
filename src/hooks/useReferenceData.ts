import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as refService from '@/services/reference-data.service';

// === Countries ===
export function useHighRiskCountries(params?: Parameters<typeof refService.getHighRiskCountries>[0]) {
  return useQuery({
    queryKey: ['reference', 'countries', params],
    queryFn: () => refService.getHighRiskCountries(params),
  });
}

export function useMutateCountry() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: refService.createHighRiskCountry, onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'countries'] }) });
  const update = useMutation({ mutationFn: ({ code, data }: { code: string; data: any }) => refService.updateHighRiskCountry(code, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'countries'] }) });
  const deactivate = useMutation({ mutationFn: refService.deactivateHighRiskCountry, onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'countries'] }) });
  return { create, update, deactivate };
}

// === Locations ===
export function useHighRiskLocations(params?: Parameters<typeof refService.getHighRiskLocations>[0]) {
  return useQuery({
    queryKey: ['reference', 'locations', params],
    queryFn: () => refService.getHighRiskLocations(params),
  });
}

export function useMutateLocation() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: refService.createHighRiskLocation, onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'locations'] }) });
  const update = useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => refService.updateHighRiskLocation(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'locations'] }) });
  const deactivate = useMutation({ mutationFn: refService.deactivateHighRiskLocation, onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'locations'] }) });
  return { create, update, deactivate };
}

// === Industries ===
export function useIndustryRisks(params?: Parameters<typeof refService.getIndustryRisks>[0]) {
  return useQuery({
    queryKey: ['reference', 'industries', params],
    queryFn: () => refService.getIndustryRisks(params),
  });
}

export function useMutateIndustry() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: refService.createIndustryRisk, onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'industries'] }) });
  const update = useMutation({ mutationFn: ({ code, data }: { code: string; data: any }) => refService.updateIndustryRisk(code, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'industries'] }) });
  return { create, update };
}

// === Sanctioned Countries ===
export function useSanctionedCountries(params?: Parameters<typeof refService.getSanctionedCountries>[0]) {
  return useQuery({
    queryKey: ['reference', 'sanctioned'],
    queryFn: () => refService.getSanctionedCountries(params),
  });
}

export function useMutateSanctioned() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: refService.createSanctionedCountry, onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'sanctioned'] }) });
  const update = useMutation({ mutationFn: ({ code, data }: { code: string; data: any }) => refService.updateSanctionedCountry(code, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'sanctioned'] }) });
  const deactivate = useMutation({ mutationFn: refService.deactivateSanctionedCountry, onSuccess: () => qc.invalidateQueries({ queryKey: ['reference', 'sanctioned'] }) });
  return { create, update, deactivate };
}
