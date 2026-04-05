import api from '@/lib/api-client';

export interface Customer360Summary {
  customer_id: string;
  full_name: string;
  party_type: 'individual' | 'business' | 'trust';
  risk_rating: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  kyc_status: 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'UNDER_REVIEW';
  is_watchlisted: boolean;
  is_pep: boolean;
  open_alerts_count: number;
  active_cases_count: number;
  sanctions_hits: number;
}

export interface Customer360Profile {
  customer_id: string;
  full_name: string;
  display_name?: string;
  aliases?: string[];
  party_type: 'individual' | 'business' | 'trust';
  date_of_birth?: string;
  incorporation_date?: string;
  nationality?: string;
  residency_country?: string;
  tax_residency?: string;
  occupation?: string;
  industry?: string;
  industry_risk_level?: string;
  customer_since?: string;
  relationship_manager?: string;

  // Contact
  primary_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pin: string;
    country: string;
  };
  phone_numbers?: { number: string; type: string; verified: boolean }[];
  email_addresses?: { email: string; verified: boolean }[];
  additional_addresses?: { line1: string; city: string; state: string; pin: string; country: string }[];

  // Risk
  risk_score: number;
  risk_rating: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  last_risk_assessed?: string;
  risk_rating_history?: { date: string; rating: string; score: number }[];
  next_kyc_review_due?: string;
  is_pep: boolean;
  is_sanctioned: boolean;
  is_watchlisted: boolean;

  // KYC
  kyc_status: 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'UNDER_REVIEW';
  kyc_level?: 'SIMPLIFIED' | 'STANDARD' | 'ENHANCED';
  onboarding_method?: string;
  cdd_type?: string;
  last_kyc_refresh?: string;
  next_kyc_due?: string;
  relationship_purpose?: string;
  source_of_funds?: string;
  source_of_wealth?: string;
  adverse_media_flag?: boolean;
  high_risk_jurisdiction_flag?: boolean;
  declared_income?: number;
  actual_turnover?: number;

  // Stats
  open_alerts_count: number;
  active_cases_count: number;
  sanctions_hits: number;

  // Identity
  government_ids?: {
    type: string;
    id_number: string;
    issuing_country: string;
    expiry_date?: string;
    verification_status: 'VERIFIED' | 'PENDING' | 'FAILED' | 'EXPIRED';
  }[];
  beneficial_owners?: {
    name: string;
    relationship_type: string;
    ownership_pct: number;
    control_pct: number;
    verification_status: string;
    related_customer_id?: string;
  }[];

  // Accounts
  accounts?: {
    account_id: string;
    account_type: string;
    account_number_masked: string;
    balance: number;
    average_balance: number;
    currency: string;
    opened_date: string;
    status: 'ACTIVE' | 'DORMANT' | 'CLOSED' | 'FROZEN';
  }[];

  // KYC Documents
  kyc_documents?: {
    document_type: string;
    document_number: string;
    issuing_authority: string;
    country: string;
    verification_status: string;
    verification_method: string;
    expiry?: string;
  }[];

  // Risk Assessment History
  risk_assessments?: {
    date: string;
    rating: string;
    score: number;
    previous_rating?: string;
    review_type: string;
    model?: string;
    reviewer?: string;
    rationale?: string;
  }[];

  // Screening
  screening_results?: {
    screened_at: string;
    type: string;
    provider: string;
    status: 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH' | 'FALSE_POSITIVE';
    matched_entity_name?: string;
    list_name?: string;
    match_score?: number;
  }[];
  watchlist_entries?: {
    watchlist_type: string;
    status: 'ACTIVE' | 'EXPIRED' | 'REMOVED';
    reason: string;
    added_date: string;
    start_date?: string;
    end_date?: string;
  }[];

  // Alerts & Cases
  alerts?: {
    alert_id: string;
    date: string;
    scenario: string;
    severity: string;
    amount: number;
    priority_score: number;
    status: string;
    assigned_to?: string;
  }[];
  cases?: {
    case_number: string;
    status: string;
    priority: string;
    assigned_investigator?: string;
    opened_date: string;
    closed_date?: string;
  }[];

  // Network
  relationships?: {
    related_customer_id: string;
    related_customer_name: string;
    relationship_type: string;
    strength: 'LOW' | 'MEDIUM' | 'HIGH';
    direction: string;
    since_date?: string;
    risk_rating?: string;
  }[];
}

export interface Customer360Transaction {
  id: string;
  date: string;
  direction: 'D' | 'C';
  amount: number;
  currency: string;
  type: string;
  description: string;
  reference: string;
  counterparty: string;
  country: string;
  is_suspicious: boolean;
  is_cross_border: boolean;
  is_cash: boolean;
}

export interface TransactionsResponse {
  total: number;
  transactions: Customer360Transaction[];
  total_debit: number;
  total_credit: number;
}

export interface ListCustomersParams {
  search?: string;
  risk_rating?: string;
  party_type?: string;
  filter?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionsParams {
  limit?: number;
  offset?: number;
  date_from?: string;
  date_to?: string;
  transaction_type?: string;
  min_amount?: number;
  max_amount?: number;
  cash_only?: boolean;
  cross_border_only?: boolean;
  suspicious_only?: boolean;
  account_id?: string;
}

export const customer360Service = {
  async listCustomers(params: ListCustomersParams = {}): Promise<Customer360Summary[]> {
    const response = await api.get('/api/customers', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data.customers || data.items || []);
  },

  async getCustomer360(customerId: string): Promise<Customer360Profile> {
    const response = await api.get(`/api/customers/${customerId}/360`);
    return response.data;
  },

  async getTransactions(customerId: string, params: TransactionsParams = {}): Promise<TransactionsResponse> {
    const response = await api.get(`/api/customers/${customerId}/transactions`, { params });
    return response.data;
  },
};
