import api from '@/lib/api-client';

// Helper to safely extract arrays from API responses
function extractArray(data: any, keys: string[]): any[] {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (data?.[key] && Array.isArray(data[key])) return data[key];
  }
  return [];
}

// === High-Risk Countries ===
export interface HighRiskCountry {
  country_code: string;
  country_name: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  reason: string | null;
  added_date: string;
  is_active: boolean;
}

export async function getHighRiskCountries(params?: { risk_level?: string; is_active?: boolean; search?: string }) {
  const res = await api.get('/api/reference/countries', { params });
  return extractArray(res.data, ['countries', 'items', 'data']);
}

export async function createHighRiskCountry(data: Partial<HighRiskCountry>) {
  const res = await api.post('/api/reference/countries', data);
  return res.data;
}

export async function updateHighRiskCountry(code: string, data: Partial<HighRiskCountry>) {
  const res = await api.put(`/api/reference/countries/${code}`, data);
  return res.data;
}

export async function deactivateHighRiskCountry(code: string) {
  const res = await api.delete(`/api/reference/countries/${code}`);
  return res.data;
}

// === High-Risk Locations ===
export interface HighRiskLocation {
  id: string;
  location_name: string;
  state: string;
  country_code: string;
  location_type: 'BORDER' | 'CASH_INTENSIVE' | 'HIGH_CRIME';
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  reason: string | null;
  is_active: boolean;
}

export async function getHighRiskLocations(params?: { location_type?: string; risk_level?: string; is_active?: boolean; search?: string }) {
  const res = await api.get('/api/reference/locations', { params });
  return extractArray(res.data, ['locations', 'items', 'data']);
}

export async function createHighRiskLocation(data: Partial<HighRiskLocation>) {
  const res = await api.post('/api/reference/locations', data);
  return res.data;
}

export async function updateHighRiskLocation(id: string, data: Partial<HighRiskLocation>) {
  const res = await api.put(`/api/reference/locations/${id}`, data);
  return res.data;
}

export async function deactivateHighRiskLocation(id: string) {
  const res = await api.delete(`/api/reference/locations/${id}`);
  return res.data;
}

// === Industry Risk Scores ===
export interface IndustryRisk {
  industry_code: string;
  industry_name: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  cash_intensive: boolean;
  reason: string | null;
  regulatory_notes: string | null;
  last_updated: string;
}

export async function getIndustryRisks(params?: { risk_level?: string; cash_intensive?: boolean; search?: string }) {
  const res = await api.get('/api/reference/industries', { params });
  return extractArray(res.data, ['industries', 'items', 'data']);
}

export async function createIndustryRisk(data: Partial<IndustryRisk>) {
  const res = await api.post('/api/reference/industries', data);
  return res.data;
}

export async function updateIndustryRisk(code: string, data: Partial<IndustryRisk>) {
  const res = await api.put(`/api/reference/industries/${code}`, data);
  return res.data;
}

// === Sanctioned Countries ===
export interface SanctionedCountry {
  country_code: string;
  country_name: string;
  program: 'OFAC' | 'UN' | 'EU' | 'FATF';
  sanction_type: 'COMPREHENSIVE' | 'TARGETED' | 'SECTORAL';
  effective_date: string;
  expiry_date: string | null;
  description: string | null;
  is_active: boolean;
}

export async function getSanctionedCountries(params?: { program?: string; sanction_type?: string; is_active?: boolean; search?: string }) {
  const res = await api.get('/api/reference/sanctioned-countries', { params });
  return extractArray(res.data, ['countries', 'sanctioned_countries', 'items', 'data']);
}

export async function createSanctionedCountry(data: Partial<SanctionedCountry>) {
  const res = await api.post('/api/reference/sanctioned-countries', data);
  return res.data;
}

export async function updateSanctionedCountry(code: string, data: Partial<SanctionedCountry>) {
  const res = await api.put(`/api/reference/sanctioned-countries/${code}`, data);
  return res.data;
}

export async function deactivateSanctionedCountry(code: string) {
  const res = await api.delete(`/api/reference/sanctioned-countries/${code}`);
  return res.data;
}
