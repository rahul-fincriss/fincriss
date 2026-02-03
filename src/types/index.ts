// User roles for the AML platform
export type UserRole = 'analyst' | 'investigator' | 'principal_officer' | 'compliance' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Alert types
export type AlertType = 'large_cash' | 'structuring' | 'rapid_movement' | 'geo_anomaly' | 'behavior_deviation' | 'smurfing';
export type AlertStatus = 'new' | 'in_review' | 'sent_to_maps' | 'dropped' | 'case_created';
export type RiskLevel = 'high' | 'medium' | 'low';
export type UserPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

// Queue types for operational routing (not risk-based)
export type QueueType = 
  | 'default_aml' 
  | 'pep_sanctions' 
  | 'high_value' 
  | 'cash_structuring' 
  | 'trade_based' 
  | 'behavioral_anomaly';

export interface RawAlert {
  id: string;
  sourceSystem: string;
  alertType: AlertType;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: AlertStatus;
  rawPayload: Record<string, unknown>;
}

export interface PrioritizedAlert extends RawAlert {
  mapsScore: number;
  riskLevel: RiskLevel;
  riskDrivers: string[];
  slaDeadline: Date;
  assignedTo?: string;
  userPriority?: UserPriority;
  userPriorityReason?: string;
}

// Customer group with overrides
export interface CustomerGroupOverrides {
  customerId: string;
  userPriority: UserPriority;
  userPriorityReason?: string;
  userPriorityCategory?: string;
  userPriorityChangedBy?: string;
  userPriorityChangedAt?: Date;
  assignedAnalystId?: string;
  assignedAnalystName?: string;
  assignedAt?: Date;
  assignedBy?: string;
  // Queue Type for operational routing
  queueType?: QueueType;
  queueTypeChangedBy?: string;
  queueTypeChangedAt?: Date;
}

// Audit log entry for workbench actions
export interface WorkbenchAuditEntry {
  id: string;
  customerId: string;
  action: 'priority_change' | 'analyst_assignment' | 'analyst_reassignment' | 'raw_payload_viewed' | 'queue_change';
  performedBy: string;
  performedAt: Date;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  category?: string;
}

// Case types
export type CaseStatus = 'open' | 'investigation' | 'str_draft' | 'pending_review' | 'submitted' | 'closed';

// STR Status for visibility in Cases list
export type STRStatusType = 'no_str' | 'draft_in_progress' | 'str_ready' | 'str_downloaded' | 'discarded';

export interface Case {
  id: string;
  linkedAlerts: string[];
  customerId: string;
  customerName: string;
  investigatorId: string;
  investigatorName: string;
  status: CaseStatus;
  strStatus: STRStatusType;
  createdAt: Date;
  slaDeadline: Date;
  totalAmount: number;
  currency: string;
  notes: CaseNote[];
  documents: CaseDocument[];
}

export interface CaseNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

// STR types
export type STRStatus = 'draft' | 'pending_po_review' | 'approved' | 'rejected' | 'submitted';

export interface STRDraft {
  id: string;
  caseId: string;
  status: STRStatus;
  groundsOfSuspicion: string;
  transactionNarrative: string;
  customerProfile: string;
  riskRationale: string;
  aiGenerated: {
    groundsOfSuspicion: boolean;
    transactionNarrative: boolean;
    customerProfile: boolean;
    riskRationale: boolean;
  };
  changes: STRChange[];
  investigatorComments: string;
  poComments?: string;
  submittedAt?: Date;
  fiuReference?: string;
}

export interface STRChange {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: Date;
}

// Customer data
export interface CustomerKYC {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  riskRating: RiskLevel;
  occupation?: string;
  industry?: string;
  declaredIncome: number;
  actualTurnover: number;
  accountAge: number;
  nationality: string;
  pep: boolean;
  sanctions: boolean;
}

// Transaction data
export interface Transaction {
  id: string;
  date: Date;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  counterparty: string;
  channel: string;
  country: string;
  description: string;
}

// Audit types
export interface AuditEntry {
  id: string;
  entityType: 'alert' | 'case' | 'str';
  entityId: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  details: string;
  modelVersion?: string;
}
