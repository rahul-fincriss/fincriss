import { RawAlert, PrioritizedAlert, Case, STRDraft, CustomerKYC, Transaction, AuditEntry, User } from '@/types';

// Mock analysts for assignment
export const mockAnalysts: User[] = [
  { id: 'usr-001', name: 'Sarah Chen', email: 'sarah.chen@bank.com', role: 'analyst' },
  { id: 'usr-006', name: 'David Park', email: 'david.park@bank.com', role: 'analyst' },
  { id: 'usr-007', name: 'Lisa Wong', email: 'lisa.wong@bank.com', role: 'analyst' },
  { id: 'usr-008', name: 'James Miller', email: 'james.miller@bank.com', role: 'analyst' },
];

// Priority override reason categories
export const priorityReasonCategories = [
  'Customer escalation',
  'Regulatory inquiry',
  'Management directive',
  'Pattern similarity to filed STR',
  'Time-sensitive information',
  'External intelligence',
  'Risk appetite adjustment',
  'Other',
];

// Generate mock raw alerts
export const mockRawAlerts: RawAlert[] = [
  {
    id: 'ALT-2024-001234',
    sourceSystem: 'Core Banking',
    alertType: 'large_cash',
    customerId: 'CUS-78234',
    customerName: 'Global Trade Solutions Ltd',
    amount: 245000,
    currency: 'USD',
    timestamp: new Date('2024-01-15T09:23:00'),
    status: 'new',
    rawPayload: { txn_id: 'TXN-8923847', branch: 'NYC-001' },
  },
  {
    id: 'ALT-2024-001235',
    sourceSystem: 'Wire Transfer',
    alertType: 'structuring',
    customerId: 'CUS-45123',
    customerName: 'Ahmed Hassan',
    amount: 47500,
    currency: 'USD',
    timestamp: new Date('2024-01-15T10:45:00'),
    status: 'new',
    rawPayload: { pattern: 'multiple_sub_threshold' },
  },
  {
    id: 'ALT-2024-001236',
    sourceSystem: 'Card Monitoring',
    alertType: 'geo_anomaly',
    customerId: 'CUS-89012',
    customerName: 'Maria Santos',
    amount: 12300,
    currency: 'EUR',
    timestamp: new Date('2024-01-15T11:12:00'),
    status: 'in_review',
    rawPayload: { locations: ['BR', 'RU', 'NG'] },
  },
  {
    id: 'ALT-2024-001237',
    sourceSystem: 'Core Banking',
    alertType: 'rapid_movement',
    customerId: 'CUS-23456',
    customerName: 'Tech Innovations Inc',
    amount: 890000,
    currency: 'USD',
    timestamp: new Date('2024-01-15T14:30:00'),
    status: 'new',
    rawPayload: { velocity: 'high', period: '24h' },
  },
  {
    id: 'ALT-2024-001238',
    sourceSystem: 'Trade Finance',
    alertType: 'behavior_deviation',
    customerId: 'CUS-67890',
    customerName: 'Eastern Import Export',
    amount: 1250000,
    currency: 'USD',
    timestamp: new Date('2024-01-15T16:00:00'),
    status: 'sent_to_maps',
    rawPayload: { deviation_score: 0.87 },
  },
];

// Generate mock prioritized alerts - with multiple alerts per customer for grouping demo
export const mockPrioritizedAlerts: PrioritizedAlert[] = [
  // Eastern Import Export - 2 alerts (High priority customer)
  {
    ...mockRawAlerts[4],
    mapsScore: 92,
    riskLevel: 'high',
    riskDrivers: ['Unusual counterparty network', 'Trade mispricing signals', 'Shell company indicators'],
    slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
  },
  {
    id: 'ALT-2024-001245',
    sourceSystem: 'Trade Finance',
    alertType: 'rapid_movement',
    customerId: 'CUS-67890',
    customerName: 'Eastern Import Export',
    amount: 780000,
    currency: 'USD',
    timestamp: new Date('2024-01-16T09:00:00'),
    status: 'sent_to_maps',
    rawPayload: { velocity: 'critical', period: '12h' },
    mapsScore: 88,
    riskLevel: 'high',
    riskDrivers: ['Rapid fund movement', 'High-risk jurisdiction', 'Trade mispricing signals'],
    slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
  },
  // Tech Innovations Inc - 3 alerts (High priority customer)
  {
    ...mockRawAlerts[3],
    mapsScore: 85,
    riskLevel: 'high',
    riskDrivers: ['Rapid fund movement', 'New account activity spike', 'Cross-border layering'],
    slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
  },
  {
    id: 'ALT-2024-001246',
    sourceSystem: 'Wire Transfer',
    alertType: 'structuring',
    customerId: 'CUS-23456',
    customerName: 'Tech Innovations Inc',
    amount: 48000,
    currency: 'USD',
    timestamp: new Date('2024-01-16T11:30:00'),
    status: 'sent_to_maps',
    rawPayload: { pattern: 'round_amounts' },
    mapsScore: 68,
    riskLevel: 'medium',
    riskDrivers: ['Structuring pattern detected', 'Round amount transactions'],
    slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours
  },
  {
    id: 'ALT-2024-001250',
    sourceSystem: 'Core Banking',
    alertType: 'behavior_deviation',
    customerId: 'CUS-23456',
    customerName: 'Tech Innovations Inc',
    amount: 125000,
    currency: 'USD',
    timestamp: new Date('2024-01-17T08:00:00'),
    status: 'sent_to_maps',
    rawPayload: { deviation_score: 0.72 },
    mapsScore: 58,
    riskLevel: 'low',
    riskDrivers: ['Behavior deviation', 'Profile mismatch'],
    slaDeadline: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours
  },
  // Ahmed Hassan - 2 alerts (Medium priority customer)
  {
    ...mockRawAlerts[1],
    mapsScore: 72,
    riskLevel: 'medium',
    riskDrivers: ['Structuring pattern detected', 'Just-below-threshold transactions'],
    slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
  },
  {
    id: 'ALT-2024-001247',
    sourceSystem: 'Card Monitoring',
    alertType: 'geo_anomaly',
    customerId: 'CUS-45123',
    customerName: 'Ahmed Hassan',
    amount: 8500,
    currency: 'USD',
    timestamp: new Date('2024-01-16T14:00:00'),
    status: 'sent_to_maps',
    rawPayload: { locations: ['AE', 'TR', 'EG'] },
    mapsScore: 55,
    riskLevel: 'low',
    riskDrivers: ['Geo-location anomaly', 'Travel pattern'],
    slaDeadline: new Date(Date.now() + 40 * 60 * 60 * 1000), // 40 hours
  },
  // Global Trade Solutions Ltd - 1 alert (Medium priority customer)
  {
    ...mockRawAlerts[0],
    mapsScore: 65,
    riskLevel: 'medium',
    riskDrivers: ['Large cash transaction', 'Business profile mismatch'],
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
  // Maria Santos - 1 alert (Low priority customer)
  {
    ...mockRawAlerts[2],
    mapsScore: 45,
    riskLevel: 'low',
    riskDrivers: ['Geo-location anomaly', 'Customer travel history unclear'],
    slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
  },
];

// Mock cases
export const mockCases: Case[] = [
  {
    id: 'CASE-2024-0089',
    linkedAlerts: ['ALT-2024-001198', 'ALT-2024-001199'],
    customerId: 'CUS-34521',
    customerName: 'Pacific Trading Group',
    investigatorId: 'usr-002',
    investigatorName: 'Michael Torres',
    status: 'investigation',
    strStatus: 'draft_in_progress',
    createdAt: new Date('2024-01-10'),
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    totalAmount: 3450000,
    currency: 'USD',
    notes: [
      {
        id: 'note-001',
        authorId: 'usr-002',
        authorName: 'Michael Torres',
        content: 'Initial review completed. Multiple shell company connections identified.',
        timestamp: new Date('2024-01-11T10:30:00'),
      },
    ],
    documents: [],
  },
  {
    id: 'CASE-2024-0090',
    linkedAlerts: ['ALT-2024-001201'],
    customerId: 'CUS-78901',
    customerName: 'James Mitchell',
    investigatorId: 'usr-002',
    investigatorName: 'Michael Torres',
    status: 'str_draft',
    strStatus: 'str_ready',
    createdAt: new Date('2024-01-12'),
    slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
    totalAmount: 890000,
    currency: 'USD',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0091',
    linkedAlerts: ['ALT-2024-001205', 'ALT-2024-001206', 'ALT-2024-001207'],
    customerId: 'CUS-45678',
    customerName: 'Sunrise Exports Ltd',
    investigatorId: 'usr-002',
    investigatorName: 'Michael Torres',
    status: 'pending_review',
    strStatus: 'str_ready',
    createdAt: new Date('2024-01-08'),
    slaDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000), // Overdue
    totalAmount: 5670000,
    currency: 'USD',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0092',
    linkedAlerts: ['ALT-2024-001210'],
    customerId: 'CUS-11234',
    customerName: 'Northern Finance LLC',
    investigatorId: 'usr-002',
    investigatorName: 'Michael Torres',
    status: 'closed',
    strStatus: 'discarded',
    createdAt: new Date('2024-01-05'),
    slaDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalAmount: 125000,
    currency: 'USD',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0093',
    linkedAlerts: ['ALT-2024-001215'],
    customerId: 'CUS-55678',
    customerName: 'Maritime Holdings Inc',
    investigatorId: 'usr-002',
    investigatorName: 'Michael Torres',
    status: 'submitted',
    strStatus: 'str_downloaded',
    createdAt: new Date('2024-01-03'),
    slaDeadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    totalAmount: 2340000,
    currency: 'USD',
    notes: [],
    documents: [],
  },
  {
    id: 'CASE-2024-0094',
    linkedAlerts: ['ALT-2024-001220'],
    customerId: 'CUS-99012',
    customerName: 'Central Trading Corp',
    investigatorId: 'usr-002',
    investigatorName: 'Michael Torres',
    status: 'open',
    strStatus: 'no_str',
    createdAt: new Date('2024-01-16'),
    slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    totalAmount: 560000,
    currency: 'USD',
    notes: [],
    documents: [],
  },
];

// Mock STR drafts
export const mockSTRDrafts: STRDraft[] = [
  {
    id: 'STR-2024-0045',
    caseId: 'CASE-2024-0091',
    status: 'pending_po_review',
    groundsOfSuspicion: 'Multiple high-value transactions with known shell companies in high-risk jurisdictions. Pattern consistent with trade-based money laundering through over/under invoicing of goods.',
    transactionNarrative: 'Between January 2024 and present, the subject conducted 47 wire transfers totaling USD 5,670,000 to entities in Panama, British Virgin Islands, and Cyprus. Transaction amounts consistently just below reporting thresholds.',
    customerProfile: 'Sunrise Exports Ltd is a registered trading company with declared annual turnover of USD 2M. Actual transaction volume exceeds declared business activity by 280%.',
    riskRationale: 'High-risk indicators: (1) Transactions with shell companies, (2) Use of high-risk jurisdictions, (3) Structuring patterns, (4) Business activity inconsistent with profile.',
    aiGenerated: {
      groundsOfSuspicion: true,
      transactionNarrative: true,
      customerProfile: true,
      riskRationale: true,
    },
    changes: [],
    investigatorComments: 'Recommend immediate filing. Clear TBML pattern established.',
  },
];

// Mock customer KYC
export const mockCustomerKYC: CustomerKYC = {
  id: 'CUS-45678',
  name: 'Sunrise Exports Ltd',
  type: 'corporate',
  riskRating: 'high',
  industry: 'Import/Export',
  declaredIncome: 2000000,
  actualTurnover: 5670000,
  accountAge: 18,
  nationality: 'Singapore',
  pep: false,
  sanctions: false,
};

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    date: new Date('2024-01-14'),
    type: 'debit',
    amount: 245000,
    currency: 'USD',
    counterparty: 'Global Trade BVI Ltd',
    channel: 'Wire',
    country: 'VG',
    description: 'Invoice payment - machinery parts',
  },
  {
    id: 'TXN-002',
    date: new Date('2024-01-13'),
    type: 'credit',
    amount: 180000,
    currency: 'USD',
    counterparty: 'Eastern Materials Co',
    channel: 'Wire',
    country: 'HK',
    description: 'Goods received',
  },
  {
    id: 'TXN-003',
    date: new Date('2024-01-12'),
    type: 'debit',
    amount: 320000,
    currency: 'USD',
    counterparty: 'Pacific Holdings Panama',
    channel: 'Wire',
    country: 'PA',
    description: 'Consulting services',
  },
];

// Mock audit entries
export const mockAuditEntries: AuditEntry[] = [
  {
    id: 'AUD-001',
    entityType: 'alert',
    entityId: 'ALT-2024-001238',
    action: 'Alert created from Core Banking feed',
    performedBy: 'System',
    performedAt: new Date('2024-01-15T16:00:00'),
    details: 'Auto-ingested from trade finance monitoring',
    modelVersion: 'FinCrisS-v2.3.1',
  },
  {
    id: 'AUD-002',
    entityType: 'alert',
    entityId: 'ALT-2024-001238',
    action: 'FinCrisS processing completed',
    performedBy: 'System',
    performedAt: new Date('2024-01-15T16:05:00'),
    details: 'Risk score: 92, Priority: High',
    modelVersion: 'FinCrisS-v2.3.1',
  },
  {
    id: 'AUD-003',
    entityType: 'case',
    entityId: 'CASE-2024-0089',
    action: 'Case created',
    performedBy: 'Michael Torres',
    performedAt: new Date('2024-01-10T09:00:00'),
    details: 'Created from alerts ALT-2024-001198, ALT-2024-001199',
  },
];
